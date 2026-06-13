import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, BookOpen, Clock, Calendar, ArrowRight, X, Tag } from 'lucide-react';
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
  category?: string;
}

const BLOG_CATEGORIES = ['All', 'Training', 'Leadership', 'Compliance', 'Digital', 'Services'];

const FALLBACK_BLOGS: BlogArticle[] = [
  // ── TRAINING ARTICLES ──────────────────────────────────────────────────────
  {
    id: 'fb-t1',
    title: 'Why In-House Training Delivers Greater ROI Than Public Workshops',
    excerpt: 'Sending staff to public training events is costly and often irrelevant. Discover why customised in-house programmes produce measurable results and deeper behavioural change across your organisation.',
    content: `Organisations across Africa spend billions every year on training, yet studies consistently show that less than 20% of workshop content is retained and applied after 30 days. Why? Because generic public programmes are designed for the lowest common denominator, not for your specific culture, challenges, or strategic goals.

### The Case for In-House, Customised Training

In-house training programmes are delivered at your facility, using your real-world scenarios, your terminology, and your people. This context makes learning immediately applicable — not abstract theory that participants struggle to connect to daily work.

### Key Advantages of In-House Delivery

1. **Customised Content:** Every module is tailored to address your actual challenges. A bank's customer service training looks very different from a manufacturer's, and it should be treated that way.
2. **Peer-to-Peer Learning:** When an entire department learns together, cross-functional understanding grows. Colleagues share challenges, align on solutions, and hold each other accountable after the training.
3. **Cost Efficiency at Scale:** Once you train 10 or more staff, the per-head cost of in-house training almost always beats equivalent public programmes, often at a ratio of 3:1.
4. **Management Alignment:** Senior leaders can attend or observe, ensuring that what is taught aligns with company direction and can be reinforced in performance conversations.

### What Enka Prime Delivers

Our in-house training catalogue spans Leadership & Management, Customer Excellence, Health, Safety & Environment (HSE), Finance for Non-Finance Managers, Digital Literacy, and much more. Every programme is preceded by a needs assessment to ensure the content hits the mark.

The result: measurable behavioural change, improved team performance, and a clear return on your training investment.`,
    featured_image_url: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg',
    slug: 'in-house-training-roi',
    is_published: true,
    published_at: '2026-06-10T08:00:00Z',
    sort_order: 1,
    category: 'Training',
  },
  {
    id: 'fb-t2',
    title: 'Building a Leadership Pipeline: Training Your Next Generation of Managers',
    excerpt: 'Every high-performing organisation is only as strong as its leadership bench. Learn how structured management development programmes prevent talent gaps and drive succession readiness.',
    content: `Leadership vacuums are silent killers of organisational growth. When a senior manager departs unexpectedly, companies without a prepared successor often experience productivity losses, team anxiety, and cultural drift for months — sometimes years.

The solution is a proactive Leadership Pipeline: a deliberate, structured programme that identifies high-potential employees and equips them with the managerial competencies they need before they are placed in leadership roles.

### The Three Levels of Leadership Development

1. **Individual Contributor to Team Leader:** The first transition is often the hardest. New supervisors must shift from doing work themselves to enabling others. Our training at this level focuses on delegation, coaching conversations, and setting performance expectations.
2. **Team Leader to Departmental Manager:** At this level, participants learn to think strategically, manage budgets, resolve conflicts, and communicate across functions. Business acumen and emotional intelligence become critical success factors.
3. **Department Manager to Senior Executive:** Future executives must understand organisational design, stakeholder management, risk governance, and how to lead through uncertainty and change.

### Measuring Leadership Development Impact

Unlike many soft-skills programmes, leadership development impact can be measured:

* **360-degree feedback** collected before and 6 months after the programme reveals measurable shifts in management behaviour.
* **Succession readiness scores** tracked by HR show how quickly bench strength is building.
* **Retention rates** for high-potential employees who receive investment in their growth consistently exceed those who don't.

Enka Prime's Leadership & Management Development programmes are built on these principles. We partner with your HR team to identify the right cohort, design the right curriculum, and measure what matters.`,
    featured_image_url: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg',
    slug: 'leadership-pipeline-training',
    is_published: true,
    published_at: '2026-06-07T10:30:00Z',
    sort_order: 2,
    category: 'Leadership',
  },
  {
    id: 'fb-t3',
    title: 'Customer Service Excellence: How Training Transforms Your Frontline Staff',
    excerpt: 'One poor service interaction can lose a customer forever. How targeted training in emotional intelligence, active listening, and complaint handling turns frontline teams into loyalty builders.',
    content: `Research from the Harvard Business Review shows that customers who have had a positive service recovery experience become more loyal than customers who never had a problem at all. This insight is the foundation of world-class customer service training: it's not about scripted smiles, it's about genuine empathy and skilled resolution.

### The Real Skills Behind Service Excellence

Exceptional customer service is a craft. It requires a specific, learnable set of competencies:

1. **Active Listening:** Staff must be trained to listen for what is not being said — the frustration beneath a complaint, the hesitation behind a request. Active listening techniques, practised through role-play, build this muscle.
2. **Emotional Intelligence (EQ):** High-EQ frontline staff can regulate their own reactions to difficult customers while still meeting the customer's emotional need to feel heard and valued.
3. **Structured Problem Solving:** A consistent framework (such as Acknowledge, Clarify, Explore, Resolve, Follow-up) ensures that every complaint is handled methodically, not reactively.
4. **Brand Representation:** Every customer interaction is a brand statement. Training helps staff understand the link between their personal service behaviour and the organisation's reputation.

### The Business Case

* Organisations with highly engaged customer-facing staff show **63% lower customer churn** rates.
* A trained team handles escalations faster, reducing the cost-per-resolution by up to 40%.
* Customer satisfaction scores (NPS, CSAT) consistently improve within 90 days of targeted service training.

Enka Prime's Customer Service Excellence programmes are available for retail, banking, hospitality, healthcare, and government-facing teams. We combine classroom learning with live service audits and follow-up coaching to embed lasting change.`,
    featured_image_url: 'https://images.pexels.com/photos/3184298/pexels-photo-3184298.jpeg',
    slug: 'customer-service-excellence-training',
    is_published: true,
    published_at: '2026-06-09T13:00:00Z',
    sort_order: 3,
    category: 'Training',
  },
  {
    id: 'fb-t4',
    title: 'Health, Safety & Environment (HSE) Training: Compliance Is the Floor, Not the Ceiling',
    excerpt: 'Regulatory HSE compliance is a legal baseline — but true safety culture goes far deeper. Explore how behaviour-based safety training builds zero-incident mindsets across operations.',
    content: `Every year, workplace injuries cost African economies billions in lost productivity, medical bills, insurance claims, and reputational damage. Yet research shows that over 85% of workplace accidents are caused by human behaviour, not equipment failure. This insight shifts the entire safety conversation: the most important safety tool you own is a well-trained workforce.

### Beyond the Safety Poster: Building a Safety Culture

Rules and posters create compliance. Training creates culture. The difference is profound:

* **Compliance** means workers wear PPE because they are told to.
* **Culture** means workers wear PPE and remind each other to, because they genuinely value going home safely.

Our HSE training programmes move organisations along this spectrum through structured, practical learning — not passive classroom lectures.

### Key Components of Effective HSE Training

1. **Hazard Identification & Risk Assessment (HIRA):** Workers are trained to see hazards before they become incidents. Practical walkthroughs and near-miss reporting systems are established.
2. **Permit to Work (PTW) Systems:** For high-risk operations (confined spaces, hot work, electrical isolation), workers must understand the PTW process and their role in it.
3. **Emergency Response & Evacuation:** Simulated drills, combined with training, ensure that panic is replaced by practiced procedure during a real emergency.
4. **Behaviour-Based Safety (BBS):** Supervisors and peers are trained to observe and positively reinforce safe behaviour — catching people doing things right, not just wrong.

### HSE Training Standards We Align To

Our HSE training content is aligned to ISO 45001 (Occupational Health & Safety Management), NEBOSH frameworks, and Ghana's Factories, Offices and Shops Act. This means your training investment is not only good for your people — it is audit-ready documentation of your compliance journey.`,
    featured_image_url: 'https://images.pexels.com/photos/8961370/pexels-photo-8961370.jpeg',
    slug: 'hse-training-safety-culture',
    is_published: true,
    published_at: '2026-06-06T09:00:00Z',
    sort_order: 4,
    category: 'Training',
  },
  // ── COMPLIANCE / SERVICES ARTICLES ────────────────────────────────────────
  {
    id: 'fb-s1',
    title: 'The Roadmap to Successful Records Digitalisation in Corporate Ghana',
    excerpt: 'Transitioning from paper to digital records is more than just scanning documents. Learn the critical steps to design secure, compliant, and highly accessible document management workflows.',
    content: `In today's fast-paced corporate environment, information is one of the most valuable assets an organisation possesses. Yet, many businesses in Ghana and across West Africa still rely heavily on paper records. This reliance creates inefficiencies, security vulnerabilities, and compliance risks.

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
    sort_order: 5,
    category: 'Digital',
  },
  {
    id: 'fb-s2',
    title: 'Asset Tagging & Lifecycle Management: Safeguarding Institutional Assets',
    excerpt: 'An accurate asset register is vital for financial health and audit compliance. Explore how barcode and QR code systems prevent asset leakage and streamline audits.',
    content: `Every growing enterprise faces a major logistical challenge: keeping track of physical assets. From IT hardware and office furniture to industrial equipment and vehicles, institutional assets represent a massive capital investment. Without a structured tracking system, assets get lost, stolen, or improperly depreciated.

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
    sort_order: 6,
    category: 'Services',
  },
  {
    id: 'fb-s3',
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
    sort_order: 7,
    category: 'Compliance',
  },
  {
    id: 'fb-t5',
    title: 'Finance for Non-Finance Managers: Why Every Leader Needs Financial Fluency',
    excerpt: 'You don\'t need to be an accountant to make great financial decisions. See how training non-financial managers to read budgets, interpret P&Ls, and track KPIs transforms business outcomes.',
    content: `One of the most common and costly gaps in management teams is financial literacy. Non-finance managers make decisions every day that have financial consequences — budget approvals, headcount requests, procurement choices, project prioritisation — yet many have never been formally taught how to read a profit & loss statement or evaluate a capital expenditure proposal.

This gap creates friction: finance teams grow frustrated that business managers don't understand the numbers, and business managers feel excluded from strategic conversations dominated by financial jargon.

### What "Finance for Non-Finance Managers" Covers

1. **Understanding Financial Statements:** Learn to read the Income Statement, Balance Sheet, and Cash Flow Statement — and know which numbers matter most for your role.
2. **Budget Preparation & Management:** Build a departmental budget from the ground up. Understand the difference between CAPEX and OPEX, and how to justify spend.
3. **Interpreting Key Performance Indicators (KPIs):** Revenue per employee, EBITDA margins, working capital ratios — how to track and act on financial metrics relevant to your function.
4. **Cost-Benefit Analysis:** Apply a simple but rigorous framework to evaluate investment decisions and make a compelling financial case to leadership.
5. **Understanding Profitability:** Grasp contribution margins, break-even analysis, and pricing impact — critical for managers in commercial, operations, or product roles.

### The Transformation We've Witnessed

Organisations that invest in financial literacy training for their middle management consistently report:

* Faster budget approval cycles (managers submit better-prepared requests).
* Reduced budget overruns (managers track spend proactively, not reactively).
* Better cross-functional collaboration between finance and operations.

This is one of the highest-leverage training investments any organisation can make.`,
    featured_image_url: 'https://images.pexels.com/photos/7681340/pexels-photo-7681340.jpeg',
    slug: 'finance-for-non-finance-managers',
    is_published: true,
    published_at: '2026-06-11T07:00:00Z',
    sort_order: 8,
    category: 'Training',
  },
];

// Estimate reading time (words per minute = 200)
function getReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export default function Blogs({ onNavigate }: BlogsProps) {
  const [blogs, setBlogs] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<BlogArticle | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');

  const loadBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const localBlogs = localStorage.getItem('local_blogs');
      if (localBlogs) {
        const parsed = JSON.parse(localBlogs);
        setBlogs(parsed.filter((b: any) => b.is_published));
      } else {
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
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const filteredBlogs =
    activeCategory === 'All'
      ? blogs
      : blogs.filter((b) => (b.category || 'General') === activeCategory);

  const featuredArticle = filteredBlogs[0] ?? null;
  const restArticles = filteredBlogs.slice(1);

  return (
    <div className="min-h-screen bg-white font-sans overflow-hidden">

      {/* ── HERO HEADER ── */}
      <section className="relative py-16 sm:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/3182811/pexels-photo-3182811.jpeg"
            alt="Corporate Insights & Blogs"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${NAVY}F2 0%, ${NAVY}C8 100%)` }} />
          {/* subtle dot grid */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(${GOLD} 1px, transparent 1px)`,
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-lg text-white font-semibold hover:bg-white/10 transition-colors"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <ChevronLeft size={16} /> Back to Home
          </button>

          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5"
            style={{ background: `${GOLD}25`, color: GOLD, border: `1px solid ${GOLD}40` }}
          >
            Knowledge Hub
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
            Corporate <span style={{ color: GOLD }}>Insights</span> & Blogs
          </h1>
          <p className="text-blue-100 text-lg sm:text-xl max-w-2xl leading-relaxed">
            Expert articles on corporate training, leadership development, records management, compliance, and capacity building — written by our consulting team.
          </p>
        </div>
      </section>

      {/* ── CATEGORY FILTER ── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 overflow-x-auto no-scrollbar">
          <Tag size={14} className="text-gray-400 flex-shrink-0" />
          <div className="flex gap-2 flex-shrink-0">
            {BLOG_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200"
                style={
                  activeCategory === cat
                    ? { background: NAVY, color: 'white' }
                    : { background: '#f3f4f6', color: '#374151' }
                }
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── ARTICLES GRID ── */}
      <section className="py-14 sm:py-20 bg-gray-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          {loading ? (
            <div className="text-center py-20">
              <div className="w-10 h-10 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400 text-sm font-semibold">Loading insights…</p>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen size={40} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 font-semibold">No articles in this category yet.</p>
              <button
                onClick={() => setActiveCategory('All')}
                className="mt-4 text-sm font-bold underline"
                style={{ color: NAVY }}
              >
                View all articles
              </button>
            </div>
          ) : (
            <>
              {/* ── FEATURED ARTICLE (large card) ── */}
              {featuredArticle && (
                <div
                  className="group mb-12 bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl border border-gray-100 transition-all duration-500 hover:-translate-y-1 flex flex-col lg:flex-row cursor-pointer"
                  onClick={() => setSelectedArticle(featuredArticle)}
                  style={{ animation: 'slideInUp 0.5s ease-out both' }}
                >
                  <div className="relative lg:w-1/2 h-56 sm:h-72 lg:h-auto bg-gray-100 overflow-hidden flex-shrink-0">
                    {featuredArticle.featured_image_url ? (
                      <img
                        src={featuredArticle.featured_image_url}
                        alt={featuredArticle.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-900 text-yellow-600">
                        <BookOpen size={48} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {/* Featured badge */}
                    <span
                      className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-widest uppercase"
                      style={{ background: GOLD, color: NAVY }}
                    >
                      Featured
                    </span>
                  </div>
                  <div className="flex flex-col justify-center p-8 sm:p-12 lg:w-1/2">
                    {featuredArticle.category && (
                      <span
                        className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold tracking-widest uppercase mb-4 self-start"
                        style={{ background: `${NAVY}0d`, color: NAVY }}
                      >
                        {featuredArticle.category}
                      </span>
                    )}
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-4 leading-snug group-hover:text-yellow-600 transition-colors">
                      {featuredArticle.title}
                    </h2>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">
                      {featuredArticle.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-400 font-semibold mb-6">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-yellow-600" />
                        {formatDate(featuredArticle.published_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-yellow-600" />
                        {getReadingTime(featuredArticle.content)} min read
                      </span>
                    </div>
                    <button
                      className="self-start inline-flex items-center gap-2 text-sm font-bold transition-all group-hover:gap-3"
                      style={{ color: NAVY }}
                    >
                      Read Article <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              )}

              {/* ── REMAINING ARTICLES GRID ── */}
              {restArticles.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {restArticles.map((article, idx) => (
                    <article
                      key={article.id}
                      className="group bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl border border-gray-100 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full cursor-pointer"
                      style={{ animation: `slideInUp 0.5s ease-out ${(idx + 1) * 100}ms both` }}
                      onClick={() => setSelectedArticle(article)}
                    >
                      {/* Card Cover Image */}
                      <div className="relative h-48 sm:h-56 bg-gray-100 overflow-hidden flex-shrink-0">
                        {article.featured_image_url ? (
                          <img
                            src={article.featured_image_url}
                            alt={article.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-900 text-yellow-600">
                            <BookOpen size={40} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        {article.category && (
                          <span
                            className="absolute top-4 left-4 px-2.5 py-1 rounded-full text-[9px] font-extrabold tracking-widest uppercase"
                            style={{ background: GOLD, color: NAVY }}
                          >
                            {article.category}
                          </span>
                        )}
                      </div>

                      {/* Card content */}
                      <div className="p-6 sm:p-7 flex flex-col flex-1">
                        <div className="flex items-center gap-3 text-xs text-gray-400 mb-4 font-bold uppercase tracking-wider">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} className="text-yellow-600" />
                            {formatDate(article.published_at || new Date().toISOString())}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} className="text-yellow-600" />
                            {getReadingTime(article.content)} min
                          </span>
                        </div>

                        <h3 className="text-lg sm:text-xl font-extrabold mb-3 leading-snug text-slate-800 group-hover:text-yellow-600 transition-colors">
                          {article.title}
                        </h3>

                        <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                          {article.excerpt}
                        </p>

                        <button
                          className="self-start inline-flex items-center gap-2 text-xs font-bold transition-all group-hover:gap-3 text-yellow-600 hover:text-yellow-700"
                        >
                          Read Article <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section
        className="py-14 sm:py-20 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #1a3a7a 100%)` }}
      >
        <div
          className="absolute inset-0 opacity-5"
          style={{ backgroundImage: `radial-gradient(${GOLD} 1px, transparent 1px)`, backgroundSize: '28px 28px' }}
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5"
            style={{ background: `${GOLD}22`, color: GOLD, border: `1px solid ${GOLD}40` }}
          >
            Training Enquiries
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
            Ready to Train Your <span style={{ color: GOLD }}>Team?</span>
          </h2>
          <p className="text-blue-200 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            All our programmes are delivered in-house, customised for your organisation. Contact us to get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('training')}
              className="px-8 py-4 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg"
              style={{ background: GOLD, color: NAVY }}
            >
              View Training Catalogue
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="px-8 py-4 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg text-white border border-white/25 hover:bg-white/10"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>

      {/* ── ARTICLE DETAIL MODAL ── */}
      {selectedArticle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
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
                <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${NAVY} 0%, transparent 60%)` }} />

                {/* Meta over banner */}
                <div className="absolute bottom-6 left-6 right-16">
                  <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-widest mb-3">
                    {selectedArticle.category && (
                      <span
                        className="px-2.5 py-1 rounded-full"
                        style={{ background: GOLD, color: NAVY }}
                      >
                        {selectedArticle.category}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-yellow-500 bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded">
                      <Calendar size={12} />
                      {formatDate(selectedArticle.published_at || new Date().toISOString())}
                    </span>
                    <span className="flex items-center gap-1 text-yellow-500 bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded">
                      <Clock size={12} />
                      {getReadingTime(selectedArticle.content)} min read
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

                {/* Article Body */}
                <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-6">
                  {selectedArticle.content.split('\n\n').map((paragraph, index) => {
                    if (paragraph.startsWith('### ')) {
                      return (
                        <h3 key={index} className="text-lg sm:text-xl font-bold mt-8 mb-4" style={{ color: NAVY }}>
                          {paragraph.replace('### ', '')}
                        </h3>
                      );
                    }
                    if (paragraph.startsWith('## ')) {
                      return (
                        <h2 key={index} className="text-xl sm:text-2xl font-bold mt-10 mb-4 border-b pb-2" style={{ color: NAVY }}>
                          {paragraph.replace('## ', '')}
                        </h2>
                      );
                    }
                    if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                      return (
                        <strong key={index} className="block font-bold text-slate-800 text-base mt-4">
                          {paragraph.replace(/\*\*/g, '')}
                        </strong>
                      );
                    }
                    if (paragraph.includes('\n* ')) {
                      const lines = paragraph.split('\n');
                      return (
                        <ul key={index} className="list-disc list-inside space-y-2.5 my-4 pl-4 text-slate-600">
                          {lines.map((line, lIdx) => {
                            if (line.startsWith('* ')) {
                              const cleanLine = line.replace('* ', '');
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
                    return (
                      <p key={index} className="whitespace-pre-line leading-relaxed">
                        {paragraph}
                      </p>
                    );
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
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={() => onNavigate('training')}
                  className="flex-1 sm:flex-none px-5 py-3 rounded-xl text-xs font-bold border transition-all duration-300 hover:scale-105"
                  style={{ borderColor: NAVY, color: NAVY }}
                >
                  View Training
                </button>
                <button
                  onClick={() => {
                    setSelectedArticle(null);
                    onNavigate(
                      'contact',
                      `Hello Enka Prime, I read your article: "${selectedArticle.title}" and would like to speak to a consultant about this topic.`
                    );
                  }}
                  className="flex-1 sm:flex-none px-5 py-3 rounded-xl text-xs font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  style={{ backgroundColor: NAVY }}
                >
                  Connect with Consultants
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
