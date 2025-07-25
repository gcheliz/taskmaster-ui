import React from 'react'

export interface FilterOptions {
  priority: 'all' | 'high' | 'medium' | 'low'
  status: 'all' | 'pending' | 'in-progress' | 'done' | 'blocked' | 'deferred'
  assignee: 'all' | string
  complexity: 'all' | 'low' | 'medium' | 'high'
}

export interface SortOptions {
  sortBy: 'title' | 'priority' | 'status' | 'created' | 'updated' | 'complexity'
  sortOrder: 'asc' | 'desc'
}

export interface FilterSortControlsProps {
  filters: FilterOptions
  sorting: SortOptions
  availableAssignees: string[]
  onFilterChange: (filters: FilterOptions) => void
  onSortChange: (sorting: SortOptions) => void
  onClearFilters: () => void
  taskCount: number
  filteredCount: number
  className?: string
}

/**
 * Filter and Sort Controls Component
 *
 * Provides UI controls for filtering tasks by various criteria (priority, status, assignee, complexity)
 * and sorting tasks by different fields. Includes clear filters functionality and task count display.
 */
export const FilterSortControls: React.FC<FilterSortControlsProps> = ({
  filters,
  sorting,
  availableAssignees,
  onFilterChange,
  onSortChange,
  onClearFilters,
  taskCount,
  filteredCount,
  className = '',
}) => {
  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value,
    })
  }

  const handleSortChange = (key: keyof SortOptions, value: string) => {
    onSortChange({
      ...sorting,
      [key]: value,
    })
  }

  const hasActiveFilters =
    filters.priority !== 'all' ||
    filters.status !== 'all' ||
    filters.assignee !== 'all' ||
    filters.complexity !== 'all'

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return '🔴'
      case 'medium':
        return '🟡'
      case 'low':
        return '🟢'
      default:
        return '📋'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳'
      case 'in-progress':
        return '🔄'
      case 'done':
        return '✅'
      case 'blocked':
        return '❌'
      case 'deferred':
        return '⏸️'
      default:
        return '📋'
    }
  }

  const getComplexityIcon = (complexity: string) => {
    switch (complexity) {
      case 'high':
        return '🔥'
      case 'medium':
        return '⚡'
      case 'low':
        return '🌟'
      default:
        return '📊'
    }
  }

  const getSortIcon = (field: string) => {
    if (sorting.sortBy === field) {
      return sorting.sortOrder === 'asc' ? '↑' : '↓'
    }
    return '↕️'
  }

  return (
    <div className={`filter-sort-controls ${className}`}>
      {/* Controls Header */}
      <div className="controls-header">
        <div className="controls-title">
          <span className="title-icon">🔍</span>
          <h3>Filter & Sort</h3>
        </div>
        <div className="task-count">
          <span className="count-text">
            Showing {filteredCount} of {taskCount} tasks
          </span>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="clear-filters-button"
              title="Clear all filters"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Filter Controls */}
      <div className="filter-controls">
        <div className="filter-section">
          <h4>Filters</h4>
          <div className="filter-row">
            {/* Priority Filter */}
            <div className="filter-item">
              <label htmlFor="priority-filter">Priority</label>
              <select
                id="priority-filter"
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="filter-select"
              >
                <option value="all">{getPriorityIcon('all')} All Priorities</option>
                <option value="high">{getPriorityIcon('high')} High</option>
                <option value="medium">{getPriorityIcon('medium')} Medium</option>
                <option value="low">{getPriorityIcon('low')} Low</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="filter-item">
              <label htmlFor="status-filter">Status</label>
              <select
                id="status-filter"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="filter-select"
              >
                <option value="all">{getStatusIcon('all')} All Status</option>
                <option value="pending">{getStatusIcon('pending')} Pending</option>
                <option value="in-progress">{getStatusIcon('in-progress')} In Progress</option>
                <option value="done">{getStatusIcon('done')} Done</option>
                <option value="blocked">{getStatusIcon('blocked')} Blocked</option>
                <option value="deferred">{getStatusIcon('deferred')} Deferred</option>
              </select>
            </div>

            {/* Assignee Filter */}
            <div className="filter-item">
              <label htmlFor="assignee-filter">Assignee</label>
              <select
                id="assignee-filter"
                value={filters.assignee}
                onChange={(e) => handleFilterChange('assignee', e.target.value)}
                className="filter-select"
              >
                <option value="all">👥 All Assignees</option>
                {availableAssignees.map((assignee) => (
                  <option key={assignee} value={assignee}>
                    👤 {assignee}
                  </option>
                ))}
              </select>
            </div>

            {/* Complexity Filter */}
            <div className="filter-item">
              <label htmlFor="complexity-filter">Complexity</label>
              <select
                id="complexity-filter"
                value={filters.complexity}
                onChange={(e) => handleFilterChange('complexity', e.target.value)}
                className="filter-select"
              >
                <option value="all">{getComplexityIcon('all')} All Complexity</option>
                <option value="high">{getComplexityIcon('high')} High</option>
                <option value="medium">{getComplexityIcon('medium')} Medium</option>
                <option value="low">{getComplexityIcon('low')} Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="sort-section">
          <h4>Sort</h4>
          <div className="sort-row">
            {/* Sort By */}
            <div className="sort-item">
              <label htmlFor="sort-by">Sort By</label>
              <select
                id="sort-by"
                value={sorting.sortBy}
                onChange={(e) => handleSortChange('sortBy', e.target.value)}
                className="sort-select"
              >
                <option value="title">📝 Title {getSortIcon('title')}</option>
                <option value="priority">🎯 Priority {getSortIcon('priority')}</option>
                <option value="status">📊 Status {getSortIcon('status')}</option>
                <option value="created">📅 Created {getSortIcon('created')}</option>
                <option value="updated">🔄 Updated {getSortIcon('updated')}</option>
                <option value="complexity">⚡ Complexity {getSortIcon('complexity')}</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="sort-item">
              <label htmlFor="sort-order">Order</label>
              <select
                id="sort-order"
                value={sorting.sortOrder}
                onChange={(e) => handleSortChange('sortOrder', e.target.value)}
                className="sort-select"
              >
                <option value="asc">↑ Ascending</option>
                <option value="desc">↓ Descending</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="active-filters">
          <span className="active-filters-label">Active Filters:</span>
          <div className="active-filters-list">
            {filters.priority !== 'all' && (
              <span className="active-filter">
                {getPriorityIcon(filters.priority)} {filters.priority}
                <button
                  onClick={() => handleFilterChange('priority', 'all')}
                  className="remove-filter"
                  title="Remove priority filter"
                >
                  ×
                </button>
              </span>
            )}
            {filters.status !== 'all' && (
              <span className="active-filter">
                {getStatusIcon(filters.status)} {filters.status}
                <button
                  onClick={() => handleFilterChange('status', 'all')}
                  className="remove-filter"
                  title="Remove status filter"
                >
                  ×
                </button>
              </span>
            )}
            {filters.assignee !== 'all' && (
              <span className="active-filter">
                👤 {filters.assignee}
                <button
                  onClick={() => handleFilterChange('assignee', 'all')}
                  className="remove-filter"
                  title="Remove assignee filter"
                >
                  ×
                </button>
              </span>
            )}
            {filters.complexity !== 'all' && (
              <span className="active-filter">
                {getComplexityIcon(filters.complexity)} {filters.complexity}
                <button
                  onClick={() => handleFilterChange('complexity', 'all')}
                  className="remove-filter"
                  title="Remove complexity filter"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default FilterSortControls
