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
  Inbox,
  BarChart3,
  Milestone,
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

/* ────────────────────── Skeleton Pulse ────────────────────── */
function Skeleton({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-secondary/70 ${className}`}
      style={style}
    />
  );
}

function KPISkeleton() {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
      <Skeleton className="h-7 w-16" />
      <Skeleton className="h-3 w-32" />
    </Card>
  );
}

function ChartSkeleton({ height = 260 }: { height?: number }) {
  return (
    <div className="w-full flex flex-col gap-3" style={{ height }}>
      <div className="flex items-end gap-2 flex-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t-md"
            style={{ height: `${30 + Math.random() * 60}%` }}
          />
        ))}
      </div>
      <Skeleton className="h-3 w-full" />
    </div>
  );
}

function MilestoneSkeleton() {
  return (
    <div className="py-3 flex items-center gap-3 animate-pulse">
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-2 w-32 rounded-full" />
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
  );
}

/* ────────────────────── Empty States ────────────────────── */
function EmptyState({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: any;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-2xl bg-secondary/50 p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground/60" />
      </div>
      <h4 className="text-sm font-medium text-muted-foreground mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground/70 max-w-[240px]">{subtitle}</p>
    </div>
  );
}

/* ────────────────────── KPI Card ────────────────────── */
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

/* ────────────────────── Dashboard ────────────────────── */
function Dashboard() {
  const { data: MILESTONES = [], isLoading: milestonesLoading } = useMilestones();
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { data: NOTIFICATIONS = [], isLoading: notificationsLoading } = useNotifications();
  const { data: GAP_ANALYSIS = [], isLoading: gapLoading } = useGapAnalysis();
  const { data: FINANCIALS, isLoading: financialsLoading } = useFinancials();

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
    expectedIssuance: null as string | null,
    overallCompletion: 0,
    investorPackage: 0,
    highComplianceCount: 0,
    medComplianceCount: 0,
    organisationCount: 0,
    structureStatus: null as string | null,
    needAttentionCount: 0,
  };

  // Filter readiness breakdown to only non-zero entries
  const visibleBreakdown = READINESS.breakdown.filter((r) => r.value > 0);
  const hasReadinessData = visibleBreakdown.length > 0 || READINESS.overall > 0;

  // Build KPI items conditionally — only include cards with meaningful values
  const kpiItems: { icon: any; label: string; value: string | number; tone?: any; sub?: string }[] = [];

  if (KPIS.totalDocuments > 0) {
    const subParts: string[] = [];
    if (KPIS.approved > 0) subParts.push(`${KPIS.approved} approved`);
    if (KPIS.pendingReview > 0) subParts.push(`${KPIS.pendingReview} in review`);
    kpiItems.push({
      icon: FileText,
      label: "Total Documents",
      value: KPIS.totalDocuments,
      sub: subParts.length > 0 ? subParts.join(" · ") : undefined,
    });
  }

  if (KPIS.missing > 0) {
    kpiItems.push({
      icon: AlertTriangle,
      label: "Missing Documents",
      tone: "warning",
      value: KPIS.missing,
      sub: "AI gap analysis",
    });
  }

  if (KPIS.overdueMilestones > 0) {
    kpiItems.push({
      icon: Flag,
      label: "Overdue Milestones",
      tone: "danger",
      value: KPIS.overdueMilestones,
      sub: `${KPIS.needAttentionCount} need${KPIS.needAttentionCount === 1 ? "s" : ""} attention`,
    });
  }

  if (KPIS.openCompliance > 0) {
    const compParts: string[] = [];
    if (KPIS.highComplianceCount > 0) compParts.push(`${KPIS.highComplianceCount} high`);
    if (KPIS.medComplianceCount > 0) compParts.push(`${KPIS.medComplianceCount} medium`);
    kpiItems.push({
      icon: ShieldAlert,
      label: "Open Compliance",
      tone: "warning",
      value: KPIS.openCompliance,
      sub: compParts.length > 0 ? compParts.join(", ") : undefined,
    });
  }

  if (KPIS.estimatedSizeUsdM > 0) {
    kpiItems.push({
      icon: Wallet,
      label: "Estimated Sukuk",
      tone: "gold",
      value: `$${KPIS.estimatedSizeUsdM}M`,
      sub: "USD, initial size",
    });
  }

  if (KPIS.expectedIssuance) {
    kpiItems.push({
      icon: Calendar,
      label: "Expected Issuance",
      value: KPIS.expectedIssuance,
      sub: KPIS.structureStatus ? KPIS.structureStatus.replace(/_/g, " ") : undefined,
    });
  }

  if (KPIS.activeUsers > 0) {
    kpiItems.push({
      icon: Users,
      label: "Active Users",
      value: KPIS.activeUsers,
      sub: KPIS.organisationCount > 0
        ? `across ${KPIS.organisationCount} organisation${KPIS.organisationCount !== 1 ? "s" : ""}`
        : undefined,
    });
  }

  if (KPIS.pendingApprovals > 0) {
    kpiItems.push({
      icon: CheckCircle2,
      label: "Pending Approvals",
      tone: "warning",
      value: KPIS.pendingApprovals,
      sub: "review queue",
    });
  }

  const hasKpis = kpiItems.length > 0;
  const hasRevenueChart = FINANCIALS && FINANCIALS.revenue.length > 0;
  const hasScenariosChart = FINANCIALS && FINANCIALS.scenarios.length > 0;
  const hasCharts = hasRevenueChart || hasScenariosChart;
  const hasMilestones = MILESTONES.length > 0;
  const hasGapAnalysis = GAP_ANALYSIS.length > 0;
  const hasNotifications = NOTIFICATIONS.length > 0;
  const hasBottomSection = hasMilestones || milestonesLoading || hasGapAnalysis || gapLoading || hasNotifications || notificationsLoading;

  return (
    <>
      <PageHeader
        title="Executive Dashboard"
        subtitle="Live Sukuk readiness, project health, and stakeholder activity."
        
      />

      {/* Readiness + KPIs */}
      {(metricsLoading || hasReadinessData || hasKpis) && (
        <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-5 mb-6">
          {/* Readiness Gauge */}
          {metricsLoading ? (
            <Card className="flex flex-col items-center py-8">
              <Skeleton className="h-[180px] w-[180px] rounded-full" />
              <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-2 w-full max-w-xs">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between gap-3">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                ))}
              </div>
            </Card>
          ) : hasReadinessData ? (
            <Card className="flex flex-col items-center py-8">
              <ReadinessGauge value={READINESS.overall} />
              {visibleBreakdown.length > 0 && (
                <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-2 w-full max-w-xs text-sm">
                  {visibleBreakdown.map((r) => (
                    <div key={r.key} className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground text-xs">{r.key}</span>
                      <span className="font-semibold text-xs tabular-nums">{r.value}%</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ) : null}

          {/* KPI Grid */}
          {metricsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <KPISkeleton key={i} />
              ))}
            </div>
          ) : hasKpis ? (
            <div className={`grid grid-cols-2 ${kpiItems.length > 4 ? "md:grid-cols-4" : kpiItems.length > 2 ? "md:grid-cols-3" : "md:grid-cols-2"} gap-4`}>
              {kpiItems.map((kpi) => (
                <KPI
                  key={kpi.label}
                  icon={kpi.icon}
                  label={kpi.label}
                  value={kpi.value}
                  tone={kpi.tone}
                  sub={kpi.sub}
                />
              ))}
            </div>
          ) : null}
        </div>
      )}

      {/* Charts row — only show when financial data exists */}
      {(financialsLoading || hasCharts) && (
        <div className={`grid grid-cols-1 ${hasRevenueChart && hasScenariosChart ? "lg:grid-cols-3" : ""} gap-5 mb-6`}>
          {/* Revenue & EBITDA */}
          {financialsLoading ? (
            <Card className="lg:col-span-2">
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-4 w-4" />
              </div>
              <ChartSkeleton />
            </Card>
          ) : hasRevenueChart ? (
            <Card className={hasScenariosChart ? "lg:col-span-2" : ""}>
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <h3 className="font-semibold">Revenue & EBITDA (USD M)</h3>
                  <p className="text-xs text-muted-foreground">Base case, {FINANCIALS!.revenue[0]?.year} – {FINANCIALS!.revenue[FINANCIALS!.revenue.length - 1]?.year}</p>
                </div>
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={FINANCIALS!.revenue.map((r, i) => ({ ...r, ebitda: FINANCIALS!.ebitda[i]?.value || 0 }))}>
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
            </Card>
          ) : null}

          {/* Scenario DSCR */}
          {financialsLoading ? (
            <Card>
              <div className="flex items-baseline justify-between mb-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <ChartSkeleton />
            </Card>
          ) : hasScenariosChart ? (
            <Card>
              <div className="flex items-baseline justify-between mb-4">
                <h3 className="font-semibold">Scenario DSCR</h3>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Debt service cover</span>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={FINANCIALS!.scenarios} layout="vertical" margin={{ left: 10 }}>
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
            </Card>
          ) : null}
        </div>
      )}

      {/* Milestones + notifications + gap analysis */}
      {hasBottomSection && (
        <div className={`grid grid-cols-1 ${(hasGapAnalysis || gapLoading || hasNotifications || notificationsLoading) ? "lg:grid-cols-3" : ""} gap-5`}>
          {/* Milestones */}
          {milestonesLoading ? (
            <Card className="lg:col-span-2">
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
              <div className="divide-y">
                {Array.from({ length: 5 }).map((_, i) => (
                  <MilestoneSkeleton key={i} />
                ))}
              </div>
            </Card>
          ) : hasMilestones ? (
            <Card className={(hasGapAnalysis || hasNotifications) ? "lg:col-span-2" : ""}>
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <h3 className="font-semibold">Upcoming Milestones</h3>
                  <p className="text-xs text-muted-foreground">Critical path to issuance</p>
                </div>
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
          ) : (
            <Card className="lg:col-span-2">
              <EmptyState
                icon={Milestone}
                title="No milestones yet"
                subtitle="Create milestones to track your Sukuk issuance progress and critical path."
              />
            </Card>
          )}

          {/* Gap Analysis + Notifications sidebar */}
          {(hasGapAnalysis || gapLoading || hasNotifications || notificationsLoading) && (
            <Card>
              {/* Gap Analysis */}
              {gapLoading ? (
                <>
                  <div className="flex items-baseline justify-between mb-4">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-10 rounded-full" />
                  </div>
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-start gap-2 animate-pulse">
                        <Skeleton className="h-4 w-4 rounded-full shrink-0 mt-0.5" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : hasGapAnalysis ? (
                <>
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
                </>
              ) : null}

              {/* Notifications / Recent Activity */}
              {notificationsLoading ? (
                <div className={hasGapAnalysis || gapLoading ? "mt-5 pt-4 border-t" : ""}>
                  <Skeleton className="h-3 w-24 mb-3" />
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="space-y-1 animate-pulse">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-2 w-12" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : hasNotifications ? (
                <div className={hasGapAnalysis ? "mt-5 pt-4 border-t" : ""}>
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
              ) : null}

              {/* If gap analysis is empty but notifications has data (or vice versa), show empty state for gap */}
              {!gapLoading && !hasGapAnalysis && !notificationsLoading && !hasNotifications && (
                <EmptyState
                  icon={Inbox}
                  title="No gaps detected"
                  subtitle="AI compliance analysis will appear here when items are flagged."
                />
              )}
            </Card>
          )}
        </div>
      )}

      {/* Fully empty dashboard state */}
      {!metricsLoading && !financialsLoading && !milestonesLoading && !gapLoading && !notificationsLoading &&
        !hasReadinessData && !hasKpis && !hasCharts && !hasMilestones && !hasGapAnalysis && !hasNotifications && (
        <Card className="mt-2">
          <EmptyState
            icon={BarChart3}
            title="Your dashboard is empty"
            subtitle="Start by uploading documents, creating milestones, or adding compliance items to see your Sukuk readiness metrics here."
          />
        </Card>
      )}
    </>
  );
}
