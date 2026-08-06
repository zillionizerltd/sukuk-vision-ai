-- 1. Restrict organisations SELECT to authenticated only
DROP POLICY IF EXISTS "organisations_select_all" ON public.organisations;
CREATE POLICY "organisations_select_authenticated"
ON public.organisations FOR SELECT TO authenticated USING (true);
REVOKE SELECT ON public.organisations FROM anon;

-- 2. Allow admins/advisors to update/delete any task
DROP POLICY IF EXISTS "tasks_update_own" ON public.tasks;
CREATE POLICY "tasks_update_own_or_writer"
ON public.tasks FOR UPDATE TO authenticated
USING (created_by = auth.uid() OR public.can_write(auth.uid()))
WITH CHECK (created_by = auth.uid() OR public.can_write(auth.uid()));

DROP POLICY IF EXISTS "tasks_delete_own" ON public.tasks;
CREATE POLICY "tasks_delete_own_or_writer"
ON public.tasks FOR DELETE TO authenticated
USING (created_by = auth.uid() OR public.can_write(auth.uid()));

-- 3. Revoke direct EXECUTE on SECURITY DEFINER helpers from client roles.
-- These are only used inside RLS policies / triggers, which are evaluated
-- with the table owner's privileges, so policies keep working.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated, anon, public;
REVOKE EXECUTE ON FUNCTION public.can_write(uuid) FROM authenticated, anon, public;
REVOKE EXECUTE ON FUNCTION public.can_access_folder(uuid, text) FROM authenticated, anon, public;
REVOKE EXECUTE ON FUNCTION public.current_user_org() FROM authenticated, anon, public;
