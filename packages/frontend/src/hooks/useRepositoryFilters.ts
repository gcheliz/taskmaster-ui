import { useState, useMemo, useCallback } from 'react'
// Define Repository interface locally
export interface Repository {
  id: string
  name: string
  path: string
  status?: 'connected' | 'active' | 'error' | 'inactive'
  isGitRepository?: boolean
  isTaskMasterProject?: boolean
  gitBranch?: string
  lastUpdated?: string
  connectedAt: string
}
import type { RepositoryFilters, RepositorySort } from '../components/Repository/RepositorySearch'

export interface UseRepositoryFiltersOptions {
  repositories: Repository[]
  defaultSort?: RepositorySort
  defaultFilters?: RepositoryFilters
}

export interface UseRepositoryFiltersReturn {
  // Filtered and sorted data
  filteredRepositories: Repository[]
  
  // Search
  searchQuery: string
  setSearchQuery: (query: string) => void
  
  // Filters
  filters: RepositoryFilters
  setFilters: (filters: RepositoryFilters) => void
  updateFilter: <K extends keyof RepositoryFilters>(key: K, value: RepositoryFilters[K]) => void
  clearFilters: () => void
  
  // Sort
  sort: RepositorySort
  setSort: (sort: RepositorySort) => void
  
  // Stats
  totalCount: number
  filteredCount: number
  hasActiveFilters: boolean
}

export const useRepositoryFilters = ({
  repositories,
  defaultSort = { field: 'lastUpdate', direction: 'desc' },
  defaultFilters = { status: 'all' }
}: UseRepositoryFiltersOptions): UseRepositoryFiltersReturn => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<RepositoryFilters>(defaultFilters)
  const [sort, setSort] = useState<RepositorySort>(defaultSort)

  const updateFilter = useCallback(<K extends keyof RepositoryFilters>(
    key: K, 
    value: RepositoryFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setFilters(defaultFilters)
  }, [defaultFilters])

  const filteredRepositories = useMemo(() => {
    let filtered = [...repositories]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(repo => 
        repo.name.toLowerCase().includes(query) ||
        repo.path?.toLowerCase().includes(query) ||
        repo.gitBranch?.toLowerCase().includes(query)
      )
    }

    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(repo => {
        switch (filters.status) {
          case 'connected':
            return repo.status === 'connected' || repo.status === 'active'
          case 'error':
            return repo.status === 'error'
          case 'inactive':
            return repo.status === 'inactive'
          default:
            return true
        }
      })
    }

    // Apply repository type filters
    if (filters.hasGit !== undefined) {
      filtered = filtered.filter(repo => repo.isGitRepository === filters.hasGit)
    }
    if (filters.hasTaskMaster !== undefined) {
      filtered = filtered.filter(repo => repo.isTaskMasterProject === filters.hasTaskMaster)
    }

    // Apply branch filter
    if (filters.branch) {
      filtered = filtered.filter(repo => 
        repo.gitBranch?.toLowerCase().includes(filters.branch!.toLowerCase())
      )
    }

    // Apply date range filter
    if (filters.dateRange) {
      filtered = filtered.filter(repo => {
        const repoDate = new Date(repo.lastUpdated || repo.connectedAt)
        return repoDate >= filters.dateRange!.from && repoDate <= filters.dateRange!.to
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sort.field) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'lastUpdate': {
          const dateA = new Date(a.lastUpdated || a.connectedAt).getTime()
          const dateB = new Date(b.lastUpdated || b.connectedAt).getTime()
          comparison = dateA - dateB
          break
        }
        case 'health': {
          // Assuming we have a health score
          const healthA = (a as any).healthScore || 0
          const healthB = (b as any).healthScore || 0
          comparison = healthA - healthB
          break
        }
        case 'activity': {
          // Assuming we have activity metrics
          const activityA = (a as any).activityScore || 0
          const activityB = (b as any).activityScore || 0
          comparison = activityA - activityB
          break
        }
        case 'branchCount': {
          // Assuming we have branch count
          const branchesA = (a as any).branchCount || 0
          const branchesB = (b as any).branchCount || 0
          comparison = branchesA - branchesB
          break
        }
      }

      return sort.direction === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [repositories, searchQuery, filters, sort])

  const hasActiveFilters = useMemo(() => {
    return searchQuery !== '' || 
      filters.status !== 'all' ||
      filters.hasGit !== undefined ||
      filters.hasTaskMaster !== undefined ||
      filters.branch !== undefined ||
      filters.dateRange !== undefined
  }, [searchQuery, filters])

  return {
    // Data
    filteredRepositories,
    
    // Search
    searchQuery,
    setSearchQuery,
    
    // Filters
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    
    // Sort
    sort,
    setSort,
    
    // Stats
    totalCount: repositories.length,
    filteredCount: filteredRepositories.length,
    hasActiveFilters
  }
}