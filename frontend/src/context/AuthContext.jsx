import { createContext, useContext, useMemo, useState } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)
const TOKEN_KEY = 'ai_project_os_token'
const USER_KEY = 'ai_project_os_user'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null } })
  const login = async (email, password) => { const data = await api.login(email, password); localStorage.setItem(TOKEN_KEY, data.access_token); localStorage.setItem(USER_KEY, JSON.stringify(data.user)); setToken(data.access_token); setUser(data.user); return data.user }
  const logout = () => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); setToken(null); setUser(null) }
  const value = useMemo(() => ({ token, user, login, logout, isAuthenticated: Boolean(token && user) }), [token, user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export const useAuth = () => useContext(AuthContext)
