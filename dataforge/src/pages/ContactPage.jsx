import { useState } from 'react'
import { Mail, Phone, MapPin, MessageCircle, Sparkles } from 'lucide-react'

export default function ContactPage() {
  const [form, setForm] = useState({ name:'', email:'', company:'', subject:'', message:'' })
  const [submitted, setSubmitted] = useState(false)

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }))
  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-16">
      <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] items-start">
        <div className="space-y-5">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-[0.24em] text-sky-300 bg-sky-500/10">
            <Sparkles size={14} /> Contact us
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white">Let's solve your data workflow together.</h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-300">Whether you have a business inquiry, need support, or want to discuss premium automation, we’re here to help.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="glass p-6 rounded-[28px]">
              <div className="flex items-center gap-3 text-sky-300 mb-4"><Mail size={18} /><span className="font-semibold text-white">hello@dataforge.app</span></div>
              <p className="text-sm text-slate-400">General inquiries and partnership requests.</p>
            </div>
            <div className="glass p-6 rounded-[28px]">
              <div className="flex items-center gap-3 text-sky-300 mb-4"><Phone size={18} /><span className="font-semibold text-white">+91 1234 567 890</span></div>
              <p className="text-sm text-slate-400">Support and pre-sales assistance.</p>
            </div>
          </div>
        </div>
        <div className="glass p-8 rounded-[36px] border border-white/10 space-y-6">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-sky-300">Business inquiry</p>
            <p className="text-slate-300">Use the form to share your company goals, file types, and expected output. We'll respond quickly with the best fit for your team.</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-200"><MapPin size={18} /><span>India · Remote-ready SaaS team</span></div>
            <div className="flex items-center gap-3 text-slate-200"><MessageCircle size={18} /><span>Support available Monday–Friday, 9am–6pm IST</span></div>
          </div>
        </div>
      </section>

      {submitted ? (
        <div className="glass p-10 rounded-[32px] text-center space-y-4 border border-white/10">
          <p className="text-sky-300 uppercase tracking-[0.3em] text-xs">Submitted</p>
          <h2 className="text-3xl font-bold text-white">Thank you for reaching out!</h2>
          <p className="text-slate-300">We’ve received your message and will reply within one business day.</p>
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr]">
          <div className="glass p-8 rounded-[36px] border border-white/10">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm text-slate-300">Name</span>
                  <input value={form.name} onChange={e => update('name', e.target.value)} placeholder="John Doe" className="input" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-slate-300">Email</span>
                  <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@email.com" className="input" />
                </label>
              </div>
              <label className="space-y-2">
                <span className="text-sm text-slate-300">Company</span>
                <input value={form.company} onChange={e => update('company', e.target.value)} placeholder="Acme Corp" className="input" />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-slate-300">Subject</span>
                <input value={form.subject} onChange={e => update('subject', e.target.value)} placeholder="Request for premium support" className="input" />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-slate-300">Message</span>
                <textarea rows={6} value={form.message} onChange={e => update('message', e.target.value)} placeholder="Tell us what you need..." className="input resize-none" />
              </label>
              <button type="submit" className="btn-primary w-full py-3">Send message</button>
            </form>
          </div>
          <div className="glass p-8 rounded-[36px] border border-white/10 space-y-6">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-sky-300">FAQ quick links</p>
              <h2 className="mt-4 text-3xl font-extrabold text-white">Need answers fast?</h2>
            </div>
            <div className="space-y-3">
              {[
                'How do I compare files with different column orders?',
                'Can I merge 80+ files in one session?',
                'Do you support custom automation workflows?',
                'Is my data processed securely in the browser?',
              ].map(item => (
                <div key={item} className="glass p-4 rounded-3xl text-sm text-slate-300">{item}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
