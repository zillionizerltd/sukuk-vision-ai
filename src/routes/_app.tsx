import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/use-auth";
import { useOrganisations, hasPartnerAccess } from "@/hooks/use-organisations";
import { AdvisorProvider } from "@/components/advisor/AdvisorProvider";


export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const AGROFEED_ONLY = [
  "/dashboard", "/milestones", "/tasks", "/structuring", "/compliance",
  "/risks", "/financials", "/reports", "/stakeholders", "/audit-trail",
];


const PARTNER_ALLOWED = ["/milestones", "/tasks"];

function AppLayout() {
  const { profile, loading, isAdmin } = useAuth();
  const { data: orgs } = useOrganisations();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !profile || !orgs) return;
    const org = (profile.org ?? "").toLowerCase();
    const isAgrofeed = org === "agrofeed global";
    const isPartner = hasPartnerAccess(orgs, profile.org);
    if (isAdmin || isAgrofeed) return;

    const blocked = AGROFEED_ONLY.filter(
      (p) => !(isPartner && PARTNER_ALLOWED.includes(p)),
    );
    if (blocked.some((p) => location.pathname.startsWith(p))) {
      navigate({ to: "/documents", replace: true });
    }
  }, [profile, loading, isAdmin, orgs, location.pathname, navigate]);

  return (
    <AdvisorProvider>
      <div className="min-h-screen flex bg-secondary/30">
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
