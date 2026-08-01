import { Card, Pill } from "@/components/ui/primitives";
import { ShieldCheck, Pencil, Eye, FileSearch, Users } from "lucide-react";

type Role = "admin" | "advisor" | "auditor" | "investor" | "member";

interface RoleDefinition {
  role: Role;
  label: string;
  summary: string;
  permissions: string[];
  modules: string[];
  tone: "gold" | "info" | "neutral" | "success" | "warning";
  icon: typeof ShieldCheck;
}

const ROLES: RoleDefinition[] = [
  {
    role: "admin",
    label: "Platform Admin",
    summary: "Full platform control. Can manage users, organisations, folder access and roles.",
    permissions: [
      "Create, edit and delete records in every module",
      "Assign organisations and roles to any user",
      "Create, rename and delete organisations",
      "Manage folder-level access per organisation",
      "Bypass organisation-based route restrictions",
    ],
    modules: ["Dashboard", "Documents", "Milestones", "Tasks", "Structuring", "Compliance", "Risks", "Financials", "Reports", "AI Advisor", "Stakeholders", "Settings", "Audit Trail", "User Management"],
    tone: "gold",
    icon: ShieldCheck,
  },
  {
    role: "advisor",
    label: "Advisor / Writer",
    summary: "Write access across all collaboration and data modules. Agrofeed Global users receive this role automatically.",
    permissions: [
      "Create and edit tasks, milestones, compliance items, risks and financial metrics",
      "Upload documents and manage document metadata",
      "Create Sukuk structures and reports",
      "Comment on milestones, tasks and documents",
      "Cannot manage users, organisations or folder access",
    ],
    modules: ["Dashboard", "Documents", "Milestones", "Tasks", "Structuring", "Compliance", "Risks", "Financials", "Reports", "AI Advisor", "Stakeholders"],
    tone: "info",
    icon: Pencil,
  },
  {
    role: "auditor",
    label: "Auditor",
    summary: "Read-only viewer with full visibility across records and the immutable audit trail.",
    permissions: [
      "Read all records in the platform",
      "Access the Audit Trail",
      "View documents, milestones, tasks, compliance and risks",
      "Cannot create, edit or delete any data",
    ],
    modules: ["Documents", "Milestones", "Tasks", "Compliance", "Risks", "Financials", "Reports", "AI Advisor", "Audit Trail"],
    tone: "neutral",
    icon: FileSearch,
  },
  {
    role: "investor",
    label: "Investor",
    summary: "Read-only viewer focused on programme transparency and reporting.",
    permissions: [
      "View documents, milestones, tasks and financial metrics",
      "Read reports and ask the AI Advisor questions",
      "Cannot edit data, upload documents or comment",
    ],
    modules: ["Documents", "Milestones", "Tasks", "Financials", "Reports", "AI Advisor"],
    tone: "neutral",
    icon: Eye,
  },
  {
    role: "member",
    label: "Member",
    summary: "Default read-only access. Can view documents, milestones and tasks, and participate in comments.",
    permissions: [
      "View documents allowed by folder access rules",
      "View milestones and tasks",
      "Add comments to milestones, tasks and documents",
      "Cannot create or edit records",
    ],
    modules: ["Documents", "Milestones", "Tasks"],
    tone: "neutral",
    icon: Users,
  },
];

export function RoleDefinitionsPanel() {
  return (
    <Card>
      <h3 className="font-semibold flex items-center gap-2 mb-2">
        <ShieldCheck className="h-4 w-4 text-primary" /> Role definitions
      </h3>
      <p className="text-xs text-muted-foreground mb-5">
        Reference for what each role can do and which modules it can access.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {ROLES.map((r) => {
          const Icon = r.icon;
          return (
            <div
              key={r.role}
              className="rounded-xl border border-input bg-background/50 p-4 flex flex-col gap-3"
            >
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-secondary flex items-center justify-center">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm capitalize">{r.role}</span>
                    <Pill tone={r.tone}>{r.label}</Pill>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">{r.summary}</p>

              <div>
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">
                  Permissions
                </div>
                <ul className="space-y-1">
                  {r.permissions.map((p, i) => (
                    <li key={i} className="text-xs text-foreground/90 flex gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto pt-2 border-t border-input/60">
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">
                  Module access
                </div>
                <div className="flex flex-wrap gap-1">
                  {r.modules.map((m) => (
                    <Pill key={m} tone="neutral">{m}</Pill>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function RoleDescription({ role }: { role: Role }) {
  const def = ROLES.find((r) => r.role === role);
  if (!def) return null;
  return (
    <div className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
      {def.summary}
    </div>
  );
}
