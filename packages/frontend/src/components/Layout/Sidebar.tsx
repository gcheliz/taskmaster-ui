import React from 'react';
import './Sidebar.css';

export interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  return (
    <aside 
      className={`app-sidebar ${className}`.trim()}
      role="navigation"
      aria-label="Main navigation"
    >
      <nav id="sidebar-nav" className="sidebar-nav">
        <ul role="list">
          <li>
            <a 
              href="#dashboard"
              aria-current="page"
              tabIndex={0}
            >
              Dashboard
            </a>
          </li>
          <li>
            <a 
              href="#repository-management"
              tabIndex={0}
            >
              Repository Management
            </a>
          </li>
          <li>
            <a 
              href="#task-board"
              tabIndex={0}
            >
              Task Board
            </a>
          </li>
          <li>
            <a 
              href="#settings"
              tabIndex={0}
            >
              Settings
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
};