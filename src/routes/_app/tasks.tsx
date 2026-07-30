import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader, Pill, Button } from "@/components/ui/primitives";
import { useTasks } from "@/hooks/use-modules";
import { useCommentCounts } from "@/hooks/use-comments";
import { useCreateTask, useUpdateTaskStatus, useDeleteTask, useUpdateTaskDueDate } from "@/hooks/use-tasks-mutations";
import { CommentButton, CommentDrawer } from "@/components/collab/CommentDrawer";
import { useAuth } from "@/hooks/use-auth";
import { Plus, Trash2, X, CalendarClock, AlertTriangle } from "lucide-react";

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

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function parseDue(due?: string | null) {
  if (!due) return null;
  const d = new Date(`${due}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Days until due: negative = overdue, 0 = today. */
function daysUntil(due?: string | null) {
  const d = parseDue(due);
  if (!d) return null;
  return Math.round((d.getTime() - startOfToday().getTime()) / 86400000);
}

function formatDue(due?: string | null) {
  const d = parseDue(due);
  if (!d) return "No due date";
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

function dueMeta(due: string | null | undefined, status: string) {
  const diff = daysUntil(due);
  if (diff === null) return { label: "No due date", tone: "neutral" as const, overdue: false };
  if (status === "completed") return { label: formatDue(due), tone: "success" as const, overdue: false };
  if (diff < 0) return { label: `Overdue by ${Math.abs(diff)}d`, tone: "danger" as const, overdue: true };
  if (diff === 0) return { label: "Due today", tone: "warning" as const, overdue: false };
  if (diff <= 7) return { label: `Due in ${diff}d`, tone: "warning" as const, overdue: false };
  return { label: formatDue(due), tone: "info" as const, overdue: false };
}

function Tasks() {
  const { data: TASKS = [] } = useTasks();
  const { data: counts = {} } = useCommentCounts("task");
  const { roles, profile } = useAuth();
  const canWrite = roles.includes("admin") || roles.includes("advisor");

  const createTask = useCreateTask();
  const updateStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();
  const updateDue = useUpdateTaskDueDate();

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

  const overdueTasks = TASKS.filter(
    (t) => t.status !== "completed" && (daysUntil(t.due) ?? 0) < 0,
  );

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

      {overdueTasks.length > 0 && (
        <Card className="mb-4 border-destructive/40">
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="font-semibold text-destructive">{overdueTasks.length} overdue task{overdueTasks.length > 1 ? "s" : ""}</span>
            <span className="text-muted-foreground text-xs truncate">
              {overdueTasks.slice(0, 3).map((t) => t.title).join(" · ")}
              {overdueTasks.length > 3 ? " …" : ""}
            </span>
          </div>
        </Card>
      )}

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
          const items =
            col.key === "overdue"
              ? TASKS.filter((t) => t.status === "overdue" || ((t.status === "not_started" || t.status === "in_progress") && (daysUntil(t.due) ?? 0) < 0))
              : TASKS.filter((t) => t.status === col.key && !((daysUntil(t.due) ?? 0) < 0));
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
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1">
                        <CalendarClock className="h-3 w-3 text-muted-foreground" />
                        <Pill tone={dueMeta(t.due, t.status).tone}>{dueMeta(t.due, t.status).label}</Pill>
                      </span>
                      <CommentButton count={counts[t.id] ?? 0} onClick={() => setActive({ id: t.id, title: t.title })} />
                    </div>
                    {t.due && !dueMeta(t.due, t.status).overdue && (
                      <div className="mt-1 text-[11px] text-muted-foreground tabular-nums">{formatDue(t.due)}</div>
                    )}
                    {canWrite && (
                      <input
                        type="date"
                        aria-label="Task due date"
                        className="mt-2 w-full rounded-md border border-input bg-background px-2 py-1 text-[11px]"
                        value={t.due ?? ""}
                        onChange={(e) => updateDue.mutate({ id: t.id, due_date: e.target.value })}
                      />
                    )}
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
