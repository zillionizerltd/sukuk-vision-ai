import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PptxViewer } from "@/components/documents/PptxViewer";

export const Route = createFileRoute("/pptxtest")({
  head: () => ({ meta: [{ title: "PPTX viewer test" }] }),
  component: () => {
    const [err, setErr] = useState<string | null>(null);
    return (
      <div className="h-screen w-screen bg-secondary/40">
        {err && <div className="p-2 text-xs text-destructive">ERR: {err}</div>}
        <PptxViewer src="/_test2.pptx" onError={setErr} className="h-full w-full overflow-auto bg-secondary/40" />
      </div>
    );
  },
});
