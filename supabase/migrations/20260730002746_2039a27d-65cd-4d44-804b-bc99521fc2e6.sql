CREATE TABLE public.item_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type text NOT NULL CHECK (item_type IN ('milestone','task')),
  item_id uuid NOT NULL,
  body text NOT NULL CHECK (length(btrim(body)) > 0 AND length(body) <= 2000),
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name text,
  author_org text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_item_comments_item ON public.item_comments (item_type, item_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.item_comments TO authenticated;
GRANT ALL ON public.item_comments TO service_role;

ALTER TABLE public.item_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY comments_select_auth ON public.item_comments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY comments_insert_own ON public.item_comments
  FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());

CREATE POLICY comments_update_own ON public.item_comments
  FOR UPDATE TO authenticated USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());

CREATE POLICY comments_delete_own_or_writer ON public.item_comments
  FOR DELETE TO authenticated USING (author_id = auth.uid() OR public.can_write(auth.uid()));

CREATE TRIGGER set_item_comments_updated_at
  BEFORE UPDATE ON public.item_comments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();