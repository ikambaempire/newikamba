
-- Priority enum
DO $$ BEGIN
  CREATE TYPE public.os_priority AS ENUM ('low','medium','high');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Todos
CREATE TABLE IF NOT EXISTS public.os_todos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  notes text,
  due timestamptz,
  priority public.os_priority NOT NULL DEFAULT 'medium',
  done boolean NOT NULL DEFAULT false,
  reminders_fired integer[] NOT NULL DEFAULT '{}',
  by_admin boolean NOT NULL DEFAULT false,
  assigned_by_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS os_todos_user_idx ON public.os_todos(user_id);

ALTER TABLE public.os_todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own todos"   ON public.os_todos FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Users insert own todos" ON public.os_todos FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Users update own todos" ON public.os_todos FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'super_admin')) WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Users delete own todos" ON public.os_todos FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));

CREATE TRIGGER os_todos_set_updated_at BEFORE UPDATE ON public.os_todos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Weekly goals
CREATE TABLE IF NOT EXISTS public.os_weekly_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  notes text,
  week_start date NOT NULL,
  priority public.os_priority NOT NULL DEFAULT 'medium',
  done boolean NOT NULL DEFAULT false,
  by_admin boolean NOT NULL DEFAULT false,
  assigned_by_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS os_weekly_goals_user_week_idx ON public.os_weekly_goals(user_id, week_start);

ALTER TABLE public.os_weekly_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own goals"   ON public.os_weekly_goals FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Users insert own goals" ON public.os_weekly_goals FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Users update own goals" ON public.os_weekly_goals FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'super_admin')) WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Users delete own goals" ON public.os_weekly_goals FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));

CREATE TRIGGER os_weekly_goals_set_updated_at BEFORE UPDATE ON public.os_weekly_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars','avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatars public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users upload own avatar"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update own avatar"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own avatar"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
