ALTER TABLE public.popup_settings
  ADD COLUMN IF NOT EXISTS target_path text NOT NULL DEFAULT 'all';

ALTER TABLE public.popup_settings
  DROP CONSTRAINT IF EXISTS popup_settings_target_path_check;

ALTER TABLE public.popup_settings
  ADD CONSTRAINT popup_settings_target_path_check
  CHECK (target_path IN ('all', '/', '/solutions', '/work', '/how-it-works', '/insights', '/about', '/contact', '/start-a-project', '/login', '/signup', '/os'));

CREATE INDEX IF NOT EXISTS idx_popup_settings_enabled_target
ON public.popup_settings (enabled, target_path);