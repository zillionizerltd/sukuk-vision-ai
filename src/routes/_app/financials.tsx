import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader, Button } from "@/components/ui/primitives";
import { FINANCIALS } from "@/lib/demo-data";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export const Route = createFileRoute("/_app/financials")({
  head: () => ({ meta: [{ title: "Financials · Agrofeed Sukuk" }, { name: "description", content: "Financial intelligence and scenario analysis." }] }),
  component: Financials,
});

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card>
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold mt-1 tabular-nums">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </Card>
  );
}

function Financials() {
  const r = FINANCIALS.ratios;
  return (
    <>
      <PageHeader title="Financial Intelligence" subtitle="Revenue, EBITDA, ratios, scenarios, and stress testing"
                  actions={<Button size="sm">Upload financial model</Button>} />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-5">
        <Metric label="DSCR" value={r.dscr.toFixed(2)} sub="Base case" />
        <Metric label="ICR" value={r.icr.toFixed(2)} sub="Interest cover" />
        <Metric label="LTV" value={`${Math.round(r.ltv * 100)}%`} sub="Loan / assets" />
        <Metric label="IRR" value={`${(r.irr * 100).toFixed(1)}%`} sub="Project IRR" />
        <Metric label="NPV" value={`$${r.npvUsdM}M`} sub="USD, base case" />
        <Metric label="Debt / Equity" value={r.debtEquity.toFixed(2)} />
        <Metric label="Asset coverage" value={r.assetCoverage.toFixed(2)} />
        <Metric label="Current ratio" value={r.currentRatio.toFixed(2)} />
        <Metric label="Quick ratio" value={r.quickRatio.toFixed(2)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <Card>
          <h3 className="font-semibold mb-3">Revenue trajectory (USD M)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={FINANCIALS.revenue}>
              <defs><linearGradient id="rev2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--brand-emerald)" stopOpacity={0.4}/><stop offset="100%" stopColor="var(--brand-emerald)" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="value" stroke="var(--brand-emerald)" strokeWidth={2} fill="url(#rev2)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h3 className="font-semibold mb-3">EBITDA (USD M)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={FINANCIALS.ebitda}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="value" stroke="var(--brand-gold)" strokeWidth={3} dot={{ r: 4, fill: "var(--brand-gold)" }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-3">Scenario & stress testing</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={FINANCIALS.scenarios}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="revenue" fill="var(--brand-emerald)" name="Revenue" radius={[6, 6, 0, 0]} />
            <Bar dataKey="ebitda" fill="var(--brand-gold)" name="EBITDA" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </>
  );
}
