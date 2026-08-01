ALTER TABLE public.item_comments
  ADD COLUMN parent_id uuid REFERENCES public.item_comments(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS item_comments_parent_id_idx ON public.item_comments(parent_id);