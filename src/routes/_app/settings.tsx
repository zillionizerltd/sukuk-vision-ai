import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader, Pill, Button } from "@/components/ui/primitives";
import { ShieldCheck, KeyRound, Users } from "lucide-react";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings · Agrofeed Sukuk" }, { name: "description", content: "Platform, security, and role settings." }] }),
  component: Settings,
});

const ROLES = [
  "Super Administrator", "Agrofeed Administrator", "Agrofeed Team Member",
  "Tesserant Administrator", "Tesserant Advisor", "Al Huda Administrator", "Al Huda Advisor",
  "Sharia Scholar", "Legal Advisor", "Financial Advisor", "ESG Advisor", "Auditor",
  "Investor", "Rating Agency", "External Reviewer", "Guest",
];

function Settings() {
  return (
    <>
      <PageHeader title="Settings" subtitle="Security, roles, permissions, and platform configuration" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <h3 className="font-semibold flex items-center gap-2 mb-4"><ShieldCheck className="h-4 w-4 text-primary" />Security</h3>
          <ul className="space-y-3 text-sm">
            {[
              ["AES-256 encryption at rest", "Enabled"],
              ["TLS 1.3 in transit", "Enabled"],
              ["Multi-factor authentication", "Required"],
              ["IP allowlisting", "3 ranges"],
              ["Session expiration", "30 minutes"],
              ["Watermarked downloads", "Enabled"],
              ["Malware scanning", "Enabled"],
              ["Immutable audit logs", "Enabled"],
              ["ISO 27001-aligned controls", "In progress"],
              ["SOC 2 readiness", "In progress"],
            ].map(([k, v]) => (
              <li key={k} className="flex items-center justify-between border-b border-border last:border-0 pb-2 last:pb-0">
                <span>{k}</span><Pill tone={String(v).includes("progress") ? "warning" : "success"}>{v}</Pill>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h3 className="font-semibold flex items-center gap-2 mb-4"><Users className="h-4 w-4 text-primary" />Roles</h3>
          <div className="flex flex-wrap gap-1.5">
            {ROLES.map((r) => <Pill key={r} tone="neutral">{r}</Pill>)}
          </div>
          <div className="mt-4 text-xs text-muted-foreground leading-relaxed">
            Each role has configurable permissions for viewing, uploading, downloading, approving, commenting, assigning tasks, and accessing confidential materials, financial data, Sukuk recommendations, compliance issues, and audit trails.
          </div>
          <Button variant="secondary" size="sm" className="mt-4">Configure permissions</Button>
        </Card>

        <Card>
          <h3 className="font-semibold flex items-center gap-2 mb-4"><KeyRound className="h-4 w-4 text-primary" />Authentication</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between"><span>Email & password</span><Pill tone="success">Enabled</Pill></div>
            <div className="flex items-center justify-between"><span>Google sign-in</span><Pill tone="neutral">Optional</Pill></div>
            <div className="flex items-center justify-between"><span>Microsoft sign-in</span><Pill tone="neutral">Optional</Pill></div>
            <div className="flex items-center justify-between"><span>SAML SSO</span><Pill tone="neutral">Optional</Pill></div>
            <div className="flex items-center justify-between"><span>Password reset</span><Pill tone="success">Enabled</Pill></div>
            <div className="flex items-center justify-between"><span>Login activity monitoring</span><Pill tone="success">Enabled</Pill></div>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Data residency</h3>
          <p className="text-sm text-muted-foreground">Primary: <span className="text-foreground font-medium">EU (Frankfurt)</span>. Backup: <span className="text-foreground font-medium">Middle East (Dubai)</span>. Encrypted, geo-redundant.</p>
          <Button variant="secondary" size="sm" className="mt-4">Change region</Button>
        </Card>
      </div>
    </>
  );
}
