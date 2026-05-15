import { useMemo, useState } from 'react'
import { Star, Bug, Sparkles, Lightbulb, Search, Filter, Plus, MessageSquare, CheckCircle2 } from 'lucide-react'

const feedbackSamples = [
  { id:'FD-001', title:'Improve duplicate row detection', type:'Feature Request', status:'Under Review', votes:24, description:'Add an option to flag duplicate rows using multiple column keys instead of a single column.', category:'Feature' },
  { id:'FD-002', title:'Add dark gradient export banner', type:'Bug Report', status:'New', votes:15, description:'When exporting merged data, some header styles are not preserved correctly in Excel output.', category:'Bug' },
  { id:'FD-003', title:'Allow bulk tag assignment', type:'Suggestion', status:'Planned', votes:37, description:'Enable selecting many rows and applying tags or notes in one click for review workflows.', category:'Suggestion' },
  { id:'FD-004', title:'Add request feedback history', type:'New', status:'Completed', votes:52, description:'Show a history feed of custom tool request updates and status changes in the dashboard.', category:'Suggestion' },
]

const badgeStyles = {
  New: 'bg-sky-500/10 text-sky-300 border border-sky-500/20',
  'Under Review': 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
  Planned: 'bg-violet-500/10 text-violet-300 border border-violet-500/20',
  Completed: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
}

const categories = [
  { id:'all', label:'All Feedback', icon:Sparkles },
  { id:'feature', label:'Feature Requests', icon:Lightbulb },
  { id:'bug', label:'Bug Reports', icon:Bug },
  { id:'suggestion', label:'Suggestions', icon:MessageSquare },
]

export default function FeedbackPage() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filtered = useMemo(() => {
    return feedbackSamples.filter(item => {
      const matchCategory = selectedCategory === 'all' || item.category.toLowerCase() === selectedCategory
      const searchText = `${item.title} ${item.description}`.toLowerCase()
      const matchSearch = searchText.includes(search.toLowerCase())
      return matchCategory && matchSearch
    })
  }, [selectedCategory, search])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-12">
      <section className="space-y-4 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Premium feedback</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white">Collect and track product feedback with a polished SaaS experience.</h1>
        <p className="max-w-3xl mx-auto text-slate-400 leading-relaxed">Use this frontend module as a central hub for bug reports, feature ideas, and data workflow suggestions.</p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="glass p-8 rounded-[36px] border border-white/10">
          <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-sky-300 text-sm uppercase tracking-[0.25em]">Feedback board</div>
              <h2 className="text-3xl font-bold text-white">Feedback, ratings, and roadmap status in one dashboard.</h2>
              <p className="text-slate-400 leading-relaxed">Browse requests, sort ideas, and keep stakeholders aligned with clean status badges and vote counts.</p>
            </div>
            <div className="glass p-5 rounded-3xl bg-slate-950/90 border border-white/10">
              <div className="flex items-center gap-3 text-slate-200 font-semibold"><Star size={18} className="text-amber-300"/>Rating system</div>
              <p className="mt-3 text-sm text-slate-400">Each submission can carry a priority and status so teams know what is new, being reviewed, planned or completed.</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {['New', 'Under Review', 'Planned', 'Completed'].map(label => (
              <div key={label} className="glass p-4 rounded-3xl">
                <p className="text-sm text-slate-400">{label}</p>
                <p className="mt-2 text-2xl font-bold text-white">{feedbackSamples.filter(item => item.status === label).length}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-8 rounded-[36px] border border-white/10">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.28em] text-sky-300">Quick action</p>
            <button className="btn-primary w-full py-3 flex items-center justify-center gap-2"><Plus size={16}/> New feedback</button>
            <div className="grid gap-3">
              <div className="glass p-4 rounded-3xl">
                <p className="text-sm text-slate-400">Bug report</p>
                <p className="mt-2 text-white">Document issues quickly and assign priority without leaving the dashboard.</p>
              </div>
              <div className="glass p-4 rounded-3xl">
                <p className="text-sm text-slate-400">Feature request</p>
                <p className="mt-2 text-white">Capture ideas with clear context and status updates for every stakeholder.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Feedback overview</h2>
            <p className="text-slate-400">Filter feedback by type or search by keywords to find the most impactful requests.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-300">
              <Search size={16} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search feedback" className="w-full bg-transparent outline-none text-sm text-slate-100" />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setSelectedCategory(id)}
                  className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-sm transition ${selectedCategory === id ? 'bg-sky-500/15 text-sky-200 border border-sky-500/20' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>
                  <Icon size={16} />{label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map(item => (
            <div key={item.id} className="glass p-6 rounded-[32px] border border-white/10 hover:shadow-xl hover:shadow-sky-500/10 transition-shadow">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-400">{item.type}</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">{item.title}</h3>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeStyles[item.status]}`}>
                  {item.status}
                </span>
              </div>
              <p className="mt-4 text-slate-400 text-sm leading-relaxed">{item.description}</p>
              <div className="mt-5 flex items-center justify-between text-sm text-slate-300">
                <div className="inline-flex items-center gap-2"><Sparkles size={16} className="text-sky-300" />{item.votes} votes</div>
                <div className="text-slate-400">{item.id}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="glass p-8 rounded-[36px] border border-white/10">
        <h2 className="text-2xl font-bold text-white">Feedback module features</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            'Search and filter results',
            'Status badges for each item',
            'Issue types for bugs and features',
            'Static demo data ready for UI',
          ].map(item => (
            <div key={item} className="glass p-4 rounded-3xl text-slate-300">{item}</div>
          ))}
        </div>
      </section>
    </div>
  )
}
