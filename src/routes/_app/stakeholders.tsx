import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader, Pill } from "@/components/ui/primitives";
import { useStakeholders } from "@/hooks/use-modules";
import { Building2, Users } from "lucide-react";

export const Route = createFileRoute("/_app/stakeholders")({
  head: () => ({ meta: [{ title: "Stakeholders · Agrofeed Sukuk" }, { name: "description", content: "Organisation views and stakeholder activity." }] }),
  component: Stakeholders,
});

function Stakeholders() {
  return (
    <>
      <PageHeader title="Stakeholder Portal" subtitle="Organisation-specific views for Agrofeed, Tesserant, Al Huda CIBE, Sharia Board & External Legal" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {STAKEHOLDERS.map((s) => (
          <Card key={s.org} className="relative overflow-hidden">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full gradient-gold opacity-10" />
            <div className="flex items-start gap-3 relative">
              <div className="h-11 w-11 rounded-xl gradient-emerald flex items-center justify-center shrink-0">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{s.org}</div>
                <div className="text-[11px] text-muted-foreground">{s.role}</div>
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <Pill tone="warning">{s.pending} pending</Pill>
                  <Pill tone="success">{s.completed} done</Pill>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground"><Users className="h-3 w-3" />{s.users} users</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
