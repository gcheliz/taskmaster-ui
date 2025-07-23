import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../atoms/Card'
import {
  Icon,
  StarFilledIcon,
  TaskIcon,
  NotificationIcon,
  UserCircleIcon,
  DuplicateIcon,
  PlusIcon,
  SettingsIcon,
  ArchiveIcon,
} from '../atoms/Icon'
import { Spinner } from '../atoms/Spinner'
import { QuickActionCard } from '../molecules/QuickActionCard'
// Using the icon type from the Icon component props
type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>

export interface QuickAction {
  id: string
  title: string
  description?: string
  icon: IconType
  iconColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'muted'
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline'
  badge?: {
    text: string
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  }
  disabled?: boolean
  shortcut?: string
  onClick?: () => void
  category?: 'task' | 'team' | 'project' | 'system'
}

export interface QuickActionsGridProps {
  actions?: QuickAction[]
  loading?: boolean
  title?: string
  description?: string
  maxItems?: number
  columns?: 1 | 2 | 3 | 4 | 5 | 6
  showCategories?: boolean
  className?: string
}

const DEFAULT_ACTIONS: QuickAction[] = [
  {
    id: 'create-task',
    title: 'Create Task',
    description: 'Add a new task to your project',
    icon: TaskIcon,
    iconColor: 'primary',
    variant: 'primary',
    shortcut: 'Ctrl+N',
    category: 'task',
    onClick: () => console.log('Create task clicked'),
  },
  {
    id: 'view-reports',
    title: 'View Reports',
    description: 'Access project analytics and reports',
    icon: NotificationIcon,
    iconColor: 'success',
    variant: 'outline',
    shortcut: 'Ctrl+R',
    category: 'project',
    onClick: () => console.log('View reports clicked'),
  },
  {
    id: 'manage-team',
    title: 'Manage Team',
    description: 'Add or remove team members',
    icon: UserCircleIcon,
    iconColor: 'warning',
    variant: 'outline',
    badge: {
      text: 'Admin',
      variant: 'warning',
    },
    shortcut: 'Ctrl+T',
    category: 'team',
    onClick: () => console.log('Manage team clicked'),
  },
  {
    id: 'export-data',
    title: 'Export Data',
    description: 'Download project data in various formats',
    icon: DuplicateIcon,
    iconColor: 'secondary',
    variant: 'outline',
    shortcut: 'Ctrl+E',
    category: 'system',
    onClick: () => console.log('Export data clicked'),
  },
  {
    id: 'add-member',
    title: 'Add Member',
    description: 'Invite new team members to the project',
    icon: PlusIcon,
    iconColor: 'success',
    variant: 'outline',
    category: 'team',
    onClick: () => console.log('Add member clicked'),
  },
  {
    id: 'project-settings',
    title: 'Project Settings',
    description: 'Configure project preferences and settings',
    icon: SettingsIcon,
    iconColor: 'muted',
    variant: 'outline',
    category: 'system',
    onClick: () => console.log('Project settings clicked'),
  },
  {
    id: 'archive-project',
    title: 'Archive Project',
    description: 'Archive completed or inactive projects',
    icon: ArchiveIcon,
    iconColor: 'error',
    variant: 'outline',
    category: 'project',
    disabled: true,
    onClick: () => console.log('Archive project clicked'),
  },
]

const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({
  actions = DEFAULT_ACTIONS,
  loading = false,
  title = 'Quick Actions',
  description = 'Perform common tasks quickly',
  maxItems,
  columns = 4,
  showCategories = false,
  className = '',
}) => {
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set())

  const displayedActions = maxItems ? actions.slice(0, maxItems) : actions

  const handleActionClick = async (action: QuickAction) => {
    if (action.disabled || loadingActions.has(action.id)) return

    setLoadingActions((prev) => new Set(prev).add(action.id))

    try {
      await action.onClick?.()
    } finally {
      setLoadingActions((prev) => {
        const newSet = new Set(prev)
        newSet.delete(action.id)
        return newSet
      })
    }
  }

  const getGridColumns = () => {
    const columnClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
      5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
      6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
    }
    return columnClasses[columns] || columnClasses[4]
  }

  const groupActionsByCategory = () => {
    const grouped: Record<string, QuickAction[]> = {}
    displayedActions.forEach((action) => {
      const category = action.category || 'other'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(action)
    })
    return grouped
  }

  const formatCategoryName = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1)
  }

  // Loading State
  if (loading) {
    return (
      <Card variant="elevated" className={className}>
        <CardContent className="text-center py-12">
          <Spinner size="lg" className="mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
            Loading Actions
          </h3>
          <p className="text-secondary-600 dark:text-secondary-400">
            Preparing your quick actions...
          </p>
        </CardContent>
      </Card>
    )
  }

  // Empty State
  if (displayedActions.length === 0) {
    return (
      <Card variant="elevated" className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Icon icon={StarFilledIcon} size="md" color="primary" />
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Icon icon={ArchiveIcon} size="2xl" color="muted" className="mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
            No Actions Available
          </h3>
          <p className="text-secondary-600 dark:text-secondary-400">
            No quick actions are currently available.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="elevated" className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Icon icon={StarFilledIcon} size="md" color="primary" />
          <span>{title}</span>
        </CardTitle>
        {description && (
          <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        {showCategories ? (
          // Grouped by categories
          <div className="space-y-8">
            {Object.entries(groupActionsByCategory()).map(([category, categoryActions]) => (
              <div key={category} className="space-y-4">
                <h3 className="text-sm font-semibold text-secondary-900 dark:text-secondary-100 uppercase tracking-wide">
                  {formatCategoryName(category)}
                </h3>
                <div className={`grid ${getGridColumns()} gap-4`}>
                  {categoryActions.map((action) => (
                    <QuickActionCard
                      key={action.id}
                      {...action}
                      loading={loadingActions.has(action.id)}
                      onClick={() => handleActionClick(action)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Simple grid layout
          <div className={`grid ${getGridColumns()} gap-4`}>
            {displayedActions.map((action) => (
              <QuickActionCard
                key={action.id}
                {...action}
                loading={loadingActions.has(action.id)}
                onClick={() => handleActionClick(action)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { QuickActionsGrid }
