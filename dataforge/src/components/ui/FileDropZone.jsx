// src/components/ui/FileDropZone.jsx
import { useRef, useState } from 'react'
import { Upload, FileSpreadsheet, X } from 'lucide-react'
import { formatFileSize } from '../../utils/fileParser'

export default function FileDropZone({ label, file, onFile, accept = '.csv,.xlsx,.xls' }) {
  const inputRef   = useRef(null)
  const [drag, setDrag] = useState(false)

  const handleFile = (f) => {
    if (f) onFile(f)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDrag(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }

  if (file) {
    return (
      <div className="glass p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-green/10 flex items-center justify-center flex-shrink-0">
            <FileSpreadsheet size={18} className="text-accent-green" />
          </div>
          <div>
            <p className="font-medium text-white text-sm truncate max-w-[220px]">{file.name}</p>
            <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
          </div>
        </div>
        <button
          onClick={() => onFile(null)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 transition-colors flex-shrink-0"
        >
          <X size={16} />
        </button>
      </div>
    )
  }

  return (
    <div
      className={`drop-zone ${drag ? 'active' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <Upload size={32} className="mx-auto mb-3 text-slate-500" />
      <p className="font-semibold text-slate-300">{label}</p>
      <p className="text-sm text-slate-500 mt-1">
        Drop a file here or <span className="text-brand-400">click to browse</span>
      </p>
      <p className="text-xs text-slate-600 mt-2">Supports CSV, XLSX, XLS</p>
    </div>
  )
}
