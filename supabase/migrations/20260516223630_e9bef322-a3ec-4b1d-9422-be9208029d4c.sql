
CREATE TABLE public.os_expense_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  requester_name text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0),
  needed_by date,
  receipt_url text,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  decided_by uuid,
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.os_expense_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own or admin views all"
  ON public.os_expense_requests FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users insert own"
  ON public.os_expense_requests FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Update own pending or admin"
  ON public.os_expense_requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin') OR (user_id = auth.uid() AND status = 'pending'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR (user_id = auth.uid() AND status = 'pending'));

CREATE POLICY "Delete own pending or admin"
  ON public.os_expense_requests FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin') OR (user_id = auth.uid() AND status = 'pending'));

CREATE TRIGGER trg_os_expense_requests_updated
  BEFORE UPDATE ON public.os_expense_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
