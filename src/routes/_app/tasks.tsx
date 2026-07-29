import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader, Pill, Button } from "@/components/ui/primitives";
import { TASKS } from "@/lib/demo-data";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/_app/tasks")({
  head: () => ({ meta: [{ title: "Tasks · Agrofeed Sukuk Data Room" }, { name: "description", content: "Task assignments and approvals across stakeholders." }] }),
  component: Tasks,
});

function Tasks() {
  const cols = [
    { key: "not_started", label: "Not started", tone: "neutral" as const },
    { key: "in_progress", label: "In progress", tone: "warning" as const },
    { key: "overdue", label: "Overdue", tone: "danger" as const },
    { key: "completed", label: "Completed", tone: "success" as const },
  ];
  return (
    <>
      <PageHeader title="Tasks" subtitle="Cross-organisation workflow across Agrofeed, Tesserant, and Al Huda."
                  actions={<Button size="sm"><Plus className="h-3.5 w-3.5" />New task</Button>} />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cols.map((col) => {
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
                    <div className="text-sm font-medium leading-snug">{t.title}</div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{t.org} · {t.assignee}</span>
                      <Pill tone={t.priority === "Critical" ? "danger" : t.priority === "High" ? "warning" : "info"}>{t.priority}</Pill>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1 tabular-nums">Due {t.due}</div>
                  </div>
                ))}
                {items.length === 0 && <div className="text-xs text-muted-foreground text-center py-4">No tasks</div>}
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
