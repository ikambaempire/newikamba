DROP POLICY IF EXISTS "Avatars public read" ON storage.objects;
CREATE POLICY "Avatar files can be opened by path"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars' AND name <> '');