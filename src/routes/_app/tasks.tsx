import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader, Pill, Button } from "@/components/ui/primitives";
import { useTasks } from "@/hooks/use-modules";
import { useCommentCounts } from "@/hooks/use-comments";
import { useCreateTask, useUpdateTaskStatus, useDeleteTask } from "@/hooks/use-tasks-mutations";
import { CommentButton, CommentDrawer } from "@/components/collab/CommentDrawer";
import { useAuth } from "@/hooks/use-auth";
import { Plus, Trash2, X } from "lucide-react";

export const Route = createFileRoute("/_app/tasks")({
  head: () => ({ meta: [{ title: "Tasks · Agrofeed Sukuk Data Room" }, { name: "description", content: "Task assignments and approvals across stakeholders." }] }),
  component: Tasks,
});

const COLS = [
  { key: "not_started", label: "Not started", tone: "neutral" as const },
  { key: "in_progress", label: "In progress", tone: "warning" as const },
  { key: "overdue", label: "Overdue", tone: "danger" as const },
  { key: "completed", label: "Completed", tone: "success" as const },
];

const PRIORITIES = ["Low", "Medium", "High", "Critical"];
const ORGS = ["Agrofeed Global", "Tesserant Capital", "Al Huda CIBE", "Sharia Supervisory Board", "External Legal Counsel"];

const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

function Tasks() {
  const { data: TASKS = [] } = useTasks();
  const { data: counts = {} } = useCommentCounts("task");
  const { roles, profile } = useAuth();
  const canWrite = roles.includes("admin") || roles.includes("advisor");

  const createTask = useCreateTask();
  const updateStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();

  const [active, setActive] = useState<{ id: string; title: string } | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({
    title: "",
    org: profile?.org ?? ORGS[0],
    assignee: "",
    due_date: "",
    priority: "Medium",
    status: "not_started",
  });
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await createTask.mutateAsync({ ...form, due_date: form.due_date || null });
      setShowNew(false);
      setForm({ title: "", org: profile?.org ?? ORGS[0], assignee: "", due_date: "", priority: "Medium", status: "not_started" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create task");
    }
  };

  return (
    <>
      <PageHeader
        title="Tasks"
        subtitle="Cross-organisation workflow across Agrofeed, Tesserant, and Al Huda."
        actions={
          canWrite ? (
            <Button size="sm" onClick={() => setShowNew((s) => !s)}>
              <Plus className="h-3.5 w-3.5" />New task
            </Button>
          ) : undefined
        }
      />

      {showNew && canWrite && (
        <Card className="mb-4">
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-3 flex items-center justify-between">
              <span className="text-sm font-semibold">New task</span>
              <button type="button" onClick={() => setShowNew(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <input className={`${inputCls} md:col-span-3`} placeholder="Task title" value={form.title}
                   onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <select className={inputCls} value={form.org} onChange={(e) => setForm({ ...form, org: e.target.value })}>
              {ORGS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <input className={inputCls} placeholder="Assignee" value={form.assignee}
                   onChange={(e) => setForm({ ...form, assignee: e.target.value })} />
            <input type="date" className={inputCls} value={form.due_date}
                   onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            <select className={inputCls} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {COLS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
            <div className="flex items-center gap-2">
              <Button size="sm" type="submit" disabled={createTask.isPending}>
                {createTask.isPending ? "Creating…" : "Create task"}
              </Button>
            </div>
            {error && <div className="md:col-span-3 text-xs text-destructive">{error}</div>}
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLS.map((col) => {
          const items = TASKS.filter((t) => t.status === col.key);
          return (
            <Card key={col.key} className="!p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{col.label}</span>
                  <Pill tone={col.tone}>{items.length}</Pill>
                </div>
              </div>
              <div className="space-y-2">
                {items.map((t) => (
                  <div key={t.id} className="rounded-lg border border-input bg-background p-3 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-medium leading-snug">{t.title}</div>
                      {canWrite && (
                        <button
                          type="button"
                          aria-label="Delete task"
                          onClick={() => deleteTask.mutate(t.id)}
                          className="text-muted-foreground hover:text-destructive shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{t.org} · {t.assignee}</span>
                      <Pill tone={t.priority === "Critical" ? "danger" : t.priority === "High" ? "warning" : "info"}>{t.priority}</Pill>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <div className="text-[11px] text-muted-foreground tabular-nums">Due {t.due}</div>
                      <CommentButton count={counts[t.id] ?? 0} onClick={() => setActive({ id: t.id, title: t.title })} />
                    </div>
                    {canWrite && (
                      <select
                        aria-label="Task status"
                        className="mt-2 w-full rounded-md border border-input bg-background px-2 py-1 text-[11px]"
                        value={t.status}
                        onChange={(e) => updateStatus.mutate({ id: t.id, status: e.target.value })}
                      >
                        {COLS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                      </select>
                    )}
                  </div>
                ))}
                {items.length === 0 && <div className="text-xs text-muted-foreground text-center py-4">No tasks</div>}
              </div>
            </Card>
          );
        })}
      </div>

      {active && (
        <CommentDrawer itemType="task" itemId={active.id} title={active.title} onClose={() => setActive(null)} />
      )}
    </>
  );
}
