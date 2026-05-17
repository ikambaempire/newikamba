CREATE OR REPLACE FUNCTION app_private.is_admin_role(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT app_private.has_role(_user_id, 'super_admin'::public.app_role)
    OR EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = _user_id
        AND role = 'org_admin'::public.app_role
    )
$$;

REVOKE EXECUTE ON FUNCTION app_private.is_admin_role(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION app_private.is_admin_role(uuid) TO authenticated;

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (app_private.is_admin_role(auth.uid()));

DROP POLICY IF EXISTS "Users view own todos" ON public.os_todos;
DROP POLICY IF EXISTS "Users insert own todos" ON public.os_todos;
DROP POLICY IF EXISTS "Users update own todos" ON public.os_todos;
DROP POLICY IF EXISTS "Users delete own todos" ON public.os_todos;
DROP POLICY IF EXISTS "Users can view own todos" ON public.os_todos;
DROP POLICY IF EXISTS "Users can create own todos" ON public.os_todos;
DROP POLICY IF EXISTS "Users can update own todos" ON public.os_todos;
DROP POLICY IF EXISTS "Users can delete own todos" ON public.os_todos;
CREATE POLICY "Users view own todos"
ON public.os_todos
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR app_private.is_admin_role(auth.uid()));
CREATE POLICY "Users insert own todos"
ON public.os_todos
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR app_private.is_admin_role(auth.uid()));
CREATE POLICY "Users update own todos"
ON public.os_todos
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR app_private.is_admin_role(auth.uid()))
WITH CHECK (user_id = auth.uid() OR app_private.is_admin_role(auth.uid()));
CREATE POLICY "Users delete own todos"
ON public.os_todos
FOR DELETE
TO authenticated
USING (user_id = auth.uid() OR app_private.is_admin_role(auth.uid()));

DROP POLICY IF EXISTS "Users view own goals" ON public.os_weekly_goals;
DROP POLICY IF EXISTS "Users insert own goals" ON public.os_weekly_goals;
DROP POLICY IF EXISTS "Users update own goals" ON public.os_weekly_goals;
DROP POLICY IF EXISTS "Users delete own goals" ON public.os_weekly_goals;
DROP POLICY IF EXISTS "Users can view own goals" ON public.os_weekly_goals;
DROP POLICY IF EXISTS "Users can create own goals" ON public.os_weekly_goals;
DROP POLICY IF EXISTS "Users can update own goals" ON public.os_weekly_goals;
DROP POLICY IF EXISTS "Users can delete own goals" ON public.os_weekly_goals;
CREATE POLICY "Users view own goals"
ON public.os_weekly_goals
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR app_private.is_admin_role(auth.uid()));
CREATE POLICY "Users insert own goals"
ON public.os_weekly_goals
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR app_private.is_admin_role(auth.uid()));
CREATE POLICY "Users update own goals"
ON public.os_weekly_goals
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR app_private.is_admin_role(auth.uid()))
WITH CHECK (user_id = auth.uid() OR app_private.is_admin_role(auth.uid()));
CREATE POLICY "Users delete own goals"
ON public.os_weekly_goals
FOR DELETE
TO authenticated
USING (user_id = auth.uid() OR app_private.is_admin_role(auth.uid()));

DROP POLICY IF EXISTS "Users view own tool access" ON public.os_tool_access;
DROP POLICY IF EXISTS "Super admins manage tool access" ON public.os_tool_access;
CREATE POLICY "Users view own tool access"
ON public.os_tool_access
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR app_private.is_admin_role(auth.uid()));
CREATE POLICY "Admins manage tool access"
ON public.os_tool_access
FOR ALL
TO authenticated
USING (app_private.is_admin_role(auth.uid()))
WITH CHECK (app_private.is_admin_role(auth.uid()));

CREATE TABLE IF NOT EXISTS public.os_calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  project_id text,
  title text NOT NULL,
  event_type text NOT NULL DEFAULT 'Schedule',
  event_date date NOT NULL,
  event_time time,
  location text,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.os_calendar_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own calendar events" ON public.os_calendar_events;
DROP POLICY IF EXISTS "Users create own calendar events" ON public.os_calendar_events;
DROP POLICY IF EXISTS "Users update own calendar events" ON public.os_calendar_events;
DROP POLICY IF EXISTS "Users delete own calendar events" ON public.os_calendar_events;
CREATE POLICY "Users view own calendar events"
ON public.os_calendar_events
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR created_by = auth.uid() OR app_private.is_admin_role(auth.uid()));
CREATE POLICY "Users create own calendar events"
ON public.os_calendar_events
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR app_private.is_admin_role(auth.uid()));
CREATE POLICY "Users update own calendar events"
ON public.os_calendar_events
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR created_by = auth.uid() OR app_private.is_admin_role(auth.uid()))
WITH CHECK (user_id = auth.uid() OR created_by = auth.uid() OR app_private.is_admin_role(auth.uid()));
CREATE POLICY "Users delete own calendar events"
ON public.os_calendar_events
FOR DELETE
TO authenticated
USING (user_id = auth.uid() OR created_by = auth.uid() OR app_private.is_admin_role(auth.uid()));

DROP TRIGGER IF EXISTS update_os_calendar_events_updated_at ON public.os_calendar_events;
CREATE TRIGGER update_os_calendar_events_updated_at
BEFORE UPDATE ON public.os_calendar_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role ON public.user_roles(user_id, role);
CREATE INDEX IF NOT EXISTS idx_os_todos_user_created ON public.os_todos(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_os_goals_user_week ON public.os_weekly_goals(user_id, week_start DESC);
CREATE INDEX IF NOT EXISTS idx_os_tool_access_user ON public.os_tool_access(user_id);
CREATE INDEX IF NOT EXISTS idx_os_calendar_user_date ON public.os_calendar_events(user_id, event_date);
CREATE INDEX IF NOT EXISTS idx_os_calendar_created_by ON public.os_calendar_events(created_by);