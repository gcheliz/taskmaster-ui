import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AuthPage as AuthPageComponent } from '../components/Auth/AuthPage'
import { useAuth } from '../hooks/useAuth'

const Auth = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { login, register } = useAuth()
  
  // Determine default tab based on URL
  const isRegisterPath = location.pathname.includes('register')
  const defaultTab = isRegisterPath ? 'register' : 'login'
  
  // Get the redirect location from state
  const from = location.state?.from?.pathname || '/'
  
  const handleAuthSuccess = async (type: 'login' | 'register', data: any) => {
    try {
      if (type === 'login') {
        await login(data.email, data.password)
        // Redirect to the intended page or dashboard
        navigate(from, { replace: true })
      } else {
        await register({
          email: data.email,
          password: data.password,
          name: data.name,
          role: data.role,
        })
        // Redirect new users to onboarding
        navigate('/onboarding', { 
          replace: true,
          state: {
            userName: data.name,
            userRole: data.role,
            isNewUser: true
          }
        })
      }
    } catch (error) {
      console.error(`${type} failed:`, error)
      // Error handling is done in the form components
    }
  }
  
  return (
    <AuthPageComponent
      defaultTab={defaultTab}
      onAuthSuccess={handleAuthSuccess}
      showSocialLogins={true}
    />
  )
}

export default Auth