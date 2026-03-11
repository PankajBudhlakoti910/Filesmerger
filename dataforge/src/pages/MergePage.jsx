import { useState, useMemo } from 'react'
import {
  Merge, Upload, X, FileSpreadsheet, Play, Download,
  RotateCcw, AlertTriangle, Search, PieChart, Copy,
  Filter, ChevronDown, ChevronUp, Plus, CheckCircle
} from 'lucide-react'
import { parseFile, exportToCSV, exportToExcel, formatFileSize } from '../utils/fileParser'
import { trackUpload } from '../services/analyticsService'
import { useAuth } from '../hooks/useAuth'

const PAGE_SIZE = 100

// ── Normalize column name for matching ──────────────────────────────────────
function normCol(c) {
  return String(c).trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
}

// ── Build merged data from multiple files ───────────────────────────────────
function mergeFiles(filesData, colMapping, addSource) {
  const frames = []
  for (const { file, parsed } of filesData) {
    const colMap = colMapping[file.name] || {}
    const rows = parsed.data.map(row => {
      const out = {}
      Object.entries(colMap).forEach(([target, source]) => {
        out[target] = source ? (row[source] ?? '') : ''
      })
      if (addSource) out['_source_file'] = file.name
      return out
    })
    frames.push(...rows)
  }
  return frames
}

function FileRow({ file, parsed, onRemove }) {
  return (
    <div className="glass-darker flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl">
      <div className="flex items-center gap-3 min-w-0">
        <FileSpreadsheet size={14} className="text-violet-400 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-sm text-white truncate max-w-[260px]">{file.name}</p>
          <p className="text-xs text-slate-500">{formatFileSize(file.size)} · {parsed.rowCount.toLocaleString()} rows</p>
        </div>
      </div>
      <button onClick={onRemove} className="p-1 rounded text-slate-600 hover:text-rose-400 transition-colors flex-shrink-0">
        <X size={14} />
      </button>
    </div>
  )
}

// ── Analysis Panel ───────────────────────────────────────────────────────────
function AnalysisPanel({ data, columns }) {
  const [tab, setTab]         = useState('filter')
  const [search, setSearch]   = useState('')
  const [searchCol, setSearchCol] = useState(columns[0] || '')
  const [filterCol, setFilterCol] = useState(columns[0] || '')
  const [filterVal, setFilterVal] = useState('')
  const [dupCol, setDupCol]   = useState(columns[0] || '')
  const [pivotRow, setPivotRow] = useState(columns[0] || '')
  const [pivotVal, setPivotVal] = useState('')
  const [pivotAgg, setPivotAgg] = useState('count')
  const [page, setPage]       = useState(1)

  const numCols = columns.filter(c => data.some(r => !isNaN(parseFloat(r[c])) && r[c] !== ''))

  // Filter result
  const filtered = useMemo(() => {
    let d = data
    if (tab === 'filter' && filterCol && filterVal)
      d = d.filter(r => String(r[filterCol] ?? '').toLowerCase().includes(filterVal.toLowerCase()))
    if (tab === 'search' && searchCol && search)
      d = d.filter(r => String(r[searchCol] ?? '').toLowerCase().includes(search.toLowerCase()))
    return d
  }, [data, tab, filterCol, filterVal, searchCol, search])

  // Duplicates
  const duplicates = useMemo(() => {
    if (tab !== 'duplicates' || !dupCol) return []
    const seen = {}
    data.forEach((row, i) => {
      const k = String(row[dupCol] ?? '').toLowerCase().trim()
      if (!seen[k]) seen[k] = []
      seen[k].push(i)
    })
    return data.filter((_, i) => {
      const k = String(data[i][dupCol] ?? '').toLowerCase().trim()
      return seen[k].length > 1
    })
  }, [data, tab, dupCol])

  // Pivot
  const pivotResult = useMemo(() => {
    if (tab !== 'pivot' || !pivotRow) return []
    const groups = {}
    data.forEach(row => {
      const k = String(row[pivotRow] ?? '(blank)')
      if (!groups[k]) groups[k] = []
      groups[k].push(row)
    })
    return Object.entries(groups).map(([key, rows]) => {
      const val = pivotVal
        ? pivotAgg === 'count' ? rows.length
          : pivotAgg === 'sum'  ? rows.reduce((a, r) => a + (parseFloat(r[pivotVal]) || 0), 0).toFixed(2)
          : pivotAgg === 'avg'  ? (rows.reduce((a, r) => a + (parseFloat(r[pivotVal]) || 0), 0) / rows.length).toFixed(2)
          : pivotAgg === 'min'  ? Math.min(...rows.map(r => parseFloat(r[pivotVal]) || 0))
          : Math.max(...rows.map(r => parseFloat(r[pivotVal]) || 0))
        : rows.length
      return { group: key, value: val, count: rows.length }
    }).sort((a, b) => b.value - a.value)
  }, [data, tab, pivotRow, pivotVal, pivotAgg])

  const displayData = tab === 'duplicates' ? duplicates : tab === 'pivot' ? pivotResult : filtered
  const totalPages  = Math.ceil(displayData.length / PAGE_SIZE)
  const pageData    = tab === 'pivot' ? pivotResult.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE)
                    : displayData.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE)

  const TABS = [
    { id:'filter',     label:'Filter',      icon:Filter },
    { id:'search',     label:'Search',      icon:Search },
    { id:'duplicates', label:'Duplicates',  icon:Copy },
    { id:'pivot',      label:'Pivot Table', icon:PieChart },
  ]

  const exportCurrent = (fmt) => {
    const rows = tab === 'pivot'
      ? pivotResult.map(r => ({ [pivotRow]: r.group, [`${pivotAgg}${pivotVal?'_'+pivotVal:''}`]: r.value, count: r.count }))
      : displayData
    if (fmt === 'csv')   exportToCSV(rows, `analysis_${tab}.csv`)
    if (fmt === 'excel') exportToExcel(rows, `analysis_${tab}.xlsx`)
  }

  return (
    <div className="glass p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white flex items-center gap-2"><PieChart size={16} className="text-violet-400"/>Analysis</h3>
        <div className="flex gap-2">
          <button onClick={() => exportCurrent('csv')}   className="btn-ghost text-xs py-1.5 px-3"><Download size={12}/>CSV</button>
          <button onClick={() => exportCurrent('excel')} className="btn-ghost text-xs py-1.5 px-3"><Download size={12}/>Excel</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => { setTab(id); setPage(1) }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all
              ${tab===id ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'bg-white/5 text-slate-400 hover:text-slate-200'}`}>
            <Icon size={13}/>{label}
          </button>
        ))}
      </div>

      {/* Filter */}
      {tab === 'filter' && (
        <div className="flex flex-wrap gap-3">
          <select value={filterCol} onChange={e => setFilterCol(e.target.value)} className="input flex-1 min-w-[160px]">
            {columns.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input value={filterVal} onChange={e => { setFilterVal(e.target.value); setPage(1) }}
            placeholder="Filter value…" className="input flex-1 min-w-[200px]" />
        </div>
      )}

      {/* Search */}
      {tab === 'search' && (
        <div className="flex flex-wrap gap-3">
          <select value={searchCol} onChange={e => setSearchCol(e.target.value)} className="input flex-1 min-w-[160px]">
            {columns.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search keyword…" className="input flex-1 min-w-[200px]" />
        </div>
      )}

      {/* Duplicates */}
      {tab === 'duplicates' && (
        <div className="flex flex-wrap gap-3 items-center">
          <select value={dupCol} onChange={e => setDupCol(e.target.value)} className="input flex-1 min-w-[200px]">
            {columns.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <span className="text-sm text-amber-400 font-semibold">{duplicates.length.toLocaleString()} duplicate rows found</span>
        </div>
      )}

      {/* Pivot */}
      {tab === 'pivot' && (
        <div className="flex flex-wrap gap-3">
          <div className="space-y-1 flex-1 min-w-[150px]">
            <label className="text-xs text-slate-400">Group by</label>
            <select value={pivotRow} onChange={e => setPivotRow(e.target.value)} className="input">{columns.map(c=><option key={c} value={c}>{c}</option>)}</select>
          </div>
          <div className="space-y-1 flex-1 min-w-[150px]">
            <label className="text-xs text-slate-400">Value column</label>
            <select value={pivotVal} onChange={e => setPivotVal(e.target.value)} className="input">
              <option value="">— count rows —</option>
              {numCols.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1 flex-1 min-w-[120px]">
            <label className="text-xs text-slate-400">Aggregation</label>
            <select value={pivotAgg} onChange={e => setPivotAgg(e.target.value)} className="input">
              {['count','sum','avg','min','max'].map(a=><option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Results count */}
      <p className="text-xs text-slate-500">
        {tab === 'pivot' ? `${pivotResult.length} groups` : `${displayData.length.toLocaleString()} rows`}
      </p>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10 max-h-[400px] overflow-y-auto">
        <table className="df-table min-w-full">
          <thead className="sticky top-0 z-10">
            <tr>
              {tab === 'pivot'
                ? [pivotRow, `${pivotAgg}${pivotVal?'_'+pivotVal:''}`, 'count'].map(h => <th key={h}>{h}</th>)
                : columns.slice(0,8).map(c => <th key={c}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, i) => (
              <tr key={i}>
                {tab === 'pivot'
                  ? [<td key="g">{row.group}</td>, <td key="v">{row.value}</td>, <td key="c">{row.count}</td>]
                  : columns.slice(0,8).map(c => <td key={c}>{String(row[c]??'')}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page===1} className="btn-ghost py-1 px-2 text-xs disabled:opacity-30">←</button>
            <button onClick={() => setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="btn-ghost py-1 px-2 text-xs disabled:opacity-30">→</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main MergePage ──────────────────────────────────────────────────────────
export default function MergePage() {
  const { user } = useAuth()

  const [filesData,  setFilesData]  = useState([])   // [{file, parsed}]
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')
  const [mergedData, setMergedData] = useState(null)
  const [colMapping, setColMapping] = useState({})   // {filename: {targetCol: sourceCol}}
  const [addSource,  setAddSource]  = useState(true)
  const [exportFmt,  setExportFmt]  = useState('csv')
  const [showMapping, setShowMapping] = useState(false)
  const [step, setStep] = useState(1) // 1=upload, 2=mapping, 3=merged

  // Build canonical columns from first file
  const baseColumns = useMemo(() => {
    if (filesData.length === 0) return []
    return filesData[0].parsed.columns
  }, [filesData])

  // Auto-build column mapping using normalization
  const autoMapping = useMemo(() => {
    if (filesData.length === 0 || baseColumns.length === 0) return {}
    const mapping = {}
    for (const { file, parsed } of filesData) {
      mapping[file.name] = {}
      const normBase = baseColumns.map(c => ({ orig: c, norm: normCol(c) }))
      for (const target of baseColumns) {
        const targetNorm = normCol(target)
        const match = parsed.columns.find(c => normCol(c) === targetNorm)
        mapping[file.name][target] = match || null
      }
    }
    return mapping
  }, [filesData, baseColumns])

  const addFiles = async (newFiles) => {
    setError('')
    if (filesData.length + newFiles.length > 80) {
      setError('Maximum 80 files allowed.')
      return
    }
    setLoading(true)
    const added = []
    for (const file of Array.from(newFiles)) {
      try {
        const parsed = await parseFile(file)
        added.push({ file, parsed })
        await trackUpload({ fileName: file.name, fileSize: file.size, rowCount: parsed.rowCount, userId: user?.uid })
      } catch (e) { setError(`Could not parse ${file.name}: ${e.message}`) }
    }
    setFilesData(prev => [...prev, ...added])
    setMergedData(null)
    setLoading(false)
  }

  const removeFile = (idx) => {
    setFilesData(prev => prev.filter((_, i) => i !== idx))
    setMergedData(null)
  }

  const handleMerge = () => {
    setLoading(true)
    setError('')
    setTimeout(() => {
      try {
        const mapping = Object.keys(colMapping).length > 0 ? colMapping : autoMapping
        const merged  = mergeFiles(filesData, mapping, addSource)
        setMergedData(merged)
        setStep(3)
      } catch (e) { setError(`Merge error: ${e.message}`) }
      setLoading(false)
    }, 50)
  }

  const handleExport = () => {
    if (!mergedData) return
    const name = `merged_${Date.now()}`
    if (exportFmt === 'csv')   exportToCSV(mergedData, `${name}.csv`)
    if (exportFmt === 'excel') exportToExcel(mergedData, `${name}.xlsx`)
    if (exportFmt === 'json') {
      const blob = new Blob([JSON.stringify(mergedData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = `${name}.json`; a.click()
    }
  }

  const reset = () => { setFilesData([]); setMergedData(null); setColMapping({}); setError(''); setStep(1) }
  const totalRows = filesData.reduce((a, { parsed }) => a + parsed.rowCount, 0)
  const mergedColumns = mergedData && mergedData.length > 0 ? Object.keys(mergedData[0]) : []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Merge size={28} className="text-violet-400" /> File Merger
          </h1>
          <p className="text-slate-400 mt-1">Merge up to 80 CSV/Excel files. Auto column mapping. Analyse & export.</p>
        </div>
        {filesData.length > 0 && <button onClick={reset} className="btn-ghost"><RotateCcw size={14}/>Reset</button>}
      </div>

      {error && (
        <div className="p-4 text-rose-400 text-sm rounded-xl flex items-center gap-2" style={{background:'rgba(244,63,94,0.05)',border:'1px solid rgba(244,63,94,0.3)'}}>
          <AlertTriangle size={16}/>{error}
        </div>
      )}

      {/* STEP 1 — Upload */}
      <div className="space-y-4">
        <div
          className="drop-zone"
          onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('active') }}
          onDragLeave={e => e.currentTarget.classList.remove('active')}
          onDrop={e => { e.currentTarget.classList.remove('active'); e.preventDefault(); e.dataTransfer.files?.length && addFiles(e.dataTransfer.files) }}
          onClick={() => document.getElementById('merge-input').click()}
        >
          <input id="merge-input" type="file" multiple accept=".csv,.xlsx,.xls" className="hidden"
            onChange={e => e.target.files?.length && addFiles(e.target.files)} />
          <Upload size={32} className="mx-auto mb-3 text-slate-500" />
          <p className="font-semibold text-slate-300">Drop up to 80 files here</p>
          <p className="text-sm text-slate-500 mt-1">CSV or Excel · All files should share the same columns</p>
          {loading && <p className="text-violet-400 text-sm mt-3 animate-pulse">Parsing files…</p>}
        </div>

        {filesData.length > 0 && (
          <div className="glass p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">
                {filesData.length} file{filesData.length>1?'s':''} ·{' '}
                <span className="text-violet-400">{totalRows.toLocaleString()} total rows</span>
              </p>
              <button onClick={() => document.getElementById('merge-input').click()} className="btn-ghost text-xs py-1.5 px-3">
                <Plus size={13}/>Add more
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1.5">
              {filesData.map(({ file, parsed }, i) => (
                <FileRow key={i} file={file} parsed={parsed} onRemove={() => removeFile(i)} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* STEP 2 — Column mapping preview */}
      {filesData.length >= 2 && (
        <div className="glass p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-400"/>
              Column Mapping (auto-detected)
            </h2>
            <button onClick={() => setShowMapping(v => !v)} className="btn-ghost text-xs py-1.5 px-3">
              {showMapping ? <><ChevronUp size={13}/>Hide</> : <><ChevronDown size={13}/>Review</>}
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Base columns taken from <span className="text-white font-medium">{filesData[0].file.name}</span>.
            Columns in other files are matched by name (case-insensitive). Missing columns will be blank.
          </p>

          {showMapping && (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="df-table min-w-full text-xs">
                <thead>
                  <tr>
                    <th>Target Column</th>
                    {filesData.map(({ file }) => <th key={file.name} className="max-w-[120px] truncate">{file.name}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {baseColumns.map(col => (
                    <tr key={col}>
                      <td className="font-medium text-white">{col}</td>
                      {filesData.map(({ file, parsed }) => {
                        const mapped = autoMapping[file.name]?.[col]
                        return (
                          <td key={file.name}>
                            {mapped
                              ? <span className="badge-green">{mapped}</span>
                              : <span className="badge-rose">missing</span>}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={addSource} onChange={e => setAddSource(e.target.checked)} className="w-4 h-4 accent-violet-500" />
              <span className="text-sm text-slate-300">Add _source_file column</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Export format:</span>
              {['csv','excel','json'].map(f => (
                <button key={f} onClick={() => setExportFmt(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase transition-all
                    ${exportFmt===f ? 'bg-violet-500/30 text-violet-300 border border-violet-500/30' : 'bg-white/5 text-slate-400 hover:text-slate-200'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleMerge} disabled={loading}
            className="btn-primary w-full justify-center py-3 text-base disabled:opacity-40"
            style={{background:'linear-gradient(135deg,#8b5cf6,#6d28d9)'}}>
            {loading
              ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Merging…</>
              : <><Play size={16}/>Merge {filesData.length} Files</>}
          </button>
        </div>
      )}

      {/* STEP 3 — Merged result */}
      {mergedData && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label:'Files merged',   value:filesData.length,             color:'border-t-violet-500' },
              { label:'Total rows',     value:mergedData.length.toLocaleString(), color:'border-t-violet-500' },
              { label:'Columns',        value:mergedColumns.length,          color:'border-t-sky-500' },
              { label:'Export format',  value:exportFmt.toUpperCase(),       color:'border-t-emerald-500' },
            ].map(({ label, value, color }) => (
              <div key={label} className={`stat-card border-t-2 ${color}`}>
                <p className="text-2xl font-bold font-mono text-white">{value}</p>
                <p className="text-xs text-slate-400">{label}</p>
              </div>
            ))}
          </div>

          {/* Download */}
          <div className="glass p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-white">Merged file ready</p>
              <p className="text-xs text-slate-400 mt-0.5">{mergedData.length.toLocaleString()} rows · {mergedColumns.length} columns</p>
            </div>
            <div className="flex gap-3 items-center flex-wrap">
              <div className="flex gap-1">
                {['csv','excel','json'].map(f => (
                  <button key={f} onClick={() => setExportFmt(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all
                      ${exportFmt===f ? 'bg-violet-500/30 text-violet-300 border border-violet-500/30' : 'bg-white/5 text-slate-400 hover:text-slate-200'}`}>
                    {f}
                  </button>
                ))}
              </div>
              <button onClick={handleExport} className="btn-primary"
                style={{background:'linear-gradient(135deg,#10b981,#059669)'}}>
                <Download size={16}/>Download {exportFmt.toUpperCase()}
              </button>
            </div>
          </div>

          {/* Preview table */}
          <div className="glass p-5 space-y-3">
            <p className="text-sm font-semibold text-white">Preview (first 100 rows)</p>
            <div className="overflow-x-auto rounded-xl border border-white/10 max-h-72 overflow-y-auto">
              <table className="df-table min-w-full text-xs">
                <thead className="sticky top-0 z-10">
                  <tr>{mergedColumns.slice(0,10).map(c => <th key={c}>{c}</th>)}</tr>
                </thead>
                <tbody>
                  {mergedData.slice(0,100).map((row, i) => (
                    <tr key={i}>{mergedColumns.slice(0,10).map(c => <td key={c}>{String(row[c]??'')}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
            {mergedColumns.length > 10 && (
              <p className="text-xs text-slate-500">Showing first 10 of {mergedColumns.length} columns. Download to see all.</p>
            )}
          </div>

          {/* Analysis */}
          <AnalysisPanel data={mergedData} columns={mergedColumns.filter(c => c !== '_source_file')} />
        </div>
      )}
    </div>
  )
}
