import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader, Pill, ProgressBar, Button } from "@/components/ui/primitives";
import { useStructures } from "@/hooks/use-modules";
import { useQueryClient } from "@tanstack/react-query";
import { Sparkles, Info, X, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/_app/structuring")({
  head: () => ({ meta: [{ title: "Sukuk Structuring · Agrofeed" }, { name: "description", content: "AI-powered comparison of Sukuk structures." }] }),
  component: Structuring,
});

// ── Compare Modal ─────────────────────────────────────────────────────────────
type StructureRow = { name: string; suitability: number; confidence: number; note: string };

function CompareModal({ structures, onClose }: { structures: StructureRow[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-5xl max-h-[85vh] overflow-y-auto rounded-2xl bg-background border shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Structure comparison</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Side-by-side AI suitability analysis</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded-lg p-1 hover:bg-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Score table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-[11px] uppercase tracking-widest text-muted-foreground bg-secondary/60">
                <th className="text-left px-4 py-3 font-medium rounded-l-lg">Structure</th>
                <th className="text-center px-4 py-3 font-medium">Suitability</th>
                <th className="text-center px-4 py-3 font-medium">Confidence</th>
                <th className="text-left px-4 py-3 font-medium rounded-r-lg">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {structures.map((s, i) => (
                <tr key={s.name} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{s.name}</span>
                      {i === 0 && <Pill tone="gold">AI top pick</Pill>}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col items-center gap-1.5 min-w-[120px]">
                      <span className="text-lg font-semibold tabular-nums">{s.suitability}%</span>
                      <ProgressBar value={s.suitability} tone="emerald" />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col items-center gap-1.5 min-w-[120px]">
                      <span className="text-lg font-semibold tabular-nums">{s.confidence}%</span>
                      <ProgressBar value={s.confidence} tone="gold" />
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs text-muted-foreground max-w-xs leading-relaxed">{s.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recommendation callout */}
        {structures.length > 0 && (
          <div className="mt-6 rounded-xl border border-gold/40 bg-gold/10 p-4 flex gap-3">
            <Sparkles className="h-4 w-4 mt-0.5 text-[color-mix(in_oklab,var(--gold)_50%,black)] shrink-0" />
            <p className="text-xs leading-relaxed">
              <span className="font-semibold">AI recommendation: </span>
              <span className="font-semibold">{structures[0]?.name}</span> scores highest with a {structures[0]?.suitability}% suitability and
              {" "}{structures[0]?.confidence}% confidence. {structures[0]?.note}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
function Structuring() {
  const { data: SUKUK_STRUCTURES = [], isFetching, isLoading } = useStructures();
  const qc = useQueryClient();
  const [showCompare, setShowCompare] = useState(false);
  const [rerunState, setRerunState] = useState<"idle" | "running" | "done">("idle");

  const handleRerun = async () => {
    setRerunState("running");
    await qc.invalidateQueries({ queryKey: ["structures"] });
    setRerunState("done");
    setTimeout(() => setRerunState("idle"), 2500);
  };

  return (
    <>
      {showCompare && (
        <CompareModal structures={SUKUK_STRUCTURES} onClose={() => setShowCompare(false)} />
      )}

      <PageHeader
        title="AI Sukuk Structuring Engine"
        subtitle="Live analysis of asset base, cash flows, Sharia constraints, and investor appetite."
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => setShowCompare(true)}>
              Compare
            </Button>
            <Button
              size="sm"
              onClick={handleRerun}
              disabled={rerunState === "running" || isFetching}
            >
              {(rerunState === "running" || isFetching) ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              {rerunState === "running" || isFetching ? "Running…" : rerunState === "done" ? "Done!" : "Re-run analysis"}
            </Button>
          </>
        }
      />

      <div className="rounded-xl border border-gold/40 bg-gold/10 p-4 mb-6 flex gap-3">
        <Info className="h-4 w-4 mt-0.5 text-[color-mix(in_oklab,var(--gold)_45%,black)] shrink-0" />
        <p className="text-xs leading-relaxed">
          <span className="font-semibold">Not a formal opinion.</span> All Sukuk structures, suitability scores, and recommendations must be reviewed and
          approved by qualified legal counsel, Sharia scholars, financial advisors, arrangers, and applicable regulators before adoption.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="lg:col-span-2 py-10 flex items-center justify-center gap-2 text-muted-foreground text-sm">
            <RefreshCw className="h-4 w-4 animate-spin text-primary" />
            Loading structures...
          </div>
        ) : SUKUK_STRUCTURES.length === 0 ? (
          <div className="lg:col-span-2 text-center py-10 text-muted-foreground text-sm">
            No structures found.
          </div>
        ) : (
          SUKUK_STRUCTURES.map((s, i) => (
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
                <div className="text-[11px] text-muted-foreground">Requires assets, Sharia-compliant contracts &amp; investor eligibility</div>
                <Button variant="ghost" size="sm" onClick={() => setShowCompare(true)}>Details</Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
