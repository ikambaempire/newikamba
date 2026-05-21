
-- 1) Fix "permission denied for function is_internal_role"
GRANT EXECUTE ON FUNCTION public.is_internal_role(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_bootstrap_super_admin(uuid) TO authenticated, anon;

-- 2) Popup designer fields
ALTER TABLE public.popup_settings
  ADD COLUMN IF NOT EXISTS layout text NOT NULL DEFAULT 'media_left',
  ADD COLUMN IF NOT EXISTS bg_color text DEFAULT '#0C2C47',
  ADD COLUMN IF NOT EXISTS text_color text DEFAULT '#FFFFFF',
  ADD COLUMN IF NOT EXISTS accent_color text DEFAULT '#D4A739',
  ADD COLUMN IF NOT EXISTS button_bg_color text DEFAULT '#D4A739',
  ADD COLUMN IF NOT EXISTS button_text_color text DEFAULT '#0C2C47',
  ADD COLUMN IF NOT EXISTS text_align text NOT NULL DEFAULT 'left',
  ADD COLUMN IF NOT EXISTS heading_size text NOT NULL DEFAULT 'lg',
  ADD COLUMN IF NOT EXISTS overlay_opacity int NOT NULL DEFAULT 60,
  ADD COLUMN IF NOT EXISTS show_form boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS eyebrow text;

-- 3) Profile editable fields  
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS role_title text,
  ADD COLUMN IF NOT EXISTS department text;
