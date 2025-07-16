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
    <div className="app-layout">
      <Header />

      <Sidebar />

      <main className="app-main">
        <div className="main-content">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
};