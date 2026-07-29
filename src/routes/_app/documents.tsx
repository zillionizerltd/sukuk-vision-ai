import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, PageHeader, Pill, Button } from "@/components/ui/primitives";
import { FOLDERS } from "@/lib/demo-data";
import { useDocuments } from "@/hooks/use-modules";
import { FolderOpen, Upload, Search, Sparkles, File, Filter } from "lucide-react";

export const Route = createFileRoute("/_app/documents")({
  head: () => ({ meta: [{ title: "Data Room · Documents · Agrofeed Sukuk" }, { name: "description", content: "Secure document repository with AI analysis." }] }),
  component: Documents,
});

function Documents() {
  const [selected, setSelected] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const { data: DOCUMENTS = [] } = useDocuments();
  const filtered = DOCUMENTS.filter((d) => (!selected || d.folder === selected) && (!q || d.name.toLowerCase().includes(q.toLowerCase())));

  return (
    <>
      <PageHeader
        title="Intelligent Data Room"
        subtitle="342 documents · AI-analysed on upload · Version-controlled · Watermarked downloads"
        actions={<><Button variant="secondary" size="sm"><Filter className="h-3.5 w-3.5" />Filter</Button><Button size="sm"><Upload className="h-3.5 w-3.5" />Upload documents</Button></>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
        <Card className="max-h-[70vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Folders</h3>
            <button className="text-[11px] text-primary hover:underline">+ New</button>
          </div>
          <button onClick={() => setSelected(null)} className={`w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-secondary ${!selected ? "bg-secondary font-medium" : ""}`}>
            <FolderOpen className="h-4 w-4 text-gold" />
            All documents
            <span className="ml-auto text-[10px] text-muted-foreground">{DOCUMENTS.length}</span>
          </button>
          <div className="mt-1 space-y-0.5">
            {FOLDERS.map((f) => {
              const count = DOCUMENTS.filter((d) => d.folder === f).length;
              return (
                <button key={f} onClick={() => setSelected(f)}
                        className={`w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-secondary ${selected === f ? "bg-secondary font-medium" : ""}`}>
                  <FolderOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate flex-1">{f}</span>
                  {count > 0 && <span className="text-[10px] text-muted-foreground">{count}</span>}
                </button>
              );
            })}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="!p-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input value={q} onChange={(e) => setQ(e.target.value)}
                       placeholder="Semantic search: 'land ownership', 'DSCR assumptions', 'Sharia opinion'…"
                       className="w-full h-10 rounded-lg border border-input bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <Button variant="gold" size="sm"><Sparkles className="h-3.5 w-3.5" />Ask AI</Button>
            </div>
          </Card>

          <Card className="!p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-[11px] uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Document</th>
                  <th className="text-left font-medium px-4 py-3">Folder</th>
                  <th className="text-left font-medium px-4 py-3">Owner</th>
                  <th className="text-left font-medium px-4 py-3">Version</th>
                  <th className="text-left font-medium px-4 py-3">Status</th>
                  <th className="text-left font-medium px-4 py-3">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <File className="h-4 w-4 text-primary" />
                        <div>
                          <div className="font-medium">{d.name}</div>
                          <div className="text-[10px] text-muted-foreground">{d.confidentiality} confidentiality</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{d.folder}</td>
                    <td className="px-4 py-3">{d.owner}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.version}</td>
                    <td className="px-4 py-3">
                      <Pill tone={d.status === "approved" ? "success" : d.status === "in_review" ? "warning" : d.status === "expired" ? "danger" : "info"}>
                        {d.status.replace("_", " ")}
                      </Pill>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs tabular-nums">{d.updated}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-10 text-muted-foreground text-sm">No documents match.</td></tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </>
  );
}
