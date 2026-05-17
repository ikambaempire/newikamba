DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE lower(email) = 'ikambaempireltd@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    SELECT id, 'super_admin'::public.app_role
    FROM auth.users
    WHERE lower(email) = 'ikambaempireltd@gmail.com'
    ON CONFLICT (user_id, role) DO NOTHING;

    INSERT INTO public.profiles (user_id, full_name)
    SELECT id, 'Ikamba Empire'
    FROM auth.users
    WHERE lower(email) = 'ikambaempireltd@gmail.com'
    ON CONFLICT (user_id) DO UPDATE
      SET full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
          updated_at = now();
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.is_bootstrap_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users u
    WHERE u.id = _user_id
      AND lower(u.email) = 'ikambaempireltd@gmail.com'
  )
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_bootstrap_super_admin(_user_id)
    OR EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = _user_id
        AND role = _role
    )
$$;

CREATE OR REPLACE FUNCTION public.is_internal_role(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'super_admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = _user_id
        AND role IN ('org_admin', 'project_manager', 'producer', 'editor')
    )
$$;

CREATE TABLE IF NOT EXISTS public.os_tool_access (
  user_id uuid NOT NULL,
  tool_key text NOT NULL,
  granted_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, tool_key)
);

ALTER TABLE public.os_tool_access ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own tool access" ON public.os_tool_access;
CREATE POLICY "Users view own tool access"
ON public.os_tool_access
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'::public.app_role));

DROP POLICY IF EXISTS "Super admins manage tool access" ON public.os_tool_access;
CREATE POLICY "Super admins manage tool access"
ON public.os_tool_access
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE TABLE IF NOT EXISTS public.os_platform_settings (
  setting_key text PRIMARY KEY,
  items text[] NOT NULL DEFAULT '{}',
  updated_by uuid,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.os_platform_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users view platform settings" ON public.os_platform_settings;
CREATE POLICY "Authenticated users view platform settings"
ON public.os_platform_settings
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Super admins manage platform settings" ON public.os_platform_settings;
CREATE POLICY "Super admins manage platform settings"
ON public.os_platform_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE TRIGGER update_os_platform_settings_updated_at
BEFORE UPDATE ON public.os_platform_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();