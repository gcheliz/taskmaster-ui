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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main container - Mobile-first responsive design */}
      <div className="flex h-[calc(100vh-56px)] sm:h-[calc(100vh-64px)] mt-14 sm:mt-16">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Content wrapper */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Main content - Full width without extra padding */}
          <main className="flex-1 overflow-y-auto">
            {children || <Outlet />}
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
