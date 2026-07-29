
-- Add org to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS org text;

-- Update signup trigger to record org and grant Agrofeed users the advisor role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_org text;
BEGIN
  v_org := COALESCE(NEW.raw_user_meta_data ->> 'org', '');

  INSERT INTO public.profiles (id, full_name, org)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    v_org
  );

  -- Baseline role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Agrofeed Global gets full write access via advisor role
  IF lower(v_org) = 'agrofeed global' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'advisor')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;

-- Loosen documents write policy: any authenticated user may upload;
-- edits/deletes limited to admin/advisor or the original uploader.
DROP POLICY IF EXISTS documents_write_admin_advisor ON public.documents;

CREATE POLICY documents_insert_auth
  ON public.documents FOR INSERT
  TO authenticated
  WITH CHECK (uploaded_by = auth.uid() OR public.can_write(auth.uid()));

CREATE POLICY documents_update_owner_or_writer
  ON public.documents FOR UPDATE
  TO authenticated
  USING (public.can_write(auth.uid()) OR uploaded_by = auth.uid())
  WITH CHECK (public.can_write(auth.uid()) OR uploaded_by = auth.uid());

CREATE POLICY documents_delete_owner_or_writer
  ON public.documents FOR DELETE
  TO authenticated
  USING (public.can_write(auth.uid()) OR uploaded_by = auth.uid());
