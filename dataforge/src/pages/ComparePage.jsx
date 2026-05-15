import { useState, useMemo, useCallback, useRef } from 'react'
import {
  GitCompare, Play, Download, RotateCcw, CheckCircle,
  AlertTriangle, Minus, Upload, X, FileSpreadsheet,
  Plus, ArrowRight, Link2, Link2Off, Info, Cloud,
  HardDrive, ChevronDown, ChevronUp, Settings,
  Filter, RefreshCw, Eye, Table, BarChart2, Layers,
  Shield, Database, Wifi, WifiOff, Search, Trash2,
  Copy, ExternalLink, AlertCircle, Loader
} from 'lucide-react'
import { parseFile, exportToCSV, exportToExcel, formatFileSize } from '../utils/fileParser'
import { trackUpload, trackComparison } from '../services/analyticsService'
import { useAuth } from '../hooks/useAuth'

// ── Normalize column name ──────────────────────────────────────────────────
function normCol(c) {
  return String(c).trim().toLowerCase().replace(/[^a-z0-9]+/g, '').trim()
}

// ── Normalize cell value for matching ─────────────────────────────────────
function normVal(v) {
  return String(v ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

// ── Fuzzy similarity (0–100) for category/column auto-mapping ─────────────
function similarity(a, b) {
  if (!a || !b) return 0
  a = normCol(a); b = normCol(b)
  if (a === b) return 100
  if (a.includes(b) || b.includes(a)) return 90
  const sa = new Set(a), sb = new Set(b)
  const inter = [...sa].filter(x => sb.has(x)).length
  const union = new Set([...sa, ...sb]).size
  const jac = (inter / union) * 100
  const ls = (1 - Math.abs(a.length - b.length) / Math.max(a.length, b.length)) * 20
  return Math.min(100, jac + ls)
}

// ── Core compare logic (preserves BOTH sides) ─────────────────────────────
function runComparison(data1, data2, keyCol1, keyCol2, colMap, direction = 'f1_to_f2') {
  const map1 = new Map()
  const map2 = new Map()

  data1.forEach(row => {
    const k = normVal(row[keyCol1])
    if (k) map1.set(k, row)
  })
  data2.forEach(row => {
    const k = normVal(row[keyCol2])
    if (k) map2.set(k, row)
  })

  const matched = [], onlyIn1 = [], onlyIn2 = []

  map1.forEach((row1, key) => {
    if (map2.has(key)) {
      const row2 = map2.get(key)
      const diffs = {}
      let hasDiff = false
      colMap.forEach(({ col1, col2, target }) => {
        const v1 = normVal(row1[col1])
        const v2 = normVal(row2[col2])
        if (v1 !== v2) { diffs[target] = { file1: row1[col1], file2: row2[col2] }; hasDiff = true }
      })
      const out = {
        _key: row1[keyCol1],
        _hasDiff: hasDiff,
        _diffs: diffs,
        _status: hasDiff ? 'MATCHED_WITH_DIFF' : 'MATCHED',
        _missingFrom: '-'
      }
      colMap.forEach(({ col1, col2, target }) => {
        out[`f1_${target}`] = row1[col1] ?? ''
        out[`f2_${target}`] = row2[col2] ?? ''
        out[`diff_${target}`] = (normVal(row1[col1]) !== normVal(row2[col2]))
          ? `${row1[col1] ?? ''} ≠ ${row2[col2] ?? ''}` : ''
      })
      matched.push(out)
    } else {
      // Present in File 1 only – keep File 2 columns as explicit empty (not dropped)
      const out = {
        _key: row1[keyCol1],
        _hasDiff: false,
        _diffs: {},
        _status: 'FILE1_ONLY',
        _missingFrom: 'File 2'
      }
      colMap.forEach(({ col1, col2, target }) => {
        out[`f1_${target}`] = row1[col1] ?? ''
        out[`f2_${target}`] = ''   // explicit empty – File 2 missing
        out[`diff_${target}`] = ''
      })
      onlyIn1.push(out)
    }
  })

  map2.forEach((row2, key) => {
    if (!map1.has(key)) {
      // Present in File 2 only – keep File 1 columns as explicit empty
      const out = {
        _key: row2[keyCol2],
        _hasDiff: false,
        _diffs: {},
        _status: 'FILE2_ONLY',
        _missingFrom: 'File 1'
      }
      colMap.forEach(({ col1, col2, target }) => {
        out[`f1_${target}`] = ''   // explicit empty – File 1 missing
        out[`f2_${target}`] = row2[col2] ?? ''
        out[`diff_${target}`] = ''
      })
      onlyIn2.push(out)
    }
  })

  const totalUnique1 = map1.size
  const matchPct = totalUnique1 ? ((matched.length / totalUnique1) * 100).toFixed(1) : '0'

  return {
    matched, onlyIn1, onlyIn2,
    summary: {
      total1: data1.length, total2: data2.length,
      uniqueKeys1: map1.size, uniqueKeys2: map2.size,
      matched: matched.length, onlyIn1: onlyIn1.length, onlyIn2: onlyIn2.length,
      diffCount: matched.filter(r => r._hasDiff).length,
      matchPct,
      direction
    }
  }
}

// ── Azure CORS-safe blob listing (client-side) ─────────────────────────────
async function azureListBlobs(account, container, sasToken) {
  // Append required query params if not already present
  const base = `https://${account}.blob.core.windows.net/${container}`
  const sep = sasToken.startsWith('?') ? '' : '?'
  const url = `${base}${sep}${sasToken}&restype=container&comp=list&maxresults=200`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Azure error ${res.status}: ${res.statusText}`)
  const text = await res.text()
  const parser = new DOMParser()
  const xml = parser.parseFromString(text, 'application/xml')
  const blobs = [...xml.querySelectorAll('Blob Name')].map(n => n.textContent)
  return blobs.filter(b => /\.(csv|xlsx|xls)$/i.test(b))
}

async function azureDownloadBlob(account, container, blobName, sasToken) {
  const sep = sasToken.startsWith('?') ? '' : '?'
  const url = `https://${account}.blob.core.windows.net/${container}/${encodeURIComponent(blobName)}${sep}${sasToken}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Cannot download ${blobName}: ${res.statusText}`)
  const blob = await res.blob()
  return new File([blob], blobName, { type: blob.type })
}

// ═══════════════════════════════════════════════════════════════════════════
// ── Sub-components ────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

// ── Status badge ──────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    MATCHED:          { label: 'Matched',       bg: 'rgba(16,185,129,0.15)', color: '#34d399', icon: '✓' },
    MATCHED_WITH_DIFF:{ label: 'Has Diffs',     bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', icon: '~' },
    FILE1_ONLY:       { label: 'File 1 Only',   bg: 'rgba(14,165,233,0.15)', color: '#38bdf8', icon: '1' },
    FILE2_ONLY:       { label: 'File 2 Only',   bg: 'rgba(139,92,246,0.15)', color: '#a78bfa', icon: '2' },
  }
  const s = map[status] || { label: status, bg: 'rgba(100,116,139,0.15)', color: '#94a3b8', icon: '?' }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.color }}>
      {s.icon} {s.label}
    </span>
  )
}

// ── MiniTable with pagination ──────────────────────────────────────────────
function MiniTable({ columns, rows, highlightDiffs = false, emptyMsg = 'No records.', showStatus = false }) {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const PAGE = 15

  const filtered = useMemo(() => {
    let r = rows
    if (searchTerm) {
      const s = searchTerm.toLowerCase()
      r = r.filter(row => Object.values(row).some(v => String(v ?? '').toLowerCase().includes(s)))
    }
    if (statusFilter !== 'all') r = r.filter(row => row._status === statusFilter)
    return r
  }, [rows, searchTerm, statusFilter])

  const totalPages = Math.ceil(filtered.length / PAGE)
  const slice = filtered.slice((page - 1) * PAGE, page * PAGE)
  const displayCols = columns.filter(c => !c.startsWith('_'))

  if (!rows.length) return (
    <div className="rounded-xl p-8 text-center text-slate-500 text-sm border border-white/5"
      style={{ background: 'rgba(15,23,42,0.5)' }}>
      <Database size={24} className="mx-auto mb-2 opacity-30" />
      {emptyMsg}
    </div>
  )

  const uniqueStatuses = [...new Set(rows.map(r => r._status).filter(Boolean))]

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[180px]"
          style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 12px' }}>
          <Search size={12} className="text-slate-500 flex-shrink-0" />
          <input value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1) }}
            placeholder="Search rows…"
            className="bg-transparent text-xs text-slate-200 placeholder-slate-600 outline-none w-full" />
          {searchTerm && <button onClick={() => setSearchTerm('')}><X size={11} className="text-slate-500 hover:text-slate-300" /></button>}
        </div>
        {showStatus && uniqueStatuses.length > 1 && (
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
            className="text-xs px-2 py-1.5 rounded-lg outline-none"
            style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}>
            <option value="all">All statuses</option>
            {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
        <span className="text-xs text-slate-500 ml-auto">{filtered.length.toLocaleString()} rows</span>
      </div>

      <div className="overflow-auto rounded-xl border border-white/8 max-h-80"
        style={{ background: 'rgba(8,14,30,0.8)' }}>
        <table className="min-w-full text-xs border-collapse">
          <thead className="sticky top-0 z-10"
            style={{ background: 'rgba(15,23,42,0.95)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <tr>
              {showStatus && <th className="px-3 py-2.5 text-left font-semibold text-slate-400 whitespace-nowrap">Status</th>}
              {displayCols.map(c => (
                <th key={c} className="px-3 py-2.5 text-left font-semibold text-slate-400 whitespace-nowrap">
                  {c.replace(/^f[12]_/, '').replace(/^diff_/, 'Δ ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((row, i) => (
              <tr key={i}
                className="border-b transition-colors"
                style={{
                  borderColor: 'rgba(255,255,255,0.04)',
                  background: highlightDiffs && row._hasDiff
                    ? 'rgba(245,158,11,0.04)'
                    : i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent'
                }}>
                {showStatus && (
                  <td className="px-3 py-2 whitespace-nowrap">
                    <StatusBadge status={row._status} />
                  </td>
                )}
                {displayCols.map(c => {
                  const colName = c.replace(/^f[12]_/, '')
                  const isDiff = highlightDiffs && row._diffs?.[colName]
                  const isF1 = c.startsWith('f1_')
                  const isF2 = c.startsWith('f2_')
                  const isEmpty = String(row[c] ?? '') === ''
                  return (
                    <td key={c}
                      className="px-3 py-2 whitespace-nowrap"
                      style={{
                        color: isDiff ? '#fbbf24'
                          : isEmpty && (isF1 || isF2) ? '#475569'
                          : isF1 ? '#7dd3fc'
                          : isF2 ? '#c4b5fd'
                          : '#cbd5e1',
                        fontWeight: isDiff ? 600 : 400,
                        fontStyle: isEmpty ? 'italic' : 'normal'
                      }}>
                      {isEmpty && (isF1 || isF2) ? '—' : String(row[c] ?? '')}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>Rows {(page - 1) * PAGE + 1}–{Math.min(page * PAGE, filtered.length).toLocaleString()} of {filtered.length.toLocaleString()}</span>
          <div className="flex gap-1">
            <button onClick={() => setPage(1)} disabled={page === 1}
              className="px-2 py-1 rounded transition-colors disabled:opacity-30"
              style={{ background: 'rgba(255,255,255,0.05)' }}>«</button>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-2 py-1 rounded transition-colors disabled:opacity-30"
              style={{ background: 'rgba(255,255,255,0.05)' }}>←</button>
            <span className="px-3 py-1 rounded font-mono"
              style={{ background: 'rgba(255,255,255,0.05)' }}>{page}/{totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-2 py-1 rounded transition-colors disabled:opacity-30"
              style={{ background: 'rgba(255,255,255,0.05)' }}>→</button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
              className="px-2 py-1 rounded transition-colors disabled:opacity-30"
              style={{ background: 'rgba(255,255,255,0.05)' }}>»</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── File Panel ─────────────────────────────────────────────────────────────
function FilePanel({ label, color, files, loading, onAdd, onRemove, inputId }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
        <p className="font-semibold text-white text-sm">{label}</p>
        <span className="text-xs text-slate-500 ml-auto">{files.length} file{files.length !== 1 ? 's' : ''}</span>
      </div>

      <div
        className="relative rounded-xl cursor-pointer transition-all group"
        style={{
          border: `1.5px dashed rgba(255,255,255,0.12)`,
          background: 'rgba(15,23,42,0.4)',
          padding: '20px'
        }}
        onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = color; e.currentTarget.style.background = 'rgba(15,23,42,0.7)' }}
        onDragLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.background = 'rgba(15,23,42,0.4)' }}
        onDrop={e => {
          e.preventDefault()
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
          e.currentTarget.style.background = 'rgba(15,23,42,0.4)'
          if (e.dataTransfer.files?.length) onAdd(e.dataTransfer.files)
        }}
        onClick={() => document.getElementById(inputId).click()}
      >
        <input id={inputId} type="file" multiple accept=".csv,.xlsx,.xls" className="hidden"
          onChange={e => { if (e.target.files?.length) { onAdd(e.target.files); e.target.value = '' } }} />
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center"
            style={{ background: `${color}18` }}>
            <Upload size={18} style={{ color }} />
          </div>
          <p className="text-sm font-medium text-slate-300">Drop files or click to browse</p>
          <p className="text-xs text-slate-600 mt-1">CSV · Excel (.xlsx/.xls) · Multiple files allowed</p>
          {loading && (
            <p className="text-xs mt-2 flex items-center justify-center gap-1.5" style={{ color }}>
              <Loader size={11} className="animate-spin" /> Parsing…
            </p>
          )}
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-1.5 max-h-44 overflow-y-auto pr-0.5">
          {files.map(({ file, parsed }, i) => (
            <div key={i} className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl transition-colors"
              style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2 min-w-0">
                <FileSpreadsheet size={13} style={{ color }} className="flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white truncate max-w-[150px] sm:max-w-[200px]">{file.name}</p>
                  <p className="text-xs text-slate-600">{formatFileSize(file.size)} · {parsed?.rowCount?.toLocaleString() ?? '…'} rows</p>
                </div>
              </div>
              <button onClick={() => onRemove(i)}
                className="p-1 rounded flex-shrink-0 transition-colors hover:text-rose-400 text-slate-600">
                <X size={13} />
              </button>
            </div>
          ))}
          <button onClick={() => document.getElementById(inputId).click()}
            className="text-xs py-1.5 w-full flex items-center justify-center gap-1.5 rounded-lg transition-colors"
            style={{ color: '#64748b', border: '1px dashed rgba(255,255,255,0.08)' }}>
            <Plus size={12} /> Add more files
          </button>
        </div>
      )}

      {files.length > 0 && (
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl"
          style={{ background: 'rgba(16,185,129,0.08)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>
          <CheckCircle size={12} />
          {files.reduce((a, f) => a + (f.parsed?.rowCount ?? 0), 0).toLocaleString()} total rows loaded
        </div>
      )}
    </div>
  )
}

// ── Azure Connection Panel ─────────────────────────────────────────────────
function AzurePanel({ side, label, color, onFileLoaded, inputId }) {
  const [account, setAccount] = useState('')
  const [container, setContainer] = useState('')
  const [sasToken, setSasToken] = useState('')
  const [authType, setAuthType] = useState('sas')  // 'sas' | 'key'
  const [accessKey, setAccessKey] = useState('')
  const [blobs, setBlobs] = useState([])
  const [selectedBlobs, setSelectedBlobs] = useState([])
  const [connecting, setConnecting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(null)

  const effectiveSas = authType === 'sas' ? sasToken : accessKey

  const handleConnect = async () => {
    if (!account.trim() || !container.trim() || !effectiveSas.trim()) {
      setError('Please fill in Account Name, Container, and SAS Token / Access Key.')
      return
    }
    setConnecting(true); setError(''); setBlobs([]); setSelectedBlobs([])
    try {
      const list = await azureListBlobs(account.trim(), container.trim(), effectiveSas.trim())
      if (!list.length) { setError('No CSV/Excel files found in this container.'); setConnecting(false); return }
      setBlobs(list)
      setConnected(true)
    } catch (e) {
      setError(`Connection failed: ${e.message}`)
    }
    setConnecting(false)
  }

  const handleLoadSelected = async () => {
    if (!selectedBlobs.length) { setError('Select at least one file.'); return }
    setLoading(true); setError('')
    try {
      const frames = []
      for (const blobName of selectedBlobs) {
        const file = await azureDownloadBlob(account.trim(), container.trim(), blobName, effectiveSas.trim())
        const parsed = await parseFile(file)
        frames.push({ file, parsed })
      }
      onFileLoaded(frames)
      setLoaded({ count: frames.length, rows: frames.reduce((a, f) => a + (f.parsed?.rowCount ?? 0), 0) })
    } catch (e) {
      setError(`Load failed: ${e.message}`)
    }
    setLoading(false)
  }

  const toggleBlob = (b) => setSelectedBlobs(p => p.includes(b) ? p.filter(x => x !== b) : [...p, b])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
        <p className="font-semibold text-white text-sm">{label} — Azure Blob Storage</p>
        {connected && <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
          style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399' }}>
          <Wifi size={10} className="inline mr-1" />Connected
        </span>}
      </div>

      {/* Auth type toggle */}
      <div className="flex gap-2">
        {['sas', 'key'].map(t => (
          <button key={t} onClick={() => setAuthType(t)}
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
            style={{
              background: authType === t ? `${color}20` : 'rgba(15,23,42,0.5)',
              color: authType === t ? color : '#64748b',
              border: `1px solid ${authType === t ? color + '50' : 'rgba(255,255,255,0.08)'}`
            }}>
            {t === 'sas' ? '🔑 SAS Token' : '🗝 Access Key'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-slate-500 font-medium">Storage Account Name</label>
          <input value={account} onChange={e => { setAccount(e.target.value); setConnected(false) }}
            placeholder="mystorageaccount"
            className="w-full text-xs px-3 py-2 rounded-lg outline-none"
            style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }} />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-500 font-medium">Container Name</label>
          <input value={container} onChange={e => { setContainer(e.target.value); setConnected(false) }}
            placeholder="mycontainer"
            className="w-full text-xs px-3 py-2 rounded-lg outline-none"
            style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }} />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-slate-500 font-medium">
          {authType === 'sas' ? 'SAS Token' : 'Access Key'}
          <span className="text-slate-600 ml-1">(starts with ? for SAS)</span>
        </label>
        <input value={authType === 'sas' ? sasToken : accessKey}
          onChange={e => authType === 'sas' ? setSasToken(e.target.value) : setAccessKey(e.target.value)}
          type="password" placeholder={authType === 'sas' ? '?sv=2023-01-…' : 'Base64 encoded key'}
          className="w-full text-xs px-3 py-2 rounded-lg outline-none font-mono"
          style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }} />
      </div>

      <button onClick={handleConnect} disabled={connecting}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
        style={{ background: `${color}20`, color, border: `1.5px solid ${color}40` }}>
        {connecting ? <Loader size={14} className="animate-spin" /> : <Cloud size={14} />}
        {connecting ? 'Connecting…' : connected ? 'Reconnect / Refresh' : 'Connect to Azure'}
      </button>

      {error && (
        <div className="flex items-start gap-2 text-xs p-3 rounded-xl"
          style={{ background: 'rgba(244,63,94,0.06)', color: '#f87171', border: '1px solid rgba(244,63,94,0.2)' }}>
          <AlertCircle size={13} className="flex-shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {blobs.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-400 font-medium">{blobs.length} files found — select to load:</label>
            <div className="flex gap-2">
              <button onClick={() => setSelectedBlobs(blobs)}
                className="text-xs px-2 py-1 rounded" style={{ color, background: `${color}15` }}>All</button>
              <button onClick={() => setSelectedBlobs([])}
                className="text-xs px-2 py-1 rounded text-slate-500" style={{ background: 'rgba(255,255,255,0.05)' }}>None</button>
            </div>
          </div>
          <div className="max-h-36 overflow-y-auto space-y-1 pr-0.5">
            {blobs.map(b => (
              <label key={b} className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors"
                style={{ background: selectedBlobs.includes(b) ? `${color}12` : 'rgba(15,23,42,0.4)', border: `1px solid ${selectedBlobs.includes(b) ? color + '30' : 'rgba(255,255,255,0.05)'}` }}>
                <input type="checkbox" checked={selectedBlobs.includes(b)} onChange={() => toggleBlob(b)}
                  className="accent-sky-400 w-3 h-3" />
                <FileSpreadsheet size={11} style={{ color: selectedBlobs.includes(b) ? color : '#475569' }} />
                <span className="text-xs truncate" style={{ color: selectedBlobs.includes(b) ? '#e2e8f0' : '#64748b' }}>{b}</span>
              </label>
            ))}
          </div>
          <button onClick={handleLoadSelected} disabled={!selectedBlobs.length || loading}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}>
            {loading ? <Loader size={14} className="animate-spin" /> : <Download size={14} />}
            {loading ? 'Loading files…' : `Load ${selectedBlobs.length} file(s)`}
          </button>
        </div>
      )}

      {loaded && (
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl"
          style={{ background: 'rgba(16,185,129,0.08)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>
          <CheckCircle size={12} />
          {loaded.count} file(s) loaded · {loaded.rows.toLocaleString()} total rows
        </div>
      )}
    </div>
  )
}

// ── Column Mapping Row ─────────────────────────────────────────────────────
function MappingRow({ target, col1Options, col2Options, col1Val, col2Val, onChange1, onChange2, autoMatched, onRemove, simScore }) {
  return (
    <tr style={{ background: autoMatched ? 'transparent' : 'rgba(245,158,11,0.04)' }}>
      <td className="px-2 sm:px-3 py-2 truncate text-xs font-mono font-medium" style={{ color: '#e2e8f0', maxWidth: '120px' }}>{target}</td>
      <td className="px-2 sm:px-3 py-2">
        <select value={col1Val} onChange={e => onChange1(e.target.value)}
          className="w-full text-xs px-1.5 py-1 rounded-lg outline-none min-w-[100px]"
          style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(255,255,255,0.1)', color: '#7dd3fc' }}>
          <option value="">— skip —</option>
          {col1Options.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </td>
      <td className="px-1 sm:px-3 py-2 text-center w-10 sm:w-14">
        {autoMatched
          ? <span title={`${simScore?.toFixed(0)}% match`}><Link2 size={12} style={{ color: '#34d399' }} className="mx-auto" /></span>
          : <Link2Off size={12} style={{ color: '#fbbf24' }} className="mx-auto" />}
      </td>
      <td className="px-2 sm:px-3 py-2">
        <select value={col2Val} onChange={e => onChange2(e.target.value)}
          className="w-full text-xs px-1.5 py-1 rounded-lg outline-none min-w-[100px]"
          style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(255,255,255,0.1)', color: '#c4b5fd' }}>
          <option value="">— skip —</option>
          {col2Options.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </td>
      <td className="px-1 py-2 text-center w-8">
        {onRemove && (
          <button onClick={onRemove} title="Remove mapping"
            className="p-0.5 rounded transition-colors text-slate-700 hover:text-rose-400">
            <Trash2 size={11} />
          </button>
        )}
      </td>
    </tr>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// ── Main ComparePage ───────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

export default function ComparePage() {
  const { user } = useAuth()

  // ── Source mode: 'manual' | 'azure' ──────────────────────────────────────
  const [sourceMode, setSourceMode] = useState('manual')

  // ── File state ────────────────────────────────────────────────────────────
  const [files1, setFiles1] = useState([])
  const [files2, setFiles2] = useState([])
  const [loading1, setLoading1] = useState(false)
  const [loading2, setLoading2] = useState(false)
  const [error, setError] = useState('')

  const [sel1, setSel1] = useState(0)
  const [sel2, setSel2] = useState(0)

  // ── Column mapping ────────────────────────────────────────────────────────
  const [colMapping, setColMapping] = useState({})
  const [mappingConfirmed, setMappingConfirmed] = useState(false)
  const [showMappingDetails, setShowMappingDetails] = useState(false)
  const [extraMappings, setExtraMappings] = useState([]) // [{id, f1, f2, target}]
  const [newMapF1, setNewMapF1] = useState('')
  const [newMapF2, setNewMapF2] = useState('')

  // ── Key & direction ───────────────────────────────────────────────────────
  const [keyCol, setKeyCol] = useState('')
  const [direction, setDirection] = useState('f1_to_f2')

  // ── Results ───────────────────────────────────────────────────────────────
  const [result, setResult] = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const [runLoading, setRunLoading] = useState(false)

  // ── Pivot ─────────────────────────────────────────────────────────────────
  const [pivotCol, setPivotCol] = useState('')
  const [pivotAgg, setPivotAgg] = useState('count')
  const [pivotValCol, setPivotValCol] = useState('')
  const [showPivot, setShowPivot] = useState(false)

  const data1 = files1[sel1]?.parsed
  const data2 = files2[sel2]?.parsed

  // ── Add files ─────────────────────────────────────────────────────────────
  const addToPanel = useCallback(async (rawFiles, setFiles, setLoading, panelNum) => {
    setError('')
    setLoading(true)
    const arr = Array.from(rawFiles)
    const added = []
    for (const file of arr) {
      try {
        const parsed = await parseFile(file)
        added.push({ file, parsed })
        await trackUpload({ fileName: file.name, fileSize: file.size, rowCount: parsed.rowCount, userId: user?.uid })
      } catch (e) { setError(`Cannot parse ${file.name}: ${e.message}`) }
    }
    setFiles(prev => [...prev, ...added])
    setResult(null)
    setColMapping({})
    setMappingConfirmed(false)
    setKeyCol('')
    setLoading(false)
  }, [user])

  // Azure loaded callback (replaces files entirely for that side)
  const onAzureLoaded1 = useCallback((frames) => {
    setFiles1(frames); setResult(null); setColMapping({}); setMappingConfirmed(false); setKeyCol('')
  }, [])
  const onAzureLoaded2 = useCallback((frames) => {
    setFiles2(frames); setResult(null); setColMapping({}); setMappingConfirmed(false); setKeyCol('')
  }, [])

  // ── Auto column map ───────────────────────────────────────────────────────
  const autoColMap = useMemo(() => {
    if (!data1 || !data2) return {}
    const map = {}
    const cols2 = data2.columns

    // Match file1 cols → file2 cols by normalized name
    data1.columns.forEach(col1 => {
      let bestMatch = null, bestScore = 0
      cols2.forEach(col2 => {
        const s = similarity(col1, col2)
        if (s > bestScore) { bestScore = s; bestMatch = col2 }
      })
      const autoMatched = bestScore >= 75
      map[col1] = { f1: col1, f2: autoMatched ? bestMatch : null, simScore: bestScore, autoMatched }
    })

    // Add file2 cols not matched
    cols2.forEach(col2 => {
      const alreadyMapped = Object.values(map).some(m => m.f2 === col2 && m.autoMatched)
      if (!alreadyMapped) {
        const key = `[File 2] ${col2}`
        if (!map[key]) {
          map[key] = { f1: null, f2: col2, simScore: 0, autoMatched: false }
        }
      }
    })

    return map
  }, [data1, data2, sel1, sel2])

  const unmatchedCols = useMemo(() =>
    Object.entries(autoColMap).filter(([, v]) => !v.autoMatched), [autoColMap])

  // effective mapping = auto merged with user overrides + extra manual mappings
  const effectiveMap = useMemo(() => {
    const base = {}
    Object.entries(autoColMap).forEach(([target, v]) => {
      base[target] = {
        f1: colMapping[target]?.f1 !== undefined ? colMapping[target].f1 : v.f1,
        f2: colMapping[target]?.f2 !== undefined ? colMapping[target].f2 : v.f2,
        simScore: v.simScore,
        autoMatched: v.autoMatched && !colMapping[target]
      }
    })
    // Extra manual mappings
    extraMappings.forEach(m => {
      if (m.f1 || m.f2) {
        base[m.target || `${m.f1} ↔ ${m.f2}`] = { f1: m.f1, f2: m.f2, simScore: 0, autoMatched: false }
      }
    })
    return base
  }, [autoColMap, colMapping, extraMappings])

  const keyOptions = useMemo(() =>
    Object.entries(effectiveMap).filter(([, v]) => v.f1 && v.f2).map(([target]) => target),
    [effectiveMap])

  // ── Run comparison ────────────────────────────────────────────────────────
  const handleRun = async () => {
    if (!data1 || !data2 || !keyCol) return
    setRunLoading(true); setError('')
    try {
      await new Promise(r => setTimeout(r, 20))
      const keyEntry = effectiveMap[keyCol]
      if (!keyEntry?.f1 || !keyEntry?.f2) {
        setError('Key column must be mapped on both sides.'); setRunLoading(false); return
      }
      const colMapArr = Object.entries(effectiveMap)
        .filter(([, v]) => v.f1 && v.f2)
        .map(([target, v]) => ({ col1: v.f1, col2: v.f2, target }))

      const res = runComparison(data1.data, data2.data, keyEntry.f1, keyEntry.f2, colMapArr, direction)
      setResult(res)
      setActiveTab('all')

      await trackComparison({
        file1Name: files1[sel1]?.file.name, file2Name: files2[sel2]?.file.name,
        matchedCount: res.summary.matched,
        missingCount: res.summary.onlyIn1 + res.summary.onlyIn2,
        userId: user?.uid,
      })
    } catch (e) { setError(`Comparison error: ${e.message}`) }
    setRunLoading(false)
  }

  const reset = () => {
    setFiles1([]); setFiles2([]); setSel1(0); setSel2(0)
    setColMapping({}); setExtraMappings([]); setMappingConfirmed(false); setKeyCol('')
    setResult(null); setError(''); setDirection('f1_to_f2')
  }

  // ── Tab data ──────────────────────────────────────────────────────────────
  const { tabRows, tabCols } = useMemo(() => {
    if (!result) return { tabRows: [], tabCols: [] }
    const mappedCols = Object.entries(effectiveMap).filter(([, v]) => v.f1 && v.f2).map(([t]) => t)
    const pairedCols = mappedCols.flatMap(c => [`f1_${c}`, `f2_${c}`])

    const allRows = [...result.matched, ...result.onlyIn1, ...result.onlyIn2]

    switch (activeTab) {
      case 'all':      return { tabRows: allRows, tabCols: pairedCols }
      case 'matched':  return { tabRows: result.matched, tabCols: pairedCols }
      case 'diffs':    return { tabRows: result.matched.filter(r => r._hasDiff), tabCols: pairedCols }
      case 'onlyIn1':  return { tabRows: result.onlyIn1, tabCols: pairedCols }
      case 'onlyIn2':  return { tabRows: result.onlyIn2, tabCols: pairedCols }
      default:         return { tabRows: allRows, tabCols: pairedCols }
    }
  }, [result, activeTab, effectiveMap])

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExport = (format) => {
    const exportData = tabRows.map(r => {
      const obj = { Match_Status: r._status || '', Missing_From: r._missingFrom || '' }
      tabCols.filter(c => !c.startsWith('_')).forEach(c => {
        // Label columns as File1_ or File2_
        const displayKey = c.startsWith('f1_')
          ? `File1_${c.replace('f1_', '')}`
          : c.startsWith('f2_')
            ? `File2_${c.replace('f2_', '')}`
            : c
        obj[displayKey] = r[c] ?? ''
      })
      return obj
    })
    const name = `compare_${activeTab}_${Date.now()}`
    if (format === 'csv')   exportToCSV(exportData, `${name}.csv`)
    if (format === 'excel') exportToExcel(exportData, `${name}.xlsx`)
  }

  // ── Pivot ─────────────────────────────────────────────────────────────────
  const pivotData = useMemo(() => {
    if (!result || !pivotCol) return []
    const allRows = [...result.matched, ...result.onlyIn1, ...result.onlyIn2]
    const groups = {}
    allRows.forEach(row => {
      const k = String(row[pivotCol] ?? row[`f1_${pivotCol}`] ?? '(blank)')
      if (!groups[k]) groups[k] = []
      groups[k].push(row)
    })
    return Object.entries(groups).map(([key, rows]) => {
      let val = rows.length
      if (pivotValCol && pivotAgg !== 'count') {
        const nums = rows.map(r => parseFloat(r[pivotValCol] ?? r[`f1_${pivotValCol}`] ?? 0)).filter(n => !isNaN(n))
        val = pivotAgg === 'sum' ? nums.reduce((a, b) => a + b, 0).toFixed(2)
            : pivotAgg === 'avg' ? (nums.reduce((a, b) => a + b, 0) / Math.max(nums.length, 1)).toFixed(2)
            : pivotAgg === 'min' ? (Math.min(...nums) || 0)
            : (Math.max(...nums) || 0)
      }
      return { Group: key, [pivotAgg === 'count' ? 'Count' : `${pivotAgg}(${pivotValCol})`]: val, Rows: rows.length }
    }).sort((a, b) => b.Rows - a.Rows)
  }, [result, pivotCol, pivotAgg, pivotValCol])

  const numCols = data1 ? data1.columns.filter(c => data1.data.some(r => !isNaN(parseFloat(r[c])))) : []

  const TABS = [
    { id: 'all',     label: 'All Records', icon: Layers,       color: '#94a3b8',
      count: result ? (result.matched.length + result.onlyIn1.length + result.onlyIn2.length) : 0 },
    { id: 'matched', label: 'Matched',      icon: CheckCircle,  color: '#10b981',
      count: result?.summary.matched ?? 0 },
    { id: 'diffs',   label: 'Differences',  icon: AlertTriangle,color: '#f59e0b',
      count: result?.matched.filter(r => r._hasDiff).length ?? 0 },
    { id: 'onlyIn1', label: 'File 1 Only',  icon: Minus,        color: '#0ea5e9',
      count: result?.summary.onlyIn1 ?? 0 },
    { id: 'onlyIn2', label: 'File 2 Only',  icon: Minus,        color: '#8b5cf6',
      count: result?.summary.onlyIn2 ?? 0 },
  ]

  const bothLoaded = !!(data1 && data2)

  // ── Styles shared ─────────────────────────────────────────────────────────
  const glassCard = {
    background: 'rgba(15,23,42,0.7)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
    backdropFilter: 'blur(12px)'
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <GitCompare size={26} style={{ color: '#38bdf8' }} />
            File Comparator
          </h1>
          <p className="text-slate-400 text-sm mt-1">Upload files · map columns · choose key · compare results</p>
        </div>
        {(files1.length > 0 || files2.length > 0) && (
          <button onClick={reset}
            className="flex items-center gap-2 text-sm px-3 py-2 rounded-xl transition-colors text-slate-400 hover:text-white"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <RotateCcw size={13} /> Reset All
          </button>
        )}
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="p-4 text-rose-400 text-sm rounded-xl flex items-start gap-3"
          style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.2)' }}>
          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto flex-shrink-0 hover:text-rose-300"><X size={14} /></button>
        </div>
      )}

      {/* ── STEP 1: Source Mode Selector ── */}
      <div style={glassCard} className="p-5 space-y-5">
        <h2 className="font-semibold text-white text-sm flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-sky-500 text-white text-xs flex items-center justify-center font-bold">1</span>
          Load Data
        </h2>

        {/* Mode tabs */}
        <div className="flex gap-2 p-1 rounded-xl w-fit"
          style={{ background: 'rgba(8,14,30,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            { id: 'manual', label: 'Manual Upload', icon: HardDrive },
            { id: 'azure',  label: 'Azure Blob Storage', icon: Cloud }
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setSourceMode(id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: sourceMode === id ? 'rgba(14,165,233,0.15)' : 'transparent',
                color: sourceMode === id ? '#38bdf8' : '#64748b',
                border: sourceMode === id ? '1px solid rgba(14,165,233,0.3)' : '1px solid transparent'
              }}>
              <Icon size={14} />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{id === 'manual' ? 'Upload' : 'Azure'}</span>
            </button>
          ))}
        </div>

        {/* Manual upload */}
        {sourceMode === 'manual' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            <div className="p-3 sm:p-4 rounded-xl space-y-1"
              style={{ background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.15)' }}>
              <FilePanel label="File 1 (Primary / Source of Truth)" color="#0ea5e9"
                files={files1} loading={loading1} inputId="input-f1"
                onAdd={f => addToPanel(f, setFiles1, setLoading1, 1)}
                onRemove={i => { setFiles1(p => p.filter((_, j) => j !== i)); setResult(null); setMappingConfirmed(false) }}
              />
              {files1.length > 1 && (
                <div className="pt-2 space-y-1">
                  <label className="text-xs text-slate-500">Active file:</label>
                  <select value={sel1} onChange={e => { setSel1(+e.target.value); setResult(null); setMappingConfirmed(false) }}
                    className="w-full text-xs px-2 py-1.5 rounded-lg outline-none"
                    style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }}>
                    {files1.map(({ file }, i) => <option key={i} value={i}>{file.name}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div className="p-3 sm:p-4 rounded-xl space-y-1"
              style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)' }}>
              <FilePanel label="File 2 (Compare Against)" color="#8b5cf6"
                files={files2} loading={loading2} inputId="input-f2"
                onAdd={f => addToPanel(f, setFiles2, setLoading2, 2)}
                onRemove={i => { setFiles2(p => p.filter((_, j) => j !== i)); setResult(null); setMappingConfirmed(false) }}
              />
              {files2.length > 1 && (
                <div className="pt-2 space-y-1">
                  <label className="text-xs text-slate-500">Active file:</label>
                  <select value={sel2} onChange={e => { setSel2(+e.target.value); setResult(null); setMappingConfirmed(false) }}
                    className="w-full text-xs px-2 py-1.5 rounded-lg outline-none"
                    style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }}>
                    {files2.map(({ file }, i) => <option key={i} value={i}>{file.name}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Azure Blob Storage */}
        {sourceMode === 'azure' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            <div className="p-3 sm:p-4 rounded-xl"
              style={{ background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.15)' }}>
              <AzurePanel side="f1" label="File 1" color="#0ea5e9"
                onFileLoaded={onAzureLoaded1} inputId="az-input-f1" />
            </div>
            <div className="p-3 sm:p-4 rounded-xl"
              style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)' }}>
              <AzurePanel side="f2" label="File 2" color="#8b5cf6"
                onFileLoaded={onAzureLoaded2} inputId="az-input-f2" />
            </div>
          </div>
        )}

        {/* Note about both modes */}
        {sourceMode === 'azure' && (
          <p className="text-xs text-slate-600 flex items-center gap-1.5">
            <Shield size={11} />
            Files are fetched directly from your browser using SAS tokens. Credentials are never stored or sent to our servers.
          </p>
        )}
      </div>

      {/* ── STEP 2: Column Mapping ── */}
      {bothLoaded && !mappingConfirmed && (
        <div style={glassCard} className="p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-sky-500 text-white text-xs flex items-center justify-center font-bold">2</span>
              Column Mapping
            </h2>
            <div className="flex items-center gap-2">
              {unmatchedCols.length === 0
                ? <span className="text-xs px-2 py-1 rounded-full font-semibold"
                    style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399' }}>
                    ✓ All columns auto-matched
                  </span>
                : <span className="text-xs px-2 py-1 rounded-full font-semibold"
                    style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24' }}>
                    ⚠ {unmatchedCols.length} column(s) need mapping
                  </span>}
              <button onClick={() => setShowMappingDetails(p => !p)}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-colors text-slate-400 hover:text-white"
                style={{ background: 'rgba(255,255,255,0.05)' }}>
                <Settings size={11} />
                {showMappingDetails ? 'Hide' : 'Customize'}
                {showMappingDetails ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-500 flex items-start gap-1.5">
            <Info size={12} className="flex-shrink-0 mt-0.5 text-sky-500" />
            Columns are auto-matched using fuzzy name normalization (75%+ similarity threshold).
            Customize below if any column is incorrectly paired or missing.
          </p>

          {/* Summary of auto-matched */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'File 1 Columns', value: data1.columns.length, color: '#38bdf8' },
              { label: 'File 2 Columns', value: data2.columns.length, color: '#a78bfa' },
              { label: 'Auto-Matched', value: Object.values(autoColMap).filter(v => v.autoMatched).length, color: '#34d399' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center p-3 rounded-xl"
                style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-lg font-bold font-mono" style={{ color }}>{value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Detailed mapping table */}
          {showMappingDetails && (
            <div className="space-y-3">
              <div className="table-wrapper max-h-80 sm:max-h-96"
                style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(8,14,30,0.7)' }}>
                <table className="min-w-full text-xs border-collapse">
                  <thead className="sticky top-0 z-10"
                    style={{ background: 'rgba(15,23,42,0.95)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <tr>
                      <th className="px-2 sm:px-3 py-2 sm:py-2.5 text-left font-semibold text-slate-400 whitespace-nowrap">Target</th>
                      <th className="px-2 sm:px-3 py-2 sm:py-2.5 text-left font-semibold text-sky-400 whitespace-nowrap min-w-[120px]">File 1 Column</th>
                      <th className="px-1 sm:px-3 py-2 sm:py-2.5 text-center w-10 sm:w-14 font-semibold text-slate-500">Match</th>
                      <th className="px-2 sm:px-3 py-2 sm:py-2.5 text-left font-semibold text-violet-400 whitespace-nowrap min-w-[120px]">File 2 Column</th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(autoColMap).map(([target, v]) => (
                      <MappingRow key={target}
                        target={target}
                        col1Options={data1?.columns ?? []}
                        col2Options={data2?.columns ?? []}
                        col1Val={colMapping[target]?.f1 ?? v.f1 ?? ''}
                        col2Val={colMapping[target]?.f2 ?? v.f2 ?? ''}
                        autoMatched={v.autoMatched && !colMapping[target]}
                        simScore={v.simScore}
                        onRemove={null}
                        onChange1={val => setColMapping(p => ({ ...p, [target]: { ...p[target], f1: val || null } }))}
                        onChange2={val => setColMapping(p => ({ ...p, [target]: { ...p[target], f2: val || null } }))}
                      />
                    ))}
                    {/* Extra manual mappings */}
                    {extraMappings.map((m, i) => (
                      <MappingRow key={m.id}
                        target={m.target || `Custom ${i + 1}`}
                        col1Options={data1?.columns ?? []}
                        col2Options={data2?.columns ?? []}
                        col1Val={m.f1 ?? ''}
                        col2Val={m.f2 ?? ''}
                        autoMatched={false}
                        simScore={0}
                        onChange1={val => setExtraMappings(p => p.map((x, j) => j === i ? { ...x, f1: val } : x))}
                        onChange2={val => setExtraMappings(p => p.map((x, j) => j === i ? { ...x, f2: val } : x))}
                        onRemove={() => setExtraMappings(p => p.filter((_, j) => j !== i))}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add manual mapping row */}
              <div className="flex flex-wrap gap-2 items-center p-3 rounded-xl"
                style={{ background: 'rgba(15,23,42,0.5)', border: '1px dashed rgba(255,255,255,0.08)' }}>
                <span className="text-xs text-slate-500 font-medium">Add manual mapping:</span>
                <select value={newMapF1} onChange={e => setNewMapF1(e.target.value)}
                  className="text-xs px-2 py-1.5 rounded-lg outline-none flex-1 min-w-[140px]"
                  style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(14,165,233,0.3)', color: '#7dd3fc' }}>
                  <option value="">File 1 column…</option>
                  {data1?.columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ArrowRight size={12} className="text-slate-600 flex-shrink-0" />
                <select value={newMapF2} onChange={e => setNewMapF2(e.target.value)}
                  className="text-xs px-2 py-1.5 rounded-lg outline-none flex-1 min-w-[140px]"
                  style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(139,92,246,0.3)', color: '#c4b5fd' }}>
                  <option value="">File 2 column…</option>
                  {data2?.columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button onClick={() => {
                  if (newMapF1 || newMapF2) {
                    setExtraMappings(p => [...p, { id: Date.now(), f1: newMapF1, f2: newMapF2, target: `${newMapF1} ↔ ${newMapF2}` }])
                    setNewMapF1(''); setNewMapF2('')
                  }
                }}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors"
                  style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <Plus size={11} /> Add
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-1">
            <button onClick={() => { setColMapping({}); setExtraMappings([]) }}
              className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl transition-colors text-slate-400"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <RefreshCw size={13} /> Reset to Auto
            </button>
            <button onClick={() => setMappingConfirmed(true)}
              className="flex items-center gap-2 text-sm px-5 py-2.5 rounded-xl font-semibold transition-all ml-auto"
              style={{ background: 'rgba(14,165,233,0.15)', color: '#38bdf8', border: '1.5px solid rgba(14,165,233,0.35)' }}>
              <CheckCircle size={14} /> Confirm Mapping
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Key + Direction + Run ── */}
      {bothLoaded && mappingConfirmed && !result && (
        <div style={glassCard} className="p-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-sky-500 text-white text-xs flex items-center justify-center font-bold">3</span>
              Comparison Settings
            </h2>
            <button onClick={() => setMappingConfirmed(false)}
              className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-slate-400 hover:text-white"
              style={{ background: 'rgba(255,255,255,0.05)' }}>
              ← Edit Mapping
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Key column */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">
                Key Column <span style={{ color: '#f87171' }}>*</span>
              </label>
              <select value={keyCol} onChange={e => setKeyCol(e.target.value)}
                className="w-full text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl outline-none"
                style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.12)', color: '#e2e8f0' }}>
                <option value="">Select key column…</option>
                {keyOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <p className="text-xs text-slate-600">Rows matched by this column's value</p>
            </div>

            {/* Direction */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Comparison Direction</label>
              <select value={direction} onChange={e => setDirection(e.target.value)}
                className="w-full text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl outline-none"
                style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.12)', color: '#e2e8f0' }}>
                <option value="f1_to_f2">File 1 → File 2 (File 1 is source of truth)</option>
                <option value="f2_to_f1">File 2 → File 1 (File 2 is source of truth)</option>
              </select>
              <p className="text-xs text-slate-600">Determines which file's missing records are highlighted</p>
            </div>

            {/* File summary */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Files Selected</label>
              <div className="p-2 sm:p-3 rounded-xl space-y-1.5"
                style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs text-slate-300 flex items-center gap-2 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0" />
                  <span className="truncate font-medium text-white">{files1[sel1]?.file.name}</span>
                  <span className="text-slate-600 ml-auto flex-shrink-0 whitespace-nowrap">{data1?.rowCount?.toLocaleString()}r</span>
                </p>
                <p className="text-xs text-slate-300 flex items-center gap-2 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                  <span className="truncate font-medium text-white">{files2[sel2]?.file.name}</span>
                  <span className="text-slate-600 ml-auto flex-shrink-0 whitespace-nowrap">{data2?.rowCount?.toLocaleString()}r</span>
                </p>
              </div>
            </div>
          </div>

          <button onClick={handleRun} disabled={!keyCol || runLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl text-base font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: !keyCol || runLoading ? 'rgba(14,165,233,0.1)' : 'rgba(14,165,233,0.2)',
              color: '#38bdf8',
              border: '1.5px solid rgba(14,165,233,0.35)'
            }}>
            {runLoading
              ? <><Loader size={18} className="animate-spin" /> Running comparison…</>
              : <><Play size={18} /> Run Comparison</>}
          </button>
        </div>
      )}

      {/* ── STEP 4: Results ── */}
      {result && (
        <div className="space-y-5">

          {/* Summary stats */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button onClick={() => { setResult(null); setMappingConfirmed(true) }}
              className="flex items-center gap-2 text-sm px-3 py-2 rounded-xl transition-colors text-slate-400 hover:text-white"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              ← Change Settings
            </button>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'File 1 Rows',  value: result.summary.total1,   color: '#38bdf8', bg: 'rgba(14,165,233,0.08)' },
                { label: 'File 2 Rows',  value: result.summary.total2,   color: '#a78bfa', bg: 'rgba(139,92,246,0.08)' },
                { label: 'Matched',      value: result.summary.matched,  color: '#34d399', bg: 'rgba(16,185,129,0.08)' },
                { label: 'Has Diffs',    value: result.summary.diffCount,color: '#fbbf24', bg: 'rgba(245,158,11,0.08)' },
                { label: 'File 1 Only',  value: result.summary.onlyIn1,  color: '#38bdf8', bg: 'rgba(14,165,233,0.08)' },
                { label: 'File 2 Only',  value: result.summary.onlyIn2,  color: '#a78bfa', bg: 'rgba(139,92,246,0.08)' },
                { label: 'Match %',      value: result.summary.matchPct + '%', color: '#34d399', bg: 'rgba(16,185,129,0.08)' },
              ].map(({ label, value, color, bg }) => (
                <div key={label} className="px-3 py-2 rounded-xl text-center min-w-[80px] sm:min-w-[90px]"
                  style={{ background: bg, border: `1px solid ${color}25` }}>
                  <p className="text-base sm:text-lg font-bold font-mono" style={{ color }}>
                    {typeof value === 'number' ? value.toLocaleString() : value}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs + table */}
          <div style={glassCard} className="p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Tab buttons */}
              <div className="flex flex-wrap gap-1.5">
                {TABS.map(({ id, label, icon: Icon, color, count }) => (
                  <button key={id} onClick={() => setActiveTab(id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all"
                    style={{
                      background: activeTab === id ? 'rgba(255,255,255,0.08)' : 'transparent',
                      color: activeTab === id ? '#fff' : '#64748b',
                      border: activeTab === id ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent'
                    }}>
                    <Icon size={12} style={activeTab === id ? { color } : {}} />
                    <span className="hidden sm:inline">{label}</span>
                    <span className="sm:hidden">{label.split(' ')[0]}</span>
                    <span className="font-mono text-xs px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(255,255,255,0.08)', color: activeTab === id ? color : '#475569' }}>
                      {count.toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>

              {/* Export buttons */}
              <div className="flex gap-2">
                <button onClick={() => handleExport('csv')}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors text-slate-400 hover:text-white"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Download size={12} /> CSV
                </button>
                <button onClick={() => handleExport('excel')}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors text-slate-400 hover:text-white"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Download size={12} /> Excel
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1"><span style={{ color: '#7dd3fc' }}>■</span> File 1 value</span>
              <span className="flex items-center gap-1"><span style={{ color: '#c4b5fd' }}>■</span> File 2 value</span>
              <span className="flex items-center gap-1"><span style={{ color: '#fbbf24' }}>■</span> Differs</span>
              <span className="flex items-center gap-1"><span style={{ color: '#475569', fontStyle: 'italic' }}>—</span> Missing / not in this file</span>
            </div>

            <MiniTable
              columns={tabCols}
              rows={tabRows}
              highlightDiffs={activeTab === 'diffs' || activeTab === 'all'}
              showStatus={activeTab === 'all'}
              emptyMsg={`No records in "${TABS.find(t => t.id === activeTab)?.label}" category.`}
            />
          </div>

          {/* Pivot Analysis */}
          <div style={glassCard} className="p-4 sm:p-5 space-y-4">
            <button onClick={() => setShowPivot(p => !p)}
              className="w-full flex items-center justify-between text-sm font-semibold text-white">
              <span className="flex items-center gap-2">
                <BarChart2 size={16} style={{ color: '#38bdf8' }} />
                Pivot / Group Analysis
              </span>
              {showPivot ? <ChevronUp size={15} className="text-slate-500" /> : <ChevronDown size={15} className="text-slate-500" />}
            </button>

            {showPivot && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <div className="space-y-1 flex-1 min-w-[150px]">
                    <label className="text-xs text-slate-500">Group by column</label>
                    <select value={pivotCol} onChange={e => setPivotCol(e.target.value)}
                      className="w-full text-xs px-2 py-1.5 rounded-lg outline-none"
                      style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }}>
                      <option value="">Select column…</option>
                      {keyOptions.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1 flex-1 min-w-[110px]">
                    <label className="text-xs text-slate-500">Aggregation</label>
                    <select value={pivotAgg} onChange={e => setPivotAgg(e.target.value)}
                      className="w-full text-xs px-2 py-1.5 rounded-lg outline-none"
                      style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }}>
                      {['count', 'sum', 'avg', 'min', 'max'].map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  {pivotAgg !== 'count' && (
                    <div className="space-y-1 flex-1 min-w-[150px]">
                      <label className="text-xs text-slate-500">Value column</label>
                      <select value={pivotValCol} onChange={e => setPivotValCol(e.target.value)}
                        className="w-full text-xs px-2 py-1.5 rounded-lg outline-none"
                        style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }}>
                        <option value="">Select…</option>
                        {numCols.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                {pivotCol && pivotData.length > 0 && (
                  <>
                    <MiniTable columns={Object.keys(pivotData[0])} rows={pivotData} />
                    <div className="flex justify-end">
                      <button onClick={() => exportToCSV(pivotData, `pivot_${Date.now()}.csv`)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors text-slate-400 hover:text-white"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <Download size={12} /> Export Pivot CSV
                      </button>
                    </div>
                  </>
                )}
                {pivotCol && pivotData.length === 0 && (
                  <p className="text-xs text-slate-600 text-center py-4">No data for selected column.</p>
                )}
                {!pivotCol && (
                  <p className="text-xs text-slate-600 text-center py-4">Select a column to group by.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}