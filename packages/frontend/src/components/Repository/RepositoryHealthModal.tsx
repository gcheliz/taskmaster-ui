import React from 'react'
import { cn } from '../../utils/cn'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  ModalClose,
} from '../ui/molecules/Modal'
import { Button } from '../ui/atoms/Button'
import { Badge } from '../ui/atoms/Badge'
import { Spinner } from '../ui/atoms/Spinner'
import { RepositoryHealthProvider, useRepositoryHealthContext } from './context/RepositoryHealthContext'
import {
  HealthOverview,
  HealthMetrics,
  HealthIssues,
  HealthTrends,
} from './components'
import {
  DashboardIcon,
  ChartIcon,
  WarningIcon,
  TrendIcon,
} from './icons'
import { useHealthGrade } from './hooks/useHealthGrade'

export interface RepositoryHealthModalProps {
  /** Whether the modal is open */
  open: boolean
  /** Callback when the modal open state changes */
  onOpenChange: (open: boolean) => void
  /** Repository ID to fetch health data for */
  repositoryId: string
  /** Repository name for display */
  repositoryName: string
  /** Additional CSS classes */
  className?: string
}

const RepositoryHealthModalContent: React.FC<{
  repositoryName: string
  onOpenChange: (open: boolean) => void
  className?: string
}> = ({ repositoryName, onOpenChange, className }) => {
  const {
    health,
    statistics,
    isLoading,
    error,
    refresh,
    activeView,
    setActiveView,
    selectedPeriod,
    setSelectedPeriod,
    chartData,
  } = useRepositoryHealthContext()

  const { getHealthGrade } = useHealthGrade()

  const tabs = [
    {
      key: 'overview' as const,
      label: 'Overview',
      icon: <DashboardIcon className="w-4 h-4" />,
    },
    {
      key: 'metrics' as const,
      label: 'Metrics',
      icon: <ChartIcon className="w-4 h-4" />,
    },
    {
      key: 'issues' as const,
      label: 'Issues',
      icon: <WarningIcon className="w-4 h-4" />,
    },
    {
      key: 'trends' as const,
      label: 'Trends',
      icon: <TrendIcon className="w-4 h-4" />,
    },
  ]

  return (
    <ModalContent size="full" className={className}>
      <ModalHeader>
        <div className="flex items-center justify-between">
          <div>
            <ModalTitle className="text-xl font-semibold">Repository Health Dashboard</ModalTitle>
            <ModalDescription className="mt-1">
              {repositoryName}
              {health && (
                <Badge
                  variant={
                    health.score >= 70
                      ? 'success'
                      : health.score >= 50
                        ? 'warning'
                        : 'error'
                  }
                  size="sm"
                  className="ml-2"
                >
                  {getHealthGrade(health.score).grade}
                </Badge>
              )}
            </ModalDescription>
          </div>
          <ModalClose />
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1 mt-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveView(tab.key)}
              className={cn(
                'flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-colors',
                activeView === tab.key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.key === 'issues' &&
                health?.issues &&
                health.issues.length > 0 && (
                  <Badge variant="error" size="sm">
                    {health.issues.length}
                  </Badge>
                )}
            </button>
          ))}
        </div>
      </ModalHeader>

      <ModalBody className="max-h-[70vh]">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Spinner size="md" />
            <span className="ml-3 text-gray-600">Loading health data...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex">
              <div className="text-red-400">
                <WarningIcon className="w-5 h-5" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading health data</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <Button variant="outline" size="sm" onClick={refresh} className="mt-2">
                  Try again
                </Button>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !error && health && (
          <>
            {activeView === 'overview' && (
              <HealthOverview health={health} statistics={statistics} />
            )}
            {activeView === 'metrics' && (
              <HealthMetrics health={health} metricsData={chartData.metricsData} />
            )}
            {activeView === 'issues' && (
              <HealthIssues health={health} issuesBySeverity={chartData.issuesBySeverity} />
            )}
            {activeView === 'trends' && (
              <HealthTrends
                chartData={chartData.chartData}
                selectedPeriod={selectedPeriod}
                onPeriodChange={setSelectedPeriod}
              />
            )}
          </>
        )}

        {!isLoading && !error && !health && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <DashboardIcon className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No health data available</h3>
            <p className="text-gray-500">Health metrics are not available for this repository.</p>
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-gray-500">
            {health && <span>Last updated: {new Date().toLocaleString()}</span>}
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={refresh}
              disabled={isLoading}
            >
              {isLoading ? <Spinner size="sm" /> : 'Refresh'}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </ModalFooter>
    </ModalContent>
  )
}

export const RepositoryHealthModal: React.FC<RepositoryHealthModalProps> = ({
  open,
  onOpenChange,
  repositoryId,
  repositoryName,
  className,
}) => {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <RepositoryHealthProvider repositoryId={repositoryId} open={open}>
        <RepositoryHealthModalContent
          repositoryName={repositoryName}
          onOpenChange={onOpenChange}
          className={className}
        />
      </RepositoryHealthProvider>
    </Modal>
  )
}

export default RepositoryHealthModal