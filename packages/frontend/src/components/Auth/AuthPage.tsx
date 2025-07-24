import React, { useState } from 'react'
import { cn } from '../../utils/cn'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/molecules/Tabs'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'

export interface AuthPageProps {
  /**
   * Default tab to show
   * @default 'login'
   */
  defaultTab?: 'login' | 'register'
  /**
   * Callback when auth action is completed
   */
  onAuthSuccess?: (type: 'login' | 'register', data: any) => void
  /**
   * Whether to show social login options
   * @default true
   */
  showSocialLogins?: boolean
  /**
   * Custom background image or gradient
   */
  backgroundImage?: string
  /**
   * Additional CSS classes
   */
  className?: string
}

export const AuthPage: React.FC<AuthPageProps> = ({
  defaultTab = 'login',
  onAuthSuccess,
  showSocialLogins = true,
  backgroundImage,
  className,
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab)

  const handleAuthSuccess = (type: 'login' | 'register', data: any) => {
    onAuthSuccess?.(type, data)
  }

  return (
    <div
      className={cn(
        'min-h-screen flex items-center justify-center p-4',
        'bg-gradient-to-br from-blue-50 via-white to-purple-50',
        backgroundImage && 'bg-cover bg-center bg-no-repeat',
        className
      )}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
    >
      {/* Glassmorphism Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-purple-400/5 to-pink-400/10 backdrop-blur-sm" />

      {/* Auth Container with Glassmorphism */}
      <div
        className={cn(
          'relative w-full max-w-md mx-auto',
          // Glassmorphism effects
          'bg-white/80 backdrop-blur-xl',
          'border border-white/20',
          'shadow-2xl shadow-black/5',
          'rounded-2xl',
          'p-8',
          // Subtle animations
          'transform-gpu transition-[transform,opacity] duration-500',
          'hover:shadow-3xl hover:shadow-black/10',
          'hover:bg-white/85'
        )}
      >
        {/* Logo/Brand Area */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">TM</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome to TaskMaster</h1>
          <p className="text-slate-600 text-sm">Manage your projects with collaborative AI</p>
        </div>

        {/* Auth Tabs */}
        <Tabs
          defaultValue={defaultTab}
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'login' | 'register')}
          variant="pills"
          className="w-full"
        >
          <TabsList
            className={cn(
              'grid w-full grid-cols-2 mb-6',
              // Enhanced glassmorphism for tabs
              'bg-slate-100/60 backdrop-blur-md',
              'border border-white/30',
              'shadow-inner shadow-black/5'
            )}
          >
            <TabsTrigger
              value="login"
              className={cn(
                'data-[state=active]:bg-white/90 data-[state=active]:shadow-md',
                'data-[state=active]:backdrop-blur-xl',
                'transition-[color] duration-300'
              )}
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className={cn(
                'data-[state=active]:bg-white/90 data-[state=active]:shadow-md',
                'data-[state=active]:backdrop-blur-xl',
                'transition-[color] duration-300'
              )}
            >
              Create Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <LoginForm
              onSuccess={(data) => handleAuthSuccess('login', data)}
              showSocialLogins={showSocialLogins}
            />
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <RegisterForm
              onSuccess={(data) => handleAuthSuccess('register', data)}
              showSocialLogins={showSocialLogins}
            />
          </TabsContent>
        </Tabs>

        {/* Additional Links */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-xs text-slate-500">
            By continuing, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl" />
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-xl" />
      <div className="absolute top-1/2 left-4 w-16 h-16 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-xl" />
    </div>
  )
}

export default AuthPage
