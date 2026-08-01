CREATE OR REPLACE FUNCTION public.current_user_org()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lower(coalesce(org, '')) FROM public.profiles WHERE id = auth.uid()
$$;

REVOKE ALL ON FUNCTION public.current_user_org() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_user_org() TO authenticated;

DROP POLICY IF EXISTS "Profiles viewable by self admin or same org" ON public.profiles;

CREATE POLICY "Profiles viewable by self admin or same org"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id = auth.uid()
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR (
    coalesce(org, '') <> ''
    AND lower(coalesce(org, '')) = public.current_user_org()
  )
);