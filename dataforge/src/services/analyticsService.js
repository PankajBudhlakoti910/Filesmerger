// src/services/analyticsService.js
// Tracks all user activity to Firestore for the admin dashboard

import {
  collection, addDoc, doc, setDoc, getDoc,
  updateDoc, increment, serverTimestamp, query,
  orderBy, limit, getDocs, where, Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { v4 as uuidv4 } from 'uuid'

// ── Session management ────────────────────────────────────────────────────────

const SESSION_KEY = 'dataforge_session_id'

export function getOrCreateSessionId() {
  let sid = sessionStorage.getItem(SESSION_KEY)
  if (!sid) {
    sid = uuidv4()
    sessionStorage.setItem(SESSION_KEY, sid)
  }
  return sid
}

// ── Visit tracking ────────────────────────────────────────────────────────────

export async function trackVisit(userId = null) {
  try {
    const sessionId = getOrCreateSessionId()
    const today     = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

    // Log the individual visit event
    await addDoc(collection(db, 'visits'), {
      sessionId,
      userId:    userId ?? 'anonymous',
      timestamp: serverTimestamp(),
      userAgent: navigator.userAgent,
      referrer:  document.referrer || 'direct',
      date:      today,
    })

    // Increment the daily counter (upsert pattern)
    const dayRef = doc(db, 'daily_stats', today)
    const snap   = await getDoc(dayRef)
    if (snap.exists()) {
      await updateDoc(dayRef, { visits: increment(1) })
    } else {
      await setDoc(dayRef, { date: today, visits: 1, comparisons: 0, uploads: 0 })
    }

    // Increment total stats
    const totalsRef = doc(db, 'totals', 'global')
    const totSnap   = await getDoc(totalsRef)
    if (totSnap.exists()) {
      await updateDoc(totalsRef, { totalVisits: increment(1) })
    } else {
      await setDoc(totalsRef, { totalVisits: 1, totalComparisons: 0, totalUploads: 0 })
    }
  } catch (err) {
    // Analytics failures must never break the app
    console.warn('[Analytics] trackVisit failed:', err)
  }
}

// ── File upload tracking ──────────────────────────────────────────────────────

export async function trackUpload({ fileName, fileSize, rowCount, userId = null }) {
  try {
    const today = new Date().toISOString().slice(0, 10)
    await addDoc(collection(db, 'activity_log'), {
      type:      'upload',
      sessionId: getOrCreateSessionId(),
      userId:    userId ?? 'anonymous',
      fileName,
      fileSize,
      rowCount,
      timestamp: serverTimestamp(),
    })

    await updateDoc(doc(db, 'daily_stats', today), { uploads: increment(1) }).catch(() => {})
    await updateDoc(doc(db, 'totals', 'global'), { totalUploads: increment(1) }).catch(() => {})
  } catch (err) {
    console.warn('[Analytics] trackUpload failed:', err)
  }
}

// ── Comparison tracking ───────────────────────────────────────────────────────

export async function trackComparison({ file1Name, file2Name, matchedCount, missingCount, userId = null }) {
  try {
    const today = new Date().toISOString().slice(0, 10)
    await addDoc(collection(db, 'activity_log'), {
      type:         'comparison',
      sessionId:    getOrCreateSessionId(),
      userId:       userId ?? 'anonymous',
      file1Name,
      file2Name,
      matchedCount,
      missingCount,
      totalRows:    matchedCount + missingCount,
      timestamp:    serverTimestamp(),
    })

    await updateDoc(doc(db, 'daily_stats', today), { comparisons: increment(1) }).catch(() => {})
    await updateDoc(doc(db, 'totals', 'global'), { totalComparisons: increment(1) }).catch(() => {})
  } catch (err) {
    console.warn('[Analytics] trackComparison failed:', err)
  }
}

// ── Admin data fetchers ───────────────────────────────────────────────────────

export async function fetchGlobalTotals() {
  try {
    const snap = await getDoc(doc(db, 'totals', 'global'))
    return snap.exists() ? snap.data() : { totalVisits: 0, totalComparisons: 0, totalUploads: 0 }
  } catch (err) {
    console.warn('[Analytics] fetchGlobalTotals failed:', err)
    return { totalVisits: 0, totalComparisons: 0, totalUploads: 0 }
  }
}

export async function fetchDailyStats(days = 14) {
  try {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    const cutoffStr = cutoff.toISOString().slice(0, 10)

    const q    = query(collection(db, 'daily_stats'), where('date', '>=', cutoffStr), orderBy('date', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map(d => d.data())
  } catch (err) {
    console.warn('[Analytics] fetchDailyStats failed:', err)
    return []
  }
}

export async function fetchRecentActivity(n = 20) {
  try {
    const q    = query(collection(db, 'activity_log'), orderBy('timestamp', 'desc'), limit(n))
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (err) {
    console.warn('[Analytics] fetchRecentActivity failed:', err)
    return []
  }
}

export async function fetchUniqueSessions() {
  try {
    const q    = query(collection(db, 'visits'), orderBy('timestamp', 'desc'), limit(500))
    const snap = await getDocs(q)
    const ids  = new Set(snap.docs.map(d => d.data().sessionId))
    return ids.size
  } catch (err) {
    console.warn('[Analytics] fetchUniqueSessions failed:', err)
    return 0
  }
}
