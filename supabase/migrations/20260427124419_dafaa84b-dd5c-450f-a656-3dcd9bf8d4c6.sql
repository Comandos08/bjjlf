-- Sequence for registration numbers
CREATE SEQUENCE IF NOT EXISTS public.event_registration_seq START 1;

-- event_prices
CREATE TABLE public.event_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL,
  category text NOT NULL,
  modality text NOT NULL,
  amount_cents integer NOT NULL DEFAULT 15000,
  early_bird_cents integer,
  early_bird_until date,
  currency text NOT NULL DEFAULT 'BRL',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_event_prices_event ON public.event_prices(event_id);

ALTER TABLE public.event_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read event prices"
  ON public.event_prices FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert event prices"
  ON public.event_prices FOR INSERT TO authenticated
  WITH CHECK (has_admin_role(ARRAY['editor'::text, 'super_admin'::text]));

CREATE POLICY "Admins can update event prices"
  ON public.event_prices FOR UPDATE TO authenticated
  USING (has_admin_role(ARRAY['editor'::text, 'super_admin'::text]))
  WITH CHECK (has_admin_role(ARRAY['editor'::text, 'super_admin'::text]));

CREATE POLICY "Admins can delete event prices"
  ON public.event_prices FOR DELETE TO authenticated
  USING (has_admin_role(ARRAY['super_admin'::text]));

-- event_registrations
CREATE TABLE public.event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  belt text NOT NULL,
  degree integer NOT NULL DEFAULT 0,
  academy text,
  professor text,
  country text DEFAULT 'Brasil',
  category text NOT NULL,
  weight_class text NOT NULL,
  modality text NOT NULL,
  athlete_id uuid REFERENCES public.athlete_profiles(id) ON DELETE SET NULL,
  user_id uuid,
  status text NOT NULL DEFAULT 'pending_payment',
  stripe_session_id text,
  stripe_payment_intent text,
  amount_cents integer NOT NULL DEFAULT 15000,
  paid_at timestamptz,
  registration_number text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_event_registrations_event ON public.event_registrations(event_id);
CREATE INDEX idx_event_registrations_user ON public.event_registrations(user_id);
CREATE INDEX idx_event_registrations_status ON public.event_registrations(status);

-- Status validation trigger (avoid CHECK constraint for flexibility)
CREATE OR REPLACE FUNCTION public.validate_registration_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status NOT IN ('pending_payment','confirmed','cancelled','refunded') THEN
    RAISE EXCEPTION 'Invalid status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_registration_status
  BEFORE INSERT OR UPDATE ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION public.validate_registration_status();

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_event_registrations_updated_at
  BEFORE UPDATE ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- registration_number generator: BJJLF-EVT-{YEAR}-{00001}
CREATE OR REPLACE FUNCTION public.generate_event_registration_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  next_num integer;
BEGIN
  IF NEW.registration_number IS NULL AND NEW.status = 'confirmed' THEN
    next_num := nextval('public.event_registration_seq');
    NEW.registration_number := 'BJJLF-EVT-' || EXTRACT(YEAR FROM now())::text || '-' || lpad(next_num::text, 5, '0');
    IF NEW.paid_at IS NULL THEN
      NEW.paid_at := now();
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_generate_event_registration_number
  BEFORE INSERT OR UPDATE ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION public.generate_event_registration_number();

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Public can create registrations (signup público para campeonatos)
CREATE POLICY "Anyone can create a registration"
  ON public.event_registrations FOR INSERT
  WITH CHECK (true);

-- Athletes see own registrations
CREATE POLICY "Athletes can view own registrations"
  ON public.event_registrations FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Admins see all
CREATE POLICY "Admins can view all registrations"
  ON public.event_registrations FOR SELECT TO authenticated
  USING (has_admin_role(ARRAY['editor'::text, 'super_admin'::text]));

-- Admins can update (e.g. cancel)
CREATE POLICY "Admins can update registrations"
  ON public.event_registrations FOR UPDATE TO authenticated
  USING (has_admin_role(ARRAY['editor'::text, 'super_admin'::text]))
  WITH CHECK (has_admin_role(ARRAY['editor'::text, 'super_admin'::text]));

-- Only super_admin can delete
CREATE POLICY "Super admins can delete registrations"
  ON public.event_registrations FOR DELETE TO authenticated
  USING (has_admin_role(ARRAY['super_admin'::text]));