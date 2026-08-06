import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader, Pill, ProgressBar, Button } from "@/components/ui/primitives";
import { useMilestones } from "@/hooks/use-modules";
import { useCommentCounts } from "@/hooks/use-comments";
import { useCreateMilestone } from "@/hooks/use-milestone-mutations";
import { CommentButton, CommentDrawer } from "@/components/collab/CommentDrawer";
import { useAuth } from "@/hooks/use-auth";
import { useOrgNames } from "@/hooks/use-organisations";
import { Plus, X } from "lucide-react";

export const Route = createFileRoute("/_app/milestones")({
  head: () => ({ meta: [{ title: "Milestones · Agrofeed Sukuk Data Room" }, { name: "description", content: "Sukuk programme milestones and critical path." }] }),
  component: Milestones,
});

const STATUSES = [
  { key: "not_started", label: "Not started" },
  { key: "in_progress", label: "In progress" },
  { key: "completed", label: "Completed" },
  { key: "blocked", label: "Blocked" },
];

const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

function Milestones() {
  const { data: MILESTONES = [] } = useMilestones();
  const { data: counts = {} } = useCommentCounts("milestone");
  const { profile, roles } = useAuth();
  const ORGS = useOrgNames();
  
  const createMilestone = useCreateMilestone();

  const [active, setActive] = useState<{ id: string; title: string } | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({
    title: "",
    code: "",
    phase: "",
    owner_org: profile?.org ?? ORGS[0] ?? "",
    due_date: "",
    status: "not_started",
    progress: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const groups = {
    completed: MILESTONES.filter((m) => m.status === "completed"),
    inProgress: MILESTONES.filter((m) => m.status === "in_progress"),
    overdue: MILESTONES.filter((m) => m.status === "overdue"),
    notStarted: MILESTONES.filter((m) => m.status === "not_started" || m.status === "blocked"),
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await createMilestone.mutateAsync({ ...form, due_date: form.due_date || null });
      setShowNew(false);
      setForm({
        title: "",
        code: "",
        phase: "",
        owner_org: profile?.org ?? ORGS[0] ?? "",
        due_date: "",
        status: "not_started",
        progress: 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create milestone");
    }
  };

  return (
    <>
      <PageHeader 
        title="Milestones" 
        subtitle={`${groups.completed.length} completed · ${groups.inProgress.length} in progress · ${groups.overdue.length} overdue · ${groups.notStarted.length} upcoming`}
        actions={
          <Button size="sm" onClick={() => setShowNew((s) => !s)}>
            <Plus className="h-3.5 w-3.5" />New milestone
          </Button>
        } 
      />

      {showNew && (
        <Card className="mb-4">
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-4 flex items-center justify-between">
              <span className="text-sm font-semibold">New milestone</span>
              <button type="button" onClick={() => setShowNew(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <input className={`${inputCls} md:col-span-4`} placeholder="Milestone title" value={form.title}
                   onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                   
            <input className={inputCls} placeholder="Code (e.g., M1.1)" value={form.code}
                   onChange={(e) => setForm({ ...form, code: e.target.value })} />
                   
            <input className={inputCls} placeholder="Phase" value={form.phase}
                   onChange={(e) => setForm({ ...form, phase: e.target.value })} />
                   
            <select className={inputCls} value={form.owner_org} onChange={(e) => setForm({ ...form, owner_org: e.target.value })} disabled={!roles.includes("admin")}>
              {ORGS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            
            <input type="date" className={inputCls} value={form.due_date}
                   onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
                   
            <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>

            <div className="flex items-center gap-2 px-1">
              <label className="text-xs text-muted-foreground whitespace-nowrap">Progress: {form.progress}%</label>
              <input type="range" min="0" max="100" step="5" className="flex-1" value={form.progress}
                     onChange={(e) => setForm({ ...form, progress: parseInt(e.target.value, 10) })} />
            </div>

            <div className="md:col-span-2 flex items-center gap-2">
              <Button size="sm" type="submit" disabled={createMilestone.isPending}>
                {createMilestone.isPending ? "Creating…" : "Create milestone"}
              </Button>
            </div>
            
            {error && <div className="md:col-span-4 text-xs text-destructive">{error}</div>}
          </form>
        </Card>
      )}

      <Card className="!p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-[11px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-4 py-3">ID</th>
              <th className="text-left font-medium px-4 py-3">Milestone</th>
              <th className="text-left font-medium px-4 py-3">Owner</th>
              <th className="text-left font-medium px-4 py-3">Due date</th>
              <th className="text-left font-medium px-4 py-3 w-56">Progress</th>
              <th className="text-left font-medium px-4 py-3">Status</th>
              <th className="text-left font-medium px-4 py-3">Feedback</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {MILESTONES.map((m) => (
              <tr key={m.uuid} className="hover:bg-secondary/40">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{m.id}</td>
                <td className="px-4 py-3 font-medium">{m.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{m.owner}</td>
                <td className="px-4 py-3 text-muted-foreground tabular-nums">{m.due}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1"><ProgressBar value={m.progress} tone={m.status === "overdue" ? "danger" : m.status === "in_progress" ? "gold" : "emerald"} /></div>
                    <span className="text-xs w-10 text-right tabular-nums">{m.progress}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Pill tone={m.status === "completed" ? "success" : m.status === "overdue" ? "danger" : m.status === "in_progress" ? "warning" : "neutral"}>
                    {m.status.replace("_", " ")}
                  </Pill>
                </td>
                <td className="px-4 py-3">
                  <CommentButton count={counts[m.uuid] ?? 0} onClick={() => setActive({ id: m.uuid, title: m.name })} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {active && (
        <CommentDrawer itemType="milestone" itemId={active.id} title={active.title} onClose={() => setActive(null)} />
      )}
    </>
  );
}
