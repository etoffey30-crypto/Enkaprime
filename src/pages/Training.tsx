import { useEffect, useState, useCallback } from 'react';
import { ArrowRight, ChevronLeft, Filter, GraduationCap, Star, Clock, Calendar, BookOpen, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const GOLD = '#C9A84C';
const NAVY = '#0F2044';
const CATEGORIES = ['All', 'Leadership', 'Customer Service', 'HSE', 'Finance', 'Digital', 'General'];

const CATEGORY_META: Record<string, { color: string; bg: string; desc: string }> = {
  Leadership: { color: '#1d4ed8', bg: '#dbeafe', desc: 'Strategic leadership, management and supervisory excellence' },
  'Customer Service': { color: '#0891b2', bg: '#cffafe', desc: 'Client relationship management and frontline service delivery' },
  HSE: { color: '#16a34a', bg: '#dcfce7', desc: 'Workplace safety, risk prevention and compliance' },
  Finance: { color: '#7c3aed', bg: '#ede9fe', desc: 'Financial management, budgeting and reporting' },
  Digital: { color: '#ea580c', bg: '#ffedd5', desc: 'Data, analytics, Excel and digital tools' },
  General: { color: '#6b7280', bg: '#f3f4f6', desc: 'Communication, report writing and professional development' },
};

const FALLBACK_TRAININGS = [
  {
    id: 't-1',
    title: 'Advanced Records Management & Digitalisation',
    short_summary: 'Master the transition from physical filing systems to secure, searchable digital databases.',
    synopsis: 'This comprehensive programme covers document classification, indexing schemas, digital archiving, access control management, and metadata structure design. Participants will learn how to configure an electronic document management system (EDMS) and draft records management policies to guarantee audit compliance.',
    image_url: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg',
    category: 'Digital',
    duration: '3 Days',
    is_active: true
  },
  {
    id: 't-2',
    title: 'Asset Verification & Register Development',
    short_summary: 'Learn practical methods for physical asset counting, barcode tagging, and register reconciliation.',
    synopsis: 'A step-by-step training on establishing an institutional asset tracking system. Covers asset labeling methodologies (barcodes/QR codes), location mapping, depreciation scheduling, custodian assignments, and register auditing. Learn to reconcile the physical reality of assets with your balance sheet.',
    image_url: 'https://images.pexels.com/photos/6169668/pexels-photo-6169668.jpeg',
    category: 'Finance',
    duration: '2 Days',
    is_active: true
  },
  {
    id: 't-3',
    title: 'ISO 9001:2015 Quality Management Systems (QMS) Lead Implementer',
    short_summary: 'Gain the skills to design, deploy, and maintain an ISO-compliant quality framework in your organisation.',
    synopsis: 'Become a certified quality manager. This course guides you through the ISO 9001 standard clauses, gap analysis methodologies, document controls, internal audit design, and management review protocols. Gain the tools to prepare your company for external certification.',
    image_url: 'https://images.pexels.com/photos/5716001/pexels-photo-5716001.jpeg',
    category: 'Leadership',
    duration: '5 Days',
    is_active: true
  },
  {
    id: 't-4',
    title: 'Executive Leadership & Corporate Governance',
    short_summary: 'Empower senior management with strategic planning tools, decision frameworks, and board advisory skills.',
    synopsis: 'Designed for executives and board members. Covers corporate governance frameworks, strategic planning, ethical oversight, risk management, performance metrics, and succession planning. Focuses on building corporate culture and delivering long-term shareholder value.',
    image_url: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg',
    category: 'Leadership',
    duration: '3 Days',
    is_active: true
  }
];

interface TrainingProps {
  onNavigate: (page: string, message?: string) => void;
}

export default function Training({ onNavigate }: TrainingProps) {
  const [programmes, setProgrammes] = useState<any[]>([]);
  const [trainings, setTrainings] = useState<any[]>([]);
  const [selectedTraining, setSelectedTraining] = useState<any | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Load training courses
      const localTrainings = localStorage.getItem('local_trainings');
      if (localTrainings) {
        const parsed = JSON.parse(localTrainings);
        setTrainings(parsed.filter((t: any) => t.is_active));
      } else {
        const trainRes = await supabase.from('trainings').select('*').eq('is_active', true).order('sort_order');
        setTrainings(trainRes.data && trainRes.data.length > 0 ? trainRes.data : FALLBACK_TRAININGS);
      }

      // Load programmes — localStorage first (admin-managed)
      const localProgs = localStorage.getItem('local_programmes');
      if (localProgs) {
        const parsed = JSON.parse(localProgs);
        setProgrammes(parsed.filter((p: any) => p.is_active !== false));
      } else {
        const progRes = await supabase.from('programmes').select('*').eq('is_active', true).order('category, code');
        if (progRes.data && progRes.data.length > 0) setProgrammes(progRes.data);
      }
    } catch (e) {
      console.error('Failed to load training data, using fallbacks:', e);
      setTrainings(FALLBACK_TRAININGS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = activeCategory === 'All'
    ? programmes
    : programmes.filter(p => p.category === activeCategory);

  const featured = programmes.filter(p => p.is_featured);

  return (
    <div className="min-h-screen bg-white font-sans pt-20 overflow-hidden">

      {/* ── HERO ── */}
      <section className="relative py-16 sm:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg"
            alt="Training & Capacity Building"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${NAVY}F0 0%, ${NAVY}C0 100%)` }} />
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'linear-gradient(rgba(201,168,76,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <button
            onClick={() => onNavigate('services')}
            className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-lg text-white font-semibold hover:bg-white/10 transition-colors"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <ChevronLeft size={16} /> All Services
          </button>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5"
            style={{ background: `${GOLD}25`, color: GOLD, border: `1px solid ${GOLD}40` }}>
            <GraduationCap size={12} /> Service 04
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-5 leading-tight">
            Training & <span style={{ color: GOLD }}>Capacity Building</span>
          </h1>
          <p className="text-blue-100 text-lg sm:text-xl max-w-2xl leading-relaxed">
            Bespoke in-house corporate training programmes delivered at your premises — building skills that translate directly into workplace results.
          </p>

          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 mt-8 sm:mt-10">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <BookOpen size={16} style={{ color: GOLD }} />
              {programmes.length}+ Programmes Available
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <Clock size={16} style={{ color: GOLD }} />
              1–5 Day Programmes
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <Calendar size={16} style={{ color: GOLD }} />
              Nationwide Delivery
            </div>
          </div>
        </div>
      </section>

      {/* ── OVERVIEW ── */}
      <section className="py-14 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-5 sm:gap-8">
            {[
              { icon: GraduationCap, title: 'In-House Delivery', desc: 'All programmes delivered at your organisation — no travel, no disruption, total customisation.' },
              { icon: Star, title: 'Certified Trainers', desc: 'Experienced professionals with deep sector knowledge across all training disciplines.' },
              { icon: ArrowRight, title: 'Immediate Impact', desc: 'Practical, skills-focused content that participants can apply from the very next working day.' },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: `${GOLD}20` }}>
                    <Icon size={22} style={{ color: GOLD }} />
                  </div>
                  <h3 className="font-extrabold text-base mb-2" style={{ color: NAVY }}>{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PROGRAMME CATEGORIES ── */}
      <section className="py-14 sm:py-20 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4"
              style={{ background: `${GOLD}18`, color: GOLD }}>
              Learning Tracks
            </div>
            <h2 className="text-3xl font-extrabold" style={{ color: NAVY }}>
              Our Programme <span style={{ color: GOLD }}>Categories</span>
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm mt-2">
              Browse our specialised training tracks designed for organizational excellence and workforce capability.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {Object.entries(CATEGORY_META).map(([name, meta]) => (
              <div
                key={name}
                onClick={() => {
                  setActiveCategory(name);
                  const el = document.getElementById('training-catalogue');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group cursor-pointer bg-gray-50 hover:bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 hover:border-yellow-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg inline-block mb-4" style={{ background: meta.bg, color: meta.color }}>
                    {name}
                  </span>
                  <h3 className="font-extrabold text-base mb-2 group-hover:text-yellow-600 transition-colors" style={{ color: NAVY }}>
                    {name} {name === 'General' ? 'Professional Development' : 'Training'}
                  </h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{meta.desc}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold mt-4 transition-colors" style={{ color: GOLD }}>
                  View Courses <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRAINING COURSES PORTFOLIO (NEW SECTION) ── */}
      <section className="py-14 sm:py-20 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4"
              style={{ background: `${GOLD}18`, color: GOLD }}>
              Course Portfolio
            </div>
            <h2 className="text-3xl font-extrabold" style={{ color: NAVY }}>
              Our Professional <span style={{ color: GOLD }}>Training Courses</span>
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm mt-2">
              Browse our key corporate training courses. Click any card to read the full synopsis and course outlines.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainings.map((item) => (
              <div 
                key={item.id} 
                className="group bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:border-yellow-400 hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer"
                onClick={() => setSelectedTraining(item)}
              >
                {/* Image */}
                <div className="relative h-48 bg-slate-200 overflow-hidden flex-shrink-0">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-900 text-yellow-600">
                      <GraduationCap size={36} />
                    </div>
                  )}
                  {/* Category badge */}
                  <span className="absolute top-4 left-4 text-[10px] font-extrabold px-2.5 py-1 rounded-md bg-white/95 text-slate-800 shadow-sm border border-gray-100">
                    {item.category || 'General'}
                  </span>
                  {/* Duration badge */}
                  <span className="absolute bottom-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900/80 text-white backdrop-blur-xs">
                    {item.duration || '2 Days'}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-extrabold text-base mb-2 group-hover:text-yellow-600 transition-colors" style={{ color: NAVY }}>
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-xs sm:text-sm leading-relaxed flex-1 mb-6 line-clamp-3">
                    {item.short_summary || item.synopsis.slice(0, 120) + '...'}
                  </p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedTraining(item); }}
                    className="self-start inline-flex items-center gap-1.5 text-xs font-bold transition-all text-yellow-600 hover:text-yellow-700"
                  >
                    View Details & Synopsis <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRAINING CALENDAR & CATALOGUE (CORE FEATURE) ── */}
      <section id="training-catalogue" className="py-14 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-3"
                style={{ background: 'rgba(201,168,76,0.12)', color: NAVY }}>
                <Calendar size={12} className="text-yellow-600" /> Training Schedule
              </div>
              <h2 className="text-3xl font-extrabold mb-1" style={{ color: NAVY }}>
                Upcoming <span style={{ color: GOLD }}>Training Calendar</span>
              </h2>
              <p className="text-gray-500 text-sm">Select a category below to filter upcoming training schedules and register your team.</p>
            </div>
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-gray-400" />
              <span className="text-xs text-gray-400 font-semibold">Filter by category</span>
            </div>
          </div>

          {/* Category filter */}
          <div className="flex gap-2 mb-8 -mx-4 px-4 overflow-x-auto pb-2 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible">
            {CATEGORIES.map(cat => {
              const meta = CATEGORY_META[cat];
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="px-4 py-2.5 text-xs font-bold rounded-full transition-all duration-200 whitespace-nowrap shadow-sm border"
                  style={isActive
                    ? { background: NAVY, color: 'white', borderColor: NAVY }
                    : meta
                      ? { background: meta.bg, color: meta.color, borderColor: 'transparent' }
                      : { background: '#f3f4f6', color: '#374151', borderColor: 'transparent' }
                  }
                >
                  {cat} {cat !== 'All' && `(${programmes.filter(p => p.category === cat).length})`}
                </button>
              );
            })}
          </div>

          {/* Category description */}
          {activeCategory !== 'All' && CATEGORY_META[activeCategory] && (
            <div className="mb-6 p-4 rounded-xl text-sm font-medium border border-gray-100"
              style={{ background: CATEGORY_META[activeCategory].bg, color: CATEGORY_META[activeCategory].color }}>
              {CATEGORY_META[activeCategory].desc}
            </div>
          )}

          {/* Programme list/table */}
          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-400 text-sm font-semibold">Loading calendar details...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm bg-white rounded-2xl border border-dashed border-gray-200">
              No upcoming programmes scheduled in this category.
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(prog => {
                const meta = CATEGORY_META[prog.category] || CATEGORY_META['General'];
                return (
                  <div
                    key={prog.id}
                    className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white hover:bg-yellow-50/20 transition-all duration-300 group border border-gray-100 hover:border-yellow-300 hover:shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                      {/* Date Badge */}
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-100 group-hover:border-yellow-200 group-hover:bg-yellow-50/30 transition-colors duration-300 min-w-[170px] sm:justify-center">
                        <Calendar size={14} className="text-yellow-600" />
                        <span>{prog.upcoming_date || 'Schedule on Request'}</span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-extrabold tracking-widest px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                            {prog.code}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ background: meta.bg, color: meta.color }}>
                            {prog.category}
                          </span>
                          <span className="text-xs font-medium text-gray-500 flex items-center gap-1 ml-1">
                            <Clock size={12} /> {prog.days} {prog.days === 1 ? 'Day' : 'Days'}
                          </span>
                        </div>
                        <h3 className="text-gray-800 font-bold text-sm sm:text-base mt-2 group-hover:text-yellow-600 transition-colors leading-snug">
                          {prog.title}
                        </h3>
                        {prog.description && (
                          <p className="text-gray-500 text-xs mt-1.5 leading-relaxed">{prog.description}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-end flex-shrink-0 pt-2 lg:pt-0">
                      <button
                        onClick={() => onNavigate('contact', `Hello Enka Prime, I would like to register my team for the upcoming training session: ${prog.code} - ${prog.title} scheduled for ${prog.upcoming_date || 'Schedule on Request'}.`)}
                        className="text-xs font-bold px-5 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg w-full lg:w-auto text-center bg-slate-900 text-white hover:bg-slate-800"
                        style={{ backgroundColor: NAVY }}
                      >
                        Register Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── FEATURED PROGRAMMES ── */}
      {featured.length > 0 && (
        <section className="py-14 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-3 mb-10 border-b pb-4">
              <Star size={20} className="fill-current" style={{ color: GOLD, fill: GOLD }} />
              <h2 className="text-2xl font-extrabold" style={{ color: NAVY }}>Featured Programmes</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {featured.map(prog => {
                const meta = CATEGORY_META[prog.category] || CATEGORY_META['General'];
                return (
                  <div key={prog.id} className="p-6 rounded-2xl border hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500 group flex flex-col justify-between"
                    style={{ borderColor: `${GOLD}40`, background: `${GOLD}05` }}>
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg" style={{ background: meta.bg, color: meta.color }}>
                          {prog.category}
                        </span>
                        <div className="flex items-center gap-0.5">
                          <Star size={12} className="fill-current text-yellow-500" />
                          <Star size={12} className="fill-current text-yellow-500" />
                          <Star size={12} className="fill-current text-yellow-500" />
                          <Star size={12} className="fill-current text-yellow-500" />
                          <Star size={12} className="fill-current text-yellow-500" />
                        </div>
                      </div>
                      <div className="text-xs font-bold tracking-widest uppercase mb-1.5" style={{ color: GOLD }}>{prog.code}</div>
                      <h3 className="font-extrabold text-sm sm:text-base mb-3 leading-snug text-slate-800" style={{ color: NAVY }}>{prog.title}</h3>
                      <p className="text-gray-500 text-xs leading-relaxed mb-6 line-clamp-3">{prog.description}</p>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-1 text-xs text-gray-500 font-semibold bg-gray-50 px-2 py-1 rounded">
                        <Clock size={12} />
                        {prog.days} {prog.days === 1 ? 'Day' : 'Days'}
                      </div>
                      <button
                        onClick={() => onNavigate('contact', `Hello Enka Prime, I would like to enquire about the featured training programme: ${prog.code} - ${prog.title}.`)}
                        className="text-xs font-bold px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 bg-slate-900 text-white hover:bg-slate-800"
                        style={{ backgroundColor: NAVY }}
                      >
                        Enquire
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── REGISTRATION CTA ── */}
      <section className="py-14 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg" alt="Training CTA" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${NAVY}F2, ${NAVY}D0)` }} />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-5 leading-tight">
            Ready to Upskill <span style={{ color: GOLD }}>Your Team?</span>
          </h2>
          <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">
            All programmes are fully customised and delivered in-house at your premises. Contact us to discuss scheduling and content.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('contact', 'Hello Enka Prime, I would like to enroll my team in a corporate training programme. Please get back to me to coordinate details.')}
              className="inline-flex items-center justify-center gap-2 px-8 sm:px-10 py-4 font-bold text-base rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{ background: GOLD, color: NAVY }}
            >
              Enroll Your Team <ArrowRight size={18} />
            </button>
            <button
              onClick={() => onNavigate('contact', 'Hello Enka Prime, I am interested in requesting a custom corporate training programme tailored specifically to our organisation.')}
              className="inline-flex items-center justify-center gap-2 px-8 sm:px-10 py-4 font-bold text-base rounded-xl transition-all duration-300 hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.25)' }}
            >
              Request Custom Programme
            </button>
          </div>
        </div>
      </section>

      {/* ── DETAIL MODAL FOR SYNOPSIS (NEW) ── */}
      {selectedTraining && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedTraining(null)}>
          <div 
            className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setSelectedTraining(null)}
                className="p-2 rounded-full bg-white/80 hover:bg-white text-slate-800 shadow-md hover:scale-105 transition-all"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Banner */}
            <div className="relative h-48 bg-slate-900 overflow-hidden flex-shrink-0">
              {selectedTraining.image_url ? (
                <img 
                  src={selectedTraining.image_url} 
                  alt={selectedTraining.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-yellow-600 bg-slate-900">
                  <GraduationCap size={48} />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-85" />
              
              <div className="absolute bottom-4 left-6 right-6">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-yellow-500 text-slate-900 mb-2 inline-block">
                  {selectedTraining.category || 'General'}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                  {selectedTraining.title}
                </h2>
              </div>
            </div>

            {/* Scrollable details */}
            <div className="overflow-y-auto p-6 sm:p-8 flex-1">
              <div className="flex items-center gap-4 mb-6 text-xs text-gray-500 font-bold border-b border-gray-100 pb-4">
                <div className="flex items-center gap-1">
                  <Clock size={14} className="text-yellow-600" />
                  <span>Duration: {selectedTraining.duration || '2 Days'}</span>
                </div>
                <div>•</div>
                <div>In-House Delivery Only</div>
              </div>

              <div className="text-slate-700 text-sm sm:text-base leading-relaxed space-y-4">
                <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide">Course Synopsis</h4>
                <p className="whitespace-pre-line text-slate-600">{selectedTraining.synopsis}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-slate-800 font-bold text-xs">Interested in this course?</p>
                <p className="text-gray-400 text-[10px]">We deliver customized, in-house programs directly at your facility.</p>
              </div>
              <button
                onClick={() => {
                  setSelectedTraining(null);
                  onNavigate('contact', `Hello Enka Prime, I would like to enquire about your corporate training course: "${selectedTraining.title}". Please send us information on scheduling and pricing.`);
                }}
                className="px-5 py-3 rounded-xl text-xs font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg w-full sm:w-auto text-center"
                style={{ backgroundColor: NAVY }}
              >
                Send Course Enquiry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
