// src/firebase/config.js
// Central Firebase initialization — imported by all services

import { initializeApp } from 'firebase/app'
import { getFirestore }   from 'firebase/firestore'
import { getAuth }        from 'firebase/auth'
import { getAnalytics, isSupported } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: "AIzaSyDSAlOWtOm8lKFwUcaKbqr20lfE4x0f-qw",
  authDomain: "dataforge-f3a63.firebaseapp.com",
  projectId: "dataforge-f3a63",
  storageBucket: "dataforge-f3a63.firebasestorage.app",
  messagingSenderId: "89877466507",
  appId: "1:89877466507:web:51009f1adb8a047344338e",
  measurementId: "G-NHKRSCYYZ5"
};

// Validate config on startup
const missingKeys = Object.entries(firebaseConfig)
  .filter(([, v]) => !v)
  .map(([k]) => k)

if (missingKeys.length > 0) {
  console.warn(
    '[DataForge] Missing Firebase env vars:',
    missingKeys.join(', '),
    '\nCopy .env.example → .env and fill in your values.'
  )
}

const app = initializeApp(firebaseConfig)

export const db      = getFirestore(app)
export const auth    = getAuth(app)

// Analytics only runs in browsers that support it (not SSR / older browsers)
export let analytics = null
isSupported().then(yes => {
  if (yes) analytics = getAnalytics(app)
}).catch(() => {})

export default app
