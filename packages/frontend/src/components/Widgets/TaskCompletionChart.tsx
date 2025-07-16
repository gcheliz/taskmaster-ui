import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import './TaskCompletionChart.css';

export interface TaskCompletionChartProps {
  data: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    blocked: number;
    deferred: number;
  };
  chartType?: 'pie' | 'donut' | 'bar';
  showLegend?: boolean;
  showTooltip?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

/**
 * Task Completion Chart Widget
 * 
 * A reusable widget component that displays task statistics and visual charts
 * showing the distribution of tasks by their status. Supports multiple chart types
 * including pie, donut, and bar charts.
 */
export const TaskCompletionChart: React.FC<TaskCompletionChartProps> = ({
  data,
  chartType = 'donut',
  showLegend = true,
  showTooltip = true,
  width = 400,
  height = 300,
  className = ''
}) => {
  // Color mapping for different task statuses
  const statusColors = {
    completed: '#22c55e',
    'in-progress': '#3b82f6',
    pending: '#f59e0b',
    blocked: '#ef4444',
    deferred: '#6b7280'
  };

  // Prepare chart data
  const chartData: ChartDataItem[] = [
    {
      name: 'Completed',
      value: data.completed,
      color: statusColors.completed,
      percentage: data.total > 0 ? (data.completed / data.total) * 100 : 0
    },
    {
      name: 'In Progress',
      value: data.inProgress,
      color: statusColors['in-progress'],
      percentage: data.total > 0 ? (data.inProgress / data.total) * 100 : 0
    },
    {
      name: 'Pending',
      value: data.pending,
      color: statusColors.pending,
      percentage: data.total > 0 ? (data.pending / data.total) * 100 : 0
    },
    {
      name: 'Blocked',
      value: data.blocked,
      color: statusColors.blocked,
      percentage: data.total > 0 ? (data.blocked / data.total) * 100 : 0
    },
    {
      name: 'Deferred',
      value: data.deferred,
      color: statusColors.deferred,
      percentage: data.total > 0 ? (data.deferred / data.total) * 100 : 0
    }
  ].filter(item => item.value > 0); // Only show non-zero values

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartDataItem }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{data.name}</p>
          <p className="tooltip-value">
            <span className="tooltip-count">{data.value} tasks</span>
            <span className="tooltip-percentage">({data.percentage.toFixed(1)}%)</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom legend component
  const CustomLegend = ({ payload }: { payload?: Array<{ color: string; value: string; payload: ChartDataItem }> }) => {
    return (
      <ul className="chart-legend">
        {payload?.map((entry, index: number) => (
          <li key={`legend-${index}`} className="legend-item">
            <span 
              className="legend-color" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="legend-label">{entry.value}</span>
            <span className="legend-value">{entry.payload.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  // Calculate completion rate
  const completionRate = data.total > 0 ? (data.completed / data.total) * 100 : 0;

  // No data state
  if (data.total === 0) {
    return (
      <div className={`task-completion-chart empty ${className}`}>
        <div className="chart-empty">
          <div className="empty-icon">📊</div>
          <h3>No Tasks Found</h3>
          <p>No task data available to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`task-completion-chart ${className}`}>
      {/* Header Stats */}
      <div className="chart-header">
        <div className="chart-title">
          <h3>Task Completion Overview</h3>
          <div className="chart-stats">
            <span className="stat-item">
              <span className="stat-label">Total:</span>
              <span className="stat-value">{data.total}</span>
            </span>
            <span className="stat-item">
              <span className="stat-label">Completed:</span>
              <span className="stat-value">{data.completed}</span>
            </span>
            <span className="stat-item">
              <span className="stat-label">Rate:</span>
              <span className="stat-value">{completionRate.toFixed(1)}%</span>
            </span>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="chart-container" style={{ width, height }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              {showTooltip && <Tooltip content={<CustomTooltip />} />}
              <Bar dataKey="value" fill="#8884d8">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={chartType === 'donut' ? 80 : 100}
                innerRadius={chartType === 'donut' ? 40 : 0}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              {showTooltip && <Tooltip content={<CustomTooltip />} />}
              {showLegend && <Legend content={<CustomLegend />} />}
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Status Breakdown */}
      <div className="chart-breakdown">
        <div className="breakdown-grid">
          {chartData.map((item, index) => (
            <div key={index} className="breakdown-item">
              <div className="breakdown-indicator" style={{ backgroundColor: item.color }} />
              <div className="breakdown-info">
                <span className="breakdown-label">{item.name}</span>
                <span className="breakdown-value">{item.value}</span>
                <span className="breakdown-percentage">({item.percentage.toFixed(1)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="chart-progress">
        <div className="progress-header">
          <span className="progress-label">Overall Progress</span>
          <span className="progress-value">{completionRate.toFixed(1)}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${completionRate}%`,
              backgroundColor: statusColors.completed
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TaskCompletionChart;