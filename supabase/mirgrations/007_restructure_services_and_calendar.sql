-- 1. Clean up any duplicate services before renaming/adding constraints
DELETE FROM services a USING services b 
WHERE a.id < b.id AND a.title = b.title;

-- 2. Rename columns in services table
ALTER TABLE services RENAME COLUMN code TO slug;
ALTER TABLE services RENAME COLUMN description TO short_description;
ALTER TABLE services RENAME COLUMN full_description TO long_description;

-- 3. Add UNIQUE constraint on title column
ALTER TABLE services ADD CONSTRAINT services_title_key UNIQUE (title);

-- 4. Add upcoming_date column to programmes table
ALTER TABLE programmes ADD COLUMN IF NOT EXISTS upcoming_date text DEFAULT '';

-- 5. Seed/Update upcoming dates for the 17 June 2026 programmes
UPDATE programmes SET upcoming_date = 'June 10-12, 2026' WHERE code = 'LMT 100';
UPDATE programmes SET upcoming_date = 'June 17-19, 2026' WHERE code = 'LMT 102';
UPDATE programmes SET upcoming_date = 'June 11-12, 2026' WHERE code = 'CST 200';
UPDATE programmes SET upcoming_date = 'June 15-16, 2026' WHERE code = 'CTS 201';
UPDATE programmes SET upcoming_date = 'June 18-19, 2026' WHERE code = 'CTS 202';
UPDATE programmes SET upcoming_date = 'June 8-9, 2026' WHERE code = 'HSE 300';
UPDATE programmes SET upcoming_date = 'June 15-16, 2026' WHERE code = 'HSE 303';
UPDATE programmes SET upcoming_date = 'June 22-23, 2026' WHERE code = 'HSE 304';
UPDATE programmes SET upcoming_date = 'June 24-25, 2026' WHERE code = 'HSE 305';
UPDATE programmes SET upcoming_date = 'June 10-12, 2026' WHERE code = 'AFT 400';
UPDATE programmes SET upcoming_date = 'June 24-26, 2026' WHERE code = 'AFT 402';
UPDATE programmes SET upcoming_date = 'June 15-17, 2026' WHERE code = 'DDT 500';
UPDATE programmes SET upcoming_date = 'June 22-24, 2026' WHERE code = 'DDT 501';
UPDATE programmes SET upcoming_date = 'June 23-26, 2026' WHERE code = 'DDT 502';
UPDATE programmes SET upcoming_date = 'June 17-19, 2026' WHERE code = 'GEN 600';
UPDATE programmes SET upcoming_date = 'June 22-24, 2026' WHERE code = 'GEN 601';
UPDATE programmes SET upcoming_date = 'June 25-27, 2026' WHERE code = 'GEN 602';
