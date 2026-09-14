ALTER TABLE public.works
  ADD COLUMN IF NOT EXISTS orientation text NOT NULL DEFAULT 'landscape',
  ADD COLUMN IF NOT EXISTS show_on_home boolean NOT NULL DEFAULT false;