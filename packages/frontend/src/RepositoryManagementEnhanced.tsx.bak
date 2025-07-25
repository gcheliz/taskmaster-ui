import React, { useState } from 'react'
import { cn } from '../../utils/cn'
import { useRepositoryList } from '../../hooks/useRepositoryList'
import { useRepositoryFilters } from '../../hooks/useRepositoryFilters'
import { repositoryBatchService } from '../../services/repositoryBatchService'
import { RepositorySearch } from './RepositorySearch'
import { EnhancedRepositoryCard } from './EnhancedRepositoryCard'
import { Button } from '../ui/atoms/Button'
import { Checkbox } from '../ui/atoms/Checkbox'
import { Spinner } from '../ui/atoms/Spinner'
import { Badge } from '../ui/atoms/Badge'
import { 
  Plus, 
  RefreshCw, 
  Trash2, 
  Download, 
  Upload,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

export interface RepositoryManagementEnhancedProps {
  onAddRepository?: () => void
  className?: string
}

export const RepositoryManagementEnhanced: React.FC<RepositoryManagementEnhancedProps> = ({
  onAddRepository,
  className
}) => {
  const { repositories, isLoading, error, refetch } = useRepositoryList()
  const [selectedRepositories, setSelectedRepositories] = useState<Set<string>>(new Set())
  const [batchOperation, setBatchOperation] = useState<'sync' | 'remove' | 'export' | null>(null)
  const [operationResult, setOperationResult] = useState<any>(null)

  const {
    filteredRepositories,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    sort,
    setSort,
    totalCount,
    filteredCount
  } = useRepositoryFilters({ 
    repositories: repositories.map(r => ({
      ...r,
      status: 'active' as const,
      connectedAt: new Date().toISOString()
    }))
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRepositories(new Set(filteredRepositories.map(r => r.id)))
    } else {
      setSelectedRepositories(new Set())
    }
  }

  const handleSelectRepository = (id: string, selected: boolean) => {
    const newSelection = new Set(selectedRepositories)
    if (selected) {
      newSelection.add(id)
    } else {
      newSelection.delete(id)
    }
    setSelectedRepositories(newSelection)
  }

  const handleBatchSync = async () => {
    setBatchOperation('sync')
    setOperationResult(null)
    
    const ids = Array.from(selectedRepositories)
    const result = await repositoryBatchService.batchSync(ids, {
      includeRemote: true,
      fetchBranches: true,
      updateMetadata: true
    })
    
    setOperationResult(result)
    setBatchOperation(null)
    await refetch()
    setSelectedRepositories(new Set())
  }

  const handleBatchRemove = async () => {
    if (!window.confirm(`Remove ${selectedRepositories.size} repositories?`)) {
      return
    }
    
    setBatchOperation('remove')
    setOperationResult(null)
    
    const ids = Array.from(selectedRepositories)
    const result = await repositoryBatchService.batchRemove(ids)
    
    setOperationResult(result)
    setBatchOperation(null)
    await refetch()
    setSelectedRepositories(new Set())
  }

  const handleExport = async (format: 'json' | 'csv') => {
    setBatchOperation('export')
    
    const ids = selectedRepositories.size > 0 
      ? Array.from(selectedRepositories)
      : filteredRepositories.map(r => r.id)
      
    const data = await repositoryBatchService.exportRepositories(ids, format)
    
    // Create download
    const blob = new Blob([data], { 
      type: format === 'json' ? 'application/json' : 'text/csv' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `repositories-${new Date().toISOString().split('T')[0]}.${format}`
    a.click()
    URL.revokeObjectURL(url)
    
    setBatchOperation(null)
  }

  const isAllSelected = filteredRepositories.length > 0 && 
    filteredRepositories.every(r => selectedRepositories.has(r.id))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Repository Management</h2>
          <p className="text-slate-600 mt-1">
            Search, filter, and manage your repositories with advanced controls
          </p>
        </div>
        <Button onClick={onAddRepository} variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Repository
        </Button>
      </div>

      {/* Search and Filters */}
      <RepositorySearch
        onSearchChange={setSearchQuery}
        onFilterChange={setFilters}
        onSortChange={setSort}
        totalCount={totalCount}
        filteredCount={filteredCount}
      />

      {/* Batch Actions Bar */}
      {selectedRepositories.size > 0 && (
        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isAllSelected}
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
            <span className="font-medium">
              {selectedRepositories.size} of {filteredCount} selected
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={handleBatchSync}
              size="sm"
              variant="secondary"
              disabled={batchOperation !== null}
            >
              <RefreshCw className={cn(
                "w-4 h-4 mr-2",
                batchOperation === 'sync' && "animate-spin"
              )} />
              Sync
            </Button>
            
            <Button
              onClick={() => handleExport('json')}
              size="sm"
              variant="secondary"
              disabled={batchOperation !== null}
            >
              <Download className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
            
            <Button
              onClick={() => handleExport('csv')}
              size="sm"
              variant="secondary"
              disabled={batchOperation !== null}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            
            <Button
              onClick={handleBatchRemove}
              size="sm"
              variant="secondary"
              className="text-red-600"
              disabled={batchOperation !== null}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove
            </Button>
          </div>
        </div>
      )}

      {/* Operation Result */}
      {operationResult && (
        <div className="p-4 rounded-lg border bg-white dark:bg-slate-900">
          <h3 className="font-medium mb-2">Operation Result</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>{operationResult.successful.length} successful</span>
            </div>
            {operationResult.failed.length > 0 && (
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span>{operationResult.failed.length} failed</span>
              </div>
            )}
          </div>
          {operationResult.failed.length > 0 && (
            <div className="mt-2 text-sm text-red-600">
              {operationResult.failed.map((f: any) => (
                <div key={f.id}>Repository {f.id}: {f.error}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Repository Grid */}
      {filteredRepositories.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <p className="text-slate-600">
            {searchQuery || Object.keys(filters).length > 1
              ? 'No repositories match your filters'
              : 'No repositories connected yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredRepositories.map(repo => (
            <EnhancedRepositoryCard
              key={repo.id}
              repositoryId={repo.id}
              isSelected={selectedRepositories.has(repo.id)}
              onSelect={(selected) => handleSelectRepository(repo.id, selected)}
              showBatchSelect
              className="h-full"
            />
          ))}
        </div>
      )}

      {/* Stats Footer */}
      <div className="flex items-center justify-between text-sm text-slate-600">
        <div>
          Showing {filteredCount} of {totalCount} repositories
        </div>
        <Button
          onClick={() => refetch()}
          variant="ghost"
          size="sm"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh All
        </Button>
      </div>
    </div>
  )
}