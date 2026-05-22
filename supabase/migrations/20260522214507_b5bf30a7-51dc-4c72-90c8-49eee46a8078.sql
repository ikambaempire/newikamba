
-- 1. Fix silent RLS failure on quotation items/costs
GRANT EXECUTE ON FUNCTION public.user_owns_quotation(uuid) TO authenticated, anon;

-- 2. Partner logos managed in admin settings
CREATE TABLE IF NOT EXISTS public.partner_logos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text NOT NULL,
  website_url text,
  visible boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_logos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visible partner logos are public"
  ON public.partner_logos FOR SELECT
  TO anon, authenticated
  USING (visible = true);

CREATE POLICY "Internal users manage partner logos"
  ON public.partner_logos FOR ALL
  TO authenticated
  USING (public.is_internal_role(auth.uid()))
  WITH CHECK (public.is_internal_role(auth.uid()));

CREATE TRIGGER partner_logos_updated_at
  BEFORE UPDATE ON public.partner_logos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Public storage bucket for logos
INSERT INTO storage.buckets (id, name, public) VALUES ('partner-logos', 'partner-logos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Partner logos publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'partner-logos');

CREATE POLICY "Internal users upload partner logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'partner-logos' AND public.is_internal_role(auth.uid()));

CREATE POLICY "Internal users update partner logos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'partner-logos' AND public.is_internal_role(auth.uid()));

CREATE POLICY "Internal users delete partner logos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'partner-logos' AND public.is_internal_role(auth.uid()));
