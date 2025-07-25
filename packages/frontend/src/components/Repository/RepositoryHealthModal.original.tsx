import React, { useState, useEffect, useMemo } from 'react'
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
import { useRepositoryHealth, useRepositoryStatistics } from '../../hooks/useRepositoryData'
import type {
  RepositoryHealthMetrics,
  RepositoryStatistics,
} from '../../services/repositoryService'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  Legend,
} from 'recharts'

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

export interface HealthSummaryCardProps {
  title: string
  score: number
  trend?: 'up' | 'down' | 'stable'
  subtitle?: string
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
  icon?: React.ReactNode
}

const HealthSummaryCard = ({
  title,
  score,
  trend,
  subtitle,
  color = 'blue',
  icon,
}: HealthSummaryCardProps) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
  }

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getTrendIcon = () => {
    if (trend === 'up') return <ArrowUpIcon className="w-4 h-4 text-green-500" />
    if (trend === 'down') return <ArrowDownIcon className="w-4 h-4 text-red-500" />
    return <ArrowRightIcon className="w-4 h-4 text-gray-500" />
  }

  return (
    <div
      className={cn('rounded-lg border p-4 transition-[box-shadow] hover:shadow-md', colorClasses[color])}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {icon}
          <h3 className="font-medium">{title}</h3>
        </div>
        {trend && getTrendIcon()}
      </div>

      <div className="flex items-baseline space-x-1">
        <span className={cn('text-2xl font-bold', getScoreColor(score))}>{score}</span>
        <span className="text-sm text-gray-500">/100</span>
      </div>

      {subtitle && <p className="text-xs text-gray-600 mt-1">{subtitle}</p>}
    </div>
  )
}

export const RepositoryHealthModal = ({
  open,
  onOpenChange,
  repositoryId,
  repositoryName,
  className,
}: RepositoryHealthModalProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [activeView, setActiveView] = useState<'overview' | 'metrics' | 'issues' | 'trends'>(
    'overview'
  )

  // Check for Storybook mock service and use custom hooks if available
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

  // Use mock data when available
  const effectiveHealth = mockService ? mockHealth : health
  const effectiveStats = mockService ? mockStats : statistics
  const effectiveHealthLoading = mockService ? mockLoading : healthLoading
  const effectiveStatsLoading = mockService ? mockLoading : statsLoading
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

  // Update statistics period when selected period changes
  useEffect(() => {
    setPeriod(selectedPeriod)
  }, [selectedPeriod, setPeriod])

  const handlePeriodChange = (period: '7d' | '30d' | '90d' | '1y') => {
    setSelectedPeriod(period)
  }

  const chartData = useMemo(() => {
    if (!effectiveHealth?.trends.data) return []

    return effectiveHealth.trends.data.map((item) => ({
      date: new Date(item.date).toLocaleDateString(),
      health: item.score,
      commits: item.commits,
      contributors: item.contributors,
    }))
  }, [effectiveHealth?.trends.data])

  const metricsData = useMemo(() => {
    if (!effectiveHealth?.metrics) return []

    return [
      {
        name: 'Code Quality',
        score: effectiveHealth.metrics.codeQuality.score,
        fill: '#3B82F6',
      },
      {
        name: 'Security',
        score: effectiveHealth.metrics.security.score,
        fill: '#EF4444',
      },
      {
        name: 'Performance',
        score: effectiveHealth.metrics.performance.score,
        fill: '#10B981',
      },
      {
        name: 'Testing',
        score: effectiveHealth.metrics.testing.score,
        fill: '#F59E0B',
      },
    ]
  }, [effectiveHealth?.metrics])

  const issuesBySeverity = useMemo(() => {
    if (!effectiveHealth?.issues) return []

    const severityCounts = effectiveHealth.issues.reduce(
      (acc, issue) => {
        acc[issue.severity] = (acc[issue.severity] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return [
      {
        name: 'Critical',
        value: severityCounts.critical || 0,
        fill: '#DC2626',
      },
      { name: 'High', value: severityCounts.high || 0, fill: '#EA580C' },
      { name: 'Medium', value: severityCounts.medium || 0, fill: '#D97706' },
      { name: 'Low', value: severityCounts.low || 0, fill: '#65A30D' },
    ].filter((item) => item.value > 0)
  }, [effectiveHealth?.issues])

  const getHealthGrade = (score: number): { grade: string; color: string } => {
    if (score >= 90) return { grade: 'A+', color: 'text-green-600' }
    if (score >= 80) return { grade: 'A', color: 'text-green-600' }
    if (score >= 70) return { grade: 'B', color: 'text-blue-600' }
    if (score >= 60) return { grade: 'C', color: 'text-yellow-600' }
    if (score >= 50) return { grade: 'D', color: 'text-orange-600' }
    return { grade: 'F', color: 'text-red-600' }
  }

  const renderOverview = () => {
    if (!effectiveHealth) return null

    const healthGrade = getHealthGrade(effectiveHealth.score)

    return (
      <div className="space-y-6">
        {/* Overall Health Score */}
        <div className="text-center py-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <ResponsiveContainer width={120} height={120}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="90%"
                  data={[
                    {
                      score: effectiveHealth.score,
                      fill:
                        effectiveHealth.score >= 70
                          ? '#10B981'
                          : effectiveHealth.score >= 50
                            ? '#F59E0B'
                            : '#EF4444',
                    },
                  ]}
                >
                  <RadialBar dataKey="score" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={cn('text-2xl font-bold', healthGrade.color)}>
                    {healthGrade.grade}
                  </div>
                  <div className="text-xs text-gray-500">{effectiveHealth.score}/100</div>
                </div>
              </div>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Repository Health</h3>
          <p className="text-sm text-gray-600">
            Overall assessment of repository quality and maintainability
          </p>
        </div>

        {/* Metrics Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <HealthSummaryCard
            title="Code Quality"
            score={effectiveHealth.metrics.codeQuality.score}
            subtitle={`Complexity: ${effectiveHealth.metrics.codeQuality.complexity}`}
            color="blue"
            icon={<CodeIcon className="w-5 h-5" />}
          />
          <HealthSummaryCard
            title="Security"
            score={effectiveHealth.metrics.security.score}
            subtitle={`${effectiveHealth.metrics.security.vulnerabilities} vulnerabilities`}
            color={effectiveHealth.metrics.security.vulnerabilities > 0 ? 'red' : 'green'}
            icon={<ShieldIcon className="w-5 h-5" />}
          />
          <HealthSummaryCard
            title="Performance"
            score={effectiveHealth.metrics.performance.score}
            subtitle={`Build time: ${effectiveHealth.metrics.performance.buildTime}ms`}
            color="green"
            icon={<SpeedIcon className="w-5 h-5" />}
          />
          <HealthSummaryCard
            title="Testing"
            score={effectiveHealth.metrics.testing.score}
            subtitle={`${effectiveHealth.metrics.testing.coverage}% coverage`}
            color={effectiveHealth.metrics.testing.coverage >= 80 ? 'green' : 'yellow'}
            icon={<TestIcon className="w-5 h-5" />}
          />
        </div>

        {/* Quick Stats */}
        {effectiveStats && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Repository Activity</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {effectiveStats.commits.total}
                </div>
                <div className="text-xs text-gray-500">Total Commits</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {effectiveStats.contributors.total}
                </div>
                <div className="text-xs text-gray-500">Contributors</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {effectiveStats.files.total}
                </div>
                <div className="text-xs text-gray-500">Files</div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderMetrics = () => {
    if (!effectiveHealth) return null

    return (
      <div className="space-y-6">
        {/* Metrics Comparison Chart */}
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-medium text-gray-900 mb-4">Health Metrics Comparison</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={metricsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="score" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h5 className="font-medium text-blue-900 mb-3 flex items-center">
              <CodeIcon className="w-4 h-4 mr-2" />
              Code Quality
            </h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Complexity:</span>
                <span className="font-medium">
                  {effectiveHealth.metrics.codeQuality.complexity}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Duplication:</span>
                <span className="font-medium">
                  {effectiveHealth.metrics.codeQuality.duplication}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Maintainability:</span>
                <span className="font-medium">
                  {effectiveHealth.metrics.codeQuality.maintainabilityIndex}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <h5 className="font-medium text-red-900 mb-3 flex items-center">
              <ShieldIcon className="w-4 h-4 mr-2" />
              Security
            </h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Vulnerabilities:</span>
                <span className="font-medium">
                  {effectiveHealth.metrics.security.vulnerabilities}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Outdated Deps:</span>
                <span className="font-medium">
                  {effectiveHealth.metrics.security.outdatedDependencies}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <h5 className="font-medium text-green-900 mb-3 flex items-center">
              <SpeedIcon className="w-4 h-4 mr-2" />
              Performance
            </h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Bundle Size:</span>
                <span className="font-medium">
                  {(effectiveHealth.metrics.performance.bundleSize / 1024).toFixed(1)} KB
                </span>
              </div>
              <div className="flex justify-between">
                <span>Build Time:</span>
                <span className="font-medium">
                  {effectiveHealth.metrics.performance.buildTime}ms
                </span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <h5 className="font-medium text-yellow-900 mb-3 flex items-center">
              <TestIcon className="w-4 h-4 mr-2" />
              Testing
            </h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Test Count:</span>
                <span className="font-medium">{effectiveHealth.metrics.testing.testsCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Coverage:</span>
                <span className="font-medium">{effectiveHealth.metrics.testing.coverage}%</span>
              </div>
              <div className="flex justify-between">
                <span>Pass Rate:</span>
                <span className="font-medium">{effectiveHealth.metrics.testing.passRate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderIssues = () => {
    if (!effectiveHealth?.issues.length) {
      return (
        <div className="text-center py-12">
          <CheckIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Issues Found</h4>
          <p className="text-gray-600">Your repository is looking healthy!</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Issues by Severity Chart */}
        {issuesBySeverity.length > 0 && (
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-medium text-gray-900 mb-4">Issues by Severity</h4>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width={300} height={200}>
                <PieChart>
                  <Pie
                    data={issuesBySeverity}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {issuesBySeverity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Issues List */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">
            All Issues ({effectiveHealth.issues.length})
          </h4>
          <div className="max-h-64 overflow-y-auto scrollbar-thin space-y-2">
            {effectiveHealth.issues.map((issue, index) => {
              const severityColors = {
                critical: 'bg-red-100 text-red-800 border-red-200',
                high: 'bg-orange-100 text-orange-800 border-orange-200',
                medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                low: 'bg-green-100 text-green-800 border-green-200',
              }

              return (
                <div key={index} className="bg-gray-50 rounded-lg p-3 border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge
                          variant="secondary"
                          className={severityColors[issue.severity]}
                          size="sm"
                        >
                          {issue.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" size="sm">
                          {issue.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-900">{issue.message}</p>
                      {issue.file && (
                        <p className="text-xs text-gray-500 mt-1">
                          {issue.file}
                          {issue.line && `:${issue.line}`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const renderTrends = () => {
    if (!chartData.length) {
      return (
        <div className="text-center py-12">
          <ChartIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Trend Data</h4>
          <p className="text-gray-600">Trend data will appear as your repository evolves.</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Period Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Period:</span>
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {['7d', '30d', '90d', '1y'].map((period) => (
              <button
                key={period}
                onClick={() => handlePeriodChange(period as any)}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                  selectedPeriod === period
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Health Trend Chart */}
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-medium text-gray-900 mb-4">Health Score Trend</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="health" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Trends */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <h5 className="font-medium text-gray-900 mb-3">Commit Activity</h5>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="commits"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <h5 className="font-medium text-gray-900 mb-3">Contributor Activity</h5>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="contributors"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="full" className={className}>
        <ModalHeader>
          <div className="flex items-center justify-between">
            <div>
              <ModalTitle className="text-xl font-semibold">Repository Health Dashboard</ModalTitle>
              <ModalDescription className="mt-1">
                {repositoryName}
                {effectiveHealth && (
                  <Badge
                    variant={
                      effectiveHealth.score >= 70
                        ? 'success'
                        : effectiveHealth.score >= 50
                          ? 'warning'
                          : 'error'
                    }
                    size="sm"
                    className="ml-2"
                  >
                    {getHealthGrade(effectiveHealth.score).grade}
                  </Badge>
                )}
              </ModalDescription>
            </div>
            <ModalClose />
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1 mt-4">
            {[
              {
                key: 'overview',
                label: 'Overview',
                icon: <DashboardIcon className="w-4 h-4" />,
              },
              {
                key: 'metrics',
                label: 'Metrics',
                icon: <ChartIcon className="w-4 h-4" />,
              },
              {
                key: 'issues',
                label: 'Issues',
                icon: <WarningIcon className="w-4 h-4" />,
              },
              {
                key: 'trends',
                label: 'Trends',
                icon: <TrendIcon className="w-4 h-4" />,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveView(tab.key as any)}
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
                  effectiveHealth?.issues &&
                  effectiveHealth.issues.length > 0 && (
                    <Badge variant="error" size="sm">
                      {effectiveHealth.issues.length}
                    </Badge>
                  )}
              </button>
            ))}
          </div>
        </ModalHeader>

        <ModalBody className="max-h-[70vh]">
          {(effectiveHealthLoading || effectiveStatsLoading) && (
            <div className="flex items-center justify-center py-12">
              <Spinner size="md" />
              <span className="ml-3 text-gray-600">Loading health data...</span>
            </div>
          )}

          {effectiveError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex">
                <div className="text-red-400">
                  <WarningIcon className="w-5 h-5" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error loading health data</h3>
                  <p className="text-sm text-red-700 mt-1">{effectiveError}</p>
                  <Button variant="outline" size="sm" onClick={effectiveRefresh} className="mt-2">
                    Try again
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!effectiveHealthLoading && !effectiveError && effectiveHealth && (
            <>
              {activeView === 'overview' && renderOverview()}
              {activeView === 'metrics' && renderMetrics()}
              {activeView === 'issues' && renderIssues()}
              {activeView === 'trends' && renderTrends()}
            </>
          )}

          {!effectiveHealthLoading && !effectiveError && !effectiveHealth && (
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
              {effectiveHealth && <span>Last updated: {new Date().toLocaleString()}</span>}
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={effectiveRefresh}
                disabled={effectiveHealthLoading}
              >
                {effectiveHealthLoading ? <Spinner size="sm" /> : 'Refresh'}
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

// Icon components
const CodeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
    />
  </svg>
)

const ShieldIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
)

const SpeedIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 10V3L4 14h7v7l9-11h-7z"
    />
  </svg>
)

const TestIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
    />
  </svg>
)

const DashboardIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
    />
  </svg>
)

const ChartIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
)

const WarningIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z"
    />
  </svg>
)

const TrendIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
    />
  </svg>
)

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const ArrowUpIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 14l5-5 5 5" />
  </svg>
)

const ArrowDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l-5 5-5-5" />
  </svg>
)

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

export default RepositoryHealthModal
