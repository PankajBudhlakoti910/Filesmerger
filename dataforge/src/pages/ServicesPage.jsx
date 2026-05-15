import { Link } from 'react-router-dom'
import { GitCompare, Merge, Sun, Zap, FileText, TrendingUp, Layers, CircleDot, CheckCircle2 } from 'lucide-react'

const services = [
  {
    title: 'Data Comparison',
    icon: GitCompare,
    desc: 'Compare multiple spreadsheets quickly and spot row-level mismatches, missing records, and changed values.',
    benefits: ['Match by key columns', 'Highlight data drift', 'Export comparison reports', 'Fast browser-based workflows'],
    useCases: ['Audit reconciliation', 'Inventory validation', 'Invoice matching'],
  },
  {
    title: 'File Merge',
    icon: Merge,
    desc: 'Merge dozens of CSV or Excel files into one clean dataset with column mapping and duplicate handling.',
    benefits: ['Auto column alignment', 'Merge 80 files', 'Source tracking', 'Export to CSV/Excel'],
    useCases: ['Sales consolidation', 'Monthly reports', 'Data ingestion'],
  },
  {
    title: 'Data Cleaning',
    icon: CheckCircle2,
    desc: 'Prepare messy file-based data for downstream use with standardization, deduplication, and validation hints.',
    benefits: ['Missing value checks', 'Duplicate detection', 'Cell formatting review', 'Data quality insights'],
    useCases: ['CRM cleanup', 'Billing file prep', 'Master data hygiene'],
  },
  {
    title: 'CSV Automation',
    icon: Zap,
    desc: 'Automate repetitive CSV tasks with reusable workflows that turn files into ready-to-use outputs.',
    benefits: ['Template-based exports', 'Bulk processing', 'Auto column mapping', 'One-click runs'],
    useCases: ['Daily reports', 'Data transformation', 'Routine exports'],
  },
  {
    title: 'Report Generation',
    icon: TrendingUp,
    desc: 'Slice and summarize file data into actionable reports with charts, pivot summaries, and export-ready output.',
    benefits: ['Pivot-style summaries', 'Quick metrics', 'Exportable datasets', 'Review-ready output'],
    useCases: ['Management reports', 'Audit summaries', 'Sales dashboards'],
  },
  {
    title: 'Workflow Automation',
    icon: Layers,
    desc: 'Connect your file operations into repeatable sequences for reliable batch processing and decision support.',
    benefits: ['Step-by-step workflows', 'Status feedback', 'Batch-ready output', 'Trusted browser UX'],
    useCases: ['Recurring reconciliations', 'Data handoffs', 'Multi-step merges'],
  },
  {
    title: 'Custom Tools',
    icon: FileText,
    desc: 'Request tailored tool builds for niche file workflows like tax reconciliation, audit checks, and compliance reports.',
    benefits: ['Custom use case support', 'Built to your process', 'Fast delivery', 'Expert collaboration'],
    useCases: ['GST reports', 'Bank reconciliation', 'Audit exceptions'],
  },
  {
    title: 'Bulk Processing',
    icon: CircleDot,
    desc: 'Process large volumes of files in one go, with fast previews, summaries, and safe export control.',
    benefits: ['Batch file upload', 'Progress indicators', 'Multi-format export', 'Efficient UI'],
    useCases: ['End-of-month closes', 'Large dataset prep', 'Multi-file consolidation'],
  },
]

export default function ServicesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-16">
      <section className="text-center space-y-5">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Services</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white">A full suite of file automation services built for modern teams.</h1>
        <p className="max-w-3xl mx-auto text-slate-400 leading-relaxed">From instant comparison to custom workflow automation, DataForge gives business users a polished toolset for working with complex data files.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/compare" className="btn-primary">Compare Files</Link>
          <Link to="/merge" className="btn-ghost">Merge Files</Link>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {services.map(({ title, desc, benefits, useCases, icon: Icon }) => (
          <div key={title} className="glass p-6 rounded-[30px] hover:-translate-y-1 transition-transform border border-white/10">
            <div className="w-12 h-12 rounded-3xl bg-sky-500/10 text-sky-300 flex items-center justify-center mb-4"><Icon size={22} /></div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">{desc}</p>
            <div className="mt-5 text-sm">
              <p className="font-semibold text-slate-100">Benefits</p>
              <ul className="mt-2 space-y-2 text-slate-400">
                {benefits.map(item => <li key={item}>• {item}</li>)}
              </ul>
            </div>
            <div className="mt-4 text-sm">
              <p className="font-semibold text-slate-100">Use cases</p>
              <p className="mt-2 text-slate-400">{useCases.join(', ')}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass p-8 rounded-[36px] border border-white/10">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Enterprise readiness</p>
          <h2 className="mt-4 text-3xl font-extrabold text-white">Designed for operational teams who need dependable data workflows.</h2>
          <p className="mt-4 text-slate-300 leading-7">DataForge is built to reduce manual spreadsheet work through automated file comparison, merge flows, and repeatable custom tool requests — all in a modern SaaS experience.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="glass p-5 rounded-3xl">
              <p className="text-lg font-semibold text-white">Secure processing</p>
              <p className="mt-2 text-slate-400 text-sm">Files are parsed client-side so you retain control of sensitive data until you decide to submit.</p>
            </div>
            <div className="glass p-5 rounded-3xl">
              <p className="text-lg font-semibold text-white">Rapid deployment</p>
              <p className="mt-2 text-slate-400 text-sm">No installs, no complex onboarding — just upload files and get results instantly.</p>
            </div>
          </div>
        </div>
        <div className="glass p-8 rounded-[36px] border border-white/10">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Quick facts</p>
          <div className="mt-8 grid gap-4">
            <div className="glass p-5 rounded-3xl">
              <p className="text-2xl font-bold text-white">80+</p>
              <p className="text-slate-400 text-sm">Files merged in one session</p>
            </div>
            <div className="glass p-5 rounded-3xl">
              <p className="text-2xl font-bold text-white">100%</p>
              <p className="text-slate-400 text-sm">Client-side data security</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
