/*
  # Seed / Upsert: June 2026 Training Programmes
  Migration 009: Insert or update the exact 17 training programmes shown
  in the June 2026 flyer image. Uses idempotent upserts so running multiple
  times is safe.
*/

INSERT INTO programmes (code, title, days, category, is_active, is_featured, description)
VALUES
  ('LMT 100', 'Strategic Leadership and Supervisory Excellence', 3, 'Leadership', true, false, 'Develop essential skills for modern corporate leadership, project execution, and supervisory accountability.'),
  ('LMT 102', 'Practical Leadership, Accountability, and Decision-Making for Managers', 3, 'Leadership', true, false, 'Equip managers with hands-on decision-making models, high accountability frameworks, and team alignment methods.'),

  ('CST 200', 'Customer Service Excellence and Client Relationship Management', 2, 'Customer Service', true, false, 'Establish frontline service standards, effective client communication channels, and long-term retention tools.'),
  ('CTS 201', 'Professional Frontline Service Delivery and Complaint Handling', 2, 'Customer Service', true, false, 'Master professional customer engagement, de-escalating difficult situations, and resolving complaints with confidence.'),
  ('CTS 202', 'Building a Customer-Centric Culture for Organizational Growth', 2, 'Customer Service', true, false, 'Align internal culture with frontline delivery standards to generate sustained loyalty and brand growth.'),

  ('HSE 300', 'Workplace Health, Safety, and Risk Prevention Essentials', 2, 'HSE', true, false, 'Comprehensive safety procedures, preventative risk mitigation, and compliance frameworks for all operational sites.'),
  ('HSE 303', 'Defensive Driving and Road Safety Management', 2, 'HSE', true, false, 'Equip fleet operations with safety measures, preventative driving strategies, and accident mitigation systems.'),
  ('HSE 304', 'Fleet Driver Safety, Risk Reduction, and Accident Prevention', 2, 'HSE', true, false, 'Tailored training focusing on high-risk vehicle navigation, hazard recognition, and standard operating fleet safety.'),
  ('HSE 305', 'Professional Defensive Driving Techniques for Corporate Drivers', 2, 'HSE', true, false, 'Advanced preventative driving controls, vehicle care, and corporate road ethics for executive drivers.'),

  ('AFT 400', 'Practical Financial Management and Budgetary Control', 3, 'Finance', true, false, 'Strengthen internal controls, accounting ledger reviews, financial forecasting, and cost control systems.'),
  ('AFT 402', 'Effective Financial Reporting, Internal Controls, and Compliance', 3, 'Finance', true, false, 'Build reliable financial reporting processes, governance audits, and regulatory reporting procedures.'),

  ('DDT 500', 'Data Management, Analysis, and Reporting Using Excel', 3, 'Digital', true, false, 'Advanced Excel tools, database structuring, formula logic, and professional analytics for daily data operations.'),
  ('DDT 501', 'Practical Data Analytics for Business Decision-Making', 3, 'Digital', true, false, 'Harness statistical analytics, business dashboards, and predictive tools to support data-driven decision making.'),

  ('GEN 600', 'Effective Communication, Report Writing, and Presentation Skills', 3, 'General', true, false, 'Structure professional business reports, deliver high-impact executive slide decks, and improve office communications.'),
  ('GEN 601', 'Time Management, Productivity, and Workplace Efficiency', 3, 'General', true, false, 'Overcome procrastination, implement prioritisation grids, and manage daily corporate workflows efficiently.'),
  ('GEN 602', 'Teamwork, Collaboration, and Conflict Resolution', 3, 'General', true, false, 'Foster healthy corporate collaborations, resolve differences constructively, and build positive department morale.'),

  ('DDT 502', 'Advanced Excel and Power BI for Business Intelligence Reporting', 4, 'Digital', true, true, 'An intensive hands-on training designed to equip participants with practical skills in Advanced Microsoft Excel and Power BI for data analysis, dashboard creation, reporting automation, and business intelligence decision-making. The program focuses on transforming raw organizational data into actionable insights through real-world exercises and reporting scenarios.')
ON CONFLICT (code) DO UPDATE
  SET
    title = EXCLUDED.title,
    days = EXCLUDED.days,
    category = EXCLUDED.category,
    is_active = EXCLUDED.is_active,
    is_featured = EXCLUDED.is_featured,
    description = EXCLUDED.description,
    updated_at = now();

-- All trainings are inserted/updated by code key. If you want per-programme
-- images, let me know and I can add an `image_url` column and populate it.
