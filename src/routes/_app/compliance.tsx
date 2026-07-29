import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader, Pill, Button } from "@/components/ui/primitives";
import { COMPLIANCE } from "@/lib/demo-data";

export const Route = createFileRoute("/_app/compliance")({
  head: () => ({ meta: [{ title: "Compliance · Agrofeed Sukuk" }, { name: "description", content: "AAOIFI, IFSB, Sharia, IFRS, AML/KYC, ESG, and regulatory compliance." }] }),
  component: Compliance,
});

const CATEGORIES = ["AAOIFI", "IFSB", "Sharia", "IFRS", "AML", "KYC", "Sanctions", "ESG", "Regulatory", "SPV"];

function Compliance() {
  const complete = COMPLIANCE.filter((c) => c.status === "complete").length;
  const gaps = COMPLIANCE.filter((c) => c.status === "gap").length;
  const inprog = COMPLIANCE.filter((c) => c.status === "in_progress").length;
  const score = Math.round((complete / COMPLIANCE.length) * 100);
  return (
    <>
      <PageHeader title="AI Compliance Engine" subtitle="AAOIFI · IFSB · Sharia governance · IFRS · AML/KYC · ESG · Tanzania & UAE regulatory"
                  actions={<Button size="sm">Export compliance report</Button>} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <Card><div className="text-[11px] uppercase tracking-widest text-muted-foreground">Compliance Score</div><div className="text-3xl font-semibold mt-1">{score}%</div></Card>
        <Card><div className="text-[11px] uppercase tracking-widest text-muted-foreground">Complete</div><div className="text-3xl font-semibold mt-1 text-[color-mix(in_oklab,var(--success)_50%,black)]">{complete}</div></Card>
        <Card><div className="text-[11px] uppercase tracking-widest text-muted-foreground">In progress</div><div className="text-3xl font-semibold mt-1 text-[color-mix(in_oklab,var(--warning)_50%,black)]">{inprog}</div></Card>
        <Card><div className="text-[11px] uppercase tracking-widest text-muted-foreground">Gaps</div><div className="text-3xl font-semibold mt-1 text-destructive">{gaps}</div></Card>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {CATEGORIES.map((c) => <Pill key={c} tone="neutral">{c}</Pill>)}
      </div>

      <Card className="!p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-[11px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-4 py-3">Requirement</th>
              <th className="text-left font-medium px-4 py-3">Source</th>
              <th className="text-left font-medium px-4 py-3">Owner</th>
              <th className="text-left font-medium px-4 py-3">Risk</th>
              <th className="text-left font-medium px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {COMPLIANCE.map((c) => (
              <tr key={c.id} className="hover:bg-secondary/40">
                <td className="px-4 py-3 font-medium">{c.req}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.source}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.owner}</td>
                <td className="px-4 py-3"><Pill tone={c.risk === "High" ? "danger" : c.risk === "Medium" ? "warning" : "success"}>{c.risk}</Pill></td>
                <td className="px-4 py-3"><Pill tone={c.status === "complete" ? "success" : c.status === "gap" ? "danger" : "warning"}>{c.status.replace("_", " ")}</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
