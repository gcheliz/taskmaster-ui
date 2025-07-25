import React from 'react'
import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from '../../hooks/useAuth'
import { 
  LayoutDashboard, 
  GitBranch, 
  ClipboardList, 
  Terminal, 
  Settings,
  Bell,
  Moon,
  Search
} from 'lucide-react'

interface StaticLayoutProps {
  children: React.ReactNode
}

export const StaticLayout = ({ children }: StaticLayoutProps) => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/repositories', icon: GitBranch, label: 'Repository Management' },
    { path: '/tasks', icon: ClipboardList, label: 'Task Board' },
    { path: '/terminal', icon: Terminal, label: 'Terminal' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <div className="bg-slate-950 text-slate-50 min-h-screen">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white">TaskMaster UI</h1>
            </div>
            
            {/* Search Bar */}
            <div className="relative ml-8">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search tasks, repos, commands..." 
                className="w-96 bg-slate-800 text-slate-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full pulse-dot" />
            </button>
            
            {/* Theme Toggle */}
            <button className="p-2 text-slate-400 hover:text-white transition-colors">
              <Moon className="w-5 h-5" />
            </button>
            
            {/* User Menu */}
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </span>
              </div>
              <div className="text-sm">
                <div className="text-white font-medium">{user?.name?.split(' ')[0] || 'User'}</div>
                <div className="text-slate-400 capitalize">{user?.role || 'Admin'}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-slate-900 border-r border-slate-800 p-4 min-h-screen">
          <div className="space-y-2">
            {navItems.map(({ path, icon: Icon, label }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-500 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}

export default StaticLayout