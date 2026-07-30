import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type FolderAccessRow = { id: string; org: string; folder: string };

export function useFolderAccess() {
  return useQuery({
    queryKey: ["folder-access"],
    queryFn: async (): Promise<FolderAccessRow[]> => {
      const { data, error } = await supabase
        .from("folder_access")
        .select("id, org, folder")
        .order("org");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useToggleFolderAccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      org,
      folder,
      granted,
    }: {
      org: string;
      folder: string;
      granted: boolean;
    }) => {
      const { error } = granted
        ? await supabase.from("folder_access").delete().eq("org", org).eq("folder", folder)
        : await supabase.from("folder_access").insert({ org, folder });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["folder-access"] });
      qc.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

/** Folders an org may see. Empty grant set = all folders (default open). */
export function allowedFolders(
  rows: FolderAccessRow[] | undefined,
  org: string | null | undefined,
  allFolders: readonly string[],
): string[] {
  const o = (org ?? "").toLowerCase();
  if (o === "agrofeed global") return [...allFolders];
  const mine = (rows ?? []).filter((r) => r.org.toLowerCase() === o).map((r) => r.folder);
  return mine.length === 0 ? [...allFolders] : mine;
}
