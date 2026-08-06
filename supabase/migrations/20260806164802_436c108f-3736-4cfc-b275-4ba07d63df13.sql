GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_write(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_folder(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_org() TO authenticated;