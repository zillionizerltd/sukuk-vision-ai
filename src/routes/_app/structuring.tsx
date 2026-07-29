import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader, Pill, ProgressBar, Button } from "@/components/ui/primitives";
import { useStructures } from "@/hooks/use-modules";
import { Sparkles, Info } from "lucide-react";

export const Route = createFileRoute("/_app/structuring")({
  head: () => ({ meta: [{ title: "Sukuk Structuring · Agrofeed" }, { name: "description", content: "AI-powered comparison of Sukuk structures." }] }),
  component: Structuring,
});

function Structuring() {
  return (
    <>
      <PageHeader
        title="AI Sukuk Structuring Engine"
        subtitle="Live analysis of asset base, cash flows, Sharia constraints, and investor appetite."
        actions={<><Button variant="secondary" size="sm">Compare</Button><Button size="sm"><Sparkles className="h-3.5 w-3.5" />Re-run analysis</Button></>}
      />

      <div className="rounded-xl border border-gold/40 bg-gold/10 p-4 mb-6 flex gap-3">
        <Info className="h-4 w-4 mt-0.5 text-[color-mix(in_oklab,var(--gold)_45%,black)] shrink-0" />
        <p className="text-xs leading-relaxed">
          <span className="font-semibold">Not a formal opinion.</span> All Sukuk structures, suitability scores, and recommendations must be reviewed and
          approved by qualified legal counsel, Sharia scholars, financial advisors, arrangers, and applicable regulators before adoption.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {SUKUK_STRUCTURES.map((s, i) => (
          <Card key={s.name}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{s.name}</h3>
                  {i === 0 && <Pill tone="gold">AI top pick</Pill>}
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{s.note}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-3xl font-semibold tabular-nums">{s.suitability}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Suitability</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] text-muted-foreground"><span>Match</span><span className="tabular-nums">{s.suitability}%</span></div>
              <ProgressBar value={s.suitability} tone="emerald" />
              <div className="flex justify-between text-[11px] text-muted-foreground"><span>Confidence</span><span className="tabular-nums">{s.confidence}%</span></div>
              <ProgressBar value={s.confidence} tone="gold" />
            </div>
            <div className="mt-4 pt-3 border-t flex items-center justify-between">
              <div className="text-[11px] text-muted-foreground">Requires assets, Sharia-compliant contracts & investor eligibility</div>
              <Button variant="ghost" size="sm">Details</Button>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
