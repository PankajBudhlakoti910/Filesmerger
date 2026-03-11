import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { BarChart3, GitCompare, Merge, Lightbulb, LogIn, LogOut, Shield, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { logOut }  from '../../services/authService'

export default function Layout() {
  const { user, admin } = useAuth()
  const location        = useLocation()
  const navigate        = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => { await logOut(); navigate('/') }

  const navLinks = [
    { to: '/compare', label: 'Compare',    icon: GitCompare },
    { to: '/merge',   label: 'File Merger', icon: Merge },
    { to: '/request', label: 'Custom Tool', icon: Lightbulb },
    ...(admin ? [{ to: '/admin', label: 'Admin', icon: Shield }] : []),
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg transition-shadow" style={{background:'linear-gradient(135deg,#0ea5e9,#8b5cf6)'}}>
              <BarChart3 size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              Data<span className="text-sky-400">Forge</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150
                  ${isActive(to) ? 'bg-sky-500/15 text-sky-400' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}>
                <Icon size={15} />{label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {user.photoURL && <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full ring-2 ring-sky-500/30" />}
                <span className="text-sm text-slate-400 max-w-[120px] truncate">{user.displayName || user.email}</span>
                <button onClick={handleLogout} className="btn-ghost text-sm py-2 px-3"><LogOut size={14} />Sign out</button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm py-2"><LogIn size={14} />Sign in</Link>
            )}
          </div>

          <button className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5" onClick={() => setMobileOpen(o => !o)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 bg-slate-950/95 px-4 py-3 space-y-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${isActive(to) ? 'bg-sky-500/15 text-sky-400' : 'text-slate-400 hover:text-slate-200'}`}>
                <Icon size={15} />{label}
              </Link>
            ))}
            {user
              ? <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-slate-400"><LogOut size={15} />Sign out</button>
              : <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-sky-400"><LogIn size={15} />Sign in</Link>
            }
          </div>
        )}
      </header>

      <main className="flex-1"><Outlet /></main>

      <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-600">
        DataForge · Built with React + Firebase · {new Date().getFullYear()}
      </footer>
    </div>
  )
}
