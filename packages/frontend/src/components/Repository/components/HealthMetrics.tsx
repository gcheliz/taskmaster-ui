import React from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import type { RepositoryHealthMetrics } from '../../../services/repositoryService'
import type { MetricsDataPoint } from '../hooks/useHealthChartData'
import { CodeIcon, ShieldIcon, SpeedIcon, TestIcon } from '../icons'

export interface HealthMetricsProps {
  health: RepositoryHealthMetrics
  metricsData: MetricsDataPoint[]
}

export const HealthMetrics = ({ health, metricsData }: HealthMetricsProps) => {
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
                {health.metrics.codeQuality.complexity}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Duplication:</span>
              <span className="font-medium">
                {health.metrics.codeQuality.duplication}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Maintainability:</span>
              <span className="font-medium">
                {health.metrics.codeQuality.maintainabilityIndex}
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
                {health.metrics.security.vulnerabilities}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Outdated Deps:</span>
              <span className="font-medium">
                {health.metrics.security.outdatedDependencies}
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
                {(health.metrics.performance.bundleSize / 1024).toFixed(1)} KB
              </span>
            </div>
            <div className="flex justify-between">
              <span>Build Time:</span>
              <span className="font-medium">
                {health.metrics.performance.buildTime}ms
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
              <span className="font-medium">{health.metrics.testing.testsCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Coverage:</span>
              <span className="font-medium">{health.metrics.testing.coverage}%</span>
            </div>
            <div className="flex justify-between">
              <span>Pass Rate:</span>
              <span className="font-medium">{health.metrics.testing.passRate}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}