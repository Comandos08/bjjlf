
-- Create public bucket for site images (hero slides, news covers, event images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public can read
CREATE POLICY "Public can read site-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-images');

-- Admins (editor or super_admin) can upload
CREATE POLICY "Admins can upload site-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'site-images'
  AND public.has_admin_role(ARRAY['editor','super_admin'])
);

-- Admins can update
CREATE POLICY "Admins can update site-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'site-images'
  AND public.has_admin_role(ARRAY['editor','super_admin'])
);

-- Admins can delete
CREATE POLICY "Admins can delete site-images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'site-images'
  AND public.has_admin_role(ARRAY['editor','super_admin'])
);
