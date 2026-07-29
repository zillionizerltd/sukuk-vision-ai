import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader, Pill, ProgressBar, Button } from "@/components/ui/primitives";
import { MILESTONES } from "@/lib/demo-data";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/_app/milestones")({
  head: () => ({ meta: [{ title: "Milestones · Agrofeed Sukuk Data Room" }, { name: "description", content: "Sukuk programme milestones and critical path." }] }),
  component: Milestones,
});

function Milestones() {
  const groups = {
    completed: MILESTONES.filter((m) => m.status === "completed"),
    inProgress: MILESTONES.filter((m) => m.status === "in_progress"),
    overdue: MILESTONES.filter((m) => m.status === "overdue"),
    notStarted: MILESTONES.filter((m) => m.status === "not_started" || m.status === "blocked"),
  };
  return (
    <>
      <PageHeader title="Milestones" subtitle={`${groups.completed.length} completed · ${groups.inProgress.length} in progress · ${groups.overdue.length} overdue · ${groups.notStarted.length} upcoming`}
                  actions={<Button size="sm"><Plus className="h-3.5 w-3.5" />New milestone</Button>} />

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
            </tr>
          </thead>
          <tbody className="divide-y">
            {MILESTONES.map((m) => (
              <tr key={m.id} className="hover:bg-secondary/40">
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
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
