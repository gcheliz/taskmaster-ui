import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import './ProgressVisualizationWidget.css';

export interface ProgressDataPoint {
  date: string;
  completed: number;
  total: number;
  completionRate: number;
  newTasks?: number;
  velocity?: number;
}

export interface ProgressVisualizationWidgetProps {
  data: ProgressDataPoint[];
  chartType?: 'line' | 'area';
  showVelocity?: boolean;
  showTrendLine?: boolean;
  timeRange?: '7d' | '30d' | '90d' | 'all';
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Progress Visualization Widget
 * 
 * A reusable widget component that visualizes project progress over time using
 * line charts or area charts. Shows cumulative task completions, completion rates,
 * and velocity trends against a timeline.
 */
export const ProgressVisualizationWidget: React.FC<ProgressVisualizationWidgetProps> = ({
  data,
  chartType = 'line',
  showVelocity = true,
  showTrendLine = false,
  timeRange = '30d',
  width = 800,
  height = 400,
  className = ''
}) => {
  // Filter data based on time range
  const filteredData = useMemo(() => {
    if (timeRange === 'all') return data;
    
    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    return data.filter(point => new Date(point.date) >= cutoffDate);
  }, [data, timeRange]);

  // Calculate velocity (tasks completed per day)
  const dataWithVelocity = useMemo(() => {
    return filteredData.map((point, index) => {
      let velocity = 0;
      if (index > 0) {
        const prevPoint = filteredData[index - 1];
        const daysDiff = Math.max(1, Math.floor((new Date(point.date).getTime() - new Date(prevPoint.date).getTime()) / (24 * 60 * 60 * 1000)));
        velocity = (point.completed - prevPoint.completed) / daysDiff;
      }
      return { ...point, velocity: Math.round(velocity * 100) / 100 };
    });
  }, [filteredData]);

  // Calculate trend line data
  const trendData = useMemo(() => {
    if (!showTrendLine || dataWithVelocity.length < 2) return [];
    
    const n = dataWithVelocity.length;
    const sumX = dataWithVelocity.reduce((sum, _, i) => sum + i, 0);
    const sumY = dataWithVelocity.reduce((sum, point) => sum + point.completed, 0);
    const sumXY = dataWithVelocity.reduce((sum, point, i) => sum + i * point.completed, 0);
    const sumXX = dataWithVelocity.reduce((sum, _, i) => sum + i * i, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return dataWithVelocity.map((point, i) => ({
      ...point,
      trend: Math.round(slope * i + intercept)
    }));
  }, [dataWithVelocity, showTrendLine]);

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: timeRange === 'all' ? 'numeric' : undefined
    });
  };

  // Format completion rate as percentage
  const formatPercentage = (value: number) => {
    return `${Math.round(value)}%`;
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: { 
    active?: boolean; 
    payload?: Array<{ payload: ProgressDataPoint & { velocity: number } }>; 
    label?: string 
  }) => {
    if (active && payload && payload.length && label) {
      const data = payload[0].payload;
      return (
        <div className="progress-tooltip">
          <p className="tooltip-label">{formatDate(label)}</p>
          <div className="tooltip-content">
            <div className="tooltip-item">
              <span className="tooltip-dot completed" />
              <span className="tooltip-text">Completed: {data.completed}</span>
            </div>
            <div className="tooltip-item">
              <span className="tooltip-dot total" />
              <span className="tooltip-text">Total: {data.total}</span>
            </div>
            <div className="tooltip-item">
              <span className="tooltip-dot rate" />
              <span className="tooltip-text">Rate: {formatPercentage(data.completionRate)}</span>
            </div>
            {showVelocity && (
              <div className="tooltip-item">
                <span className="tooltip-dot velocity" />
                <span className="tooltip-text">Velocity: {data.velocity} tasks/day</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculate key metrics
  const metrics = useMemo(() => {
    if (dataWithVelocity.length === 0) return null;
    
    const latest = dataWithVelocity[dataWithVelocity.length - 1];
    const earliest = dataWithVelocity[0];
    const totalDays = Math.max(1, Math.floor((new Date(latest.date).getTime() - new Date(earliest.date).getTime()) / (24 * 60 * 60 * 1000)));
    const avgVelocity = (latest.completed - earliest.completed) / totalDays;
    const avgCompletionRate = dataWithVelocity.reduce((sum, point) => sum + point.completionRate, 0) / dataWithVelocity.length;
    
    return {
      totalCompleted: latest.completed,
      totalTasks: latest.total,
      avgVelocity: Math.round(avgVelocity * 100) / 100,
      avgCompletionRate: Math.round(avgCompletionRate * 100) / 100,
      timeSpan: totalDays
    };
  }, [dataWithVelocity]);

  // No data state
  if (filteredData.length === 0) {
    return (
      <div className={`progress-visualization-widget empty ${className}`}>
        <div className="widget-empty">
          <div className="empty-icon">📈</div>
          <h3>No Progress Data</h3>
          <p>No progress data available for the selected time range</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`progress-visualization-widget ${className}`}>
      {/* Header */}
      <div className="widget-header">
        <div className="header-info">
          <h3>Progress Over Time</h3>
          {metrics && (
            <div className="header-metrics">
              <span className="metric">
                <span className="metric-value">{metrics.totalCompleted}</span>
                <span className="metric-label">completed</span>
              </span>
              <span className="metric">
                <span className="metric-value">{metrics.avgVelocity}</span>
                <span className="metric-label">avg velocity</span>
              </span>
              <span className="metric">
                <span className="metric-value">{formatPercentage(metrics.avgCompletionRate)}</span>
                <span className="metric-label">avg rate</span>
              </span>
            </div>
          )}
        </div>
        
        {/* Time Range Filter */}
        <div className="time-range-filter">
          <span className="filter-label">Time Range:</span>
          <span className="filter-value">{timeRange}</span>
        </div>
      </div>

      {/* Chart Container */}
      <div className="chart-container" style={{ width, height }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={showTrendLine ? trendData : dataWithVelocity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                interval="preserveStartEnd"
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="completed"
                stackId="1"
                stroke="#22c55e"
                fill="#22c55e"
                fillOpacity={0.6}
                name="Completed Tasks"
              />
              <Area
                type="monotone"
                dataKey="total"
                stackId="2"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
                name="Total Tasks"
              />
              {showTrendLine && (
                <Line
                  type="monotone"
                  dataKey="trend"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Trend Line"
                />
              )}
            </AreaChart>
          ) : (
            <LineChart data={showTrendLine ? trendData : dataWithVelocity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                interval="preserveStartEnd"
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                name="Completed Tasks"
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                name="Total Tasks"
              />
              {showVelocity && (
                <Line
                  type="monotone"
                  dataKey="velocity"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 3 }}
                  name="Velocity (tasks/day)"
                />
              )}
              {showTrendLine && (
                <Line
                  type="monotone"
                  dataKey="trend"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Trend Line"
                />
              )}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Progress Summary */}
      <div className="progress-summary">
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Current Progress</span>
            <span className="summary-value">
              {metrics && formatPercentage((metrics.totalCompleted / metrics.totalTasks) * 100)}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Time Span</span>
            <span className="summary-value">{metrics?.timeSpan} days</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Data Points</span>
            <span className="summary-value">{dataWithVelocity.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Latest Update</span>
            <span className="summary-value">
              {dataWithVelocity.length > 0 ? formatDate(dataWithVelocity[dataWithVelocity.length - 1].date) : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressVisualizationWidget;