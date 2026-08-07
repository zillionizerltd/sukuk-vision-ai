import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard, FolderOpen, Flag, ListChecks, Layers, ShieldCheck,
  AlertTriangle, LineChart, FileText, Sparkles, Users, Settings, History,
  UserCog,
} from "lucide-react";
import { AgrofeedLogo } from "../brand/Logo";
import { useAuth } from "@/hooks/use-auth";
import { useAdvisor } from "@/components/advisor/AdvisorProvider";

// Each nav item declares which roles can see it.
// "all" means every authenticated user, regardless of role.
type NavRole = "admin" | "advisor" | "auditor" | "investor" | "member" | "all";

type NavItem = {
  to: string;
  label: string;
  icon: React.ElementType;
  roles: NavRole[];
  advisor?: true;
};

const NAV: NavItem[] = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "advisor", "auditor", "investor", "member"],
  },
  {
    to: "/documents",
    label: "Data Room",
    icon: FolderOpen,
    roles: ["all"],
  },
  {
    to: "/milestones",
    label: "Milestones",
    icon: Flag,
    roles: ["admin", "advisor", "auditor", "investor", "member"],
  },
  {
    to: "/tasks",
    label: "Tasks",
    icon: ListChecks,
    roles: ["admin", "advisor", "auditor", "investor", "member"],
  },
  {
    to: "/structuring",
    label: "Sukuk Structuring",
    icon: Layers,
    roles: ["admin", "advisor"],
  },
  {
    to: "/compliance",
    label: "Compliance",
    icon: ShieldCheck,
    roles: ["admin", "advisor", "auditor"],
  },
  {
    to: "/risks",
    label: "Risks",
    icon: AlertTriangle,
    roles: ["admin", "advisor", "auditor"],
  },
  {
    to: "/financials",
    label: "Financials",
    icon: LineChart,
    roles: ["admin", "advisor", "auditor", "investor"],
  },
  {
    to: "/reports",
    label: "Reports",
    icon: FileText,
    roles: ["admin", "advisor", "auditor", "investor"],
  },
  {
    to: "/ai-advisor",
    label: "AI Advisor",
    icon: Sparkles,
    roles: ["all"],
    advisor: true,
  },
  {
    to: "/stakeholders",
    label: "Stakeholders",
    icon: Users,
    roles: ["admin", "advisor"],
  },
  {
    to: "/audit-trail",
    label: "Audit Trail",
    icon: History,
    roles: ["admin", "auditor"],
  },
  {
    to: "/settings",
    label: "Settings",
    icon: Settings,
    roles: ["admin"],
  },
  {
    to: "/users",
    label: "User Management",
    icon: UserCog,
    roles: ["admin"],
  },
  {
    to: "/profile",
    label: "Profile",
    icon: Users,
    roles: ["all"],
  },
];

function canSee(item: NavItem, userRoles: string[]): boolean {
  if (item.roles.includes("all")) return true;
  return item.roles.some((r) => userRoles.includes(r));
}

export function Sidebar() {
  const { roles } = useAuth();
  const advisor = useAdvisor();

  // If user has no explicit roles yet, treat as "member"
  const effectiveRoles = roles.length > 0 ? roles : ["member"];
  const items = NAV.filter((item) => canSee(item, effectiveRoles));

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="h-16 flex items-center px-5 border-b border-sidebar-border">
        <AgrofeedLogo />
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {items.map((item) => {
          const { to, label, icon: Icon } = item;
          const cls =
            "group w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors";
          if (item.advisor) {
            return (
              <button key={to} onClick={() => advisor.open()} className={cls}>
                <Icon className="h-4 w-4 shrink-0 opacity-80 group-hover:opacity-100" />
                <span>{label}</span>
              </button>
            );
          }
          return (
            <Link
              key={to}
              to={to}
              className={cls}
              activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm ring-1 ring-sidebar-border" }}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-80 group-hover:opacity-100" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-4 text-[11px] leading-relaxed text-sidebar-foreground/60">
        <span className="text-gold font-medium">Confidential.</span> Analytical tools only —
        not legal, financial, regulatory, or Sharia advice.
      </div>
    </aside>
  );
}
