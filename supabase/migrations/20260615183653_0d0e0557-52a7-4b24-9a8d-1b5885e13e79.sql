ALTER TABLE public.os_quotations
  ADD COLUMN IF NOT EXISTS canvas_blocks jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS canvas_enabled boolean NOT NULL DEFAULT false;