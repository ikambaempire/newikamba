CREATE SCHEMA IF NOT EXISTS app_private;
REVOKE ALL ON SCHEMA app_private FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION app_private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION app_private.is_internal_role(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'org_admin', 'project_manager', 'producer', 'editor')
  )
$$;

CREATE OR REPLACE FUNCTION app_private.user_client_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT client_id FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (app_private.has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (app_private.has_role(auth.uid(), 'super_admin')) WITH CHECK (app_private.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Internal users can manage organizations" ON public.organizations;
CREATE POLICY "Internal users can manage organizations" ON public.organizations FOR ALL TO authenticated USING (app_private.is_internal_role(auth.uid())) WITH CHECK (app_private.is_internal_role(auth.uid()));
DROP POLICY IF EXISTS "Internal users can manage clients" ON public.clients;
CREATE POLICY "Internal users can manage clients" ON public.clients FOR ALL TO authenticated USING (app_private.is_internal_role(auth.uid())) WITH CHECK (app_private.is_internal_role(auth.uid()));
DROP POLICY IF EXISTS "Users can view relevant projects" ON public.projects;
CREATE POLICY "Users can view relevant projects" ON public.projects FOR SELECT TO authenticated USING (app_private.is_internal_role(auth.uid()) OR created_by = auth.uid() OR client_id = app_private.user_client_id(auth.uid()));
DROP POLICY IF EXISTS "Internal users can update projects" ON public.projects;
CREATE POLICY "Internal users can update projects" ON public.projects FOR UPDATE TO authenticated USING (app_private.is_internal_role(auth.uid())) WITH CHECK (app_private.is_internal_role(auth.uid()));
DROP POLICY IF EXISTS "Users can view relevant project logs" ON public.project_status_logs;
CREATE POLICY "Users can view relevant project logs" ON public.project_status_logs FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND (app_private.is_internal_role(auth.uid()) OR p.created_by = auth.uid() OR p.client_id = app_private.user_client_id(auth.uid()))));
DROP POLICY IF EXISTS "Internal users can manage project logs" ON public.project_status_logs;
CREATE POLICY "Internal users can manage project logs" ON public.project_status_logs FOR ALL TO authenticated USING (app_private.is_internal_role(auth.uid())) WITH CHECK (app_private.is_internal_role(auth.uid()));
DROP POLICY IF EXISTS "Users can view relevant revisions" ON public.revisions;
CREATE POLICY "Users can view relevant revisions" ON public.revisions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND (app_private.is_internal_role(auth.uid()) OR p.created_by = auth.uid() OR p.client_id = app_private.user_client_id(auth.uid()))));
DROP POLICY IF EXISTS "Authenticated users can create revisions" ON public.revisions;
CREATE POLICY "Authenticated users can create revisions" ON public.revisions FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid() OR app_private.is_internal_role(auth.uid()));
DROP POLICY IF EXISTS "Users can view relevant assets" ON public.assets;
CREATE POLICY "Users can view relevant assets" ON public.assets FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND (app_private.is_internal_role(auth.uid()) OR p.created_by = auth.uid() OR p.client_id = app_private.user_client_id(auth.uid()))));
DROP POLICY IF EXISTS "Internal users can manage assets" ON public.assets;
CREATE POLICY "Internal users can manage assets" ON public.assets FOR ALL TO authenticated USING (app_private.is_internal_role(auth.uid())) WITH CHECK (app_private.is_internal_role(auth.uid()));
DROP POLICY IF EXISTS "Internal users can manage blog posts" ON public.blog_posts;
CREATE POLICY "Internal users can manage blog posts" ON public.blog_posts FOR ALL TO authenticated USING (app_private.is_internal_role(auth.uid())) WITH CHECK (app_private.is_internal_role(auth.uid()));

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_internal_role(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.user_client_id(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION app_private.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION app_private.is_internal_role(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION app_private.user_client_id(uuid) FROM PUBLIC, anon, authenticated;