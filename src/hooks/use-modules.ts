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
export function useReports() {
  return useQuery({
    queryKey: ["reports"],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase.from("reports").select("name").order("name");
      if (error) throw error;
      return (data ?? []).map((r) => r.name);
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
