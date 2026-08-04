import { useState, useEffect, useRef, useCallback } from 'react';
import {
  LayoutDashboard, Home, Info, Briefcase, GraduationCap, BookOpen,
  Phone, Settings, LogOut, Menu, X, Save, Plus, Trash2, Edit3,
  Image as ImageIcon, Users, Eye, CheckCircle, AlertCircle,
  ChevronDown, ChevronUp, BarChart3, Mail, MessageSquare, Clock, Download
} from 'lucide-react';

const GOLD = '#C9A84C';
const NAVY = '#0F2044';
const ADMIN_PASS = 'enkaprime2026';

// ── helpers ──────────────────────────────────────────────────────────────────
const ls = {
  get: (k: string, fallback: any = null) => {
    try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
  },
  set: (k: string, v: any) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } },
};

function uid() { return Math.random().toString(36).slice(2, 10); }

function imgToDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onerror = rej;
    reader.onload = () => {
      const raw = reader.result as string;
      const img = new Image();
      img.onerror = () => res(raw);
      img.onload = () => {
        const MAX = 1400;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);
        res(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = raw;
    };
    reader.readAsDataURL(file);
  });
}

// ── default data ─────────────────────────────────────────────────────────────
const DEFAULT_SETTINGS: Record<string, string> = {
  // Hero
  hero_image: '/company1.jpg',
  hero_slides: JSON.stringify([
    '/company1.jpg',
    'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1600',
    'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=1600',
    'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1600',
  ]),
  hero_title: 'Empowering People.',
  hero_badge_text: 'June 2026 Training Programmes Now Open',
  hero_description: 'Enka Prime Consulting delivers world-class, in-house corporate training across leadership, finance, safety, digital skills and professional development — transforming organisations from within.',
  hero_rotator_words: 'Performance, Systems, Compliance, Capability, Accountability',
  // CTA
  cta_title: 'Discover Our',
  cta_discipline_highlight: 'Service Pillars',
  cta_description: 'Four integrated service pillars designed to strengthen systems, improve compliance, and build organisational capacity.',
  // About
  about_title: 'Who We Are',
  about_subtitle: 'Since Day One',
  about_description: 'Enka Prime Consulting Ltd is a professional services and organisational improvement firm dedicated to helping organisations strengthen operational systems, improve compliance, enhance accountability, and build workforce capability.',
  about_extended: 'Founded on the principle that sustainable organisational performance depends on strong systems, we combine practical implementation expertise with structured capacity-building methodologies.',
  about_bullets: 'Records Digitalisation & Document Management Systems, Asset Tagging and Asset Register Development, ISO Implementation and Audit Support, Training and Capacity Building',
  about_pull_quote: 'We do not simply deliver training or isolated services — we help organisations build the systems, structures, and capabilities that drive long-term performance and institutional resilience.',
  // Contact
  contact_email: 'info@enkaprime.com',
  contact_phone: '0200 769 146',
  contact_location: 'In-House — Nationwide Delivery',
  // Footer
  footer_tagline: 'Empowering People. Enhancing Performance. Delivering Excellence.',
};

const DEFAULT_SERVICES = [
  { id: uid(), slug: 'records', title: 'Records Digitalisation', tagline: 'Turning paper trails into structured, searchable digital intelligence.', short_description: 'Structured digital records, document workflows, metadata tagging, and secure retrieval systems.', long_description: 'We transform paper-based filing systems into structured, searchable digital archives. Our team handles document classification, metadata design, access controls, and full EDMS configuration.', image_url: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg', is_active: true, sort_order: 1,
    components: ['Records audit and classification framework', 'Digital scanning and metadata tagging of physical records', 'Document Management System (DMS) design and implementation', 'Workflow automation for document routing and approvals', 'Access control and permission-based document security', 'Retention schedule development and archiving policies', 'Staff training on DMS usage and document protocols'],
    pain_points: ['Thousands of physical files with no systematic organisation', 'Wasted hours searching for contracts, reports, or financial records', 'Lost or misplaced documents creating compliance and audit risks', 'No version control — staff working from outdated documents', 'Remote teams unable to access records quickly or securely', 'No retention policy — accumulation of irrelevant or obsolete files'],
    solutions: ['Conduct a full records audit to classify, prioritise and categorise all documents', 'Design a structured folder taxonomy aligned with your organisational functions', 'Implement a cloud-based or on-premise DMS tailored to your infrastructure', 'Configure automated workflows for approvals, reviews and retention triggers', 'Establish role-based access to protect sensitive information', 'Develop a records management policy and train staff on adoption'],
    benefits: ['Instant document retrieval — reducing search time by up to 80%', 'Full audit trail with version history and access logs', 'Improved compliance readiness for regulatory inspections', 'Secure remote access for distributed teams', 'Reduced storage costs by eliminating duplicate and redundant records', 'Greater organisational confidence and operational continuity'],
  },
  { id: uid(), slug: 'asset', title: 'Asset Tagging & Registers', tagline: 'Full visibility over every asset — from acquisition to disposal.', short_description: 'Physical asset verification, barcode or QR tagging, register development, and lifecycle visibility.', long_description: 'Complete asset lifecycle management from physical enumeration through tagging, register build, and ongoing custodian tracking. Integrates with accounting systems for accurate depreciation.', image_url: 'https://images.pexels.com/photos/6169668/pexels-photo-6169668.jpeg', is_active: true, sort_order: 2,
    components: ['Physical asset verification and condition assessment', 'Barcode or QR code tagging of all identified assets', 'Asset register design and population in structured format', 'Asset categorisation by class, location, cost centre and status', 'Integration with financial systems and depreciation schedules', 'Disposals, write-offs, and asset movement tracking protocols', 'Staff training on asset management procedures'],
    pain_points: ['No centralised register of what the organisation owns or where it is', 'Inability to reconcile physical assets with financial statements', 'Assets reported lost, stolen or "missing" with no tracking trail', 'Overstated or understated asset values due to lack of data', 'Annual audits delayed or failed because of incomplete asset records', 'No lifecycle tracking — assets replaced unnecessarily or used past useful life'],
    solutions: ['Deploy a physical verification team to locate and document all assets', 'Apply durable barcode or QR labels to every identified item', 'Build a structured asset register capturing all required metadata', "Align asset data with your finance team's chart of accounts", 'Implement movement and disposal protocols to keep records current', 'Provide a digital dashboard for real-time asset status monitoring'],
    benefits: ['A clean, complete and accurate asset register ready for audits', 'Dramatic reduction in asset losses and unaccountable disposals', 'Better financial reporting with correct depreciation calculations', 'Faster, cleaner audit processes — both internal and external', 'Informed procurement decisions based on real asset lifecycle data', 'Improved accountability across departments and locations'],
  },
  { id: uid(), slug: 'iso', title: 'ISO Implementation Support', tagline: 'Structured frameworks that build trust, reduce risk, and prove quality.', short_description: 'Gap assessments, process documentation, internal audit support, and ISO-aligned systems.', long_description: 'End-to-end ISO implementation covering gap analysis, policy writing, process documentation, internal audit training, and management review facilitation across ISO 9001, 27001, and 45001.', image_url: 'https://images.pexels.com/photos/5716001/pexels-photo-5716001.jpeg', is_active: true, sort_order: 3,
    components: ['ISO gap analysis against relevant standard (ISO 9001, 14001, 45001, 27001)', 'Implementation roadmap and project management support', 'Documented quality management system (QMS) development', 'Process mapping and standard operating procedures (SOPs)', 'Internal audit programme design and execution', 'Corrective and preventive action (CAPA) systems', 'Pre-certification audit support and certification readiness review'],
    pain_points: ['Unclear processes — staff operating from informal habits rather than defined procedures', 'Repeated errors and rework with no root cause analysis system', 'Clients or funders demanding ISO certification as a contract requirement', 'Failed or inconclusive audits due to incomplete documentation', 'Regulatory non-conformances with no structured corrective system', 'Leadership unsure of how to begin or sustain a compliance framework'],
    solutions: ["Conduct a gap analysis to establish your baseline and identify what's missing", 'Develop a realistic, phased implementation plan from gap to certification', 'Build all required documentation — quality manual, SOPs, forms, registers', 'Train your internal team to run and maintain the management system', 'Conduct internal audits to validate conformance before certification', 'Provide ongoing support through the certification body audit process'],
    benefits: ['Internationally recognised certification that builds client and investor confidence', 'Consistent, repeatable processes that reduce errors and rework', 'A structured framework for continuous improvement', 'Demonstrated compliance with legal, regulatory and contractual requirements', 'Competitive advantage in procurement and tendering processes', 'Reduced operational risk and improved organisational resilience'],
  },
  { id: uid(), slug: 'training', title: 'Training & Capacity Building', tagline: 'Workforce capability that sticks.', short_description: 'Custom in-house programmes that strengthen workforce capability, compliance culture, and performance.', long_description: 'Bespoke corporate training across leadership, customer service, HSE, finance, digital skills and professional development — all delivered in-house at your premises.', image_url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg', is_active: true, sort_order: 4,
    components: ['Training needs assessment and gap analysis', 'Customised programme design aligned to organisational goals', 'In-house delivery at your premises by experienced facilitators', 'Leadership and management development programmes', 'Customer service excellence training', 'Health, Safety & Environment (HSE) training', 'Finance for non-finance managers', 'Digital literacy and tools training', 'Post-training evaluation and impact measurement'],
    pain_points: ['Generic off-the-shelf training that does not address real workplace challenges', 'Staff attending public workshops with no follow-up or application', 'Leadership skills gaps causing poor team performance', 'Poor customer service affecting retention and reputation', 'Compliance gaps due to untrained staff', 'High cost of sending multiple staff to external training venues'],
    solutions: ['Conduct a training needs analysis before designing any programme', "Develop bespoke content using your organisation's real scenarios and language", 'Deliver training in-house to maximise contextual relevance and group learning', 'Use practical, skills-based methodologies rather than passive lecture formats', 'Provide facilitator guides and participant workbooks for knowledge retention', 'Offer post-training coaching and follow-up assessments on request'],
    benefits: ['Directly applicable skills that transfer to the workplace immediately', 'Consistent training quality across all departments and locations', 'Cost-efficient delivery — one fee covers your entire team', 'Improved employee engagement and retention through investment in growth', 'Measurable performance improvement within 90 days of training', 'A culture of continuous learning embedded across the organisation'],
  },
];

const DEFAULT_BLOGS = [
  { id: uid(), title: 'Why In-House Training Delivers Greater ROI', excerpt: 'Discover why customised in-house programmes produce measurable results.', content: 'Full article content here...', featured_image_url: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg', category: 'Training', slug: 'in-house-training-roi', is_published: true, published_at: '2026-06-10T08:00:00Z', sort_order: 1 },
  { id: uid(), title: 'The Roadmap to Successful Records Digitalisation', excerpt: 'Critical steps to design secure, compliant digital workflows.', content: 'Full article content here...', featured_image_url: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg', category: 'Digital', slug: 'records-digitalisation-roadmap', is_published: true, published_at: '2026-06-01T10:00:00Z', sort_order: 2 },
];

const DEFAULT_TRAININGS = [
  { id: uid(), title: 'Advanced Records Management & Digitalisation', short_summary: 'Master the transition from physical to digital records.', synopsis: 'Covers EDMS configuration, metadata design, access controls, and audit compliance.', image_url: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg', category: 'Digital', duration: '3 Days', is_active: true, sort_order: 1 },
  { id: uid(), title: 'Executive Leadership & Corporate Governance', short_summary: 'Empower senior management with strategic tools.', synopsis: 'Strategic planning, ethical oversight, risk management, and succession planning.', image_url: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg', category: 'Leadership', duration: '3 Days', is_active: true, sort_order: 2 },
  { id: uid(), title: 'Customer Service Excellence', short_summary: 'Turn frontline staff into loyalty builders.', synopsis: 'EQ, active listening, complaint handling, and brand representation.', image_url: 'https://images.pexels.com/photos/3184298/pexels-photo-3184298.jpeg', category: 'Customer Service', duration: '2 Days', is_active: true, sort_order: 3 },
];

const DEFAULT_PROGRAMMES = [
  { id: uid(), code: 'LMT 100', title: 'Leadership Fundamentals & Team Management', days: 3, category: 'Leadership', description: 'Core leadership skills for team leads and managers.', upcoming_date: 'June 10-12, 2026', is_active: true, is_featured: true },
  { id: uid(), code: 'LMT 101', title: 'Strategic Leadership & Corporate Governance', days: 3, category: 'Leadership', description: 'Strategic thinking, governance and board advisory skills.', upcoming_date: 'July 8-10, 2026', is_active: true, is_featured: false },
  { id: uid(), code: 'LMT 102', title: 'Supervisory Skills & People Management', days: 2, category: 'Leadership', description: 'Practical supervisory skills for frontline managers.', upcoming_date: 'June 17-19, 2026', is_active: true, is_featured: false },
  { id: uid(), code: 'CST 200', title: 'Customer Service Excellence', days: 2, category: 'Customer Service', description: 'Active listening, complaint handling and service recovery.', upcoming_date: 'June 11-12, 2026', is_active: true, is_featured: true },
  { id: uid(), code: 'CST 201', title: 'Professional Communication & Business Writing', days: 2, category: 'Customer Service', description: 'Clear, effective written and verbal business communication.', upcoming_date: 'June 15-16, 2026', is_active: true, is_featured: false },
  { id: uid(), code: 'HSE 300', title: 'Workplace Health, Safety & Environment (Fundamentals)', days: 2, category: 'HSE', description: 'Core HSE principles, hazard identification and incident reporting.', upcoming_date: 'June 8-9, 2026', is_active: true, is_featured: true },
  { id: uid(), code: 'HSE 301', title: 'ISO 45001 — Occupational Health & Safety Lead Implementer', days: 3, category: 'HSE', description: 'Design and maintain OHS management systems to ISO 45001.', upcoming_date: 'July 15-17, 2026', is_active: true, is_featured: false },
  { id: uid(), code: 'HSE 303', title: 'Risk Assessment & Permit to Work Systems', days: 2, category: 'HSE', description: 'Hazard identification, risk matrices and PTW procedures.', upcoming_date: 'June 15-16, 2026', is_active: true, is_featured: false },
  { id: uid(), code: 'AFT 400', title: 'Finance for Non-Finance Managers', days: 3, category: 'Finance', description: 'Read financial statements, manage budgets and track KPIs.', upcoming_date: 'June 10-12, 2026', is_active: true, is_featured: true },
  { id: uid(), code: 'AFT 401', title: 'Budget Preparation & Cost Control', days: 2, category: 'Finance', description: 'Build and manage departmental budgets with confidence.', upcoming_date: 'July 13-14, 2026', is_active: true, is_featured: false },
  { id: uid(), code: 'AFT 402', title: 'Procurement & Supply Chain Management', days: 3, category: 'Finance', description: 'Procurement best practices, supplier management and contract fundamentals.', upcoming_date: 'June 24-26, 2026', is_active: true, is_featured: false },
  { id: uid(), code: 'DDT 500', title: 'Advanced Records Management & Digitalisation', days: 3, category: 'Digital', description: 'EDMS configuration, metadata design and document workflow automation.', upcoming_date: 'June 15-17, 2026', is_active: true, is_featured: true },
  { id: uid(), code: 'DDT 501', title: 'Asset Verification & Register Development', days: 2, category: 'Digital', description: 'Physical asset counting, QR/barcode tagging and register build.', upcoming_date: 'June 22-24, 2026', is_active: true, is_featured: false },
  { id: uid(), code: 'DDT 502', title: 'ISO 9001:2015 QMS Lead Implementer', days: 5, category: 'Digital', description: 'Full QMS design, internal audit and certification readiness.', upcoming_date: 'June 23-27, 2026', is_active: true, is_featured: false },
  { id: uid(), code: 'GEN 600', title: 'Report Writing & Business Communication', days: 3, category: 'General', description: 'Structured report formats, executive summaries and professional writing.', upcoming_date: 'June 17-19, 2026', is_active: true, is_featured: false },
  { id: uid(), code: 'GEN 601', title: 'Time Management & Personal Effectiveness', days: 2, category: 'General', description: 'Prioritisation, delegation and high-performance work habits.', upcoming_date: 'June 22-23, 2026', is_active: true, is_featured: false },
  { id: uid(), code: 'GEN 602', title: 'Project Management Fundamentals', days: 3, category: 'General', description: 'Project planning, monitoring, risk management and closeout.', upcoming_date: 'June 25-27, 2026', is_active: true, is_featured: false },
];

// ── sub-components ────────────────────────────────────────────────────────────
function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold animate-fade-in-up`}
      style={{ background: type === 'success' ? '#16a34a' : '#dc2626' }}>
      {type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      {msg}
    </div>
  );
}

function ImageUpload({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      <div className="flex gap-3 items-start">
        <div
          onClick={() => ref.current?.click()}
          className="w-24 h-16 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-yellow-400 transition-colors overflow-hidden flex-shrink-0 bg-gray-50"
        >
          {value
            ? <img src={value} alt="" className="w-full h-full object-cover" />
            : <ImageIcon size={20} className="text-gray-300" />}
        </div>
        <div className="flex-1 space-y-1.5">
          <button type="button" onClick={() => ref.current?.click()}
            className="px-3 py-1.5 text-xs font-bold rounded-lg text-white"
            style={{ background: NAVY }}>
            Upload Image
          </button>
          {value && (
            <button type="button" onClick={() => onChange('')}
              className="ml-2 px-3 py-1.5 text-xs font-bold rounded-lg bg-red-50 text-red-600">
              Remove
            </button>
          )}
          <p className="text-[10px] text-gray-400">JPG, PNG — auto-compressed</p>
        </div>
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden"
        onChange={async e => { const f = e.target.files?.[0]; if (f) onChange(await imgToDataUrl(f)); }} />
    </div>
  );
}

function SlideUpload({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      <div
        onClick={() => ref.current?.click()}
        className="relative w-full h-32 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-yellow-400 transition-colors overflow-hidden bg-gray-50 group"
      >
        {value ? (
          <>
            <img src={value} alt={label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-bold bg-black/50 px-3 py-1.5 rounded-lg">Change Image</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 text-gray-300">
            <ImageIcon size={28} />
            <span className="text-[11px] font-semibold">Click to upload</span>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => ref.current?.click()}
          className="px-3 py-1.5 text-xs font-bold rounded-lg text-white flex-1"
          style={{ background: NAVY }}>
          Upload Image
        </button>
        {value && (
          <button type="button" onClick={() => onChange('')}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-50 text-red-600">
            Remove
          </button>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden"
        onChange={async e => { const f = e.target.files?.[0]; if (f) onChange(await imgToDataUrl(f)); }} />
    </div>
  );
}

function Field({ label, value, onChange, multiline = false, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean; rows?: number }) {
  const cls = "w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 bg-white text-gray-800";
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      {multiline
        ? <textarea className={cls} rows={rows} value={value} onChange={e => onChange(e.target.value)} />
        : <input type="text" className={cls} value={value} onChange={e => onChange(e.target.value)} />}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────
export default function Admin({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [tab, setTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // data
  const [settings, setSettings] = useState<Record<string, string>>(() => ({
    ...DEFAULT_SETTINGS, ...ls.get('local_settings_map', {}),
  }));
  const [services, setServices] = useState<any[]>(() => ls.get('local_services', DEFAULT_SERVICES));
  const [blogs, setBlogs] = useState<any[]>(() => ls.get('local_blogs_cms', DEFAULT_BLOGS));
  const [trainings, setTrainings] = useState<any[]>(() => ls.get('local_trainings', DEFAULT_TRAININGS));
  const [contacts, setContacts] = useState<any[]>(() => ls.get('local_contacts', []));
  const [visitors, setVisitors] = useState<any[]>(() => ls.get('local_visitors', []));
  const [programmes, setProgrammes] = useState<any[]>(() => ls.get('local_programmes', DEFAULT_PROGRAMMES));

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // persist settings map back to the format App.tsx reads
  const saveSetting = useCallback((key: string, value: string) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    ls.set('local_settings_map', next);
    // also write in array format for App.tsx loadPublicData
    const arr = Object.entries(next).map(([k, v]) => ({ key: k, value: v }));
    ls.set('local_settings', arr);
    showToast('Saved');
  }, [settings]);

  const saveSettings = useCallback((updates: Record<string, string>) => {
    const next = { ...settings, ...updates };
    setSettings(next);
    ls.set('local_settings_map', next);
    const arr = Object.entries(next).map(([k, v]) => ({ key: k, value: v }));
    ls.set('local_settings', arr);
    showToast('Changes saved');
  }, [settings]);

  const saveServices = (s: any[]) => { setServices(s); ls.set('local_services', s); };
  const saveBlogs = (b: any[]) => { setBlogs(b); ls.set('local_blogs_cms', b); ls.set('local_blogs', b); };
  const saveTrainings = (t: any[]) => { setTrainings(t); ls.set('local_trainings', t); };
  const saveProgrammes = (p: any[]) => { setProgrammes(p); ls.set('local_programmes', p); };

  // track visitor on mount
  useEffect(() => {
    const visit = { id: uid(), time: new Date().toISOString(), page: window.location.hash || '#home', ua: navigator.userAgent.slice(0, 80) };
    const updated = [...ls.get('local_visitors', []), visit].slice(-500);
    ls.set('local_visitors', updated);
    setVisitors(updated);
  }, []);

  // check auth
  useEffect(() => {
    if (ls.get('admin_authed') === true) setAuthed(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === ADMIN_PASS) { setAuthed(true); ls.set('admin_authed', true); }
    else { setPwErr('Incorrect password'); setTimeout(() => setPwErr(''), 2000); }
  };

  const handleLogout = () => { setAuthed(false); ls.set('admin_authed', false); onNavigate('home'); };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <img src="/biglogo.png" alt="Enka Prime" className="h-16 mx-auto mb-4 object-contain" />
            <h1 className="text-2xl font-bold" style={{ color: NAVY }}>Admin Portal</h1>
            <p className="text-gray-400 text-sm mt-1">Enter your password to continue</p>
          </div>
          <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            {pwErr && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-center gap-2"><AlertCircle size={14} />{pwErr}</div>}
            <label className="block text-sm font-semibold mb-2" style={{ color: NAVY }}>Password</label>
            <input type="password" value={pw} onChange={e => setPw(e.target.value)} required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 mb-5 text-gray-800" />
            <button type="submit" className="w-full py-3.5 font-bold rounded-xl text-white" style={{ background: NAVY }}>Sign In</button>
          </form>
          <button onClick={() => onNavigate('home')} className="w-full mt-4 text-gray-400 text-sm hover:text-gray-600 transition-colors">← Back to Website</button>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'home', label: 'Home Page', icon: Home },
    { id: 'about', label: 'About Page', icon: Info },
    { id: 'services', label: 'Services', icon: Briefcase },
    { id: 'trainings', label: 'Training Courses', icon: GraduationCap },
    { id: 'programmes', label: 'Training Calendar', icon: BookOpen },
    { id: 'blogs', label: 'Blogs', icon: BookOpen },
    { id: 'contact', label: 'Contact', icon: Phone },
    { id: 'visitors', label: 'Visitors & Leads', icon: Users },
    { id: 'settings', label: 'Site Settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-gray-100 shadow-xl transition-all duration-300 ${sidebarOpen ? 'w-60' : 'w-16'} overflow-hidden`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100 h-16 flex-shrink-0">
          {sidebarOpen && <span className="font-bold text-sm" style={{ color: NAVY }}>Enka CMS</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors ml-auto">
            {sidebarOpen ? <X size={18} className="text-gray-500" /> : <Menu size={18} className="text-gray-500" />}
          </button>
        </div>
        <nav className="flex-1 py-3 space-y-0.5 overflow-y-auto">
          {TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => { setTab(t.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all ${active ? 'text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
                style={active ? { background: NAVY } : {}}>
                <Icon size={18} className="flex-shrink-0" />
                {sidebarOpen && <span>{t.label}</span>}
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors`}>
            <LogOut size={18} />
            {sidebarOpen && 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-16 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30">
          <h1 className="font-bold text-lg" style={{ color: NAVY }}>{TABS.find(t => t.id === tab)?.label}</h1>
          <button onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: NAVY }}>
            <Eye size={16} /> Preview Site
          </button>
        </header>

        <div className="flex-1 p-6 overflow-y-auto">
          {tab === 'dashboard' && <DashboardTab services={services} blogs={blogs} trainings={trainings} contacts={contacts} visitors={visitors} setTab={setTab} />}
          {tab === 'home' && <HomeTab settings={settings} saveSettings={saveSettings} />}
          {tab === 'about' && <AboutTab settings={settings} saveSettings={saveSettings} />}
          {tab === 'services' && <ServicesTab services={services} saveServices={saveServices} showToast={showToast} />}
          {tab === 'trainings' && <TrainingsTab trainings={trainings} saveTrainings={saveTrainings} showToast={showToast} />}
          {tab === 'programmes' && <ProgrammesTab programmes={programmes} saveProgrammes={saveProgrammes} showToast={showToast} />}
          {tab === 'blogs' && <BlogsTab blogs={blogs} saveBlogs={saveBlogs} showToast={showToast} />}
          {tab === 'contact' && <ContactTab settings={settings} saveSettings={saveSettings} contacts={contacts} />}
          {tab === 'visitors' && <VisitorsTab visitors={visitors} contacts={contacts} />}
          {tab === 'settings' && <SiteSettingsTab settings={settings} saveSettings={saveSettings} />}
        </div>
      </main>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function DashboardTab({ services, blogs, trainings, contacts, visitors, setTab }: any) {
  const today = visitors.filter((v: any) => v.time?.startsWith(new Date().toISOString().slice(0, 10))).length;
  const stats = [
    { label: 'Total Visitors', value: visitors.length, icon: Eye, color: '#3b82f6', tab: 'visitors' },
    { label: 'Today\'s Visits', value: today, icon: Clock, color: '#10b981', tab: 'visitors' },
    { label: 'Contact Leads', value: contacts.length, icon: Mail, color: GOLD, tab: 'contact' },
    { label: 'Published Blogs', value: blogs.filter((b: any) => b.is_published).length, icon: BookOpen, color: '#8b5cf6', tab: 'blogs' },
  ];
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <button key={s.label} onClick={() => setTab(s.tab)}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-left group">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase">{s.label}</span>
                <Icon size={18} style={{ color: s.color }} />
              </div>
              <div className="text-3xl font-extrabold" style={{ color: NAVY }}>{s.value}</div>
            </button>
          );
        })}
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { label: 'Active Services', count: services.filter((s: any) => s.is_active).length, tab: 'services', icon: Briefcase },
          { label: 'Training Courses', count: trainings.filter((t: any) => t.is_active).length, tab: 'trainings', icon: GraduationCap },
          { label: 'Blog Articles', count: blogs.length, tab: 'blogs', icon: BookOpen },
        ].map(c => {
          const Icon = c.icon;
          return (
            <button key={c.label} onClick={() => setTab(c.tab)}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-left flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${NAVY}10` }}>
                <Icon size={22} style={{ color: NAVY }} />
              </div>
              <div>
                <div className="text-xs text-gray-400 font-bold uppercase">{c.label}</div>
                <div className="text-2xl font-extrabold" style={{ color: NAVY }}>{c.count}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Recent contacts */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-base mb-4" style={{ color: NAVY }}>Recent Contact Submissions</h3>
        {contacts.length === 0
          ? <p className="text-gray-400 text-sm">No submissions yet.</p>
          : <div className="space-y-2 max-h-64 overflow-y-auto">
            {[...contacts].reverse().slice(0, 5).map((c: any) => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-semibold text-sm text-gray-800">{c.name} — <span className="text-gray-500 text-xs">{c.email}</span></div>
                  <div className="text-xs text-gray-400 mt-0.5">{c.message?.slice(0, 60)}…</div>
                </div>
                <div className="text-[10px] text-gray-400 flex-shrink-0 ml-3">{new Date(c.time).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        }
      </div>
    </div>
  );
}

// ── HOME PAGE TAB ─────────────────────────────────────────────────────────────
function HomeTab({ settings, saveSettings }: any) {
  const [form, setForm] = useState({ ...settings });
  const s = (k: string) => form[k] || '';
  const set = (k: string, v: string) => setForm((f: any) => ({ ...f, [k]: v }));

  // Parse slides array from settings
  const getSlides = (): string[] => {
    try {
      const parsed = JSON.parse(form.hero_slides || '[]');
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch { /* ignore */ }
    return [
      form.hero_image || '/company1.jpg',
      'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1600',
      'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=1600',
      'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1600',
    ];
  };

  const updateSlide = (index: number, value: string) => {
    const slides = getSlides();
    slides[index] = value;
    setForm((f: any) => ({ ...f, hero_slides: JSON.stringify(slides), hero_image: slides[0] }));
  };

  const slides = getSlides();

  return (
    <div className="space-y-6 max-w-3xl">
      <Section title="Hero Slider Images">
        <p className="text-xs text-gray-400 -mt-2">All 4 images rotate automatically every 5 seconds. Slide 1 is shown first.</p>
        <div className="grid grid-cols-2 gap-4">
          {slides.map((src, i) => (
            <SlideUpload
              key={i}
              label={`Slide ${i + 1}${i === 0 ? ' (First / Main)' : ''}`}
              value={src}
              onChange={v => updateSlide(i, v)}
            />
          ))}
        </div>
      </Section>
      <Section title="Hero Text Content">
        <Field label="Hero Title" value={s('hero_title')} onChange={v => set('hero_title', v)} />
        <Field label="Badge Text" value={s('hero_badge_text')} onChange={v => set('hero_badge_text', v)} />
        <Field label="Description" value={s('hero_description')} onChange={v => set('hero_description', v)} multiline rows={3} />
        <Field label="Rotating Words (comma separated)" value={s('hero_rotator_words')} onChange={v => set('hero_rotator_words', v)} />
      </Section>
      <Section title="CTA Banner Section">
        <ImageUpload label="CTA Background Image" value={s('cta_image')} onChange={v => set('cta_image', v)} />
        <Field label="CTA Title" value={s('cta_title')} onChange={v => set('cta_title', v)} />
        <Field label="Highlighted Text" value={s('cta_discipline_highlight')} onChange={v => set('cta_discipline_highlight', v)} />
        <Field label="CTA Description" value={s('cta_description')} onChange={v => set('cta_description', v)} multiline />
      </Section>
      <Section title="About Preview (Homepage)">
        <ImageUpload label="About Image" value={s('about_image')} onChange={v => set('about_image', v)} />
        <Field label="About Title" value={s('about_title')} onChange={v => set('about_title', v)} />
        <Field label="About Subtitle" value={s('about_subtitle')} onChange={v => set('about_subtitle', v)} />
        <Field label="Description" value={s('about_description')} onChange={v => set('about_description', v)} multiline rows={4} />
        <Field label="Extended Text" value={s('about_extended')} onChange={v => set('about_extended', v)} multiline rows={3} />
        <Field label="Bullet Points (comma separated)" value={s('about_bullets')} onChange={v => set('about_bullets', v)} multiline rows={3} />
        <Field label="Pull Quote" value={s('about_pull_quote')} onChange={v => set('about_pull_quote', v)} multiline />
      </Section>
      <SaveBar onSave={() => saveSettings(form)} />
    </div>
  );
}

// ── ABOUT TAB ─────────────────────────────────────────────────────────────────
function AboutTab({ settings, saveSettings }: any) {
  const [form, setForm] = useState({ ...settings });
  const s = (k: string) => form[k] || '';
  const set = (k: string, v: string) => setForm((f: any) => ({ ...f, [k]: v }));
  return (
    <div className="space-y-6 max-w-3xl">
      <Section title="About Page Hero">
        <ImageUpload label="About Hero Image" value={s('about_hero_image')} onChange={v => set('about_hero_image', v)} />
        <Field label="Page Title" value={s('about_page_title') || 'About Enka Prime'} onChange={v => set('about_page_title', v)} />
        <Field label="Subtitle" value={s('about_page_subtitle') || 'Transforming organisations through world-class training.'} onChange={v => set('about_page_subtitle', v)} />
      </Section>
      <Section title="Our Story Section">
        <Field label="Heading" value={s('about_title')} onChange={v => set('about_title', v)} />
        <Field label="Main Description" value={s('about_description')} onChange={v => set('about_description', v)} multiline rows={5} />
        <Field label="Extended Description" value={s('about_extended')} onChange={v => set('about_extended', v)} multiline rows={4} />
        <Field label="Tagline" value={s('about_tagline') || 'Empowering People. Enhancing Performance.'} onChange={v => set('about_tagline', v)} />
      </Section>
      <Section title="Mission & Vision">
        <Field label="Mission Statement" value={s('about_mission') || 'To deliver practical, world-class training that transforms workplace performance.'} onChange={v => set('about_mission', v)} multiline rows={3} />
        <Field label="Vision Statement" value={s('about_vision') || 'To be the leading organisational improvement firm in West Africa.'} onChange={v => set('about_vision', v)} multiline rows={3} />
      </Section>
      <SaveBar onSave={() => saveSettings(form)} />
    </div>
  );
}

// ── SERVICES TAB ──────────────────────────────────────────────────────────────
function ServicesTab({ services, saveServices, showToast }: any) {
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({});

  const openEdit = (svc: any) => { setEditing(svc); setForm({ ...svc }); };
  const openNew = () => { const n = { id: uid(), slug: '', title: '', tagline: '', short_description: '', long_description: '', image_url: '', is_active: true, sort_order: services.length + 1, components: [], pain_points: [], solutions: [], benefits: [] }; setEditing(n); setForm(n); };

  const handleSave = () => {
    const updated = services.find((s: any) => s.id === form.id)
      ? services.map((s: any) => s.id === form.id ? form : s)
      : [...services, form];
    saveServices(updated);
    setEditing(null);
    showToast('Service saved');
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this service?')) return;
    saveServices(services.filter((s: any) => s.id !== id));
    showToast('Deleted');
  };

  const toggleActive = (id: string) => {
    saveServices(services.map((s: any) => s.id === id ? { ...s, is_active: !s.is_active } : s));
  };

  if (editing) return (
    <div className="max-w-2xl space-y-5">
      <button onClick={() => setEditing(null)} className="text-sm font-semibold text-gray-500 hover:text-gray-800 flex items-center gap-1">← Back to Services</button>
      <h2 className="text-xl font-bold" style={{ color: NAVY }}>{form.id && services.find((s: any) => s.id === form.id) ? 'Edit Service' : 'New Service'}</h2>
      <Section title="Service Details">
        <ImageUpload label="Service Image" value={form.image_url || ''} onChange={v => setForm((f: any) => ({ ...f, image_url: v }))} />
        <Field label="Title" value={form.title || ''} onChange={v => setForm((f: any) => ({ ...f, title: v }))} />
        <Field label="Slug (url key)" value={form.slug || ''} onChange={v => setForm((f: any) => ({ ...f, slug: v }))} />
        <Field label="Tagline" value={form.tagline || ''} onChange={v => setForm((f: any) => ({ ...f, tagline: v }))} />
        <Field label="Short Description" value={form.short_description || ''} onChange={v => setForm((f: any) => ({ ...f, short_description: v }))} multiline rows={3} />
        <Field label="Full Description" value={form.long_description || ''} onChange={v => setForm((f: any) => ({ ...f, long_description: v }))} multiline rows={6} />
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 cursor-pointer">
          <input type="checkbox" checked={form.is_active} onChange={e => setForm((f: any) => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-yellow-500" />
          Active (visible on site)
        </label>
      </Section>
      <ArrayEditor label="Scope of Service (What We Deliver)" items={form.components || []} onChange={v => setForm((f: any) => ({ ...f, components: v }))} />
      <ArrayEditor label="Pain Points (What Organisations Struggle With)" items={form.pain_points || []} onChange={v => setForm((f: any) => ({ ...f, pain_points: v }))} />
      <ArrayEditor label="Our Approach (How Enka Prime Intervenes)" items={form.solutions || []} onChange={v => setForm((f: any) => ({ ...f, solutions: v }))} />
      <ArrayEditor label="Benefits & Outcomes" items={form.benefits || []} onChange={v => setForm((f: any) => ({ ...f, benefits: v }))} />
      <div className="flex gap-3">
        <button onClick={handleSave} className="px-6 py-2.5 rounded-xl text-white font-bold" style={{ background: NAVY }}>Save Service</button>
        <button onClick={() => setEditing(null)} className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold">Cancel</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold" style={{ color: NAVY }}>Services ({services.length})</h2>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold" style={{ background: NAVY }}>
          <Plus size={16} /> Add Service
        </button>
      </div>
      {services.map((s: any) => (
        <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex gap-4 items-center">
          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
            {s.image_url && <img src={s.image_url} alt={s.title} className="w-full h-full object-cover" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-gray-800">{s.title}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.short_description?.slice(0, 80)}...</div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => toggleActive(s.id)}
              className={`px-3 py-1 rounded-full text-xs font-bold ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {s.is_active ? 'Active' : 'Hidden'}
            </button>
            <button onClick={() => openEdit(s)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors"><Edit3 size={15} className="text-gray-500" /></button>
            <button onClick={() => handleDelete(s.id)} className="p-2 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={15} className="text-red-400" /></button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── TRAININGS TAB ─────────────────────────────────────────────────────────────
function TrainingsTab({ trainings, saveTrainings, showToast }: any) {
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({});

  const openEdit = (t: any) => { setEditing(t); setForm({ ...t }); };
  const openNew = () => { const n = { id: uid(), title: '', short_summary: '', synopsis: '', image_url: '', category: 'Leadership', duration: '2 Days', is_active: true, sort_order: trainings.length + 1 }; setEditing(n); setForm(n); };

  const handleSave = () => {
    const updated = trainings.find((t: any) => t.id === form.id)
      ? trainings.map((t: any) => t.id === form.id ? form : t)
      : [...trainings, form];
    saveTrainings(updated);
    setEditing(null);
    showToast('Training saved');
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete?')) return;
    saveTrainings(trainings.filter((t: any) => t.id !== id));
    showToast('Deleted');
  };

  const CATS = ['Leadership', 'Customer Service', 'HSE', 'Finance', 'Digital', 'General'];

  if (editing) return (
    <div className="max-w-2xl space-y-5">
      <button onClick={() => setEditing(null)} className="text-sm font-semibold text-gray-500 hover:text-gray-800">← Back to Trainings</button>
      <h2 className="text-xl font-bold" style={{ color: NAVY }}>Edit Training Course</h2>
      <Section title="">
        <ImageUpload label="Course Image" value={form.image_url || ''} onChange={v => setForm((f: any) => ({ ...f, image_url: v }))} />
        <Field label="Title" value={form.title || ''} onChange={v => setForm((f: any) => ({ ...f, title: v }))} />
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Category</label>
          <select value={form.category || 'Leadership'} onChange={e => setForm((f: any) => ({ ...f, category: e.target.value }))}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-yellow-400 bg-white text-gray-800">
            {CATS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <Field label="Duration (e.g. 3 Days)" value={form.duration || ''} onChange={v => setForm((f: any) => ({ ...f, duration: v }))} />
        <Field label="Short Summary" value={form.short_summary || ''} onChange={v => setForm((f: any) => ({ ...f, short_summary: v }))} multiline rows={3} />
        <Field label="Full Synopsis" value={form.synopsis || ''} onChange={v => setForm((f: any) => ({ ...f, synopsis: v }))} multiline rows={6} />
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 cursor-pointer">
          <input type="checkbox" checked={form.is_active} onChange={e => setForm((f: any) => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-yellow-500" />
          Active
        </label>
      </Section>
      <div className="flex gap-3">
        <button onClick={handleSave} className="px-6 py-2.5 rounded-xl text-white font-bold" style={{ background: NAVY }}>Save</button>
        <button onClick={() => setEditing(null)} className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold">Cancel</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold" style={{ color: NAVY }}>Training Courses ({trainings.length})</h2>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold" style={{ background: NAVY }}>
          <Plus size={16} /> Add Course
        </button>
      </div>
      {trainings.map((t: any) => (
        <div key={t.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex gap-4 items-center">
          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
            {t.image_url && <img src={t.image_url} alt={t.title} className="w-full h-full object-cover" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-gray-800">{t.title}</div>
            <div className="flex gap-2 mt-1">
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-bold">{t.category}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-500 font-bold">{t.duration}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => openEdit(t)} className="p-2 rounded-lg hover:bg-gray-100"><Edit3 size={15} className="text-gray-500" /></button>
            <button onClick={() => handleDelete(t.id)} className="p-2 rounded-lg hover:bg-red-50"><Trash2 size={15} className="text-red-400" /></button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── BLOGS TAB ─────────────────────────────────────────────────────────────────
function BlogsTab({ blogs, saveBlogs, showToast }: any) {
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({});

  const openEdit = (b: any) => { setEditing(b); setForm({ ...b }); };
  const openNew = () => {
    const n = { id: uid(), title: '', excerpt: '', content: '', featured_image_url: '', category: 'General', slug: '', is_published: false, published_at: new Date().toISOString(), sort_order: blogs.length + 1 };
    setEditing(n); setForm(n);
  };

  const handleSave = () => {
    if (!form.slug) form.slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const updated = blogs.find((b: any) => b.id === form.id)
      ? blogs.map((b: any) => b.id === form.id ? form : b)
      : [...blogs, form];
    saveBlogs(updated);
    setEditing(null);
    showToast('Blog saved');
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete?')) return;
    saveBlogs(blogs.filter((b: any) => b.id !== id));
    showToast('Deleted');
  };

  const CATS = ['Training', 'Leadership', 'Compliance', 'Digital', 'Services', 'General'];

  if (editing) return (
    <div className="max-w-2xl space-y-5">
      <button onClick={() => setEditing(null)} className="text-sm font-semibold text-gray-500 hover:text-gray-800">← Back to Blogs</button>
      <h2 className="text-xl font-bold" style={{ color: NAVY }}>Edit Blog Article</h2>
      <Section title="">
        <ImageUpload label="Featured Image" value={form.featured_image_url || ''} onChange={v => setForm((f: any) => ({ ...f, featured_image_url: v }))} />
        <Field label="Title" value={form.title || ''} onChange={v => setForm((f: any) => ({ ...f, title: v }))} />
        <Field label="URL Slug" value={form.slug || ''} onChange={v => setForm((f: any) => ({ ...f, slug: v }))} />
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Category</label>
          <select value={form.category || 'General'} onChange={e => setForm((f: any) => ({ ...f, category: e.target.value }))}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-yellow-400 bg-white text-gray-800">
            {CATS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <Field label="Excerpt (short summary)" value={form.excerpt || ''} onChange={v => setForm((f: any) => ({ ...f, excerpt: v }))} multiline rows={3} />
        <Field label="Full Article Content" value={form.content || ''} onChange={v => setForm((f: any) => ({ ...f, content: v }))} multiline rows={12} />
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 cursor-pointer">
          <input type="checkbox" checked={form.is_published} onChange={e => setForm((f: any) => ({ ...f, is_published: e.target.checked }))} className="w-4 h-4 accent-yellow-500" />
          Published (visible on site)
        </label>
      </Section>
      <div className="flex gap-3">
        <button onClick={handleSave} className="px-6 py-2.5 rounded-xl text-white font-bold" style={{ background: NAVY }}>Save</button>
        <button onClick={() => setEditing(null)} className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold">Cancel</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold" style={{ color: NAVY }}>Blog Articles ({blogs.length})</h2>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold" style={{ background: NAVY }}>
          <Plus size={16} /> New Article
        </button>
      </div>
      {blogs.map((b: any) => (
        <div key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex gap-4 items-center">
          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
            {b.featured_image_url && <img src={b.featured_image_url} alt={b.title} className="w-full h-full object-cover" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-gray-800">{b.title}</div>
            <div className="flex gap-2 mt-1">
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-bold">{b.category}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${b.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {b.is_published ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => openEdit(b)} className="p-2 rounded-lg hover:bg-gray-100"><Edit3 size={15} className="text-gray-500" /></button>
            <button onClick={() => handleDelete(b.id)} className="p-2 rounded-lg hover:bg-red-50"><Trash2 size={15} className="text-red-400" /></button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── CONTACT TAB ───────────────────────────────────────────────────────────────
function ContactTab({ settings, saveSettings, contacts }: any) {
  const [form, setForm] = useState({ ...settings });
  const s = (k: string) => form[k] || '';
  const set = (k: string, v: string) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6 max-w-3xl">
      <Section title="Contact Page Content">
        <ImageUpload label="Contact Hero Image" value={s('contact_hero_image')} onChange={v => set('contact_hero_image', v)} />
        <Field label="Page Title" value={s('contact_page_title') || "Let's Start a Conversation"} onChange={v => set('contact_page_title', v)} />
        <Field label="Page Subtitle" value={s('contact_page_subtitle') || 'Contact us today to discuss your needs.'} onChange={v => set('contact_page_subtitle', v)} />
        <Field label="Email Address" value={s('contact_email')} onChange={v => set('contact_email', v)} />
        <Field label="Phone Number" value={s('contact_phone') || '0200 769 146'} onChange={v => set('contact_phone', v)} />
        <Field label="Location / Address" value={s('contact_location') || 'In-House — Nationwide Delivery'} onChange={v => set('contact_location', v)} />
      </Section>
      <SaveBar onSave={() => saveSettings(form)} />

      {/* Submissions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-base mb-4" style={{ color: NAVY }}>Contact Form Submissions ({contacts.length})</h3>
        {contacts.length === 0
          ? <p className="text-gray-400 text-sm">No submissions yet.</p>
          : <div className="space-y-3 max-h-96 overflow-y-auto">
            {[...contacts].reverse().map((c: any) => (
              <div key={c.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-bold text-sm text-gray-800">{c.name}</span>
                    {c.organization && <span className="text-xs text-gray-500 ml-2">— {c.organization}</span>}
                  </div>
                  <span className="text-[10px] text-gray-400">{new Date(c.time).toLocaleString()}</span>
                </div>
                <div className="text-xs text-gray-500 mb-1">{c.email} · {c.phone || 'No phone'}</div>
                <div className="text-sm text-gray-700 leading-relaxed">{c.message}</div>
              </div>
            ))}
          </div>
        }
      </div>
    </div>
  );
}

// ── VISITORS TAB ──────────────────────────────────────────────────────────────
function VisitorsTab({ visitors, contacts }: any) {
  const today = new Date().toISOString().slice(0, 10);
  const todayVisits = visitors.filter((v: any) => v.time?.startsWith(today)).length;
  const thisWeek = visitors.filter((v: any) => {
    const d = new Date(v.time); const now = new Date();
    return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
  }).length;

  const byPage: Record<string, number> = {};
  visitors.forEach((v: any) => { byPage[v.page || '#home'] = (byPage[v.page || '#home'] || 0) + 1; });
  const pageStats = Object.entries(byPage).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Visits', value: visitors.length, color: '#3b82f6' },
          { label: 'Today', value: todayVisits, color: '#10b981' },
          { label: 'This Week', value: thisWeek, color: GOLD },
        ].map(s => (
          <div key={s.label} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-xs font-bold text-gray-400 uppercase mb-2">{s.label}</div>
            <div className="text-3xl font-extrabold" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-base mb-4" style={{ color: NAVY }}>Top Pages</h3>
        <div className="space-y-2">
          {pageStats.slice(0, 10).map(([page, count]) => (
            <div key={page} className="flex items-center gap-3">
              <div className="text-sm text-gray-600 flex-1 font-medium">{page}</div>
              <div className="text-sm font-bold" style={{ color: NAVY }}>{count}</div>
              <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${Math.round((count / visitors.length) * 100)}%`, background: GOLD }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-base mb-4" style={{ color: NAVY }}>Contact Leads ({contacts.length})</h3>
        {contacts.length === 0
          ? <p className="text-gray-400 text-sm">No leads yet.</p>
          : <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Name', 'Email', 'Organisation', 'Date', 'Message'].map(h => (
                    <th key={h} className="text-left py-2 pr-4 text-xs font-bold text-gray-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...contacts].reverse().map((c: any) => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 pr-4 font-semibold text-gray-800">{c.name}</td>
                    <td className="py-2 pr-4 text-gray-500">{c.email}</td>
                    <td className="py-2 pr-4 text-gray-500">{c.organization || '—'}</td>
                    <td className="py-2 pr-4 text-gray-400 text-xs">{new Date(c.time).toLocaleDateString()}</td>
                    <td className="py-2 text-gray-500 max-w-xs truncate">{c.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  );
}

// ── SITE SETTINGS TAB ─────────────────────────────────────────────────────────
function SiteSettingsTab({ settings, saveSettings }: any) {
  const [form, setForm] = useState({ ...settings });
  const s = (k: string) => form[k] || '';
  const set = (k: string, v: string) => setForm((f: any) => ({ ...f, [k]: v }));

  // Parse download_banner JSON
  const getBanner = () => {
    try { return JSON.parse(form.download_banner || '{}'); } catch { return {}; }
  };
  const setBanner = (b: any) => set('download_banner', JSON.stringify(b));
  const banner = getBanner();

  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setBanner({
        ...banner,
        file_data: reader.result as string,
        file_name: file.name,
        file_type: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 max-w-3xl">

      {/* ── DOWNLOAD / BROCHURE BANNER ── */}
      <div className="bg-white rounded-2xl border-2 border-yellow-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 border-b pb-3">
          <Download size={18} style={{ color: GOLD }} />
          <h3 className="font-bold text-sm uppercase tracking-wider text-gray-700">Download Banner / Brochure</h3>
        </div>
        <p className="text-xs text-gray-400">Upload a PDF, image, or document. A banner will appear at the top of the site with a download button.</p>

        {/* Upload area */}
        <div
          onClick={() => fileRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-yellow-400 transition-colors bg-gray-50"
        >
          <Download size={28} className="text-gray-300" />
          <span className="text-sm font-semibold text-gray-500">
            {banner.file_name ? `✓ ${banner.file_name}` : 'Click to upload PDF, image, or document'}
          </span>
          <span className="text-xs text-gray-400">PDF, JPG, PNG, DOCX — stored locally</span>
        </div>
        <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.svg" className="hidden" onChange={handleFileUpload} />

        <Field label="'Click here' Link Text" value={banner.link_text || 'Click here'} onChange={v => setBanner({ ...banner, link_text: v })} />
        <Field label="Rest of message text" value={banner.text || 'to download the 2026 training calendar'} onChange={v => setBanner({ ...banner, text: v })} />
        <Field label="Button / Link Text" value={banner.cta_text || 'Download Now'} onChange={v => setBanner({ ...banner, cta_text: v })} />

        {/* Or use external URL instead of uploaded file */}
        <Field label="External URL (optional — overrides uploaded file)" value={banner.cta_link || ''} onChange={v => setBanner({ ...banner, cta_link: v })} />

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 cursor-pointer">
            <input type="checkbox" checked={banner.is_active === true} onChange={e => setBanner({ ...banner, is_active: e.target.checked })} className="w-4 h-4 accent-yellow-500" />
            Show banner on site
          </label>
          {banner.file_data && (
            <button type="button" onClick={() => setBanner({ ...banner, file_data: undefined, file_name: undefined })}
              className="text-xs text-red-500 hover:underline">Remove file</button>
          )}
        </div>

        {/* Preview */}
        {banner.is_active && (
          <div className="rounded-xl p-3 flex items-center justify-between text-sm"
            style={{ background: 'linear-gradient(90deg, #0a1628 0%, #0F2044 60%, #1a3a6b 100%)' }}>
            <span>
              <span className="font-bold underline" style={{ color: '#C9A84C' }}>{banner.link_text || 'Click here'}</span>
              <span className="text-white ml-1">{banner.text || 'to download the 2026 training calendar'}</span>
            </span>
            <span className="text-white/40 text-xs">× preview</span>
          </div>
        )}
      </div>

      <Section title="Site Identity">
        <ImageUpload label="Header Logo" value={s('header_logo')} onChange={v => set('header_logo', v)} />
        <ImageUpload label="Footer Logo (white)" value={s('footer_logo')} onChange={v => set('footer_logo', v)} />
        <Field label="Site Title" value={s('site_title') || 'Enka Prime Consulting Ltd'} onChange={v => set('site_title', v)} />
        <Field label="Site Tagline" value={s('footer_tagline')} onChange={v => set('footer_tagline', v)} />
      </Section>
      <Section title="Social Media Links">
        <Field label="Facebook URL" value={s('facebook_url')} onChange={v => set('facebook_url', v)} />
        <Field label="LinkedIn URL" value={s('linkedin_url')} onChange={v => set('linkedin_url', v)} />
        <Field label="WhatsApp URL" value={s('whatsapp_url')} onChange={v => set('whatsapp_url', v)} />
      </Section>
      <Section title="Legacy Announcement Bar">
        <Field label="Announcement Text" value={s('announcement_text') || 'June 2026 Training Programmes Now Open — Enroll Today'} onChange={v => set('announcement_text', v)} />
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 cursor-pointer">
          <input type="checkbox" checked={s('announcement_bar_enabled') === 'true'} onChange={e => set('announcement_bar_enabled', e.target.checked ? 'true' : 'false')} className="w-4 h-4 accent-yellow-500" />
          Show Announcement Bar (legacy — use Download Banner above instead)
        </label>
      </Section>
      <SaveBar onSave={() => saveSettings(form)} />
    </div>
  );
}

// ── PROGRAMMES TAB (Training Calendar) ───────────────────────────────────────
function ProgrammesTab({ programmes, saveProgrammes, showToast }: any) {
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({});
  const [filterCat, setFilterCat] = useState('All');
  const CATS = ['All', 'Leadership', 'Customer Service', 'HSE', 'Finance', 'Digital', 'General'];

  const openEdit = (p: any) => { setEditing(p); setForm({ ...p }); };
  const openNew = () => {
    const n = { id: uid(), code: '', title: '', days: 1, category: 'General', description: '', upcoming_date: '', is_active: true, is_featured: false };
    setEditing(n); setForm(n);
  };
  const handleSave = () => {
    if (!form.code?.trim() || !form.title?.trim()) { showToast('Code and title are required', 'error'); return; }
    const updated = programmes.find((p: any) => p.id === form.id)
      ? programmes.map((p: any) => p.id === form.id ? form : p)
      : [...programmes, form];
    saveProgrammes(updated);
    setEditing(null);
    showToast('Programme saved');
  };
  const handleDelete = (id: string) => {
    if (!confirm('Delete this programme?')) return;
    saveProgrammes(programmes.filter((p: any) => p.id !== id));
    showToast('Deleted');
  };
  const toggleActive = (id: string) => saveProgrammes(programmes.map((p: any) => p.id === id ? { ...p, is_active: !p.is_active } : p));
  const toggleFeatured = (id: string) => saveProgrammes(programmes.map((p: any) => p.id === id ? { ...p, is_featured: !p.is_featured } : p));

  const filtered = filterCat === 'All' ? programmes : programmes.filter((p: any) => p.category === filterCat);

  if (editing) return (
    <div className="max-w-2xl space-y-5">
      <button onClick={() => setEditing(null)} className="text-sm font-semibold text-gray-500 hover:text-gray-800">← Back to Calendar</button>
      <h2 className="text-xl font-bold" style={{ color: NAVY }}>{programmes.find((p: any) => p.id === form.id) ? 'Edit Programme' : 'New Programme'}</h2>
      <Section title="Programme Details">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Programme Code" value={form.code || ''} onChange={v => setForm((f: any) => ({ ...f, code: v }))} />
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Days</label>
            <input type="number" min={1} max={10} value={form.days || 1} onChange={e => setForm((f: any) => ({ ...f, days: parseInt(e.target.value) || 1 }))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-yellow-400 bg-white text-gray-800" />
          </div>
        </div>
        <Field label="Title" value={form.title || ''} onChange={v => setForm((f: any) => ({ ...f, title: v }))} />
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Category</label>
          <select value={form.category || 'General'} onChange={e => setForm((f: any) => ({ ...f, category: e.target.value }))}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-yellow-400 bg-white text-gray-800">
            {CATS.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <Field label="Upcoming Date (e.g. June 17-19, 2026)" value={form.upcoming_date || ''} onChange={v => setForm((f: any) => ({ ...f, upcoming_date: v }))} />
        <Field label="Description" value={form.description || ''} onChange={v => setForm((f: any) => ({ ...f, description: v }))} multiline rows={3} />
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm((f: any) => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-yellow-500" />
            Active
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 cursor-pointer">
            <input type="checkbox" checked={form.is_featured} onChange={e => setForm((f: any) => ({ ...f, is_featured: e.target.checked }))} className="w-4 h-4 accent-yellow-500" />
            Featured
          </label>
        </div>
      </Section>
      <div className="flex gap-3">
        <button onClick={handleSave} className="px-6 py-2.5 rounded-xl text-white font-bold" style={{ background: NAVY }}>Save</button>
        <button onClick={() => setEditing(null)} className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold">Cancel</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h2 className="text-xl font-bold" style={{ color: NAVY }}>Training Calendar ({programmes.length} programmes)</h2>
          <p className="text-xs text-gray-400 mt-0.5">These appear in the Upcoming Training section of the website</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold" style={{ background: NAVY }}>
          <Plus size={16} /> Add Programme
        </button>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {CATS.map(c => (
          <button key={c} onClick={() => setFilterCat(c)}
            className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
            style={filterCat === c ? { background: NAVY, color: 'white' } : { background: '#f3f4f6', color: '#374151' }}>
            {c} {c !== 'All' && `(${programmes.filter((p: any) => p.category === c).length})`}
          </button>
        ))}
      </div>

      {/* Programme list */}
      <div className="space-y-2">
        {filtered.map((p: any) => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-slate-100 text-slate-700">{p.code}</span>
                <span className="text-xs px-2 py-0.5 rounded font-bold" style={{ background: '#dbeafe', color: '#1d4ed8' }}>{p.category}</span>
                <span className="text-xs text-gray-500">{p.days} {p.days === 1 ? 'Day' : 'Days'}</span>
                {p.upcoming_date && <span className="text-xs text-gray-400">📅 {p.upcoming_date}</span>}
              </div>
              <div className="font-semibold text-sm text-gray-800 mt-1">{p.title}</div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button onClick={() => toggleFeatured(p.id)}
                className={`px-2 py-1 rounded-full text-[10px] font-bold ${p.is_featured ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-400'}`}>
                ★
              </button>
              <button onClick={() => toggleActive(p.id)}
                className={`px-2 py-1 rounded-full text-[10px] font-bold ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {p.is_active ? 'On' : 'Off'}
              </button>
              <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-gray-100"><Edit3 size={14} className="text-gray-500" /></button>
              <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={14} className="text-red-400" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── shared UI helpers ─────────────────────────────────────────────────────────
function ArrayEditor({ label, items, onChange }: { label: string; items: string[]; onChange: (v: string[]) => void }) {
  const [newItem, setNewItem] = useState('');
  const addItem = () => {
    if (!newItem.trim()) return;
    onChange([...items, newItem.trim()]);
    setNewItem('');
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b pb-2">{label}</h4>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2 group">
            <input
              type="text"
              value={item}
              onChange={e => { const next = [...items]; next[i] = e.target.value; onChange(next); }}
              className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-yellow-400 bg-white text-gray-800"
            />
            <button onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addItem()}
          placeholder="Add new item..."
          className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-yellow-400 bg-white text-gray-800"
        />
        <button onClick={addItem} className="px-3 py-1.5 rounded-lg text-white text-sm font-bold flex-shrink-0" style={{ background: NAVY }}>
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
      {title && <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 border-b pb-3">{title}</h3>}
      {children}
    </div>
  );
}

function SaveBar({ onSave }: { onSave: () => void }) {
  return (
    <div className="sticky bottom-0 bg-white border-t border-gray-100 -mx-6 px-6 py-4 flex justify-end shadow-lg">
      <button onClick={onSave} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-sm shadow-md hover:opacity-90 transition-opacity" style={{ background: NAVY }}>
        <Save size={16} /> Save Changes
      </button>
    </div>
  );
}
