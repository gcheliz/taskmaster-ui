import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { cn } from '../../utils/cn';

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  className,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport and manage sidebar state
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      if (!mobile && sidebarOpen) {
        setSidebarOpen(false); // Close mobile sidebar when switching to desktop
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [sidebarOpen]);

  // Close sidebar when clicking overlay
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div
      className={cn('dark min-h-screen bg-slate-950 text-slate-50', className)}
      role="application"
      aria-label="TaskMaster UI Application"
    >
      {/* Skip navigation for keyboard users */}
      <div className="sr-only">
        <a
          href="#main-content"
          className="focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-accent-primary text-white px-4 py-2 rounded-md"
        >
          Skip to main content
        </a>
        <a
          href="#sidebar-nav"
          className="focus:not-sr-only focus:absolute focus:top-4 focus:left-32 z-50 bg-accent-primary text-white px-4 py-2 rounded-md"
        >
          Skip to navigation
        </a>
      </div>

      <Header 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        isMobile={isMobile}
      />

      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <div className="flex min-h-screen pt-16"> {/* Account for fixed header height */}
        <Sidebar 
          open={sidebarOpen}
          onClose={closeSidebar}
          isMobile={isMobile}
        />

        <main
          id="main-content"
          className={cn(
            'flex-1 bg-slate-950 overflow-auto transition-all duration-300',
            // Add left margin for desktop sidebar when not mobile
            !isMobile && 'lg:ml-64',
            // Full width on mobile or when sidebar is closed
            isMobile || !sidebarOpen ? 'ml-0' : ''
          )}
          tabIndex={-1}
          role="main"
        >
          <div className="p-4 sm:p-6">{children}</div>
        </main>
      </div>

      <Footer />

      {/* Global live region for application-wide announcements */}
      <div
        id="global-announcements"
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      ></div>
    </div>
  );
};
