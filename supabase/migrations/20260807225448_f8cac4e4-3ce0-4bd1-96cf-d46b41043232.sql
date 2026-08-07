REVOKE ALL ON FUNCTION public.record_audit_event(text, text, text, jsonb) FROM anon;
REVOKE ALL ON FUNCTION public.record_audit_event(text, text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_audit_event(text, text, text, jsonb) TO authenticated;