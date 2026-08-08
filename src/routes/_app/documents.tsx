import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Card, PageHeader, Pill, Button } from "@/components/ui/primitives";
import { useDocuments, useFolders } from "@/hooks/use-modules";
import { useFolderAccess, allowedFolders, useToggleFolderAccess } from "@/hooks/use-folder-access";
import { useOrganisations } from "@/hooks/use-organisations";
import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "@/lib/audit";
import { useAuth } from "@/hooks/use-auth";
import { DocumentPreviewModal, type PreviewDoc } from "@/components/documents/DocumentPreviewModal";
import { FolderOpen, Upload, Search, Sparkles, File, Filter, Download, Trash2, Loader2, Eye, FolderPlus, Settings } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/_app/documents")({
  head: () => ({ meta: [{ title: "Data Room · Documents · Agrofeed Sukuk" }, { name: "description", content: "Secure document repository with AI analysis." }] }),
  component: Documents,
});

type UploadItem = {
  id: string;
  file: File;
  folder: string;
  status: "pending" | "uploading" | "success" | "error";
  progress: number; // 0-100
  error?: string;
  step?: "storage" | "db";
};

function Documents() {
  const [selected, setSelected] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<PreviewDoc | null>(null);
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const { data: FOLDERS = [] } = useFolders();
  const [uploadFolder, setUploadFolder] = useState<string>("");
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderAccess, setNewFolderAccess] = useState<string[]>([]);
  const [accessModalFolder, setAccessModalFolder] = useState<string | null>(null);

  const { data: DOCUMENTS = [] } = useDocuments();
  const { user, profile, isAdmin } = useAuth();
  const { data: access } = useFolderAccess();
  const { data: orgs = [] } = useOrganisations();
  const qc = useQueryClient();
  const canWrite = (profile?.org ?? "").toLowerCase() === "agrofeed global";
  const visibleFolders = allowedFolders(access, profile?.org, FOLDERS);
  const toggleAccess = useToggleFolderAccess();

  const createFolderMut = useMutation({
    mutationFn: async ({ folder, accessOrgs }: { folder: string, accessOrgs: string[] }) => {
      const allOrgs = new Set(["Agrofeed Global", ...accessOrgs]);
      if (profile?.org) allOrgs.add(profile.org);
      const inserts = Array.from(allOrgs).map(org => ({ org, folder }));
      const { error } = await supabase.from("folder_access").insert(inserts);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["folders"] });
      setNewFolderOpen(false);
      setNewFolderName("");
      setNewFolderAccess([]);
      setMsg("Folder created successfully");
    }
  });

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    createFolderMut.mutate({ folder: newFolderName.trim(), accessOrgs: newFolderAccess });
  };

  const filtered = DOCUMENTS.filter((d) => 
    (!selected || d.folder === selected) && 
    (!q || d.name.toLowerCase().includes(q.toLowerCase())) &&
    (statusFilter.length === 0 || statusFilter.includes(d.status))
  );


  const updateUpload = (id: string, patch: Partial<UploadItem>) =>
    setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));

  const runUpload = async (item: UploadItem) => {
    if (!user) {
      updateUpload(item.id, { status: "error", error: "[auth] Not signed in", progress: 0 });
      return;
    }
    updateUpload(item.id, { status: "uploading", progress: 10, step: "storage", error: undefined });
    const path = `${user.id}/${Date.now()}-${item.file.name}`;
    const { error: upErr } = await supabase.storage.from("documents").upload(path, item.file, {
      cacheControl: "3600",
      upsert: false,
      contentType: item.file.type || undefined,
    });
    if (upErr) {
      const status = (upErr as { statusCode?: string | number }).statusCode;
      updateUpload(item.id, {
        status: "error",
        step: "storage",
        error: `[storage.upload] ${upErr.message}${status ? ` (status ${status})` : ""} — bucket=documents path=${path}`,
        progress: 0,
      });
      return;
    }
    updateUpload(item.id, { progress: 70, step: "db" });
    const { error: insErr } = await supabase.from("documents").insert({
      name: item.file.name,
      folder: item.folder,
      size_bytes: item.file.size,
      mime_type: item.file.type || null,
      storage_path: path,
      confidentiality: "confidential",
      status: "draft",
      uploaded_by: user.id,
    });
    if (insErr) {
      // Cleanup orphan storage file
      await supabase.storage.from("documents").remove([path]).catch(() => {});
      updateUpload(item.id, {
        status: "error",
        step: "db",
        error:
          `[db.documents.insert] ${insErr.message}` +
          (insErr.code ? ` (code ${insErr.code})` : "") +
          (insErr.details ? ` — ${insErr.details}` : "") +
          (insErr.hint ? ` — hint: ${insErr.hint}` : ""),
        progress: 0,
      });
      return;
    }
    updateUpload(item.id, { status: "success", progress: 100, error: undefined });
    qc.invalidateQueries({ queryKey: ["documents"] });
  };

  const startFiles = (files: FileList) => {
    const folder = uploadFolder || selected || "/";
    const items: UploadItem[] = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${file.name}`,
      file,
      folder,
      status: "pending",
      progress: 0,
    }));
    setUploads((prev) => [...items, ...prev]);
    items.forEach((it) => void runUpload(it));
  };

  const retryUpload = (id: string) => {
    const item = uploads.find((u) => u.id === id);
    if (item) void runUpload(item);
  };

  const dismissUpload = (id: string) => setUploads((prev) => prev.filter((u) => u.id !== id));

  const clearFinished = () =>
    setUploads((prev) => prev.filter((u) => u.status !== "success" && u.status !== "error"));

  const uploadingCount = uploads.filter((u) => u.status === "uploading" || u.status === "pending").length;
  const errorCount = uploads.filter((u) => u.status === "error").length;

  const signedUrl = async (id: string): Promise<string | null> => {
    const { data: row } = await supabase.from("documents").select("storage_path").eq("id", id).maybeSingle();
    if (!row?.storage_path) {
      setMsg("File missing");
      return null;
    }
    const { data, error } = await supabase.storage.from("documents").createSignedUrl(row.storage_path, 300);
    if (error || !data) {
      setMsg(error?.message ?? "Cannot sign URL");
      return null;
    }
    return data.signedUrl;
  };

  const download = async (id: string, name: string) => {
    const url = await signedUrl(id);
    if (!url) return;
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objUrl;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(objUrl), 1000);
      void logAudit("Downloaded", { target: name, targetType: "documents", details: { document_id: id } });
    } catch (e) {
      setMsg(`Download failed: ${(e as Error).message}`);
    }
  };




  const remove = async (id: string) => {
    const { data: row } = await supabase.from("documents").select("storage_path").eq("id", id).maybeSingle();
    if (row?.storage_path) await supabase.storage.from("documents").remove([row.storage_path]);
    await supabase.from("documents").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["documents"] });
  };

  const onFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length) startFiles(e.target.files);
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
                {visibleFolders.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm">
                  <Filter className="h-3.5 w-3.5" />
                  Filter
                  {statusFilter.length > 0 && (
                    <span className="ml-1 rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                      {statusFilter.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {["draft", "in_review", "approved", "expired"].map((s) => (
                  <DropdownMenuCheckboxItem
                    key={s}
                    checked={statusFilter.includes(s)}
                    onCheckedChange={(checked) => {
                      setStatusFilter((prev) =>
                        checked ? [...prev, s] : prev.filter((v) => v !== s)
                      );
                    }}
                  >
                    {s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploadingCount > 0}>
              {uploadingCount > 0 ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              {uploadingCount > 0 ? `Uploading ${uploadingCount}…` : "Upload documents"}
            </Button>

          </>
        }

      />

      {msg && (
        <div
          className={`mb-3 text-xs rounded-md px-3 py-2 whitespace-pre-wrap break-words ${
            msg === "Upload complete"
              ? "bg-secondary"
              : "bg-destructive/10 text-destructive border border-destructive/30"
          }`}
        >
          {msg}
        </div>
      )}

      {uploads.length > 0 && (
        <Card className="mb-4 !p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold">
              Uploads
              {uploadingCount > 0 && <span className="ml-2 text-muted-foreground font-normal">{uploadingCount} in progress</span>}
              {errorCount > 0 && <span className="ml-2 text-destructive font-normal">{errorCount} failed</span>}
            </div>
            {uploads.some((u) => u.status === "success" || u.status === "error") && (
              <button onClick={clearFinished} className="text-[11px] text-muted-foreground hover:text-foreground">
                Clear finished
              </button>
            )}
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {uploads.map((u) => (
              <div key={u.id} className="rounded-md border bg-background px-3 py-2">
                <div className="flex items-center gap-2">
                  <File className="h-3.5 w-3.5 text-primary shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium truncate">{u.file.name}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {u.folder} · {(u.file.size / 1024).toFixed(0)} KB
                    </div>
                  </div>
                  <Pill
                    tone={
                      u.status === "success" ? "success" : u.status === "error" ? "danger" : u.status === "uploading" ? "info" : "warning"
                    }
                  >
                    {u.status === "uploading" ? (u.step === "db" ? "saving…" : "uploading…") : u.status}
                  </Pill>
                  {u.status === "error" && (
                    <button
                      onClick={() => retryUpload(u.id)}
                      className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] hover:bg-secondary"
                      title="Retry"
                    >
                      <Loader2 className="h-3 w-3" /> Retry
                    </button>
                  )}
                  {(u.status === "success" || u.status === "error") && (
                    <button
                      onClick={() => dismissUpload(u.id)}
                      className="inline-flex items-center rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:bg-secondary"
                      title="Dismiss"
                    >
                      ✕
                    </button>
                  )}
                </div>
                {(u.status === "uploading" || u.status === "pending") && (
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${u.progress}%` }}
                    />
                  </div>
                )}
                {u.status === "error" && u.error && (
                  <div className="mt-2 text-[11px] text-destructive whitespace-pre-wrap break-words">
                    {u.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}


      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
        <Card className="max-h-[70vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Folders</h3>
            <button
              onClick={() => setNewFolderOpen(true)}
              className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1"
            >
              <FolderPlus className="h-3.5 w-3.5" />
              New
            </button>
          </div>
          <button onClick={() => setSelected(null)} className={`w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-secondary ${!selected ? "bg-secondary font-medium" : ""}`}>
            <FolderOpen className="h-4 w-4 text-gold" />
            All documents
            <span className="ml-auto text-[10px] text-muted-foreground">{DOCUMENTS.length}</span>
          </button>
          <div className="mt-1 space-y-0.5">
            {visibleFolders.map((f) => {
              const count = DOCUMENTS.filter((d) => d.folder === f).length;
              return (
                <button key={f} onClick={() => { setSelected(f); setUploadFolder(f); }}
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
          <Card className="!p-3 flex flex-col gap-3">
            {selected && (
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-gold" />
                  {selected}
                </h2>
                {canWrite && (
                  <Button variant="secondary" size="sm" className="h-7 text-[11px] px-2 gap-1.5" onClick={() => setAccessModalFolder(selected)}>
                    <Settings className="h-3.5 w-3.5" /> Manage Access
                  </Button>
                )}
              </div>
            )}
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
                  <tr
                    key={d.id}
                    onClick={() => setPreviewDoc(d as PreviewDoc)}
                    className="hover:bg-secondary/40 transition-colors cursor-pointer"
                  >
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
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setPreviewDoc(d as PreviewDoc)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs hover:bg-secondary" title="Preview">
                          <Eye className="h-3.5 w-3.5" />
                        </button>

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

      {previewDoc && <DocumentPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />}

      {/* New Folder Modal */}
      <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateFolder} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="folderName" className="text-sm font-medium">Folder Name</label>
              <Input
                id="folderName"
                placeholder="e.g. Q4 Financials"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                autoFocus
              />
            </div>
            
            {isAdmin && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Initial Access (Optional)</label>
                <p className="text-xs text-muted-foreground">Select organizations that should have immediate access to this folder.</p>
                <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-2 mt-2">
                  {orgs.filter(o => o.name !== "Agrofeed Global").map(o => {
                    const hasAccess = newFolderAccess.includes(o.name);
                    return (
                      <div key={o.id} className="flex items-center justify-between p-2 rounded-lg border bg-secondary/30">
                        <div>
                          <div className="text-sm font-medium">{o.name}</div>
                        </div>
                        <Switch
                          checked={hasAccess}
                          onCheckedChange={(checked) => {
                            if (checked) setNewFolderAccess(prev => [...prev, o.name]);
                            else setNewFolderAccess(prev => prev.filter(name => name !== o.name));
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setNewFolderOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!newFolderName.trim() || createFolderMut.isPending}>
                {createFolderMut.isPending ? "Creating..." : "Create Folder"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Manage Access Modal */}
      <Dialog open={!!accessModalFolder} onOpenChange={(v) => !v && setAccessModalFolder(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Access: {accessModalFolder}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-xs text-muted-foreground">
              By default, folders are visible to everyone. If you explicitly grant access to an organization, only organizations with explicit access can see it.
            </p>
            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
              {orgs.filter(o => o.name !== "Agrofeed Global").map(o => {
                const hasAccess = (access ?? []).some(a => a.folder === accessModalFolder && a.org === o.name);
                return (
                  <div key={o.id} className="flex items-center justify-between p-2 rounded-lg border bg-secondary/30">
                    <div>
                      <div className="text-sm font-medium">{o.name}</div>
                      <div className="text-xs text-muted-foreground">{hasAccess ? "Can view" : "No access"}</div>
                    </div>
                    <Switch
                      checked={hasAccess}
                      onCheckedChange={() => toggleAccess.mutate({ org: o.name, folder: accessModalFolder!, granted: hasAccess })}
                      disabled={toggleAccess.isPending}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
