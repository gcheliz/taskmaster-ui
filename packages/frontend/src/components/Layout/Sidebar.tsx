import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutGrid, FolderGit2, ClipboardList, Terminal, Settings, ChevronLeft, ChevronRight } from 'lucide-react'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

const menuItems = [
  { icon: LayoutGrid, label: 'Dashboard', path: '/' },
  { icon: FolderGit2, label: 'Repositories', path: '/repositories' },
  { icon: ClipboardList, label: 'Task Board', path: '/tasks' },
  { icon: Terminal, label: 'Terminal', path: '/terminal' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose, isCollapsed = false, onToggleCollapse }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside
        className={`
        ${isCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex-shrink-0
        lg:relative fixed inset-y-0 left-0 z-40 h-full
        transform transition-all duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      >
        <div className="h-full flex flex-col">
          {/* Collapse Toggle Button - Desktop only */}
          <div className="hidden lg:flex justify-end p-2 border-b border-gray-100">
            <button
              onClick={onToggleCollapse}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)

              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path)
                    onClose?.()
                  }}
                  className={`
                    flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} 
                    px-${isCollapsed ? '2' : '4'} py-2.5 w-full rounded-lg font-medium text-sm
                    transition-all duration-200 group relative
                    ${active ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'}
                  `}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={`w-5 h-5 ${isCollapsed ? '' : 'flex-shrink-0'}`} />
                  {!isCollapsed && <span>{item.label}</span>}
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded 
                      opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}
