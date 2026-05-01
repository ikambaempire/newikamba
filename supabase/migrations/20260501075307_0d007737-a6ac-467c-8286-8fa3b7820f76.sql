DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status') THEN
    CREATE TYPE public.project_status AS ENUM ('brief_received', 'strategy_alignment', 'production', 'editing', 'client_review', 'final_delivery', 'archive');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'priority_level') THEN
    CREATE TYPE public.priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid,
  name text NOT NULL,
  contact_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid,
  created_by uuid,
  name text NOT NULL,
  project_type text,
  objective text,
  target_audience text,
  key_message text,
  distribution_plan text,
  deadline date,
  budget_range text,
  approval_contact text,
  contact_email text,
  status public.project_status NOT NULL DEFAULT 'brief_received',
  priority public.priority_level NOT NULL DEFAULT 'medium',
  revision_count integer NOT NULL DEFAULT 0,
  stage_entered_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_status_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  old_status public.project_status,
  new_status public.project_status NOT NULL,
  changed_by uuid,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  revision_number integer NOT NULL DEFAULT 1,
  feedback text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid,
  file_url text,
  file_name text,
  file_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content text NOT NULL,
  category text,
  cover_image_url text,
  author text,
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON public.projects(created_by);
CREATE INDEX IF NOT EXISTS idx_project_status_logs_project_id ON public.project_status_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_revisions_project_id ON public.revisions(project_id);
CREATE INDEX IF NOT EXISTS idx_assets_project_id ON public.assets(project_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published, published_at DESC);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_status_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_internal_role(_user_id uuid)
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

CREATE OR REPLACE FUNCTION public.user_client_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT client_id FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

DROP TRIGGER IF EXISTS update_organizations_updated_at ON public.organizations;
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP POLICY IF EXISTS "Authenticated users can view organizations" ON public.organizations;
CREATE POLICY "Authenticated users can view organizations" ON public.organizations FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Internal users can manage organizations" ON public.organizations;
CREATE POLICY "Internal users can manage organizations" ON public.organizations FOR ALL TO authenticated USING (public.is_internal_role(auth.uid())) WITH CHECK (public.is_internal_role(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can view clients" ON public.clients;
CREATE POLICY "Authenticated users can view clients" ON public.clients FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Internal users can manage clients" ON public.clients;
CREATE POLICY "Internal users can manage clients" ON public.clients FOR ALL TO authenticated USING (public.is_internal_role(auth.uid())) WITH CHECK (public.is_internal_role(auth.uid()));

DROP POLICY IF EXISTS "Users can view relevant projects" ON public.projects;
CREATE POLICY "Users can view relevant projects" ON public.projects FOR SELECT TO authenticated USING (public.is_internal_role(auth.uid()) OR created_by = auth.uid() OR client_id = public.user_client_id(auth.uid()));
DROP POLICY IF EXISTS "Signed in users can create projects" ON public.projects;
CREATE POLICY "Signed in users can create projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid() OR created_by IS NULL);
DROP POLICY IF EXISTS "Internal users can update projects" ON public.projects;
CREATE POLICY "Internal users can update projects" ON public.projects FOR UPDATE TO authenticated USING (public.is_internal_role(auth.uid())) WITH CHECK (public.is_internal_role(auth.uid()));

DROP POLICY IF EXISTS "Users can view relevant project logs" ON public.project_status_logs;
CREATE POLICY "Users can view relevant project logs" ON public.project_status_logs FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND (public.is_internal_role(auth.uid()) OR p.created_by = auth.uid() OR p.client_id = public.user_client_id(auth.uid()))));
DROP POLICY IF EXISTS "Internal users can manage project logs" ON public.project_status_logs;
CREATE POLICY "Internal users can manage project logs" ON public.project_status_logs FOR ALL TO authenticated USING (public.is_internal_role(auth.uid())) WITH CHECK (public.is_internal_role(auth.uid()));

DROP POLICY IF EXISTS "Users can view relevant revisions" ON public.revisions;
CREATE POLICY "Users can view relevant revisions" ON public.revisions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND (public.is_internal_role(auth.uid()) OR p.created_by = auth.uid() OR p.client_id = public.user_client_id(auth.uid()))));
DROP POLICY IF EXISTS "Authenticated users can create revisions" ON public.revisions;
CREATE POLICY "Authenticated users can create revisions" ON public.revisions FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid() OR public.is_internal_role(auth.uid()));

DROP POLICY IF EXISTS "Users can view relevant assets" ON public.assets;
CREATE POLICY "Users can view relevant assets" ON public.assets FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND (public.is_internal_role(auth.uid()) OR p.created_by = auth.uid() OR p.client_id = public.user_client_id(auth.uid()))));
DROP POLICY IF EXISTS "Internal users can manage assets" ON public.assets;
CREATE POLICY "Internal users can manage assets" ON public.assets FOR ALL TO authenticated USING (public.is_internal_role(auth.uid())) WITH CHECK (public.is_internal_role(auth.uid()));

DROP POLICY IF EXISTS "Published blog posts are public" ON public.blog_posts;
CREATE POLICY "Published blog posts are public" ON public.blog_posts FOR SELECT TO anon, authenticated USING (published = true);
DROP POLICY IF EXISTS "Internal users can manage blog posts" ON public.blog_posts;
CREATE POLICY "Internal users can manage blog posts" ON public.blog_posts FOR ALL TO authenticated USING (public.is_internal_role(auth.uid())) WITH CHECK (public.is_internal_role(auth.uid()));

REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_profile() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_internal_role(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.user_client_id(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_internal_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_client_id(uuid) TO authenticated;