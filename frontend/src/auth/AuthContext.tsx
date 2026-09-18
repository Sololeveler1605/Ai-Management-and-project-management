import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { login as apiLogin } from '../api/auth'
import type { UserOut } from '../types/api'

const TOKEN_KEY = 'ai_project_os_token'
const USER_KEY = 'ai_project_os_user'
const REMEMBER_KEY = 'ai_project_os_remember'

export type AuthContextValue = {
  access_token: string | null
  user: UserOut | null
  remember_me: boolean
  isAuthenticated: boolean
  login: (email: string, password: string, remember?: boolean) => Promise<UserOut>
  logout: () => void
  loginMessage: string | null
  setLoginMessage: (msg: string | null) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

function readStorage(key: string): string | null {
  return localStorage.getItem(key) ?? sessionStorage.getItem(key)
}

function clearAuthStorage() {
  for (const store of [localStorage, sessionStorage]) {
    store.removeItem(TOKEN_KEY)
    store.removeItem(USER_KEY)
    store.removeItem(REMEMBER_KEY)
  }
}

function persistAuth(token: string, user: UserOut, remember: boolean) {
  clearAuthStorage()
  const store = remember ? localStorage : sessionStorage
  store.setItem(TOKEN_KEY, token)
  store.setItem(USER_KEY, JSON.stringify(user))
  if (remember) {
    localStorage.setItem(REMEMBER_KEY, '1')
  }
}

function loadUser(): UserOut | null {
  const raw = readStorage(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as UserOut
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [access_token, setAccessToken] = useState<string | null>(() => readStorage(TOKEN_KEY))
  const [user, setUser] = useState<UserOut | null>(() => loadUser())
  const [remember_me, setRememberMe] = useState<boolean>(() => localStorage.getItem(REMEMBER_KEY) === '1')
  const [loginMessage, setLoginMessage] = useState<string | null>(null)

  const logout = useCallback(() => {
    clearAuthStorage()
    setAccessToken(null)
    setUser(null)
    setRememberMe(false)
    navigate('/login', { replace: true })
  }, [navigate])

  const login = useCallback(
    async (email: string, password: string, remember = true): Promise<UserOut> => {
      const data = await apiLogin(email, password)
      persistAuth(data.access_token, data.user, remember)
      setAccessToken(data.access_token)
      setUser(data.user)
      setRememberMe(remember)
      setLoginMessage(null)

      const role = (data.user.role || '').toLowerCase()
      if (role === 'admin') {
        navigate('/admin', { replace: true })
      } else if (role === 'client') {
        navigate('/client', { replace: true })
      } else {
        // Other roles (manager/employee/unknown) stay on login with a message
        // until their React pages are wired.
        setLoginMessage(
          role === 'manager' || role === 'employee'
            ? `${role[0].toUpperCase()}${role.slice(1)} workspace is not available in this build yet.`
            : `Unknown role: ${data.user.role}. Contact your administrator.`,
        )
        navigate('/login', { replace: true })
      }
      return data.user
    },
    [navigate],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      access_token,
      user,
      remember_me,
      isAuthenticated: Boolean(access_token && user),
      login,
      logout,
      loginMessage,
      setLoginMessage,
    }),
    [access_token, user, remember_me, login, logout, loginMessage],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
