import { Link } from 'react-router-dom'
import { BarChart3, Mail, Github, Linkedin, Twitter, Heart } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-700/50 bg-gradient-to-b from-slate-900/50 to-slate-950 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {/* Main footer content */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" 
                   style={{background:'linear-gradient(135deg,#0ea5e9,#8b5cf6)'}}>
                <BarChart3 size={16} className="text-white" />
              </div>
              <span className="font-bold text-white">
                Data<span className="text-sky-400">Forge</span>
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Smart data processing & automation platform for modern teams.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-slate-400 hover:text-sky-400">
                <Github size={16} />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-slate-400 hover:text-sky-400">
                <Linkedin size={16} />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-slate-400 hover:text-sky-400">
                <Twitter size={16} />
              </a>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Product</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/features" className="text-slate-400 hover:text-sky-400 transition-colors">Features</Link></li>
              <li><Link to="/services" className="text-slate-400 hover:text-sky-400 transition-colors">Services</Link></li>
              <li><a href="#pricing" className="text-slate-400 hover:text-sky-400 transition-colors">Pricing</a></li>
              <li><a href="#changelog" className="text-slate-400 hover:text-sky-400 transition-colors">Changelog</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-slate-400 hover:text-sky-400 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-slate-400 hover:text-sky-400 transition-colors">Contact</Link></li>
              <li><Link to="/feedback" className="text-slate-400 hover:text-sky-400 transition-colors">Feedback</Link></li>
              <li><a href="#careers" className="text-slate-400 hover:text-sky-400 transition-colors">Careers</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#docs" className="text-slate-400 hover:text-sky-400 transition-colors">Documentation</a></li>
              <li><a href="#guides" className="text-slate-400 hover:text-sky-400 transition-colors">Guides</a></li>
              <li><a href="#api" className="text-slate-400 hover:text-sky-400 transition-colors">API</a></li>
              <li><a href="#support" className="text-slate-400 hover:text-sky-400 transition-colors">Support</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#privacy" className="text-slate-400 hover:text-sky-400 transition-colors">Privacy</a></li>
              <li><a href="#terms" className="text-slate-400 hover:text-sky-400 transition-colors">Terms</a></li>
              <li><a href="#cookies" className="text-slate-400 hover:text-sky-400 transition-colors">Cookies</a></li>
              <li><a href="#security" className="text-slate-400 hover:text-sky-400 transition-colors">Security</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700/30 py-8">
          {/* Bottom footer */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © {currentYear} DataForge. All rights reserved.
            </p>
            
            <p className="text-sm text-slate-500 flex items-center gap-1">
              Made with <Heart size={14} className="text-rose-500" /> for data enthusiasts
            </p>

            <p className="text-xs text-slate-600">
              v1.0.0 · Privacy-First · Browser-Based Processing
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
