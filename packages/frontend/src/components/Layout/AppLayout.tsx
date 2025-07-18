import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { cn } from '../../utils/cn';

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'dark min-h-screen bg-slate-950 text-slate-50',
        className
      )}
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

      <Header />

      <div className="flex min-h-screen">
        <Sidebar />

        <main 
          id="main-content" 
          className="flex-1 bg-slate-950 overflow-auto" 
          tabIndex={-1} 
          role="main"
        >
          <div className="p-6">{children}</div>
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
