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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Mock user data - in real app, this would come from auth context
  const user = {
    name: 'Gonzalo',
    initials: 'GZ',
    role: 'Admin',
  }

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <Header user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Content wrapper */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Main content with scrolling */}
          <main className="flex-1 bg-white overflow-y-auto">
            <div className="h-full">
              {children || <Outlet />}
            </div>
          </main>

          {/* Footer - Always visible at bottom */}
          <Footer />
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <div className="sm:hidden">
        <MobileBottomNav />
      </div>
    </div>
  )
}
