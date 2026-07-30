CREATE TABLE public.folder_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org text NOT NULL,
  folder text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org, folder)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.folder_access TO authenticated;
GRANT ALL ON public.folder_access TO service_role;

ALTER TABLE public.folder_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY folder_access_select_auth ON public.folder_access
  FOR SELECT TO authenticated USING (true);

CREATE POLICY folder_access_admin_manage ON public.folder_access
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER folder_access_set_updated_at
  BEFORE UPDATE ON public.folder_access
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.can_access_folder(_user_id uuid, _folder text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH me AS (
    SELECT lower(coalesce(org, '')) AS org FROM public.profiles WHERE id = _user_id
  )
  SELECT
    CASE
      WHEN (SELECT org FROM me) = 'agrofeed global' THEN true
      WHEN public.can_write(_user_id) THEN true
      WHEN NOT EXISTS (
        SELECT 1 FROM public.folder_access fa
        WHERE lower(fa.org) = (SELECT org FROM me)
      ) THEN true
      ELSE EXISTS (
        SELECT 1 FROM public.folder_access fa
        WHERE lower(fa.org) = (SELECT org FROM me)
          AND fa.folder = _folder
      )
    END
$$;

REVOKE EXECUTE ON FUNCTION public.can_access_folder(uuid, text) FROM anon;

DROP POLICY IF EXISTS documents_select_auth ON public.documents;
CREATE POLICY documents_select_auth ON public.documents
  FOR SELECT TO authenticated
  USING (public.can_access_folder(auth.uid(), folder));