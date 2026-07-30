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
      const { error } = await supabase.from("tasks").insert({
        title,
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
