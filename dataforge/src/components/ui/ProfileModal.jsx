import { useState } from 'react'
import { X, Camera, User } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function ProfileModal({ isOpen, onClose }) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    organization: localStorage.getItem('user_organization') || '',
    role: localStorage.getItem('user_role') || 'User',
  })
  const [loading, setLoading] = useState(false)

  if (!isOpen || !user) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Save to localStorage for now (in production, update Firebase user profile)
      localStorage.setItem('user_organization', formData.organization)
      localStorage.setItem('user_role', formData.role)
      setTimeout(() => {
        setLoading(false)
        onClose()
      }, 500)
    } catch (error) {
      console.error('Failed to update profile:', error)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full
                      animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <User size={18} className="text-sky-400" />
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Profile Picture */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300">Profile Picture</label>
            <div className="flex items-center gap-4">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-16 h-16 rounded-xl ring-2 ring-sky-500/30" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-sky-500/20 flex items-center justify-center">
                  <User size={24} className="text-sky-400" />
                </div>
              )}
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10
                           border border-white/10 text-sm text-slate-300 transition-colors"
              >
                <Camera size={14} />
                Upload
              </button>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Full Name</label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              className="input"
            />
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="input opacity-60 cursor-not-allowed"
            />
          </div>

          {/* Organization */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Organization</label>
            <input
              type="text"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              placeholder="e.g., Acme Corp"
              className="input"
            />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input"
            >
              <option value="User">User</option>
              <option value="Data Analyst">Data Analyst</option>
              <option value="Developer">Developer</option>
              <option value="Manager">Manager</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
              <p className="text-xs text-slate-400 mb-1">Files Processed</p>
              <p className="text-lg font-semibold text-sky-400">0</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
              <p className="text-xs text-slate-400 mb-1">Operations</p>
              <p className="text-lg font-semibold text-violet-400">0</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
