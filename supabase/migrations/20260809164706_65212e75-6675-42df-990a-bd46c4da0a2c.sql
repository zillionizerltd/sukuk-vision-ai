DROP POLICY IF EXISTS folder_access_insert_auth ON public.folder_access;
CREATE POLICY folder_access_insert_auth ON public.folder_access
  FOR INSERT TO authenticated
  WITH CHECK (true);

REVOKE ALL ON public.folder_access FROM anon;
GRANT SELECT, INSERT ON public.folder_access TO authenticated;
GRANT UPDATE, DELETE ON public.folder_access TO authenticated;
GRANT ALL ON public.folder_access TO service_role;