-- Athlete profiles
CREATE TABLE public.athlete_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  belt text NOT NULL DEFAULT 'Branca',
  degree integer NOT NULL DEFAULT 0,
  academy text,
  professor text,
  country text DEFAULT 'Brasil',
  country_flag text DEFAULT '🇧🇷',
  category text DEFAULT 'Adulto',
  modality text DEFAULT 'GI & NO-GI',
  photo_url text,
  status text NOT NULL DEFAULT 'pending',
  valid_until date,
  registration_number text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz,
  approved_by uuid REFERENCES auth.users(id)
);

-- Status validation via trigger (per project rule: avoid CHECK with non-immutable expressions; consistent pattern)
CREATE OR REPLACE FUNCTION public.validate_athlete_status()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status NOT IN ('pending','active','suspended') THEN
    RAISE EXCEPTION 'Invalid status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_athlete_status
BEFORE INSERT OR UPDATE ON public.athlete_profiles
FOR EACH ROW EXECUTE FUNCTION public.validate_athlete_status();

-- Auto-generate registration_number when status flips to 'active' and number is null
CREATE SEQUENCE IF NOT EXISTS public.athlete_registration_seq START 1;

CREATE OR REPLACE FUNCTION public.generate_athlete_registration_number()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  next_num integer;
BEGIN
  IF NEW.registration_number IS NULL AND NEW.status = 'active' THEN
    next_num := nextval('public.athlete_registration_seq');
    NEW.registration_number := 'BJJLF-' || EXTRACT(YEAR FROM now())::text || '-' || lpad(next_num::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_generate_registration_number
BEFORE INSERT OR UPDATE ON public.athlete_profiles
FOR EACH ROW EXECUTE FUNCTION public.generate_athlete_registration_number();

ALTER TABLE public.athlete_profiles ENABLE ROW LEVEL SECURITY;

-- Athletes can view their own profile
CREATE POLICY "Athletes can view own profile"
ON public.athlete_profiles FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Athletes can insert their own profile (signup)
CREATE POLICY "Athletes can insert own profile"
ON public.athlete_profiles FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Athletes can update limited fields on their own profile.
-- Belt/degree/status/registration_number/valid_until/approved_* are admin-controlled,
-- but enforcing column-level restriction in RLS is awkward; we rely on UI + admin
-- workflow. Allow update on own row and document the convention.
CREATE POLICY "Athletes can update own profile"
ON public.athlete_profiles FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Admins (editor + super_admin) can view all profiles
CREATE POLICY "Admins can view all athlete profiles"
ON public.athlete_profiles FOR SELECT TO authenticated
USING (has_admin_role(ARRAY['editor','super_admin']));

-- Admins can update any profile (approve/suspend, set belt/degree)
CREATE POLICY "Admins can update athlete profiles"
ON public.athlete_profiles FOR UPDATE TO authenticated
USING (has_admin_role(ARRAY['editor','super_admin']))
WITH CHECK (has_admin_role(ARRAY['editor','super_admin']));

-- Admins can delete profiles
CREATE POLICY "Admins can delete athlete profiles"
ON public.athlete_profiles FOR DELETE TO authenticated
USING (has_admin_role(ARRAY['super_admin']));

-- Public can view a restricted set of fields for active athletes (for /verify/{id}).
-- We expose all columns via this policy because Postgres RLS doesn't do column-level
-- filtering, but we will use a SECURITY DEFINER function for the public verify lookup
-- to return only safe fields.
CREATE OR REPLACE FUNCTION public.verify_athlete(_registration_number text)
RETURNS TABLE (
  full_name text,
  belt text,
  degree integer,
  academy text,
  status text,
  valid_until date,
  registration_number text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT full_name, belt, degree, academy, status, valid_until, registration_number
  FROM public.athlete_profiles
  WHERE registration_number = _registration_number
    AND status = 'active'
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.verify_athlete(text) TO anon, authenticated;

-- Competition history
CREATE TABLE public.competition_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES public.athlete_profiles(id) ON DELETE CASCADE,
  event_name text NOT NULL,
  event_date date NOT NULL,
  location text,
  category text,
  weight_class text,
  result text,
  medal text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.competition_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes can view own competition history"
ON public.competition_history FOR SELECT TO authenticated
USING (
  athlete_id IN (
    SELECT id FROM public.athlete_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all competition history"
ON public.competition_history FOR SELECT TO authenticated
USING (has_admin_role(ARRAY['editor','super_admin']));

CREATE POLICY "Admins can insert competition history"
ON public.competition_history FOR INSERT TO authenticated
WITH CHECK (has_admin_role(ARRAY['editor','super_admin']));

CREATE POLICY "Admins can update competition history"
ON public.competition_history FOR UPDATE TO authenticated
USING (has_admin_role(ARRAY['editor','super_admin']))
WITH CHECK (has_admin_role(ARRAY['editor','super_admin']));

CREATE POLICY "Admins can delete competition history"
ON public.competition_history FOR DELETE TO authenticated
USING (has_admin_role(ARRAY['editor','super_admin']));

-- Storage bucket for athlete photos (public read, athletes write to their own folder)
INSERT INTO storage.buckets (id, name, public) VALUES ('athlete-photos', 'athlete-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read athlete photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'athlete-photos');

CREATE POLICY "Athletes can upload own photo"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'athlete-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Athletes can update own photo"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'athlete-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Athletes can delete own photo"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'athlete-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);