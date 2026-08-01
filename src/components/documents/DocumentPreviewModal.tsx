import { useEffect, useState } from "react";
import { Button, Pill } from "@/components/ui/primitives";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useAddComment, useComments, useDeleteComment, type CommentRow } from "@/hooks/use-comments";
import { Download, Loader2, MessageSquare, Reply, Trash2, X, ExternalLink } from "lucide-react";
import { PdfCanvasViewer } from "./PdfCanvasViewer";
import { DocxViewer } from "./DocxViewer";
import { SheetViewer } from "./SheetViewer";
import { PptxViewer } from "./PptxViewer";


export type PreviewDoc = {
  id: string;
  name: string;
  folder: string;
  status: string;
  confidentiality: string;
  updated: string;
};

export function DocumentPreviewModal({ doc, onClose }: { doc: PreviewDoc; onClose: () => void }) {
  const { user, profile } = useAuth();
  const [url, setUrl] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [mime, setMime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");


  const { data: comments = [], isLoading: loadingComments } = useComments("document", doc.id);
  const add = useAddComment("document", doc.id);
  const del = useDeleteComment("document", doc.id);

  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;
    (async () => {
      setLoading(true);
      setError(null);
      setUrl(null);
      setBlobUrl(null);
      const { data: row, error: rowErr } = await supabase
        .from("documents")
        .select("storage_path, mime_type")
        .eq("id", doc.id)
        .maybeSingle();
      if (!active) return;
      if (rowErr || !row?.storage_path) {
        setError(rowErr?.message ?? "No file attached to this document record.");
        setLoading(false);
        return;
      }
      const { data, error: signErr } = await supabase.storage
        .from("documents")
        .createSignedUrl(row.storage_path, 300);
      if (!active) return;
      if (signErr || !data) {
        setError(signErr?.message ?? "Cannot generate preview link.");
        setLoading(false);
        return;
      }
      setUrl(data.signedUrl);
      setMime(row.mime_type);
      // Fetch as a blob so the viewer works inside sandboxed/nested preview frames.
      try {
        const res = await fetch(data.signedUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        if (!active) return;
        createdUrl = URL.createObjectURL(
          row.mime_type ? new Blob([blob], { type: row.mime_type }) : blob,
        );
        setBlobUrl(createdUrl);
      } catch (e) {
        if (!active) return;
        // Signed URL still works as a fallback target.
        console.warn("Preview blob fetch failed", e);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [doc.id]);


  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const download = async () => {
    try {
      let objUrl = blobUrl;
      let revoke = false;
      if (!objUrl) {
        if (!url) return;
        const res = await fetch(url);
        objUrl = URL.createObjectURL(await res.blob());
        revoke = true;
      }
      const a = document.createElement("a");
      a.href = objUrl;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      if (revoke) setTimeout(() => URL.revokeObjectURL(objUrl!), 1000);
    } catch (e) {
      setError(`Download failed: ${(e as Error).message}`);
    }
  };


  const submit = () => {
    if (!user || !body.trim()) return;
    add.mutate(
      {
        body,
        authorId: user.id,
        authorName: profile?.full_name || user.email || "Member",
        authorOrg: profile?.org || "",
        parentId: null,
      },
      { onSuccess: () => setBody("") },
    );
  };

  const submitReply = (parentId: string) => {
    if (!user || !replyBody.trim()) return;
    add.mutate(
      {
        body: replyBody,
        authorId: user.id,
        authorName: profile?.full_name || user.email || "Member",
        authorOrg: profile?.org || "",
        parentId,
      },
      {
        onSuccess: () => {
          setReplyBody("");
          setReplyTo(null);
        },
      },
    );
  };

  const roots = comments.filter((c) => !c.parent_id);
  const repliesOf = (id: string) =>
    comments
      .filter((c) => c.parent_id === id)
      .sort((a, b) => a.created_at.localeCompare(b.created_at));


  const ext = doc.name.toLowerCase().split(".").pop() ?? "";
  const m = mime ?? "";
  const kind: "image" | "pdf" | "docx" | "sheet" | "pptx" | "legacy" | "unsupported" =
    m.startsWith("image/")
      ? "image"
      : m.includes("pdf") || ext === "pdf"
        ? "pdf"
        : m.includes("wordprocessingml") || ext === "docx"
          ? "docx"
          : m.includes("spreadsheetml") ||
              m.includes("ms-excel") ||
              m === "text/csv" ||
              ["xlsx", "xls", "csv"].includes(ext)
            ? "sheet"
            : m.includes("presentationml") || ext === "pptx"
              ? "pptx"
              : ["doc", "ppt", "xlt"].includes(ext)
                ? "legacy"
                : "unsupported";


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />
      <div className="relative flex h-[86vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        <header className="flex items-start justify-between gap-3 border-b p-4">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{doc.name}</h3>
            <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
              <span>{doc.folder}</span>
              <span>·</span>
              <span>{doc.confidentiality} confidentiality</span>
              <span>·</span>
              <span className="tabular-nums">{doc.updated}</span>
              <Pill tone={doc.status === "approved" ? "success" : doc.status === "in_review" ? "warning" : "info"}>
                {doc.status.replace("_", " ")}
              </Pill>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowComments((s) => !s)}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Comments <span className="tabular-nums">({comments.length})</span>
            </Button>
            <Button size="sm" onClick={download} disabled={!url}>
              <Download className="h-3.5 w-3.5" />
              Download
            </Button>
            <button onClick={onClose} aria-label="Close preview" className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <div className="flex min-w-0 flex-1 items-center justify-center bg-secondary/40">
            {loading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Preparing preview…
              </div>
            )}
            {!loading && error && (
              <div className="max-w-md rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                {error}
              </div>
            )}
            {!loading && !error && (blobUrl || url) && (() => {
              const fileSrc = blobUrl ?? url!;
              const fallback = (message?: string) => (
                <div className="flex flex-col items-center gap-3 text-center text-xs text-muted-foreground">
                  <p>
                    {message ??
                      (kind === "legacy"
                        ? "Legacy Office formats (.doc, .ppt, .xls binary) can’t be previewed in the browser. Download the file or convert it to a modern format."
                        : "Inline preview isn’t available for this file type.")}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => window.open(fileSrc, "_blank", "noopener,noreferrer")}>
                      <ExternalLink className="h-3.5 w-3.5" /> Open in new tab
                    </Button>
                    <Button size="sm" onClick={download}>
                      <Download className="h-3.5 w-3.5" /> Download
                    </Button>
                  </div>
                </div>
              );

              if (viewerError) return fallback(`Preview failed: ${viewerError}`);
              if (kind === "image")
                return <img src={fileSrc} alt={doc.name} className="max-h-full max-w-full object-contain" />;
              if (kind === "pdf")
                return <PdfCanvasViewer src={fileSrc} className="h-full w-full overflow-y-auto bg-background" />;
              if (kind === "docx")
                return (
                  <DocxViewer
                    src={fileSrc}
                    onError={setViewerError}
                    className="h-full w-full overflow-y-auto bg-secondary/40 p-4"
                  />
                );
              if (kind === "sheet")
                return (
                  <SheetViewer
                    src={fileSrc}
                    onError={setViewerError}
                    className="flex h-full w-full flex-col overflow-hidden bg-background"
                  />
                );
              if (kind === "pptx")
                return (
                  <PptxViewer
                    src={fileSrc}
                    onError={setViewerError}
                    className="h-full w-full overflow-auto bg-secondary/40"
                  />
                );
              return fallback();
            })()}


          </div>

          {showComments && (
            <aside className="flex w-full max-w-sm flex-col border-l bg-card">
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {loadingComments && <div className="text-xs text-muted-foreground">Loading comments…</div>}
                {!loadingComments && comments.length === 0 && (
                  <div className="text-xs text-muted-foreground">No comments yet on this document.</div>
                )}
                {roots.map((c) => (
                  <CommentNode
                    key={c.id}
                    comment={c}
                    replies={repliesOf(c.id)}
                    userId={user?.id}
                    onDelete={(id) => del.mutate(id)}
                    onReply={setReplyTo}
                    replyTo={replyTo}
                    replyBody={replyBody}
                    setReplyBody={setReplyBody}
                    onSubmitReply={submitReply}
                    pending={add.isPending}
                  />
                ))}
              </div>
              <div className="space-y-2 border-t p-3">
                {(add.error || del.error) && (
                  <div className="rounded-md border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive">
                    {(add.error as Error)?.message ?? (del.error as Error)?.message}
                  </div>
                )}
                <textarea
                  value={body}
                  maxLength={2000}
                  rows={3}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Add a comment on this document…"
                  className="w-full resize-none rounded-lg border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] tabular-nums text-muted-foreground">{body.length}/2000</span>
                  <Button size="sm" onClick={submit} disabled={!body.trim() || add.isPending}>
                    {add.isPending ? "Posting…" : "Post comment"}
                  </Button>
                </div>
              </div>
            </aside>
          )}

        </div>
      </div>
    </div>
  );
}

function CommentBubble({
  comment,
  userId,
  onDelete,
}: {
  comment: CommentRow;
  userId?: string;
  onDelete: (id: string) => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-xs font-medium">{comment.author_name}</span>
          {comment.author_org && <Pill tone="info">{comment.author_org}</Pill>}
        </div>
        {comment.author_id === userId && (
          <button
            onClick={() => onDelete(comment.id)}
            aria-label="Delete comment"
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-snug">{comment.body}</p>
      <div className="mt-2 text-[10px] tabular-nums text-muted-foreground">{comment.created_at}</div>
    </>
  );
}

function CommentNode({
  comment,
  replies,
  userId,
  onDelete,
  onReply,
  replyTo,
  replyBody,
  setReplyBody,
  onSubmitReply,
  pending,
}: {
  comment: CommentRow;
  replies: CommentRow[];
  userId?: string;
  onDelete: (id: string) => void;
  onReply: (id: string | null) => void;
  replyTo: string | null;
  replyBody: string;
  setReplyBody: (v: string) => void;
  onSubmitReply: (parentId: string) => void;
  pending: boolean;
}) {
  const open = replyTo === comment.id;
  return (
    <div className="rounded-lg border border-input bg-background p-3">
      <CommentBubble comment={comment} userId={userId} onDelete={onDelete} />

      {replies.length > 0 && (
        <div className="mt-3 space-y-2 border-l-2 border-border pl-3">
          {replies.map((r) => (
            <div key={r.id} className="rounded-md bg-secondary/40 p-2">
              <CommentBubble comment={r} userId={userId} onDelete={onDelete} />
            </div>
          ))}
        </div>
      )}

      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={() => onReply(open ? null : comment.id)}
          className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
        >
          <Reply className="h-3 w-3" />
          {open ? "Cancel" : "Reply"}
        </button>
        {replies.length > 0 && (
          <span className="text-[10px] text-muted-foreground tabular-nums">
            {replies.length} {replies.length === 1 ? "reply" : "replies"}
          </span>
        )}
      </div>

      {open && (
        <div className="mt-2 space-y-2">
          <textarea
            value={replyBody}
            maxLength={2000}
            rows={2}
            autoFocus
            onChange={(e) => setReplyBody(e.target.value)}
            placeholder={`Reply to ${comment.author_name}…`}
            className="w-full resize-none rounded-md border border-input bg-background p-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex justify-end">
            <Button size="sm" onClick={() => onSubmitReply(comment.id)} disabled={!replyBody.trim() || pending}>
              {pending ? "Posting…" : "Post reply"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
