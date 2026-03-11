import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import Layout        from './components/layout/Layout'
import HomePage      from './pages/HomePage'
import ComparePage   from './pages/ComparePage'
import MergePage     from './pages/MergePage'
import RequestPage   from './pages/RequestPage'
import LoginPage     from './pages/LoginPage'
import AdminPage     from './pages/AdminPage'
import { useAuth }   from './hooks/useAuth'
import { trackVisit } from './services/analyticsService'

function RequireAdmin({ children }) {
  const { admin, loading } = useAuth()
  if (loading) return null
  return admin ? children : <Navigate to="/" replace />
}

export default function App() {
  const { user } = useAuth()
  useEffect(() => { trackVisit(user?.uid) }, []) // eslint-disable-line

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/"        element={<HomePage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/merge"   element={<MergePage />} />
        <Route path="/request" element={<RequestPage />} />
        <Route path="/login"   element={<LoginPage />} />
        <Route path="/admin"   element={<RequireAdmin><AdminPage /></RequireAdmin>} />
      </Route>
    </Routes>
  )
}
