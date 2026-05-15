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
      <div className="table-wrapper max-h-96 sm:max-h-[600px] rounded-xl border border-white/10">
        <table className="df-table min-w-full">
          <thead>
            <tr>
              {displayCols.map(col => (
                <th key={col} className="whitespace-nowrap">{col.replace(/^f[12]_/, '')}</th>
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
                        className={`${isDiff ? 'text-accent-amber font-medium' : ''} whitespace-nowrap max-w-xs overflow-hidden`}
                        style={{ textOverflow: 'ellipsis' }}
                        title={String(row[col] ?? '')}
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 text-xs sm:text-sm text-slate-400">
          <span className="truncate">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, rows.length)} of {rows.length.toLocaleString()}
          </span>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 sm:p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-mono text-xs px-2 py-1 rounded">{page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1 sm:p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
