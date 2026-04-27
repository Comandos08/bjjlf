ALTER TABLE public.athlete_profiles
ADD COLUMN IF NOT EXISTS first_login_completed boolean NOT NULL DEFAULT false;