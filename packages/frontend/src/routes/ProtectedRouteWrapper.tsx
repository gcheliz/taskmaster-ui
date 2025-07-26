import React from 'react'
import { Navigate, useLocation } from "react-router"
import { useAuth } from '../hooks/useAuth'
import { LoadingScreen } from '../components/common/LoadingScreen'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    // Redirect to login page but save the attempted location
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  return children as React.ReactElement
}