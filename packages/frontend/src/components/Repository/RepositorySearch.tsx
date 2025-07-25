import React, { useState, useCallback, useEffect } from 'react'
import { cn } from '../../utils/cn'
import { Input } from '../ui/atoms/Input'
import { Select } from '../ui/atoms/Select'
import { Button } from '../ui/atoms/Button'
import { Badge } from '../ui/atoms/Badge'
import { useDebounce } from '../../hooks/useDebounce'
import { 
  Search, 
  Filter, 
  X, 
  SortAsc, 
  SortDesc,
  GitBranch,
  Calendar,
  Activity,
  Hash
} from 'lucide-react'

export interface RepositorySearchProps {
  onSearchChange: (query: string) => void
  onFilterChange: (filters: RepositoryFilters) => void
  onSortChange: (sort: RepositorySort) => void
  totalCount: number
  filteredCount: number
  className?: string
}

export interface RepositoryFilters {
  status?: 'all' | 'connected' | 'error' | 'inactive'
  hasGit?: boolean
  hasTaskMaster?: boolean
  branch?: string
  dateRange?: {
    from: Date
    to: Date
  }
}

export interface RepositorySort {
  field: 'name' | 'lastUpdate' | 'health' | 'activity' | 'branchCount'
  direction: 'asc' | 'desc'
}

export const RepositorySearch = ({
  onSearchChange,
  onFilterChange,
  onSortChange,
  totalCount,
  filteredCount,
  className,
}: RepositorySearchProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<RepositoryFilters>({
    status: 'all'
  })
  const [sort, setSort] = useState<RepositorySort>({
    field: 'lastUpdate',
    direction: 'desc'
  })
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  useEffect(() => {
    onSearchChange(debouncedSearchQuery)
  }, [debouncedSearchQuery, onSearchChange])

  const handleFilterChange = useCallback((key: keyof RepositoryFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }, [filters, onFilterChange])

  const handleSortChange = useCallback((field: RepositorySort['field']) => {
    const newSort: RepositorySort = {
      field,
      direction: sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc'
    }
    setSort(newSort)
    onSortChange(newSort)
  }, [sort, onSortChange])

  const clearFilters = () => {
    setSearchQuery('')
    setFilters({ status: 'all' })
    onSearchChange('')
    onFilterChange({ status: 'all' })
  }

  const hasActiveFilters = searchQuery || filters.status !== 'all' || 
    filters.hasGit || filters.hasTaskMaster || filters.branch || filters.dateRange

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Search Bar */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search repositories by name, path, or branch..."
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <Button
          variant={showAdvancedFilters ? 'primary' : 'secondary'}
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <Badge variant="primary" className="ml-2">
              Active
            </Badge>
          )}
        </Button>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="connected">Connected</option>
                <option value="error">Error</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>

            {/* Git Repository Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Repository Type
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.hasGit || false}
                    onChange={(e) => handleFilterChange('hasGit', e.target.checked)}
                    className="mr-2"
                  />
                  <GitBranch className="w-4 h-4 mr-1" />
                  Git Repository
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.hasTaskMaster || false}
                    onChange={(e) => handleFilterChange('hasTaskMaster', e.target.checked)}
                    className="mr-2"
                  />
                  <Hash className="w-4 h-4 mr-1" />
                  TaskMaster Project
                </label>
              </div>
            </div>

            {/* Branch Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Branch
              </label>
              <Input
                value={filters.branch || ''}
                onChange={(e) => handleFilterChange('branch', e.target.value)}
                placeholder="e.g., main, develop"
              />
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Last Updated
              </label>
              <Select
                onChange={(e) => {
                  const value = e.target.value
                  if (value === 'all') {
                    handleFilterChange('dateRange', undefined)
                  } else {
                    const days = parseInt(value)
                    const from = new Date()
                    from.setDate(from.getDate() - days)
                    handleFilterChange('dateRange', { from, to: new Date() })
                  }
                }}
              >
                <option value="all">All Time</option>
                <option value="1">Last 24 hours</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </Select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Showing {filteredCount} of {totalCount} repositories
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      )}

      {/* Sort Options */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Sort by:
        </span>
        <div className="flex gap-2">
          {[
            { field: 'name' as const, icon: Hash, label: 'Name' },
            { field: 'lastUpdate' as const, icon: Calendar, label: 'Last Updated' },
            { field: 'activity' as const, icon: Activity, label: 'Activity' },
            { field: 'branchCount' as const, icon: GitBranch, label: 'Branches' },
          ].map(({ field, icon: Icon, label }) => (
            <Button
              key={field}
              variant={sort.field === field ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handleSortChange(field)}
              className="gap-1"
            >
              <Icon className="w-4 h-4" />
              {label}
              {sort.field === field && (
                sort.direction === 'asc' ? 
                  <SortAsc className="w-4 h-4" /> : 
                  <SortDesc className="w-4 h-4" />
              )}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}