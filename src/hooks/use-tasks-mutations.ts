import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type NewTask = {
  title: string;
  org: string;
  assignee: string;
  due_date: string | null;
  priority: string;
  status: string;
};

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (t: NewTask) => {
      const title = t.title.trim();
      if (!title) throw new Error("Title is required");
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase.from("tasks").insert({
        title,
        created_by: auth.user?.id ?? null,
        org: t.org || null,
        assignee: t.assignee || null,
        due_date: t.due_date || null,
        priority: t.priority,
        status: t.status,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useUpdateTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; status: string }) => {
      const { error } = await supabase.from("tasks").update({ status: vars.status }).eq("id", vars.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useUpdateTaskDueDate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; due_date: string | null }) => {
      const { error } = await supabase
        .from("tasks")
        .update({ due_date: vars.due_date || null })
        .eq("id", vars.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}
