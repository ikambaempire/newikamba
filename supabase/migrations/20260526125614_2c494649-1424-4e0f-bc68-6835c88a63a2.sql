
-- Shared pipeline projects table
CREATE TABLE public.os_pipeline_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  client text NOT NULL DEFAULT '',
  contact_person text,
  phone text,
  email text,
  product_line text,
  service text,
  objective text,
  brief text,
  deliverables text,
  shoot_date text,
  location text,
  deadline text,
  budget_range text,
  payment_terms text,
  owner text,
  assigned_to_user_id uuid,
  assigned_to_name text,
  notes text,
  "references" text,
  stage text NOT NULL DEFAULT 'New Request',
  value numeric NOT NULL DEFAULT 0,
  paid numeric NOT NULL DEFAULT 0,
  costs_total numeric NOT NULL DEFAULT 0,
  next_action text,
  payment_status text NOT NULL DEFAULT 'Pending',
  custom_fields jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.os_pipeline_projects ENABLE ROW LEVEL SECURITY;

-- Shared workspace: any authenticated team member can see + manage pipeline projects
CREATE POLICY "Authenticated view pipeline projects"
  ON public.os_pipeline_projects FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated insert pipeline projects"
  ON public.os_pipeline_projects FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated update pipeline projects"
  ON public.os_pipeline_projects FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated delete pipeline projects"
  ON public.os_pipeline_projects FOR DELETE
  TO authenticated USING (true);

CREATE TRIGGER trg_os_pipeline_projects_updated
  BEFORE UPDATE ON public.os_pipeline_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Realtime
ALTER TABLE public.os_pipeline_projects REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.os_pipeline_projects;
