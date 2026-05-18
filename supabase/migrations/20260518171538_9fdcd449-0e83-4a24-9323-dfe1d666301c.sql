
ALTER TABLE public.popup_settings 
  ADD COLUMN IF NOT EXISTS media_url text,
  ADD COLUMN IF NOT EXISTS media_type text;

INSERT INTO storage.buckets (id, name, public)
VALUES ('popup-media', 'popup-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Popup media is publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'popup-media');

CREATE POLICY "Admins manage popup media"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'popup-media' AND app_private.is_admin_role(auth.uid()))
WITH CHECK (bucket_id = 'popup-media' AND app_private.is_admin_role(auth.uid()));
