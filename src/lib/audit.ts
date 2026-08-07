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
    // Actor identity (id + display name) is resolved server-side by the
    // security-definer routine; clients cannot forge or attribute entries.
    await supabase.rpc("record_audit_event", {
      p_action: action,
      p_target: opts.target ?? null,
      p_target_type: opts.targetType ?? null,
      p_details: (opts.details ?? null) as never,
    });

  } catch (err) {
    // Auditing must never break a user flow.
    console.warn("[audit] failed to record action", action, err);
  }
}
