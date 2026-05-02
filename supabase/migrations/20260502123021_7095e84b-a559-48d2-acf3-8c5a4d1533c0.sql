CREATE TABLE IF NOT EXISTS public.impact_audit_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  organization text,
  email text NOT NULL,
  whatsapp text,
  source text NOT NULL DEFAULT 'website',
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.impact_audit_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit audit leads"
ON public.impact_audit_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(name)) BETWEEN 2 AND 120
  AND email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  AND (organization IS NULL OR length(organization) <= 160)
  AND (whatsapp IS NULL OR length(whatsapp) <= 40)
);

CREATE POLICY "Internal users can manage audit leads"
ON public.impact_audit_leads
FOR ALL
TO authenticated
USING (public.is_internal_role(auth.uid()))
WITH CHECK (public.is_internal_role(auth.uid()));

CREATE TABLE IF NOT EXISTS public.popup_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  popup_type text NOT NULL DEFAULT 'time_delay',
  enabled boolean NOT NULL DEFAULT false,
  title text NOT NULL DEFAULT 'Get Your Free Impact Story Audit',
  message text NOT NULL DEFAULT 'Find the clearest story your organization should be telling right now.',
  button_text text NOT NULL DEFAULT 'Get Audit',
  button_link text NOT NULL DEFAULT '#audit',
  delay_seconds integer NOT NULL DEFAULT 8,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT popup_settings_type_check CHECK (popup_type IN ('time_delay', 'exit_intent')),
  CONSTRAINT popup_settings_delay_check CHECK (delay_seconds >= 1 AND delay_seconds <= 120)
);

ALTER TABLE public.popup_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enabled popups are public"
ON public.popup_settings
FOR SELECT
TO anon, authenticated
USING (enabled = true);

CREATE POLICY "Internal users can manage popup settings"
ON public.popup_settings
FOR ALL
TO authenticated
USING (public.is_internal_role(auth.uid()))
WITH CHECK (public.is_internal_role(auth.uid()));

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

DROP TRIGGER IF EXISTS update_impact_audit_leads_updated_at ON public.impact_audit_leads;
CREATE TRIGGER update_impact_audit_leads_updated_at
BEFORE UPDATE ON public.impact_audit_leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_popup_settings_updated_at ON public.popup_settings;
CREATE TRIGGER update_popup_settings_updated_at
BEFORE UPDATE ON public.popup_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();