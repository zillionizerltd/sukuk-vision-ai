import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader, Pill, Button, ProgressBar } from "@/components/ui/primitives";
import { ReadinessGauge } from "@/components/dashboard/ReadinessGauge";
import {
  useMilestones,
  useDashboardMetrics,
  useNotifications,
  useGapAnalysis,
  useFinancials,
} from "@/hooks/use-modules";
import {
  ArrowUpRight,
  FileText,
  Flag,
  ShieldAlert,
  Users,
  Wallet,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Executive Dashboard · Agrofeed Sukuk Data Room" },
      { name: "description", content: "Sukuk readiness, milestones, compliance, risk, and financial overview." },
    ],
  }),
  component: Dashboard,
});

function KPI({
  icon: Icon,
  label,
  value,
  tone = "neutral",
  sub,
}: {
  icon: any;
  label: string;
  value: string | number;
  tone?: "success" | "warning" | "danger" | "neutral" | "gold";
  sub?: string;
}) {
  const toneMap: Record<string, string> = {
    success: "text-[color-mix(in_oklab,var(--success)_60%,black)]",
    warning: "text-[color-mix(in_oklab,var(--warning)_55%,black)]",
    danger: "text-destructive",
    gold: "text-[color-mix(in_oklab,var(--gold)_50%,black)]",
    neutral: "text-primary",
  };
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">{label}</span>
        <Icon className={`h-4 w-4 ${toneMap[tone]}`} />
      </div>
      <div className="text-2xl font-semibold tracking-tight">{value}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </Card>
  );
}

function Dashboard() {
  const { data: MILESTONES = [] } = useMilestones();
  const { data: metrics } = useDashboardMetrics();
  const { data: NOTIFICATIONS = [] } = useNotifications();
  const { data: GAP_ANALYSIS = [] } = useGapAnalysis();
  const { data: FINANCIALS } = useFinancials();

  const READINESS = metrics?.readiness || { overall: 0, breakdown: [] };
  const KPIS = metrics?.kpis || {
    totalDocuments: 0,
    pendingReview: 0,
    approved: 0,
    missing: 0,
    overdueMilestones: 0,
    openCompliance: 0,
    highRisk: 0,
    pendingApprovals: 0,
    activeUsers: 0,
    estimatedSizeUsdM: 0,
    expectedIssuance: "Q2 2026",
    overallCompletion: 0,
    investorPackage: 0,
  };

  return (
    <>
      <PageHeader
        title="Executive Dashboard"
        subtitle="Live Sukuk readiness, project health, and stakeholder activity."
        actions={
          <>
            <Button variant="secondary" size="sm">
              Export PDF
            </Button>
            <Button size="sm">
              <ArrowUpRight className="h-3.5 w-3.5" />
              Generate Board Report
            </Button>
          </>
        }
      />

      {/* Readiness + KPIs */}
      <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-5 mb-6">
        <Card className="flex flex-col items-center py-8">
          <ReadinessGauge value={READINESS.overall} />
          <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-2 w-full max-w-xs text-sm">
            {READINESS.breakdown.map((r) => (
              <div key={r.key} className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground text-xs">{r.key}</span>
                <span className="font-semibold text-xs tabular-nums">{r.value}%</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI
            icon={FileText}
            label="Total Documents"
            value={KPIS.totalDocuments}
            sub={`${KPIS.approved} approved · ${KPIS.pendingReview} in review`}
          />
          <KPI
            icon={AlertTriangle}
            label="Missing Documents"
            tone="warning"
            value={KPIS.missing}
            sub="AI gap analysis"
          />
          <KPI
            icon={Flag}
            label="Overdue Milestones"
            tone="danger"
            value={KPIS.overdueMilestones}
            sub="4 need attention"
          />
          <KPI
            icon={ShieldAlert}
            label="Open Compliance"
            tone="warning"
            value={KPIS.openCompliance}
            sub="4 high, 8 medium"
          />
          <KPI
            icon={Wallet}
            label="Estimated Sukuk"
            tone="gold"
            value={`$${KPIS.estimatedSizeUsdM}M`}
            sub="USD, initial size"
          />
          <KPI icon={Calendar} label="Expected Issuance" value={KPIS.expectedIssuance} sub="on-track scenario" />
          <KPI icon={Users} label="Active Users" value={KPIS.activeUsers} sub="across 5 organisations" />
          <KPI
            icon={CheckCircle2}
            label="Pending Approvals"
            tone="warning"
            value={KPIS.pendingApprovals}
            sub="review queue"
          />
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <Card className="lg:col-span-2">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <h3 className="font-semibold">Revenue & EBITDA (USD M)</h3>
              <p className="text-xs text-muted-foreground">Base case, 2022 – 2027F</p>
            </div>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          {FINANCIALS ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={FINANCIALS.revenue.map((r, i) => ({ ...r, ebitda: FINANCIALS.ebitda[i]?.value || 0 }))}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand-emerald)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--brand-emerald)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ebitdaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand-gold)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--brand-gold)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="value"
                  name="Revenue"
                  stroke="var(--brand-emerald)"
                  strokeWidth={2}
                  fill="url(#revGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="ebitda"
                  name="EBITDA"
                  stroke="var(--brand-gold)"
                  strokeWidth={2}
                  fill="url(#ebitdaGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-[260px] flex items-center justify-center text-muted-foreground text-sm">
              Loading...
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="font-semibold">Scenario DSCR</h3>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Debt service cover</span>
          </div>
          {FINANCIALS ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={FINANCIALS.scenarios} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={140} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="dscr" fill="var(--brand-emerald)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-[260px] flex items-center justify-center text-muted-foreground text-sm">
              Loading...
            </div>
          )}
        </Card>
      </div>

      {/* Milestones + notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <h3 className="font-semibold">Upcoming Milestones</h3>
              <p className="text-xs text-muted-foreground">Critical path to issuance</p>
            </div>
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </div>
          <div className="divide-y">
            {MILESTONES.slice(0, 7).map((m) => (
              <div key={m.id} className="py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{m.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {m.owner} · Due {m.due}
                  </div>
                </div>
                <div className="w-32">
                  <ProgressBar
                    value={m.progress}
                    tone={m.status === "overdue" ? "danger" : m.status === "in_progress" ? "gold" : "emerald"}
                  />
                  <div className="text-[10px] text-muted-foreground mt-1 text-right">{m.progress}%</div>
                </div>
                <Pill
                  tone={
                    m.status === "completed"
                      ? "success"
                      : m.status === "overdue"
                        ? "danger"
                        : m.status === "in_progress"
                          ? "warning"
                          : "neutral"
                  }
                >
                  {m.status.replace("_", " ")}
                </Pill>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="font-semibold">AI Gap Analysis</h3>
            <Pill tone="gold">Live</Pill>
          </div>
          <div className="space-y-3">
            {GAP_ANALYSIS.map((g) => (
              <div key={g.item} className="flex items-start gap-2">
                <AlertTriangle
                  className={`h-4 w-4 mt-0.5 shrink-0 ${g.severity === "High" ? "text-destructive" : "text-[color-mix(in_oklab,var(--warning)_50%,black)]"}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{g.item}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {g.severity} · {g.owner}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t">
            <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Recent activity</h4>
            <div className="space-y-2">
              {NOTIFICATIONS.slice(0, 4).map((n) => (
                <div key={n.id} className="text-xs">
                  <div className="text-foreground">{n.text}</div>
                  <div className="text-muted-foreground text-[10px]">{n.time}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
