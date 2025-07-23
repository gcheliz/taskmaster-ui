import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { cn } from '../../utils/cn'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { Footer } from './Footer'

export interface LayoutProps {
  className?: string
  showHeader?: boolean
  showSidebar?: boolean
  showFooter?: boolean
  contentClassName?: string
  children?: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({
  className,
  showHeader = true,
  showSidebar = true,
  showFooter = true,
  contentClassName,
  children,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  const handleMobileMenuClick = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen)
  }

  const handleMobileSidebarClose = () => {
    setIsMobileSidebarOpen(false)
  }

  return (
    <div className={cn('min-h-screen bg-secondary-50', className)}>
      {/* Sidebar */}
      {showSidebar && (
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={handleMobileSidebarClose}
        />
      )}

      {/* Main content area */}
      <div
        className={cn(
          'flex flex-col min-h-screen transition-all duration-300',
          showSidebar && 'lg:ml-64',
          showSidebar && isSidebarCollapsed && 'lg:ml-16'
        )}
      >
        {/* Header */}
        {showHeader && (
          <Header
            onMenuClick={showSidebar ? handleMobileMenuClick : undefined}
          />
        )}

        {/* Page content */}
        <main
          className={cn(
            'flex-1',
            'px-4 sm:px-6 lg:px-8 py-8',
            contentClassName
          )}
        >
          {children || <Outlet />}
        </main>

        {/* Footer */}
        {showFooter && <Footer />}
      </div>
    </div>
  )
}

// Layout variants for different page types
export const DashboardLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <Layout>{children}</Layout>
}

export const AuthLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <Layout 
      showHeader={false} 
      showSidebar={false} 
      showFooter={false}
      contentClassName="flex items-center justify-center min-h-screen p-4"
    >
      {children}
    </Layout>
  )
}

export const FullscreenLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <Layout 
      showFooter={false}
      contentClassName="p-0"
    >
      {children}
    </Layout>
  )
}