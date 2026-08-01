-- 1. Storage: folder-aware read + owner-scoped insert
DROP POLICY IF EXISTS docs_read_auth ON storage.objects;
CREATE POLICY docs_read_auth ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'documents'
  AND EXISTS (
    SELECT 1 FROM public.documents d
    WHERE d.storage_path = storage.objects.name
      AND public.can_access_folder(auth.uid(), d.folder)
  )
);

DROP POLICY IF EXISTS docs_insert_auth ON storage.objects;
CREATE POLICY docs_insert_auth ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. Profiles: own record, admins, or same organisation
DROP POLICY IF EXISTS "Profiles viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles viewable by self admin or same org" ON public.profiles
FOR SELECT TO authenticated
USING (
  id = auth.uid()
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
  OR (
    COALESCE(org, '') <> ''
    AND lower(COALESCE(org, '')) = (
      SELECT lower(COALESCE(p.org, '')) FROM public.profiles p WHERE p.id = auth.uid()
    )
  )
);

-- 3. Lock down trigger-only SECURITY DEFINER functions
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_on_item_comment() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM anon, authenticated;

-- Helper functions are only needed inside RLS policies for signed-in users
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE ALL ON FUNCTION public.can_write(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.can_access_folder(uuid, text) FROM anon;