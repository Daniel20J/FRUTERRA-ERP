import { createContext, useContext, useState, type ReactNode } from 'react'
import { hasSession, SESSION_KEY } from '../services/storageService'

interface AuthState { authenticated: boolean; login: (user: string, password: string) => boolean; logout: () => void }
const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(hasSession)
  function login(user: string, password: string) {
    if (user.trim().toLowerCase() !== 'admin' || password !== 'admin123') return false
    try { sessionStorage.setItem(SESSION_KEY, 'admin') } catch { /* Session remains in memory. */ }
    setAuthenticated(true)
    return true
  }
  function logout() {
    try { sessionStorage.removeItem(SESSION_KEY) } catch { /* Clear memory session too. */ }
    setAuthenticated(false)
  }
  return <AuthContext.Provider value={{ authenticated, login, logout }}>{children}</AuthContext.Provider>
}

// The hook shares this module with its provider so the session has a single source of truth.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('AuthProvider is required')
  return context
}
