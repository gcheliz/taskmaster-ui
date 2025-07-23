import React, { useState } from 'react'
import { ModernDashboardView } from './ModernDashboardView'
import { Button } from '../ui/atoms/Button'
import { Badge } from '../ui/atoms/Badge'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/atoms/Card'
import { Icon, HomeFilledIcon, TaskIcon, CompleteIcon } from '../ui/atoms/Icon'

/**
 * Dashboard Demo Component
 *
 * A demo page showcasing the new ModernDashboardView with mock data
 * and theme switching capabilities.
 */
export const DashboardDemo: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-surface-50 dark:bg-surface-950 transition-colors duration-300">
        {/* Theme Toggle Header */}
        <div className="border-b border-secondary-200 dark:border-surface-700 bg-white dark:bg-surface-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Icon icon={HomeFilledIcon} size="lg" color="primary" />
                <div>
                  <h1 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                    TaskMaster Dashboard
                  </h1>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">
                    Modern Dark Theme Demo
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="default" size="sm">
                  Demo Mode
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleTheme}
                  className="flex items-center space-x-2"
                >
                  <span>{isDarkMode ? '☀️' : '🌙'}</span>
                  <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Info Card */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Card variant="elevated" className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Icon icon={TaskIcon} size="md" color="primary" />
                <span>Dashboard Demo</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <Icon icon={CompleteIcon} size="md" color="success" />
                  <div>
                    <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                      Dark Theme Ready
                    </p>
                    <p className="text-xs text-secondary-600 dark:text-secondary-400">
                      Full dark mode support
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon icon={TaskIcon} size="md" color="primary" />
                  <div>
                    <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                      Responsive Design
                    </p>
                    <p className="text-xs text-secondary-600 dark:text-secondary-400">
                      Mobile-first approach
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon icon={HomeFilledIcon} size="md" color="warning" />
                  <div>
                    <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                      Interactive Components
                    </p>
                    <p className="text-xs text-secondary-600 dark:text-secondary-400">
                      Smooth animations
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard */}
        <ModernDashboardView
          projectId="demo-project"
          projectTag="taskmaster-ui"
          className="dashboard-demo"
        />
      </div>
    </div>
  )
}

export default DashboardDemo
