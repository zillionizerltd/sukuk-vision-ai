-- 1. Move SECURITY DEFINER helpers out of the exposed API schema
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

ALTER FUNCTION public.has_role(uuid, public.app_role) SET SCHEMA private;
ALTER FUNCTION public.can_write(uuid) SET SCHEMA private;
ALTER FUNCTION public.can_access_folder(uuid, text) SET SCHEMA private;
ALTER FUNCTION public.current_user_org() SET SCHEMA private;
ALTER FUNCTION public.handle_new_user() SET SCHEMA private;
ALTER FUNCTION public.notify_on_item_comment() SET SCHEMA private;

-- keep internal cross-references resolvable
ALTER FUNCTION private.has_role(uuid, public.app_role) SET search_path = public, private;
ALTER FUNCTION private.can_write(uuid) SET search_path = public, private;
ALTER FUNCTION private.can_access_folder(uuid, text) SET search_path = public, private;
ALTER FUNCTION private.current_user_org() SET search_path = public, private;
ALTER FUNCTION private.handle_new_user() SET search_path = public, private;
ALTER FUNCTION private.notify_on_item_comment() SET search_path = public, private;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.can_write(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.can_access_folder(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.current_user_org() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.handle_new_user() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.notify_on_item_comment() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.can_write(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.can_access_folder(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.current_user_org() TO authenticated, service_role;

-- 2. audit_log: admins only
DROP POLICY IF EXISTS audit_select_auth ON public.audit_log;
CREATE POLICY audit_select_admin ON public.audit_log
  FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

-- 3. financial_metrics: admins/advisors only
DROP POLICY IF EXISTS fin_select_auth ON public.financial_metrics;
CREATE POLICY fin_select_writers ON public.financial_metrics
  FOR SELECT TO authenticated
  USING (private.can_write(auth.uid()));

-- 4. item_comments: author, writers, or same org as the comment author
DROP POLICY IF EXISTS comments_select_auth ON public.item_comments;
CREATE POLICY comments_select_scoped ON public.item_comments
  FOR SELECT TO authenticated
  USING (
    author_id = auth.uid()
    OR private.can_write(auth.uid())
    OR (
      COALESCE(author_org, '') <> ''
      AND lower(COALESCE(author_org, '')) = private.current_user_org()
    )
  );

-- 5. stakeholders: writers, or members of that org
DROP POLICY IF EXISTS stakeholders_select_auth ON public.stakeholders;
CREATE POLICY stakeholders_select_scoped ON public.stakeholders
  FOR SELECT TO authenticated
  USING (
    private.can_write(auth.uid())
    OR lower(COALESCE(org, '')) = private.current_user_org()
  );