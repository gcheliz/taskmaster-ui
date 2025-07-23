import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { Footer } from './Footer'

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

      {/* Main container */}
      <div className="flex h-[calc(100vh-64px)] mt-16">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Content wrapper */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Main content */}
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-7xl mx-auto">{children || <Outlet />}</div>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  )
}
