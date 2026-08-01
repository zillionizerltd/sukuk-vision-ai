import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { init } = await import("pptx-preview");
        const buffer = await (await fetch(src)).arrayBuffer();
        const container = containerRef.current;
        if (cancelled || !container) return;
        container.innerHTML = "";
        const width = Math.max(480, container.clientWidth - 32);
        const previewer = init(container, { width, height: Math.round((width * 9) / 16) });
        await previewer.preview(buffer);
        if (cancelled) return;
      } catch (e) {
        if (!cancelled) onError?.((e as Error).message || "Failed to render presentation");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [src, onError]);

  return (
    <div className={className}>
      {loading && (
        <div className="flex items-center justify-center gap-2 p-6 text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Rendering presentation…
        </div>
      )}
      <div ref={containerRef} className="p-4" />
    </div>
  );
}
