CREATE TABLE public.member_benefits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_url text,
  category text NOT NULL,
  value_label text,
  discount_label text,
  external_link text,
  is_featured boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.member_benefits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active benefits"
  ON public.member_benefits FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all benefits"
  ON public.member_benefits FOR SELECT
  TO authenticated
  USING (has_admin_role(ARRAY['editor'::text, 'super_admin'::text]));

CREATE POLICY "Editors and super admins can insert benefits"
  ON public.member_benefits FOR INSERT
  TO authenticated
  WITH CHECK (has_admin_role(ARRAY['editor'::text, 'super_admin'::text]));

CREATE POLICY "Editors and super admins can update benefits"
  ON public.member_benefits FOR UPDATE
  TO authenticated
  USING (has_admin_role(ARRAY['editor'::text, 'super_admin'::text]))
  WITH CHECK (has_admin_role(ARRAY['editor'::text, 'super_admin'::text]));

CREATE POLICY "Super admins can delete benefits"
  ON public.member_benefits FOR DELETE
  TO authenticated
  USING (has_admin_role(ARRAY['super_admin'::text]));