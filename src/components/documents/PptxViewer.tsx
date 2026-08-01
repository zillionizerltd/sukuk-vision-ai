import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

const EMU_PER_PX = 9525;

type TextRun = { text: string; bold: boolean; italic: boolean; sizePt: number | null; color: string | null };
type Paragraph = { runs: TextRun[]; align: string | null; bullet: boolean };
type Shape =
  | { kind: "text"; x: number; y: number; w: number; h: number; paragraphs: Paragraph[] }
  | { kind: "image"; x: number; y: number; w: number; h: number; url: string };
type Slide = { shapes: Shape[] };

const attr = (el: Element | null, name: string) => (el ? el.getAttribute(name) : null);
const num = (v: string | null, fallback = 0) => (v == null ? fallback : Number(v) || 0);

function localTag(el: Element) {
  return el.tagName.includes(":") ? el.tagName.split(":")[1] : el.tagName;
}
function children(el: Element, tag: string) {
  return Array.from(el.children).filter((c) => localTag(c) === tag);
}
function firstDesc(el: Element, tag: string): Element | null {
  for (const child of Array.from(el.children)) {
    if (localTag(child) === tag) return child;
    const deep = firstDesc(child, tag);
    if (deep) return deep;
  }
  return null;
}

function parseParagraphs(txBody: Element): Paragraph[] {
  return children(txBody, "p").map((p) => {
    const pPr = children(p, "pPr")[0] ?? null;
    const runs: TextRun[] = [];
    for (const node of Array.from(p.children)) {
      const tag = localTag(node);
      if (tag === "br") {
        runs.push({ text: "\n", bold: false, italic: false, sizePt: null, color: null });
        continue;
      }
      if (tag !== "r") continue;
      const rPr = children(node, "rPr")[0] ?? null;
      const tEl = children(node, "t")[0];
      const clr = rPr ? firstDesc(rPr, "srgbClr") : null;
      const sz = attr(rPr, "sz");
      runs.push({
        text: tEl?.textContent ?? "",
        bold: attr(rPr, "b") === "1",
        italic: attr(rPr, "i") === "1",
        sizePt: sz ? num(sz) / 100 : null,
        color: clr ? `#${attr(clr, "val")}` : null,
      });
    }
    return {
      runs,
      align: attr(pPr, "algn"),
      bullet: !!pPr && children(pPr, "buChar").length + children(pPr, "buAutoNum").length > 0,
    };
  });
}

async function parseDeck(buffer: ArrayBuffer) {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(buffer);

  const presXml = await zip.file("ppt/presentation.xml")?.async("string");
  const parser = new DOMParser();
  let slideW = 9144000;
  let slideH = 6858000;
  if (presXml) {
    const sldSz = parser.parseFromString(presXml, "application/xml").getElementsByTagName("*");
    for (const el of Array.from(sldSz)) {
      if (localTag(el) === "sldSz") {
        slideW = num(el.getAttribute("cx"), slideW);
        slideH = num(el.getAttribute("cy"), slideH);
        break;
      }
    }
  }

  const slidePaths = Object.keys(zip.files)
    .filter((p) => /^ppt\/slides\/slide\d+\.xml$/.test(p))
    .sort((a, b) => Number(a.match(/\d+/)![0]) - Number(b.match(/\d+/)![0]));

  const objectUrls: string[] = [];
  const slides: Slide[] = [];

  for (const path of slidePaths) {
    const xml = await zip.file(path)!.async("string");
    const doc = parser.parseFromString(xml, "application/xml");

    // rels: rId -> media path
    const relsPath = path.replace(/slides\/(slide\d+)\.xml/, "slides/_rels/$1.xml.rels");
    const relMap = new Map<string, string>();
    const relsXml = await zip.file(relsPath)?.async("string");
    if (relsXml) {
      const relDoc = parser.parseFromString(relsXml, "application/xml");
      for (const rel of Array.from(relDoc.getElementsByTagName("*"))) {
        if (localTag(rel) !== "Relationship") continue;
        const id = rel.getAttribute("Id");
        const target = rel.getAttribute("Target");
        if (id && target) relMap.set(id, target.replace(/^\.\.\//, "ppt/").replace(/^\//, ""));
      }
    }

    const spTree = Array.from(doc.getElementsByTagName("*")).find((el) => localTag(el) === "spTree");
    const shapes: Shape[] = [];
    if (spTree) {
      for (const node of Array.from(spTree.children)) {
        const tag = localTag(node);
        if (tag !== "sp" && tag !== "pic") continue;
        const xfrm = firstDesc(node, "xfrm");
        const off = xfrm ? children(xfrm, "off")[0] : null;
        const ext = xfrm ? children(xfrm, "ext")[0] : null;
        const box = {
          x: num(attr(off, "x")) / EMU_PER_PX,
          y: num(attr(off, "y")) / EMU_PER_PX,
          w: num(attr(ext, "cx")) / EMU_PER_PX,
          h: num(attr(ext, "cy")) / EMU_PER_PX,
        };
        if (tag === "pic") {
          const blip = firstDesc(node, "blip");
          const embed =
            blip?.getAttribute("r:embed") ??
            blip?.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "embed");
          const mediaPath = embed ? relMap.get(embed) : undefined;
          const file = mediaPath ? zip.file(mediaPath) : null;
          if (file) {
            const blob = await file.async("blob");
            const url = URL.createObjectURL(blob);
            objectUrls.push(url);
            shapes.push({ kind: "image", ...box, url });
          }
          continue;
        }
        const txBody = firstDesc(node, "txBody");
        if (!txBody) continue;
        const paragraphs = parseParagraphs(txBody);
        if (paragraphs.some((p) => p.runs.some((r) => r.text.trim()))) {
          shapes.push({ kind: "text", ...box, paragraphs });
        }
      }
    }
    slides.push({ shapes });
  }

  return { slides, width: slideW / EMU_PER_PX, height: slideH / EMU_PER_PX, objectUrls };
}

/** Renders a .pptx deck slide-by-slide from its OOXML content (client-only). */
export function PptxViewer({
  src,
  className,
  onError,
}: {
  src: string;
  className?: string;
  onError?: (message: string) => void;
}) {
  const [state, setState] = useState<{
    slides: Slide[];
    width: number;
    height: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [empty, setEmpty] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);
  const [hostWidth, setHostWidth] = useState(900);

  useEffect(() => {
    let cancelled = false;
    let urls: string[] = [];
    (async () => {
      setLoading(true);
      setEmpty(false);
      try {
        const buffer = await (await fetch(src)).arrayBuffer();
        const deck = await parseDeck(buffer);
        urls = deck.objectUrls;
        if (cancelled) {
          urls.forEach((u) => URL.revokeObjectURL(u));
          return;
        }
        if (deck.slides.length === 0) setEmpty(true);
        setState({ slides: deck.slides, width: deck.width, height: deck.height });
      } catch (e) {
        if (!cancelled) onError?.((e as Error).message || "Failed to render presentation");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [src, onError]);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const measure = () => setHostWidth(Math.max(320, el.clientWidth - 32));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = useMemo(() => (state ? hostWidth / state.width : 1), [state, hostWidth]);

  return (
    <div className={className} ref={hostRef}>
      {loading && (
        <div className="flex items-center justify-center gap-2 p-6 text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Rendering presentation…
        </div>
      )}
      {!loading && empty && (
        <div className="p-6 text-center text-xs text-muted-foreground">
          This deck couldn’t be rendered in the browser. Use Download or Open in new tab to view the original file.
        </div>
      )}
      {!loading && state && state.slides.length > 0 && (
        <div className="p-4 space-y-4">
          {state.slides.map((slide, i) => (
            <div key={i} className="mx-auto">
              <div
                className="relative overflow-hidden rounded-md border bg-white shadow-sm"
                style={{ width: state.width * scale, height: state.height * scale }}
              >
                {slide.shapes.map((shape, j) =>
                  shape.kind === "image" ? (
                    <img
                      key={j}
                      src={shape.url}
                      alt=""
                      className="absolute object-contain"
                      style={{
                        left: shape.x * scale,
                        top: shape.y * scale,
                        width: shape.w * scale,
                        height: shape.h * scale,
                      }}
                    />
                  ) : (
                    <div
                      key={j}
                      className="absolute"
                      style={{
                        left: shape.x * scale,
                        top: shape.y * scale,
                        width: shape.w * scale,
                        minHeight: shape.h * scale,
                      }}
                    >
                      {shape.paragraphs.map((p, k) => (
                        <p
                          key={k}
                          style={{
                            textAlign: (p.align === "ctr"
                              ? "center"
                              : p.align === "r"
                                ? "right"
                                : p.align === "just"
                                  ? "justify"
                                  : "left") as React.CSSProperties["textAlign"],
                            margin: 0,
                            paddingLeft: p.bullet ? 14 * scale : 0,
                            lineHeight: 1.25,
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {p.bullet && <span style={{ marginRight: 6 * scale }}>•</span>}
                          {p.runs.map((r, m) => (
                            <span
                              key={m}
                              style={{
                                fontWeight: r.bold ? 700 : 400,
                                fontStyle: r.italic ? "italic" : "normal",
                                fontSize: (r.sizePt ?? 18) * 1.333 * scale,
                                color: r.color ?? "#0F172A",
                              }}
                            >
                              {r.text}
                            </span>
                          ))}
                        </p>
                      ))}
                    </div>
                  ),
                )}
              </div>
              <div className="mt-1 text-center text-[10px] text-muted-foreground">
                Slide {i + 1} of {state.slides.length}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
