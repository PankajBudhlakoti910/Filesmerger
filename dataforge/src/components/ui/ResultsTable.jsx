// src/components/ui/ResultsTable.jsx
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const PAGE_SIZE = 50

export default function ResultsTable({ columns, rows, diffCol = null, highlightDiffs = false }) {
  const [page, setPage] = useState(1)

  if (!rows || rows.length === 0) {
    return (
      <div className="glass-darker p-10 text-center text-slate-500">
        No records to display.
      </div>
    )
  }

  const totalPages = Math.ceil(rows.length / PAGE_SIZE)
  const slice      = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const displayCols = columns.filter(c => !c.startsWith('_'))

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="df-table min-w-full">
          <thead>
            <tr>
              {displayCols.map(col => (
                <th key={col}>{col.replace(/^f[12]_/, '')}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((row, ri) => {
              const hasDiff = highlightDiffs && row._hasDiff
              return (
                <tr key={ri} className={hasDiff ? 'bg-accent-amber/5' : ''}>
                  {displayCols.map(col => {
                    const colName = col.replace(/^f[12]_/, '')
                    const isDiff  = highlightDiffs && row._diffs?.[colName]
                    return (
                      <td
                        key={col}
                        className={isDiff ? 'text-accent-amber font-medium' : ''}
                      >
                        {String(row[col] ?? '')}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, rows.length)} of {rows.length.toLocaleString()}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-mono text-xs">{page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
