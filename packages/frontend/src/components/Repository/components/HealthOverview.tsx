import React from 'react'
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from 'recharts'
import { cn } from '../../../utils/cn'
import { HealthSummaryCard } from './HealthSummaryCard'
import { useHealthGrade } from '../hooks/useHealthGrade'
import type {
  RepositoryHealthMetrics,
  RepositoryStatistics,
} from '../../../services/repositoryService'
import { CodeIcon, ShieldIcon, SpeedIcon, TestIcon } from '../icons'

export interface HealthOverviewProps {
  health: RepositoryHealthMetrics
  statistics?: RepositoryStatistics | null
}

export const HealthOverview = ({ health, statistics }: HealthOverviewProps) => {
  const { getHealthGrade } = useHealthGrade()
  const healthGrade = getHealthGrade(health.score)

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
                    score: health.score,
                    fill:
                      health.score >= 70
                        ? '#10B981'
                        : health.score >= 50
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
                <div className="text-xs text-gray-500">{health.score}/100</div>
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
          score={health.metrics.codeQuality.score}
          subtitle={`Complexity: ${health.metrics.codeQuality.complexity}`}
          color="blue"
          icon={<CodeIcon className="w-5 h-5" />}
        />
        <HealthSummaryCard
          title="Security"
          score={health.metrics.security.score}
          subtitle={`${health.metrics.security.vulnerabilities} vulnerabilities`}
          color={health.metrics.security.vulnerabilities > 0 ? 'red' : 'green'}
          icon={<ShieldIcon className="w-5 h-5" />}
        />
        <HealthSummaryCard
          title="Performance"
          score={health.metrics.performance.score}
          subtitle={`Build time: ${health.metrics.performance.buildTime}ms`}
          color="green"
          icon={<SpeedIcon className="w-5 h-5" />}
        />
        <HealthSummaryCard
          title="Testing"
          score={health.metrics.testing.score}
          subtitle={`${health.metrics.testing.coverage}% coverage`}
          color={health.metrics.testing.coverage >= 80 ? 'green' : 'yellow'}
          icon={<TestIcon className="w-5 h-5" />}
        />
      </div>

      {/* Quick Stats */}
      {statistics && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Repository Activity</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {statistics.commits.total}
              </div>
              <div className="text-xs text-gray-500">Total Commits</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {statistics.contributors.total}
              </div>
              <div className="text-xs text-gray-500">Contributors</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {statistics.files.total}
              </div>
              <div className="text-xs text-gray-500">Files</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}