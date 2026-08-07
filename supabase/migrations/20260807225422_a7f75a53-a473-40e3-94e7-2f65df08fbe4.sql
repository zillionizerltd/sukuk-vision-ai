-- Remove the spoofable direct-insert path on the audit log
DROP POLICY IF EXISTS audit_insert_auth ON public.audit_log;
REVOKE INSERT ON public.audit_log FROM authenticated;
REVOKE INSERT ON public.audit_log FROM anon;

-- Trusted entry point: actor identity is derived server-side, never client supplied
CREATE OR REPLACE FUNCTION public.record_audit_event(
  p_action text,
  p_target text DEFAULT NULL,
  p_target_type text DEFAULT NULL,
  p_details jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_name text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_action IS NULL OR length(btrim(p_action)) = 0 OR length(p_action) > 120 THEN
    RAISE EXCEPTION 'Invalid action';
  END IF;

  SELECT COALESCE(p.full_name, u.email)
    INTO v_name
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  WHERE u.id = v_uid;

  INSERT INTO public.audit_log (actor_id, actor_name, action, target, target_type, details)
  VALUES (
    v_uid,
    COALESCE(v_name, 'Unknown'),
    btrim(p_action),
    left(p_target, 500),
    left(p_target_type, 100),
    p_details
  );
END;
$$;

REVOKE ALL ON FUNCTION public.record_audit_event(text, text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_audit_event(text, text, text, jsonb) TO authenticated;