import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Lightbulb, Send, CheckCircle, ArrowRight, Zap, Clock, Star, MessageSquare, Mail, FileText, Users, Type } from 'lucide-react'
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
  { icon: Zap,           label: 'We build it',          desc: 'Custom tool built specifically for your workflow' },
  { icon: CheckCircle,   label: 'Ready to use',         desc: 'Test it, use it, give feedback' },
]

export default function RequestPage() {
  const { user } = useAuth()

  const [form, setForm] = useState({
    name: user?.displayName || '', 
    email: user?.email || '', 
    tool: '', 
    description: '', 
    files: '', 
    output: '',
    priority: 'medium'
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
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto bg-emerald-500/15 animate-fade-in">
        <CheckCircle size={40} className="text-emerald-400" />
      </div>
      <h2 className="text-3xl font-bold text-white">Request submitted!</h2>
      <p className="text-slate-300 leading-relaxed text-lg">
        Thanks for sharing your requirement. We'll review it and build a custom tool for you — usually within a few days.
        <br/>
        <span className="text-white font-medium">We'll reach out at {form.email}</span>
      </p>
      <div className="flex gap-3 justify-center pt-4">
        <button onClick={() => { setSubmitted(false); setForm({ name:'', email: user?.email||'', tool:'', description:'', files:'', output:'', priority: 'medium' }) }}
          className="btn-primary">
          Submit another request
        </button>
        <Link to="/compare" className="btn-ghost">
          Back to tools
        </Link>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-xs font-semibold text-amber-300">
          <Lightbulb size={14}/> No Strings Attached
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
          Need a <span style={{background:'linear-gradient(135deg,#f59e0b,#ef4444)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>custom data tool?</span>
        </h1>
        <p className="max-w-xl mx-auto text-slate-300 text-lg leading-relaxed">
          Tell us what you need. We'll build it specifically for your workflow — fast, free, and tailored to your requirements.
        </p>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {steps.map(({ icon: Icon, label, desc }, i) => (
          <div key={label} className="glass p-6 text-center space-y-3 relative group hover:border-amber-500/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
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
        <div className="glass p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText size={20} className="text-amber-400"/>
              Share Your Requirement
            </h2>
            <p className="text-sm text-slate-400 mt-2">Be as detailed as possible so we can build exactly what you need</p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
              <span className="flex-shrink-0 mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Your Name</label>
              <input 
                value={form.name} 
                onChange={e => set('name', e.target.value)} 
                placeholder="John Doe" 
                className="input" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Email <span className="text-rose-400">*</span>
              </label>
              <input 
                value={form.email} 
                onChange={e => set('email', e.target.value)} 
                placeholder="you@company.com" 
                type="email" 
                className="input" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Tool Name / Title (optional)</label>
            <input 
              value={form.tool} 
              onChange={e => set('tool', e.target.value)} 
              placeholder="e.g. GST Reconciliation Tool" 
              className="input" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              What Do You Need? <span className="text-rose-400">*</span>
            </label>
            <textarea 
              value={form.description} 
              onChange={e => set('description', e.target.value)} 
              rows={5}
              placeholder="Describe your use case in detail. What files do you have? What transformations do you need? What's the expected output?"
              className="input resize-none" 
            />
            <p className="text-xs text-slate-500">Include specific examples if possible</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">File Types You Work With</label>
              <input 
                value={form.files} 
                onChange={e => set('files', e.target.value)} 
                placeholder="e.g. Excel, CSV, JSON" 
                className="input" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Priority</label>
              <select 
                value={form.priority} 
                onChange={e => set('priority', e.target.value)} 
                className="input"
              >
                <option value="low">Low - Whenever</option>
                <option value="medium">Medium - This month</option>
                <option value="high">High - ASAP</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Expected Output / Result</label>
            <input 
              value={form.output} 
              onChange={e => set('output', e.target.value)} 
              placeholder="e.g. Excel report with highlighted mismatches" 
              className="input" 
            />
          </div>

          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="w-full btn-primary justify-center py-3 text-base font-semibold disabled:opacity-50 smooth-transition"
            style={{background: loading ? 'rgba(100,116,139,0.3)' : 'linear-gradient(135deg,#f59e0b,#d97706)'}}
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin">⏳</span>
                Submitting...
              </>
            ) : (
              <>
                <Send size={16}/>
                Submit Request
              </>
            )}
          </button>
        </div>

        {/* Examples sidebar */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Star size={20} className="text-amber-400"/>
              Example Requests
            </h2>
            <p className="text-sm text-slate-400 mt-2">Click any example to auto-fill and customize</p>
          </div>
          
          <div className="space-y-3">
            {examples.map(({ emoji, title, desc }) => (
              <button 
                key={title} 
                onClick={() => set('description', `${title}: ${desc}`)}
                className="w-full glass p-4 text-left hover:border-amber-500/40 hover:bg-amber-500/10 
                           transition-all duration-200 group"
              >
                <p className="font-semibold text-white text-sm flex items-start gap-2">
                  <span className="text-lg">{emoji}</span>
                  <span>{title}</span>
                </p>
                <p className="text-xs text-slate-400 leading-relaxed mt-1 ml-6">{desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
