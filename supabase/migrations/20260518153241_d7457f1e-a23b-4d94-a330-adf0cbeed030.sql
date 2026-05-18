
-- 1) Notifications table
CREATE TABLE IF NOT EXISTS public.os_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  message text,
  link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);
CREATE INDEX IF NOT EXISTS os_notifications_user_idx ON public.os_notifications(user_id, created_at DESC);

ALTER TABLE public.os_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own notifications" ON public.os_notifications;
CREATE POLICY "Users view own notifications" ON public.os_notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR app_private.is_admin_role(auth.uid()));

DROP POLICY IF EXISTS "Authenticated insert notifications" ON public.os_notifications;
CREATE POLICY "Authenticated insert notifications" ON public.os_notifications
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() OR app_private.is_admin_role(auth.uid()));

DROP POLICY IF EXISTS "Users update own notifications" ON public.os_notifications;
CREATE POLICY "Users update own notifications" ON public.os_notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR app_private.is_admin_role(auth.uid()))
  WITH CHECK (user_id = auth.uid() OR app_private.is_admin_role(auth.uid()));

DROP POLICY IF EXISTS "Users delete own notifications" ON public.os_notifications;
CREATE POLICY "Users delete own notifications" ON public.os_notifications
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR app_private.is_admin_role(auth.uid()));

-- 2) Profiles: allow admins to update and delete any profile (in addition to existing self policies)
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles" ON public.profiles
  FOR UPDATE TO authenticated
  USING (app_private.is_admin_role(auth.uid()))
  WITH CHECK (app_private.is_admin_role(auth.uid()));

-- 3) Storage bucket for expense receipts (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('expense-receipts', 'expense-receipts', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users upload own receipts" ON storage.objects;
CREATE POLICY "Users upload own receipts" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'expense-receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users view own receipts" ON storage.objects;
CREATE POLICY "Users view own receipts" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'expense-receipts' AND (auth.uid()::text = (storage.foldername(name))[1] OR app_private.is_admin_role(auth.uid())));

DROP POLICY IF EXISTS "Users delete own receipts" ON storage.objects;
CREATE POLICY "Users delete own receipts" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'expense-receipts' AND (auth.uid()::text = (storage.foldername(name))[1] OR app_private.is_admin_role(auth.uid())));
