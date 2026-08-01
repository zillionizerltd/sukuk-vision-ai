CREATE TABLE public.organisations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL,
  partner_access boolean NOT NULL DEFAULT false,
  is_protected boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX organisations_name_lower_idx ON public.organisations (lower(name));
CREATE UNIQUE INDEX organisations_slug_idx ON public.organisations (slug);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.organisations TO authenticated;
GRANT SELECT ON public.organisations TO anon;
GRANT ALL ON public.organisations TO service_role;

ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "organisations_select_all" ON public.organisations
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "organisations_insert_admin" ON public.organisations
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "organisations_update_admin" ON public.organisations
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "organisations_delete_admin" ON public.organisations
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) AND is_protected = false);

CREATE TRIGGER organisations_set_updated_at
  BEFORE UPDATE ON public.organisations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.organisations (name, slug, partner_access, is_protected) VALUES
  ('Agrofeed Global', 'agrofeed-global', true, true),
  ('Tesserant Capital', 'tesserant-capital', true, false),
  ('Al Huda CIBE', 'al-huda-cibe', true, false),
  ('Sharia Supervisory Board', 'sharia-supervisory-board', false, false),
  ('External Legal Counsel', 'external-legal-counsel', false, false);
