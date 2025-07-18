import React from 'react';
import { NavLink } from 'react-router-dom';
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
            <NavLink 
              to="/dashboard"
              className={({ isActive }) => isActive ? 'active' : ''}
              tabIndex={0}
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/repository-management"
              className={({ isActive }) => isActive ? 'active' : ''}
              tabIndex={0}
            >
              Repository Management
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/task-board"
              className={({ isActive }) => isActive ? 'active' : ''}
              tabIndex={0}
            >
              Task Board
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/terminal"
              className={({ isActive }) => isActive ? 'active' : ''}
              tabIndex={0}
            >
              Terminal
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/settings"
              className={({ isActive }) => isActive ? 'active' : ''}
              tabIndex={0}
            >
              Settings
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
};