GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_internal_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_bootstrap_super_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION app_private.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION app_private.is_internal_role(uuid) TO authenticated;