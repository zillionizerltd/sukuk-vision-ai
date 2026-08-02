import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard, FolderOpen, Flag, ListChecks, Layers, ShieldCheck,
  AlertTriangle, LineChart, FileText, Sparkles, Users, Settings, History,
} from "lucide-react";
import { AgrofeedLogo } from "../brand/Logo";
import { useAuth } from "@/hooks/use-auth";
import { useOrganisations, hasPartnerAccess } from "@/hooks/use-organisations";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, restricted: true },
  { to: "/documents", label: "Data Room", icon: FolderOpen, restricted: false },
  { to: "/milestones", label: "Milestones", icon: Flag, restricted: true, partner: true },
  { to: "/tasks", label: "Tasks", icon: ListChecks, restricted: true, partner: true },
  { to: "/structuring", label: "Sukuk Structuring", icon: Layers, restricted: true },
  { to: "/compliance", label: "Compliance", icon: ShieldCheck, restricted: true },
  { to: "/risks", label: "Risks", icon: AlertTriangle, restricted: true },
  { to: "/financials", label: "Financials", icon: LineChart, restricted: true },
  { to: "/reports", label: "Reports", icon: FileText, restricted: true },
  { to: "/ai-advisor", label: "AI Advisor", icon: Sparkles, restricted: false, advisor: true },
  { to: "/stakeholders", label: "Stakeholders", icon: Users, restricted: true },
  { to: "/audit-trail", label: "Audit Trail", icon: History, restricted: true },
  { to: "/profile", label: "Profile", icon: Users, restricted: false },
  { to: "/settings", label: "Settings", icon: Settings, restricted: false },
] as const;

export function Sidebar() {
  const { profile, isAdmin } = useAuth();
  const { data: orgs } = useOrganisations();
  const org = (profile?.org ?? "").toLowerCase();
  const isAgrofeed = org === "agrofeed global";
  const isPartner = hasPartnerAccess(orgs, profile?.org);
  const base = NAV.filter(
    (n) => isAdmin || isAgrofeed || !n.restricted || (isPartner && "partner" in n && n.partner),
  );

  const items = isAdmin
    ? [...base, { to: "/users", label: "User Roles", icon: ShieldCheck } as const]
    : base;
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="h-16 flex items-center px-5 border-b border-sidebar-border">
        <AgrofeedLogo />
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {items.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm ring-1 ring-sidebar-border" }}
          >
            <Icon className="h-4 w-4 shrink-0 opacity-80 group-hover:opacity-100" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
      <div className="border-t border-sidebar-border p-4 text-[11px] leading-relaxed text-sidebar-foreground/60">
        <span className="text-gold font-medium">Confidential.</span> Analytical tools only —
        not legal, financial, regulatory, or Sharia advice.
      </div>
    </aside>
  );
}
