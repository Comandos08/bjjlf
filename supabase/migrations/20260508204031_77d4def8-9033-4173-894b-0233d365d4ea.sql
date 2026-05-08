ALTER TABLE public.athlete_profiles
  ADD COLUMN IF NOT EXISTS is_certified boolean NOT NULL DEFAULT false;

CREATE OR REPLACE VIEW public.public_athlete_profiles
WITH (security_invoker = true) AS
SELECT id, full_name, belt, degree, photo_url, registration_number,
       academy, country, country_flag, status, is_certified
FROM public.athlete_profiles
WHERE status = 'active';

GRANT SELECT ON public.public_athlete_profiles TO anon, authenticated;