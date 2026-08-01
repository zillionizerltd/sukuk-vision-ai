REVOKE ALL ON FUNCTION public.notify_on_item_comment() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_write(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_access_folder(uuid, text) FROM PUBLIC;

-- Required for row-level security policies evaluated as the signed-in user
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_write(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_folder(uuid, text) TO authenticated;