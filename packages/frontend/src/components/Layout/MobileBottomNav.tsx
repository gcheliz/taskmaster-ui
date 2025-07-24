import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  GitBranch, 
  CheckSquare, 
  Terminal as TerminalIcon,
  Settings
} from 'lucide-react'

interface NavItem {
  icon: React.ReactNode
  label: string
  path: string
}

export const MobileBottomNav: React.FC = () => {
  const location = useLocation()

  const navItems: NavItem[] = [
    { icon: <Home className="w-5 h-5" />, label: 'Dashboard', path: '/' },
    { icon: <GitBranch className="w-5 h-5" />, label: 'Repos', path: '/repositories' },
    { icon: <CheckSquare className="w-5 h-5" />, label: 'Tasks', path: '/tasks' },
    { icon: <TerminalIcon className="w-5 h-5" />, label: 'Terminal', path: '/terminal' },
    { icon: <Settings className="w-5 h-5" />, label: 'Settings', path: '/settings' },
  ]

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-mobile-nav">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors no-underline ${
              isActive(item.path)
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            style={{ textDecoration: 'none' }}
          >
            {item.icon}
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
      {/* iOS safe area */}
      <div className="h-safe-bottom bg-white" />
    </nav>
  )
}