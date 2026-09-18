import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import { RequireAuth } from './RequireAuth'

type RoleRouteProps = {
  roles: string | string[]
  children: ReactNode
  fallback?: string
}

export function RoleRoute({ roles, children, fallback = '/login' }: RoleRouteProps) {
  const allowed = (Array.isArray(roles) ? roles : [roles]).map((r) => r.toLowerCase())

  return (
    <RequireAuth>
      <RoleGate allowed={allowed} fallback={fallback}>
        {children}
      </RoleGate>
    </RequireAuth>
  )
}

function RoleGate({
  allowed,
  fallback,
  children,
}: {
  allowed: string[]
  fallback: string
  children: ReactNode
}) {
  const { user } = useAuth()
  const role = (user?.role || '').toLowerCase()

  if (!allowed.includes(role)) {
    return (
      <Navigate
        to={fallback}
        replace
        state={{ message: `Access denied for role "${user?.role ?? 'unknown'}".` }}
      />
    )
  }

  return <>{children}</>
}
