import { useEffect, useRef, useState } from "react";

/**
 * Renders a PDF to canvases with pdf.js so it works inside sandboxed
 * preview frames where the browser blocks the native inline PDF viewer.
 */
export function PdfCanvasViewer({ src, className }: { src: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let doc: Awaited<ReturnType<typeof import("pdfjs-dist").getDocument>["promise"]> | null = null;

    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
        pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

        const loaded = await pdfjs.getDocument({ url: src }).promise;
        if (cancelled) {
          void loaded.cleanup();
          return;
        }
        doc = loaded;
        setPages(loaded.numPages);
        const container = containerRef.current;
        if (!container) return;
        container.innerHTML = "";

        const width = container.clientWidth || 800;
        for (let i = 1; i <= loaded.numPages; i++) {
          if (cancelled) return;
          const page = await loaded.getPage(i);
          const base = page.getViewport({ scale: 1 });
          const scale = Math.min(2, Math.max(0.5, (width - 32) / base.width));
          const viewport = page.getViewport({ scale: scale * (window.devicePixelRatio || 1) });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = `${viewport.width / (window.devicePixelRatio || 1)}px`;
          canvas.style.height = "auto";
          canvas.className = "mx-auto mb-3 rounded shadow-sm";
          container.appendChild(canvas);
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          await page.render({ canvas, canvasContext: ctx, viewport }).promise;
        }
      } catch (e) {
        if (!cancelled) setError((e as Error).message || "Failed to render PDF");
      }
    })();

    return () => {
      cancelled = true;
      void doc?.cleanup();
    };
  }, [src]);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-xs text-destructive">
        PDF render failed: {error}
      </div>
    );
  }

  return (
    <div className={className}>
      <div ref={containerRef} className="p-4" />
      {pages === 0 && (
        <div className="p-4 text-center text-xs text-muted-foreground">Rendering PDF…</div>
      )}
    </div>
  );
}
