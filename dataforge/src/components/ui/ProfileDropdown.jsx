import { useState, useRef, useEffect } from 'react'
import { LogOut, Edit2, User, ChevronDown } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { logOut } from '../../services/authService'
import { useNavigate } from 'react-router-dom'

export default function ProfileDropdown({ onProfileEdit }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleLogout = async () => {
    setOpen(false)
    await logOut()
    navigate('/')
  }

  if (!user) return null

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 
                   border border-white/10 transition-all duration-200"
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full ring-1 ring-sky-500/30" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-sky-500/20 flex items-center justify-center">
            <User size={12} className="text-sky-400" />
          </div>
        )}
        <span className="text-sm text-slate-300 max-w-[100px] truncate hidden sm:inline">
          {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
        </span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50
                        animate-fade-in">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-700/50">
            <p className="text-sm font-semibold text-slate-200">{user.displayName || 'User'}</p>
            <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
          </div>

          {/* Menu items */}
          <div className="py-2">
            <button
              onClick={() => {
                setOpen(false)
                onProfileEdit?.()
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 
                         hover:bg-white/5 transition-colors duration-150"
            >
              <Edit2 size={14} className="text-sky-400" />
              Edit Profile
            </button>
            <div className="my-1 border-t border-slate-700/50" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-400 
                         hover:bg-rose-500/10 transition-colors duration-150"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
