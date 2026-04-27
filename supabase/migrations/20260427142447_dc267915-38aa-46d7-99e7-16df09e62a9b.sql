-- ===== Academy Permits (Alvará Digital) =====

CREATE SEQUENCE IF NOT EXISTS public.academy_permit_seq START 1;

CREATE TABLE public.academy_permits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Academy data
  academy_name text NOT NULL,
  responsible_name text NOT NULL,
  email text NOT NULL,
  phone text,
  address text,
  city text NOT NULL,
  state text,
  country text NOT NULL DEFAULT 'Brasil',
  country_flag text DEFAULT '🇧🇷',
  website text,

  -- Optional links
  academy_id uuid REFERENCES public.affiliated_academies(id) ON DELETE SET NULL,
  user_id uuid,

  -- Status
  status text NOT NULL DEFAULT 'pending_payment',

  -- Permit number
  permit_number text UNIQUE,

  -- Validity
  issued_at date,
  expires_at date,

  -- Payment
  stripe_session_id text,
  stripe_payment_intent text,
  amount_cents integer NOT NULL DEFAULT 30000,
  paid_at timestamptz,

  -- Renewals
  renewal_count integer NOT NULL DEFAULT 0,
  previous_permit_id uuid REFERENCES public.academy_permits(id) ON DELETE SET NULL,

  -- Alerts
  alert_30_sent boolean NOT NULL DEFAULT false,
  alert_7_sent boolean NOT NULL DEFAULT false,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_academy_permits_status ON public.academy_permits(status);
CREATE INDEX idx_academy_permits_user_id ON public.academy_permits(user_id);
CREATE INDEX idx_academy_permits_expires_at ON public.academy_permits(expires_at);

-- Status validation trigger (avoids CHECK with text mutability)
CREATE OR REPLACE FUNCTION public.validate_permit_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status NOT IN ('pending_payment','active','expired','suspended','cancelled') THEN
    RAISE EXCEPTION 'Invalid permit status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_permit_status
BEFORE INSERT OR UPDATE ON public.academy_permits
FOR EACH ROW EXECUTE FUNCTION public.validate_permit_status();

-- Generate permit number when activating
CREATE OR REPLACE FUNCTION public.generate_academy_permit_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  next_num integer;
BEGIN
  IF NEW.permit_number IS NULL AND NEW.status = 'active' THEN
    next_num := nextval('public.academy_permit_seq');
    NEW.permit_number := 'BJJLF-ACA-' || EXTRACT(YEAR FROM now())::text || '-' || lpad(next_num::text, 5, '0');
  END IF;

  -- Set issued_at if missing on activation
  IF NEW.status = 'active' AND NEW.issued_at IS NULL THEN
    NEW.issued_at := CURRENT_DATE;
  END IF;

  -- Compute expires_at = issued_at + 1 year
  IF NEW.issued_at IS NOT NULL AND (NEW.expires_at IS NULL OR (TG_OP = 'UPDATE' AND OLD.issued_at IS DISTINCT FROM NEW.issued_at)) THEN
    NEW.expires_at := NEW.issued_at + INTERVAL '1 year';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_generate_academy_permit_number
BEFORE INSERT OR UPDATE ON public.academy_permits
FOR EACH ROW EXECUTE FUNCTION public.generate_academy_permit_number();

-- updated_at trigger (reuses existing set_updated_at)
CREATE TRIGGER trg_academy_permits_updated_at
BEFORE UPDATE ON public.academy_permits
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Enable RLS
ALTER TABLE public.academy_permits ENABLE ROW LEVEL SECURITY;

-- INSERT: anyone (public form)
CREATE POLICY "Anyone can request a permit"
ON public.academy_permits
FOR INSERT
TO public
WITH CHECK (true);

-- SELECT: owner can read own permits
CREATE POLICY "Users can view own permits"
ON public.academy_permits
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- SELECT: admins (editor + super_admin) can read all
CREATE POLICY "Admins can view all permits"
ON public.academy_permits
FOR SELECT
TO authenticated
USING (has_admin_role(ARRAY['editor'::text, 'super_admin'::text]));

-- UPDATE: admins (editor + super_admin)
CREATE POLICY "Admins can update permits"
ON public.academy_permits
FOR UPDATE
TO authenticated
USING (has_admin_role(ARRAY['editor'::text, 'super_admin'::text]))
WITH CHECK (has_admin_role(ARRAY['editor'::text, 'super_admin'::text]));

-- DELETE: super admins
CREATE POLICY "Super admins can delete permits"
ON public.academy_permits
FOR DELETE
TO authenticated
USING (has_admin_role(ARRAY['super_admin'::text]));

-- Public verification function
CREATE OR REPLACE FUNCTION public.verify_academy_permit(p_permit_number text)
RETURNS TABLE (
  academy_name text,
  responsible_name text,
  city text,
  country text,
  country_flag text,
  status text,
  issued_at date,
  expires_at date,
  permit_number text,
  renewal_count integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    academy_name,
    responsible_name,
    city,
    country,
    country_flag,
    status,
    issued_at,
    expires_at,
    permit_number,
    renewal_count
  FROM public.academy_permits
  WHERE permit_number = p_permit_number
  LIMIT 1;
$$;

-- Function to lookup own permit by number (used on /my-permit/$number page)
CREATE OR REPLACE FUNCTION public.get_own_permit(p_permit_number text)
RETURNS SETOF public.academy_permits
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.academy_permits
  WHERE permit_number = p_permit_number
    AND (user_id = auth.uid() OR status = 'active')
  LIMIT 1;
$$;