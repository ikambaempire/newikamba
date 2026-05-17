DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (app_private.has_role(auth.uid(), 'super_admin'::public.app_role));

DROP POLICY IF EXISTS "Users view own todos" ON public.os_todos;
CREATE POLICY "Users view own todos"
ON public.os_todos
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR app_private.has_role(auth.uid(), 'super_admin'::public.app_role));

DROP POLICY IF EXISTS "Users insert own todos" ON public.os_todos;
CREATE POLICY "Users insert own todos"
ON public.os_todos
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR app_private.has_role(auth.uid(), 'super_admin'::public.app_role));

DROP POLICY IF EXISTS "Users update own todos" ON public.os_todos;
CREATE POLICY "Users update own todos"
ON public.os_todos
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR app_private.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (user_id = auth.uid() OR app_private.has_role(auth.uid(), 'super_admin'::public.app_role));

DROP POLICY IF EXISTS "Users delete own todos" ON public.os_todos;
CREATE POLICY "Users delete own todos"
ON public.os_todos
FOR DELETE
TO authenticated
USING (user_id = auth.uid() OR app_private.has_role(auth.uid(), 'super_admin'::public.app_role));

DROP POLICY IF EXISTS "Users view own goals" ON public.os_weekly_goals;
CREATE POLICY "Users view own goals"
ON public.os_weekly_goals
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR app_private.has_role(auth.uid(), 'super_admin'::public.app_role));

DROP POLICY IF EXISTS "Users insert own goals" ON public.os_weekly_goals;
CREATE POLICY "Users insert own goals"
ON public.os_weekly_goals
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR app_private.has_role(auth.uid(), 'super_admin'::public.app_role));

DROP POLICY IF EXISTS "Users update own goals" ON public.os_weekly_goals;
CREATE POLICY "Users update own goals"
ON public.os_weekly_goals
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR app_private.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (user_id = auth.uid() OR app_private.has_role(auth.uid(), 'super_admin'::public.app_role));

DROP POLICY IF EXISTS "Users delete own goals" ON public.os_weekly_goals;
CREATE POLICY "Users delete own goals"
ON public.os_weekly_goals
FOR DELETE
TO authenticated
USING (user_id = auth.uid() OR app_private.has_role(auth.uid(), 'super_admin'::public.app_role));

DROP POLICY IF EXISTS "Users view own or admin views all" ON public.os_expense_requests;
CREATE POLICY "Users view own or admin views all"
ON public.os_expense_requests
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR app_private.has_role(auth.uid(), 'super_admin'::public.app_role));

DROP POLICY IF EXISTS "Update own pending or admin" ON public.os_expense_requests;
CREATE POLICY "Update own pending or admin"
ON public.os_expense_requests
FOR UPDATE
TO authenticated
USING (app_private.has_role(auth.uid(), 'super_admin'::public.app_role) OR (user_id = auth.uid() AND status = 'pending'))
WITH CHECK (app_private.has_role(auth.uid(), 'super_admin'::public.app_role) OR (user_id = auth.uid() AND status = 'pending'));

DROP POLICY IF EXISTS "Delete own pending or admin" ON public.os_expense_requests;
CREATE POLICY "Delete own pending or admin"
ON public.os_expense_requests
FOR DELETE
TO authenticated
USING (app_private.has_role(auth.uid(), 'super_admin'::public.app_role) OR (user_id = auth.uid() AND status = 'pending'));

DROP POLICY IF EXISTS "Users view own tool access" ON public.os_tool_access;
CREATE POLICY "Users view own tool access"
ON public.os_tool_access
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR app_private.has_role(auth.uid(), 'super_admin'::public.app_role));

DROP POLICY IF EXISTS "Super admins manage tool access" ON public.os_tool_access;
CREATE POLICY "Super admins manage tool access"
ON public.os_tool_access
FOR ALL
TO authenticated
USING (app_private.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (app_private.has_role(auth.uid(), 'super_admin'::public.app_role));

DROP POLICY IF EXISTS "Super admins manage platform settings" ON public.os_platform_settings;
CREATE POLICY "Super admins manage platform settings"
ON public.os_platform_settings
FOR ALL
TO authenticated
USING (app_private.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (app_private.has_role(auth.uid(), 'super_admin'::public.app_role));

GRANT EXECUTE ON FUNCTION app_private.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION app_private.is_internal_role(uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_internal_role(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_bootstrap_super_admin(uuid) FROM PUBLIC, anon, authenticated;