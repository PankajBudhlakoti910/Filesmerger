// src/utils/fileParser.js
// Parses CSV and Excel files into flat arrays of objects

import Papa    from 'papaparse'
import ExcelJS from 'exceljs'

/**
 * Parse an uploaded File object.
 * Returns: { data: Array<Object>, columns: string[], rowCount: number }
 */
export function parseFile(file) {
  return new Promise((resolve, reject) => {
    const ext = file.name.split('.').pop().toLowerCase()

    if (ext === 'csv') {
      Papa.parse(file, {
        header:         true,
        skipEmptyLines: true,
        complete: (result) => {
          const data    = result.data
          const columns = result.meta.fields || []
          resolve({ data, columns, rowCount: data.length })
        },
        error: reject,
      })

    } else if (['xlsx', 'xls'].includes(ext)) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const workbook = new ExcelJS.Workbook()
          await workbook.xlsx.load(e.target.result)

          const sheet   = workbook.worksheets[0]
          const rows    = []
          let   columns = []

          sheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) {
              columns = row.values.slice(1).map(v => String(v ?? ''))
            } else {
              const obj = {}
              columns.forEach((col, i) => {
                const cell = row.values[i + 1]
                obj[col] = cell?.result ?? cell ?? ''
              })
              rows.push(obj)
            }
          })

          resolve({ data: rows, columns, rowCount: rows.length })
        } catch (err) {
          reject(err)
        }
      }
      reader.onerror = reject
      reader.readAsArrayBuffer(file)

    } else {
      reject(new Error(`Unsupported file type: .${ext}`))
    }
  })
}

/**
 * Export data array to CSV and trigger browser download.
 */
export function exportToCSV(data, filename = 'export.csv') {
  const csv  = Papa.unparse(data)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href     = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Export data array to Excel (.xlsx) using ExcelJS and trigger browser download.
 */
export async function exportToExcel(data, filename = 'export.xlsx') {
  const workbook  = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Results')

  if (data.length === 0) return

  const columns = Object.keys(data[0])
  worksheet.addRow(columns)
  worksheet.getRow(1).font = { bold: true }

  data.forEach(row => {
    worksheet.addRow(columns.map(col => row[col] ?? ''))
  })

  worksheet.columns.forEach((col, i) => {
    const maxLen = Math.max(
      columns[i].length,
      ...data.map(r => String(r[columns[i]] ?? '').length)
    )
    col.width = Math.min(maxLen + 2, 50)
  })

  const buffer = await workbook.xlsx.writeBuffer()
  const blob   = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url  = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href     = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Format file size bytes to human-readable string.
 */
export function formatFileSize(bytes) {
  if (bytes < 1024)       return `${bytes} B`
  if (bytes < 1024 ** 2)  return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 ** 2).toFixed(2)} MB`
}