import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { BarChart3, GitCompare, Merge, Lightbulb, LogIn, LogOut, Shield, Menu, X, Home, Layers, Info, MessageSquare, Mail, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { logOut }  from '../../services/authService'
import ProfileDropdown from '../ui/ProfileDropdown'
import ProfileModal from '../ui/ProfileModal'

export default function Layout() {
  const { user, admin } = useAuth()
  const location        = useLocation()
  const navigate        = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)

  const handleLogout = async () => { await logOut(); navigate('/') }

  const siteLinks = [
    { to: '/',          label: 'Home',     icon: Home },
    { to: '/features',  label: 'Features', icon: BarChart3 },
    { to: '/services',  label: 'Services', icon: Layers },
    { to: '/about',     label: 'About',    icon: Info },
    { to: '/feedback',  label: 'Feedback', icon: MessageSquare },
    { to: '/contact',   label: 'Contact',  icon: Mail },
  ]

  const toolLinks = [
    { to: '/compare', label: 'Compare',    icon: GitCompare },
    { to: '/merge',   label: 'File Merger', icon: Merge },
    { to: '/request', label: 'Custom Tool', icon: Lightbulb },
    ...(admin ? [{ to: '/admin', label: 'Admin', icon: Shield }] : []),
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2.5 group flex-shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shadow-lg transition-shadow flex-shrink-0" style={{background:'linear-gradient(135deg,#0ea5e9,#8b5cf6)'}}>
              <BarChart3 size={14} className="text-white sm:hidden" />
              <BarChart3 size={16} className="text-white hidden sm:block" />
            </div>
            <span className="font-bold text-sm sm:text-lg tracking-tight text-white whitespace-nowrap">
              Data<span className="text-sky-400">Forge</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1 pb-0">
            {siteLinks.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl text-xs sm:text-sm font-medium transition-all duration-150 whitespace-nowrap
                  ${isActive(to) ? 'bg-sky-500/15 text-sky-300' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}>
                <Icon size={14} className="hidden sm:block" />
                <Icon size={13} className="sm:hidden" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-1.5 sm:gap-2">
            {toolLinks.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to}
                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-150 whitespace-nowrap">
                <Icon size={13} />{label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {user ? (
              <>
                <ProfileDropdown onProfileEdit={() => setProfileModalOpen(true)} />
                <ProfileModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
              </>
            ) : (
              <Link to="/login" className="btn-primary text-xs sm:text-sm py-1.5 sm:py-2"><LogIn size={13} />Sign in</Link>
            )}
          </div>

          <button className="lg:hidden p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 flex-shrink-0" onClick={() => setMobileOpen(o => !o)}>
            {mobileOpen ? <X size={18} className="sm:hidden" /> : <Menu size={18} className="sm:hidden" />}
            {mobileOpen ? <X size={20} className="hidden sm:block" /> : <Menu size={20} className="hidden sm:block" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-white/10 bg-slate-950/95 px-3 sm:px-4 py-2.5 sm:py-3 space-y-1.5 sm:space-y-2 max-h-[calc(100vh-56px)] sm:max-h-[calc(100vh-64px)] overflow-y-auto">
            <div className="grid gap-1">
              {siteLinks.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all
                    ${isActive(to) ? 'bg-sky-500/15 text-sky-400' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}>
                  <Icon size={15} />{label}
                </Link>
              ))}
            </div>
            <div className="grid gap-1 pt-1.5 sm:pt-2 border-t border-white/10">
              {toolLinks.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all">
                  <Icon size={15} />{label}
                </Link>
              ))}
            </div>
            {user
              ? <button onClick={() => { handleLogout(); setMobileOpen(false) }}
                  className="w-full flex items-center justify-center gap-2 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm text-rose-400 bg-white/5 hover:bg-rose-500/10 transition-all">
                  <LogOut size={15} /> Sign out
                </button>
              : <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center justify-center gap-2 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm text-sky-300 bg-slate-900 hover:bg-white/10 transition-all w-full">
                  <LogIn size={15} />Sign in
                </Link>
            }
          </div>
        )}
      </header>

      <main className="flex-1 pt-14 sm:pt-16 lg:pt-20"><Outlet /></main>

      <footer className="border-t border-white/5 bg-slate-950/90 py-8 sm:py-10 text-slate-300">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{background:'linear-gradient(135deg,#0ea5e9,#8b5cf6)'}}>
                <BarChart3 size={16} className="text-white sm:hidden" />
                <BarChart3 size={18} className="text-white hidden sm:block" />
              </div>
              <div className="min-w-0">
                <p className="text-base sm:text-lg font-semibold text-white">DataForge</p>
                <p className="text-xs sm:text-sm text-slate-400">Enterprise data automation tools.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-2 text-xs sm:text-sm text-slate-400">
            <p className="font-semibold text-slate-100">Product</p>
            <Link className="footer-link" to="/compare">Compare</Link>
            <Link className="footer-link" to="/merge">File Merger</Link>
            <Link className="footer-link" to="/request">Custom Tool</Link>
            <Link className="footer-link" to="/feedback">Feedback</Link>
          </div>

          <div className="grid gap-2 text-xs sm:text-sm text-slate-400">
            <p className="font-semibold text-slate-100">Company</p>
            <Link className="footer-link" to="/about">About Us</Link>
            <Link className="footer-link" to="/services">Services</Link>
            <Link className="footer-link" to="/contact">Contact</Link>
            <Link className="footer-link" to="/login">Sign in</Link>
          </div>

          <div className="grid gap-2 text-xs sm:text-sm text-slate-400">
            <p className="font-semibold text-slate-100">Legal</p>
            <button className="footer-link">Privacy Policy</button>
            <button className="footer-link">Terms</button>
            <p className="text-xs text-slate-500 pt-2">v1.0.0 · {new Date().getFullYear()}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
