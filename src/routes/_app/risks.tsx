import { Fragment } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader, Pill, Button } from "@/components/ui/primitives";
import { useRisks, type RiskRow } from "@/hooks/use-modules";

export const Route = createFileRoute("/_app/risks")({
  head: () => ({ meta: [{ title: "Risks · Agrofeed Sukuk" }, { name: "description", content: "Risk register and heatmap." }] }),
  component: Risks,
});

const LEVELS = ["Low", "Medium", "High"] as const;

function cell(prob: string, impact: string, RISKS: RiskRow[]) {
  const p = LEVELS.indexOf(prob as (typeof LEVELS)[number]);
  const i = LEVELS.indexOf(impact as (typeof LEVELS)[number]);
  const score = p + i;
  const bg = score <= 1 ? "bg-[color-mix(in_oklab,var(--success)_18%,transparent)]"
           : score <= 2 ? "bg-[color-mix(in_oklab,var(--warning)_22%,transparent)]"
           : score <= 3 ? "bg-[color-mix(in_oklab,var(--warning)_35%,transparent)]"
           : "bg-[color-mix(in_oklab,var(--destructive)_25%,transparent)]";
  const items = RISKS.filter((r) => r.probability === prob && r.impact === impact);
  return (
    <div className={`rounded-lg ${bg} p-2 min-h-[76px] flex flex-col gap-1`}>
      {items.map((r) => <span key={r.id} className="text-[10px] leading-tight bg-background/60 rounded px-1.5 py-0.5">{r.title}</span>)}
    </div>
  );
}

function Risks() {
  const { data: RISKS = [] } = useRisks();
  return (
    <>
      <PageHeader title="Risk Management" subtitle="18 categories · probability × impact heatmap · mitigation tracking"
                  actions={<Button size="sm">Add risk</Button>} />

      <Card className="mb-5">
        <h3 className="font-semibold mb-3">Risk heatmap</h3>
        <div className="grid grid-cols-[80px_repeat(3,1fr)] gap-2 text-xs">
          <div></div>
          {LEVELS.map((l) => <div key={l} className="text-center font-medium text-muted-foreground">{l} impact</div>)}
          {[...LEVELS].reverse().map((prob) => (
            <Fragment key={prob}>
              <div className="flex items-center justify-end pr-2 font-medium text-muted-foreground">{prob} prob</div>
              {LEVELS.map((impact) => <div key={`${prob}-${impact}`}>{cell(prob, impact, RISKS)}</div>)}
            </Fragment>
          ))}
        </div>
      </Card>

      <Card className="!p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-[11px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-4 py-3">Risk</th>
              <th className="text-left font-medium px-4 py-3">Category</th>
              <th className="text-left font-medium px-4 py-3">Probability</th>
              <th className="text-left font-medium px-4 py-3">Impact</th>
              <th className="text-left font-medium px-4 py-3">Rating</th>
              <th className="text-left font-medium px-4 py-3">Owner</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {RISKS.map((r) => (
              <tr key={r.id} className="hover:bg-secondary/40">
                <td className="px-4 py-3 font-medium">{r.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.category}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.probability}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.impact}</td>
                <td className="px-4 py-3"><Pill tone={r.rating === "High" ? "danger" : r.rating === "Medium" ? "warning" : "success"}>{r.rating}</Pill></td>
                <td className="px-4 py-3 text-muted-foreground">{r.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
