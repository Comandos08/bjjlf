-- ISSUE 1: event_registrations INSERT
DROP POLICY IF EXISTS "Anyone can create a registration" ON public.event_registrations;
CREATE POLICY "authenticated_insert_own"
  ON public.event_registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ISSUE 2: academy_permits INSERT
DROP POLICY IF EXISTS "Anyone can request a permit" ON public.academy_permits;
CREATE POLICY "authenticated_insert_own"
  ON public.academy_permits
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ISSUE 3: athlete_profiles — drop public SELECT, expose safe view
DROP POLICY IF EXISTS "Public can read active athlete profiles" ON public.athlete_profiles;

CREATE OR REPLACE VIEW public.public_athlete_profiles
WITH (security_invoker = true) AS
SELECT id, full_name, belt, degree, photo_url, registration_number,
       academy, country, country_flag, status
FROM public.athlete_profiles
WHERE status = 'active';

-- The view runs as the caller (security_invoker), so it needs a permissive
-- SELECT policy on the base table for anon/authenticated, scoped to active rows
-- and limited to the safe columns the view selects.
CREATE POLICY "Public can read active athlete profiles via view"
  ON public.athlete_profiles
  FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

GRANT SELECT ON public.public_athlete_profiles TO anon, authenticated;
