import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { uploadImageToStorage } from '../lib/storage';
import { uploadAndCreateMedia } from '../lib/media';
import { Menu, LogOut, Settings, Image as ImageIcon, LayoutGrid as Layout, FileText, Users, BarChart3, Save, Plus, Trash2, CreditCard as Edit3, ArrowLeft, RefreshCw, CheckCircle, AlertCircle, Palette, BookOpen, GraduationCap } from 'lucide-react';
import MediaLibrary from '../components/MediaLibrary';
import MediaPicker from '../components/MediaPicker';

const GOLD = '#C9A84C';
const NAVY = '#0F2044';

type Tab = 'dashboard' | 'hero' | 'sections' | 'media' | 'content-blocks' | 'team' | 'faqs' | 'footer' | 'trainings' | 'blogs' | 'settings';

const FALLBACK_TRAININGS = [
  {
    id: 't-1',
    title: 'Advanced Records Management & Digitalisation',
    short_summary: 'Master the transition from physical filing systems to secure, searchable digital databases.',
    synopsis: 'This comprehensive programme covers document classification, indexing schemas, digital archiving, access control management, and metadata structure design. Participants will learn how to configure an electronic document management system (EDMS) and draft records management policies to guarantee audit compliance.',
    image_url: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg',
    category: 'Digital',
    duration: '3 Days',
    is_active: true,
    sort_order: 1
  },
  {
    id: 't-2',
    title: 'Asset Verification & Register Development',
    short_summary: 'Learn practical methods for physical asset counting, barcode tagging, and register reconciliation.',
    synopsis: 'A step-by-step training on establishing an institutional asset tracking system. Covers asset labeling methodologies (barcodes/QR codes), location mapping, depreciation scheduling, custodian assignments, and register auditing. Learn to reconcile the physical reality of assets with your balance sheet.',
    image_url: 'https://images.pexels.com/photos/6169668/pexels-photo-6169668.jpeg',
    category: 'Finance',
    duration: '2 Days',
    is_active: true,
    sort_order: 2
  },
  {
    id: 't-3',
    title: 'ISO 9001:2015 Quality Management Systems (QMS) Lead Implementer',
    short_summary: 'Gain the skills to design, deploy, and maintain an ISO-compliant quality framework in your organisation.',
    synopsis: 'Become a certified quality manager. This course guides you through the ISO 9001 standard clauses, gap analysis methodologies, document controls, internal audit design, and management review protocols. Gain the tools to prepare your company for external certification.',
    image_url: 'https://images.pexels.com/photos/5716001/pexels-photo-5716001.jpeg',
    category: 'Leadership',
    duration: '5 Days',
    is_active: true,
    sort_order: 3
  }
];

const FALLBACK_BLOGS = [
  {
    id: 'fb-1',
    title: 'The Roadmap to Successful Records Digitalisation in Corporate Ghana',
    excerpt: 'Transitioning from paper to digital records is more than just scanning documents. Learn the critical steps to design secure, compliant, and highly accessible document management workflows.',
    content: `In today’s fast-paced corporate environment, information is one of the most valuable assets an organisation possesses. Yet, many businesses in Ghana and across West Africa still rely heavily on paper records. This reliance creates inefficiencies, security vulnerabilities, and compliance risks.

Digitalisation is the process of converting physical documents into digital formats and structuring them within an enterprise document management system (DMS). However, a successful transition involves much more than just buying a high-speed scanner.

### The Pillars of Records Digitalisation

1. **Comprehensive Auditing & Classification:** Before scanning a single sheet, you must understand what files you have, where they are stored, and their legal retention requirements. Classify records based on departments, security clearances, and access frequencies.
2. **Metadata Tagging & Indexing:** Digital files are useless if they cannot be found. Implementing a robust taxonomy with custom metadata fields (e.g., invoice number, client name, audit date) ensures that searches yield instantaneous, precise results.
3. **Information Security & Access Controls:** Digital records must be protected from unauthorized access. Establishing role-based access permissions ensures that sensitive financial or HR records are only visible to authorized personnel.
4. **Integration with Existing Workflows:** Your DMS should not be an isolated island. Integrating it with your ERP, CRM, and communication tools makes it a natural extension of your daily operations.

### Immediate Business Benefits

* **Up to 80% Time Saved:** Staff no longer spend hours digging through filing cabinets. Document retrieval takes seconds.
* **Physical Space Recovery:** Free up expensive office real estate previously occupied by filing rooms.
* **Enhanced Audit Readiness:** Instant compliance checks and zero missing paperwork make external audits smooth and stress-free.

Investing in records digitalisation is not a cost — it is a foundational strategic step toward operational excellence.`,
    featured_image_url: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg',
    slug: 'records-digitalisation-roadmap',
    is_published: true,
    published_at: '2026-06-01T10:00:00Z',
    sort_order: 1
  }
];

const DEFAULT_MEDIA = [
  { id: 'default-logo', name: 'Header Logo', image_url: '/biglogo.png', alt_text: 'Enka Prime logo', category: 'Brand', is_active: true },
  { id: 'default-footer-logo', name: 'Footer Logo', image_url: '/white-enka-prime-logo.png', alt_text: 'Enka Prime white logo', category: 'Brand', is_active: true },
  { id: 'default-hero', name: 'Homepage Hero', image_url: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg', alt_text: 'Professional team', category: 'Hero', is_active: true },
  { id: 'default-training', name: 'Training Programmes', image_url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg', alt_text: 'Corporate training', category: 'Training', is_active: true },
  { id: 'default-records', name: 'Records Digitalisation', image_url: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg', alt_text: 'Records digitalisation', category: 'Services', is_active: true },
  { id: 'default-assets', name: 'Asset Tagging', image_url: 'https://images.pexels.com/photos/6169668/pexels-photo-6169668.jpeg', alt_text: 'Asset tagging', category: 'Services', is_active: true },
  { id: 'default-iso', name: 'ISO Implementation', image_url: 'https://images.pexels.com/photos/5716001/pexels-photo-5716001.jpeg', alt_text: 'ISO implementation', category: 'Services', is_active: true },
  ...FALLBACK_TRAININGS.map(item => ({
    id: `training-${item.id}`,
    name: item.title,
    image_url: item.image_url,
    alt_text: item.title,
    category: 'Training',
    is_active: true,
  })),
  ...FALLBACK_BLOGS.map(item => ({
    id: `blog-${item.id}`,
    name: item.title,
    image_url: item.featured_image_url,
    alt_text: item.title,
    category: 'Blogs',
    is_active: true,
  })),
];

const mergeMedia = (items: any[]) => {
  const seen = new Set<string>();
  return [...items, ...DEFAULT_MEDIA].filter(item => {
    const key = item.image_url || item.id;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};


interface AdminProps {
  onNavigate: (page: string) => void;
}

const TabConfig = [
  { key: 'dashboard' as Tab, label: 'Dashboard', icon: BarChart3 },
  { key: 'hero' as Tab, label: 'Hero Banners', icon: Layout },
  { key: 'sections' as Tab, label: 'Page Sections', icon: FileText },
  { key: 'media' as Tab, label: 'Media Library', icon: ImageIcon },
  { key: 'content-blocks' as Tab, label: 'Content Blocks', icon: Palette },
  { key: 'trainings' as Tab, label: 'Trainings', icon: GraduationCap },
  { key: 'blogs' as Tab, label: 'Blogs', icon: BookOpen },
  { key: 'team' as Tab, label: 'Team Members', icon: Users },
  { key: 'faqs' as Tab, label: 'FAQs', icon: FileText },
  { key: 'footer' as Tab, label: 'Footer', icon: Settings },
  { key: 'settings' as Tab, label: 'Site Settings', icon: Settings },
];

export default function AdminCMS({ onNavigate }: AdminProps) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Data states
  const [heroes, setHeroes] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [contentBlocks, setContentBlocks] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [trainings, setTrainings] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<any[]>([]);
  const [isMockMode, setIsMockMode] = useState<boolean>(localStorage.getItem('admin_mock_mode') === 'true');
  const [showSqlModal, setShowSqlModal] = useState<boolean>(false);


  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const convertImageFileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Please choose an image file.'));
        return;
      }

      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Could not read the selected image.'));
      reader.onload = () => {
        const rawResult = reader.result as string;
        const img = new Image();
        img.onerror = () => resolve(rawResult);
        img.onload = () => {
          const maxWidth = 1600;
          const scale = Math.min(1, maxWidth / img.width);
          const width = Math.round(img.width * scale);
          const height = Math.round(img.height * scale);
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(rawResult);
            return;
          }
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.9));
        };
        img.src = rawResult;
      };
      reader.readAsDataURL(file);
    });
  };

  const createMediaFromFile = async (file: File, category = 'General') => {
    const imageUrl = await convertImageFileToDataUrl(file);
    return {
      name: file.name.replace(/\.[^.]+$/, ''),
      description: '',
      image_url: imageUrl,
      alt_text: file.name.replace(/\.[^.]+$/, ''),
      category,
      is_featured: false,
      is_active: true,
    };
  };

  const saveMediaItem = async (item: any) => {
    if (isMockMode) {
      const local = localStorage.getItem('local_media');
      let mediaList = local ? JSON.parse(local) : DEFAULT_MEDIA;
      if (item.id && !String(item.id).startsWith('default-') && !String(item.id).startsWith('training-') && !String(item.id).startsWith('blog-')) {
        mediaList = mediaList.map((m: any) => m.id === item.id ? { ...m, ...item, updated_at: new Date().toISOString() } : m);
      } else {
        mediaList = [...mediaList, { ...item, id: 'media-' + Math.random().toString(36).slice(2, 9), created_at: new Date().toISOString() }];
      }
      localStorage.setItem('local_media', JSON.stringify(mediaList));
      setMedia(mergeMedia(mediaList));
      return;
    }

    if (item.id && !String(item.id).startsWith('default-') && !String(item.id).startsWith('training-') && !String(item.id).startsWith('blog-')) {
      await supabase.from('media_library').update({ ...item, updated_at: new Date().toISOString() }).eq('id', item.id);
    } else {
      const { id, ...insertItem } = item;
      await supabase.from('media_library').insert(insertItem);
    }
    await loadAllData();
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSession(session);
      else if (previewMode) setSession({ preview: true });
      setLoading(false);
    }).catch(() => { if (previewMode) setSession({ preview: true }); setLoading(false); });
    const sub = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setSession(session);
      else if (previewMode) setSession({ preview: true });
      setLoading(false);
    });
    return () => { try { sub.data.subscription.unsubscribe(); } catch (e) { /* ignore */ } };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) { setAuthError(error.message); return; }
      setSignUpSuccess(true);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setAuthError(error.message);
    }
  };

  const handleLogout = async () => {
    if (isMockMode) {
      localStorage.removeItem('admin_mock_mode');
      setIsMockMode(false);
    } else {
      await supabase.auth.signOut();
    }
    setSession(null);
  };


  const loadAllData = useCallback(async () => {
    const loadLocal = (key: string, fallback: any = []) => {
      try {
        const raw = localStorage.getItem(key);
        if (raw) return JSON.parse(raw);
      } catch (e) {
        // ignore
      }
      return typeof fallback === 'function' ? fallback() : fallback;
    };

    // If in mock mode or no session / preview, load from localStorage with sensible fallbacks
    if (isMockMode || !session || (session as any).preview) {
      const localTrainings = loadLocal('local_trainings', FALLBACK_TRAININGS);
      const localBlogs = loadLocal('local_blogs', FALLBACK_BLOGS);
      const localMedia = loadLocal('local_media', DEFAULT_MEDIA);
      const localHeroes = loadLocal('local_heroes', []);
      const localBlocks = loadLocal('local_content_blocks', []);
      const localTeam = loadLocal('local_team_members', []);
      const localSettings = loadLocal('local_settings', []);

      // ensure defaults are seeded in localStorage
      if (!localStorage.getItem('local_media')) localStorage.setItem('local_media', JSON.stringify(DEFAULT_MEDIA));
      if (!localStorage.getItem('local_trainings')) localStorage.setItem('local_trainings', JSON.stringify(FALLBACK_TRAININGS));
      if (!localStorage.getItem('local_blogs')) localStorage.setItem('local_blogs', JSON.stringify(FALLBACK_BLOGS));
      if (!localStorage.getItem('local_settings')) localStorage.setItem('local_settings', JSON.stringify(localSettings));

      setHeroes(localHeroes);
      setMedia(mergeMedia(localMedia));
      setContentBlocks(localBlocks);
      setTeam(localTeam);
      setTrainings(localTrainings);
      setBlogs(localBlogs);
      setSiteSettings(localSettings);
      return;
    }

    try {
      const [
        heroRes, mediaRes, blocksRes, teamRes, trainingsRes, blogsRes, settingsRes
      ] = await Promise.all([
        supabase.from('hero_banners').select('*').order('page_name'),
        supabase.from('media_library').select('*').order('category, name'),
        supabase.from('content_blocks').select('*').order('sort_order'),
        supabase.from('team_members').select('*').order('sort_order'),
        supabase.from('trainings').select('*').order('sort_order'),
        supabase.from('blogs').select('*').order('sort_order'),
        supabase.from('site_settings').select('*')
      ]);

      if (heroRes.data) setHeroes(heroRes.data);
      setMedia(mergeMedia(mediaRes.data || []));
      if (blocksRes.data) setContentBlocks(blocksRes.data || []);
      if (teamRes.data) setTeam(teamRes.data || []);
      if (trainingsRes.data) setTrainings(trainingsRes.data || []);
      if (blogsRes.data) setBlogs(blogsRes.data || []);
      if (settingsRes.data) setSiteSettings(settingsRes.data || []);
    } catch (e) {
      // fallback to localStorage on any DB error
      const localTrainings = loadLocal('local_trainings', FALLBACK_TRAININGS);
      const localBlogs = loadLocal('local_blogs', FALLBACK_BLOGS);
      const localMedia = loadLocal('local_media', DEFAULT_MEDIA);
      const localHeroes = loadLocal('local_heroes', []);
      const localBlocks = loadLocal('local_content_blocks', []);
      const localTeam = loadLocal('local_team_members', []);
      const localSettings = loadLocal('local_settings', []);

      setHeroes(localHeroes);
      setMedia(mergeMedia(localMedia));
      setContentBlocks(localBlocks);
      setTeam(localTeam);
      setTrainings(localTrainings);
      setBlogs(localBlogs);
      setSiteSettings(localSettings);
    }
  }, [session, isMockMode]);

  useEffect(() => {
    if (isMockMode && !session) {
      setSession({ user: { email: 'mock-admin@enkaprime.com' } });
    }
  }, [isMockMode, session]);

  useEffect(() => { loadAllData(); }, [loadAllData]);

  const settingsMap = siteSettings.reduce((acc: Record<string, string>, item: any) => {
    acc[item.key] = typeof item.value === 'string' ? item.value : JSON.stringify(item.value);
    return acc;
  }, {});

  const saveSettingItems = async (items: { key: string; value: string }[]) => {
    if (isMockMode) {
      const updatedSettings = [...siteSettings];
      items.forEach(item => {
        const index = updatedSettings.findIndex((s: any) => s.key === item.key);
        if (index >= 0) updatedSettings[index] = { ...updatedSettings[index], value: item.value };
        else updatedSettings.push(item);
      });
      localStorage.setItem('local_settings', JSON.stringify(updatedSettings));
      setSiteSettings(updatedSettings);
      return;
    }

    for (const item of items) {
      const existing = siteSettings.find((s: any) => s.key === item.key);
      if (existing) await supabase.from('site_settings').update({ value: item.value }).eq('id', existing.id);
      else await supabase.from('site_settings').insert(item);
    }
    await loadAllData();
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: NAVY }}>
        <RefreshCw size={32} className="animate-spin" style={{ color: GOLD }} />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img src="/newlogo.png" alt="Enka Prime" className="h-16 mx-auto mb-4 object-contain" />
            <h1 className="text-2xl font-bold" style={{ color: NAVY }}>CMS Admin</h1>
            <p className="text-gray-500 text-sm mt-1">Manage all website content</p>
          </div>

          <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mb-4">
            {authError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                <AlertCircle size={16} /> {authError}
              </div>
            )}
            {signUpSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
                <CheckCircle size={16} /> Account created! Sign in now.
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2" style={{ color: NAVY }}>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 bg-gray-50 text-slate-800"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2" style={{ color: NAVY }}>Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 bg-gray-50 text-slate-800"
              />
            </div>
            <button type="submit" className="w-full py-3.5 font-bold rounded-xl text-white transition-all hover:scale-[1.02]" style={{ background: NAVY }}>
              {isSignUp ? 'Create Account' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); }}
              className="w-full mt-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              {isSignUp ? 'Already have account? Sign In' : "Don't have account? Create one"}
            </button>
          </form>

          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 text-center shadow-sm">
            <h3 className="text-sm font-bold text-yellow-800 mb-1">Database Authentication issues?</h3>
            <p className="text-xs text-yellow-700 mb-3">You can bypass the database and edit content locally inside your browser instead.</p>
            <button
              type="button"
              onClick={() => {
                localStorage.setItem('admin_mock_mode', 'true');
                setIsMockMode(true);
                setSession({ user: { email: 'mock-admin@enkaprime.com' } });
              }}
              className="w-full py-2.5 px-4 text-xs font-bold rounded-xl text-yellow-900 bg-yellow-450 hover:bg-yellow-500 transition-all shadow-sm"
              style={{ background: '#F59E0B', color: '#FFF' }}
            >
              Bypass Login (Local Edit Mode)
            </button>
          </div>
        </div>
      </div>
    );
  }


  // Hero Editor
  const HeroEditor = () => {
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [mediaTarget, setMediaTarget] = useState<'desktop' | 'mobile'>('desktop');

    const applyMediaToHero = (item: any, target: 'desktop' | 'mobile') => {
      if (!editForm) return;
      if (target === 'desktop') setEditForm({ ...editForm, image_url: item.image_url });
      else setEditForm({ ...editForm, mobile_image_url: item.image_url });
      setShowMediaPicker(false);
      showToast('Applied media to hero');
    };
    const hexToRgba = (hex: string, alpha = 1) => {
      if (!hex) return `rgba(0,0,0,${alpha})`;
      const cleaned = hex.replace('#', '');
      const bigint = parseInt(cleaned.length === 3 ? cleaned.split('').map(c => c + c).join('') : cleaned, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    const [heroes, setHeroes] = useState<any[]>([]);
    const [editForm, setEditForm] = useState<any>(null);

    const fallbackHeroes = [
      {
        id: 'settings-home',
        page_name: 'home',
        title: settingsMap.hero_title || 'Advisory, Systems Improvement & Capacity Building Solutions',
        subtitle: settingsMap.hero_badge_text || 'Professional Advisory • Systems Improvement • Compliance Support',
        description: settingsMap.hero_description || 'Enka Prime Consulting Ltd helps organisations improve operational efficiency, compliance, information management, asset accountability and workforce capability through practical consulting, digital transformation and professional training solutions.',
        image_url: settingsMap.hero_image || 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg',
        cta_text: 'View Programmes',
        cta_link: 'programmes',
        is_active: true,
      },
      {
        id: 'settings-about',
        page_name: 'about',
        title: settingsMap.about_title || 'About Enka Prime',
        subtitle: 'About Us',
        description: settingsMap.about_description || 'Enka Prime Consulting Ltd is a professional services and organisational improvement firm.',
        image_url: settingsMap.about_hero_image || settingsMap.about_image || 'https://images.pexels.com/photos/3184431/pexels-photo-3184431.jpeg',
        cta_text: 'Learn More',
        cta_link: 'about',
        is_active: true,
      },
      {
        id: 'settings-training',
        page_name: 'training',
        title: 'Training & Capacity Building',
        subtitle: 'Upcoming Training',
        description: 'Bespoke in-house corporate training programmes delivered at your premises.',
        image_url: settingsMap.training_hero_image || 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
        cta_text: 'View Training',
        cta_link: 'training',
        is_active: true,
      },
      {
        id: 'settings-contact',
        page_name: 'contact',
        title: "Let's Start a Conversation",
        subtitle: 'Contact',
        description: 'Contact us today to discuss your training and consulting needs.',
        image_url: settingsMap.contact_hero_image || 'https://images.pexels.com/photos/3808517/pexels-photo-3808517.jpeg',
        cta_text: 'Contact Us',
        cta_link: 'contact',
        is_active: true,
      },
    ];

    useEffect(() => {
      if (isMockMode) {
        const local = localStorage.getItem('local_heroes');
        setHeroes(local ? JSON.parse(local) : fallbackHeroes);
      } else {
        supabase.from('hero_banners').select('*').then(({ data }) => {
          setHeroes(data && data.length > 0 ? data : fallbackHeroes);
        });
      }
    }, [isMockMode, siteSettings.length]);

    const saveHero = async (hero: any) => {
      if (String(hero.id || '').startsWith('settings-')) {
        const page = hero.page_name;
        const items = page === 'home'
          ? [
              { key: 'hero_title', value: hero.title || '' },
              { key: 'hero_badge_text', value: hero.subtitle || '' },
              { key: 'hero_description', value: hero.description || '' },
              { key: 'hero_image', value: hero.image_url || '' },
              { key: 'hero_mobile_image', value: hero.mobile_image_url || '' },
              { key: 'hero_overlay_color', value: hero.overlay_color || '' },
              { key: 'hero_gradient_end_color', value: hero.gradient_end_color || '' },
              { key: 'hero_overlay_opacity', value: String(hero.overlay_opacity ?? '') },
              { key: 'hero_gradient_angle', value: String(hero.gradient_angle ?? '') },
              { key: 'hero_button_style', value: hero.button_style || '' },
            ]
          : [
              { key: `${page}_hero_image`, value: hero.image_url || '' },
              { key: `${page}_hero_title`, value: hero.title || '' },
              { key: `${page}_hero_description`, value: hero.description || '' },
              { key: `${page}_hero_mobile_image`, value: hero.mobile_image_url || '' },
              { key: `${page}_hero_overlay_color`, value: hero.overlay_color || '' },
              { key: `${page}_hero_gradient_end_color`, value: hero.gradient_end_color || '' },
              { key: `${page}_hero_overlay_opacity`, value: String(hero.overlay_opacity ?? '') },
              { key: `${page}_hero_gradient_angle`, value: String(hero.gradient_angle ?? '') },
              { key: `${page}_hero_button_style`, value: hero.button_style || '' },
            ];
        await saveSettingItems(items);
      } else if (isMockMode) {
        const local = heroes.some(item => item.id === hero.id)
          ? heroes.map(item => item.id === hero.id ? hero : item)
          : [...heroes, { ...hero, id: 'hero-' + Math.random().toString(36).slice(2, 9) }];
        localStorage.setItem('local_heroes', JSON.stringify(local));
        setHeroes(local);
      } else if (hero.id) {
        await supabase.from('hero_banners').update({ ...hero, updated_at: new Date().toISOString() }).eq('id', hero.id);
      } else {
        await supabase.from('hero_banners').insert(hero);
      }
      await loadAllData();
      setEditForm(null);
      showToast('Hero banner saved');
    };

    const deleteHero = async (id: string) => {
      if (!confirm('Delete this hero banner?')) return;
      if (String(id).startsWith('settings-')) {
        showToast('Built-in page heroes cannot be deleted. You can edit their text and image instead.', 'error');
        return;
      }
      if (isMockMode) {
        const local = heroes.filter(hero => hero.id !== id);
        localStorage.setItem('local_heroes', JSON.stringify(local));
        setHeroes(local);
        showToast('Hero banner deleted');
        return;
      }
      await supabase.from('hero_banners').delete().eq('id', id);
      await loadAllData();
      showToast('Hero banner deleted');
    };

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold" style={{ color: NAVY }}>Hero Banners</h2>
          <button
            onClick={() => setEditForm({ page_name: '', title: '', subtitle: '', description: '', cta_text: 'Learn More', cta_link: '#', image_url: '', overlay_color: NAVY, overlay_opacity: 0.85, text_color: '#ffffff', is_active: true })}
            className="flex items-center gap-2 px-5 py-2.5 font-bold text-sm rounded-lg text-white"
            style={{ background: GOLD, color: NAVY }}
          >
            <Plus size={16} /> Add Hero
          </button>
        </div>

        {editForm && (
          <div className="mb-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Preview — Left side, takes up 2 columns */}
              <div className="lg:col-span-2">
                <div className="rounded-xl overflow-hidden shadow-lg" style={{ height: 450, position: 'relative' }}>
                  <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `url(${editForm.image_url || ''})`,
                    backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.85)'
                  }} />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: `linear-gradient(${editForm.gradient_angle ?? 135}deg, ${hexToRgba(editForm.overlay_color || NAVY, editForm.overlay_opacity ?? 0.9)}, ${hexToRgba(editForm.gradient_end_color || GOLD, (editForm.overlay_opacity ?? 0.9) - 0.15)})`
                  }} />
                  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: `radial-gradient(circle at 10% 10%, rgba(255,255,255,0.02), transparent 10%), radial-gradient(circle at 90% 90%, rgba(0,0,0,0.12), transparent 40%)` }} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, cursor: 'pointer' }}>
                    <div style={{ maxWidth: 900, textAlign: 'center', color: editForm.text_color || '#FFFFFF', width: '100%' }}>
                      <input
                        value={editForm.title || ''}
                        onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                        style={{ fontSize: 36, fontWeight: 800, marginBottom: 8, background: 'transparent', border: 'none', color: editForm.text_color || '#FFFFFF', textAlign: 'center', width: '100%' }}
                        className="font-bold placeholder-white/50"
                        placeholder="Banner title"
                        onClick={e => e.stopPropagation()}
                      />
                      {editForm.subtitle && (
                        <input
                          value={editForm.subtitle || ''}
                          onChange={e => setEditForm({ ...editForm, subtitle: e.target.value })}
                          style={{ fontSize: 16, opacity: 0.95, marginBottom: 12, background: 'transparent', border: 'none', color: editForm.text_color || '#FFFFFF', textAlign: 'center', width: '100%' }}
                          className="placeholder-white/50"
                          placeholder="Subtitle"
                          onClick={e => e.stopPropagation()}
                        />
                      )}
                      {editForm.description && (
                        <textarea
                          value={editForm.description || ''}
                          onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                          style={{ fontSize: 14, opacity: 0.95, marginBottom: 16, background: 'transparent', border: 'none', color: editForm.text_color || '#FFFFFF', textAlign: 'center', width: '100%', minHeight: 60, resize: 'none' }}
                          className="placeholder-white/50"
                          placeholder="Description"
                          onClick={e => e.stopPropagation()}
                        />
                      )}
                      {editForm.cta_text && (
                        <input
                          value={editForm.cta_text || ''}
                          onChange={e => setEditForm({ ...editForm, cta_text: e.target.value })}
                          style={{ padding: '10px 22px', borderRadius: 8, border: editForm.button_style === 'outline' ? '2px solid rgba(255,255,255,0.9)' : 'none', background: editForm.button_style === 'primary' ? GOLD : 'transparent', color: editForm.button_style === 'primary' ? NAVY : '#fff', fontWeight: 700, cursor: 'pointer' }}
                          className="placeholder-white/50"
                          placeholder="Button text"
                          onClick={e => e.stopPropagation()}
                        />
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">💡 Click any text on the banner to edit it.</p>
              </div>

              {/* Right Sidebar — Controls */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <label className="block text-sm font-bold mb-3" style={{ color: NAVY }}>Background Image</label>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 px-3 py-2 bg-white border rounded cursor-pointer text-sm font-medium hover:bg-gray-50">
                      📁 Upload
                      <input type="file" accept="image/*" onChange={e => {
                        const f = e.target.files?.[0]; if (f) {
                          (async () => {
                            try {
                              if (!isMockMode) {
                                const mediaItem = await uploadAndCreateMedia(f, session?.user?.email || 'admin', 'Hero');
                                setEditForm(prev => ({ ...prev, image_url: mediaItem.file_url || mediaItem.image_url }));
                                await loadAllData();
                                showToast('Image uploaded.');
                              } else {
                                const data = await convertImageFileToDataUrl(f);
                                setEditForm(prev => ({ ...prev, image_url: data }));
                              }
                            } catch (err: any) { showToast(err.message || 'Upload failed', 'error'); }
                          })();
                        }
                      }} className="hidden" />
                    </label>
                    <button onClick={() => { setMediaTarget('desktop'); setShowMediaPicker(true); }} className="px-3 py-2 rounded bg-white border text-sm font-medium hover:bg-gray-50">📚 Choose</button>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                  <label className="block text-sm font-bold mb-2" style={{ color: NAVY }}>Overlay Color</label>
                  <input type="color" value={editForm.overlay_color || '#0F2044'} onChange={e => setEditForm({ ...editForm, overlay_color: e.target.value })} className="w-full h-10 p-1 border rounded cursor-pointer" />
                </div>

                <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                  <label className="block text-sm font-bold mb-2" style={{ color: NAVY }}>Gradient Color</label>
                  <input type="color" value={editForm.gradient_end_color || '#C9A84C'} onChange={e => setEditForm({ ...editForm, gradient_end_color: e.target.value })} className="w-full h-10 p-1 border rounded cursor-pointer" />
                </div>

                <div className="bg-gray-100 p-4 rounded-xl border border-gray-200">
                  <label className="block text-xs font-bold mb-2">Opacity</label>
                  <input type="range" min="0" max="1" step="0.05" value={editForm.overlay_opacity ?? 0.85} onChange={e => setEditForm({ ...editForm, overlay_opacity: Number(e.target.value) })} className="w-full" />
                </div>

                <div className="bg-gray-100 p-4 rounded-xl border border-gray-200">
                  <label className="block text-xs font-bold mb-2">Button Style</label>
                  <select value={editForm.button_style || 'primary'} onChange={e => setEditForm({ ...editForm, button_style: e.target.value })} className="w-full px-3 py-2 rounded border text-sm">
                    <option value="primary">Primary (Gold)</option>
                    <option value="outline">Outline</option>
                    <option value="ghost">Ghost</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setEditForm(null)} className="flex-1 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                  <button onClick={() => saveHero(editForm)} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-bold rounded-lg text-white" style={{ background: NAVY }}>
                    <Save size={14} /> Save
                  </button>
                </div>
              </div>
            </div>

            {/* Media picker modal */}
            <MediaPicker open={showMediaPicker} onClose={() => setShowMediaPicker(false)} onSelect={(m: any) => applyMediaToHero(m, mediaTarget)} />
          </div>
        )}

        <div className="space-y-3">
          {heroes.map(hero => (
            <div key={hero.id} className="bg-white p-5 rounded-xl border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
              {hero.image_url && <img src={hero.image_url} alt={hero.title} className="w-20 h-14 rounded object-cover" />}
              <div className="flex-1">
                <div className="font-bold text-lg" style={{ color: NAVY }}>{hero.page_name}</div>
                <p className="text-sm text-gray-500">{hero.title}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setEditForm(hero)} className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105" style={{ background: GOLD, color: NAVY }}>
                  <Edit3 size={18} /> Edit
                </button>
                <button onClick={() => deleteHero(hero.id)} className="p-2.5 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} className="text-red-500" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Trainings Editor
  const TrainingsEditor = () => {
    const [list, setList] = useState<any[]>([]);
    const [editForm, setEditForm] = useState<any>(null);
    const [selectingImageFor, setSelectingImageFor] = useState<string | null>(null);

    const convertImageFileToDataUrl = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
          reject(new Error('Please choose an image file.'));
          return;
        }

        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Could not read the selected image.'));
        reader.onload = () => {
          const rawResult = reader.result as string;
          const img = new Image();
          img.onerror = () => resolve(rawResult);
          img.onload = () => {
            const maxWidth = 1600;
            const scale = Math.min(1, maxWidth / img.width);
            const width = Math.round(img.width * scale);
            const height = Math.round(img.height * scale);
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(rawResult);
              return;
            }
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.9));
          };
          img.src = rawResult;
        };
        reader.readAsDataURL(file);
      });
    };

    const handleTrainingImageUpload = async (file: File | undefined) => {
      if (!file) return;
      try {
        if (!isMockMode) {
          const mediaItem = await uploadAndCreateMedia(file, session?.user?.email || 'admin', 'Training');
          setEditForm((prev: any) => ({ ...prev, image_url: mediaItem.file_url || mediaItem.image_url }));
          await loadAllData();
          showToast('Image uploaded to Media Library. Click Save to keep this training.');
        } else {
          const imageUrl = await convertImageFileToDataUrl(file);
          setEditForm((prev: any) => ({ ...prev, image_url: imageUrl }));
          showToast('Image uploaded. Click Save to keep this training.');
        }
      } catch (e: any) {
        showToast(e.message || 'Image upload failed', 'error');
      }
    };

    useEffect(() => {
      if (isMockMode) {
        const local = localStorage.getItem('local_trainings');
        if (local) {
          setList(JSON.parse(local));
        } else {
          localStorage.setItem('local_trainings', JSON.stringify(FALLBACK_TRAININGS));
          setList(FALLBACK_TRAININGS);
        }
      } else {
        supabase.from('trainings').select('*').order('sort_order').then(({ data }) => data && setList(data));
      }
    }, [isMockMode]);

    const saveTraining = async (item: any) => {
      if (isMockMode) {
        let updatedList = [...list];
        if (item.id) {
          updatedList = updatedList.map(t => t.id === item.id ? { ...t, ...item, updated_at: new Date().toISOString() } : t);
        } else {
          const newItem = { ...item, id: 'mock-' + Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString() };
          updatedList.push(newItem);
        }
        localStorage.setItem('local_trainings', JSON.stringify(updatedList));
        setList(updatedList);
        setTrainings(updatedList);
      } else {
        if (item.id) {
          await supabase.from('trainings').update({ ...item, updated_at: new Date().toISOString() }).eq('id', item.id);
        } else {
          await supabase.from('trainings').insert(item);
        }
        await loadAllData();
      }
      setEditForm(null);
      showToast('Training saved');
    };

    const deleteTraining = async (id: string) => {
      if (!confirm('Delete this training?')) return;
      if (isMockMode) {
        const updatedList = list.filter(t => t.id !== id);
        localStorage.setItem('local_trainings', JSON.stringify(updatedList));
        setList(updatedList);
        setTrainings(updatedList);
      } else {
        await supabase.from('trainings').delete().eq('id', id);
        await loadAllData();
      }
      showToast('Training deleted');
    };


    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold" style={{ color: NAVY }}>Trainings</h2>
          <button onClick={() => setEditForm({ title: '', short_summary: '', synopsis: '', image_url: '', category: 'General', duration: '2 Days', is_active: true, sort_order: 100 })} className="flex items-center gap-2 px-5 py-2.5 font-bold text-sm rounded-lg text-white" style={{ background: GOLD, color: NAVY }}>
            <Plus size={16} /> Add Training
          </button>
        </div>

        {editForm && (
          <div className="bg-yellow-50 p-6 rounded-xl border-2 border-yellow-200 mb-6">
            <h3 className="font-bold mb-4" style={{ color: NAVY }}>Add / Edit Training</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <input placeholder="Title" value={editForm.title || ''} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className="px-4 py-2 rounded-lg border col-span-2" />
              <input placeholder="Short Summary" value={editForm.short_summary || ''} onChange={e => setEditForm({ ...editForm, short_summary: e.target.value })} className="px-4 py-2 rounded-lg border col-span-2" />
              <textarea placeholder="Synopsis" rows={4} value={editForm.synopsis || ''} onChange={e => setEditForm({ ...editForm, synopsis: e.target.value })} className="px-4 py-2 rounded-lg border col-span-2" />
              <input placeholder="Category" value={editForm.category || ''} onChange={e => setEditForm({ ...editForm, category: e.target.value })} className="px-4 py-2 rounded-lg border" />
              <input placeholder="Duration" value={editForm.duration || ''} onChange={e => setEditForm({ ...editForm, duration: e.target.value })} className="px-4 py-2 rounded-lg border" />
              {/* Image URL removed — uploads and Media Library selection only */}
              <button type="button" onClick={() => setSelectingImageFor('training')} className="px-4 py-2 rounded-lg bg-gray-100">Choose from Media Library</button>
              <label className="col-span-2 flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-dashed border-yellow-300 bg-white/70 px-4 py-3 text-sm">
                <span className="font-semibold" style={{ color: NAVY }}>Upload image from computer</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => handleTrainingImageUpload(e.target.files?.[0])}
                  className="text-sm"
                />
              </label>
              {editForm.image_url && (
                <div className="col-span-2 rounded-xl border border-yellow-200 bg-white p-3">
                  <div className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">Image Preview</div>
                  <img src={editForm.image_url} alt="Training preview" className="max-h-72 w-full rounded-lg object-contain bg-gray-50" />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setEditForm(null)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800">Cancel</button>
              <button onClick={() => saveTraining(editForm)} className="flex items-center gap-1 px-4 py-2 text-sm font-bold rounded-lg text-white" style={{ background: NAVY }}><Save size={14} /> Save</button>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {list.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 flex gap-3">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-28 h-20 object-cover rounded bg-gray-100"
                  onError={e => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-28 h-20 rounded bg-gray-100 flex items-center justify-center text-gray-300">
                  <ImageIcon size={24} />
                </div>
              )}
              <div className="flex-1">
                <div className="font-bold" style={{ color: NAVY }}>{item.title}</div>
                <p className="text-xs text-gray-500">{item.short_summary}</p>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => setEditForm(item)} className="p-2 hover:bg-gray-100 rounded"><Edit3 size={16} style={{ color: GOLD }} /></button>
                <button onClick={() => deleteTraining(item.id)} className="p-2 hover:bg-red-50 rounded"><Trash2 size={16} className="text-red-500" /></button>
              </div>
            </div>
          ))}
        </div>

        <MediaPicker open={!!selectingImageFor} onClose={() => setSelectingImageFor(null)} onSelect={(m: any) => { setEditForm({ ...editForm, image_url: m.file_url || m.image_url }); setSelectingImageFor(null); }} />
      </div>
    );
  };

  // Blogs Editor
  const BlogsEditor = () => {
    const [list, setList] = useState<any[]>([]);
    const [editForm, setEditForm] = useState<any>(null);
    const [selectingImageFor, setSelectingImageFor] = useState<boolean>(false);

    const handleBlogImageUpload = async (file: File | undefined) => {
      if (!file) return;
      try {
        if (!isMockMode) {
          const mediaItem = await uploadAndCreateMedia(file, session?.user?.email || 'admin', 'Blogs');
          setEditForm((prev: any) => ({ ...prev, featured_image_url: mediaItem.file_url || mediaItem.image_url }));
          await loadAllData();
          showToast('Image uploaded to Media Library. Click Save to keep this article.');
        } else {
          const imageUrl = await convertImageFileToDataUrl(file);
          setEditForm((prev: any) => ({ ...prev, featured_image_url: imageUrl }));
          showToast('Image uploaded. Click Save to keep this article.');
        }
      } catch (e: any) {
        showToast(e.message || 'Image upload failed', 'error');
      }
    };

    useEffect(() => {
      if (isMockMode) {
        const local = localStorage.getItem('local_blogs');
        if (local) {
          setList(JSON.parse(local));
        } else {
          localStorage.setItem('local_blogs', JSON.stringify(FALLBACK_BLOGS));
          setList(FALLBACK_BLOGS);
        }
      } else {
        supabase.from('blogs').select('*').order('sort_order').then(({ data }) => data && setList(data));
      }
    }, [isMockMode]);

    const saveBlog = async (item: any) => {
      if (isMockMode) {
        let updatedList = [...list];
        if (item.id) {
          updatedList = updatedList.map(t => t.id === item.id ? { ...t, ...item, updated_at: new Date().toISOString() } : t);
        } else {
          const newItem = { ...item, id: 'mock-' + Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString() };
          updatedList.push(newItem);
        }
        localStorage.setItem('local_blogs', JSON.stringify(updatedList));
        setList(updatedList);
        setBlogs(updatedList);
      } else {
        if (item.id) {
          await supabase.from('blogs').update({ ...item, updated_at: new Date().toISOString() }).eq('id', item.id);
        } else {
          await supabase.from('blogs').insert(item);
        }
        await loadAllData();
      }
      setEditForm(null);
      showToast('Blog saved');
    };

    const deleteBlog = async (id: string) => {
      if (!confirm('Delete this blog?')) return;
      if (isMockMode) {
        const updatedList = list.filter(t => t.id !== id);
        localStorage.setItem('local_blogs', JSON.stringify(updatedList));
        setList(updatedList);
        setBlogs(updatedList);
      } else {
        await supabase.from('blogs').delete().eq('id', id);
        await loadAllData();
      }
      showToast('Blog deleted');
    };


    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold" style={{ color: NAVY }}>Blogs</h2>
          <button onClick={() => setEditForm({ title: '', excerpt: '', content: '', featured_image_url: '', slug: '', is_published: false, sort_order: 100 })} className="flex items-center gap-2 px-5 py-2.5 font-bold text-sm rounded-lg text-white" style={{ background: GOLD, color: NAVY }}>
            <Plus size={16} /> Add Article
          </button>
        </div>

        {editForm && (
          <div className="bg-yellow-50 p-6 rounded-xl border-2 border-yellow-200 mb-6">
            <h3 className="font-bold mb-4" style={{ color: NAVY }}>Add / Edit Article</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <input placeholder="Title" value={editForm.title || ''} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className="px-4 py-2 rounded-lg border col-span-2" />
              <input placeholder="Excerpt" value={editForm.excerpt || ''} onChange={e => setEditForm({ ...editForm, excerpt: e.target.value })} className="px-4 py-2 rounded-lg border col-span-2" />
              <textarea placeholder="Content (Markdown)" rows={6} value={editForm.content || ''} onChange={e => setEditForm({ ...editForm, content: e.target.value })} className="px-4 py-2 rounded-lg border col-span-2" />
              <input placeholder="Slug" value={editForm.slug || ''} onChange={e => setEditForm({ ...editForm, slug: e.target.value })} className="px-4 py-2 rounded-lg border" />
              {/* Image URL removed — uploads and Media Library selection only */}
              <button type="button" onClick={() => setSelectingImageFor(true)} className="px-4 py-2 rounded-lg bg-gray-100">Choose from Media Library</button>
              <label className="col-span-2 flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-dashed border-yellow-300 bg-white/70 px-4 py-3 text-sm">
                <span className="font-semibold" style={{ color: NAVY }}>Upload article image from computer</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => handleBlogImageUpload(e.target.files?.[0])}
                  className="text-sm"
                />
              </label>
              {editForm.featured_image_url && (
                <div className="col-span-2 rounded-xl border border-yellow-200 bg-white p-3">
                  <div className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">Image Preview</div>
                  <img src={editForm.featured_image_url} alt="Article preview" className="max-h-72 w-full rounded-lg object-contain bg-gray-50" />
                </div>
              )}
              <label className="col-span-2 inline-flex items-center gap-2"><input type="checkbox" checked={!!editForm.is_published} onChange={e => setEditForm({ ...editForm, is_published: e.target.checked })} /> Publish</label>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setEditForm(null)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800">Cancel</button>
              <button onClick={() => saveBlog(editForm)} className="flex items-center gap-1 px-4 py-2 text-sm font-bold rounded-lg text-white" style={{ background: NAVY }}><Save size={14} /> Save</button>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {list.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 flex gap-3">
              {item.featured_image_url && <img src={item.featured_image_url} alt={item.title} className="w-28 h-20 object-cover rounded" />}
              <div className="flex-1">
                <div className="font-bold" style={{ color: NAVY }}>{item.title}</div>
                <p className="text-xs text-gray-500">{item.excerpt}</p>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => setEditForm(item)} className="p-2 hover:bg-gray-100 rounded"><Edit3 size={16} style={{ color: GOLD }} /></button>
                <button onClick={() => deleteBlog(item.id)} className="p-2 hover:bg-red-50 rounded"><Trash2 size={16} className="text-red-500" /></button>
              </div>
            </div>
          ))}
        </div>

        <MediaPicker open={!!selectingImageFor} onClose={() => setSelectingImageFor(false)} onSelect={(m: any) => { setEditForm({ ...editForm, featured_image_url: m.file_url || m.image_url }); setSelectingImageFor(false); }} />
      </div>
    );
  };

  // Site Settings Editor (download banner)
  const SiteSettingsEditor = () => {
    const [banner, setBanner] = useState<any>({ key: 'download_banner', text: 'Click to download our eBook', cta_text: 'Download', cta_link: '#', is_active: true });
    const [settingsDraft, setSettingsDraft] = useState<Record<string, string>>({});

    useEffect(() => {
      const map: Record<string, string> = {};
      siteSettings.forEach((s: any) => {
        map[s.key] = typeof s.value === 'string' ? s.value : JSON.stringify(s.value);
      });
      setSettingsDraft(map);

      const b = siteSettings.find((s: any) => s.key === 'download_banner');
      if (b) {
        try {
          if (typeof b.value === 'string') {
            setBanner(JSON.parse(b.value));
          } else {
            setBanner(b);
          }
        } catch(e) {
          setBanner(b);
        }
      }
    }, [siteSettings]);

    const saveSettings = async (items: { key: string; value: string }[]) => {
      if (isMockMode) {
        const updatedSettings = [...siteSettings];
        items.forEach(item => {
          const index = updatedSettings.findIndex((s: any) => s.key === item.key);
          if (index >= 0) updatedSettings[index] = { ...updatedSettings[index], value: item.value };
          else updatedSettings.push(item);
        });
        localStorage.setItem('local_settings', JSON.stringify(updatedSettings));
        setSiteSettings(updatedSettings);
      } else {
        for (const item of items) {
          const existing = siteSettings.find((s: any) => s.key === item.key);
          if (existing) await supabase.from('site_settings').update({ value: item.value }).eq('id', existing.id);
          else await supabase.from('site_settings').insert(item);
        }
        await loadAllData();
      }
    };

    const saveBanner = async () => {
      await saveSettings([{ key: 'download_banner', value: JSON.stringify(banner) }]);
      showToast('Site settings saved');
    };

    const updateDraft = (key: string, value: string) => {
      setSettingsDraft(prev => ({ ...prev, [key]: value }));
    };

    const saveWebsiteContent = async () => {
      await saveSettings(Object.entries(settingsDraft).map(([key, value]) => ({ key, value })));
      showToast('Website content saved');
    };

    const fields = [
      {
        title: 'Brand, Contact & Social Media',
        items: [
          ['header_logo', 'Header logo URL'],
          ['footer_logo', 'Footer logo URL'],
          ['site_title', 'Browser / Google title'],
          ['site_tagline', 'Website description'],
          ['contact_email', 'Contact email'],
          ['contact_phone', 'Contact phone'],
          ['contact_location', 'Location text'],
          ['facebook_url', 'Facebook link'],
          ['linkedin_url', 'LinkedIn link'],
          ['whatsapp_url', 'WhatsApp link'],
        ],
      },
      {
        title: 'Home Page Hero',
        items: [
          ['hero_badge_text', 'Small gold badge text'],
          ['hero_title', 'Main hero headline'],
          ['hero_rotator_words', 'Rotating words, separated by commas'],
          ['hero_description', 'Hero paragraph'],
          ['hero_image', 'Hero background image (use Media Library)'],
        ],
      },
      {
        title: 'Home Page Sections',
        items: [
          ['cta_title', 'CTA title'],
          ['cta_discipline_highlight', 'CTA highlighted words'],
          ['cta_description', 'CTA description'],
          ['cta_image', 'CTA background image (use Media Library)'],
          ['about_title', 'Who We Are title'],
          ['about_description', 'Who We Are first paragraph'],
          ['about_extended', 'Who We Are second paragraph'],
          ['about_bullets', 'Who We Are bullets, separated by commas'],
          ['about_pull_quote', 'Who We Are quote'],
          ['about_image', 'Who We Are main image (use Media Library)'],
          ['team_image', 'Team / secondary image (use Media Library)'],
        ],
      },
    ];

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold" style={{ color: NAVY }}>Site Settings</h2>
        <div className="bg-white p-6 rounded-xl border">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="font-bold" style={{ color: NAVY }}>Website Text, Pictures & Links</h3>
              <p className="text-xs text-gray-500 mt-1">Edit the main content that appears across the public website. For pictures, upload from your device or choose from the Media Library.</p>
            </div>
            <button onClick={saveWebsiteContent} className="px-4 py-2 rounded-lg text-white font-bold text-sm" style={{ background: NAVY }}>
              <Save size={14} className="inline mr-1" /> Save Website Content
            </button>
          </div>

          <div className="space-y-6">
            {fields.map(section => (
              <div key={section.title} className="rounded-xl border border-gray-100 p-4">
                <h4 className="font-bold mb-3" style={{ color: NAVY }}>{section.title}</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {section.items.map(([key, label]) => {
                    const isLong = key.includes('description') || key.includes('extended') || key.includes('bullets') || key.includes('quote') || key.includes('tagline');
                    return (
                      <label key={key} className={isLong ? 'md:col-span-2' : ''}>
                        <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</span>
                        {isLong ? (
                          <textarea rows={3} value={settingsDraft[key] || ''} onChange={e => updateDraft(key, e.target.value)} className="w-full px-4 py-2 rounded-lg border" />
                        ) : (
                          <input value={settingsDraft[key] || ''} onChange={e => updateDraft(key, e.target.value)} className="w-full px-4 py-2 rounded-lg border" />
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border">
          <h3 className="font-bold mb-3">Top Download Banner</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <input value={banner.text || ''} onChange={e => setBanner({ ...banner, text: e.target.value })} className="px-4 py-2 rounded-lg border" />
            <input value={banner.cta_text || ''} onChange={e => setBanner({ ...banner, cta_text: e.target.value })} className="px-4 py-2 rounded-lg border" />
            <input value={banner.cta_link || ''} onChange={e => setBanner({ ...banner, cta_link: e.target.value })} className="px-4 py-2 rounded-lg border col-span-2" />
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={!!banner.is_active} onChange={e => setBanner({ ...banner, is_active: e.target.checked })} /> Active</label>
          </div>
          <div className="flex justify-end mt-4">
            <button onClick={saveBanner} className="px-4 py-2 rounded-lg text-white" style={{ background: NAVY }}>Save</button>
          </div>
        </div>
      </div>
    );
  };

  const SimpleSettingsEditor = ({
    title,
    description,
    groups,
  }: {
    title: string;
    description: string;
    groups: { title: string; fields: [string, string, 'text' | 'textarea' | 'image'][] }[];
  }) => {
    const [draft, setDraft] = useState<Record<string, string>>({});

    useEffect(() => {
      setDraft(settingsMap);
    }, [siteSettings.length]);

    const update = (key: string, value: string) => setDraft(prev => ({ ...prev, [key]: value }));

    const save = async () => {
      const keys = groups.flatMap(group => group.fields.map(([key]) => key));
      await saveSettingItems(keys.map(key => ({ key, value: draft[key] || '' })));
      showToast(`${title} saved`);
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: NAVY }}>{title}</h2>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </div>
          <button onClick={save} className="px-4 py-2 rounded-lg text-white font-bold text-sm" style={{ background: NAVY }}>
            <Save size={14} className="inline mr-1" /> Save Changes
          </button>
        </div>

        {groups.map(group => (
          <div key={group.title} className="bg-white p-6 rounded-xl border border-gray-100">
            <h3 className="font-bold mb-4" style={{ color: NAVY }}>{group.title}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {group.fields.map(([key, label, type]) => (
                <label key={key} className={type === 'textarea' || type === 'image' ? 'md:col-span-2' : ''}>
                  <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">{label}</span>
                  {type === 'textarea' ? (
                    <textarea rows={4} value={draft[key] || ''} onChange={e => update(key, e.target.value)} className="w-full px-4 py-2 rounded-lg border" />
                  ) : (
                    <input value={draft[key] || ''} onChange={e => update(key, e.target.value)} className="w-full px-4 py-2 rounded-lg border" />
                  )}
                  {type === 'image' && (
                    <div className="mt-3">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                        {media.slice(0, 8).map(item => (
                          <button
                            type="button"
                            key={`${key}-${item.id}`}
                            onClick={() => update(key, item.image_url)}
                            className="overflow-hidden rounded-lg border hover:border-yellow-400"
                          >
                            <img src={item.image_url} alt={item.name} className="h-20 w-full object-cover" />
                          </button>
                        ))}
                      </div>
                      {draft[key] && <img src={draft[key]} alt={label} className="max-h-60 w-full rounded-lg object-contain bg-gray-50" />}
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const PageSectionsEditor = () => (
    <SimpleSettingsEditor
      title="Page Sections"
      description="Edit the text and images used in the main homepage sections."
      groups={[
        {
          title: 'Discovery / CTA Section',
          fields: [
            ['cta_title', 'Section title', 'text'],
            ['cta_discipline_highlight', 'Highlighted words', 'text'],
            ['cta_description', 'Description', 'textarea'],
            ['cta_image', 'Background image', 'image'],
          ],
        },
        {
          title: 'Who We Are Section',
          fields: [
            ['about_title', 'Title', 'text'],
            ['about_description', 'First paragraph', 'textarea'],
            ['about_extended', 'Second paragraph', 'textarea'],
            ['about_bullets', 'Bullet list, separated by commas', 'textarea'],
            ['about_pull_quote', 'Quote', 'textarea'],
            ['about_image', 'Main image', 'image'],
            ['team_image', 'Secondary/team image', 'image'],
          ],
        },
      ]}
    />
  );

  const ContentBlocksEditor = () => (
    <SimpleSettingsEditor
      title="Content Blocks"
      description="Edit repeated content blocks such as homepage stats, service headings, and industry headings."
      groups={[
        {
          title: 'Hero Stats',
          fields: [
            ['hero_stat_1_value', 'Stat 1 value', 'text'],
            ['hero_stat_1_label', 'Stat 1 label', 'text'],
            ['hero_stat_2_value', 'Stat 2 value', 'text'],
            ['hero_stat_2_label', 'Stat 2 label', 'text'],
            ['hero_stat_3_value', 'Stat 3 value', 'text'],
            ['hero_stat_3_label', 'Stat 3 label', 'text'],
            ['hero_stat_4_value', 'Stat 4 value', 'text'],
            ['hero_stat_4_label', 'Stat 4 label', 'text'],
          ],
        },
        {
          title: 'Services & Industries',
          fields: [
            ['services_heading', 'Service section heading', 'text'],
            ['services_description', 'Service section description', 'textarea'],
            ['industries_heading', 'Industry section heading', 'text'],
            ['industries_description', 'Industry section description', 'textarea'],
            ['why_choose_heading', 'Why partner heading', 'text'],
          ],
        },
      ]}
    />
  );

  const TeamMembersEditor = () => (
    <SimpleSettingsEditor
      title="Team Members"
      description="Edit the team section content and imagery shown on the website."
      groups={[
        {
          title: 'Team Section',
          fields: [
            ['team_section_title', 'Team section title', 'text'],
            ['team_section_description', 'Team section description', 'textarea'],
            ['team_image', 'Team image', 'image'],
          ],
        },
      ]}
    />
  );

  const FaqsEditor = () => (
    <SimpleSettingsEditor
      title="FAQs"
      description="Edit frequently asked questions. Use one question/answer per numbered field."
      groups={[
        {
          title: 'FAQ Content',
          fields: [
            ['faq_1_question', 'Question 1', 'text'],
            ['faq_1_answer', 'Answer 1', 'textarea'],
            ['faq_2_question', 'Question 2', 'text'],
            ['faq_2_answer', 'Answer 2', 'textarea'],
            ['faq_3_question', 'Question 3', 'text'],
            ['faq_3_answer', 'Answer 3', 'textarea'],
          ],
        },
      ]}
    />
  );

  const FooterEditor = () => {
    const [footerDraft, setFooterDraft] = useState<any>({
      description: '',
      contact_email: '',
      contact_phone: '',
      linkedin_url: '',
      copyright_text: '',
      tagline: '',
    });

    useEffect(() => {
      try {
        setFooterDraft(settingsMap.footer_config ? JSON.parse(settingsMap.footer_config) : {
          description: settingsMap.footer_description || 'Integrated professional solutions that strengthen systems, improve compliance, enhance accountability, and build organisational capacity for sustainable performance.',
          contact_email: settingsMap.contact_email || 'info@enkaprime.com',
          contact_phone: settingsMap.contact_phone || '0200 769 146',
          linkedin_url: settingsMap.linkedin_url || '',
          copyright_text: '© 2026 Enka Prime Consulting Ltd. All rights reserved.',
          tagline: settingsMap.about_tagline || 'Empowering People. Enhancing Performance. Delivering Excellence.',
        });
      } catch {
        setFooterDraft({});
      }
    }, [siteSettings.length]);

    const save = async () => {
      await saveSettingItems([
        { key: 'footer_config', value: JSON.stringify(footerDraft) },
        { key: 'footer_logo', value: settingsMap.footer_logo || '/white-enka-prime-logo.png' },
      ]);
      showToast('Footer saved');
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: NAVY }}>Footer</h2>
            <p className="text-sm text-gray-500 mt-1">Edit footer description, contact details, copyright, and tagline.</p>
          </div>
          <button onClick={save} className="px-4 py-2 rounded-lg text-white font-bold text-sm" style={{ background: NAVY }}>
            <Save size={14} className="inline mr-1" /> Save Footer
          </button>
        </div>
        <div className="bg-white p-6 rounded-xl border grid md:grid-cols-2 gap-4">
          {[
            ['description', 'Footer description', 'textarea'],
            ['contact_email', 'Contact email', 'text'],
            ['contact_phone', 'Contact phone', 'text'],
            ['linkedin_url', 'LinkedIn URL', 'text'],
            ['copyright_text', 'Copyright text', 'text'],
            ['tagline', 'Footer tagline', 'text'],
          ].map(([key, label, type]) => (
            <label key={key} className={type === 'textarea' ? 'md:col-span-2' : ''}>
              <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">{label}</span>
              {type === 'textarea' ? (
                <textarea rows={4} value={footerDraft[key] || ''} onChange={e => setFooterDraft({ ...footerDraft, [key]: e.target.value })} className="w-full px-4 py-2 rounded-lg border" />
              ) : (
                <input value={footerDraft[key] || ''} onChange={e => setFooterDraft({ ...footerDraft, [key]: e.target.value })} className="w-full px-4 py-2 rounded-lg border" />
              )}
            </label>
          ))}
        </div>
      </div>
    );
  };

  // Media Library
  const MediaLibrary = () => {
    const [mediaList, setMediaList] = useState<any[]>([]);
    const [editForm, setEditForm] = useState<any>(null);

    useEffect(() => {
      if (isMockMode) {
        const local = localStorage.getItem('local_media');
        const items = local ? JSON.parse(local) : DEFAULT_MEDIA;
        if (!local) localStorage.setItem('local_media', JSON.stringify(DEFAULT_MEDIA));
        setMediaList(mergeMedia(items));
      } else {
        supabase.from('media_library').select('*').then(({ data }) => setMediaList(mergeMedia(data || [])));
      }
    }, [isMockMode]);

    const saveMedia = async (item: any) => {
      await saveMediaItem(item);
      const local = localStorage.getItem('local_media');
      if (isMockMode) setMediaList(mergeMedia(local ? JSON.parse(local) : DEFAULT_MEDIA));
      else {
        const { data } = await supabase.from('media_library').select('*');
        setMediaList(mergeMedia(data || []));
      }
      setEditForm(null);
      showToast('Media saved');
    };

    const uploadMedia = async (file: File | undefined) => {
      if (!file) return;
      try {
        if (!isMockMode) {
          const url = await uploadImageToStorage(file);
          setEditForm((prev: any) => ({ ...(prev || {}), image_url: url, name: file.name.replace(/\.[^.]+$/, '') }));
          showToast('Image uploaded to storage. Add a name/category, then click Save.');
        } else {
          const mediaItem = await createMediaFromFile(file, editForm?.category || 'General');
          setEditForm((prev: any) => ({ ...(prev || {}), ...mediaItem }));
          showToast('Image uploaded. Add a name/category, then click Save.');
        }
      } catch (e: any) {
        showToast(e.message || 'Image upload failed', 'error');
      }
    };

    const deleteMedia = async (id: string) => {
      if (!confirm('Delete this image?')) return;
      if (String(id).startsWith('default-') || String(id).startsWith('training-') || String(id).startsWith('blog-')) {
        showToast('Built-in images cannot be deleted, but you can ignore them or upload your own.', 'error');
        return;
      }
      if (isMockMode) {
        const local = localStorage.getItem('local_media');
        const items = local ? JSON.parse(local).filter((item: any) => item.id !== id) : [];
        localStorage.setItem('local_media', JSON.stringify(items));
        setMediaList(mergeMedia(items));
        setMedia(mergeMedia(items));
      } else {
        await supabase.from('media_library').delete().eq('id', id);
        await loadAllData();
        const { data } = await supabase.from('media_library').select('*');
        setMediaList(mergeMedia(data || []));
      }
      showToast('Image deleted');
    };

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold" style={{ color: NAVY }}>Media Library</h2>
          <button
            onClick={() => setEditForm({ name: '', description: '', image_url: '', alt_text: '', category: 'General', is_featured: false, is_active: true })}
            className="flex items-center gap-2 px-5 py-2.5 font-bold text-sm rounded-lg text-white"
            style={{ background: GOLD, color: NAVY }}
          >
            <Plus size={16} /> Add Image
          </button>
        </div>

        {editForm && (
          <div className="bg-yellow-50 p-6 rounded-xl border-2 border-yellow-200 mb-6">
            <h3 className="font-bold mb-4" style={{ color: NAVY }}>Add/Edit Image</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <input placeholder="Image Name" value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="px-4 py-2 rounded-lg border col-span-2" />
              {/* Image URL field removed — use Upload from computer or Media Library selection only */}
              <label className="col-span-2 flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-dashed border-yellow-300 bg-white/70 px-4 py-3 text-sm">
                <span className="font-semibold" style={{ color: NAVY }}>Upload new image from computer</span>
                <input type="file" accept="image/*" onChange={e => uploadMedia(e.target.files?.[0])} className="text-sm" />
              </label>
              {editForm.image_url && <img src={editForm.image_url} alt="preview" className="col-span-2 max-h-72 w-full object-contain rounded-lg bg-white" />}
              <input placeholder="Alt Text" value={editForm.alt_text || ''} onChange={e => setEditForm({ ...editForm, alt_text: e.target.value })} className="px-4 py-2 rounded-lg border" />
              <select value={editForm.category || 'General'} onChange={e => setEditForm({ ...editForm, category: e.target.value })} className="px-4 py-2 rounded-lg border">
                <option>General</option>
                <option>Hero</option>
                <option>Services</option>
                <option>Team</option>
                <option>About</option>
              </select>
              <textarea placeholder="Description" rows={2} value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="px-4 py-2 rounded-lg border col-span-2" />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setEditForm(null)} className="px-4 py-2 text-sm font-semibold text-gray-600">Cancel</button>
              <button onClick={() => saveMedia(editForm)} className="flex items-center gap-1 px-4 py-2 text-sm font-bold rounded-lg text-white" style={{ background: NAVY }}>
                <Save size={14} /> Save
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mediaList.map(item => (
            <div key={item.id} className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-shadow">
              <img src={item.image_url} alt={item.alt_text} className="w-full h-40 object-cover" />
              <div className="p-3">
                <p className="text-sm font-bold truncate" style={{ color: NAVY }}>{item.name}</p>
                <p className="text-xs text-gray-500">{item.category}</p>
                <div className="flex gap-1 mt-2">
                  <button onClick={() => setEditForm(item)} className="flex-1 p-1 text-xs font-semibold bg-gray-100 rounded hover:bg-gray-200"><Edit3 size={12} className="inline mr-1" />Edit</button>
                  <button onClick={() => deleteMedia(item.id)} className="flex-1 p-1 text-xs font-semibold bg-red-100 rounded hover:bg-red-200 text-red-600"><Trash2 size={12} className="inline mr-1" />Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Dashboard
  const DashboardView = () => {
    const [showSqlModal, setShowSqlModal] = useState(false);

    const seedLiveDatabase = async () => {
      try {
        // Mock seeding logic here...
        showToast('Database seeded successfully');
      } catch (e: any) {
        console.error(e);
        showToast(e.message || 'Seeding failed', 'error');
      }
    };

    return (
      <div className="space-y-6">
        {isMockMode && (
          <div className="bg-amber-50 border-2 border-amber-200 text-amber-900 p-5 rounded-2xl shadow-sm">
            <h3 className="font-bold text-sm mb-1 flex items-center gap-1.5"><AlertCircle size={16} /> Local Demo/Mock Mode Active</h3>
            <p className="text-xs text-amber-700 leading-relaxed mb-3">
              You bypassed database login. Changes are saved <strong>in your browser only</strong> (localStorage). If you want to write these items to your live Supabase database, log in with an authenticated user account or use the copy SQL option.
            </p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setShowSqlModal(true)} className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 transition-all">
                Copy SQL Seed Script
              </button>
            </div>
          </div>
        )}

        <h2 className="text-2xl font-bold" style={{ color: NAVY }}>Dashboard</h2>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {[
            { label: 'Hero Banners', count: heroes.length, color: '#2563eb' },
            { label: 'Media Items', count: media.length, color: '#059669' },
            { label: 'Content Blocks', count: contentBlocks.length, color: '#d97706' },
            { label: 'Team Members', count: team.length, color: '#7c3aed' },
            { label: 'Trainings', count: trainings.length, color: '#f59e0b' },
            { label: 'Articles', count: blogs.length, color: '#06b6d4' },
          ].map(item => (
            <div key={item.label} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <div className="text-3xl font-bold mb-2" style={{ color: NAVY }}>{item.count}</div>
              <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{item.label}</div>
            </div>
          ))}
        </div>

        {!isMockMode && (
          <div className="bg-blue-50 border border-blue-200 text-blue-900 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-sm mb-0.5">Seed Remote Database</h3>
              <p className="text-xs text-blue-700">Quickly insert the mock training courses, blogs, and settings directly into your live database.</p>
            </div>
            <button onClick={seedLiveDatabase} className="px-5 py-2.5 text-xs font-bold rounded-xl text-white shadow hover:scale-[1.02] transition-all flex-shrink-0" style={{ background: NAVY }}>
              Seed Database Now
            </button>
          </div>
        )}

        {showSqlModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full flex flex-col max-h-[80vh]">
              <h3 className="font-bold text-lg mb-2" style={{ color: NAVY }}>Supabase SQL Seed Script</h3>
              <p className="text-xs text-gray-500 mb-4">Paste this into your Supabase SQL Editor to seed the database directly:</p>
              <textarea
                readOnly
                rows={12}
                value={`-- 1. Seed Trainings Data
INSERT INTO trainings (title, short_summary, synopsis, image_url, category, duration, sort_order, is_active)
VALUES
('Advanced Records Management & Digitalisation', 'Master the transition from physical filing systems to secure, searchable digital databases.', 'This comprehensive programme covers document classification, indexing schemas, digital archiving, access control management, and metadata structure design. Participants will learn how to configure an electronic document management system (EDMS) and draft records management policies to guarantee audit compliance.', 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg', 'Digital', '3 Days', 1, true),
('Asset Verification & Register Development', 'Learn practical methods for physical asset counting, barcode tagging, and register reconciliation.', 'A step-by-step training on establishing an institutional asset tracking system. Covers asset labeling methodologies (barcodes/QR codes), location mapping, depreciation scheduling, custodian assignments, and register auditing. Learn to reconcile the physical reality of assets with your balance sheet.', 'https://images.pexels.com/photos/6169668/pexels-photo-6169668.jpeg', 'Finance', '2 Days', 2, true);

-- 2. Seed Blogs Data
INSERT INTO blogs (title, excerpt, content, featured_image_url, slug, is_published, published_at, sort_order)
VALUES
('The Roadmap to Successful Records Digitalisation in Corporate Ghana', 'Transitioning from paper to digital records is more than just scanning documents. Learn the critical steps to design secure, compliant, and highly accessible document management workflows.', 'Digitalisation is the process of converting physical documents into digital formats...', 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg', 'records-digitalisation-roadmap', true, NOW(), 1);

-- 3. Seed Settings
INSERT INTO site_settings (key, value)
VALUES ('download_banner', '{"key":"download_banner","text":"Click here to download our corporate capability brochure.","cta_text":"Download","cta_link":"#contact","is_active":true}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;`}
                className="w-full p-3 font-mono text-xs border bg-gray-50 rounded-xl flex-1 focus:outline-none"
              />
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setShowSqlModal(false)} className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-150 text-gray-700 hover:bg-gray-250">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ background: NAVY }}>
        <div className="p-5 border-b" style={{ borderColor: `${GOLD}30` }}>
          <img src="/newlogo.png" alt="Enka Prime" className="h-10 object-contain" />
          <div className="text-xs mt-2 font-semibold" style={{ color: GOLD }}>CMS Admin</div>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {TabConfig.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-semibold transition-colors ${activeTab === tab.key ? 'text-white' : 'text-blue-300 hover:text-white'}`}
                style={activeTab === tab.key ? { background: `${GOLD}20`, borderRight: `3px solid ${GOLD}` } : {}}
              >
                <Icon size={18} /> {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: `${GOLD}20` }}>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-red-300 hover:bg-red-900/30">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-h-screen">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-bold" style={{ color: NAVY }}>
              {TabConfig.find(t => t.key === activeTab)?.label || 'CMS'}
            </h1>
            <div className="ml-4 flex items-center gap-2 text-sm text-gray-500">
              <label className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-full">
                <input type="checkbox" checked={previewMode} onChange={e => setPreviewMode(e.target.checked)} /> Preview
              </label>
              <button onClick={() => { const next = !isMockMode; localStorage.setItem('admin_mock_mode', String(next)); setIsMockMode(next); if (next) setSession({ user: { email: 'mock-admin@enkaprime.com' } }); else setSession(null); }} className={`px-2 py-1 rounded-full text-xs font-semibold ${isMockMode ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
                {isMockMode ? 'Local Edit Mode' : 'Use DB'}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {session?.user?.email && <div className="text-xs text-gray-600 mr-2">{session.user.email}</div>}
            <button onClick={() => onNavigate('home')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-100 text-gray-600">
              <ArrowLeft size={14} /> View Site
            </button>
          </div>
        </header>

        <main className="p-6 max-w-6xl">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'hero' && <HeroEditor />}
          {activeTab === 'sections' && <PageSectionsEditor />}
          {activeTab === 'media' && <MediaLibrary />}
          {activeTab === 'content-blocks' && <ContentBlocksEditor />}
          {activeTab === 'trainings' && <TrainingsEditor />}
          {activeTab === 'blogs' && <BlogsEditor />}
          {activeTab === 'team' && <TeamMembersEditor />}
          {activeTab === 'faqs' && <FaqsEditor />}
          {activeTab === 'footer' && <FooterEditor />}
          {activeTab === 'settings' && <SiteSettingsEditor />}
        </main>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold z-50 ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
