-- Migration: create media_library table
CREATE TABLE IF NOT EXISTS media_library (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  filename text,
  original_name text,
  file_path text,
  file_url text,
  mime_type text,
  file_size bigint,
  width int,
  height int,
  title text,
  alt_text text,
  description text,
  category text,
  uploaded_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz
);

-- Optional: grant select/insert/update/delete to authenticated role if needed
-- GRANT SELECT, INSERT, UPDATE, DELETE ON media_library TO authenticated;
