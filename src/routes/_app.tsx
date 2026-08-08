import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/use-auth";
import { AdvisorProvider } from "@/components/advisor/AdvisorProvider";
import { ForcePasswordResetModal } from "@/components/auth/ForcePasswordResetModal";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

// Maps each protected path prefix to the roles that may access it.
// Paths not listed here are accessible to all authenticated users.
const ROUTE_ROLES: Record<string, string[]> = {
  "/dashboard": ["admin", "advisor", "auditor", "investor", "member"],
  "/structuring": ["admin", "advisor"],
  "/compliance": ["admin", "advisor", "auditor"],
  "/risks": ["admin", "advisor", "auditor"],
  "/financials": ["admin", "advisor", "auditor", "investor"],
  "/reports": ["admin", "advisor", "auditor", "investor"],
  "/milestones": ["admin", "advisor", "auditor", "investor", "member"],
  "/tasks": ["admin", "advisor", "auditor", "investor", "member"],
  "/stakeholders": ["admin", "advisor"],
  "/audit-trail": ["admin", "auditor"],
  "/settings": ["admin"],
  "/users": ["admin"],
};

function AppLayout() {
  const { roles, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    // Effective roles: if no roles assigned yet, treat as member
    const effectiveRoles = roles.length > 0 ? roles : ["member"];

    // Find the most-specific matching prefix for the current path
    const matchedEntry = Object.entries(ROUTE_ROLES).find(([prefix]) =>
      location.pathname.startsWith(prefix),
    );

    if (!matchedEntry) return; // route is open to all authenticated users

    const [, allowedRoles] = matchedEntry;
    const hasAccess = allowedRoles.some((r) => effectiveRoles.includes(r));

    if (!hasAccess) {
      navigate({ to: "/documents", replace: true });
    }
  }, [roles, loading, location.pathname, navigate]);

  return (
    <AdvisorProvider>
      <div className="min-h-screen flex bg-secondary/30">
        <ForcePasswordResetModal />
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 min-w-0">
            <div className="px-4 lg:px-8 py-6 lg:py-8 max-w-[1600px] mx-auto">
              <Outlet />
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </AdvisorProvider>
  );
}
