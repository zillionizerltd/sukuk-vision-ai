import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ---------- Documents ----------
export type DocumentRow = {
  id: string;
  name: string;
  folder: string;
  owner: string;
  version: string;
  status: string;
  confidentiality: string;
  updated: string;
};

export function useDocuments() {
  return useQuery({
    queryKey: ["documents"],
    queryFn: async (): Promise<DocumentRow[]> => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((d) => ({
        id: d.id,
        name: d.name,
        folder: d.folder ?? "/",
        owner: "Agrofeed",
        version: "v1",
        status: d.status ?? "draft",
        confidentiality: d.confidentiality ?? "confidential",
        updated: (d.updated_at ?? d.created_at ?? "").slice(0, 10),
      }));
    },
  });
}

// ---------- Milestones ----------
export type MilestoneRow = {
  id: string;
  uuid: string;
  name: string;
  owner: string;
  due: string;
  status: string;
  progress: number;
};
export function useMilestones() {
  return useQuery({
    queryKey: ["milestones"],
    queryFn: async (): Promise<MilestoneRow[]> => {
      const { data, error } = await supabase
        .from("milestones")
        .select("*")
        .order("due_date", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((m) => ({
        id: m.code ?? m.id.slice(0, 6),
        uuid: m.id,
        name: m.title,
        owner: m.owner_org ?? "",
        due: m.due_date ?? "",
        status: m.status,
        progress: m.progress ?? 0,
      }));
    },
  });
}


// ---------- Tasks ----------
export type TaskRow = {
  id: string;
  title: string;
  org: string;
  assignee: string;
  due: string;
  priority: string;
  status: string;
  created_by: string | null;
};
export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async (): Promise<TaskRow[]> => {
      const { data, error } = await supabase.from("tasks").select("*").order("due_date");
      if (error) throw error;
      return (data ?? []).map((t) => ({
        id: t.id,
        title: t.title,
        org: t.org ?? "",
        assignee: t.assignee ?? "",
        due: t.due_date ?? "",
        priority: t.priority,
        status: t.status,
        created_by: t.created_by ?? null,
      }));
    },
  });
}

// ---------- Structures ----------
export type StructureRow = {
  name: string;
  suitability: number;
  confidence: number;
  note: string;
};
export function useStructures() {
  return useQuery({
    queryKey: ["structures"],
    queryFn: async (): Promise<StructureRow[]> => {
      const { data, error } = await supabase
        .from("sukuk_structures")
        .select("*")
        .order("score", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((s) => ({
        name: s.name,
        suitability: s.score ?? 0,
        confidence: Math.max(50, (s.score ?? 0) - 6),
        note: s.notes ?? "",
      }));
    },
  });
}

// ---------- Compliance ----------
export type ComplianceRow = {
  id: string;
  req: string;
  source: string;
  status: string;
  owner: string;
  risk: string;
};
export function useCompliance() {
  return useQuery({
    queryKey: ["compliance"],
    queryFn: async (): Promise<ComplianceRow[]> => {
      const { data, error } = await supabase.from("compliance_items").select("*");
      if (error) throw error;
      const mapStatus = (s: string) =>
        s === "open" ? "gap" : s === "in_review" ? "in_progress" : s === "completed" ? "complete" : s;
      const mapRisk = (sev: string) =>
        sev === "high" ? "High" : sev === "medium" ? "Medium" : "Low";
      return (data ?? []).map((c) => ({
        id: c.id.slice(0, 6),
        req: c.requirement,
        source: c.framework,
        status: mapStatus(c.status),
        owner: c.owner_org ?? "",
        risk: mapRisk(c.severity),
      }));
    },
  });
}

// ---------- Risks ----------
export type RiskRow = {
  id: string;
  title: string;
  category: string;
  probability: "Low" | "Medium" | "High";
  impact: "Low" | "Medium" | "High";
  rating: "Low" | "Medium" | "High";
  owner: string;
};
export function useRisks() {
  return useQuery({
    queryKey: ["risks"],
    queryFn: async (): Promise<RiskRow[]> => {
      const { data, error } = await supabase.from("risks").select("*");
      if (error) throw error;
      const bucket = (n: number): "Low" | "Medium" | "High" =>
        n >= 4 ? "High" : n >= 3 ? "Medium" : "Low";
      const rating = (l: number, i: number): "Low" | "Medium" | "High" => {
        const s = l * i;
        return s >= 12 ? "High" : s >= 6 ? "Medium" : "Low";
      };
      return (data ?? []).map((r) => ({
        id: r.id.slice(0, 6),
        title: r.title,
        category: r.category ?? "",
        probability: bucket(r.likelihood ?? 3),
        impact: bucket(r.impact ?? 3),
        rating: rating(r.likelihood ?? 3, r.impact ?? 3),
        owner: r.owner_org ?? "",
      }));
    },
  });
}

// ---------- Stakeholders ----------
export type StakeholderRow = {
  org: string;
  role: string;
  pending: number;
  completed: number;
  users: number;
};
export function useStakeholders() {
  return useQuery({
    queryKey: ["stakeholders"],
    queryFn: async (): Promise<StakeholderRow[]> => {
      const { data, error } = await supabase.from("stakeholders").select("*");
      if (error) throw error;
      return (data ?? []).map((s) => ({
        org: s.org,
        role: s.role ?? "",
        pending: s.pending ?? 0,
        completed: s.completed ?? 0,
        users: s.users_count ?? 0,
      }));
    },
  });
}

// ---------- Reports ----------
export type ReportRow = {
  id: string;
  name: string;
  file_url: string | null;
  status: string;
};

export function useReports() {
  return useQuery({
    queryKey: ["reports"],
    queryFn: async (): Promise<ReportRow[]> => {
      const { data, error } = await supabase.from("reports").select("*").order("name");
      if (error) throw error;
      return (data ?? []).map((r) => ({
        id: r.id,
        name: r.name,
        file_url: r.file_url,
        status: r.status,
      }));
    },
  });
}

// ---------- Audit ----------
export type AuditRow = {
  id: string;
  at: string;
  user: string;
  action: string;
  target: string;
};
export function useAudit() {
  return useQuery({
    queryKey: ["audit_log"],
    queryFn: async (): Promise<AuditRow[]> => {
      const { data, error } = await supabase
        .from("audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []).map((a) => ({
        id: a.id,
        at: (a.created_at ?? "").replace("T", " ").slice(0, 16),
        user: a.actor_name ?? "System",
        action: a.action,
        target: a.target ?? "",
      }));
    },
  });
}

// ---------- Financial metrics ----------
export type FinancialMetricRow = {
  metric: string;
  category: string | null;
  period: string | null;
  value: number | null;
  currency: string | null;
};
export function useFinancialMetrics() {
  return useQuery({
    queryKey: ["financial_metrics"],
    queryFn: async (): Promise<FinancialMetricRow[]> => {
      const { data, error } = await supabase.from("financial_metrics").select("*");
      if (error) throw error;
      return (data ?? []).map((m) => ({
        metric: m.metric,
        category: m.category,
        period: m.period,
        value: m.value !== null ? Number(m.value) : null,
        currency: m.currency,
      }));
    },
  });
}

// ---------- Dashboard Metrics ----------
export function useDashboardMetrics() {
  return useQuery({
    queryKey: ["dashboard_metrics"],
    queryFn: async () => {
      const [
        { data: documents },
        { data: milestones },
        { data: compliance },
        { data: risks },
        { data: stakeholders },
        { data: structures }
      ] = await Promise.all([
        supabase.from("documents").select("status, folder"),
        supabase.from("milestones").select("status, due_date, progress, phase"),
        supabase.from("compliance_items").select("status"),
        supabase.from("risks").select("impact, likelihood"),
        supabase.from("stakeholders").select("pending, completed, users_count"),
        supabase.from("sukuk_structures").select("size_musd, tenor_years, status, name")
      ]);

      const now = new Date();
      const overdueMilestones = (milestones ?? []).filter(
        (m) => m.status !== "completed" && m.due_date && new Date(m.due_date) < now
      ).length;

      const highRisk = (risks ?? []).filter((r) => {
        const s = (r.likelihood ?? 3) * (r.impact ?? 3);
        return s >= 12;
      }).length;

      const totalDocuments = documents?.length ?? 0;
      const approvedDocs = (documents ?? []).filter(d => d.status === "approved").length;
      const pendingReviewDocs = (documents ?? []).filter(d => d.status === "in_review" || d.status === "pending").length;
      const activeUsers = (stakeholders ?? []).reduce((acc, s) => acc + (s.users_count ?? 0), 0) || 1;

      // Readiness Breakdown calculation:
      const categories = [
        "Corporate", "Financial", "Legal", "Operational", "Sharia",
        "Regulatory", "ESG", "Documentation", "Investor", "SPV"
      ];

      const breakdown = categories.map(key => {
        const catDocs = (documents ?? []).filter(d => (d.folder || "").toLowerCase().includes(key.toLowerCase()));
        let val = 0;
        if (catDocs.length > 0) {
          val = Math.round((catDocs.filter(d => d.status === "approved").length / catDocs.length) * 100);
        } else {
          val = 0 + (key.length * 5) % 5 // pseudo-random fallback for empty categories
        }
        return { key, value: val };
      });

      const overallReadiness = Math.round(breakdown.reduce((acc, curr) => acc + curr.value, 0) / categories.length);
      return {
        readiness: {
          overall: overallReadiness,
          breakdown,
        },
        kpis: {
          totalDocuments,
          pendingReview: pendingReviewDocs,
          approved: approvedDocs,
          missing: 0,
          overdueMilestones,
          openCompliance: (compliance ?? []).filter(c => c.status !== "completed").length,
          highRisk,
          pendingApprovals: pendingReviewDocs,
          activeUsers,
          estimatedSizeUsdM: structures?.[0]?.size_musd ?? 0,
          expectedIssuance: structures?.[0]?.tenor_years ? `${structures[0].tenor_years}yr tenor` : "—",
          overallCompletion: Math.round(
            (milestones ?? []).filter(m => m.status === "completed").length /
            Math.max((milestones ?? []).length, 1) * 100
          ),
          investorPackage: Math.round(
            (documents ?? []).filter(d => d.folder?.toLowerCase().includes("investor") && d.status === "approved").length /
            Math.max((documents ?? []).filter(d => d.folder?.toLowerCase().includes("investor")).length, 1) * 100
          ),
        }
      };
    },
  });
}

// ---------- Dynamic Folders ----------
export function useFolders() {
  return useQuery({
    queryKey: ["folders"],
    queryFn: async (): Promise<string[]> => {
      const [docsResp, accessResp] = await Promise.all([
        supabase.from("documents").select("folder"),
        supabase.from("folder_access").select("folder")
      ]);

      if (docsResp.error) throw docsResp.error;
      if (accessResp.error) throw accessResp.error;

      const folders = new Set([
        ...(docsResp.data ?? []).map(d => d.folder),
        ...(accessResp.data ?? []).map(d => d.folder)
      ].filter(Boolean));

      if (folders.size === 0) {
        return [
          "Corporate Documents", "Financial Statements", "Legal Documents",
          "Environmental Reports", "ESG Documents", "Sukuk Structure"
        ];
      }
      return Array.from(folders).sort();
    },
  });
}

// ---------- Notifications ----------
export type NotificationRow = {
  id: string;
  text: string;
  time: string;
  type: string;
};
export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async (): Promise<NotificationRow[]> => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;

      const timeAgo = (dateStr: string) => {
        const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 60000);
        if (diff < 60) return `${diff}m ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
        return `${Math.floor(diff / 1440)}d ago`;
      };

      return (data ?? []).map(n => ({
        id: n.id,
        text: n.title,
        time: timeAgo(n.created_at),
        type: (n.item_type ?? "info").toLowerCase()
      }));
    }
  });
}

// ---------- Gap Analysis ----------
export type GapAnalysisRow = {
  item: string;
  severity: string;
  owner: string;
};
export function useGapAnalysis() {
  return useQuery({
    queryKey: ["gap_analysis"],
    queryFn: async (): Promise<GapAnalysisRow[]> => {
      const { data, error } = await supabase
        .from("compliance_items")
        .select("*")
        .in("status", ["open", "gap"]);
      if (error) throw error;

      return (data ?? []).map(c => ({
        item: c.requirement,
        severity: c.severity === "high" ? "High" : c.severity === "medium" ? "Medium" : "Low",
        owner: c.owner_org ?? "Unknown"
      }));
    }
  });
}

// ---------- Financials ----------
export type FinancialsData = {
  revenue: { year: string; value: number }[];
  ebitda: { year: string; value: number }[];
  ratios: {
    dscr: number | null; icr: number | null; ltv: number | null; currentRatio: number | null; quickRatio: number | null;
    debtEquity: number | null; assetCoverage: number | null; irr: number | null; npvUsdM: number | null;
  };
  scenarios: { name: string; revenue: number; ebitda: number; dscr: number }[];
};

export function useFinancials() {
  return useQuery({
    queryKey: ["financials_aggregated"],
    queryFn: async (): Promise<FinancialsData> => {
      const { data, error } = await supabase.from("financial_metrics").select("*");
      if (error) throw error;

      const metrics = data ?? [];

      // Helper: find a single scalar ratio metric (category = 'ratio' or no period)
      const getVal = (metric: string): number | null => {
        const row = metrics.find(
          m => m.metric === metric && (m.category === "ratio" || (!m.category && !m.period))
        );
        return row?.value !== null && row?.value !== undefined ? Number(row.value) : null;
      };

      // Time-series rows (have a period, not a scenario)
      const revenue = metrics
        .filter(m => m.metric === "revenue" && m.period && m.category !== "scenario")
        .sort((a, b) => (a.period ?? "").localeCompare(b.period ?? ""))
        .map(m => ({ year: m.period ?? "", value: Number(m.value) }));

      const ebitda = metrics
        .filter(m => m.metric === "ebitda" && m.period && m.category !== "scenario")
        .sort((a, b) => (a.period ?? "").localeCompare(b.period ?? ""))
        .map(m => ({ year: m.period ?? "", value: Number(m.value) }));

      // Scenario rows: category = 'scenario', period = scenario name
      const scenarioNames = [...new Set(
        metrics.filter(m => m.category === "scenario").map(m => m.period ?? "")
      )].filter(Boolean);

      const scenarios = scenarioNames.map(name => ({
        name,
        revenue: Number(metrics.find(m => m.category === "scenario" && m.period === name && m.metric === "revenue")?.value ?? 0),
        ebitda: Number(metrics.find(m => m.category === "scenario" && m.period === name && m.metric === "ebitda")?.value ?? 0),
        dscr: Number(metrics.find(m => m.category === "scenario" && m.period === name && m.metric === "dscr")?.value ?? 0),
      }));

      return {
        revenue,
        ebitda,
        ratios: {
          dscr: getVal("dscr"),
          icr: getVal("icr"),
          ltv: getVal("ltv"),
          currentRatio: getVal("current_ratio"),
          quickRatio: getVal("quick_ratio"),
          debtEquity: getVal("debt_equity"),
          assetCoverage: getVal("asset_coverage"),
          irr: getVal("irr"),
          npvUsdM: getVal("npv"),
        },
        scenarios,
      };
    }
  });
}
