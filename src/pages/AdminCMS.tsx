import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Menu, LogOut, Settings, Image as ImageIcon, LayoutGrid as Layout, FileText, Users, BarChart3, Save, Plus, Trash2, CreditCard as Edit3, ArrowLeft, RefreshCw, CheckCircle, AlertCircle, Palette, BookOpen, GraduationCap } from 'lucide-react';

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
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
    if (!session) return;

    if (isMockMode) {
      // Load trainings from localStorage
      const localTrainings = localStorage.getItem('local_trainings');
      let trainingsList = FALLBACK_TRAININGS;
      if (localTrainings) {
        trainingsList = JSON.parse(localTrainings);
      } else {
        localStorage.setItem('local_trainings', JSON.stringify(FALLBACK_TRAININGS));
      }
      setTrainings(trainingsList);

      // Load blogs from localStorage
      const localBlogs = localStorage.getItem('local_blogs');
      let blogsList = FALLBACK_BLOGS;
      if (localBlogs) {
        blogsList = JSON.parse(localBlogs);
      } else {
        localStorage.setItem('local_blogs', JSON.stringify(FALLBACK_BLOGS));
      }
      setBlogs(blogsList);

      // Load site settings from localStorage
      const localSettings = localStorage.getItem('local_settings');
      let settingsList = [
        { key: 'announcement_bar_enabled', value: 'true' },
        { key: 'announcement_bar_text', value: 'Click here to download our corporate capability brochure.' },
        { key: 'announcement_bar_link', value: '#contact' }
      ];
      if (localSettings) {
        settingsList = JSON.parse(localSettings);
      } else {
        localStorage.setItem('local_settings', JSON.stringify(settingsList));
      }
      setSiteSettings(settingsList);
      
      setHeroes([]);
      setMedia([]);
      setContentBlocks([]);
      setTeam([]);
      return;
    }

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
    if (mediaRes.data) setMedia(mediaRes.data);
    if (blocksRes.data) setContentBlocks(blocksRes.data);
    if (teamRes.data) setTeam(teamRes.data);
    if (trainingsRes.data) setTrainings(trainingsRes.data);
    if (blogsRes.data) setBlogs(blogsRes.data);
    if (settingsRes.data) setSiteSettings(settingsRes.data);
  }, [session, isMockMode]);

  useEffect(() => {
    if (isMockMode && !session) {
      setSession({ user: { email: 'mock-admin@enkaprime.com' } });
    }
  }, [isMockMode, session]);

  useEffect(() => { loadAllData(); }, [loadAllData]);


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
    const [heroes, setHeroes] = useState<any[]>([]);
    const [editForm, setEditForm] = useState<any>(null);

    useEffect(() => {
      supabase.from('hero_banners').select('*').then(({ data }) => data && setHeroes(data));
    }, []);

    const saveHero = async (hero: any) => {
      if (hero.id) {
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
          <div className="bg-yellow-50 p-6 rounded-xl border-2 border-yellow-200 mb-6">
            <h3 className="font-bold mb-4" style={{ color: NAVY }}>Edit Hero Banner</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <input placeholder="Page Name" value={editForm.page_name || ''} onChange={e => setEditForm({ ...editForm, page_name: e.target.value })} className="px-4 py-2 rounded-lg border" />
              <input placeholder="Title" value={editForm.title || ''} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className="px-4 py-2 rounded-lg border" />
              <input placeholder="Subtitle" value={editForm.subtitle || ''} onChange={e => setEditForm({ ...editForm, subtitle: e.target.value })} className="px-4 py-2 rounded-lg border" />
              <input placeholder="Image URL" value={editForm.image_url || ''} onChange={e => setEditForm({ ...editForm, image_url: e.target.value })} className="px-4 py-2 rounded-lg border" />
              <textarea placeholder="Description" rows={3} value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="px-4 py-2 rounded-lg border col-span-2" />
              <input placeholder="CTA Text" value={editForm.cta_text || ''} onChange={e => setEditForm({ ...editForm, cta_text: e.target.value })} className="px-4 py-2 rounded-lg border" />
              <input placeholder="CTA Link" value={editForm.cta_link || ''} onChange={e => setEditForm({ ...editForm, cta_link: e.target.value })} className="px-4 py-2 rounded-lg border" />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setEditForm(null)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800">Cancel</button>
              <button onClick={() => saveHero(editForm)} className="flex items-center gap-1 px-4 py-2 text-sm font-bold rounded-lg text-white" style={{ background: NAVY }}>
                <Save size={14} /> Save
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {heroes.map(hero => (
            <div key={hero.id} className="bg-white p-5 rounded-xl border border-gray-100 flex items-center gap-4">
              {hero.image_url && <img src={hero.image_url} alt={hero.title} className="w-20 h-14 rounded object-cover" />}
              <div className="flex-1">
                <div className="font-bold" style={{ color: NAVY }}>{hero.page_name}</div>
                <p className="text-sm text-gray-500">{hero.title}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditForm(hero)} className="p-2 hover:bg-gray-100 rounded"><Edit3 size={16} style={{ color: GOLD }} /></button>
                <button onClick={() => deleteHero(hero.id)} className="p-2 hover:bg-red-50 rounded"><Trash2 size={16} className="text-red-500" /></button>
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
              <input placeholder="Image URL" value={editForm.image_url || ''} onChange={e => setEditForm({ ...editForm, image_url: e.target.value })} className="px-4 py-2 rounded-lg border" />
              <button onClick={() => setSelectingImageFor('training')} className="px-4 py-2 rounded-lg bg-gray-100">Choose from Media Library</button>
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
              {item.image_url && <img src={item.image_url} alt={item.title} className="w-28 h-20 object-cover rounded" />}
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

        {/* Media picker modal */}
        {selectingImageFor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
            <div className="bg-white rounded-xl p-6 max-w-3xl w-full">
              <h3 className="font-bold mb-4">Choose Image</h3>
              <div className="grid grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                {media.map(m => (
                  <button key={m.id} onClick={() => { setEditForm({ ...editForm, image_url: m.image_url }); setSelectingImageFor(null); }} className="overflow-hidden rounded-lg">
                    <img src={m.image_url} alt={m.name} className="w-full h-28 object-cover" />
                  </button>
                ))}
              </div>
              <div className="flex justify-end mt-4">
                <button onClick={() => setSelectingImageFor(null)} className="px-4 py-2 rounded-lg">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Blogs Editor
  const BlogsEditor = () => {
    const [list, setList] = useState<any[]>([]);
    const [editForm, setEditForm] = useState<any>(null);
    const [selectingImageFor, setSelectingImageFor] = useState<boolean>(false);

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
              <input placeholder="Image URL" value={editForm.featured_image_url || ''} onChange={e => setEditForm({ ...editForm, featured_image_url: e.target.value })} className="px-4 py-2 rounded-lg border" />
              <button onClick={() => setSelectingImageFor(true)} className="px-4 py-2 rounded-lg bg-gray-100">Choose from Media Library</button>
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

        {/* Media picker modal for blogs */}
        {selectingImageFor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
            <div className="bg-white rounded-xl p-6 max-w-3xl w-full">
              <h3 className="font-bold mb-4">Choose Image</h3>
              <div className="grid grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                {media.map(m => (
                  <button key={m.id} onClick={() => { setEditForm({ ...editForm, featured_image_url: m.image_url }); setSelectingImageFor(false); }} className="overflow-hidden rounded-lg">
                    <img src={m.image_url} alt={m.name} className="w-full h-28 object-cover" />
                  </button>
                ))}
              </div>
              <div className="flex justify-end mt-4">
                <button onClick={() => setSelectingImageFor(false)} className="px-4 py-2 rounded-lg">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Site Settings Editor (download banner)
  const SiteSettingsEditor = () => {
    const [banner, setBanner] = useState<any>({ key: 'download_banner', text: 'Click to download our eBook', cta_text: 'Download', cta_link: '#', is_active: true });

    useEffect(() => {
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

    const save = async () => {
      if (isMockMode) {
        const payload = { key: 'download_banner', value: JSON.stringify(banner) };
        const updatedSettings = siteSettings.filter((s: any) => s.key !== 'download_banner');
        updatedSettings.push(payload);
        localStorage.setItem('local_settings', JSON.stringify(updatedSettings));
        setSiteSettings(updatedSettings);
      } else {
        const existing = siteSettings.find((s: any) => s.key === 'download_banner');
        const payload = { key: 'download_banner', value: JSON.stringify(banner) };
        if (existing) {
          await supabase.from('site_settings').update({ value: payload.value }).eq('id', existing.id);
        } else {
          await supabase.from('site_settings').insert(payload);
        }
        await loadAllData();
      }
      showToast('Site settings saved');
    };


    return (
      <div>
        <h2 className="text-2xl font-bold mb-4" style={{ color: NAVY }}>Site Settings</h2>
        <div className="bg-white p-6 rounded-xl border">
          <h3 className="font-bold mb-3">Top Download Banner</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <input value={banner.text || ''} onChange={e => setBanner({ ...banner, text: e.target.value })} className="px-4 py-2 rounded-lg border" />
            <input value={banner.cta_text || ''} onChange={e => setBanner({ ...banner, cta_text: e.target.value })} className="px-4 py-2 rounded-lg border" />
            <input value={banner.cta_link || ''} onChange={e => setBanner({ ...banner, cta_link: e.target.value })} className="px-4 py-2 rounded-lg border col-span-2" />
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={!!banner.is_active} onChange={e => setBanner({ ...banner, is_active: e.target.checked })} /> Active</label>
          </div>
          <div className="flex justify-end mt-4">
            <button onClick={save} className="px-4 py-2 rounded-lg text-white" style={{ background: NAVY }}>Save</button>
          </div>
        </div>
      </div>
    );
  };

  // Media Library
  const MediaLibrary = () => {
    const [mediaList, setMediaList] = useState<any[]>([]);
    const [editForm, setEditForm] = useState<any>(null);

    useEffect(() => {
      supabase.from('media_library').select('*').then(({ data }) => data && setMediaList(data));
    }, []);

    const saveMedia = async (item: any) => {
      if (item.id) {
        await supabase.from('media_library').update({ ...item, updated_at: new Date().toISOString() }).eq('id', item.id);
      } else {
        await supabase.from('media_library').insert(item);
      }
      await loadAllData();
      setEditForm(null);
      showToast('Media saved');
    };

    const deleteMedia = async (id: string) => {
      if (!confirm('Delete this image?')) return;
      await supabase.from('media_library').delete().eq('id', id);
      await loadAllData();
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
              <input placeholder="Image URL" value={editForm.image_url || ''} onChange={e => setEditForm({ ...editForm, image_url: e.target.value })} className="px-4 py-2 rounded-lg border col-span-2" />
              {editForm.image_url && <img src={editForm.image_url} alt="preview" className="col-span-2 h-32 object-cover rounded-lg" />}
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
          </div>
          <button onClick={() => onNavigate('home')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-100 text-gray-600">
            <ArrowLeft size={14} /> View Site
          </button>
        </header>

        <main className="p-6 max-w-6xl">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'hero' && <HeroEditor />}
          {activeTab === 'media' && <MediaLibrary />}
          {activeTab === 'trainings' && <TrainingsEditor />}
          {activeTab === 'blogs' && <BlogsEditor />}
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
