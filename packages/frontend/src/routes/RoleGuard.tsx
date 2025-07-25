import { Navigate, Outlet } from "react-router"
import { useAuth } from '../hooks/useAuth'

export interface RoleGuardProps {
  allowedRoles: Array<'developer' | 'team_lead' | 'manager'>
  redirectTo?: string
}

export const RoleGuard = ({ allowedRoles, redirectTo = '/' }: RoleGuardProps) => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}
