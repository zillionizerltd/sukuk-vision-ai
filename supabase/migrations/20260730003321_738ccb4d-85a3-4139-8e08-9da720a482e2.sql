CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text,
  item_type text,
  item_id uuid,
  link text,
  actor_name text,
  actor_org text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "notifications_delete_own" ON public.notifications
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE INDEX notifications_user_idx ON public.notifications (user_id, read, created_at DESC);

CREATE TRIGGER notifications_set_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.notify_on_item_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_title text;
  v_link text;
BEGIN
  v_title := CASE WHEN NEW.item_type = 'milestone'
    THEN 'New comment on a milestone'
    ELSE 'New comment on a task' END;
  v_link := CASE WHEN NEW.item_type = 'milestone' THEN '/milestones' ELSE '/tasks' END;

  INSERT INTO public.notifications (user_id, title, body, item_type, item_id, link, actor_name, actor_org)
  SELECT p.id,
         v_title,
         left(NEW.body, 240),
         NEW.item_type,
         NEW.item_id,
         v_link,
         COALESCE(NEW.author_name, 'A member'),
         COALESCE(NEW.author_org, '')
  FROM public.profiles p
  WHERE p.id <> NEW.author_id
    AND lower(COALESCE(p.org, '')) IN ('agrofeed global', 'al huda cibe', 'tesserant capital', 'tesserant');

  RETURN NEW;
END;
$$;

CREATE TRIGGER item_comments_notify
  AFTER INSERT ON public.item_comments
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_item_comment();

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;