CREATE POLICY "Public can read active permits"
ON public.academy_permits
FOR SELECT
TO anon, authenticated
USING (status = 'active');