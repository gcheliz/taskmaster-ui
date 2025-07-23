import React from 'react';
import { Bell, Moon, Search, Menu } from 'lucide-react';

interface HeaderProps {
  user?: {
    name: string;
    initials: string;
    role: string;
  };
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  user = { name: 'Gonzalo', initials: 'GZ', role: 'Admin' },
  onMenuClick
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-white border-b border-gray-200">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">TaskMaster UI</h1>
          </div>
          
          {/* Search Bar */}
          <div className="relative ml-8 hidden lg:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search tasks, repos, commands..." 
              className="w-96 bg-gray-50 text-gray-700 rounded-lg pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          {/* Theme Toggle */}
          <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100">
            <Moon className="w-5 h-5" />
          </button>
          
          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">{user.initials}</span>
            </div>
            <div className="text-sm hidden md:block">
              <div className="text-gray-900 font-medium">{user.name}</div>
              <div className="text-gray-500 text-xs">{user.role}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};