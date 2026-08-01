import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

type Previewer = {
  destroy?: () => void;
  preview: (buffer: ArrayBuffer) => Promise<unknown>;
  slideCount?: number;
  wrapper?: HTMLElement;
  htmlRender: { renderSlide: (index: number) => void };
};

/** Renders a .pptx deck slide-by-slide using pptx-preview (client-only). */
export function PptxViewer({
  src,
  className,
  onError,
}: {
  src: string;
  className?: string;
  onError?: (message: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let previewer: Previewer | null = null;
    (async () => {
      setLoading(true);
      setEmpty(false);
      try {
        const { init } = await import("pptx-preview");
        const buffer = await (await fetch(src)).arrayBuffer();
        const container = containerRef.current;
        if (cancelled || !container) return;
        container.innerHTML = "";
        const width = Math.max(640, container.clientWidth - 32);
        previewer = init(container, {
          width,
          height: Math.round((width * 9) / 16),
          mode: "list",
        }) as unknown as Previewer;
        await previewer.preview(buffer);
        if (cancelled) return;

        // In "list" mode the library only parses the deck — each slide has to be
        // rendered explicitly, otherwise the wrapper stays empty (and black).
        const count = previewer.slideCount ?? 0;
        for (let i = 0; i < count; i += 1) {
          try {
            previewer.htmlRender.renderSlide(i);
          } catch {
            /* skip slides this renderer can't handle */
          }
        }

        const wrapper = previewer.wrapper ?? container.querySelector<HTMLElement>(".pptx-preview-wrapper");
        // Drop any wrapper left behind by a previous (double-invoked) render pass.
        container.querySelectorAll(".pptx-preview-wrapper").forEach((el) => {
          if (el !== wrapper) el.remove();
        });
        if (wrapper) {
          // The library hardcodes a fixed-height black wrapper; turn it into a
          // light, vertically scrolling deck that matches the app surface.
          wrapper.style.background = "transparent";
          wrapper.style.height = "auto";
          wrapper.style.overflowY = "visible";
          wrapper.querySelectorAll<HTMLElement>(":scope > div").forEach((slide) => {
            if (!slide.style.background) slide.style.background = "#ffffff";
            slide.style.margin = "0 auto 16px";
            slide.style.boxShadow = "0 1px 6px rgba(0,0,0,0.15)";
          });
        }
        if (!wrapper || wrapper.children.length === 0) setEmpty(true);
      } catch (e) {
        if (!cancelled) onError?.((e as Error).message || "Failed to render presentation");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      try {
        previewer?.destroy?.();
      } catch {
        /* ignore */
      }
    };
  }, [src, onError]);

  return (
    <div className={className}>
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
      <div ref={containerRef} className="p-4" />
    </div>
  );
}
