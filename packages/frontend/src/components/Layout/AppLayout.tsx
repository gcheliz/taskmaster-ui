import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { Footer } from './Footer'
import { MobileBottomNav } from './MobileBottomNav'
import { SkipLink, SkipLinksContainer } from '../common/SkipLink'
import { KeyboardShortcutsPanel } from '../common/KeyboardShortcutsPanel'
import { useGlobalKeyboardShortcuts, useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import { useRouteFocusManagement } from '../../hooks/useFocusManagement'
import { AriaLiveRegion } from '../common/AriaLiveRegion'

interface AppLayoutProps {
  children?: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  // Initialize global keyboard shortcuts
  useGlobalKeyboardShortcuts()

  // Manage focus on route changes
  useRouteFocusManagement()

  // Add keyboard shortcut to open shortcuts panel
  useKeyboardShortcuts([
    {
      key: 'cmd+/',
      description: 'Show keyboard shortcuts',
      handler: () => setShortcutsOpen(true),
    },
  ])

  // Mock user data - in real app, this would come from auth context
  const user = {
    name: 'Gonzalo',
    initials: 'GZ',
    role: 'Admin',
  }

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Skip Links for keyboard navigation */}
      <SkipLinksContainer>
        <SkipLink href="#main-content">Skip to main content</SkipLink>
        <SkipLink href="#main-navigation">Skip to navigation</SkipLink>
      </SkipLinksContainer>

      {/* Header */}
      <Header user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main container - Add padding top for fixed header */}
      <div className="flex flex-1 overflow-hidden pt-14 sm:pt-16">
        {/* Sidebar */}
        <div id="main-navigation">
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* Content wrapper */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Main content with scrolling */}
          <main id="main-content" tabIndex={-1} className="flex-1 bg-white overflow-y-auto focus:outline-none">
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

      {/* Keyboard Shortcuts Panel */}
      <KeyboardShortcutsPanel open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
      
      {/* Live Region for Route Announcements */}
      <AriaLiveRegion politeness="polite" className="sr-only" />
    </div>
  )
}
