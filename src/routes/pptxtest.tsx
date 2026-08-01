import { createFileRoute } from "@tanstack/react-router";
import { PptxViewer } from "@/components/documents/PptxViewer";
export const Route = createFileRoute("/pptxtest")({ component: () => <PptxViewer src="/_test.pptx" onError={(m) => console.warn("ERR", m)} /> });
