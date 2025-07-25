import React from 'react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts'
import { Badge } from '../../ui/atoms/Badge'
import type { RepositoryHealthMetrics } from '../../../services/repositoryService'
import type { IssueDataPoint } from '../hooks/useHealthChartData'
import { CheckIcon, WarningIcon } from '../icons'

export interface HealthIssuesProps {
  health: RepositoryHealthMetrics
  issuesBySeverity: IssueDataPoint[]
}

export const HealthIssues = ({ health, issuesBySeverity }: HealthIssuesProps) => {
  if (!health.issues.length) {
    return (
      <div className="text-center py-12">
        <CheckIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h4 className="text-lg font-medium text-gray-900 mb-2">No Issues Found</h4>
        <p className="text-gray-600">Your repository is looking healthy!</p>
      </div>
    )
  }

  const severityColors = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200',
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
          All Issues ({health.issues.length})
        </h4>
        <div className="max-h-64 overflow-y-auto scrollbar-thin space-y-2">
          {health.issues.map((issue, index) => (
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
          ))}
        </div>
      </div>
    </div>
  )
}