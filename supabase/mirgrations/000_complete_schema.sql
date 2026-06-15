-- =============================================================================
--  ENKA PRIME CONSULTING — COMPLETE SUPABASE SCHEMA
--  Single file. Run this in the Supabase SQL Editor on a fresh project.
--  Safe to re-run: uses IF NOT EXISTS, ON CONFLICT DO NOTHING / DO UPDATE.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. EXTENSIONS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- =============================================================================
-- TABLE DEFINITIONS
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. SITE SETTINGS  (key-value store for all CMS content)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key         text UNIQUE NOT NULL,
  value       text NOT NULL DEFAULT '',
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_settings"
  ON site_settings FOR SELECT TO anon USING (true);
CREATE POLICY "auth_read_settings"
  ON site_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_settings"
  ON site_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_settings"
  ON site_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_settings"
  ON site_settings FOR DELETE TO authenticated USING (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. SERVICES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              text UNIQUE NOT NULL,            -- e.g. records, asset, iso, training
  title             text NOT NULL,
  tagline           text NOT NULL DEFAULT '',
  short_description text NOT NULL DEFAULT '',
  long_description  text NOT NULL DEFAULT '',
  image_url         text NOT NULL DEFAULT '',
  components        text[] NOT NULL DEFAULT '{}',    -- Scope of Service bullets
  pain_points       text[] NOT NULL DEFAULT '{}',    -- Problem section bullets
  solutions         text[] NOT NULL DEFAULT '{}',    -- Our Approach bullets
  benefits          text[] NOT NULL DEFAULT '{}',    -- Outcomes bullets
  sort_order        integer NOT NULL DEFAULT 0,
  is_active         boolean NOT NULL DEFAULT true,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_active_services"
  ON services FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "auth_read_all_services"
  ON services FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_services"
  ON services FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_services"
  ON services FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_services"
  ON services FOR DELETE TO authenticated USING (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. PROGRAMMES  (training catalogue / calendar)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS programmes (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code           text UNIQUE NOT NULL,               -- e.g. LMT 100
  title          text NOT NULL,
  days           integer NOT NULL DEFAULT 1,
  category       text NOT NULL DEFAULT 'General',    -- Leadership | Customer Service | HSE | Finance | Digital | General
  description    text NOT NULL DEFAULT '',
  upcoming_date  text NOT NULL DEFAULT '',           -- e.g. "June 17-19, 2026"
  image_url      text NOT NULL DEFAULT '',
  is_active      boolean NOT NULL DEFAULT true,
  is_featured    boolean NOT NULL DEFAULT false,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

ALTER TABLE programmes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_active_programmes"
  ON programmes FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "auth_read_all_programmes"
  ON programmes FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_programmes"
  ON programmes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_programmes"
  ON programmes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_programmes"
  ON programmes FOR DELETE TO authenticated USING (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. TRAININGS  (detailed course portfolio — shown as cards)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trainings (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  short_summary text NOT NULL DEFAULT '',
  synopsis      text NOT NULL DEFAULT '',
  image_url     text NOT NULL DEFAULT '',
  category      text NOT NULL DEFAULT 'General',
  duration      text NOT NULL DEFAULT '2 Days',
  sort_order    integer NOT NULL DEFAULT 0,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_active_trainings"
  ON trainings FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "auth_read_all_trainings"
  ON trainings FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_trainings"
  ON trainings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_trainings"
  ON trainings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_trainings"
  ON trainings FOR DELETE TO authenticated USING (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- 6. BLOGS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blogs (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title               text NOT NULL,
  slug                text UNIQUE NOT NULL,
  excerpt             text NOT NULL DEFAULT '',
  content             text NOT NULL DEFAULT '',
  featured_image_url  text NOT NULL DEFAULT '',
  category            text NOT NULL DEFAULT 'General',
  is_published        boolean NOT NULL DEFAULT false,
  published_at        timestamptz,
  sort_order          integer NOT NULL DEFAULT 0,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_published_blogs"
  ON blogs FOR SELECT TO anon USING (is_published = true);
CREATE POLICY "auth_read_all_blogs"
  ON blogs FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_blogs"
  ON blogs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_blogs"
  ON blogs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_blogs"
  ON blogs FOR DELETE TO authenticated USING (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- 7. HERO BANNERS  (per-page hero images & text)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hero_banners (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_name          text UNIQUE NOT NULL,           -- home | about | training | contact | services
  title              text NOT NULL DEFAULT '',
  subtitle           text NOT NULL DEFAULT '',
  description        text NOT NULL DEFAULT '',
  image_url          text NOT NULL DEFAULT '',
  mobile_image_url   text NOT NULL DEFAULT '',
  cta_text           text NOT NULL DEFAULT '',
  cta_link           text NOT NULL DEFAULT '',
  overlay_color      text NOT NULL DEFAULT '#0F2044',
  overlay_opacity    numeric NOT NULL DEFAULT 0.55,
  gradient_end_color text NOT NULL DEFAULT '#0F2044',
  gradient_angle     integer NOT NULL DEFAULT 135,
  button_style       text NOT NULL DEFAULT 'primary',
  text_color         text NOT NULL DEFAULT '#FFFFFF',
  sort_order         integer NOT NULL DEFAULT 0,
  is_active          boolean NOT NULL DEFAULT true,
  created_at         timestamptz DEFAULT now(),
  updated_at         timestamptz DEFAULT now()
);

ALTER TABLE hero_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_active_banners"
  ON hero_banners FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "auth_read_all_banners"
  ON hero_banners FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_write_banners"
  ON hero_banners FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- 8. CONTACT SUBMISSIONS  (form leads)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_submissions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  email         text NOT NULL,
  phone         text NOT NULL DEFAULT '',
  organization  text NOT NULL DEFAULT '',
  message       text NOT NULL DEFAULT '',
  source_page   text NOT NULL DEFAULT 'contact',     -- which page the form was on
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a contact form
CREATE POLICY "anon_insert_contact"
  ON contact_submissions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "auth_insert_contact"
  ON contact_submissions FOR INSERT TO authenticated WITH CHECK (true);
-- Only authenticated admins can read submissions
CREATE POLICY "auth_read_contacts"
  ON contact_submissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_delete_contacts"
  ON contact_submissions FOR DELETE TO authenticated USING (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- 9. PAGE VISITS  (visitor analytics)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS page_visits (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page        text NOT NULL DEFAULT '#home',
  user_agent  text NOT NULL DEFAULT '',
  referrer    text NOT NULL DEFAULT '',
  visited_at  timestamptz DEFAULT now()
);

ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;

-- Anyone can log a visit
CREATE POLICY "anon_insert_visits"
  ON page_visits FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "auth_insert_visits"
  ON page_visits FOR INSERT TO authenticated WITH CHECK (true);
-- Only admin can read
CREATE POLICY "auth_read_visits"
  ON page_visits FOR SELECT TO authenticated USING (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- 10. MEDIA LIBRARY
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS media_library (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL DEFAULT '',
  alt_text      text NOT NULL DEFAULT '',
  description   text NOT NULL DEFAULT '',
  image_url     text NOT NULL DEFAULT '',            -- Supabase Storage public URL or base64
  category      text NOT NULL DEFAULT 'General',
  file_size     bigint,
  width         integer,
  height        integer,
  is_active     boolean NOT NULL DEFAULT true,
  is_featured   boolean NOT NULL DEFAULT false,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_active_media"
  ON media_library FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "auth_read_all_media"
  ON media_library FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_write_media"
  ON media_library FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- =============================================================================
-- SEED DATA
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- SITE SETTINGS SEED
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO site_settings (key, value) VALUES

  -- ── Hero Slider ──
  ('hero_slides',          '["/company1.jpg","https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1600","https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=1600","https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1600"]'),
  ('hero_image',           '/company1.jpg'),
  ('hero_title',           'Empowering People.'),
  ('hero_badge_text',      'June 2026 Training Programmes Now Open'),
  ('hero_description',     'Enka Prime Consulting delivers world-class, in-house corporate training across leadership, finance, safety, digital skills and professional development — transforming organisations from within.'),
  ('hero_rotator_words',   'Performance, Systems, Compliance, Capability, Accountability'),

  -- ── CTA Banner ──
  ('cta_title',                 'Discover Our'),
  ('cta_discipline_highlight',  'Service Pillars'),
  ('cta_description',           'Four integrated service pillars designed to strengthen systems, improve compliance, and build organisational capacity.'),
  ('cta_image',                 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg'),

  -- ── About (Homepage Preview & About Page) ──
  ('about_title',          'Who We Are'),
  ('about_subtitle',       'Since Day One'),
  ('about_description',    'Enka Prime Consulting Ltd is a professional services and organisational improvement firm dedicated to helping organisations strengthen operational systems, improve compliance, enhance accountability, and build workforce capability for sustainable performance.'),
  ('about_extended',       'Founded on the principle that sustainable organisational performance depends on strong systems rather than skills development alone, we combine practical implementation expertise with structured capacity-building methodologies.'),
  ('about_bullets',        'Records Digitalisation & Document Management Systems, Asset Tagging and Asset Register Development, ISO Implementation and Audit Support, Training and Capacity Building'),
  ('about_pull_quote',     'We do not simply deliver training or isolated services — we help organisations build the systems, structures, and capabilities that drive long-term performance and institutional resilience.'),
  ('about_image',          'https://images.pexels.com/photos/3184431/pexels-photo-3184431.jpeg'),
  ('about_hero_image',     'https://images.pexels.com/photos/3184431/pexels-photo-3184431.jpeg'),
  ('about_tagline',        'Empowering People. Enhancing Performance. Delivering Excellence.'),
  ('about_mission',        'To deliver practical, world-class consulting and training that transforms workplace performance and builds lasting organisational capability.'),
  ('about_vision',         'To be the leading organisational improvement firm in West Africa — known for results, not just reports.'),
  ('about_page_title',     'About Enka Prime'),
  ('about_page_subtitle',  'Transforming organisations through structured systems, compliance, and capacity building.'),

  -- ── Contact ──
  ('contact_email',          'info@enkaprime.com'),
  ('contact_phone',          '0200 769 146'),
  ('contact_location',       'In-House — Nationwide Delivery'),
  ('contact_hero_image',     'https://images.pexels.com/photos/3808517/pexels-photo-3808517.jpeg'),
  ('contact_page_title',     'Let''s Start a Conversation'),
  ('contact_page_subtitle',  'Contact us today to discuss your training and consulting needs.'),

  -- ── Site Identity ──
  ('site_title',       'Enka Prime Consulting Ltd | Business Advisory, Records Digitalisation & Corporate Training'),
  ('footer_tagline',   'Empowering People. Enhancing Performance. Delivering Excellence.'),
  ('header_logo',      '/biglogo.png'),
  ('footer_logo',      '/white-enka-prime-logo.png'),

  -- ── Social Links ──
  ('facebook_url',   'https://facebook.com/enkaprime'),
  ('linkedin_url',   'https://www.linkedin.com/search/results/companies/?keywords=enkaprime'),
  ('whatsapp_url',   'https://wa.me/233200769146'),

  -- ── Announcement Bar ──
  ('announcement_bar_enabled', 'false'),
  ('announcement_text',        'June 2026 Training Programmes Now Open — Enroll Today'),

  -- ── Design System ──
  ('design_system', '{"primary_color":"#0F2044","secondary_color":"#C9A84C","accent_color":"#F3F4F6","font_family":"Inter","base_font_size":"16px","spacing_density":"comfortable","button_preset":"rounded"}'),

  -- ── Homepage Module Order ──
  ('homepage_modules', '[{"id":"hero","type":"hero","is_visible":true},{"id":"cta","type":"cta","is_visible":true},{"id":"about_preview","type":"about_preview","is_visible":true},{"id":"services","type":"services","is_visible":true},{"id":"industries","type":"industries","is_visible":true},{"id":"why_choose_us","type":"why_choose_us","is_visible":true}]'),

  -- ── Training / Programmes page ──
  ('training_hero_image',   'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg'),
  ('programmes_hero_image', 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg'),

  -- ── Course Modules (reusable) ──
  ('course_modules', '[]')

ON CONFLICT (key) DO NOTHING;


-- ─────────────────────────────────────────────────────────────────────────────
-- SERVICES SEED
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO services (slug, title, tagline, short_description, long_description, image_url, sort_order, is_active, components, pain_points, solutions, benefits) VALUES

  ('records',
   'Records Digitalisation & Document Management Systems',
   'Turning paper trails into structured, searchable digital intelligence.',
   'Structured digital records, document workflows, metadata tagging, and secure retrieval systems for stronger institutional memory.',
   'We transform paper-based filing systems into structured, searchable digital archives. Our team handles document classification, metadata design, access controls, and full EDMS configuration to deliver audit-ready information systems.',
   'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg',
   1, true,
   ARRAY['Records audit and classification framework','Digital scanning and metadata tagging of physical records','Document Management System (DMS) design and implementation','Workflow automation for document routing and approvals','Access control and permission-based document security','Retention schedule development and archiving policies','Staff training on DMS usage and document protocols'],
   ARRAY['Thousands of physical files with no systematic organisation','Wasted hours searching for contracts, reports, or financial records','Lost or misplaced documents creating compliance and audit risks','No version control — staff working from outdated documents','Remote teams unable to access records quickly or securely','No retention policy — accumulation of irrelevant or obsolete files'],
   ARRAY['Conduct a full records audit to classify, prioritise and categorise all documents','Design a structured folder taxonomy aligned with your organisational functions','Implement a cloud-based or on-premise DMS tailored to your infrastructure','Configure automated workflows for approvals, reviews and retention triggers','Establish role-based access to protect sensitive information','Develop a records management policy and train staff on adoption'],
   ARRAY['Instant document retrieval — reducing search time by up to 80%','Full audit trail with version history and access logs','Improved compliance readiness for regulatory inspections','Secure remote access for distributed teams','Reduced storage costs by eliminating duplicate and redundant records','Greater organisational confidence and operational continuity']),

  ('asset',
   'Asset Tagging & Asset Register Development',
   'Full visibility over every asset — from acquisition to disposal.',
   'Physical asset verification, barcode or QR tagging, register development, and lifecycle visibility across all locations.',
   'Complete asset lifecycle management from physical enumeration through tagging, register build, and ongoing custodian tracking. Integrates with accounting systems for accurate depreciation and audit-ready reporting.',
   'https://images.pexels.com/photos/6169668/pexels-photo-6169668.jpeg',
   2, true,
   ARRAY['Physical asset verification and condition assessment','Barcode or QR code tagging of all identified assets','Asset register design and population in structured format','Asset categorisation by class, location, cost centre and status','Integration with financial systems and depreciation schedules','Disposals, write-offs, and asset movement tracking protocols','Staff training on asset management procedures'],
   ARRAY['No centralised register of what the organisation owns or where it is','Inability to reconcile physical assets with financial statements','Assets reported lost, stolen or "missing" with no tracking trail','Overstated or understated asset values due to lack of data','Annual audits delayed or failed because of incomplete asset records','No lifecycle tracking — assets replaced unnecessarily or used past useful life'],
   ARRAY['Deploy a physical verification team to locate and document all assets','Apply durable barcode or QR labels to every identified item','Build a structured asset register capturing all required metadata','Align asset data with your finance team''s chart of accounts','Implement movement and disposal protocols to keep records current','Provide a digital dashboard for real-time asset status monitoring'],
   ARRAY['A clean, complete and accurate asset register ready for audits','Dramatic reduction in asset losses and unaccountable disposals','Better financial reporting with correct depreciation calculations','Faster, cleaner audit processes — both internal and external','Informed procurement decisions based on real asset lifecycle data','Improved accountability across departments and locations']),

  ('iso',
   'ISO Implementation & Compliance Support',
   'Structured frameworks that build trust, reduce risk, and prove quality.',
   'Gap assessments, process documentation, internal audit support, and ISO-aligned systems for operational consistency.',
   'End-to-end ISO implementation covering gap analysis, policy writing, process documentation, internal audit training, and management review facilitation across ISO 9001, 27001, and 45001.',
   'https://images.pexels.com/photos/5716001/pexels-photo-5716001.jpeg',
   3, true,
   ARRAY['ISO gap analysis against relevant standard (ISO 9001, 14001, 45001, 27001)','Implementation roadmap and project management support','Documented quality management system (QMS) development','Process mapping and standard operating procedures (SOPs)','Internal audit programme design and execution','Corrective and preventive action (CAPA) systems','Pre-certification audit support and certification readiness review'],
   ARRAY['Unclear processes — staff operating from informal habits rather than defined procedures','Repeated errors and rework with no root cause analysis system','Clients or funders demanding ISO certification as a contract requirement','Failed or inconclusive audits due to incomplete documentation','Regulatory non-conformances with no structured corrective system','Leadership unsure of how to begin or sustain a compliance framework'],
   ARRAY['Conduct a gap analysis to establish your baseline and identify what''s missing','Develop a realistic, phased implementation plan from gap to certification','Build all required documentation — quality manual, SOPs, forms, registers','Train your internal team to run and maintain the management system','Conduct internal audits to validate conformance before certification','Provide ongoing support through the certification body audit process'],
   ARRAY['Internationally recognised certification that builds client and investor confidence','Consistent, repeatable processes that reduce errors and rework','A structured framework for continuous improvement','Demonstrated compliance with legal, regulatory and contractual requirements','Competitive advantage in procurement and tendering processes','Reduced operational risk and improved organisational resilience']),

  ('training',
   'Training & Capacity Building',
   'Workforce capability that sticks.',
   'Custom in-house programmes that strengthen workforce capability, compliance culture, and practical workplace performance.',
   'Bespoke corporate training across leadership, customer service, HSE, finance, digital skills and professional development — all designed around your organisation''s real challenges and delivered in-house at your premises.',
   'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
   4, true,
   ARRAY['Training needs assessment and gap analysis','Customised programme design aligned to organisational goals','In-house delivery at your premises by experienced facilitators','Leadership and management development programmes','Customer service excellence training','Health, Safety & Environment (HSE) training','Finance for non-finance managers','Digital literacy and tools training','Post-training evaluation and impact measurement'],
   ARRAY['Generic off-the-shelf training that does not address real workplace challenges','Staff attending public workshops with no follow-up or application','Leadership skills gaps causing poor team performance','Poor customer service affecting retention and reputation','Compliance gaps due to untrained staff','High cost of sending multiple staff to external training venues'],
   ARRAY['Conduct a training needs analysis before designing any programme','Develop bespoke content using your organisation''s real scenarios and language','Deliver training in-house to maximise contextual relevance and group learning','Use practical, skills-based methodologies rather than passive lecture formats','Provide facilitator guides and participant workbooks for knowledge retention','Offer post-training coaching and follow-up assessments on request'],
   ARRAY['Directly applicable skills that transfer to the workplace immediately','Consistent training quality across all departments and locations','Cost-efficient delivery — one fee covers your entire team','Improved employee engagement and retention through investment in growth','Measurable performance improvement within 90 days of training','A culture of continuous learning embedded across the organisation'])

ON CONFLICT (slug) DO UPDATE SET
  title             = EXCLUDED.title,
  tagline           = EXCLUDED.tagline,
  short_description = EXCLUDED.short_description,
  long_description  = EXCLUDED.long_description,
  image_url         = EXCLUDED.image_url,
  components        = EXCLUDED.components,
  pain_points       = EXCLUDED.pain_points,
  solutions         = EXCLUDED.solutions,
  benefits          = EXCLUDED.benefits,
  updated_at        = now();


-- ─────────────────────────────────────────────────────────────────────────────
-- PROGRAMMES SEED  (Training Calendar)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO programmes (code, title, days, category, description, upcoming_date, is_active, is_featured) VALUES
  ('LMT 100', 'Leadership Fundamentals & Team Management',           3, 'Leadership',        'Core leadership skills for team leads and managers.',                                            'June 10-12, 2026',  true, true),
  ('LMT 101', 'Strategic Leadership & Corporate Governance',         3, 'Leadership',        'Strategic thinking, governance and board advisory skills.',                                      'July 8-10, 2026',   true, false),
  ('LMT 102', 'Supervisory Skills & People Management',              2, 'Leadership',        'Practical supervisory skills for frontline managers.',                                           'June 17-19, 2026',  true, false),
  ('LMT 103', 'Emotional Intelligence in the Workplace',             2, 'Leadership',        'EQ principles for high-performance leadership.',                                                 'July 22-23, 2026',  true, false),
  ('CST 200', 'Customer Service Excellence',                         2, 'Customer Service',  'Active listening, complaint handling and service recovery.',                                     'June 11-12, 2026',  true, true),
  ('CST 201', 'Professional Communication & Business Writing',       2, 'Customer Service',  'Clear, effective written and verbal business communication.',                                    'June 15-16, 2026',  true, false),
  ('CST 202', 'Conflict Resolution & Negotiation Skills',            2, 'Customer Service',  'De-escalation and collaborative negotiation frameworks.',                                        'June 18-19, 2026',  true, false),
  ('HSE 300', 'Workplace Health, Safety & Environment (Fundamentals)',2, 'HSE',              'Core HSE principles, hazard identification and incident reporting.',                             'June 8-9, 2026',    true, true),
  ('HSE 301', 'ISO 45001 — Occupational Health & Safety Lead Implementer', 3, 'HSE',         'Design and maintain OHS management systems to ISO 45001.',                                      'July 15-17, 2026',  true, false),
  ('HSE 302', 'Fire Safety & Emergency Response',                    2, 'HSE',               'Fire prevention, evacuation planning and emergency drills.',                                     'July 29-30, 2026',  true, false),
  ('HSE 303', 'Risk Assessment & Permit to Work Systems',            2, 'HSE',               'Hazard identification, risk matrices and PTW procedures.',                                       'June 15-16, 2026',  true, false),
  ('HSE 304', 'Environmental Management & ISO 14001',                2, 'HSE',               'Environmental impact assessment and EMS implementation.',                                        'June 22-23, 2026',  true, false),
  ('HSE 305', 'Behaviour-Based Safety (BBS)',                        2, 'HSE',               'Safety culture, observation techniques and positive reinforcement.',                             'June 24-25, 2026',  true, false),
  ('AFT 400', 'Finance for Non-Finance Managers',                    3, 'Finance',           'Read financial statements, manage budgets and track KPIs.',                                      'June 10-12, 2026',  true, true),
  ('AFT 401', 'Budget Preparation & Cost Control',                   2, 'Finance',           'Build and manage departmental budgets with confidence.',                                         'July 13-14, 2026',  true, false),
  ('AFT 402', 'Procurement & Supply Chain Management',               3, 'Finance',           'Procurement best practices, supplier management and contract fundamentals.',                     'June 24-26, 2026',  true, false),
  ('AFT 403', 'Internal Audit & Compliance Fundamentals',            2, 'Finance',           'Audit planning, evidence gathering and report writing.',                                         'July 20-21, 2026',  true, false),
  ('DDT 500', 'Advanced Records Management & Digitalisation',        3, 'Digital',           'EDMS configuration, metadata design and document workflow automation.',                          'June 15-17, 2026',  true, true),
  ('DDT 501', 'Asset Verification & Register Development',           2, 'Digital',           'Physical asset counting, QR/barcode tagging and register build.',                               'June 22-24, 2026',  true, false),
  ('DDT 502', 'ISO 9001:2015 QMS Lead Implementer',                  5, 'Digital',           'Full QMS design, internal audit and certification readiness.',                                   'June 23-27, 2026',  true, false),
  ('DDT 503', 'Data Analysis with Excel & Power BI',                 3, 'Digital',           'Data cleaning, pivot tables, dashboards and basic Power BI.',                                   'July 7-9, 2026',    true, false),
  ('GEN 600', 'Report Writing & Business Communication',             3, 'General',           'Structured report formats, executive summaries and professional writing.',                       'June 17-19, 2026',  true, false),
  ('GEN 601', 'Time Management & Personal Effectiveness',            2, 'General',           'Prioritisation, delegation and high-performance work habits.',                                   'June 22-23, 2026',  true, false),
  ('GEN 602', 'Project Management Fundamentals',                     3, 'General',           'Project planning, monitoring, risk management and closeout.',                                    'June 25-27, 2026',  true, false),
  ('GEN 603', 'Change Management & Organisational Resilience',       2, 'General',           'Leading teams through change with structured communication frameworks.',                         'July 27-28, 2026',  true, false)
ON CONFLICT (code) DO NOTHING;


-- ─────────────────────────────────────────────────────────────────────────────
-- TRAININGS SEED  (Course Portfolio Cards)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO trainings (title, short_summary, synopsis, image_url, category, duration, sort_order, is_active) VALUES
  ('Advanced Records Management & Digitalisation',
   'Master the transition from physical filing systems to secure, searchable digital databases.',
   'Covers document classification, indexing schemas, digital archiving, access control management, and metadata structure design. Participants learn how to configure an EDMS and draft records management policies for audit compliance.',
   'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg',
   'Digital', '3 Days', 1, true),

  ('Executive Leadership & Corporate Governance',
   'Empower senior management with strategic planning tools, decision frameworks, and board advisory skills.',
   'Covers corporate governance frameworks, strategic planning, ethical oversight, risk management, performance metrics, and succession planning. Focuses on building corporate culture and delivering long-term organisational value.',
   'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg',
   'Leadership', '3 Days', 2, true),

  ('Customer Service Excellence',
   'Turn frontline staff into loyalty builders through practical EQ and service skills training.',
   'Covers emotional intelligence, active listening, complaint handling, structured problem-solving frameworks, and brand representation. Role-play based programme with live service audits.',
   'https://images.pexels.com/photos/3184298/pexels-photo-3184298.jpeg',
   'Customer Service', '2 Days', 3, true),

  ('Health, Safety & Environment (HSE) Fundamentals',
   'Build a zero-incident safety culture with behaviour-based safety training.',
   'Covers hazard identification and risk assessment (HIRA), permit to work systems, emergency response procedures, and behaviour-based safety (BBS) principles aligned to ISO 45001.',
   'https://images.pexels.com/photos/8961370/pexels-photo-8961370.jpeg',
   'HSE', '2 Days', 4, true),

  ('Finance for Non-Finance Managers',
   'Give every manager the financial fluency to make better decisions and manage budgets confidently.',
   'Covers reading financial statements, budget preparation, KPI tracking, cost-benefit analysis, and understanding profitability. Designed for managers in commercial, operations and administrative roles.',
   'https://images.pexels.com/photos/7681340/pexels-photo-7681340.jpeg',
   'Finance', '3 Days', 5, true),

  ('Asset Verification & Register Development',
   'Learn practical methods for physical asset counting, barcode tagging, and register reconciliation.',
   'A step-by-step training on establishing an institutional asset tracking system. Covers asset labeling methodologies, location mapping, depreciation scheduling, custodian assignments, and register auditing.',
   'https://images.pexels.com/photos/6169668/pexels-photo-6169668.jpeg',
   'Digital', '2 Days', 6, true),

  ('ISO 9001:2015 Quality Management Systems Lead Implementer',
   'Gain the skills to design, deploy, and maintain an ISO-compliant quality framework.',
   'Full QMS implementation journey — ISO 9001 standard clauses, gap analysis, document controls, internal audit design, and management review protocols. Prepares teams for external certification.',
   'https://images.pexels.com/photos/5716001/pexels-photo-5716001.jpeg',
   'Leadership', '5 Days', 7, true)
ON CONFLICT DO NOTHING;


-- ─────────────────────────────────────────────────────────────────────────────
-- HERO BANNERS SEED
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO hero_banners (page_name, title, subtitle, description, image_url, cta_text, cta_link, overlay_color, overlay_opacity, is_active, sort_order) VALUES
  ('home',     'Empowering People.',                     'Professional Advisory • Systems Improvement • Compliance Support', 'Enka Prime Consulting delivers world-class, in-house corporate training across leadership, finance, safety, digital skills and professional development.',  '/company1.jpg',                                                          'View Programmes', '#programmes', '#0F2044', 0.55, true, 1),
  ('about',    'About Enka Prime',                       'Our Story',        'Enka Prime Consulting Ltd is a professional services and organisational improvement firm.',                                                                                                      'https://images.pexels.com/photos/3184431/pexels-photo-3184431.jpeg',     'Learn More',      '#about',      '#0F2044', 0.80, true, 2),
  ('training', 'Training & Capacity Building',           'Upcoming Training','Bespoke in-house corporate training programmes delivered at your premises.',                                                                                                                    'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',     'View Training',   '#training',   '#0F2044', 0.80, true, 3),
  ('contact',  'Let''s Start a Conversation',            'Get In Touch',     'Contact us today to discuss your training and consulting needs.',                                                                                                                               'https://images.pexels.com/photos/3808517/pexels-photo-3808517.jpeg',     'Contact Us',      '#contact',    '#0F2044', 0.80, true, 4),
  ('services', 'Our Service Pillars',                    'What We Deliver',  'Four integrated service pillars designed to strengthen systems, improve compliance, and build organisational capacity.',                                                                         'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg',     'Explore Services','#services',   '#0F2044', 0.80, true, 5)
ON CONFLICT (page_name) DO UPDATE SET
  title          = EXCLUDED.title,
  subtitle       = EXCLUDED.subtitle,
  description    = EXCLUDED.description,
  cta_text       = EXCLUDED.cta_text,
  cta_link       = EXCLUDED.cta_link,
  overlay_color  = EXCLUDED.overlay_color,
  overlay_opacity= EXCLUDED.overlay_opacity,
  updated_at     = now();


-- ─────────────────────────────────────────────────────────────────────────────
-- BLOGS SEED
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO blogs (title, slug, excerpt, content, featured_image_url, category, is_published, published_at, sort_order) VALUES
  ('Why In-House Training Delivers Greater ROI Than Public Workshops',
   'in-house-training-roi',
   'Sending staff to public training events is costly and often irrelevant. Discover why customised in-house programmes produce measurable results and deeper behavioural change.',
   'Organisations across Africa spend billions every year on training, yet studies consistently show that less than 20% of workshop content is retained and applied after 30 days. In-house training programmes are delivered at your facility, using your real-world scenarios, your terminology, and your people.',
   'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg',
   'Training', true, now(), 1),

  ('The Roadmap to Successful Records Digitalisation in Corporate Ghana',
   'records-digitalisation-roadmap',
   'Transitioning from paper to digital records is more than just scanning documents. Learn the critical steps to design secure, compliant document management workflows.',
   'In today''s fast-paced corporate environment, information is one of the most valuable assets an organisation possesses. Yet, many businesses in Ghana still rely heavily on paper records. Digitalisation involves converting physical documents into digital formats and structuring them within an enterprise document management system.',
   'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg',
   'Digital', true, now(), 2),

  ('Why ISO Certification is a Competitive Advantage for Ghanaian SMEs',
   'iso-certification-competitive-advantage',
   'Understanding ISO 9001, ISO 27001, and ISO 45001 and how structured compliance unlocks international tenders and boosts credibility.',
   'For small and medium enterprises in Ghana, standing out in a crowded market is crucial. ISO standards provide internationally recognized frameworks for quality, safety, security, and efficiency. Implementing these standards signals to clients, partners, and regulators that your business operates at global standards.',
   'https://images.pexels.com/photos/5716001/pexels-photo-5716001.jpeg',
   'Compliance', true, now(), 3),

  ('Asset Tagging & Lifecycle Management: Safeguarding Institutional Assets',
   'asset-tagging-lifecycle',
   'An accurate asset register is vital for financial health and audit compliance. How barcode and QR code systems prevent asset leakage and streamline audits.',
   'Every growing enterprise faces a major logistical challenge: keeping track of physical assets. Without a structured tracking system, assets get lost, stolen, or improperly depreciated. Asset tagging is the foundation of modern asset lifecycle management.',
   'https://images.pexels.com/photos/6169668/pexels-photo-6169668.jpeg',
   'Services', true, now(), 4),

  ('Finance for Non-Finance Managers: Why Every Leader Needs Financial Fluency',
   'finance-for-non-finance-managers',
   'You do not need to be an accountant to make great financial decisions. See how training non-financial managers to read budgets and track KPIs transforms business outcomes.',
   'One of the most common and costly gaps in management teams is financial literacy. Non-finance managers make decisions every day that have financial consequences yet many have never been formally taught how to read a profit & loss statement or evaluate a capital expenditure proposal.',
   'https://images.pexels.com/photos/7681340/pexels-photo-7681340.jpeg',
   'Training', true, now(), 5)
ON CONFLICT (slug) DO NOTHING;


-- =============================================================================
-- USEFUL VIEWS (optional — for admin analytics)
-- =============================================================================

CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM contact_submissions)                           AS total_leads,
  (SELECT COUNT(*) FROM contact_submissions WHERE created_at >= now() - interval '7 days') AS leads_this_week,
  (SELECT COUNT(*) FROM page_visits)                                   AS total_visits,
  (SELECT COUNT(*) FROM page_visits WHERE visited_at >= CURRENT_DATE)  AS visits_today,
  (SELECT COUNT(*) FROM blogs WHERE is_published = true)               AS published_blogs,
  (SELECT COUNT(*) FROM services WHERE is_active = true)               AS active_services,
  (SELECT COUNT(*) FROM trainings WHERE is_active = true)              AS active_trainings,
  (SELECT COUNT(*) FROM programmes WHERE is_active = true)             AS active_programmes;


-- =============================================================================
-- STORAGE BUCKET (run once — sets up image uploads)
-- =============================================================================
-- Run this separately in Supabase Dashboard > Storage if you want cloud uploads:
--
-- INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true)
-- ON CONFLICT DO NOTHING;
--
-- CREATE POLICY "public_read_media" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'media');
-- CREATE POLICY "auth_upload_media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media');
-- CREATE POLICY "auth_delete_media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media');


-- =============================================================================
-- DONE
-- =============================================================================
-- Tables created:
--   site_settings, services, programmes, trainings, blogs,
--   hero_banners, contact_submissions, page_visits, media_library
--
-- All tables have RLS enabled.
-- Seed data inserted for all core content.
-- Run this once on a fresh Supabase project.
-- =============================================================================
