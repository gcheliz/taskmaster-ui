import React from 'react';
import './Header.css';

export interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  return (
    <header className={`app-header ${className}`.trim()}>
      <div className="header-content">
        <div className="logo-section">
          <h1>TaskMaster UI</h1>
        </div>
        <div className="user-section">
          <span>User Profile</span>
        </div>
      </div>
    </header>
  );
};