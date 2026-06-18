ALTER TABLE public.os_quotations
  ADD COLUMN IF NOT EXISTS template_format text NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS team_section text,
  ADD COLUMN IF NOT EXISTS equipment_section text;