import React, { useState, useMemo } from 'react'
import { cn } from '../../utils/cn'
import { EnhancedRepositoryCard } from './EnhancedRepositoryCard'
import { RepositoryStatisticsCard } from './RepositoryStatisticsCard'
import { CommitActivityChart } from './CommitActivityChart'
import { ContributorsCard } from './ContributorsCard'
import { Input } from '../ui/atoms/Input'
import { Button } from '../ui/atoms/Button'
import { Select } from '../ui/atoms/Select'
import { Checkbox } from '../ui/atoms/Checkbox'
import { Badge } from '../ui/atoms/Badge'
import { 
  Search, 
  Filter, 
  Plus, 
  RefreshCw, 
  Trash2,
  GitBranch,
  LayoutGrid,
  LayoutList
} from 'lucide-react'
import { useRepositoryList } from '../../hooks/useRepositoryList'
import { useDebounce } from '../../hooks/useDebounce'

export interface RepositoryDashboardProps {
  onAddRepository?: () => void
  onRepositoryDetails?: (repositoryId: string) => void
  onRepositorySettings?: (repositoryId: string) => void
  onRepositoryRemove?: (repositoryId: string) => void
  className?: string
}

type ViewMode = 'grid' | 'list'
type SortBy = 'name' | 'lastUpdate' | 'health' | 'activity'
type FilterStatus = 'all' | 'connected' | 'error' | 'inactive'

export const RepositoryDashboard: React.FC<RepositoryDashboardProps> = ({
  onAddRepository,
  onRepositoryDetails,
  onRepositorySettings,
  onRepositoryRemove,
  className,
}) => {
  const { repositories, loading, error, refetch } = useRepositoryList()
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('lastUpdate')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [selectedRepositories, setSelectedRepositories] = useState<Set<string>>(new Set())
  const [showStatistics, setShowStatistics] = useState(false)
  const [selectedRepository, setSelectedRepository] = useState<string | null>(null)

  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Filter and sort repositories
  const filteredRepositories = useMemo(() => {
    let filtered = repositories || []

    // Search filter
    if (debouncedSearchQuery) {
      filtered = filtered.filter(repo => 
        repo.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        repo.description?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      )
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(repo => {
        switch (filterStatus) {
          case 'connected':
            return repo.status === 'connected'
          case 'error':
            return repo.status === 'error'
          case 'inactive':
            // Consider inactive if no push in last 30 days
            const lastPush = repo.lastPush ? new Date(repo.lastPush) : null
            const daysSinceLastPush = lastPush 
              ? (Date.now() - lastPush.getTime()) / (1000 * 60 * 60 * 24)
              : Infinity
            return daysSinceLastPush > 30
          default:
            return true
        }
      })
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'lastUpdate':
          return new Date(b.lastPush || 0).getTime() - new Date(a.lastPush || 0).getTime()
        case 'health':
          return (b.health?.overall || 0) - (a.health?.overall || 0)
        case 'activity':
          return (b.stats?.totalCommits || 0) - (a.stats?.totalCommits || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [repositories, debouncedSearchQuery, filterStatus, sortBy])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRepositories(new Set(filteredRepositories.map(r => r.id)))
    } else {
      setSelectedRepositories(new Set())
    }
  }

  const handleSelectRepository = (repositoryId: string, selected: boolean) => {
    const newSelection = new Set(selectedRepositories)
    if (selected) {
      newSelection.add(repositoryId)
    } else {
      newSelection.delete(repositoryId)
    }
    setSelectedRepositories(newSelection)
  }

  const handleBatchSync = async () => {
    // Implement batch sync
    console.log('Syncing repositories:', Array.from(selectedRepositories))
    await refetch()
  }

  const handleBatchRemove = async () => {
    // Implement batch remove
    console.log('Removing repositories:', Array.from(selectedRepositories))
    selectedRepositories.forEach(id => onRepositoryRemove?.(id))
    setSelectedRepositories(new Set())
  }

  const isAllSelected = filteredRepositories.length > 0 && 
    filteredRepositories.every(r => selectedRepositories.has(r.id))

  if (loading && !repositories) {
    return (
      <div className={cn('flex items-center justify-center h-64', className)}>
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-slate-500">Loading repositories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Repository Management
          </h2>
          <p className="text-slate-500 mt-1">
            Manage your Git repositories with visual statistics and health monitoring
          </p>
        </div>
        <Button onClick={onAddRepository} variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Repository
        </Button>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search repositories..."
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Select
            value={filterStatus}
            onValueChange={(value) => setFilterStatus(value as FilterStatus)}
          >
            <option value="all">All Status</option>
            <option value="connected">Connected</option>
            <option value="error">Error</option>
            <option value="inactive">Inactive</option>
          </Select>

          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SortBy)}
          >
            <option value="lastUpdate">Last Updated</option>
            <option value="name">Name</option>
            <option value="health">Health Score</option>
            <option value="activity">Activity</option>
          </Select>
        </div>

        {/* View Mode */}
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="px-2"
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="px-2"
          >
            <LayoutList className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Batch Actions */}
      {selectedRepositories.size > 0 && (
        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm font-medium">
              {selectedRepositories.size} repositories selected
            </span>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleBatchSync} size="sm" variant="secondary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync Selected
            </Button>
            <Button onClick={handleBatchRemove} size="sm" variant="secondary" className="text-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Remove Selected
            </Button>
          </div>
        </div>
      )}

      {/* Repository Grid/List */}
      {filteredRepositories.length === 0 ? (
        <div className="text-center py-12">
          <GitBranch className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500">
            {searchQuery ? 'No repositories found matching your search' : 'No repositories connected yet'}
          </p>
          {!searchQuery && (
            <Button onClick={onAddRepository} variant="primary" size="sm" className="mt-4">
              Add Your First Repository
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className={cn(
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
              : 'space-y-4'
          )}>
            {filteredRepositories.map(repo => (
              <EnhancedRepositoryCard
                key={repo.id}
                repositoryId={repo.id}
                isSelected={selectedRepositories.has(repo.id)}
                onSelect={(selected) => handleSelectRepository(repo.id, selected)}
                onViewDetails={() => {
                  setSelectedRepository(repo.id)
                  setShowStatistics(true)
                  onRepositoryDetails?.(repo.id)
                }}
                onSettings={() => onRepositorySettings?.(repo.id)}
                onRemove={() => onRepositoryRemove?.(repo.id)}
                onSync={() => refetch()}
                showBatchSelect
                className={viewMode === 'list' ? 'w-full' : ''}
              />
            ))}
          </div>

          {/* Statistics Panel */}
          {showStatistics && selectedRepository && (
            <div className="mt-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">
                  Repository Statistics - {
                    repositories?.find(r => r.id === selectedRepository)?.name
                  }
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowStatistics(false)}
                >
                  Hide Statistics
                </Button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RepositoryStatisticsCard repositoryId={selectedRepository} />
                <CommitActivityChart repositoryId={selectedRepository} />
                <ContributorsCard 
                  repositoryId={selectedRepository} 
                  className="lg:col-span-2"
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default RepositoryDashboard