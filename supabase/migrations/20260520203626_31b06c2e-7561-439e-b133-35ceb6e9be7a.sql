
-- Quotation status enum
DO $$ BEGIN
  CREATE TYPE public.os_quotation_status AS ENUM (
    'draft','sent','approved','rejected','revised','expired','converted'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Sequence for IK-QTN-YYYY-0001 numbering
CREATE SEQUENCE IF NOT EXISTS public.os_quotation_seq START 1;

CREATE OR REPLACE FUNCTION public.next_quotation_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  n bigint;
BEGIN
  n := nextval('public.os_quotation_seq');
  RETURN 'IK-QTN-' || to_char(now(), 'YYYY') || '-' || lpad(n::text, 4, '0');
END;
$$;

-- Main quotation table
CREATE TABLE IF NOT EXISTS public.os_quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_number text UNIQUE NOT NULL DEFAULT public.next_quotation_number(),
  status public.os_quotation_status NOT NULL DEFAULT 'draft',

  -- Business
  company_name text NOT NULL DEFAULT 'iKAMBA',
  company_address text,
  company_email text,
  company_phone text,
  company_tin text,
  prepared_by_user_id uuid,
  prepared_by_name text,

  -- Client
  client_name text NOT NULL,
  client_contact_person text,
  client_email text,
  client_phone text,
  client_address text,
  client_type text,

  -- Project
  project_name text,
  product_line text,
  service_category text,
  project_objective text,
  location text,
  shoot_date date,
  delivery_timeline text,
  quotation_date date NOT NULL DEFAULT current_date,
  valid_until date,
  currency text NOT NULL DEFAULT 'RWF',

  -- Pricing
  subtotal numeric NOT NULL DEFAULT 0,
  discount_type text NOT NULL DEFAULT 'none', -- none | fixed | percent
  discount_value numeric NOT NULL DEFAULT 0,
  discount_amount numeric NOT NULL DEFAULT 0,
  tax_percent numeric NOT NULL DEFAULT 0,
  tax_amount numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  advance_percent numeric NOT NULL DEFAULT 50,
  advance_amount numeric NOT NULL DEFAULT 0,
  balance_amount numeric NOT NULL DEFAULT 0,
  amount_in_words text,

  -- Internal totals (cached)
  total_cost_estimate numeric NOT NULL DEFAULT 0,
  estimated_profit numeric NOT NULL DEFAULT 0,
  profit_margin numeric NOT NULL DEFAULT 0,

  -- Content
  terms text,
  notes text,
  show_internal_costs_on_pdf boolean NOT NULL DEFAULT false,

  -- Linkage
  converted_project_id uuid,
  converted_legacy_project_id uuid,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.os_quotation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid NOT NULL REFERENCES public.os_quotations(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'deliverable', -- deliverable | addon
  position int NOT NULL DEFAULT 0,
  name text NOT NULL,
  description text,
  quantity numeric NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  amount numeric NOT NULL DEFAULT 0,
  included boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.os_quotation_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid NOT NULL REFERENCES public.os_quotations(id) ON DELETE CASCADE,
  category text NOT NULL,
  description text,
  amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS os_quotation_items_quotation_id_idx ON public.os_quotation_items(quotation_id);
CREATE INDEX IF NOT EXISTS os_quotation_costs_quotation_id_idx ON public.os_quotation_costs(quotation_id);
CREATE INDEX IF NOT EXISTS os_quotations_status_idx ON public.os_quotations(status);

-- updated_at trigger
DROP TRIGGER IF EXISTS trg_os_quotations_updated_at ON public.os_quotations;
CREATE TRIGGER trg_os_quotations_updated_at
BEFORE UPDATE ON public.os_quotations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.os_quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.os_quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.os_quotation_costs ENABLE ROW LEVEL SECURITY;

-- Quotations: owner or admin
DROP POLICY IF EXISTS "Q view own or admin" ON public.os_quotations;
CREATE POLICY "Q view own or admin" ON public.os_quotations FOR SELECT TO authenticated
USING (prepared_by_user_id = auth.uid() OR app_private.is_admin_role(auth.uid()));

DROP POLICY IF EXISTS "Q insert own" ON public.os_quotations;
CREATE POLICY "Q insert own" ON public.os_quotations FOR INSERT TO authenticated
WITH CHECK (prepared_by_user_id = auth.uid() OR app_private.is_admin_role(auth.uid()));

DROP POLICY IF EXISTS "Q update own or admin" ON public.os_quotations;
CREATE POLICY "Q update own or admin" ON public.os_quotations FOR UPDATE TO authenticated
USING (prepared_by_user_id = auth.uid() OR app_private.is_admin_role(auth.uid()))
WITH CHECK (prepared_by_user_id = auth.uid() OR app_private.is_admin_role(auth.uid()));

DROP POLICY IF EXISTS "Q delete own or admin" ON public.os_quotations;
CREATE POLICY "Q delete own or admin" ON public.os_quotations FOR DELETE TO authenticated
USING (prepared_by_user_id = auth.uid() OR app_private.is_admin_role(auth.uid()));

-- Helper to check parent quotation ownership
CREATE OR REPLACE FUNCTION public.user_owns_quotation(_quotation_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.os_quotations q
    WHERE q.id = _quotation_id
      AND (q.prepared_by_user_id = auth.uid() OR app_private.is_admin_role(auth.uid()))
  )
$$;

-- Items
DROP POLICY IF EXISTS "QI view" ON public.os_quotation_items;
CREATE POLICY "QI view" ON public.os_quotation_items FOR SELECT TO authenticated
USING (public.user_owns_quotation(quotation_id));
DROP POLICY IF EXISTS "QI insert" ON public.os_quotation_items;
CREATE POLICY "QI insert" ON public.os_quotation_items FOR INSERT TO authenticated
WITH CHECK (public.user_owns_quotation(quotation_id));
DROP POLICY IF EXISTS "QI update" ON public.os_quotation_items;
CREATE POLICY "QI update" ON public.os_quotation_items FOR UPDATE TO authenticated
USING (public.user_owns_quotation(quotation_id))
WITH CHECK (public.user_owns_quotation(quotation_id));
DROP POLICY IF EXISTS "QI delete" ON public.os_quotation_items;
CREATE POLICY "QI delete" ON public.os_quotation_items FOR DELETE TO authenticated
USING (public.user_owns_quotation(quotation_id));

-- Costs (same pattern; only owner/admin)
DROP POLICY IF EXISTS "QC view" ON public.os_quotation_costs;
CREATE POLICY "QC view" ON public.os_quotation_costs FOR SELECT TO authenticated
USING (public.user_owns_quotation(quotation_id));
DROP POLICY IF EXISTS "QC insert" ON public.os_quotation_costs;
CREATE POLICY "QC insert" ON public.os_quotation_costs FOR INSERT TO authenticated
WITH CHECK (public.user_owns_quotation(quotation_id));
DROP POLICY IF EXISTS "QC update" ON public.os_quotation_costs;
CREATE POLICY "QC update" ON public.os_quotation_costs FOR UPDATE TO authenticated
USING (public.user_owns_quotation(quotation_id))
WITH CHECK (public.user_owns_quotation(quotation_id));
DROP POLICY IF EXISTS "QC delete" ON public.os_quotation_costs;
CREATE POLICY "QC delete" ON public.os_quotation_costs FOR DELETE TO authenticated
USING (public.user_owns_quotation(quotation_id));
