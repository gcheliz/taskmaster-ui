import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { Footer } from './Footer'
import { MobileBottomNav } from './MobileBottomNav'

interface AppLayoutProps {
  children?: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Mock user data - in real app, this would come from auth context
  const user = {
    name: 'Gonzalo',
    initials: 'GZ',
    role: 'Admin',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main container - Mobile-first responsive design */}
      <div className="flex h-[calc(100vh-56px)] sm:h-[calc(100vh-64px)] mt-14 sm:mt-16">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Content wrapper */}
        <div className="flex-1 flex flex-col">
          {/* Main content - Responsive padding */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
              {/* Mobile-optimized content wrapper */}
              <div className="min-h-full">
                {children || <Outlet />}
              </div>
            </div>
          </main>

          {/* Footer - Hidden on mobile to save space */}
          <div className="hidden sm:block">
            <Footer />
          </div>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <MobileBottomNav />
      
      {/* Mobile bottom padding for navigation and iOS safe area */}
      <div className="h-16 sm:hidden" />
    </div>
  )
}
