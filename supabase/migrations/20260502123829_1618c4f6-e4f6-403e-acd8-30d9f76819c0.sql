CREATE POLICY "Users can create their own standard role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND role = 'user');

CREATE OR REPLACE FUNCTION public.ensure_current_user_profile(_full_name text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id uuid := auth.uid();
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.profiles (user_id, full_name)
  VALUES (current_user_id, NULLIF(trim(_full_name), ''))
  ON CONFLICT (user_id) DO UPDATE
    SET full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (current_user_id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;