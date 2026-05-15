import { Link } from 'react-router-dom'
import { ShieldCheck, Globe, Award, Sparkles, Cpu, Layers, Shield, Lock, Clock, Users } from 'lucide-react'

const values = [
  { icon: Sparkles, title: 'Intelligent data workflows', desc: 'Transform raw files into ready-to-use insights with polished automation and UI-first tools.' },
  { icon: Globe, title: 'Browser-first experience', desc: 'All processing runs locally in the browser so your data stays private and fast without uploads.' },
  { icon: ShieldCheck, title: 'Trusted by teams', desc: 'Built for auditors, finance, operations and analytics teams that need reliable outputs.' },
]

const industries = [
  'Finance & accounting',
  'Tax & compliance',
  'Retail & inventory',
  'Healthcare operations',
  'Logistics & supply chain',
  'Enterprise analytics',
]

const stack = [
  { icon: Cpu, title: 'React + Vite', desc: 'Modern frontend framework for speed and smooth interactions.' },
  { icon: Layers, title: 'Tailwind CSS', desc: 'Utility-first styling for consistent dark enterprise UI.' },
  { icon: Shield, title: 'Firebase Auth + Firestore', desc: 'Secure authentication and flexible data storage for admin and request flows.' },
  { icon: Lock, title: 'Client-side parsing', desc: 'Data is parsed locally in the browser, reducing risk and improving performance.' },
]

const security = [
  { title: 'Built for privacy', detail: 'Data files are handled in-browser with zero remote upload unless the user explicitly submits a request.' },
  { title: 'Secure authentication', detail: 'Firebase Auth protects access to admin and request workflows with session-aware controls.' },
  { title: 'Enterprise reliability', detail: 'Glassmorphic dashboards with polished interactions and clear status feedback.' },
  { title: 'Audit-ready controls', detail: 'Action flows, custom tool requests, and user sessions are all tracked with analytics and validation.' },
]

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-16">
      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] items-center">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-[0.22em] text-sky-300 bg-sky-500/10">
            <Award size={14} /> About DataForge
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white">From utility dashboard to complete enterprise data automation.</h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-300">DataForge helps businesses compare, merge and cleanse file-based datasets in a sleek browser-first experience. We combine secure client-side processing with polished SaaS design to deliver confidence in every report.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="glass p-6">
              <p className="text-sm text-slate-400">Founded to simplify data-intensive processes, our mission is to create tools for data teams who need fast, reliable file automation without the complexity.</p>
            </div>
            <div className="glass p-6">
              <p className="text-sm text-slate-400">From accountants to operations teams, our platform is designed for teams that need practical data workflows and enterprise-grade polish.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/services" className="btn-primary">Explore services</Link>
            <Link to="/contact" className="btn-ghost">Talk to us</Link>
          </div>
        </div>
        <div className="glass p-8 rounded-[36px] border border-white/10 shadow-2xl shadow-slate-950/20">
          <div className="p-6 rounded-[32px] bg-slate-950/80 border border-slate-700/70">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Who we are</p>
            <h2 className="mt-3 text-3xl font-bold text-white">A product-led team building trusted data tools for modern businesses.</h2>
            <p className="mt-4 text-slate-300 leading-relaxed">Our focus is on enterprise-grade design, powerful file operations, and browser-based performance so teams can move faster without compromising security.</p>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <div className="grid gap-4 lg:grid-cols-3">
          {values.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass p-6 rounded-[28px] hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-sky-500/10 text-sky-300 mb-4"><Icon size={20} /></div>
              <h3 className="text-xl font-semibold text-white">{title}</h3>
              <p className="mt-3 text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.24em] text-sky-300">Mission</p>
          <h2 className="text-3xl font-extrabold text-white">Deliver business-grade data tools with clarity and speed.</h2>
          <p className="text-slate-300 leading-7">We are committed to building software that removes friction from CSV/Excel workflows, letting professionals compare, merge, and act on data in one polished platform.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {industries.map(item => (
              <div key={item} className="glass p-4 text-sm text-slate-300">• {item}</div>
            ))}
          </div>
        </div>
        <div className="grid gap-4">
          <div className="glass p-6">
            <p className="text-sm text-slate-400 uppercase tracking-[0.18em]">Technology stack</p>
            <div className="mt-5 grid gap-4">
              {stack.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-slate-900 flex items-center justify-center text-sky-300"><Icon size={18} /></div>
                  <div>
                    <p className="font-semibold text-white">{title}</p>
                    <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass p-6">
            <p className="text-sm text-slate-400 uppercase tracking-[0.18em]">Security & reliability</p>
            <div className="mt-5 space-y-4">
              {security.map(item => (
                <div key={item.title} className="space-y-1">
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="text-sm text-slate-400">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
