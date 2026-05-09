CREATE TABLE public.diploma_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT,
  affiliate_code TEXT NOT NULL,
  affiliate_source TEXT NOT NULL DEFAULT 'manual',
  belt TEXT NOT NULL,
  martial_art TEXT NOT NULL DEFAULT 'Brazilian Jiu-Jitsu',
  language TEXT NOT NULL DEFAULT 'pt',
  currency TEXT NOT NULL DEFAULT 'BRL',
  price NUMERIC NOT NULL DEFAULT 0
);

ALTER TABLE public.diploma_leads ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_diploma_leads_created_at ON public.diploma_leads (created_at DESC);
CREATE INDEX idx_diploma_leads_affiliate_code ON public.diploma_leads (affiliate_code);

CREATE POLICY "Admins can view diploma leads"
ON public.diploma_leads
FOR SELECT
TO authenticated
USING (public.has_admin_role(ARRAY['editor'::text, 'super_admin'::text]));

CREATE POLICY "Super admins can delete diploma leads"
ON public.diploma_leads
FOR DELETE
TO authenticated
USING (public.has_admin_role(ARRAY['super_admin'::text]));
