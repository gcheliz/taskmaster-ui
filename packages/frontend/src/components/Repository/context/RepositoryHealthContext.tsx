import React, { createContext, useContext, useState, useCallback } from 'react'
import type { RepositoryHealthMetrics, RepositoryStatistics } from '../../../services/repositoryService'
import { useRepositoryHealthData } from '../hooks/useRepositoryHealthData'
import { useHealthChartData } from '../hooks/useHealthChartData'

export interface RepositoryHealthContextValue {
  // Data
  health: RepositoryHealthMetrics | null
  statistics: RepositoryStatistics | null
  isLoading: boolean
  error: string | null
  
  // Chart data
  chartData: ReturnType<typeof useHealthChartData>
  
  // View state
  activeView: 'overview' | 'metrics' | 'issues' | 'trends'
  setActiveView: (view: 'overview' | 'metrics' | 'issues' | 'trends') => void
  
  // Period state
  selectedPeriod: '7d' | '30d' | '90d' | '1y'
  setSelectedPeriod: (period: '7d' | '30d' | '90d' | '1y') => void
  
  // Actions
  refresh: () => Promise<void>
}

const RepositoryHealthContext = createContext<RepositoryHealthContextValue | null>(null)

export interface RepositoryHealthProviderProps {
  children: React.ReactNode
  repositoryId: string
  open: boolean
}

export const RepositoryHealthProvider = ({
  children,
  repositoryId,
  open,
}: RepositoryHealthProviderProps) => {
  const [activeView, setActiveView] = useState<'overview' | 'metrics' | 'issues' | 'trends'>('overview')
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  const { health, statistics, isLoading, error, refresh } = useRepositoryHealthData({
    repositoryId,
    open,
    selectedPeriod,
  })

  const chartData = useHealthChartData(health)

  const handlePeriodChange = useCallback((period: '7d' | '30d' | '90d' | '1y') => {
    setSelectedPeriod(period)
  }, [])

  const value: RepositoryHealthContextValue = {
    health,
    statistics,
    isLoading,
    error,
    chartData,
    activeView,
    setActiveView,
    selectedPeriod,
    setSelectedPeriod: handlePeriodChange,
    refresh,
  }

  return (
    <RepositoryHealthContext.Provider value={value}>
      {children}
    </RepositoryHealthContext.Provider>
  )
}

export const useRepositoryHealthContext = () => {
  const context = useContext(RepositoryHealthContext)
  if (!context) {
    throw new Error('useRepositoryHealthContext must be used within RepositoryHealthProvider')
  }
  return context
}