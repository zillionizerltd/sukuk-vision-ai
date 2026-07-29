
CREATE POLICY "docs_read_auth" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'documents');

CREATE POLICY "docs_insert_auth" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents' AND owner = auth.uid());

CREATE POLICY "docs_update_owner_or_writer" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'documents' AND (owner = auth.uid() OR public.can_write(auth.uid())))
  WITH CHECK (bucket_id = 'documents' AND (owner = auth.uid() OR public.can_write(auth.uid())));

CREATE POLICY "docs_delete_owner_or_writer" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'documents' AND (owner = auth.uid() OR public.can_write(auth.uid())));
