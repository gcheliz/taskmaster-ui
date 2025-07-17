import React from 'react';
import { ThemeToggle } from '../UI/ThemeToggle';
import './Header.css';

export interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  return (
    <header className={`app-header ${className}`.trim()} role="banner">
      <div className="header-content">
        <div className="logo-section">
          <h1>TaskMaster UI</h1>
        </div>
        <nav className="user-section" role="navigation" aria-label="User controls">
          <div className="theme-toggle-wrapper">
            <ThemeToggle variant="dropdown" size="sm" showLabel={false} />
          </div>
          <div className="user-profile" role="button" tabIndex={0} aria-label="User profile">
            <span>User Profile</span>
          </div>
        </nav>
      </div>
    </header>
  );
};