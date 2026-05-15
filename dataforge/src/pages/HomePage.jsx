import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  GitCompare, Merge, Lightbulb, ChevronRight, BarChart3,
  FileSpreadsheet, Download, Zap, Search, PieChart,
  Filter, ArrowRight, CheckCircle, Star, TrendingUp,
  Package, Layers, Sparkles
} from 'lucide-react'

const tools = [
  {
    icon: GitCompare,
    color: '#0ea5e9',
    bg: 'rgba(14,165,233,0.1)',
    title: 'File Comparator',
    badge: 'Popular',
    to: '/compare',
    desc: 'Upload multiple CSV/Excel files and compare them side by side. Instantly find matched records, missing entries, and cell-level differences.',
    features: ['Multiple file upload', 'Key column matching', 'Cell diff highlighting', 'CSV & Excel export'],
  },
  {
    icon: Merge,
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.1)',
    title: 'File Merger',
    badge: 'New',
    to: '/merge',
    desc: 'Merge up to 80 files into one. Auto-maps columns across files, handles different column orders, and lets you analyse merged data before export.',
    features: ['Up to 80 files at once', 'Auto column mapping', 'Pivot & duplicate analysis', 'CSV / Excel / JSON export'],
  },
  {
    icon: Lightbulb,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
    title: 'Custom Tool Request',
    to: '/request',
    desc: 'Need something specific? Share your requirement and we\'ll build a custom data tool tailored to your workflow.',
    features: ['Describe your use case', 'Get a custom-built tool', 'No cost involved', 'Fast turnaround'],
  },
]

const steps = [
  { n: '01', icon: FileSpreadsheet, label: 'Upload your files', desc: 'Drag & drop CSV or Excel files — up to 80 at once' },
  { n: '02', icon: Filter, label: 'Choose operation', desc: 'Compare, merge, or analyse your data' },
  { n: '03', icon: TrendingUp, label: 'Explore results', desc: 'Filter, pivot, search, find duplicates' },
  { n: '04', icon: Download, label: 'Export & download', desc: 'Save as CSV, Excel, or JSON instantly' },
]

const capabilities = [
  { icon: GitCompare, label: 'Side-by-side comparison', desc: 'Compare two or more datasets on any key column and highlight every difference.' },
  { icon: Search, label: 'Keyword & duplicate search', desc: 'Search any column for keywords or find exact duplicate rows in seconds.' },
  { icon: PieChart, label: 'Pivot table analysis', desc: 'Build pivot tables from merged data — sum, count, average by any group.' },
  { icon: Layers, label: 'Auto column mapping', desc: 'Files with different column orders? We auto-detect and align them for you.' },
  { icon: Filter, label: 'Column-based filtering', desc: 'Filter rows by value ranges, categories, or text — across any column.' },
  { icon: Download, label: 'Multi-format export', desc: 'Download results as CSV (default), Excel, or JSON with one click.' },
  { icon: Zap, label: 'Runs in your browser', desc: 'No server uploads. All processing is local — fast, private, and secure.' },
  { icon: Package, label: 'Merge up to 80 files', desc: 'Combine massive datasets from many files into a single clean output file.' },
]

const stats = [
  { value: '80+', label: 'Files merged at once' },
  { value: '100%', label: 'Browser-based, private' },
  { value: '3', label: 'Core tools' },
]

const testimonials = [
  { quote: '"The comparison workflow is incredibly fast and the results are easy to act on."', author: 'Finance lead, Mumbai' },
  { quote: '"Merging 80 files in one go saved our team hours of manual cleanup."', author: 'Operations manager, Pune' },
  { quote: '"The product feels premium and our team trusts it for critical reports."', author: 'Audit partner, Delhi' },
]

const faqs = [
  { q: 'Can I compare files with different column order?', a: 'Yes — DataForge automatically aligns columns and shows exact value differences across files.' },
  { q: 'Do I need an account to use the core tools?', a: 'No login is required for comparison and merge tools. Auth is only needed for admin and request flows.' },
  { q: 'How many files can I merge in one session?', a: 'You can merge up to 80 files in a single session with support for CSV and Excel file types.' },
]

export default function HomePage({ section }) {
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    if (!section) return
    const element = document.getElementById(section)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [section])

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-8 sm:py-12 lg:py-16 space-y-16 sm:space-y-24 lg:space-y-32">
      <section className="text-center space-y-6 sm:space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold mb-2" style={{ borderColor: 'rgba(14,165,233,0.3)', background: 'rgba(14,165,233,0.1)', color: '#38bdf8' }}>
          <BarChart3 size={12} /> Professional Data Tools — Browser-Based
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-tight sm:leading-none">
          <span className="text-white">Your data.</span><br />
          <span style={{ background: 'linear-gradient(135deg,#0ea5e9,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Compared. Merged. Analysed.
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base lg:text-lg text-slate-400 leading-relaxed px-1">
          Upload CSV and Excel files, compare differences, merge up to 80 files, run pivot analysis, find duplicates, all in your browser.
        </p>
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 justify-center flex-wrap">
          <Link to="/compare" className="btn-primary text-xs sm:text-sm lg:text-base px-5 sm:px-7 py-2 sm:py-3 whitespace-nowrap">
            <GitCompare size={16} className="sm:hidden" />
            <GitCompare size={18} className="hidden sm:block" /> Start Comparing <ChevronRight size={14} className="sm:hidden" />
            <ChevronRight size={16} className="hidden sm:block" />
          </Link>
          <Link to="/merge" className="btn-ghost text-xs sm:text-sm lg:text-base px-5 sm:px-7 py-2 sm:py-3 whitespace-nowrap">
            <Merge size={16} className="sm:hidden" />
            <Merge size={18} className="hidden sm:block" /> Merge Files
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 max-w-2xl mx-auto pt-3 sm:pt-4">
          {stats.map(({ value, label }) => (
            <div key={label} className="glass p-3 sm:p-4 text-center">
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-slate-400 mt-0.5 sm:mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 sm:gap-8 lg:gap-12 lg:grid-cols-[0.9fr_1.1fr] items-center" id="features">
        <div className="space-y-4 sm:space-y-6">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-semibold uppercase tracking-[0.24em] text-sky-300 bg-sky-500/10">
            <Sparkles size={14} className="sm:hidden" />
            <Sparkles size={16} className="hidden sm:block" /> Premium workflow engine
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">The modern SaaS home for data comparison and automation.</h2>
          <p className="max-w-2xl text-sm sm:text-base text-slate-400 leading-relaxed">DataForge is designed for teams who want fast spreadsheet comparison, smart merging, and deeper file-driven analytics without complexity.</p>
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
            <div className="glass p-4 sm:p-6 rounded-2xl sm:rounded-[32px] border border-white/10">
              <p className="text-xs sm:text-sm text-slate-300">Deploy instantly in your browser with zero server uploads unless you choose to submit a request.</p>
            </div>
            <div className="glass p-4 sm:p-6 rounded-2xl sm:rounded-[32px] border border-white/10">
              <p className="text-xs sm:text-sm text-slate-300">Get enterprise polish with glassmorphism, soft gradients, and responsive dashboard flows that scale from mobile to desktop.</p>
            </div>
          </div>
        </div>
        <div className="glass p-4 sm:p-8 rounded-2xl sm:rounded-[44px] border border-white/10 shadow-2xl shadow-slate-950/20">
          <div className="grid gap-3 sm:gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="glass p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-white/10">
                <p className="text-lg sm:text-2xl font-bold text-white">Secure</p>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 sm:mt-2 leading-tight">Client-side parsing keeps your files private and fast.</p>
              </div>
              <div className="glass p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-white/10">
                <p className="text-lg sm:text-2xl font-bold text-white">Scalable</p>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 sm:mt-2 leading-tight">Work with large datasets across multiple files and workflows.</p>
              </div>
            </div>
            <div className="glass p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-white/10">
              <p className="text-xs sm:text-sm uppercase tracking-[0.24em] text-sky-300">Featured workflow</p>
              <p className="mt-2 sm:mt-3 text-sm sm:text-lg font-semibold text-white leading-tight">Compare financial reports, merge results, then export a clean dataset for review.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6 sm:space-y-10">
        <div className="text-center space-y-2">
          <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-sky-300">Features</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">Everything you need for file-based data automation.</h2>
          <p className="max-w-3xl mx-auto text-sm sm:text-base text-slate-400">Powerful comparison, merge, and file analysis features built with enterprise user experience in mind.</p>
        </div>
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
          {capabilities.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="glass p-4 sm:p-6 rounded-xl sm:rounded-[32px] hover:-translate-y-1 transition-transform">
              <div className="w-10 sm:w-11 h-10 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center bg-sky-500/10 text-sky-300 mb-3 sm:mb-4 flex-shrink-0"><Icon size={16} className="sm:hidden" />
              <Icon size={18} className="hidden sm:block" /></div>
              <p className="font-semibold text-white text-sm sm:text-base">{label}</p>
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6 sm:space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">Workflow process</h2>
          <p className="text-sm sm:text-base text-slate-400">A simple path from file upload to actionable output.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {steps.map(({ n, icon: Icon, label, desc }) => (
            <div key={n} className="glass p-4 sm:p-6 rounded-xl sm:rounded-lg relative overflow-hidden group hover:border-white/20 transition-all">
              <div className="absolute top-2 sm:top-3 right-2 sm:right-3 font-mono text-4xl sm:text-5xl font-bold text-white/5 group-hover:text-white/10 transition-colors select-none">{n}</div>
              <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-lg sm:rounded-xl mb-3 sm:mb-4 flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(14,165,233,0.1)' }}>
                <Icon size={18} className="sm:hidden text-sky-400" />
                <Icon size={20} className="hidden sm:block text-sky-400" />
              </div>
              <p className="font-semibold text-white text-sm sm:text-base">{label}</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5 sm:mt-1 leading-tight">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6 sm:space-y-8">
        <div className="text-center space-y-2">
          <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-sky-300">Testimonials</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">What teams love about DataForge</h2>
        </div>
        <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
          {testimonials.map(item => (
            <div key={item.quote} className="glass p-4 sm:p-6 rounded-xl sm:rounded-[32px] border border-white/10">
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{item.quote}</p>
              <p className="mt-3 sm:mt-4 text-xs text-slate-400">{item.author}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 sm:gap-8 lg:gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass p-4 sm:p-8 rounded-2xl sm:rounded-[36px] border border-white/10">
          <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-sky-300">FAQ</p>
          <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
            {faqs.map(item => (
              <div key={item.q} className="glass p-3 sm:p-5 rounded-lg sm:rounded-3xl border border-white/10">
                <p className="font-semibold text-sm sm:text-base text-white">{item.q}</p>
                <p className="mt-1.5 sm:mt-2 text-slate-400 text-xs sm:text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="glass p-4 sm:p-8 rounded-2xl sm:rounded-[36px] border border-white/10 flex flex-col justify-between">
          <div>
            <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-sky-300">Ready to get started?</p>
            <h2 className="mt-3 sm:mt-4 text-xl sm:text-2xl lg:text-3xl font-extrabold text-white">Build smarter data processes today.</h2>
            <p className="mt-3 sm:mt-4 text-sm text-slate-400 leading-relaxed">No account needed for core tools. Run file comparison, merge files, or request a custom workflow in minutes.</p>
          </div>
          <div className="mt-6 sm:mt-8 flex flex-col gap-2 sm:gap-3 sm:flex-row">
            <Link to="/compare" className="btn-primary text-xs sm:text-sm py-2 sm:py-3 text-center">Compare Files</Link>
            <Link to="/merge" className="btn-ghost text-xs sm:text-sm py-2 sm:py-3 text-center">Merge Files</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
