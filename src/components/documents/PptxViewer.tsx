import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

/** Renders a .pptx deck using pptx-preview (client-only). */
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
    let previewer: { destroy?: () => void } | null = null;
    (async () => {
      setLoading(true);
      setEmpty(false);
      try {
        const { init } = await import("@/vendor/pptx-patched.js");
        const buffer = await (await fetch(src)).arrayBuffer();
        const container = containerRef.current;
        if (cancelled || !container) return;
        container.innerHTML = "";
        const width = Math.max(640, container.clientWidth - 32);
        const instance = init(container, {
          width,
          height: Math.round((width * 9) / 16),
          mode: "list",
        }) as unknown as {
          destroy?: () => void;
          preview: (b: ArrayBuffer) => Promise<unknown>;
          slideCount: number;
          htmlRender: { renderSlide: (index: number) => void };
        };
        previewer = instance;
        await instance.preview(buffer);
        if (cancelled) return;
        // In list mode the library only parses the deck — slides must be rendered explicitly.
        const count = instance.slideCount ?? 0;console.warn("PPTX count", count, typeof (instance as any).pptx.slides, Array.isArray((instance as any).pptx.slides), Object.keys((instance as any).pptx.slides ?? {}).length, JSON.stringify((instance as any).pptx._zipContents ? Object.keys((instance as any).pptx._zipContents).slice(0,40) : null));
        for (let i = 0; i < count; i += 1) {
          try {
            instance.htmlRender.renderSlide(i);
          } catch (e) {
            console.warn("PPTX slide render failed", i, e);
          }
        }
        const wrapper = container.querySelector<HTMLElement>(".pptx-preview-wrapper");
        if (wrapper) {
          // The library hardcodes a fixed-height black wrapper; make it a light, scrolling deck.
          wrapper.style.background = "transparent";
          wrapper.style.height = "auto";
          wrapper.style.overflowY = "visible";
          wrapper.querySelectorAll<HTMLElement>(":scope > div").forEach((slide) => {
            if (!slide.style.background) slide.style.background = "#ffffff";
            slide.style.position = "relative";
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
          This deck couldn’t be rendered in the browser. Use Download or Open in new tab to view it.
        </div>
      )}
      <div ref={containerRef} className="p-4" />
    </div>
  );
}
