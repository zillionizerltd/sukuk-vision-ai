import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader, Button, Pill } from "@/components/ui/primitives";
import { FileText, Download } from "lucide-react";
import { useReports } from "@/hooks/use-modules";

export const Route = createFileRoute("/_app/reports")({
  head: () => ({ meta: [{ title: "Reports · Agrofeed Sukuk" }, { name: "description", content: "Board and stakeholder reports." }] }),
  component: Reports,
});

function Reports() {
  const { data: REPORTS = [] } = useReports();
  return (
    <>
      <PageHeader title="Reports" subtitle="Branded, board-ready reports · PDF · Word · Excel" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {REPORTS.map((r) => (
          <Card key={r} className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg gradient-emerald flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium">{r}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Auto-generated · Agrofeed branded · Confidentiality watermark</div>
              <div className="flex items-center gap-2 mt-3">
                <Button size="sm"><Download className="h-3.5 w-3.5" />PDF</Button>
                <Button variant="secondary" size="sm">Word</Button>
                <Button variant="secondary" size="sm">Excel</Button>
                <Pill tone="neutral">Latest</Pill>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
