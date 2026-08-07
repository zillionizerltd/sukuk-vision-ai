import { supabase } from "@/integrations/supabase/client";

/**
 * Records a user action in the immutable audit trail.
 *
 * Database writes (create / update / delete on documents, tasks, milestones,
 * risks, compliance, financials, structures, reports, stakeholders,
 * organisations, folder access, comments, profiles, roles) are logged
 * automatically by database triggers. Use this helper for actions that leave
 * no row behind: sign-in, sign-out, previews, downloads, exports, AI queries.
 */
export async function logAudit(
  action: string,
  opts: {
    target?: string | null;
    targetType?: string | null;
    details?: Record<string, unknown> | null;
  } = {},
): Promise<void> {
  try {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return;

    let actorName = (user.user_metadata?.["full_name"] as string | undefined) ?? null;
    if (!actorName) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();
      actorName = profile?.full_name ?? user.email ?? null;
    }

    await supabase.from("audit_log").insert({
      actor_id: user.id,
      actor_name: actorName ?? "System",
      action,
      target: opts.target ?? null,
      target_type: opts.targetType ?? null,
      details: (opts.details ?? null) as never,
    });
  } catch (err) {
    // Auditing must never break a user flow.
    console.warn("[audit] failed to record action", action, err);
  }
}
