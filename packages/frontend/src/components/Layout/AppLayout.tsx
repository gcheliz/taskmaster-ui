import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import './AppLayout.css';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="app-layout" role="application" aria-label="TaskMaster UI Application">
      {/* Skip navigation for keyboard users */}
      <div className="skip-nav">
        <a href="#main-content">Skip to main content</a>
        <a href="#sidebar-nav">Skip to navigation</a>
      </div>

      <Header />

      <div className="app-body">
        <Sidebar />

        <main id="main-content" className="app-main" tabIndex={-1} role="main">
          <div className="main-content">
            {children}
          </div>
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