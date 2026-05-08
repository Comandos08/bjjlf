-- Extend academy_permits with new columns for unified registration flow
ALTER TABLE public.academy_permits
  ADD COLUMN IF NOT EXISTS academy_logo_url text,
  ADD COLUMN IF NOT EXISTS country_code char(2),
  ADD COLUMN IF NOT EXISTS instagram text,
  ADD COLUMN IF NOT EXISTS additional_professors jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS athlete_id uuid;

-- Update permit status validation trigger to allow new statuses
CREATE OR REPLACE FUNCTION public.validate_permit_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status NOT IN ('pending_payment','pending','active','expired','suspended','cancelled','rejected','revoked') THEN
    RAISE EXCEPTION 'Invalid permit status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$function$;

-- Public view: only active (approved) permits exposed as affiliated academies
CREATE OR REPLACE VIEW public.affiliated_academies_view AS
SELECT
  id,
  academy_name AS name,
  academy_logo_url AS logo_url,
  city,
  state,
  country,
  country_code,
  country_flag,
  phone,
  website,
  instagram,
  athlete_id,
  responsible_name AS professor,
  issued_at AS approved_at,
  expires_at,
  permit_number
FROM public.academy_permits
WHERE status = 'active';

GRANT SELECT ON public.affiliated_academies_view TO anon, authenticated;