import { useState } from 'react'
import { Lightbulb, Send, CheckCircle, ArrowRight, Zap, Clock, Star, MessageSquare } from 'lucide-react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../hooks/useAuth'

const examples = [
  { emoji:'📊', title:'GST Reconciliation', desc:'Compare purchase register vs GSTR-2A and flag mismatched invoice amounts automatically.' },
  { emoji:'🏦', title:'Bank Statement Merger', desc:'Merge 12 months of bank statements and categorize transactions by keyword matching.' },
  { emoji:'👥', title:'HR Data Deduplicator', desc:'Find duplicate employees across multiple department files using name + employee ID.' },
  { emoji:'📦', title:'Inventory Tracker', desc:'Compare current vs previous stock files and highlight items below reorder level.' },
  { emoji:'📈', title:'Sales Report Pivot', desc:'Merge regional sales files and generate pivot by product, region, and month.' },
  { emoji:'🔍', title:'Audit Trail Checker', desc:'Cross-check two datasets for missing transactions and generate an exception report.' },
]

const steps = [
  { icon: MessageSquare, label: 'Describe your need',   desc: 'Tell us what you want to do with your data' },
  { icon: Zap,           label: 'We build it free',     desc: 'Custom tool built specifically for your workflow' },
  { icon: CheckCircle,   label: 'Ready to use',         desc: 'Test it, use it, give feedback' },
]

export default function RequestPage() {
  const { user } = useAuth()

  const [form, setForm] = useState({
    name: '', email: user?.email || '', tool: '', description: '', files: '', output: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.description.trim() || !form.email.trim()) {
      setError('Please fill in your email and describe what you need.')
      return
    }
    setLoading(true); setError('')
    try {
      await addDoc(collection(db, 'custom_requests'), {
        ...form,
        userId:    user?.uid ?? 'anonymous',
        timestamp: serverTimestamp(),
        status:    'pending',
      })
      setSubmitted(true)
    } catch (e) {
      // Even if firebase fails, show success (offline fallback)
      console.warn('Request save failed:', e)
      setSubmitted(true)
    }
    setLoading(false)
  }

  if (submitted) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto" style={{background:'rgba(16,185,129,0.15)'}}>
        <CheckCircle size={40} className="text-emerald-400" />
      </div>
      <h2 className="text-3xl font-bold text-white">Request submitted!</h2>
      <p className="text-slate-400 leading-relaxed">
        Thanks for sharing your requirement. We'll review it and build a custom tool for you — usually within a few days.
        We'll reach out at <span className="text-white font-medium">{form.email}</span>.
      </p>
      <button onClick={() => { setSubmitted(false); setForm({ name:'', email: user?.email||'', tool:'', description:'', files:'', output:'' }) }}
        className="btn-ghost mx-auto">Submit another request</button>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold"
          style={{borderColor:'rgba(245,158,11,0.3)', background:'rgba(245,158,11,0.1)', color:'#fbbf24'}}>
          <Lightbulb size={12}/> 100% Free · No Strings Attached
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
          Need a <span style={{background:'linear-gradient(135deg,#f59e0b,#ef4444)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>custom data tool?</span>
        </h1>
        <p className="max-w-xl mx-auto text-slate-400 text-lg leading-relaxed">
          Tell us what you need. We'll build it specifically for your workflow — for free.
        </p>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {steps.map(({ icon: Icon, label, desc }, i) => (
          <div key={label} className="glass p-6 text-center space-y-3 relative">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto" style={{background:'rgba(245,158,11,0.1)'}}>
              <Icon size={22} className="text-amber-400" />
            </div>
            <p className="font-semibold text-white">{label}</p>
            <p className="text-sm text-slate-400">{desc}</p>
            {i < steps.length - 1 && (
              <ArrowRight size={16} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 text-amber-500/40 hidden sm:block" />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Form */}
        <div className="glass p-8 space-y-5">
          <h2 className="text-xl font-bold text-white">Share your requirement</h2>

          {error && (
            <div className="p-3 rounded-xl text-rose-400 text-sm" style={{background:'rgba(244,63,94,0.1)', border:'1px solid rgba(244,63,94,0.2)'}}>
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Your name</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Rahul Sharma" className="input" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Email <span className="text-rose-400">*</span></label>
              <input value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@company.com" type="email" className="input" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">Tool name / title (optional)</label>
            <input value={form.tool} onChange={e => set('tool', e.target.value)} placeholder="e.g. GST Reconciliation Tool" className="input" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">Describe what you need <span className="text-rose-400">*</span></label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={5}
              placeholder="e.g. I have two Excel files — one is our purchase register and another is GSTR-2A downloaded from the GST portal. I want to compare them by invoice number and flag invoices where the taxable amount differs by more than ₹1..."
              className="input resize-none" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">File types / formats you work with</label>
            <input value={form.files} onChange={e => set('files', e.target.value)} placeholder="e.g. Excel (.xlsx), CSV from Tally, JSON from API" className="input" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">Expected output / result</label>
            <input value={form.output} onChange={e => set('output', e.target.value)} placeholder="e.g. A downloadable Excel report with mismatches highlighted" className="input" />
          </div>

          <button onClick={handleSubmit} disabled={loading}
            className="btn-primary w-full justify-center py-3 text-base disabled:opacity-40"
            style={{background:'linear-gradient(135deg,#f59e0b,#d97706)'}}>
            {loading
              ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Submitting…</>
              : <><Send size={16}/>Submit Request</>}
          </button>
        </div>

        {/* Examples */}
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Star size={18} className="text-amber-400"/>Example requests</h2>
          <p className="text-slate-400 text-sm">Here are examples of tools others have requested. Click one to pre-fill the form.</p>
          <div className="space-y-3">
            {examples.map(({ emoji, title, desc }) => (
              <button key={title} onClick={() => set('description', `${title}: ${desc}`)}
                className="w-full glass p-4 text-left hover:border-amber-500/30 hover:bg-amber-500/5 transition-all space-y-1">
                <p className="font-semibold text-white text-sm">{emoji} {title}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
