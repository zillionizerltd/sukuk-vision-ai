import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type NewMilestone = {
  title: string;
  code?: string;
  phase?: string;
  owner_org: string;
  due_date: string | null;
  status: string;
  progress: number;
  critical_path?: boolean;
};

export function useCreateMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (m: NewMilestone) => {
      const title = m.title.trim();
      if (!title) throw new Error("Title is required");
      
      const { error } = await supabase.from("milestones").insert({
        title,
        code: m.code || null,
        phase: m.phase || null,
        owner_org: m.owner_org || null,
        due_date: m.due_date || null,
        status: m.status,
        progress: m.progress,
        critical_path: m.critical_path ?? false,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["milestones"] }),
  });
}
