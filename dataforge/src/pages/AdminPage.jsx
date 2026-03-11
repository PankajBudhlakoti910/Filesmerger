import { useState, useEffect, useCallback } from 'react'
import {
  Users, Eye, GitCompare, Upload, Activity,
  RefreshCw, Shield, TrendingUp, Calendar,
} from 'lucide-react'
import {
  fetchGlobalTotals,
  fetchDailyStats,
  fetchRecentActivity,
  fetchUniqueSessions,
} from '../services/analyticsService'
import { useAuth } from '../hooks/useAuth'

function StatCard({ icon: Icon, label, value, color = 'border-t-brand-500', loading = false }) {
  return (
    <div className={`stat-card border-t-2 ${color}`}>
      <div className="flex items-start justify-between">
        <div>
          {loading
            ? <div className="skeleton h-8 w-20 mb-2" />
            : <p className="text-3xl font-bold font-mono text-white">{value}</p>}
          <p className="text-xs text-slate-400 mt-1">{label}</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
          <Icon size={16} className="text-slate-400" />
        </div>
      </div>
    </div>
  )
}

function ActivityRow({ item }) {
  const isComparison = item.type === 'comparison'
  const time = item.timestamp?.toDate
    ? item.timestamp.toDate().toLocaleString()
    : '—'

  return (
    <tr className="hover:bg-white/5 transition-colors">
      <td className="px-4 py-3">
        <span className={`badge ${isComparison ? 'badge-brand' : 'badge-green'}`}>
          {isComparison ? <GitCompare size={10} /> : <Upload size={10} />}
          {item.type}
        </span>
      </td>
      <td className="px-4 py-3 text-slate-300 text-sm">
        {isComparison
          ? `${item.file1Name} ↔ ${item.file2Name}`
          : item.fileName ?? '—'}
      </td>
      <td className="px-4 py-3 text-slate-400 text-sm font-mono text-xs">
        {item.sessionId?.slice(0, 12)}…
      </td>
      <td className="px-4 py-3 text-slate-500 text-xs">{time}</td>
    </tr>
  )
}

export default function AdminPage() {
  const { user } = useAuth()

  const [totals,   setTotals]   = useState(null)
  const [sessions, setSessions] = useState(null)
  const [daily,    setDaily]    = useState([])
  const [activity, setActivity] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [lastRefresh, setLastRefresh] = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const [t, s, d, a] = await Promise.all([
      fetchGlobalTotals(),
      fetchUniqueSessions(),
      fetchDailyStats(14),
      fetchRecentActivity(30),
    ])
    setTotals(t)
    setSessions(s)
    setDaily(d)
    setActivity(a)
    setLastRefresh(new Date())
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
            <Shield size={28} className="text-accent-violet" />
            Admin Dashboard
          </h1>
          <p className="text-slate-400 mt-1">
            Signed in as <span className="text-slate-200 font-medium">{user?.email}</span>
            {lastRefresh && (
              <span className="ml-3 text-xs text-slate-600">
                Last updated {lastRefresh.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={fetchAll}
          disabled={loading}
          className="btn-ghost"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up">
        <StatCard icon={Eye}        label="Total Visits"       value={totals?.totalVisits?.toLocaleString() ?? '—'}       color="border-t-brand-500"        loading={loading} />
        <StatCard icon={Users}      label="Unique Sessions"    value={sessions?.toLocaleString() ?? '—'}                  color="border-t-accent-green"     loading={loading} />
        <StatCard icon={GitCompare} label="Total Comparisons"  value={totals?.totalComparisons?.toLocaleString() ?? '—'}  color="border-t-accent-violet"    loading={loading} />
        <StatCard icon={Upload}     label="Total Uploads"      value={totals?.totalUploads?.toLocaleString() ?? '—'}      color="border-t-accent-amber"     loading={loading} />
      </div>

      {/* Daily stats */}
      <div className="glass p-6 space-y-4 animate-fade-up anim-delay-100">
        <div className="flex items-center gap-2 text-white font-semibold">
          <Calendar size={16} className="text-brand-500" />
          Last 14 Days
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-8 rounded-lg" />
            ))}
          </div>
        ) : daily.length === 0 ? (
          <p className="text-slate-500 text-sm">No data yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="df-table min-w-full">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Visits</th>
                  <th>Comparisons</th>
                  <th>Uploads</th>
                  <th>Activity bar</th>
                </tr>
              </thead>
              <tbody>
                {[...daily].sort((a, b) => b.date.localeCompare(a.date)).map((day) => {
                  const maxVal = Math.max(...daily.map(d => d.visits), 1)
                  const pct    = ((day.visits / maxVal) * 100).toFixed(0)
                  return (
                    <tr key={day.date}>
                      <td className="font-mono text-xs">{day.date}</td>
                      <td>{day.visits ?? 0}</td>
                      <td>{day.comparisons ?? 0}</td>
                      <td>{day.uploads ?? 0}</td>
                      <td className="w-40">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-white/5 rounded-full h-1.5">
                            <div
                              className="bg-brand-500 h-1.5 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500 w-6">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Activity log */}
      <div className="glass p-6 space-y-4 animate-fade-up anim-delay-200">
        <div className="flex items-center gap-2 text-white font-semibold">
          <Activity size={16} className="text-accent-amber" />
          Recent Activity (last 30 events)
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="skeleton h-10 rounded-lg" />
            ))}
          </div>
        ) : activity.length === 0 ? (
          <p className="text-slate-500 text-sm">No activity logged yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="df-table min-w-full">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Details</th>
                  <th>Session</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {activity.map(item => (
                  <ActivityRow key={item.id} item={item} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admin info */}
      <div className="glass-darker p-5 rounded-xl text-xs text-slate-500 space-y-1">
        <p>🔒 This page is only visible to admin emails defined in <code className="font-mono bg-white/5 px-1 rounded">VITE_ADMIN_EMAILS</code>.</p>
        <p>📦 Data is stored in Firestore collections: <code className="font-mono bg-white/5 px-1 rounded">visits</code>, <code className="font-mono bg-white/5 px-1 rounded">daily_stats</code>, <code className="font-mono bg-white/5 px-1 rounded">totals</code>, <code className="font-mono bg-white/5 px-1 rounded">activity_log</code>.</p>
        <p>🌐 File contents are never stored — only metadata (name, size, row count) is tracked.</p>
      </div>
    </div>
  )
}
