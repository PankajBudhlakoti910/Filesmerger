import { useState, useMemo } from 'react'
import {
  GitCompare, Play, Download, RotateCcw, CheckCircle,
  AlertTriangle, Minus, Upload, X, FileSpreadsheet,
  Plus, ArrowRight, Link2, Link2Off, Info
} from 'lucide-react'
import { parseFile, exportToCSV, exportToExcel, formatFileSize } from '../utils/fileParser'
import { trackUpload, trackComparison } from '../services/analyticsService'
import { useAuth } from '../hooks/useAuth'

// ── Normalize column name: lowercase + remove special chars ────────────────
function normCol(c) {
  return String(c).trim().toLowerCase().replace(/[^a-z0-9]+/g, '').trim()
}

// ── Normalize cell value for matching ──────────────────────────────────────
function normVal(v) {
  return String(v ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

// ── Core compare logic ─────────────────────────────────────────────────────
function runComparison(data1, data2, keyCol1, keyCol2, colMap) {
  // colMap: [{col1: originalColInFile1, col2: originalColInFile2, target: displayName}]
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
      const row2 = row1 && map2.get(key)
      const diffs = {}
      let hasDiff = false
      colMap.forEach(({ col1, col2, target }) => {
        const v1 = normVal(row1[col1])
        const v2 = normVal(row2[col2])
        if (v1 !== v2) { diffs[target] = { file1: row1[col1], file2: row2[col2] }; hasDiff = true }
      })
      const out = { _key: row1[keyCol1], _hasDiff: hasDiff, _diffs: diffs }
      colMap.forEach(({ col1, col2, target }) => {
        out[`f1_${target}`] = row1[col1] ?? ''
        out[`f2_${target}`] = row2[col2] ?? ''
      })
      matched.push(out)
    } else {
      const out = { _key: row1[keyCol1] }
      colMap.forEach(({ col1, target }) => { out[target] = row1[col1] ?? '' })
      onlyIn1.push(out)
    }
  })

  map2.forEach((row2, key) => {
    if (!map1.has(key)) {
      const out = { _key: row2[keyCol2] }
      colMap.forEach(({ col2, target }) => { out[target] = row2[col2] ?? '' })
      onlyIn2.push(out)
    }
  })

  return {
    matched, onlyIn1, onlyIn2,
    summary: {
      total1: data1.length, total2: data2.length,
      matched: matched.length, onlyIn1: onlyIn1.length, onlyIn2: onlyIn2.length,
      diffCount: matched.filter(r => r._hasDiff).length,
      matchPct: data1.length ? ((matched.length / Math.max(map1.size, 1)) * 100).toFixed(1) : '0',
    }
  }
}

// ── Small inline table with max 10 rows + scroll ───────────────────────────
function MiniTable({ columns, rows, highlightDiffs = false, emptyMsg = 'No records.' }) {
  const [page, setPage] = useState(1)
  const PAGE = 10
  const totalPages = Math.ceil(rows.length / PAGE)
  const slice = rows.slice((page - 1) * PAGE, page * PAGE)
  const displayCols = columns.filter(c => !c.startsWith('_'))

  if (!rows.length) return (
    <div className="glass-darker rounded-xl p-6 text-center text-slate-500 text-sm">{emptyMsg}</div>
  )

  return (
    <div className="space-y-2">
      <div className="overflow-auto rounded-xl border border-white/10 max-h-72">
        <table className="df-table min-w-full text-xs">
          <thead className="sticky top-0 z-10">
            <tr>{displayCols.map(c => <th key={c}>{c.replace(/^f[12]_/, '')}</th>)}</tr>
          </thead>
          <tbody>
            {slice.map((row, i) => (
              <tr key={i} className={highlightDiffs && row._hasDiff ? 'bg-amber-500/5' : ''}>
                {displayCols.map(c => {
                  const colName = c.replace(/^f[12]_/, '')
                  const isDiff = highlightDiffs && row._diffs?.[colName]
                  return (
                    <td key={c} className={isDiff ? 'text-amber-400 font-semibold' : ''}>
                      {String(row[c] ?? '')}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Rows {(page-1)*PAGE+1}–{Math.min(page*PAGE, rows.length)} of {rows.length.toLocaleString()}</span>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
              className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors">←</button>
            <span className="px-2 py-1">{page}/{totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
              className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors">→</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── File drop zone panel ───────────────────────────────────────────────────
function FilePanel({ label, color, files, loading, onAdd, onRemove, inputId }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ background: color }} />
        <p className="font-semibold text-white text-sm">{label}</p>
        <span className="text-xs text-slate-500">({files.length} file{files.length !== 1 ? 's' : ''})</span>
      </div>

      {/* Drop zone */}
      <div
        className="drop-zone !p-6"
        onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('active') }}
        onDragLeave={e => e.currentTarget.classList.remove('active')}
        onDrop={e => {
          e.preventDefault()
          e.currentTarget.classList.remove('active')
          if (e.dataTransfer.files?.length) onAdd(e.dataTransfer.files)
        }}
        onClick={() => document.getElementById(inputId).click()}
      >
        <input id={inputId} type="file" multiple accept=".csv,.xlsx,.xls" className="hidden"
          onChange={e => { if (e.target.files?.length) { onAdd(e.target.files); e.target.value = '' } }} />
        <Upload size={22} className="mx-auto mb-2 text-slate-500" />
        <p className="text-sm font-medium text-slate-300">Drop files or click to browse</p>
        <p className="text-xs text-slate-500 mt-1">CSV / Excel · multiple allowed</p>
        {loading && <p className="text-sky-400 text-xs mt-2 animate-pulse">Parsing…</p>}
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {files.map(({ file, parsed }, i) => (
            <div key={i} className="glass-darker flex items-center justify-between gap-2 px-3 py-2 rounded-xl">
              <div className="flex items-center gap-2 min-w-0">
                <FileSpreadsheet size={13} style={{ color }} className="flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white truncate max-w-[160px]">{file.name}</p>
                  <p className="text-xs text-slate-500">{formatFileSize(file.size)} · {parsed?.rowCount?.toLocaleString() ?? '…'} rows</p>
                </div>
              </div>
              <button onClick={() => onRemove(i)} className="p-1 text-slate-600 hover:text-rose-400 transition-colors flex-shrink-0">
                <X size={13} />
              </button>
            </div>
          ))}
          <button onClick={() => document.getElementById(inputId).click()}
            className="btn-ghost text-xs py-1.5 w-full justify-center">
            <Plus size={12} /> Add more
          </button>
        </div>
      )}

      {/* Success badge */}
      {files.length > 0 && (
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl"
          style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399' }}>
          <CheckCircle size={13} />
          {files.reduce((a, f) => a + (f.parsed?.rowCount ?? 0), 0).toLocaleString()} total rows loaded
        </div>
      )}
    </div>
  )
}

// ── Column mapping row ─────────────────────────────────────────────────────
function MappingRow({ target, col1Options, col2Options, col1Val, col2Val, onChange1, onChange2, autoMatched }) {
  return (
    <tr className={autoMatched ? '' : 'bg-amber-500/5'}>
      <td className="px-3 py-2 font-mono text-xs text-white font-medium">{target}</td>
      <td className="px-3 py-2">
        <select value={col1Val} onChange={e => onChange1(e.target.value)}
          className="input text-xs py-1.5">
          <option value="">— skip —</option>
          {col1Options.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </td>
      <td className="px-3 py-2 text-center">
        {autoMatched
          ? <Link2 size={14} className="text-emerald-400 mx-auto" />
          : <Link2Off size={14} className="text-amber-400 mx-auto" />}
      </td>
      <td className="px-3 py-2">
        <select value={col2Val} onChange={e => onChange2(e.target.value)}
          className="input text-xs py-1.5">
          <option value="">— skip —</option>
          {col2Options.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </td>
    </tr>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function ComparePage() {
  const { user } = useAuth()

  const [files1, setFiles1] = useState([])   // [{file, parsed}]
  const [files2, setFiles2] = useState([])
  const [loading1, setLoading1] = useState(false)
  const [loading2, setLoading2] = useState(false)
  const [error, setError] = useState('')

  // selected file index within each panel
  const [sel1, setSel1] = useState(0)
  const [sel2, setSel2] = useState(0)

  // column mapping state: {targetCol: {f1: col1Name, f2: col2Name}}
  const [colMapping, setColMapping] = useState({})
  const [mappingConfirmed, setMappingConfirmed] = useState(false)

  // key column (after normalization resolved)
  const [keyCol, setKeyCol] = useState('')   // target col name used as key

  const [result, setResult] = useState(null)
  const [activeTab, setActiveTab] = useState('matched')
  const [runLoading, setRunLoading] = useState(false)

  // pivot state
  const [pivotCol, setPivotCol] = useState('')
  const [pivotAgg, setPivotAgg] = useState('count')
  const [pivotValCol, setPivotValCol] = useState('')

  const data1 = files1[sel1]?.parsed
  const data2 = files2[sel2]?.parsed

  // ── Add files to panel ────────────────────────────────
  const addToPanel = async (rawFiles, setFiles, setLoading, panelNum) => {
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
    setFiles(prev => {
      const next = [...prev, ...added]
      return next
    })
    setResult(null)
    setColMapping({})
    setMappingConfirmed(false)
    setKeyCol('')
    setLoading(false)
  }

  // ── Auto-build column mapping using normalized names ──
  const autoColMap = useMemo(() => {
    if (!data1 || !data2) return {}
    const map = {}
    const cols2norm = {}
    data2.columns.forEach(c => { cols2norm[normCol(c)] = c })

    // Use file1 columns as "target"
    data1.columns.forEach(col1 => {
      const n = normCol(col1)
      const matched2 = cols2norm[n] || null
      map[col1] = { f1: col1, f2: matched2, norm: n, autoMatched: !!matched2 }
    })
    // Add file2 columns not in file1
    data2.columns.forEach(col2 => {
      const n = normCol(col2)
      const alreadyMapped = Object.values(map).some(m => m.norm === n)
      if (!alreadyMapped) {
        map[`[only in File 2] ${col2}`] = { f1: null, f2: col2, norm: n, autoMatched: false }
      }
    })
    return map
  }, [data1, data2, sel1, sel2])

  // columns fully matched (both sides mapped)
  const unmatchedCols = useMemo(() =>
    Object.entries(autoColMap).filter(([, v]) => !v.autoMatched),
    [autoColMap]
  )
  const allMatched = unmatchedCols.length === 0

  // effective mapping (user overrides or auto)
  const effectiveMap = useMemo(() => {
    const base = {}
    Object.entries(autoColMap).forEach(([target, v]) => {
      base[target] = {
        f1: colMapping[target]?.f1 ?? v.f1,
        f2: colMapping[target]?.f2 ?? v.f2,
      }
    })
    return base
  }, [autoColMap, colMapping])

  // shared key columns (cols mapped on both sides)
  const keyOptions = useMemo(() =>
    Object.entries(effectiveMap)
      .filter(([, v]) => v.f1 && v.f2)
      .map(([target]) => target),
    [effectiveMap]
  )

  const handleRun = async () => {
    if (!data1 || !data2 || !keyCol) return
    setRunLoading(true); setError('')
    try {
      await new Promise(r => setTimeout(r, 30))
      const mapped = effectiveMap
      const keyEntry = mapped[keyCol]
      if (!keyEntry?.f1 || !keyEntry?.f2) { setError('Key column not mapped on both sides.'); setRunLoading(false); return }

      const colMapArr = Object.entries(mapped)
        .filter(([, v]) => v.f1 && v.f2)
        .map(([target, v]) => ({ col1: v.f1, col2: v.f2, target }))

      const res = runComparison(data1.data, data2.data, keyEntry.f1, keyEntry.f2, colMapArr)
      setResult(res)
      setActiveTab('matched')

      await trackComparison({
        file1Name: files1[sel1].file.name, file2Name: files2[sel2].file.name,
        matchedCount: res.summary.matched, missingCount: res.summary.onlyIn1 + res.summary.onlyIn2,
        userId: user?.uid,
      })
    } catch (e) { setError(`Comparison error: ${e.message}`) }
    setRunLoading(false)
  }

  const reset = () => {
    setFiles1([]); setFiles2([]); setSel1(0); setSel2(0)
    setColMapping({}); setMappingConfirmed(false); setKeyCol('')
    setResult(null); setError('')
  }

  // ── Table data for active tab ─────────────────────────
  const getTabData = () => {
    if (!result) return { rows: [], columns: [] }
    const mappedCols = Object.entries(effectiveMap).filter(([, v]) => v.f1 && v.f2).map(([t]) => t)
    switch (activeTab) {
      case 'matched':  return { rows: result.matched, columns: [...mappedCols.map(c=>`f1_${c}`),...mappedCols.map(c=>`f2_${c}`)], highlightDiffs: false }
      case 'diffs':    return { rows: result.matched.filter(r=>r._hasDiff), columns: [...mappedCols.map(c=>`f1_${c}`),...mappedCols.map(c=>`f2_${c}`)], highlightDiffs: true }
      case 'onlyIn1':  return { rows: result.onlyIn1, columns: ['_key', ...mappedCols] }
      case 'onlyIn2':  return { rows: result.onlyIn2, columns: ['_key', ...mappedCols] }
      default: return { rows: [], columns: [] }
    }
  }

  const handleExport = (format, rows, columns) => {
    const exportData = rows.map(r => {
      const obj = {}
      columns.filter(c => !c.startsWith('_')).forEach(c => { obj[c.replace(/^f[12]_/, '')] = r[c] ?? '' })
      return obj
    })
    const name = `compare_${activeTab}_${Date.now()}`
    if (format === 'csv')   exportToCSV(exportData, `${name}.csv`)
    if (format === 'excel') exportToExcel(exportData, `${name}.xlsx`)
  }

  // ── Pivot table ───────────────────────────────────────
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
        val = pivotAgg === 'sum' ? nums.reduce((a,b)=>a+b,0).toFixed(2)
            : pivotAgg === 'avg' ? (nums.reduce((a,b)=>a+b,0)/Math.max(nums.length,1)).toFixed(2)
            : pivotAgg === 'min' ? (Math.min(...nums) || 0)
            : (Math.max(...nums) || 0)
      }
      return { Group: key, [pivotAgg==='count'?'Count':`${pivotAgg}(${pivotValCol})`]: val, Rows: rows.length }
    }).sort((a, b) => b.Rows - a.Rows)
  }, [result, pivotCol, pivotAgg, pivotValCol])

  const { rows: tabRows, columns: tabCols, highlightDiffs } = getTabData()
  const numCols = data1 ? data1.columns.filter(c => data1.data.some(r => !isNaN(parseFloat(r[c])))) : []

  const TABS = [
    { id: 'matched', label: 'Matched',       icon: CheckCircle,   color: '#10b981', count: result?.summary.matched ?? 0 },
    { id: 'diffs',   label: 'Differences',   icon: AlertTriangle, color: '#f59e0b', count: result?.matched.filter(r=>r._hasDiff).length ?? 0 },
    { id: 'onlyIn1', label: 'Only in File 1',icon: Minus,         color: '#0ea5e9', count: result?.summary.onlyIn1 ?? 0 },
    { id: 'onlyIn2', label: 'Only in File 2',icon: Minus,         color: '#8b5cf6', count: result?.summary.onlyIn2 ?? 0 },
  ]

  const bothLoaded = data1 && data2

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <GitCompare size={28} className="text-sky-400" /> File Comparator
          </h1>
          <p className="text-slate-400 mt-1">Upload files to both panels · auto column mapping · choose key · compare</p>
        </div>
        {(files1.length > 0 || files2.length > 0) && (
          <button onClick={reset} className="btn-ghost"><RotateCcw size={14} />Reset All</button>
        )}
      </div>

      {error && (
        <div className="p-4 text-rose-400 text-sm rounded-xl flex items-center gap-2"
          style={{ background: 'rgba(244,63,94,0.05)', border: '1px solid rgba(244,63,94,0.3)' }}>
          <AlertTriangle size={16} />{error}
        </div>
      )}

      {/* STEP 1 — Two upload panels side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="glass p-5">
          <FilePanel label="File 1 (Primary)" color="#0ea5e9"
            files={files1} loading={loading1} inputId="input-f1"
            onAdd={f => addToPanel(f, setFiles1, setLoading1, 1)}
            onRemove={i => { setFiles1(p => p.filter((_, j) => j !== i)); setResult(null); setMappingConfirmed(false) }}
          />
          {files1.length > 1 && (
            <div className="mt-3 space-y-1">
              <label className="text-xs text-slate-400">Select file to use:</label>
              <select value={sel1} onChange={e => { setSel1(+e.target.value); setResult(null); setMappingConfirmed(false) }} className="input text-xs">
                {files1.map(({ file }, i) => <option key={i} value={i}>{file.name}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="glass p-5">
          <FilePanel label="File 2 (Compare Against)" color="#8b5cf6"
            files={files2} loading={loading2} inputId="input-f2"
            onAdd={f => addToPanel(f, setFiles2, setLoading2, 2)}
            onRemove={i => { setFiles2(p => p.filter((_, j) => j !== i)); setResult(null); setMappingConfirmed(false) }}
          />
          {files2.length > 1 && (
            <div className="mt-3 space-y-1">
              <label className="text-xs text-slate-400">Select file to use:</label>
              <select value={sel2} onChange={e => { setSel2(+e.target.value); setResult(null); setMappingConfirmed(false) }} className="input text-xs">
                {files2.map(({ file }, i) => <option key={i} value={i}>{file.name}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* STEP 2 — Column mapping check */}
      {bothLoaded && !mappingConfirmed && (
        <div className="glass p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Link2 size={18} className="text-sky-400" /> Column Mapping
            </h2>
            {allMatched
              ? <span className="badge-green">✓ All columns matched automatically</span>
              : <span className="badge-amber">⚠ {unmatchedCols.length} column(s) need manual mapping</span>}
          </div>

          <p className="text-xs text-slate-400 flex items-start gap-1.5">
            <Info size={13} className="flex-shrink-0 mt-0.5 text-sky-400" />
            Columns are matched after removing special characters and lowercasing.
            {allMatched ? ' All columns aligned — no manual mapping needed.' : ' Adjust unmatched columns below, then confirm.'}
          </p>

          {/* Mapping table */}
          <div className="overflow-auto rounded-xl border border-white/10 max-h-80">
            <table className="df-table min-w-full text-xs">
              <thead className="sticky top-0 z-10">
                <tr>
                  <th>Target Column</th>
                  <th>File 1 Column</th>
                  <th className="text-center w-10">Match</th>
                  <th>File 2 Column</th>
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
                    onChange1={val => setColMapping(p => ({ ...p, [target]: { ...p[target], f1: val } }))}
                    onChange2={val => setColMapping(p => ({ ...p, [target]: { ...p[target], f2: val } }))}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={() => setMappingConfirmed(true)}
            className="btn-primary w-full justify-center py-2.5">
            <CheckCircle size={15} /> Confirm Mapping &amp; Continue
            <ArrowRight size={15} />
          </button>
        </div>
      )}

      {/* STEP 3 — Key column + run */}
      {bothLoaded && mappingConfirmed && !result && (
        <div className="glass p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">Comparison Settings</h2>
            <button onClick={() => setMappingConfirmed(false)} className="btn-ghost text-xs py-1.5 px-3">
              ← Edit Mapping
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Key column <span className="text-rose-400">*</span></label>
              <select value={keyCol} onChange={e => setKeyCol(e.target.value)} className="input">
                <option value="">Select key column…</option>
                {keyOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <p className="text-xs text-slate-500">Rows will be matched by this column's value.</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Files selected</label>
              <div className="glass-darker rounded-xl px-4 py-3 space-y-1">
                <p className="text-xs text-slate-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-400 flex-shrink-0" />
                  File 1: <span className="text-white font-medium truncate">{files1[sel1]?.file.name}</span>
                  <span className="text-slate-500">({data1?.rowCount?.toLocaleString()} rows)</span>
                </p>
                <p className="text-xs text-slate-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-400 flex-shrink-0" />
                  File 2: <span className="text-white font-medium truncate">{files2[sel2]?.file.name}</span>
                  <span className="text-slate-500">({data2?.rowCount?.toLocaleString()} rows)</span>
                </p>
              </div>
            </div>
          </div>

          <button onClick={handleRun} disabled={!keyCol || runLoading}
            className="btn-primary w-full justify-center py-3 text-base disabled:opacity-40 disabled:cursor-not-allowed">
            {runLoading
              ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Running comparison…</>
              : <><Play size={16} />Run Comparison</>}
          </button>
        </div>
      )}

      {/* STEP 4 — Results */}
      {result && (
        <div className="space-y-6">

          {/* Back + summary row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button onClick={() => { setResult(null); setMappingConfirmed(true) }} className="btn-ghost text-sm py-2 px-3">
              ← Change Settings
            </button>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'File 1 rows',    value: result.summary.total1,   bg: 'rgba(14,165,233,0.1)',  color: '#38bdf8' },
                { label: 'File 2 rows',    value: result.summary.total2,   bg: 'rgba(139,92,246,0.1)', color: '#a78bfa' },
                { label: '✓ Matched',      value: result.summary.matched,  bg: 'rgba(16,185,129,0.1)', color: '#34d399' },
                { label: '⚠ Only File 1', value: result.summary.onlyIn1,  bg: 'rgba(245,158,11,0.1)', color: '#fbbf24' },
                { label: '⚠ Only File 2', value: result.summary.onlyIn2,  bg: 'rgba(139,92,246,0.1)', color: '#c084fc' },
                { label: 'Match %',        value: result.summary.matchPct+'%', bg: 'rgba(14,165,233,0.1)', color: '#38bdf8' },
              ].map(({ label, value, bg, color }) => (
                <div key={label} className="px-3 py-2 rounded-xl text-center min-w-[90px]" style={{ background: bg }}>
                  <p className="text-lg font-bold font-mono" style={{ color }}>{value.toLocaleString()}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="glass p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1.5">
                {TABS.map(({ id, label, icon: Icon, color, count }) => (
                  <button key={id} onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all
                      ${activeTab===id ? 'bg-white/10 text-white border border-white/20' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}>
                    <Icon size={14} style={activeTab===id?{color}:{}} />
                    {label}
                    <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-white/10">{count}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleExport('csv', tabRows, tabCols)} className="btn-ghost text-xs py-1.5 px-3">
                  <Download size={12} />CSV
                </button>
                <button onClick={() => handleExport('excel', tabRows, tabCols)} className="btn-ghost text-xs py-1.5 px-3">
                  <Download size={12} />Excel
                </button>
              </div>
            </div>

            <MiniTable columns={tabCols} rows={tabRows} highlightDiffs={highlightDiffs}
              emptyMsg={`No records in "${TABS.find(t=>t.id===activeTab)?.label}" category.`} />
          </div>

          {/* Pivot analysis */}
          <div className="glass p-5 space-y-4">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              📊 Pivot / Group Analysis
            </h3>
            <div className="flex flex-wrap gap-3">
              <div className="space-y-1 flex-1 min-w-[160px]">
                <label className="text-xs text-slate-400">Group by column</label>
                <select value={pivotCol} onChange={e => setPivotCol(e.target.value)} className="input text-xs">
                  <option value="">Select column…</option>
                  {keyOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1 flex-1 min-w-[120px]">
                <label className="text-xs text-slate-400">Aggregation</label>
                <select value={pivotAgg} onChange={e => setPivotAgg(e.target.value)} className="input text-xs">
                  {['count','sum','avg','min','max'].map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              {pivotAgg !== 'count' && (
                <div className="space-y-1 flex-1 min-w-[160px]">
                  <label className="text-xs text-slate-400">Value column</label>
                  <select value={pivotValCol} onChange={e => setPivotValCol(e.target.value)} className="input text-xs">
                    <option value="">Select…</option>
                    {numCols.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}
            </div>

            {pivotCol && pivotData.length > 0 && (
              <>
                <MiniTable
                  columns={Object.keys(pivotData[0])}
                  rows={pivotData}
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => exportToCSV(pivotData, `pivot_${Date.now()}.csv`)} className="btn-ghost text-xs py-1.5 px-3">
                    <Download size={12} />Export Pivot CSV
                  </button>
                </div>
              </>
            )}
            {pivotCol && pivotData.length === 0 && (
              <p className="text-xs text-slate-500">No data for selected column.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}