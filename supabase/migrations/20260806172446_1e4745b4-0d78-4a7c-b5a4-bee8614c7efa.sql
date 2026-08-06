CREATE OR REPLACE FUNCTION private.can_write(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'private'
AS $function$
  SELECT private.has_role(_user_id, 'admin'::app_role)
      OR private.has_role(_user_id, 'advisor'::app_role);
$function$;

CREATE OR REPLACE FUNCTION private.can_access_folder(_user_id uuid, _folder text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'private'
AS $function$
  WITH me AS (
    SELECT lower(coalesce(org, '')) AS org FROM public.profiles WHERE id = _user_id
  )
  SELECT
    CASE
      WHEN (SELECT org FROM me) = 'agrofeed global' THEN true
      WHEN private.can_write(_user_id) THEN true
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
$function$;