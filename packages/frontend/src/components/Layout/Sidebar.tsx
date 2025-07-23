import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutGrid, FolderGit2, ClipboardList, Terminal, Settings } from 'lucide-react'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

const menuItems = [
  { icon: LayoutGrid, label: 'Dashboard', path: '/dashboard' },
  { icon: FolderGit2, label: 'Repositories', path: '/repository-management' },
  { icon: ClipboardList, label: 'Task Board', path: '/task-board' },
  { icon: Terminal, label: 'Terminal', path: '/terminal' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
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
        w-64 bg-white border-r border-gray-200 h-full flex-shrink-0
        lg:relative fixed inset-y-0 left-0 z-40
        transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      >
        <nav className="p-4 space-y-1">
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
                  flex items-center space-x-3 px-4 py-2.5 w-full rounded-lg font-medium text-sm
                  transition-all duration-200
                  ${active ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'}
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
