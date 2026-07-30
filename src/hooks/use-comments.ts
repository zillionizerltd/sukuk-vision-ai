import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ItemType = "milestone" | "task" | "document";

export type CommentRow = {
  id: string;
  body: string;
  author_id: string;
  author_name: string;
  author_org: string;
  created_at: string;
};

export function useComments(itemType: ItemType, itemId?: string) {
  return useQuery({
    enabled: !!itemId,
    queryKey: ["item_comments", itemType, itemId],
    queryFn: async (): Promise<CommentRow[]> => {
      const { data, error } = await supabase
        .from("item_comments")
        .select("id, body, author_id, author_name, author_org, created_at")
        .eq("item_type", itemType)
        .eq("item_id", itemId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((c) => ({
        id: c.id,
        body: c.body,
        author_id: c.author_id,
        author_name: c.author_name ?? "Member",
        author_org: c.author_org ?? "",
        created_at: (c.created_at ?? "").replace("T", " ").slice(0, 16),
      }));
    },
  });
}

export function useCommentCounts(itemType: ItemType) {
  return useQuery({
    queryKey: ["item_comment_counts", itemType],
    queryFn: async (): Promise<Record<string, number>> => {
      const { data, error } = await supabase
        .from("item_comments")
        .select("item_id")
        .eq("item_type", itemType);
      if (error) throw error;
      const counts: Record<string, number> = {};
      for (const r of data ?? []) counts[r.item_id] = (counts[r.item_id] ?? 0) + 1;
      return counts;
    },
  });
}

export function useAddComment(itemType: ItemType, itemId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { body: string; authorId: string; authorName: string; authorOrg: string }) => {
      const body = vars.body.trim();
      if (!body) throw new Error("Comment cannot be empty");
      if (body.length > 2000) throw new Error("Comment must be under 2000 characters");
      const { error } = await supabase.from("item_comments").insert({
        item_type: itemType,
        item_id: itemId!,
        body,
        author_id: vars.authorId,
        author_name: vars.authorName,
        author_org: vars.authorOrg,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["item_comments", itemType, itemId] });
      qc.invalidateQueries({ queryKey: ["item_comment_counts", itemType] });
    },
  });
}

export function useDeleteComment(itemType: ItemType, itemId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("item_comments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["item_comments", itemType, itemId] });
      qc.invalidateQueries({ queryKey: ["item_comment_counts", itemType] });
    },
  });
}
