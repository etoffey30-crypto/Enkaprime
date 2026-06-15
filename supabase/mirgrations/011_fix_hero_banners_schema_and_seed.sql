/*
  Migration 011: Ensure `hero_banners` schema matches Admin expectations
  - Adds missing columns with safe defaults
  - Enables Row Level Security and reasonable policies
  - Inserts default hero rows for Home, About, Training, Contact (idempotent)
*/

-- 1) Add missing columns (idempotent)
ALTER TABLE hero_banners
  ADD COLUMN IF NOT EXISTS page_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS subtitle text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS cta_text text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS cta_link text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS image_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS overlay_color text NOT NULL DEFAULT '#0F2044',
  ADD COLUMN IF NOT EXISTS overlay_opacity numeric NOT NULL DEFAULT 0.85,
  ADD COLUMN IF NOT EXISTS gradient_end_color text NOT NULL DEFAULT '#C9A84C',
  ADD COLUMN IF NOT EXISTS gradient_angle int NOT NULL DEFAULT 135,
  ADD COLUMN IF NOT EXISTS mobile_image_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS button_style text NOT NULL DEFAULT 'primary',
  ADD COLUMN IF NOT EXISTS text_color text NOT NULL DEFAULT '#FFFFFF',
  ADD COLUMN IF NOT EXISTS sort_order int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 2) Enable RLS and policies (safe to re-run)
ALTER TABLE hero_banners ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'public_read_hero_banners' AND tablename = 'hero_banners'
  ) THEN
    CREATE POLICY public_read_hero_banners
      ON hero_banners FOR SELECT
      TO anon
      USING (is_active = true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'auth_read_hero_banners' AND tablename = 'hero_banners'
  ) THEN
    CREATE POLICY auth_read_hero_banners
      ON hero_banners FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'auth_write_hero_banners' AND tablename = 'hero_banners'
  ) THEN
    CREATE POLICY auth_write_hero_banners
      ON hero_banners FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- 3) Insert default hero rows if not present (idempotent by page_name)
INSERT INTO hero_banners (page_name, title, subtitle, description, image_url, cta_text, cta_link, overlay_color, overlay_opacity, text_color, sort_order, is_active)
VALUES
  ('home', 'Advisory, Systems Improvement & Capacity Building Solutions', 'Professional Advisory • Systems Improvement • Compliance Support', 'Enka Prime Consulting Ltd helps organisations improve operational efficiency, compliance, information management, asset accountability and workforce capability through practical consulting, digital transformation and professional training solutions.', '', 'View Programmes', '#programmes', '#0F2044', 0.85, '#FFFFFF', 1, true),
  ('about', 'About Enka Prime', 'About Us', 'Enka Prime Consulting Ltd is a professional services and organisational improvement firm.', '', 'Learn More', '#about', '#0F2044', 0.85, '#FFFFFF', 2, true),
  ('training', 'Training & Capacity Building', 'Upcoming Training', 'Bespoke in-house corporate training programmes delivered at your premises.', '', 'View Training', '#training', '#0F2044', 0.85, '#FFFFFF', 3, true),
  ('contact', 'Let''s Start a Conversation', 'Contact', 'Contact us today to discuss your training and consulting needs.', '', 'Contact Us', '#contact', '#0F2044', 0.85, '#FFFFFF', 4, true)
ON CONFLICT (page_name) DO UPDATE
  SET title = EXCLUDED.title,
      subtitle = EXCLUDED.subtitle,
      description = EXCLUDED.description,
      image_url = COALESCE(NULLIF(EXCLUDED.image_url, ''), hero_banners.image_url),
      cta_text = EXCLUDED.cta_text,
      cta_link = EXCLUDED.cta_link,
      overlay_color = EXCLUDED.overlay_color,
      overlay_opacity = EXCLUDED.overlay_opacity,
      text_color = EXCLUDED.text_color,
      sort_order = EXCLUDED.sort_order,
      is_active = EXCLUDED.is_active,
      updated_at = now();

-- 4) Quick helper: ensure programmes has `image_url` column
ALTER TABLE programmes ADD COLUMN IF NOT EXISTS image_url text DEFAULT '';
