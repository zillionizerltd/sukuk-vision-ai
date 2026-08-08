import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader, Button, Pill } from "@/components/ui/primitives";
import { FileText, Download } from "lucide-react";
import { useReports } from "@/hooks/use-modules";

export const Route = createFileRoute("/_app/reports")({
  head: () => ({ meta: [{ title: "Reports · Agrofeed Sukuk" }, { name: "description", content: "Board and stakeholder reports." }] }),
  component: Reports,
});

function Reports() {
  const { data: REPORTS = [], isLoading } = useReports();
  return (
    <>
      <PageHeader title="Reports" subtitle="Branded, board-ready reports · PDF · Word · Excel" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-1 md:col-span-2 xl:col-span-3 py-10 flex items-center justify-center gap-2 text-muted-foreground text-sm">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Loading reports...
          </div>
        ) : REPORTS.length === 0 ? (
          <div className="col-span-1 md:col-span-2 xl:col-span-3 text-center py-10 text-muted-foreground text-sm">
            No reports found.
          </div>
        ) : (
          REPORTS.map((r) => (
            <Card key={r.id} className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg gradient-emerald flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium">{r.name}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Auto-generated · Agrofeed branded · Confidentiality watermark</div>
                <div className="flex items-center gap-2 mt-3">
                  <Button 
                    size="sm" 
                    disabled={!r.file_url}
                    onClick={() => r.file_url && window.open(r.file_url, "_blank")}
                  >
                    <Download className="h-3.5 w-3.5" />
                    {r.file_url ? "PDF" : "Pending"}
                  </Button>
                  <Button variant="secondary" size="sm" disabled>Word</Button>
                  <Button variant="secondary" size="sm" disabled>Excel</Button>
                  {r.status === "latest" && <Pill tone="neutral">Latest</Pill>}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
