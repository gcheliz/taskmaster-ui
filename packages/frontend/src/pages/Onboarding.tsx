import React, { useEffect } from 'react'
import { useNavigate, useLocation } from "react-router-dom"
import { OnboardingFlow } from '../components/Onboarding'
import { useAuth } from '../hooks/useAuth'

const Onboarding = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated } = useAuth()
  
  // Get user data from location state (passed from registration)
  const locationState = location.state as { 
    userName?: string
    userRole?: string
    isNewUser?: boolean
  } | null
  
  const userName = locationState?.userName || user?.name || 'User'
  const userRole = locationState?.userRole || user?.role || 'developer'
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/auth', { replace: true })
    }
    
    // If user is not new, redirect to dashboard
    // TODO: Add hasCompletedOnboarding to User interface and check it here
    if (!locationState?.isNewUser) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, user, locationState, navigate])
  
  const handleOnboardingComplete = async () => {
    // Mark onboarding as complete in the backend
    try {
      // TODO: Call API to update user's onboarding status
      // await updateUserOnboardingStatus(true)
      
      // For now, just navigate to dashboard
      navigate('/dashboard', { replace: true })
    } catch (error) {
      logger.error('Failed to update onboarding status:', error)
      // Still navigate to dashboard even if update fails
      navigate('/dashboard', { replace: true })
    }
  }
  
  if (!isAuthenticated) {
    return null // Will redirect via useEffect
  }
  
  return (
    <OnboardingFlow
      userName={userName}
      userRole={userRole}
      onComplete={handleOnboardingComplete}
    />
  )
}

export default Onboarding