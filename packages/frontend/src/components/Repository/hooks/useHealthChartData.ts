import { useMemo } from 'react'
import type { RepositoryHealthMetrics } from '../../../services/repositoryService'

export interface ChartDataPoint {
  date: string
  health: number
  commits: number
  contributors: number
}

export interface MetricsDataPoint {
  name: string
  score: number
  fill: string
}

export interface IssueDataPoint {
  name: string
  value: number
  fill: string
}

export interface UseHealthChartDataReturn {
  chartData: ChartDataPoint[]
  metricsData: MetricsDataPoint[]
  issuesBySeverity: IssueDataPoint[]
}

export function useHealthChartData(
  health: RepositoryHealthMetrics | null
): UseHealthChartDataReturn {
  const chartData = useMemo(() => {
    if (!health?.trends.data) return []

    return health.trends.data.map((item) => ({
      date: new Date(item.date).toLocaleDateString(),
      health: item.score,
      commits: item.commits,
      contributors: item.contributors,
    }))
  }, [health?.trends.data])

  const metricsData = useMemo(() => {
    if (!health?.metrics) return []

    return [
      {
        name: 'Code Quality',
        score: health.metrics.codeQuality.score,
        fill: '#3B82F6',
      },
      {
        name: 'Security',
        score: health.metrics.security.score,
        fill: '#EF4444',
      },
      {
        name: 'Performance',
        score: health.metrics.performance.score,
        fill: '#10B981',
      },
      {
        name: 'Testing',
        score: health.metrics.testing.score,
        fill: '#F59E0B',
      },
    ]
  }, [health?.metrics])

  const issuesBySeverity = useMemo(() => {
    if (!health?.issues) return []

    const severityCounts = health.issues.reduce(
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
  }, [health?.issues])

  return {
    chartData,
    metricsData,
    issuesBySeverity,
  }
}