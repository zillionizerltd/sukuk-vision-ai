ALTER TABLE public.folder_access
  ADD COLUMN IF NOT EXISTS created_by uuid DEFAULT auth.uid();

CREATE OR REPLACE FUNCTION private.owns_folder(_user_id uuid, _folder text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, private
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.folder_access fa
    WHERE fa.folder = _folder AND fa.created_by = _user_id
  )
$$;

REVOKE ALL ON FUNCTION private.owns_folder(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.owns_folder(uuid, text) TO authenticated;

DROP POLICY IF EXISTS folder_access_delete_admin ON public.folder_access;
CREATE POLICY folder_access_delete_admin_or_owner ON public.folder_access
  FOR DELETE TO authenticated
  USING (
    private.has_role(auth.uid(), 'admin'::app_role)
    OR created_by = auth.uid()
    OR private.owns_folder(auth.uid(), folder)
  );