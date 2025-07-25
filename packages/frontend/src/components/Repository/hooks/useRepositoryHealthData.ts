import { useState, useEffect } from 'react'
import { useRepositoryHealth, useRepositoryStatistics } from '../../../hooks/useRepositoryData'
import type {
  RepositoryHealthMetrics,
  RepositoryStatistics,
} from '../../../services/repositoryService'

export interface UseRepositoryHealthDataProps {
  repositoryId: string
  open: boolean
  selectedPeriod: '7d' | '30d' | '90d' | '1y'
}

export interface UseRepositoryHealthDataReturn {
  health: RepositoryHealthMetrics | null
  statistics: RepositoryStatistics | null
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useRepositoryHealthData({
  repositoryId,
  open,
  selectedPeriod,
}: UseRepositoryHealthDataProps): UseRepositoryHealthDataReturn {
  // Check for Storybook mock service
  const mockService = (window as any).__STORYBOOK_REPOSITORY_SERVICE__

  const {
    health,
    isLoading: healthLoading,
    error: healthError,
    refresh: refreshHealth,
  } = useRepositoryHealth({
    repositoryId,
    autoFetch: open && !mockService,
  })

  const {
    statistics,
    isLoading: statsLoading,
    setPeriod,
  } = useRepositoryStatistics({
    repositoryId,
    period: selectedPeriod,
    autoFetch: open && !mockService,
  })

  // Custom state management for mock data
  const [mockHealth, setMockHealth] = useState<RepositoryHealthMetrics | null>(null)
  const [mockStats, setMockStats] = useState<RepositoryStatistics | null>(null)
  const [mockLoading, setMockLoading] = useState(false)
  const [mockError, setMockError] = useState<string | null>(null)

  // Load mock data when modal opens
  useEffect(() => {
    if (open && mockService && repositoryId) {
      const loadMockData = async () => {
        setMockLoading(true)
        setMockError(null)

        try {
          const [healthResponse, statsResponse] = await Promise.all([
            mockService.getRepositoryHealth(repositoryId),
            mockService.getRepositoryStatistics(repositoryId, selectedPeriod),
          ])

          if (healthResponse.success) {
            setMockHealth(healthResponse.data)
          } else {
            setMockError(healthResponse.error || 'Failed to load health data')
          }

          if (statsResponse.success) {
            setMockStats(statsResponse.data)
          }
        } catch (error) {
          setMockError(error instanceof Error ? error.message : 'Failed to load data')
        } finally {
          setMockLoading(false)
        }
      }

      loadMockData()
    }
  }, [open, mockService, repositoryId, selectedPeriod])

  // Update statistics period when selected period changes
  useEffect(() => {
    setPeriod(selectedPeriod)
  }, [selectedPeriod, setPeriod])

  // Use mock data when available
  const effectiveHealth = mockService ? mockHealth : health
  const effectiveStats = mockService ? mockStats : statistics
  const effectiveLoading = mockService ? mockLoading : (healthLoading || statsLoading)
  const effectiveError = mockService ? mockError : healthError

  const effectiveRefresh = mockService
    ? async () => {
        if (mockService && repositoryId) {
          setMockLoading(true)
          setMockError(null)
          try {
            const response = await mockService.getRepositoryHealth(repositoryId)
            if (response.success) {
              setMockHealth(response.data)
            } else {
              setMockError(response.error || 'Failed to refresh health data')
            }
          } catch (error) {
            setMockError(error instanceof Error ? error.message : 'Failed to refresh')
          } finally {
            setMockLoading(false)
          }
        }
      }
    : refreshHealth

  return {
    health: effectiveHealth,
    statistics: effectiveStats,
    isLoading: effectiveLoading,
    error: effectiveError,
    refresh: effectiveRefresh,
  }
}