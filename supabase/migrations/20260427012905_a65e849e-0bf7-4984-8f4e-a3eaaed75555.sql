-- =====================================================================
-- BJJLF content schema (Phase 1B)
-- 8 tables. RLS enabled on every table. Public SELECT for active/published
-- rows only. No write policies yet — writes will be added when the admin
-- panel ships and we have authenticated admin roles to scope them to.
-- =====================================================================

-- ---------- hero_slides --------------------------------------------------
CREATE TABLE public.hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_pt TEXT NOT NULL,
  title_en TEXT NOT NULL,
  subtitle_pt TEXT,
  subtitle_en TEXT,
  image_url TEXT NOT NULL,
  tag_pt TEXT,
  tag_en TEXT,
  badge1_label TEXT,
  badge2_label TEXT,
  cta_primary_url TEXT,
  cta_secondary_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX hero_slides_active_order_idx ON public.hero_slides (is_active, display_order);
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active hero slides"
  ON public.hero_slides FOR SELECT
  USING (is_active = true);

-- ---------- events -------------------------------------------------------
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_pt TEXT NOT NULL,
  name_en TEXT NOT NULL,
  event_date DATE NOT NULL,
  end_date DATE,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  country_code TEXT NOT NULL CHECK (char_length(country_code) = 2),
  event_type TEXT NOT NULL CHECK (event_type IN ('gi','nogi','gi_nogi','kids','master')),
  image_url TEXT,
  registration_url TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming'
    CHECK (status IN ('upcoming','ongoing','completed','cancelled')),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  show_on_home BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX events_status_date_idx ON public.events (status, event_date);
CREATE INDEX events_show_on_home_idx ON public.events (show_on_home, event_date);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
-- Events are public regardless of status: even completed/cancelled events are
-- legitimate site content. Filtering happens in the queries themselves.
CREATE POLICY "Public can read all events"
  ON public.events FOR SELECT
  USING (true);

-- ---------- news ---------------------------------------------------------
CREATE TABLE public.news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_pt TEXT NOT NULL,
  title_en TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt_pt TEXT,
  excerpt_en TEXT,
  body_pt TEXT,
  body_en TEXT,
  cover_image_url TEXT,
  category TEXT NOT NULL CHECK (category IN
    ('tournaments','promotions','lifestyle','results','interviews','rules','federation')),
  author TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX news_published_idx ON public.news (is_published, published_at DESC);
CREATE INDEX news_category_idx ON public.news (category);
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read published news"
  ON public.news FOR SELECT
  USING (is_published = true);

-- ---------- rankings -----------------------------------------------------
CREATE TABLE public.rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_name TEXT NOT NULL,
  academy TEXT,
  country_code TEXT NOT NULL CHECK (char_length(country_code) = 2),
  flag_emoji TEXT,
  belt TEXT NOT NULL CHECK (belt IN ('black','brown','purple','blue','white')),
  gender TEXT NOT NULL CHECK (gender IN ('male','female')),
  category TEXT NOT NULL CHECK (category IN ('adult','master','juvenile')),
  modality TEXT NOT NULL CHECK (modality IN ('gi','nogi')),
  points INTEGER NOT NULL DEFAULT 0,
  position INTEGER,
  season TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX rankings_filter_idx ON public.rankings
  (season, modality, gender, belt, category, is_active, points DESC);
ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active rankings"
  ON public.rankings FOR SELECT
  USING (is_active = true);

-- ---------- youtube_videos ----------------------------------------------
CREATE TABLE public.youtube_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_url TEXT NOT NULL,
  youtube_id TEXT NOT NULL,
  title_pt TEXT NOT NULL,
  title_en TEXT NOT NULL,
  thumbnail_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX youtube_videos_active_order_idx
  ON public.youtube_videos (is_active, display_order);
ALTER TABLE public.youtube_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active youtube videos"
  ON public.youtube_videos FOR SELECT
  USING (is_active = true);

-- ---------- certified_black_belts ---------------------------------------
CREATE TABLE public.certified_black_belts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_name TEXT NOT NULL,
  academy TEXT,
  professor TEXT,
  belt_degree INTEGER NOT NULL DEFAULT 0 CHECK (belt_degree BETWEEN 0 AND 9),
  belt_type TEXT NOT NULL CHECK (belt_type IN ('black','coral','red_white','red')),
  country_code TEXT NOT NULL CHECK (char_length(country_code) = 2),
  flag_emoji TEXT,
  city TEXT,
  certificate_number TEXT NOT NULL UNIQUE,
  certified_at DATE NOT NULL,
  photo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX black_belts_active_idx ON public.certified_black_belts (is_active);
CREATE INDEX black_belts_country_idx ON public.certified_black_belts (country_code);
ALTER TABLE public.certified_black_belts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active black belts"
  ON public.certified_black_belts FOR SELECT
  USING (is_active = true);

-- ---------- affiliated_academies ----------------------------------------
CREATE TABLE public.affiliated_academies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  professor TEXT NOT NULL,
  belt TEXT NOT NULL,
  belt_degree INTEGER NOT NULL DEFAULT 0,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT NOT NULL,
  country_code TEXT NOT NULL CHECK (char_length(country_code) = 2),
  flag_emoji TEXT,
  logo_url TEXT,
  affiliated_since DATE NOT NULL,
  website_url TEXT,
  instagram_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX academies_active_idx ON public.affiliated_academies (is_active, name);
CREATE INDEX academies_country_idx ON public.affiliated_academies (country, state);
ALTER TABLE public.affiliated_academies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active academies"
  ON public.affiliated_academies FOR SELECT
  USING (is_active = true);

-- ---------- admin_users (no public access) ------------------------------
-- Locked down completely until the admin panel + auth ship. No public read.
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'viewer'
    CHECK (role IN ('super_admin','editor','viewer')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
-- Intentionally no policies. Admin panel migration will add them.