import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Organisation = {
  id: string;
  name: string;
  slug: string;
  partner_access: boolean;
  is_protected: boolean;
};

/** Fallback used only if the list hasn't loaded yet. */
export const FALLBACK_ORGS = ["Agrofeed Global"];

export function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function useOrganisations() {
  return useQuery({
    queryKey: ["organisations"],
    queryFn: async (): Promise<Organisation[]> => {
      const { data, error } = await supabase
        .from("organisations")
        .select("id, name, slug, partner_access, is_protected")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** Org names for dropdowns, always non-empty. */
export function useOrgNames() {
  const { data } = useOrganisations();
  const names = (data ?? []).map((o) => o.name);
  return names.length ? names : FALLBACK_ORGS;
}

/** True when the org may access Milestones & Tasks. */
export function hasPartnerAccess(
  orgs: Organisation[] | undefined,
  org: string | null | undefined,
) {
  const o = (org ?? "").toLowerCase().trim();
  if (!o) return false;
  return (orgs ?? []).some((r) => r.name.toLowerCase() === o && r.partner_access);
}

export function useCreateOrganisation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, partner_access }: { name: string; partner_access: boolean }) => {
      const clean = name.trim();
      if (!clean) throw new Error("Organisation name is required.");
      const { error } = await supabase
        .from("organisations")
        .insert({ name: clean, slug: slugify(clean), partner_access });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["organisations"] }),
  });
}

export function useUpdateOrganisation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      partner_access,
    }: {
      id: string;
      name?: string;
      partner_access?: boolean;
    }) => {
      const patch: Record<string, unknown> = {};
      if (typeof name === "string") {
        const clean = name.trim();
        if (!clean) throw new Error("Organisation name is required.");
        patch.name = clean;
        patch.slug = slugify(clean);
      }
      if (typeof partner_access === "boolean") patch.partner_access = partner_access;
      const { error } = await supabase.from("organisations").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["organisations"] }),
  });
}

export function useDeleteOrganisation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { count, error: countErr } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .ilike("org", name);
      if (countErr) throw countErr;
      if ((count ?? 0) > 0) {
        throw new Error(
          `${name} still has ${count} member${count === 1 ? "" : "s"} assigned — reassign them first.`,
        );
      }
      const { error } = await supabase.from("organisations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organisations"] });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}
