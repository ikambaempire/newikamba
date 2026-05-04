
-- Promote fiston.ikamba1@gmail.com to super_admin and reset password
UPDATE auth.users
SET encrypted_password = crypt('#K1ngfizz', gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    updated_at = now()
WHERE email = 'fiston.ikamba1@gmail.com';

INSERT INTO public.user_roles (user_id, role)
SELECT 'cfc7e6e5-ef2c-47e1-a4b9-7a3f75e6499e', 'super_admin'::app_role
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_id = 'cfc7e6e5-ef2c-47e1-a4b9-7a3f75e6499e' AND role = 'super_admin'
);

DELETE FROM public.user_roles
WHERE user_id = 'cfc7e6e5-ef2c-47e1-a4b9-7a3f75e6499e' AND role = 'user';
