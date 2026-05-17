DROP POLICY IF EXISTS "Super admins manage platform settings" ON public.os_platform_settings;
DROP POLICY IF EXISTS "Admins manage platform settings" ON public.os_platform_settings;
CREATE POLICY "Admins manage platform settings"
ON public.os_platform_settings
FOR ALL
TO authenticated
USING (app_private.is_admin_role(auth.uid()))
WITH CHECK (app_private.is_admin_role(auth.uid()));

DROP POLICY IF EXISTS "Users view own or admin views all" ON public.os_expense_requests;
DROP POLICY IF EXISTS "Update own pending or admin" ON public.os_expense_requests;
DROP POLICY IF EXISTS "Delete own pending or admin" ON public.os_expense_requests;
CREATE POLICY "Users view own or admin views all"
ON public.os_expense_requests
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR app_private.is_admin_role(auth.uid()));
CREATE POLICY "Update own pending or admin"
ON public.os_expense_requests
FOR UPDATE
TO authenticated
USING (app_private.is_admin_role(auth.uid()) OR (user_id = auth.uid() AND status = 'pending'))
WITH CHECK (app_private.is_admin_role(auth.uid()) OR (user_id = auth.uid() AND status = 'pending'));
CREATE POLICY "Delete own pending or admin"
ON public.os_expense_requests
FOR DELETE
TO authenticated
USING (app_private.is_admin_role(auth.uid()) OR (user_id = auth.uid() AND status = 'pending'));