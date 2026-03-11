// src/utils/compareEngine.js
// Core comparison logic — framework-agnostic, pure functions

/**
 * Compare two datasets on a given key column.
 *
 * @param {Object[]} data1      - Array of row objects from file 1
 * @param {Object[]} data2      - Array of row objects from file 2
 * @param {string}   keyColumn  - The column to match rows on
 * @param {string[]} compareColumns - Columns to compare for differences (optional)
 *
 * @returns {{
 *   matched:     Object[],   // rows present in both files (with diff markers)
 *   onlyInFile1: Object[],   // rows missing from file 2
 *   onlyInFile2: Object[],   // rows missing from file 1
 *   summary: { total1, total2, matched, onlyIn1, onlyIn2, diffCount }
 * }}
 */
export function compareDatasets(data1, data2, keyColumn, compareColumns = []) {
  const normalize = (val) => String(val ?? '').trim().toLowerCase()

  // Build lookup maps keyed by the key column value
  const map1 = new Map()
  const map2 = new Map()

  data1.forEach(row => {
    const k = normalize(row[keyColumn])
    if (k !== '') map1.set(k, row)
  })
  data2.forEach(row => {
    const k = normalize(row[keyColumn])
    if (k !== '') map2.set(k, row)
  })

  const matched     = []
  const onlyInFile1 = []
  const onlyInFile2 = []
  let   diffCount   = 0

  // Check every row in file 1
  map1.forEach((row1, key) => {
    if (map2.has(key)) {
      const row2 = map2.get(key)
      const diffs = {}
      let   hasDiff = false

      compareColumns.forEach(col => {
        const v1 = normalize(row1[col])
        const v2 = normalize(row2[col])
        if (v1 !== v2) {
          diffs[col] = { file1: row1[col], file2: row2[col] }
          hasDiff = true
        }
      })

      if (hasDiff) diffCount++

      matched.push({
        _key:      row1[keyColumn],
        _hasDiff:  hasDiff,
        _diffs:    diffs,
        ...prefixKeys(row1, 'f1_'),
        ...prefixKeys(row2, 'f2_'),
      })
    } else {
      onlyInFile1.push({ _key: row1[keyColumn], ...row1 })
    }
  })

  // Rows in file 2 not in file 1
  map2.forEach((row2, key) => {
    if (!map1.has(key)) {
      onlyInFile2.push({ _key: row2[keyColumn], ...row2 })
    }
  })

  return {
    matched,
    onlyInFile1,
    onlyInFile2,
    summary: {
      total1:    data1.length,
      total2:    data2.length,
      matched:   matched.length,
      onlyIn1:   onlyInFile1.length,
      onlyIn2:   onlyInFile2.length,
      diffCount,
    },
  }
}

function prefixKeys(obj, prefix) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [`${prefix}${k}`, v])
  )
}

/**
 * Find columns that exist in both datasets (intersection).
 */
export function commonColumns(cols1, cols2) {
  const set2 = new Set(cols2)
  return cols1.filter(c => set2.has(c))
}
