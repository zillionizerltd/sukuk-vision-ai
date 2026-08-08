import { Fragment, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader, Pill, Button } from "@/components/ui/primitives";
import { useRisks, type RiskRow } from "@/hooks/use-modules";
import { useCreateRisk } from "@/hooks/use-risk-mutations";
import { useAuth } from "@/hooks/use-auth";
import { useOrgNames } from "@/hooks/use-organisations";
import { Plus, X } from "lucide-react";

export const Route = createFileRoute("/_app/risks")({
  head: () => ({ meta: [{ title: "Risks · Agrofeed Sukuk" }, { name: "description", content: "Risk register and heatmap." }] }),
  component: Risks,
});

const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";


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
  const { data: RISKS = [], isLoading } = useRisks();
  const { profile, roles } = useAuth();
  const ORGS = useOrgNames();
  const createRisk = useCreateRisk();

  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: "",
    likelihood: 3,
    impact: 3,
    mitigation: "",
    owner_org: profile?.org ?? ORGS[0] ?? "",
    status: "open",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.org && !roles.includes("admin")) {
      setForm((prev) => ({ ...prev, owner_org: profile?.org ?? ORGS[0] ?? "" }));
    }
  }, [profile?.org, roles, ORGS]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await createRisk.mutateAsync(form);
      setShowNew(false);
      setForm({
        title: "",
        category: "",
        likelihood: 3,
        impact: 3,
        mitigation: "",
        owner_org: profile?.org ?? ORGS[0] ?? "",
        status: "open",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add risk");
    }
  };

  return (
    <>
      <PageHeader title="Risk Management" subtitle="18 categories · probability × impact heatmap · mitigation tracking"
        // actions={<Button size="sm" onClick={() => setShowNew((s) => !s)}><Plus className="h-3.5 w-3.5" />Add risk</Button>}
      />

      {showNew && (
        <Card className="mb-5">
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-4 flex items-center justify-between">
              <span className="text-sm font-semibold">New risk</span>
              <button type="button" onClick={() => setShowNew(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <input className={`${inputCls} md:col-span-4`} placeholder="Risk title / description" value={form.title}
                   onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                   
            <input className={`${inputCls} md:col-span-2`} placeholder="Category (e.g. Legal, Market)" value={form.category}
                   onChange={(e) => setForm({ ...form, category: e.target.value })} />
                   
            <select className={`${inputCls} md:col-span-2`} value={form.owner_org} onChange={(e) => setForm({ ...form, owner_org: e.target.value })} disabled={!roles.includes("admin")}>
              {ORGS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Likelihood</label>
              <select className={inputCls} value={form.likelihood} onChange={(e) => setForm({ ...form, likelihood: parseInt(e.target.value, 10) })}>
                <option value={1}>Low</option>
                <option value={3}>Medium</option>
                <option value={5}>High</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Impact</label>
              <select className={inputCls} value={form.impact} onChange={(e) => setForm({ ...form, impact: parseInt(e.target.value, 10) })}>
                <option value={1}>Low</option>
                <option value={3}>Medium</option>
                <option value={5}>High</option>
              </select>
            </div>

            <input className={`${inputCls} md:col-span-2 self-end`} placeholder="Mitigation strategy (optional)" value={form.mitigation}
                   onChange={(e) => setForm({ ...form, mitigation: e.target.value })} />

            <div className="md:col-span-4 flex items-center gap-2 mt-2">
              <Button size="sm" type="submit" disabled={createRisk.isPending}>
                {createRisk.isPending ? "Adding…" : "Add risk"}
              </Button>
            </div>
            
            {error && <div className="md:col-span-4 text-xs text-destructive">{error}</div>}
          </form>
        </Card>
      )}

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
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-muted-foreground text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Loading risks...
                  </div>
                </td>
              </tr>
            ) : RISKS.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-muted-foreground text-sm">
                  No risks found.
                </td>
              </tr>
            ) : (
              RISKS.map((r) => (
                <tr key={r.id} className="hover:bg-secondary/40">
                  <td className="px-4 py-3 font-medium">{r.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.category}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.probability}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.impact}</td>
                  <td className="px-4 py-3"><Pill tone={r.rating === "High" ? "danger" : r.rating === "Medium" ? "warning" : "success"}>{r.rating}</Pill></td>
                  <td className="px-4 py-3 text-muted-foreground">{r.owner}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </>
  );
}
