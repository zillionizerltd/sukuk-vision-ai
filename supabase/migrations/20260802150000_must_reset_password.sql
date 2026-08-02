-- Add must_reset_password column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS must_reset_password boolean NOT NULL DEFAULT false;

-- Update handle_new_user trigger to record must_reset_password from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_org text;
  v_must_reset boolean;
BEGIN
  v_org := COALESCE(NEW.raw_user_meta_data ->> 'org', '');
  v_must_reset := COALESCE((NEW.raw_user_meta_data ->> 'must_reset_password')::boolean, false);

  INSERT INTO public.profiles (id, full_name, org, must_reset_password)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    v_org,
    v_must_reset
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    org = EXCLUDED.org,
    must_reset_password = EXCLUDED.must_reset_password;

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
