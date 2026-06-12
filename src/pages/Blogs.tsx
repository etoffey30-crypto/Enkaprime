import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, BookOpen, Clock, Calendar, ArrowRight, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const GOLD = '#C9A84C';
const NAVY = '#0F2044';

interface BlogsProps {
  onNavigate: (page: string, message?: string) => void;
}

interface BlogArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  featured_image_url: string;
  slug: string;
  is_published: boolean;
  published_at: string;
  sort_order: number;
}

const FALLBACK_BLOGS: BlogArticle[] = [
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
  },
  {
    id: 'fb-2',
    title: 'Asset Tagging & Lifecycle Management: Safeguarding Institutional Assets',
    excerpt: 'An accurate asset register is vital for financial health and audit compliance. Explore how barcode and QR code systems prevent asset leakage and streamline audits.',
    content: `Every growing enterprise face a major logistical challenge: keeping track of physical assets. From IT hardware and office furniture to industrial equipment and vehicles, institutional assets represent a massive capital investment. Without a structured tracking system, assets get lost, stolen, or improperly depreciated.

Asset tagging is the foundation of modern asset lifecycle management. By assigning a unique physical identifier (such as a barcode, QR code, or RFID tag) to every asset, companies can build an immutable, real-time register.

### Key Stages of Asset Register Development

1. **Physical Enumeration & Verification:** A field team audits all offices, branches, and facilities to locate and record every asset, noting its serial number, model, location, and custodian.
2. **Tag Selection & Installation:** Choose tags suited to the environment. An office laptop requires a tamper-evident foil label, while outdoor industrial valves need heavy-duty metal plate tags.
3. **Software Configuration & Integration:** Connect the physical tags to a centralized asset register system. Ensure it integrates with your accounting software for accurate depreciation tracking.
4. **Lifecycle Tracking Protocols:** Document all changes in custodian, maintenance logs, asset movements, and eventual disposals.

### The Strategic Value of Tagging

* **Eliminate Ghost Assets:** Stop paying insurance and property taxes on assets that no longer exist or are out of service.
* **Prevent Unauthorised Movements:** Instantly scan tags to verify if an item is permitted to leave a facility.
* **Accurate Financial Reporting:** Align the physical reality of your assets with the balance sheet, ensuring audit compliance.

Maintaining a clear register is not just a regulatory requirement; it is a critical practice for protecting institutional value and making smart procurement decisions.`,
    featured_image_url: 'https://images.pexels.com/photos/6169668/pexels-photo-6169668.jpeg',
    slug: 'asset-tagging-lifecycle',
    is_published: true,
    published_at: '2026-06-05T14:30:00Z',
    sort_order: 2
  },
  {
    id: 'fb-3',
    title: 'Why ISO Certification is a Competitive Advantage for Ghanaian SMEs',
    excerpt: 'Understanding ISO 9001 (Quality), ISO 27001 (Information Security), and ISO 45001 (HSE). How structured compliance unlocks international tenders and boosts credibility.',
    content: `For small and medium enterprises (SMEs) in Ghana, standing out in a crowded market is crucial. While many view ISO certification as a complex hurdle reserved for multinational conglomerates, it is actually one of the most powerful growth tools available to local businesses.

ISO standards provide internationally recognized frameworks for quality, safety, security, and efficiency. Implementing these standards signals to clients, partners, and regulators that your business operates at global standards.

### The Top 3 ISO Frameworks for Growth

1. **ISO 9001: Quality Management System (QMS):** Focuses on customer satisfaction, structured processes, and continuous improvement. It ensures you deliver consistent quality, every single time.
2. **ISO 27001: Information Security Management System (ISMS):** Vital in the digital age. It protects your data, customer information, and intellectual property from cyber threats and breaches.
3. **ISO 45001: Occupational Health & Safety (OHS):** Minimizes workplace accidents, protects your staff, and ensures you conform to safety regulations.

### Unlocking Growth with Compliance

* **Access to Premium Tenders:** Many large corporates and international organizations require ISO compliance as a mandatory pre-qualification for bidding.
* **Reduced Operating Costs:** Standardised workflows eliminate mistakes, reduce waste, and improve operational throughput.
* **Enhanced Brand Trust:** Globally certified quality establishes instant credibility with international partners looking to invest in West Africa.

ISO implementation is a structured journey of audit, adaptation, and training. Done correctly, it builds a resilient organizational structure that supports sustainable scaling.`,
    featured_image_url: 'https://images.pexels.com/photos/5716001/pexels-photo-5716001.jpeg',
    slug: 'iso-certification-competitive-advantage',
    is_published: true,
    published_at: '2026-06-08T09:15:00Z',
    sort_order: 3
  }
];

export default function Blogs({ onNavigate }: BlogsProps) {
  const [blogs, setBlogs] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<BlogArticle | null>(null);

  const loadBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setBlogs(data);
      } else {
        setBlogs(FALLBACK_BLOGS);
      }
    } catch (err) {
      console.error('Error fetching blogs, using fallbacks:', err);
      setBlogs(FALLBACK_BLOGS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  // Format date utility
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans overflow-hidden">
      
      {/* ── HERO HEADER ── */}
      <section className="relative py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/3182811/pexels-photo-3182811.jpeg"
            alt="Corporate Insights & Blogs"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${NAVY}F2 0%, ${NAVY}D0 100%)` }} />
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'linear-gradient(rgba(201,168,76,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-lg text-white font-semibold hover:bg-white/10 transition-colors"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <ChevronLeft size={16} /> Back to Home
          </button>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5"
            style={{ background: `${GOLD}25`, color: GOLD, border: `1px solid ${GOLD}40` }}>
            Knowledge Hub
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
            Corporate <span style={{ color: GOLD }}>Insights</span> & Blogs
          </h1>
          <p className="text-blue-100 text-lg sm:text-xl max-w-2xl leading-relaxed">
            Stay ahead with expert articles on records digitalisation, corporate compliance, asset tracking, and capacity building strategies.
          </p>
        </div>
      </section>

      {/* ── ARTICLES GRID ── */}
      <section className="py-14 sm:py-24 bg-gray-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          {loading ? (
            <div className="text-center py-20">
              <div className="w-10 h-10 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400 text-sm font-semibold">Loading insights...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((article, idx) => (
                <article
                  key={article.id}
                  className="group bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl border border-gray-100 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full"
                  style={{ animation: `slideInUp 0.5s ease-out ${idx * 100}ms both` }}
                >
                  {/* Card Cover Image */}
                  <div className="relative h-48 sm:h-56 bg-gray-100 overflow-hidden flex-shrink-0">
                    {article.featured_image_url ? (
                      <img
                        src={article.featured_image_url}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-900 text-yellow-600">
                        <BookOpen size={40} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Card content */}
                  <div className="p-6 sm:p-8 flex flex-col flex-1">
                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-4 font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-yellow-600" />
                        {formatDate(article.published_at || new Date().toISOString())}
                      </span>
                    </div>

                    <h3
                      onClick={() => setSelectedArticle(article)}
                      className="text-lg sm:text-xl font-extrabold mb-3 leading-snug text-slate-800 hover:text-yellow-600 transition-colors cursor-pointer"
                    >
                      {article.title}
                    </h3>
                    
                    <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                      {article.excerpt}
                    </p>

                    <button
                      onClick={() => setSelectedArticle(article)}
                      className="self-start inline-flex items-center gap-2 text-xs font-bold transition-all group-hover:gap-3 text-yellow-600 hover:text-yellow-700"
                    >
                      Read Article <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── DETAIL MODAL OVERLAY ── */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div 
            className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Close Header */}
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setSelectedArticle(null)}
                className="p-2 rounded-full bg-white/80 hover:bg-white text-slate-800 shadow-md hover:scale-105 transition-all"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Container */}
            <div className="overflow-y-auto flex-1">
              {/* Cover Banner */}
              <div className="relative h-60 sm:h-80 bg-slate-900">
                {selectedArticle.featured_image_url ? (
                  <img
                    src={selectedArticle.featured_image_url}
                    alt={selectedArticle.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-yellow-600">
                    <BookOpen size={64} />
                  </div>
                )}
                <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${NAVY} 0%, transparent 100%)` }} />
                
                {/* Meta details over cover banner */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-yellow-500 uppercase tracking-widest mb-2">
                    <span className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded">
                      <Calendar size={12} />
                      {formatDate(selectedArticle.published_at || new Date().toISOString())}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight drop-shadow-md">
                    {selectedArticle.title}
                  </h2>
                </div>
              </div>

              {/* Text content */}
              <div className="p-6 sm:p-10">
                {/* Excerpt panel */}
                <div className="border-l-4 border-yellow-500 pl-4 py-2 mb-8 italic text-slate-600 bg-gray-50 rounded-r-xl text-sm sm:text-base leading-relaxed">
                  {selectedArticle.excerpt}
                </div>

                {/* Article Body Content */}
                <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-6">
                  {selectedArticle.content.split('\n\n').map((paragraph, index) => {
                    // Check if paragraph is a heading
                    if (paragraph.startsWith('### ')) {
                      return <h3 key={index} className="text-lg sm:text-xl font-bold mt-8 mb-4 text-slate-900" style={{ color: NAVY }}>{paragraph.replace('### ', '')}</h3>;
                    }
                    if (paragraph.startsWith('## ')) {
                      return <h2 key={index} className="text-xl sm:text-2xl font-bold mt-10 mb-4 text-slate-900 border-b pb-2" style={{ color: NAVY }}>{paragraph.replace('## ', '')}</h2>;
                    }
                    if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                      return <strong key={index} className="block font-bold text-slate-800 text-base mt-4">{paragraph.replace(/\*\*/g, '')}</strong>;
                    }
                    
                    // Render bullet list
                    if (paragraph.includes('\n* ')) {
                      const lines = paragraph.split('\n');
                      return (
                        <ul key={index} className="list-disc list-inside space-y-2.5 my-4 pl-4 text-slate-600">
                          {lines.map((line, lIdx) => {
                            if (line.startsWith('* ')) {
                              const cleanLine = line.replace('* ', '');
                              // check if there is a bold segment in the bullet
                              if (cleanLine.includes('**')) {
                                const parts = cleanLine.split('**');
                                return (
                                  <li key={lIdx}>
                                    <strong>{parts[1]}</strong>{parts[2] || ''}
                                  </li>
                                );
                              }
                              return <li key={lIdx}>{cleanLine}</li>;
                            }
                            return null;
                          })}
                        </ul>
                      );
                    }

                    // Render ordered list
                    if (paragraph.includes('\n1. ')) {
                      const lines = paragraph.split('\n');
                      return (
                        <ol key={index} className="list-decimal list-inside space-y-3 my-4 pl-4 text-slate-600">
                          {lines.map((line, lIdx) => {
                            const match = line.match(/^\d+\.\s+\*\*(.+?)\*\*:\s*(.*)$/);
                            if (match) {
                              return (
                                <li key={lIdx}>
                                  <strong>{match[1]}:</strong> {match[2]}
                                </li>
                              );
                            }
                            if (line.match(/^\d+\.\s+(.*)$/)) {
                              return <li key={lIdx}>{line.replace(/^\d+\.\s+/, '')}</li>;
                            }
                            return null;
                          })}
                        </ol>
                      );
                    }

                    return <p key={index} className="whitespace-pre-line leading-relaxed">{paragraph}</p>;
                  })}
                </div>
              </div>
            </div>

            {/* Modal CTA Footer */}
            <div className="bg-gray-50 border-t border-gray-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-slate-800 font-bold text-sm">Want to implement these strategies?</p>
                <p className="text-gray-400 text-xs mt-0.5">Connect with our consulting team for custom guidance.</p>
              </div>
              <button
                onClick={() => {
                  setSelectedArticle(null);
                  onNavigate('contact', `Hello Enka Prime, I read your article: "${selectedArticle.title}" and would like to speak to a consultant about implementation for our organization.`);
                }}
                className="px-6 py-3 rounded-xl text-xs font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg w-full sm:w-auto text-center"
                style={{ backgroundColor: NAVY }}
              >
                Connect with Consultants
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
