import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, PageHeader, Pill, Button } from "@/components/ui/primitives";
import { FOLDERS } from "@/lib/demo-data";
import { useDocuments } from "@/hooks/use-modules";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { FolderOpen, Upload, Search, Sparkles, File, Filter, Download, Trash2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_app/documents")({
  head: () => ({ meta: [{ title: "Data Room · Documents · Agrofeed Sukuk" }, { name: "description", content: "Secure document repository with AI analysis." }] }),
  component: Documents,
});

function Documents() {
  const [selected, setSelected] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [uploadFolder, setUploadFolder] = useState<string>(FOLDERS[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: DOCUMENTS = [] } = useDocuments();
  const { user, profile } = useAuth();
  const qc = useQueryClient();
  const canWrite = (profile?.org ?? "").toLowerCase() === "agrofeed global";

  const filtered = DOCUMENTS.filter((d) => (!selected || d.folder === selected) && (!q || d.name.toLowerCase().includes(q.toLowerCase())));

  const uploadMut = useMutation({
    mutationFn: async (files: FileList) => {
      if (!user) throw new Error("Not signed in");
      const folder = uploadFolder || selected || "/";

      for (const file of Array.from(files)) {
        const path = `${user.id}/${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage.from("documents").upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || undefined,
        });
        if (upErr) throw upErr;
        const { error: insErr } = await supabase.from("documents").insert({
          name: file.name,
          folder,
          size_bytes: file.size,
          mime_type: file.type || null,
          storage_path: path,
          confidentiality: "confidential",
          status: "draft",
          uploaded_by: user.id,
        });
        if (insErr) throw insErr;
      }
    },
    onSuccess: () => {
      setMsg("Upload complete");
      qc.invalidateQueries({ queryKey: ["documents"] });
      setTimeout(() => setMsg(null), 2500);
    },
    onError: (e: Error) => setMsg(e.message),
  });

  const download = async (id: string, name: string) => {
    const { data: row } = await supabase.from("documents").select("storage_path").eq("id", id).maybeSingle();
    if (!row?.storage_path) return setMsg("File missing");
    const { data, error } = await supabase.storage.from("documents").createSignedUrl(row.storage_path, 60);
    if (error || !data) return setMsg(error?.message ?? "Cannot sign URL");
    const a = document.createElement("a");
    a.href = data.signedUrl;
    a.download = name;
    a.click();
  };

  const remove = async (id: string) => {
    const { data: row } = await supabase.from("documents").select("storage_path").eq("id", id).maybeSingle();
    if (row?.storage_path) await supabase.storage.from("documents").remove([row.storage_path]);
    await supabase.from("documents").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["documents"] });
  };

  const onFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length) uploadMut.mutate(e.target.files);
    e.target.value = "";
  };

  return (
    <>
      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={onFilePicked} />
      <PageHeader
        title="Intelligent Data Room"
        subtitle={`${DOCUMENTS.length} documents · AI-analysed on upload · Version-controlled · Watermarked downloads`}
        actions={
          <>
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="hidden sm:inline">Upload to</span>
              <select
                value={uploadFolder}
                onChange={(e) => setUploadFolder(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {FOLDERS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </label>
            <Button variant="secondary" size="sm"><Filter className="h-3.5 w-3.5" />Filter</Button>
            <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploadMut.isPending}>
              {uploadMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              Upload documents
            </Button>
          </>
        }

      />

      {msg && <div className="mb-3 text-xs rounded-md bg-secondary px-3 py-2">{msg}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
        <Card className="max-h-[70vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Folders</h3>
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
                       placeholder="Search documents by name…"
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
                  <th className="text-left font-medium px-4 py-3">Status</th>
                  <th className="text-left font-medium px-4 py-3">Updated</th>
                  <th className="text-right font-medium px-4 py-3">Actions</th>
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
                    <td className="px-4 py-3">
                      <Pill tone={d.status === "approved" ? "success" : d.status === "in_review" ? "warning" : d.status === "expired" ? "danger" : "info"}>
                        {d.status.replace("_", " ")}
                      </Pill>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs tabular-nums">{d.updated}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => download(d.id, d.name)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs hover:bg-secondary" title="Download">
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        {canWrite && (
                          <button onClick={() => remove(d.id)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-destructive hover:bg-destructive/10" title="Delete">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-10 text-muted-foreground text-sm">No documents match. Click "Upload documents" to add files.</td></tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </>
  );
}
