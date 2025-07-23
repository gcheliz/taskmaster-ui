import React from 'react'
import { cn } from '../../utils/cn'
import { Button } from '../ui/Button'
import { useAuth } from '../../hooks/useAuth'
import { Bell, Search, Menu, User, LogOut, Settings } from 'lucide-react'

export interface HeaderProps {
  className?: string
  onMenuClick?: () => void
  showSearch?: boolean
  showNotifications?: boolean
}

export const Header: React.FC<HeaderProps> = ({
  className,
  onMenuClick,
  showSearch = true,
  showNotifications = true,
}) => {
  const { user, logout } = useAuth()
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-sticky h-16 bg-white border-b border-secondary-200',
        'flex items-center justify-between px-4 sm:px-6 lg:px-8',
        className
      )}
    >
      <div className="flex items-center space-x-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-secondary-900">TaskMaster UI</h1>
        </div>

        {/* Search */}
        {showSearch && (
          <div className="hidden md:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
              <input
                type="search"
                placeholder="Search tasks..."
                className="pl-10 pr-4 py-2 w-64 lg:w-96 rounded-md border border-secondary-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {/* Mobile search button */}
        {showSearch && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Button>
        )}

        {/* Notifications */}
        {showNotifications && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="View notifications"
            className="relative"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-error-500 rounded-full" />
          </Button>
        )}

        {/* User menu */}
        <div className="relative" ref={dropdownRef}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            aria-label="User menu"
            aria-expanded={isUserMenuOpen}
            aria-haspopup="true"
          >
            <User className="h-5 w-5" />
          </Button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-dropdown border border-secondary-200 py-1">
              {user && (
                <div className="px-4 py-2 border-b border-secondary-200">
                  <p className="text-sm font-medium text-secondary-900">{user.name}</p>
                  <p className="text-xs text-secondary-600">{user.email}</p>
                </div>
              )}
              <a
                href="/settings"
                className="flex items-center px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </a>
              <button
                onClick={logout}
                className="flex items-center w-full px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}