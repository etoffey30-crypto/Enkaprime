-- 1. Trainings Table (Course Portfolio Topics)
CREATE TABLE IF NOT EXISTS trainings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  synopsis text DEFAULT '',
  short_summary text DEFAULT '',
  image_url text DEFAULT '',
  category text DEFAULT 'General',
  duration text DEFAULT '2 Days',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;

-- Select policies
CREATE POLICY "Public read active trainings" 
  ON trainings FOR SELECT 
  TO anon 
  USING (is_active = true);

CREATE POLICY "Authenticated read all trainings" 
  ON trainings FOR SELECT 
  TO authenticated 
  USING (true);

-- Insert policies
CREATE POLICY "Authenticated insert trainings" 
  ON trainings FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Update policies
CREATE POLICY "Authenticated update trainings" 
  ON trainings FOR UPDATE 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Delete policies
CREATE POLICY "Authenticated delete trainings" 
  ON trainings FOR DELETE 
  TO authenticated 
  USING (true);


-- 2. Blogs/Ebooks Table
CREATE TABLE IF NOT EXISTS blogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  excerpt text DEFAULT '',
  content text DEFAULT '',
  featured_image_url text DEFAULT '',
  slug text UNIQUE NOT NULL,
  is_published boolean DEFAULT false,
  published_at timestamptz,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Select policies
CREATE POLICY "Public read published blogs" 
  ON blogs FOR SELECT 
  TO anon 
  USING (is_published = true);

CREATE POLICY "Authenticated read all blogs" 
  ON blogs FOR SELECT 
  TO authenticated 
  USING (true);

-- Insert policies
CREATE POLICY "Authenticated insert blogs" 
  ON blogs FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Update policies
CREATE POLICY "Authenticated update blogs" 
  ON blogs FOR UPDATE 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Delete policies
CREATE POLICY "Authenticated delete blogs" 
  ON blogs FOR DELETE 
  TO authenticated 
  USING (true);


-- 3. Announcement Bar Site Settings
INSERT INTO site_settings (key, value) VALUES 
  ('announcement_bar_enabled', 'false'),
  ('announcement_bar_text', 'Click here to download our corporate capability brochure.'),
  ('announcement_bar_link', '#contact')
ON CONFLICT (key) DO NOTHING;
