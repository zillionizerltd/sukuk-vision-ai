import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type NewRisk = {
  title: string;
  category: string;
  likelihood: number;
  impact: number;
  mitigation?: string;
  owner_org: string;
  status: string;
};

export function useCreateRisk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (r: NewRisk) => {
      const title = r.title.trim();
      if (!title) throw new Error("Title is required");

      const { error } = await supabase.from("risks").insert({
        title,
        category: r.category || null,
        likelihood: r.likelihood,
        impact: r.impact,
        mitigation: r.mitigation || null,
        owner_org: r.owner_org || null,
        status: r.status,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["risks"] }),
  });
}
