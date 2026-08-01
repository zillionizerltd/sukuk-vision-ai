import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

/** Renders a .docx file as styled HTML using mammoth (client-only). */
export function DocxViewer({
  src,
  className,
  onError,
}: {
  src: string;
  className?: string;
  onError?: (message: string) => void;
}) {
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const mammoth = await import("mammoth");
        const buffer = await (await fetch(src)).arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
        if (cancelled) return;
        setHtml(result.value || "<p>This document appears to be empty.</p>");
      } catch (e) {
        if (!cancelled) onError?.((e as Error).message || "Failed to render document");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [src, onError]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Rendering document…
      </div>
    );
  }
  if (!html) return null;

  return (
    <div className={className}>
      <div className="mx-auto max-w-3xl bg-background p-8 text-sm leading-relaxed shadow-sm [&_a]:text-primary [&_a]:underline [&_h1]:mb-3 [&_h1]:mt-5 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:font-semibold [&_img]:my-3 [&_img]:max-w-full [&_li]:my-1 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2 [&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-border [&_td]:p-2 [&_th]:border [&_th]:border-border [&_th]:bg-secondary/60 [&_th]:p-2 [&_th]:text-left [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6">
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}
