
CREATE TABLE public.works (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT,
  content TEXT,
  cover_url TEXT,
  video_url TEXT,
  category TEXT,
  year TEXT,
  client_name TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.works TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.works TO authenticated;
GRANT ALL ON public.works TO service_role;

ALTER TABLE public.works ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published works"
  ON public.works FOR SELECT
  USING (
    published = true
    OR public.has_role(auth.uid(), 'super_admin')
    OR public.has_role(auth.uid(), 'org_admin')
  );

CREATE POLICY "Admins can insert works"
  ON public.works FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'super_admin')
    OR public.has_role(auth.uid(), 'org_admin')
  );

CREATE POLICY "Admins can update works"
  ON public.works FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin')
    OR public.has_role(auth.uid(), 'org_admin')
  );

CREATE POLICY "Admins can delete works"
  ON public.works FOR DELETE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin')
    OR public.has_role(auth.uid(), 'org_admin')
  );

CREATE TRIGGER works_set_updated_at
  BEFORE UPDATE ON public.works
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Public can read works-media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'works-media');

CREATE POLICY "Admins can upload works-media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'works-media'
    AND (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'org_admin'))
  );

CREATE POLICY "Admins can update works-media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'works-media'
    AND (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'org_admin'))
  );

CREATE POLICY "Admins can delete works-media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'works-media'
    AND (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'org_admin'))
  );
