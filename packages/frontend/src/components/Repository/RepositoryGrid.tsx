import React, { useState, useMemo, useRef, useEffect } from 'react'
import { cn } from '../../utils/cn'
import { Input } from '../ui/atoms/Input'
import { Select } from '../ui/atoms/Select'
import { Button } from '../ui/atoms/Button'
import { Badge } from '../ui/atoms/Badge'
import { Spinner } from '../ui/atoms/Spinner'
import { RepositoryCard, type RepositoryCardProps } from './RepositoryCard'
import { RepositoryCardCompact } from './RepositoryCardCompact'
import { RovingTabIndex } from '../../utils/keyboard'

export interface RepositoryGridProps {
  /** Array of repositories to display */
  repositories: RepositoryCardProps['repository'][]
  /** Loading state */
  isLoading?: boolean
  /** Error message */
  error?: string | null
  /** Grid layout type */
  layout?: 'grid' | 'list' | 'compact'
  /** Whether to show enhanced features */
  showEnhanced?: boolean
  /** Whether to enable real-time updates */
  enableRealtime?: boolean
  /** Search and filter options */
  searchable?: boolean
  filterable?: boolean
  sortable?: boolean
  /** Pagination */
  pagination?: {
    currentPage: number
    totalPages: number
    pageSize: number
    onPageChange: (page: number) => void
  }
  /** Event handlers */
  onRepositoryClick?: (repository: RepositoryCardProps['repository']) => void
  onRepositoryRefresh?: (repositoryId: string) => void
  onRepositoryDetails?: (repositoryId: string) => void
  onRepositoryCommits?: (repositoryId: string) => void
  onRepositoryManage?: (repositoryId: string) => void
  onRefreshAll?: () => void
  /** Additional CSS classes */
  className?: string
}

export type RepositorySortOption = 'name' | 'updated' | 'stars' | 'health' | 'size'
export type RepositoryFilterOption = 'all' | 'private' | 'public' | 'forked' | 'source'

export const RepositoryGrid = ({
  repositories,
  isLoading = false,
  error = null,
  layout = 'grid',
  showEnhanced = false,
  enableRealtime = false,
  searchable = true,
  filterable = true,
  sortable = true,
  pagination,
  onRepositoryClick,
  onRepositoryRefresh,
  onRepositoryDetails,
  onRepositoryCommits,
  onRepositoryManage,
  onRefreshAll,
  className,
}: RepositoryGridProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<RepositorySortOption>('updated')
  const [filterBy, setFilterBy] = useState<RepositoryFilterOption>('all')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)
  const rovingTabIndexRef = useRef<RovingTabIndex | null>(null)

  // Initialize roving tabindex for keyboard navigation
  useEffect(() => {
    if (gridRef.current && repositories.length > 0 && !rovingTabIndexRef.current) {
      // Look for focusable elements within repository cards
      rovingTabIndexRef.current = new RovingTabIndex(gridRef.current, '[tabindex="0"], button:not([disabled])')
    }

    return () => {
      rovingTabIndexRef.current?.destroy()
      rovingTabIndexRef.current = null
    }
  }, [])

  // Update roving tabindex when repositories change
  useEffect(() => {
    if (rovingTabIndexRef.current && gridRef.current && repositories.length > 0) {
      rovingTabIndexRef.current.updateItems('[tabindex="0"], button:not([disabled])')
    }
  }, [repositories, layout])

  // Filter and sort repositories
  const filteredAndSortedRepositories = useMemo(() => {
    let filtered = repositories

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (repo) =>
          repo.name.toLowerCase().includes(query) ||
          repo.description?.toLowerCase().includes(query) ||
          repo.language?.toLowerCase().includes(query)
      )
    }

    // Apply category filter
    if (filterBy !== 'all') {
      filtered = filtered.filter((repo) => {
        switch (filterBy) {
          case 'private':
            return repo.isPrivate
          case 'public':
            return !repo.isPrivate
          default:
            return true
        }
      })
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'updated':
          return new Date(b.lastCommit.date).getTime() - new Date(a.lastCommit.date).getTime()
        case 'stars':
          return (b.starCount || 0) - (a.starCount || 0)
        case 'size':
          return (b.size || 0) - (a.size || 0)
        default:
          return 0
      }
    })
  }, [repositories, searchQuery, sortBy, filterBy])

  const handleRefreshAll = async () => {
    setIsRefreshing(true)
    try {
      await onRefreshAll?.()
    } finally {
      setIsRefreshing(false)
    }
  }

  const getGridColumns = () => {
    switch (layout) {
      case 'list':
        return 'grid-cols-1'
      case 'compact':
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
      case 'grid':
      default:
        return 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
    }
  }

  if (error) {
    return (
      <div className={cn('text-center py-12', className)}>
        <div className="text-red-600 mb-4">
          <ExclamationIcon className="w-12 h-12 mx-auto mb-2" />
          <p className="text-lg font-medium">Failed to load repositories</p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
        </div>
        <Button onClick={onRefreshAll} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Repositories
            {!isLoading && (
              <Badge variant="secondary" size="sm" className="ml-2">
                {filteredAndSortedRepositories.length}
              </Badge>
            )}
          </h2>

          {enableRealtime && (
            <Badge variant="success" size="sm">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1" />
              Live
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {/* Layout Toggle */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <Button
              variant={layout === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => {}}
              className="px-3 py-1"
            >
              <GridIcon className="w-4 h-4" />
            </Button>
            <Button
              variant={layout === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => {}}
              className="px-3 py-1"
            >
              <ListIcon className="w-4 h-4" />
            </Button>
            <Button
              variant={layout === 'compact' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => {}}
              className="px-3 py-1"
            >
              <CompactIcon className="w-4 h-4" />
            </Button>
          </div>

          <Button variant="outline" size="sm" onClick={handleRefreshAll} disabled={isRefreshing}>
            {isRefreshing ? <Spinner size="sm" /> : <RefreshIcon className="w-4 h-4" />}
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      {(searchable || filterable || sortable) && (
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          {searchable && (
            <div className="flex-1 max-w-md">
              <Input
                type="text"
                placeholder="Search repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
          )}

          <div className="flex space-x-3">
            {filterable && (
              <Select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as RepositoryFilterOption)}
              >
                <option value="all">All Repositories</option>
                <option value="private">Private</option>
                <option value="public">Public</option>
              </Select>
            )}

            {sortable && (
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as RepositorySortOption)}
              >
                <option value="updated">Recently Updated</option>
                <option value="name">Name</option>
                <option value="stars">Most Stars</option>
                <option value="size">Size</option>
              </Select>
            )}
          </div>
        </div>
      )}

      {/* Repository Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="md" />
          <span className="ml-3 text-gray-600">Loading repositories...</span>
        </div>
      ) : filteredAndSortedRepositories.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <FolderIcon className="w-16 h-16 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900">No repositories found</p>
            <p className="text-sm text-gray-500 mt-1">
              {searchQuery ? 'Try adjusting your search criteria' : 'Start by adding a repository'}
            </p>
          </div>
        </div>
      ) : (
        <div ref={gridRef} className={cn('grid gap-6', getGridColumns())} role="grid" aria-label="Repositories grid">
          {filteredAndSortedRepositories.map((repository) =>
            layout === 'compact' ? (
              <RepositoryCardCompact
                key={repository.id}
                repository={repository}
                enableRealtime={enableRealtime}
                onClick={onRepositoryClick}
                onViewDetails={onRepositoryDetails}
              />
            ) : (
              <RepositoryCard
                key={repository.id}
                repository={repository}
                size={layout === 'list' ? 'sm' : 'md'}
                showDetails={showEnhanced}
                showHealth={showEnhanced}
                showIntegrations={showEnhanced}
                enableRealtime={enableRealtime}
                onClick={onRepositoryClick}
                onRefresh={onRepositoryRefresh}
                onViewDetails={onRepositoryDetails}
                onViewCommits={onRepositoryCommits}
                onManage={onRepositoryManage}
              />
            )
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Page {pagination.currentPage} of {pagination.totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Simple SVG icons
const GridIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
    />
  </svg>
)

const ListIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 10h16M4 14h16M4 18h16"
    />
  </svg>
)

const CompactIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z"
    />
  </svg>
)

const RefreshIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
)

const ExclamationIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z"
    />
  </svg>
)

const FolderIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
    />
  </svg>
)

export default RepositoryGrid
