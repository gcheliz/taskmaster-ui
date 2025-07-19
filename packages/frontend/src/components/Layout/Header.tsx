import React from 'react';
import { Icon, CheckIcon } from '../ui/atoms/Icon';
import { cn } from '../../utils/cn';

export interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  return (
    <header
      className={cn(
        'bg-slate-900 border-b border-slate-800 px-6 py-4',
        className
      )}
      role="banner"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-accent-primary rounded-lg flex items-center justify-center">
              <Icon icon={CheckIcon} size="sm" color="white" />
            </div>
            <h1 className="text-xl font-bold text-white">TaskMaster UI</h1>
          </div>

          {/* Search Bar */}
          <div className="relative ml-8">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search tasks, repos, commands..."
              className="w-96 bg-slate-800 text-slate-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent-primary"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 17h5l-3.5-3.5a50.002 50.002 0 00-7 0L6 17h5m4 0a2 2 0 11-4 0m4 0H10m4 0V9a2 2 0 10-4 0v8"
              ></path>
            </svg>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent-error rounded-full animate-pulse"></span>
          </button>

          {/* Theme Toggle */}
          <button className="p-2 text-slate-400 hover:text-white transition-colors">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              ></path>
            </svg>
          </button>

          {/* User Menu */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-accent-primary rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">GZ</span>
            </div>
            <div className="text-sm">
              <div className="text-white font-medium">Gonzalo</div>
              <div className="text-slate-400">Admin</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
