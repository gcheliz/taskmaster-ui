import React from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../utils/cn'
import { 
  LayoutDashboard, 
  FolderKanban, 
  GitBranch, 
  Terminal, 
  Settings,
  FileText,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Users,
  Calendar
} from 'lucide-react'
import { Button } from '../ui/Button'

export interface SidebarProps {
  className?: string
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

interface NavItem {
  label: string
  icon: React.ElementType
  href: string
  badge?: string | number
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { label: 'Tasks', icon: FolderKanban, href: '/tasks', badge: 12 },
  { label: 'Repositories', icon: GitBranch, href: '/repositories' },
  { label: 'Terminal', icon: Terminal, href: '/terminal' },
  { label: 'Analytics', icon: BarChart3, href: '/analytics' },
  { label: 'Team', icon: Users, href: '/team' },
  { label: 'Calendar', icon: Calendar, href: '/calendar' },
  { label: 'Documentation', icon: FileText, href: '/docs' },
]

const bottomNavItems: NavItem[] = [
  { label: 'Settings', icon: Settings, href: '/settings' },
]

export const Sidebar: React.FC<SidebarProps> = ({
  className,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onMobileClose,
}) => {
  const sidebarWidth = isCollapsed ? 'w-16' : 'w-64'

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-white border-r border-secondary-200',
          'flex flex-col transition-all duration-300',
          sidebarWidth,
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0 lg:static lg:z-30',
          className
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-secondary-200">
          {!isCollapsed && (
            <div className="flex items-center">
              <span className="text-xl font-bold text-primary-600">TaskMaster</span>
            </div>
          )}
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className={cn(isCollapsed && 'mx-auto')}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between rounded-md px-3 py-2',
                      'transition-colors duration-200',
                      'hover:bg-secondary-100',
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-secondary-700 hover:text-secondary-900',
                      isCollapsed && 'justify-center'
                    )
                  }
                  title={isCollapsed ? item.label : undefined}
                >
                  <div className="flex items-center">
                    <item.icon className={cn('h-5 w-5', !isCollapsed && 'mr-3')} />
                    {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                  </div>
                  {!isCollapsed && item.badge && (
                    <span className="ml-auto inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-primary-700 bg-primary-100 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom navigation */}
        <div className="border-t border-secondary-200 p-4">
          <ul className="space-y-1">
            {bottomNavItems.map((item) => (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center rounded-md px-3 py-2',
                      'transition-colors duration-200',
                      'hover:bg-secondary-100',
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-secondary-700 hover:text-secondary-900',
                      isCollapsed && 'justify-center'
                    )
                  }
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon className={cn('h-5 w-5', !isCollapsed && 'mr-3')} />
                  {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  )
}