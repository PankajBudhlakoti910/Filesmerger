import { Link } from 'react-router-dom'
import { useState } from 'react'
import {
  GitCompare, Merge, Lightbulb, ChevronRight, BarChart3,
  FileSpreadsheet, AlertTriangle, Download, Zap, Shield,
  Search, PieChart, Filter, ArrowRight, CheckCircle, Star,
  Users, TrendingUp, Package, Layers
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
    badge: 'Free',
    to: '/request',
    desc: 'Need something specific? Share your requirement and we\'ll build a custom data tool tailored to your workflow — for free.',
    features: ['Describe your use case', 'Get a custom-built tool', 'No cost involved', 'Fast turnaround'],
  },
]

const steps = [
  { n: '01', icon: FileSpreadsheet, label: 'Upload your files',   desc: 'Drag & drop CSV or Excel files — up to 80 at once' },
  { n: '02', icon: Filter,          label: 'Choose operation',     desc: 'Compare, merge, or analyse your data' },
  { n: '03', icon: TrendingUp,      label: 'Explore results',      desc: 'Filter, pivot, search, find duplicates' },
  { n: '04', icon: Download,        label: 'Export & download',    desc: 'Save as CSV, Excel, or JSON instantly' },
]

const capabilities = [
  { icon: GitCompare,    label: 'Side-by-side comparison',    desc: 'Compare two or more datasets on any key column and highlight every difference.' },
  { icon: Search,        label: 'Keyword & duplicate search', desc: 'Search any column for keywords or find exact duplicate rows in seconds.' },
  { icon: PieChart,      label: 'Pivot table analysis',       desc: 'Build pivot tables from merged data — sum, count, average by any group.' },
  { icon: Layers,        label: 'Auto column mapping',        desc: 'Files with different column orders? We auto-detect and align them for you.' },
  { icon: Filter,        label: 'Column-based filtering',     desc: 'Filter rows by value ranges, categories, or text — across any column.' },
  { icon: Download,      label: 'Multi-format export',        desc: 'Download results as CSV (default), Excel, or JSON with one click.' },
  { icon: Zap,           label: 'Runs in your browser',       desc: 'No server uploads. All processing is local — fast, private, and secure.' },
  { icon: Package,       label: 'Merge up to 80 files',       desc: 'Combine massive datasets from many files into a single clean output file.' },
]

const stats = [
  { value: '80+',   label: 'Files merged at once' },
  { value: '100%',  label: 'Browser-based, private' },
  { value: '3',     label: 'Powerful tools' },
  { value: 'Free',  label: 'No account needed' },
]

export default function HomePage() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-32">

      {/* ── Hero ── */}
      <section className="text-center space-y-8" style={{animation:'fadeUp 0.5s ease both'}}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold mb-2"
          style={{borderColor:'rgba(14,165,233,0.3)', background:'rgba(14,165,233,0.1)', color:'#38bdf8'}}>
          <BarChart3 size={12} /> Professional Data Tools — Free & Browser-Based
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none">
          <span className="text-white">Your data.</span><br />
          <span style={{background:'linear-gradient(135deg,#0ea5e9,#8b5cf6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>
            Compared. Merged. Analysed.
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg text-slate-400 leading-relaxed">
          Upload CSV and Excel files, compare differences, merge up to 80 files, run pivot analysis,
          find duplicates — all free, all in your browser, no login required.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/compare" className="btn-primary text-base px-7 py-3">
            <GitCompare size={18} /> Start Comparing <ChevronRight size={16} />
          </Link>
          <Link to="/merge" className="btn-ghost text-base px-7 py-3">
            <Merge size={18} /> Merge Files
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto pt-4">
          {stats.map(({ value, label }) => (
            <div key={label} className="glass p-4 text-center">
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-slate-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tools Section (Tabbed) ── */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Our Tools</h2>
          <p className="text-slate-400">Everything you need to work with data files</p>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap justify-center gap-2">
          {tools.map((tool, i) => (
            <button key={i} onClick={() => setActiveTab(i)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                ${activeTab === i ? 'text-white shadow-lg' : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'}`}
              style={activeTab === i ? {background:`linear-gradient(135deg,${tool.color}99,${tool.color}66)`} : {}}>
              <tool.icon size={16} />
              {tool.title}
              <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{background:'rgba(255,255,255,0.15)'}}>{tool.badge}</span>
            </button>
          ))}
        </div>

        {/* Active tool card */}
        {tools.map((tool, i) => i === activeTab && (
          <div key={i} className="glass p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{background:tool.bg}}>
                  <tool.icon size={28} style={{color:tool.color}} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{tool.title}</h3>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full" style={{background:tool.bg, color:tool.color}}>{tool.badge}</span>
                </div>
              </div>
              <p className="text-slate-300 leading-relaxed text-base">{tool.desc}</p>
              <ul className="space-y-2">
                {tool.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle size={15} className="text-emerald-400 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link to={tool.to} className="btn-primary inline-flex">
                Open {tool.title} <ArrowRight size={16} />
              </Link>
            </div>

            {/* Visual mockup */}
            <div className="glass-darker rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-rose-500/60" />
                <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                <div className="flex-1 h-px bg-white/10 ml-2" />
              </div>
              {i === 0 && <>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {['ID','Name','Value'].map(h => <div key={h} className="bg-sky-500/20 text-sky-300 px-2 py-1.5 rounded font-bold text-center">{h}</div>)}
                  {['001','Alice','₹5,200','002','Bob','₹3,100','003','Carol','₹7,800'].map((v,j) => (
                    <div key={j} className={`px-2 py-1.5 rounded text-center text-slate-300 ${j>=3&&j<6?'bg-amber-500/10 text-amber-300':'bg-white/5'}`}>{v}</div>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <span className="badge-green">12 Matched</span>
                  <span className="badge-amber">3 Missing</span>
                  <span className="badge-rose">1 Diff</span>
                </div>
              </>}
              {i === 1 && <>
                <div className="space-y-2">
                  {['sales_jan.csv','sales_feb.csv','sales_mar.csv','sales_apr.csv','+ 76 more files...'].map((f,j) => (
                    <div key={j} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${j===4?'text-slate-500 italic':'bg-white/5 text-slate-300'}`}>
                      <FileSpreadsheet size={12} className="text-violet-400 flex-shrink-0" />{f}
                    </div>
                  ))}
                </div>
                <div className="mt-3 px-3 py-2 rounded-lg text-xs text-emerald-400 font-semibold" style={{background:'rgba(16,185,129,0.1)'}}>
                  ✓ 80 files merged → 48,320 rows
                </div>
              </>}
              {i === 2 && <>
                <div className="space-y-3 text-sm">
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                    <p className="text-amber-300 font-semibold text-xs mb-1">Example Request</p>
                    <p className="text-slate-300 text-xs leading-relaxed">"I need a tool that compares two GST reports and flags mismatched invoice amounts..."</p>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-300 font-semibold">
                    ✓ Custom tool built & delivered free
                  </div>
                </div>
              </>}
            </div>
          </div>
        ))}
      </section>

      {/* ── How it works ── */}
      <section className="space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">How it works</h2>
          <p className="text-slate-400">Four simple steps — no setup, no account needed</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map(({ n, icon: Icon, label, desc }, i) => (
            <div key={n} className="glass p-6 relative overflow-hidden group hover:border-white/20 transition-all">
              <div className="absolute top-3 right-3 font-mono text-5xl font-bold text-white/5 group-hover:text-white/10 transition-colors select-none">{n}</div>
              <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center" style={{background:'rgba(14,165,233,0.1)'}}>
                <Icon size={20} className="text-sky-400" />
              </div>
              <p className="font-semibold text-white">{label}</p>
              <p className="text-sm text-slate-400 mt-1">{desc}</p>
              {i < steps.length - 1 && (
                <ChevronRight size={16} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 text-sky-500/40 hidden lg:block" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Capabilities Grid ── */}
      <section className="space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">What we do</h2>
          <p className="text-slate-400">Powerful capabilities built for real data workflows</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {capabilities.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="glass p-5 space-y-3 group hover:border-white/20 transition-all duration-200">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:'rgba(14,165,233,0.1)'}}>
                <Icon size={18} className="text-sky-400" />
              </div>
              <p className="font-semibold text-white text-sm">{label}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative glass p-12 overflow-hidden text-center">
        <div className="absolute inset-0 pointer-events-none" style={{background:'linear-gradient(135deg,rgba(14,165,233,0.08),transparent,rgba(139,92,246,0.08))'}} />
        <h2 className="text-3xl font-extrabold text-white relative">Ready to work with your data?</h2>
        <p className="mt-3 text-slate-400 relative">Free forever. No login required. Runs in your browser.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4 relative">
          <Link to="/compare" className="btn-primary text-base px-8 py-3">
            <GitCompare size={18} /> Compare Files
          </Link>
          <Link to="/merge" className="btn-ghost text-base px-8 py-3">
            <Merge size={18} /> Merge Files
          </Link>
          <Link to="/request" className="btn-ghost text-base px-8 py-3">
            <Lightbulb size={18} /> Request Custom Tool
          </Link>
        </div>
      </section>
    </div>
  )
}
