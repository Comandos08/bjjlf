CREATE POLICY "Public can read active athlete profiles"
ON public.athlete_profiles
FOR SELECT
TO public
USING (status = 'active');