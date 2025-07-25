import React from 'react'
import { Bell, Moon, Search, Menu } from 'lucide-react'
import { ScreenReaderOnly } from '../common/ScreenReaderOnly'

interface HeaderProps {
  user?: {
    name: string
    initials: string
    role: string
  }
  onMenuClick?: () => void
}

export const Header = ({
  user = { name: 'Gonzalo', initials: 'GZ', role: 'Admin' },
  onMenuClick,
}: HeaderProps) => {
  const [searchOpen, setSearchOpen] = React.useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 h-14 z-50 bg-white border-b border-gray-200" role="banner">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center flex-1">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-1.5 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100 mr-3"
            aria-label="Toggle navigation menu"
            aria-expanded="false"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>

          {/* Logo - Compact */}
          <div className="flex items-center space-x-3 mr-8">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-gray-900 hidden sm:block">TaskMaster</h1>
          </div>

          {/* Search Bar - Compact and centered */}
          <div className="relative flex-1 max-w-2xl mx-auto hidden lg:block">
            <label htmlFor="header-search" className="sr-only">Search tasks, repositories, and commands</label>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" aria-hidden="true" />
            </div>
            <input
              id="header-search"
              type="search"
              placeholder="Search..."
              className="w-full bg-gray-50 text-gray-700 rounded-lg pl-10 pr-4 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white focus:border-blue-300 transition-all duration-200"
              aria-label="Search tasks, repositories, and commands"
            />
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Mobile Search Toggle */}
          <button 
            onClick={() => setSearchOpen(!searchOpen)}
            className="lg:hidden p-1.5 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
            aria-label="Toggle search"
            aria-expanded={searchOpen}
          >
            <Search className="w-4 h-4" aria-hidden="true" />
          </button>

          {/* Notifications */}
          <button 
            className="relative p-1.5 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
            aria-label="View notifications"
            aria-describedby="notification-badge"
          >
            <Bell className="w-4 h-4" aria-hidden="true" />
            <span 
              id="notification-badge"
              className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full"
              role="status"
              aria-label="You have new notifications"
            ></span>
          </button>

          {/* Theme Toggle - Hidden on mobile */}
          <button 
            className="hidden sm:flex p-1.5 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
            aria-label="Toggle dark mode"
            aria-pressed="false"
          >
            <Moon className="w-4 h-4" aria-hidden="true" />
          </button>

          {/* User Menu */}
          <button 
            className="flex items-center space-x-2 rounded-lg hover:bg-gray-100 p-1 transition-colors ml-2"
            aria-label={`User menu for ${user.name}`}
            aria-haspopup="true"
          >
            <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-white" aria-hidden="true">{user.initials}</span>
            </div>
            <div className="text-sm hidden lg:block text-left">
              <div className="text-gray-900 font-medium text-sm">{user.name}</div>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {searchOpen && (
        <div className="lg:hidden absolute top-14 left-0 right-0 bg-white border-b border-gray-200 p-3 animate-slide-in-bottom">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="search"
              placeholder="Search..."
              className="w-full bg-gray-50 text-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white focus:border-blue-300 transition-all duration-200"
              autoFocus
              aria-label="Search tasks and repositories"
            />
          </div>
        </div>
      )}
    </header>
  )
}
