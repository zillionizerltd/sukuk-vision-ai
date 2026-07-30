import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type TaskAction = {
  kind: "task";
  title: string;
  org: string;
  assignee: string;
  due_date: string;
  priority: string;
  rationale: string;
};

export type DocumentRequestAction = {
  kind: "document_request";
  document_name: string;
  folder: string;
  org: string;
  due_date: string;
  reason: string;
};

export type ApprovalAction = {
  kind: "approval";
  framework: string;
  requirement: string;
  severity: string;
  owner_org: string;
  notes: string;
};

export type AdvisorAction = TaskAction | DocumentRequestAction | ApprovalAction;

const date = (v: string | undefined) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);

export function useApplyAdvisorAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (action: AdvisorAction) => {
      if (action.kind === "task") {
        const { error } = await supabase.from("tasks").insert({
          title: action.title.trim(),
          description: action.rationale || null,
          org: action.org || null,
          assignee: action.assignee || null,
          due_date: date(action.due_date),
          priority: action.priority || "Medium",
          status: "not_started",
        });
        if (error) throw error;
        return { label: "Task created", link: "/tasks" };
      }

      if (action.kind === "document_request") {
        const { error } = await supabase.from("tasks").insert({
          title: `Document request: ${action.document_name}`.trim(),
          description: `${action.reason}${action.folder ? `\nTarget folder: ${action.folder}` : ""}`,
          org: action.org || null,
          assignee: action.org || null,
          due_date: date(action.due_date),
          priority: "High",
          status: "not_started",
        });
        if (error) throw error;
        return { label: "Document request raised", link: "/tasks" };
      }

      const { error } = await supabase.from("compliance_items").insert({
        framework: action.framework || "Internal",
        requirement: action.requirement.trim(),
        severity: action.severity || "medium",
        owner_org: action.owner_org || null,
        notes: action.notes || null,
        status: "open",
      });
      if (error) throw error;
      return { label: "Approval item filed", link: "/compliance" };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["compliance"] });
    },
  });
}
