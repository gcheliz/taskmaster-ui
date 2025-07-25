import { useNavigate, useLocation } from "react-router"
import type { NavigateOptions } from "react-router"
import { useCallback } from 'react'

// Navigation paths enum for type safety
export const ROUTES = {
  HOME: '/',
  TASKS: '/tasks',
  TASK_DETAIL: (taskId: string) => `/tasks/${taskId}`,
  REPOSITORIES: '/repositories',
  TERMINAL: '/terminal',
  ANALYTICS: '/analytics',
  TEAM: '/team',
  CALENDAR: '/calendar',
  DOCUMENTATION: '/docs',
  SETTINGS: '/settings',
  PROFILE: '/profile',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
} as const

// Custom navigation hook with additional features
export const useAppNavigation = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const navigateTo = useCallback(
    (path: string, options?: NavigateOptions) => {
      navigate(path, options)
    },
    [navigate]
  )

  const navigateBack = useCallback(() => {
    navigate(-1)
  }, [navigate])

  const navigateToLogin = useCallback(
    (from?: string) => {
      navigate(ROUTES.LOGIN, {
        state: { from: from || location.pathname },
        replace: true,
      })
    },
    [navigate, location]
  )

  const navigateToHome = useCallback(() => {
    navigate(ROUTES.HOME, { replace: true })
  }, [navigate])

  const isCurrentPath = useCallback(
    (path: string) => {
      return location.pathname === path
    },
    [location]
  )

  const isChildPath = useCallback(
    (parentPath: string) => {
      return location.pathname.startsWith(parentPath)
    },
    [location]
  )

  return {
    navigateTo,
    navigateBack,
    navigateToLogin,
    navigateToHome,
    isCurrentPath,
    isChildPath,
    currentPath: location.pathname,
    routes: ROUTES,
  }
}
