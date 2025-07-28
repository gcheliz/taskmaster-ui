import React, { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../atoms/Card'
import { Button } from '../atoms/Button'
import { Badge } from '../atoms/Badge'
import { Icon, TimeIcon, SettingsIcon, DuplicateIcon, ArchiveIcon } from '../atoms/Icon'
import { Spinner } from '../atoms/Spinner'
import { TimelineItem } from '../molecules/TimelineItem'

export interface ActivityItem {
  id: string
  type: 'commit' | 'task_update' | 'project_update'
  timestamp: string
  message: string
  author?: string
  details?: Record<string, unknown>
}

/**
 * Props for the ActivityTimeline component
 */
export interface ActivityTimelineProps {
  /** Array of activity items to display in the timeline */
  activities: ActivityItem[]
  /** Whether the timeline is in a loading state */
  loading?: boolean
  /** Error message to display if activities failed to load */
  error?: string
  /** Maximum number of items to display (others will be hidden) */
  maxItems?: number
  /** Whether to show filter controls */
  showFilters?: boolean
  /** Whether to show user avatars */
  showAvatar?: boolean
  showTimestamp?: boolean
  groupByDate?: boolean
  onRefresh?: () => void
  onViewAll?: () => void
  className?: string
}

const ActivityTimeline = ({
  activities,
  loading = false,
  error,
  maxItems = 10,
  showFilters = true,
  showAvatar = true,
  showTimestamp = true,
  groupByDate = false,
  onRefresh,
  onViewAll,
  className = '',
}: ActivityTimelineProps) => {
  const [filterType, setFilterType] = useState<string>('all')
  const [refreshing, setRefreshing] = useState(false)

  // Filter and sort activities
  const filteredActivities = useMemo(() => {
    let filtered = activities

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter((activity) => activity.type === filterType)
    }

    // Sort by timestamp (newest first)
    filtered = filtered.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    // Limit items
    return filtered.slice(0, maxItems)
  }, [activities, filterType, maxItems])

  // Group activities by date if requested
  const groupedActivities = useMemo(() => {
    if (!groupByDate) return filteredActivities

    const groups: { [key: string]: ActivityItem[] } = {}

    filteredActivities.forEach((activity) => {
      const date = new Date(activity.timestamp).toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(activity)
    })

    return Object.entries(groups).map(([date, items]) => ({
      date,
      items,
    }))
  }, [filteredActivities, groupByDate])

  const handleRefresh = async () => {
    if (!onRefresh) return

    setRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setRefreshing(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      })
    }
  }

  const getFilterCount = (type: string) => {
    if (type === 'all') return activities.length
    return activities.filter((activity) => activity.type === type).length
  }

  const activityTypes = [
    { key: 'all', label: 'All', count: getFilterCount('all') },
    { key: 'commit', label: 'Commits', count: getFilterCount('commit') },
    {
      key: 'task_update',
      label: 'Tasks',
      count: getFilterCount('task_update'),
    },
    {
      key: 'project_update',
      label: 'Updates',
      count: getFilterCount('project_update'),
    },
  ]

  // Loading state
  if (loading && activities.length === 0) {
    return (
      <Card variant="elevated" className={className}>
        <CardContent className="text-center py-12">
          <Spinner size="lg" className="mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
            Loading Activity
          </h3>
          <p className="text-secondary-600 dark:text-secondary-400">
            Fetching recent project activity...
          </p>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card variant="elevated" className={className}>
        <CardContent className="text-center py-12">
          <Icon icon={ArchiveIcon} size="2xl" color="error" className="mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-error-600 dark:text-error-400 mb-2">
            Activity Error
          </h3>
          <p className="text-secondary-600 dark:text-secondary-400 mb-6">{error}</p>
          {onRefresh && (
            <Button variant="outline" onClick={handleRefresh}>
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (filteredActivities.length === 0) {
    return (
      <Card variant="elevated" className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Icon icon={TimeIcon} size="md" color="primary" />
              <span>Recent Activity</span>
            </CardTitle>
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                {refreshing ? (
                  <Spinner size="sm" className="mr-2" />
                ) : (
                  <Icon icon={DuplicateIcon} size="sm" className="mr-2" />
                )}
                Refresh
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Icon icon={ArchiveIcon} size="2xl" color="muted" className="mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
            No Recent Activity
          </h3>
          <p className="text-secondary-600 dark:text-secondary-400">
            {filterType === 'all'
              ? 'No recent activities to display'
              : `No ${filterType.replace('_', ' ')} activities found`}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="elevated" className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Icon icon={TimeIcon} size="md" color="primary" />
            <span>Recent Activity</span>
            <Badge variant="secondary" size="sm">
              {filteredActivities.length}
            </Badge>
          </CardTitle>
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? (
                <Spinner size="sm" className="mr-2" />
              ) : (
                <Icon icon={DuplicateIcon} size="sm" className="mr-2" />
              )}
              Refresh
            </Button>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <div className="flex items-center space-x-1 mr-4">
              <Icon icon={SettingsIcon} size="sm" color="muted" />
              <span className="text-sm text-secondary-600 dark:text-secondary-400">Filter:</span>
            </div>
            {activityTypes.map((type) => (
              <Button
                key={type.key}
                variant={filterType === type.key ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilterType(type.key)}
                className="flex items-center space-x-1"
              >
                <span>{type.label}</span>
                {type.count > 0 && (
                  <Badge variant="secondary" size="sm">
                    {type.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {groupByDate ? (
          // Grouped by date
          <div className="space-y-6">
            {(groupedActivities as { date: string; items: ActivityItem[] }[]).map(
              (group, groupIndex) => (
                <div key={groupIndex} className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-semibold text-secondary-900 dark:text-secondary-100">
                      {formatDate(group.date)}
                    </h4>
                    <Badge variant="secondary" size="sm">
                      {group.items.length} {group.items.length === 1 ? 'activity' : 'activities'}
                    </Badge>
                  </div>
                  <div className="space-y-4">
                    {group.items.map((activity, index) => (
                      <TimelineItem
                        key={activity.id}
                        {...activity}
                        showAvatar={showAvatar}
                        showTimestamp={showTimestamp}
                        isLast={index === group.items.length - 1}
                      />
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          // Simple chronological list
          <div className="space-y-4">
            {filteredActivities.map((activity, index) => (
              <TimelineItem
                key={activity.id}
                {...activity}
                showAvatar={showAvatar}
                showTimestamp={showTimestamp}
                isLast={index === filteredActivities.length - 1}
              />
            ))}
          </div>
        )}
      </CardContent>

      {/* Footer */}
      {activities.length > maxItems && onViewAll && (
        <CardFooter className="text-center">
          <Button variant="outline" onClick={onViewAll} className="w-full">
            View All Activities ({activities.length})
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

export { ActivityTimeline }
