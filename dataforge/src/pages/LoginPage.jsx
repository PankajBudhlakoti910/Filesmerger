import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogIn, Mail, Lock, Eye, EyeOff, AlertTriangle, CheckCircle, Zap, GitCompare, Merge, PieChart, Layers, ArrowRight, BarChart3 } from 'lucide-react'
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../services/authService'
import { useAuth } from '../hooks/useAuth'

const features = [
  { icon: GitCompare, label: 'File Comparison', desc: 'Compare multiple datasets instantly' },
  { icon: Merge, label: 'File Merger', desc: 'Merge up to 80 files seamlessly' },
  { icon: PieChart, label: 'Pivot Analysis', desc: 'Build powerful pivot tables' },
  { icon: Layers, label: 'Auto Mapping', desc: 'Intelligent column alignment' },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [mode,     setMode]     = useState('signin') // 'signin' | 'signup'
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  if (user) { navigate('/compare'); return null }

  const handleGoogle = async () => {
    setLoading(true); setError('')
    try {
      await signInWithGoogle()
      navigate('/compare')
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  const handleEmail = async (e) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true); setError('')
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password)
      } else {
        await signUpWithEmail(email, password)
      }
      navigate('/compare')
    } catch (e) {
      setError(e.message.replace('Firebase: ', '').replace(/\(auth\/.*\)/, '').trim())
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 gap-0">
      {/* Left side - Branding */}
      <div className="hidden lg:flex flex-col justify-between p-8 bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-violet-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          {/* Logo & Branding */}
          <Link to="/" className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" 
                 style={{background:'linear-gradient(135deg,#0ea5e9,#8b5cf6)'}}>
              <BarChart3 size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                <span className="text-white">Data</span><span className="text-sky-400">Forge</span>
              </h1>
              <p className="text-xs text-slate-400">Data Processing Made Simple</p>
            </div>
          </Link>

          {/* Main tagline */}
          <div className="space-y-6">
            <div>
              <h2 className="text-4xl font-bold text-white mb-3 leading-tight">
                Smart Data Processing & Automation Platform
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed">
                Process, compare, and merge your data files with powerful tools built for modern teams.
              </p>
            </div>

            {/* Features grid */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              {features.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="group">
                  <div className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-sky-500/30
                                  rounded-xl p-4 transition-all duration-300 cursor-default">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-sky-500/20 flex items-center justify-center flex-shrink-0
                                      group-hover:bg-sky-500/30 transition-colors">
                        <Icon size={18} className="text-sky-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white text-sm">{label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 grid grid-cols-3 gap-4 pt-8">
          <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-400">Files Merged</p>
            <p className="text-2xl font-bold text-sky-400 mt-1">80+</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-400">Privacy</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">100%</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-400">Speed</p>
            <p className="text-2xl font-bold text-violet-400 mt-1">Real-time</p>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex flex-col justify-center items-center px-4 sm:px-6 py-12 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="w-full max-w-sm space-y-6 animate-fade-up">
          {/* Header */}
          <div className="text-center space-y-2 lg:text-left">
            <div className="flex items-center gap-2 lg:hidden justify-center">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:'linear-gradient(135deg,#0ea5e9,#8b5cf6)'}}>
                <BarChart3 size={16} className="text-white" />
              </div>
              <span className="font-bold text-white">DataForge</span>
            </div>
            <div className="lg:mt-4">
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">
                {mode === 'signin' ? 'Welcome back' : 'Create account'}
              </h1>
              <p className="text-sm text-slate-400">
                {mode === 'signin' ? 'Sign in to access DataForge' : 'Start comparing files today'}
              </p>
            </div>
          </div>

          {/* Form card */}
          <div className="space-y-6">
            {/* Error message */}
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 flex items-start gap-3 text-rose-400 text-sm animate-fade-in">
                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Google Sign In */}
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full btn-ghost py-3 border-slate-700 hover:border-slate-600 disabled:opacity-50 justify-center"
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-700" />
              <span className="text-xs text-slate-500">or</span>
              <div className="flex-1 h-px bg-slate-700" />
            </div>

            {/* Email form */}
            <form onSubmit={handleEmail} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-300">Password</label>
                  {mode === 'signin' && (
                    <button type="button" className="text-xs text-sky-400 hover:text-sky-300 transition-colors">
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              {mode === 'signin' && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  <span className="text-sm text-slate-400">Remember me</span>
                </label>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full btn-primary py-3 justify-center disabled:opacity-50 mt-6"
              >
                {loading ? (
                  <>
                    <span className="inline-block animate-spin">⏳</span>
                    {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  <>
                    <LogIn size={16} />
                    {mode === 'signin' ? 'Sign in' : 'Create account'}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Mode toggle */}
          <p className="text-center text-sm text-slate-400">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError('') }}
              className="text-sky-400 hover:text-sky-300 font-semibold transition-colors"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>

          {/* Terms */}
          <p className="text-xs text-slate-500 text-center">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
