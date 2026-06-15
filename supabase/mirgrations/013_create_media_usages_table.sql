-- Migration: create media_usages mapping table
CREATE TABLE IF NOT EXISTS media_usages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  media_id uuid NOT NULL,
  table_name text NOT NULL,
  column_name text NOT NULL,
  row_id text,
  context text,
  created_at timestamptz DEFAULT now()
);

-- Foreign key (optional)
-- ALTER TABLE media_usages ADD CONSTRAINT fk_media FOREIGN KEY(media_id) REFERENCES media_library(id) ON DELETE CASCADE;
