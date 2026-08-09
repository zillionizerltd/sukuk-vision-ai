-- Folder creation for all authenticated users.
-- Previously only admins could insert folder_access rows, which blocked
-- non-admin users from creating folders in the Data Room.
DROP POLICY IF EXISTS folder_access_admin_manage ON public.folder_access;

CREATE POLICY folder_access_insert_auth
ON public.folder_access
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY folder_access_update_admin
ON public.folder_access
FOR UPDATE
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY folder_access_delete_admin
ON public.folder_access
FOR DELETE
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::app_role));
