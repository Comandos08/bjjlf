-- ============================================================
-- Helper: is the current auth.uid() an active admin in given roles?
-- ============================================================
CREATE OR REPLACE FUNCTION public.has_admin_role(_roles text[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users au
    WHERE au.id = auth.uid()
      AND au.is_active = true
      AND au.role = ANY(_roles)
  );
$$;

-- ============================================================
-- Helper: does any super_admin exist? (used by /admin/setup)
-- ============================================================
CREATE OR REPLACE FUNCTION public.super_admin_exists()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE role = 'super_admin' AND is_active = true
  );
$$;

-- ============================================================
-- Helper: is the current user an active admin (any role)?
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid() AND is_active = true
  );
$$;

-- ============================================================
-- Bootstrap function: only succeeds when zero super_admins exist.
-- Called by /admin/setup right after Supabase Auth signUp.
-- ============================================================
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin(
  _user_id uuid,
  _email text,
  _full_name text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.admin_users WHERE role = 'super_admin') THEN
    RAISE EXCEPTION 'Super admin already exists';
  END IF;

  INSERT INTO public.admin_users (id, email, full_name, role, is_active)
  VALUES (_user_id, _email, _full_name, 'super_admin', true);
END;
$$;

-- Allow anon + authenticated to call setup-related helpers
GRANT EXECUTE ON FUNCTION public.super_admin_exists() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_first_admin(uuid, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_admin_role(text[]) TO authenticated;

-- ============================================================
-- admin_users: super_admin-only read/write (no self-bootstrap path here;
-- the bootstrap function above bypasses RLS via SECURITY DEFINER).
-- ============================================================
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view all admin users"
  ON public.admin_users FOR SELECT TO authenticated
  USING (public.has_admin_role(ARRAY['super_admin']));

CREATE POLICY "Authenticated user can view own admin row"
  ON public.admin_users FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Super admins can insert admin users"
  ON public.admin_users FOR INSERT TO authenticated
  WITH CHECK (public.has_admin_role(ARRAY['super_admin']));

CREATE POLICY "Super admins can update admin users"
  ON public.admin_users FOR UPDATE TO authenticated
  USING (public.has_admin_role(ARRAY['super_admin']))
  WITH CHECK (public.has_admin_role(ARRAY['super_admin']));

CREATE POLICY "Super admins can delete admin users"
  ON public.admin_users FOR DELETE TO authenticated
  USING (public.has_admin_role(ARRAY['super_admin']));

-- ============================================================
-- Content tables: editors + super_admins can write
-- ============================================================
-- events
CREATE POLICY "Editors and super admins can insert events"
  ON public.events FOR INSERT TO authenticated
  WITH CHECK (public.has_admin_role(ARRAY['editor','super_admin']));
CREATE POLICY "Editors and super admins can update events"
  ON public.events FOR UPDATE TO authenticated
  USING (public.has_admin_role(ARRAY['editor','super_admin']))
  WITH CHECK (public.has_admin_role(ARRAY['editor','super_admin']));
CREATE POLICY "Editors and super admins can delete events"
  ON public.events FOR DELETE TO authenticated
  USING (public.has_admin_role(ARRAY['editor','super_admin']));

-- news
CREATE POLICY "Editors and super admins can insert news"
  ON public.news FOR INSERT TO authenticated
  WITH CHECK (public.has_admin_role(ARRAY['editor','super_admin']));
CREATE POLICY "Editors and super admins can update news"
  ON public.news FOR UPDATE TO authenticated
  USING (public.has_admin_role(ARRAY['editor','super_admin']))
  WITH CHECK (public.has_admin_role(ARRAY['editor','super_admin']));
CREATE POLICY "Editors and super admins can delete news"
  ON public.news FOR DELETE TO authenticated
  USING (public.has_admin_role(ARRAY['editor','super_admin']));

-- Editors/super_admins also need to see unpublished news for editing
CREATE POLICY "Admins can view all news"
  ON public.news FOR SELECT TO authenticated
  USING (public.has_admin_role(ARRAY['editor','super_admin']));

-- hero_slides
CREATE POLICY "Editors and super admins can insert hero slides"
  ON public.hero_slides FOR INSERT TO authenticated
  WITH CHECK (public.has_admin_role(ARRAY['editor','super_admin']));
CREATE POLICY "Editors and super admins can update hero slides"
  ON public.hero_slides FOR UPDATE TO authenticated
  USING (public.has_admin_role(ARRAY['editor','super_admin']))
  WITH CHECK (public.has_admin_role(ARRAY['editor','super_admin']));
CREATE POLICY "Editors and super admins can delete hero slides"
  ON public.hero_slides FOR DELETE TO authenticated
  USING (public.has_admin_role(ARRAY['editor','super_admin']));
CREATE POLICY "Admins can view all hero slides"
  ON public.hero_slides FOR SELECT TO authenticated
  USING (public.has_admin_role(ARRAY['editor','super_admin']));

-- youtube_videos
CREATE POLICY "Editors and super admins can insert youtube videos"
  ON public.youtube_videos FOR INSERT TO authenticated
  WITH CHECK (public.has_admin_role(ARRAY['editor','super_admin']));
CREATE POLICY "Editors and super admins can update youtube videos"
  ON public.youtube_videos FOR UPDATE TO authenticated
  USING (public.has_admin_role(ARRAY['editor','super_admin']))
  WITH CHECK (public.has_admin_role(ARRAY['editor','super_admin']));
CREATE POLICY "Editors and super admins can delete youtube videos"
  ON public.youtube_videos FOR DELETE TO authenticated
  USING (public.has_admin_role(ARRAY['editor','super_admin']));
CREATE POLICY "Admins can view all youtube videos"
  ON public.youtube_videos FOR SELECT TO authenticated
  USING (public.has_admin_role(ARRAY['editor','super_admin']));

-- certified_black_belts
CREATE POLICY "Editors and super admins can insert black belts"
  ON public.certified_black_belts FOR INSERT TO authenticated
  WITH CHECK (public.has_admin_role(ARRAY['editor','super_admin']));
CREATE POLICY "Editors and super admins can update black belts"
  ON public.certified_black_belts FOR UPDATE TO authenticated
  USING (public.has_admin_role(ARRAY['editor','super_admin']))
  WITH CHECK (public.has_admin_role(ARRAY['editor','super_admin']));
CREATE POLICY "Editors and super admins can delete black belts"
  ON public.certified_black_belts FOR DELETE TO authenticated
  USING (public.has_admin_role(ARRAY['editor','super_admin']));
CREATE POLICY "Admins can view all black belts"
  ON public.certified_black_belts FOR SELECT TO authenticated
  USING (public.has_admin_role(ARRAY['editor','super_admin']));

-- affiliated_academies
CREATE POLICY "Editors and super admins can insert academies"
  ON public.affiliated_academies FOR INSERT TO authenticated
  WITH CHECK (public.has_admin_role(ARRAY['editor','super_admin']));
CREATE POLICY "Editors and super admins can update academies"
  ON public.affiliated_academies FOR UPDATE TO authenticated
  USING (public.has_admin_role(ARRAY['editor','super_admin']))
  WITH CHECK (public.has_admin_role(ARRAY['editor','super_admin']));
CREATE POLICY "Editors and super admins can delete academies"
  ON public.affiliated_academies FOR DELETE TO authenticated
  USING (public.has_admin_role(ARRAY['editor','super_admin']));
CREATE POLICY "Admins can view all academies"
  ON public.affiliated_academies FOR SELECT TO authenticated
  USING (public.has_admin_role(ARRAY['editor','super_admin']));

-- rankings: super_admin only for writes
CREATE POLICY "Super admins can insert rankings"
  ON public.rankings FOR INSERT TO authenticated
  WITH CHECK (public.has_admin_role(ARRAY['super_admin']));
CREATE POLICY "Super admins can update rankings"
  ON public.rankings FOR UPDATE TO authenticated
  USING (public.has_admin_role(ARRAY['super_admin']))
  WITH CHECK (public.has_admin_role(ARRAY['super_admin']));
CREATE POLICY "Super admins can delete rankings"
  ON public.rankings FOR DELETE TO authenticated
  USING (public.has_admin_role(ARRAY['super_admin']));
CREATE POLICY "Admins can view all rankings"
  ON public.rankings FOR SELECT TO authenticated
  USING (public.has_admin_role(ARRAY['editor','super_admin']));