import React, { useMemo } from 'react';
import './RecentActivityFeedWidget.css';

export interface ActivityItem {
  id: string;
  type: 'commit' | 'task_update' | 'project_update';
  timestamp: string;
  message: string;
  author?: string;
  details?: Record<string, unknown>;
}

export interface RecentActivityFeedWidgetProps {
  activities: ActivityItem[];
  maxItems?: number;
  showFilters?: boolean;
  showAvatar?: boolean;
  showTimestamp?: boolean;
  groupByDate?: boolean;
  className?: string;
}

/**
 * Recent Activity Feed Widget
 * 
 * A reusable widget component that displays a chronological list of recent
 * project activities, including Git commits, task updates, and project changes.
 * Supports filtering, grouping, and customizable display options.
 */
export const RecentActivityFeedWidget: React.FC<RecentActivityFeedWidgetProps> = ({
  activities,
  maxItems = 20,
  showFilters = true,
  showAvatar = true,
  showTimestamp = true,
  groupByDate = false,
  className = ''
}) => {
  // Sort activities by timestamp (newest first)
  const sortedActivities = useMemo(() => {
    return [...activities]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, maxItems);
  }, [activities, maxItems]);

  // Group activities by date if requested
  const groupedActivities = useMemo(() => {
    if (!groupByDate) return sortedActivities;

    const groups: { [key: string]: ActivityItem[] } = {};
    
    sortedActivities.forEach(activity => {
      const date = new Date(activity.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
    });

    return Object.entries(groups).map(([date, items]) => ({
      date,
      items
    }));
  }, [sortedActivities, groupByDate]);

  // Get activity type icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'commit':
        return '💾';
      case 'task_update':
        return '✅';
      case 'project_update':
        return '🔄';
      default:
        return '📝';
    }
  };

  // Get activity type color
  const getActivityColor = (type: string) => {
    switch (type) {
      case 'commit':
        return '#22c55e';
      case 'task_update':
        return '#3b82f6';
      case 'project_update':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  // Format date for grouping
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  // Get author initials for avatar
  const getAuthorInitials = (author?: string) => {
    if (!author) return '?';
    return author
      .split(' ')
      .map(name => name.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  // Truncate message
  const truncateMessage = (message: string, maxLength: number = 80) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  // No activities state
  if (sortedActivities.length === 0) {
    return (
      <div className={`recent-activity-feed-widget empty ${className}`}>
        <div className="widget-empty">
          <div className="empty-icon">🔔</div>
          <h3>No Recent Activity</h3>
          <p>No recent activities to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`recent-activity-feed-widget ${className}`}>
      {/* Header */}
      <div className="widget-header">
        <div className="header-info">
          <h3>Recent Activity</h3>
          <span className="activity-count">{sortedActivities.length} activities</span>
        </div>
        
        {showFilters && (
          <div className="activity-filters">
            <div className="filter-legend">
              <span className="legend-item">
                <span className="legend-icon">💾</span>
                <span className="legend-label">Commits</span>
              </span>
              <span className="legend-item">
                <span className="legend-icon">✅</span>
                <span className="legend-label">Tasks</span>
              </span>
              <span className="legend-item">
                <span className="legend-icon">🔄</span>
                <span className="legend-label">Updates</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Activity Feed */}
      <div className="activity-feed">
        {groupByDate ? (
          // Grouped by date
          <div className="activity-groups">
            {(groupedActivities as { date: string; items: ActivityItem[] }[]).map((group, groupIndex) => (
              <div key={groupIndex} className="activity-group">
                <div className="group-header">
                  <h4 className="group-date">{formatDate(group.date)}</h4>
                  <span className="group-count">{group.items.length} activities</span>
                </div>
                <div className="group-items">
                  {group.items.map((activity, index) => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-indicator">
                        <div 
                          className="activity-icon"
                          style={{ color: getActivityColor(activity.type) }}
                        >
                          {getActivityIcon(activity.type)}
                        </div>
                        {index < group.items.length - 1 && <div className="activity-line" />}
                      </div>
                      
                      <div className="activity-content">
                        <div className="activity-header">
                          <div className="activity-meta">
                            {showAvatar && activity.author && (
                              <div className="author-avatar">
                                {getAuthorInitials(activity.author)}
                              </div>
                            )}
                            <div className="activity-info">
                              <span className="activity-message">
                                {truncateMessage(activity.message)}
                              </span>
                              <div className="activity-details">
                                {activity.author && (
                                  <span className="activity-author">by {activity.author}</span>
                                )}
                                <span className="activity-type">{activity.type}</span>
                                {showTimestamp && (
                                  <span className="activity-time">
                                    {formatTimestamp(activity.timestamp)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Simple chronological list
          <div className="activity-list">
            {sortedActivities.map((activity, index) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-indicator">
                  <div 
                    className="activity-icon"
                    style={{ color: getActivityColor(activity.type) }}
                  >
                    {getActivityIcon(activity.type)}
                  </div>
                  {index < sortedActivities.length - 1 && <div className="activity-line" />}
                </div>
                
                <div className="activity-content">
                  <div className="activity-header">
                    <div className="activity-meta">
                      {showAvatar && activity.author && (
                        <div className="author-avatar">
                          {getAuthorInitials(activity.author)}
                        </div>
                      )}
                      <div className="activity-info">
                        <span className="activity-message">
                          {truncateMessage(activity.message)}
                        </span>
                        <div className="activity-details">
                          {activity.author && (
                            <span className="activity-author">by {activity.author}</span>
                          )}
                          <span className="activity-type">{activity.type}</span>
                          {showTimestamp && (
                            <span className="activity-time">
                              {formatTimestamp(activity.timestamp)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {activities.length > maxItems && (
        <div className="widget-footer">
          <button className="view-all-button">
            View All Activities ({activities.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentActivityFeedWidget;