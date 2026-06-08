import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import type { Permission } from '../types/admin'
import { ForbiddenState, LoadingState } from './ui'

export function AdminProtectedRoute({ permission }: { permission?: Permission | Permission[] }) {
  const { session, isLoading, can } = useAuth()
  const location = useLocation()

  if (isLoading) return <LoadingState />

  if (!session?.isAdmin) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />
  }

  if (!can(permission)) {
    return <ForbiddenState />
  }

  return <Outlet />
}
