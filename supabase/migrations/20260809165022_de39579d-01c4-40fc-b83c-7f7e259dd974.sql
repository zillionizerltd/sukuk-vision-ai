CREATE OR REPLACE FUNCTION private.record_audit_event(
  p_action text,
  p_target text DEFAULT NULL,
  p_target_type text DEFAULT NULL,
  p_details jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $function$
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
$function$;

REVOKE ALL ON FUNCTION private.record_audit_event(text, text, text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.record_audit_event(text, text, text, jsonb) TO authenticated;

DROP FUNCTION IF EXISTS public.record_audit_event(text, text, text, jsonb);

CREATE OR REPLACE FUNCTION public.record_audit_event(
  p_action text,
  p_target text DEFAULT NULL,
  p_target_type text DEFAULT NULL,
  p_details jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE sql
SECURITY INVOKER
SET search_path = public, private
AS $function$
  SELECT private.record_audit_event(p_action, p_target, p_target_type, p_details);
$function$;

REVOKE ALL ON FUNCTION public.record_audit_event(text, text, text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_audit_event(text, text, text, jsonb) TO authenticated;