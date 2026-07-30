import { useState } from "react";
import { Button, Pill } from "@/components/ui/primitives";
import { useAuth } from "@/hooks/use-auth";
import { useAddComment, useComments, useDeleteComment, type ItemType } from "@/hooks/use-comments";
import { MessageSquare, Trash2, X } from "lucide-react";

export function CommentButton({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1 text-xs text-muted-foreground hover:bg-secondary/60 transition-colors"
      aria-label={`Comments (${count})`}
    >
      <MessageSquare className="h-3.5 w-3.5" />
      <span className="tabular-nums">{count}</span>
    </button>
  );
}

export function CommentDrawer({
  itemType,
  itemId,
  title,
  onClose,
}: {
  itemType: ItemType;
  itemId: string;
  title: string;
  onClose: () => void;
}) {
  const { user, profile } = useAuth();
  const { data: comments = [], isLoading } = useComments(itemType, itemId);
  const add = useAddComment(itemType, itemId);
  const del = useDeleteComment(itemType, itemId);
  const [body, setBody] = useState("");

  const submit = () => {
    if (!user || !body.trim()) return;
    add.mutate(
      {
        body,
        authorId: user.id,
        authorName: profile?.full_name || user.email || "Member",
        authorOrg: profile?.org || "",
      },
      { onSuccess: () => setBody("") },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-foreground/30" onClick={onClose} />
      <aside className="relative h-full w-full max-w-md bg-card border-l border-border shadow-2xl flex flex-col">
        <header className="flex items-start justify-between gap-3 p-5 border-b">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {itemType} feedback
            </div>
            <h3 className="font-semibold text-sm mt-1 truncate">{title}</h3>
          </div>
          <button onClick={onClose} aria-label="Close comments" className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {isLoading && <div className="text-xs text-muted-foreground">Loading comments…</div>}
          {!isLoading && comments.length === 0 && (
            <div className="text-xs text-muted-foreground">No feedback yet. Be the first to comment.</div>
          )}
          {comments.map((c) => (
            <div key={c.id} className="rounded-lg border border-input bg-background p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-medium truncate">{c.author_name}</span>
                  {c.author_org && <Pill tone="info">{c.author_org}</Pill>}
                </div>
                {c.author_id === user?.id && (
                  <button
                    onClick={() => del.mutate(c.id)}
                    aria-label="Delete comment"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <p className="text-sm mt-2 whitespace-pre-wrap leading-snug">{c.body}</p>
              <div className="text-[10px] text-muted-foreground mt-2 tabular-nums">{c.created_at}</div>
            </div>
          ))}
        </div>

        <div className="border-t p-4 space-y-2">
          {(add.error || del.error) && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 text-destructive text-xs p-2">
              {(add.error as Error)?.message ?? (del.error as Error)?.message}
            </div>
          )}
          <textarea
            value={body}
            maxLength={2000}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Add feedback for this item…"
            rows={3}
            className="w-full resize-none rounded-lg border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground tabular-nums">{body.length}/2000</span>
            <Button size="sm" onClick={submit} disabled={!body.trim() || add.isPending}>
              {add.isPending ? "Posting…" : "Post comment"}
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}
