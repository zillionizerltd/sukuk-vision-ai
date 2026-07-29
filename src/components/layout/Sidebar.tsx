import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard, FolderOpen, Flag, ListChecks, Layers, ShieldCheck,
  AlertTriangle, LineChart, FileText, Sparkles, Users, Settings, History,
} from "lucide-react";
import { AgrofeedLogo } from "../brand/Logo";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/documents", label: "Data Room", icon: FolderOpen },
  { to: "/milestones", label: "Milestones", icon: Flag },
  { to: "/tasks", label: "Tasks", icon: ListChecks },
  { to: "/structuring", label: "Sukuk Structuring", icon: Layers },
  { to: "/compliance", label: "Compliance", icon: ShieldCheck },
  { to: "/risks", label: "Risks", icon: AlertTriangle },
  { to: "/financials", label: "Financials", icon: LineChart },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/ai-advisor", label: "AI Advisor", icon: Sparkles },
  { to: "/stakeholders", label: "Stakeholders", icon: Users },
  { to: "/audit-trail", label: "Audit Trail", icon: History },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function Sidebar() {
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="h-16 flex items-center px-5 border-b border-sidebar-border">
        <AgrofeedLogo />
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {NAV.map(({ to, label, icon: Icon }) => (
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
