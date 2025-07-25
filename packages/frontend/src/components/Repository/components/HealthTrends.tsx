import React from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { cn } from '../../../utils/cn'
import type { ChartDataPoint } from '../hooks/useHealthChartData'
import { ChartIcon } from '../icons'

export interface HealthTrendsProps {
  chartData: ChartDataPoint[]
  selectedPeriod: '7d' | '30d' | '90d' | '1y'
  onPeriodChange: (period: '7d' | '30d' | '90d' | '1y') => void
}

export const HealthTrends = ({
  chartData,
  selectedPeriod,
  onPeriodChange,
}: HealthTrendsProps) => {
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
          {(['7d', '30d', '90d', '1y'] as const).map((period) => (
            <button
              key={period}
              onClick={() => onPeriodChange(period)}
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