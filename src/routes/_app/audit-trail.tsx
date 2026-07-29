import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader, Pill } from "@/components/ui/primitives";
import { useAudit } from "@/hooks/use-modules";
import { Lock } from "lucide-react";

export const Route = createFileRoute("/_app/audit-trail")({
  head: () => ({ meta: [{ title: "Audit Trail · Agrofeed Sukuk" }, { name: "description", content: "Immutable audit log across the platform." }] }),
  component: Audit,
});

function Audit() {
  const { data: AUDIT = [] } = useAudit();
  return (
    <>
      <PageHeader
        title="Audit Trail"
        subtitle="Immutable · time-stamped · exportable · ISO 27001 & SOC 2 aligned"
        actions={<Pill tone="gold"><Lock className="h-3 w-3 mr-1 inline" />Immutable</Pill>}
      />
      <Card className="!p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-[11px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-4 py-3">Timestamp</th>
              <th className="text-left font-medium px-4 py-3">User</th>
              <th className="text-left font-medium px-4 py-3">Action</th>
              <th className="text-left font-medium px-4 py-3">Target</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {AUDIT.map((a) => (
              <tr key={a.id} className="hover:bg-secondary/40">
                <td className="px-4 py-3 tabular-nums text-muted-foreground font-mono text-xs">{a.at}</td>
                <td className="px-4 py-3 font-medium">{a.user}</td>
                <td className="px-4 py-3"><Pill tone={a.action === "Approved" ? "success" : a.action === "Downloaded" ? "info" : "neutral"}>{a.action}</Pill></td>
                <td className="px-4 py-3 text-muted-foreground">{a.target}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
