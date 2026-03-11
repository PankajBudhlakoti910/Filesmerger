// src/hooks/useAuth.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthChange, isAdmin } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(undefined) // undefined = loading
  const [admin,   setAdmin]   = useState(false)

  useEffect(() => {
    const unsub = onAuthChange(u => {
      setUser(u)
      setAdmin(isAdmin(u))
    })
    return unsub
  }, [])

  return (
    <AuthContext.Provider value={{ user, admin, loading: user === undefined }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
