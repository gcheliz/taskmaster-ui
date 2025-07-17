import React, { useState, useMemo } from 'react';
import type { PRDAnalysisResult } from '../../services/api';

export interface PRDAnalysisResultsProps {
  /** Analysis result data */
  result: PRDAnalysisResult;
  /** Whether to show in compact mode */
  compact?: boolean;
  /** Additional CSS class name */
  className?: string;
  /** Callback when task is selected */
  onTaskSelect?: (taskIndex: number) => void;
  /** Callback when dependency is selected */
  onDependencySelect?: (dependency: { from: string; to: string; type: string }) => void;
  /** Whether to show export options */
  showExportOptions?: boolean;
}

/**
 * PRD Analysis Results Component
 * 
 * Displays comprehensive analysis results including:
 * - Task breakdown with priorities and complexity
 * - Dependency visualization
 * - Time estimates and recommendations
 * - Export capabilities
 */
export const PRDAnalysisResults: React.FC<PRDAnalysisResultsProps> = ({
  result,
  compact = false,
  className = '',
  onTaskSelect,
  onDependencySelect,
  showExportOptions = true,
}) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'dependencies' | 'summary' | 'recommendations'>('summary');
  const [sortBy, setSortBy] = useState<'priority' | 'complexity' | 'hours' | 'title'>('priority');
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [showExportModal, setShowExportModal] = useState(false);

  const { analysis } = result;

  // Sort and filter tasks
  const sortedTasks = useMemo(() => {
    let filtered = analysis.extractedTasks;
    
    // Filter by priority
    if (filterPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterPriority);
    }
    
    // Sort tasks
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority': {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        case 'complexity':
          return b.complexity - a.complexity;
        case 'hours':
          return b.estimatedHours - a.estimatedHours;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  }, [analysis.extractedTasks, sortBy, filterPriority]);

  // Calculate summary statistics
  const stats = useMemo(() => {
    const tasks = analysis.extractedTasks;
    const totalTasks = tasks.length;
    const totalHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0);
    const priorityBreakdown = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const avgComplexity = tasks.length > 0 
      ? tasks.reduce((sum, task) => sum + task.complexity, 0) / tasks.length 
      : 0;

    return {
      totalTasks,
      totalHours,
      avgComplexity,
      priorityBreakdown,
      complexityScore: analysis.complexityScore,
    };
  }, [analysis]);

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(result, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `prd-analysis-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleExportCSV = () => {
    const headers = ['Title', 'Description', 'Priority', 'Complexity', 'Estimated Hours'];
    const csvContent = [
      headers.join(','),
      ...analysis.extractedTasks.map(task => [
        `"${task.title.replace(/"/g, '""')}"`,
        `"${task.description.replace(/"/g, '""')}"`,
        task.priority,
        task.complexity,
        task.estimatedHours
      ].join(','))
    ].join('\n');
    
    const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    const exportFileDefaultName = `prd-analysis-tasks-${new Date().toISOString().split('T')[0]}.csv`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getComplexityColor = (complexity: number) => {
    if (complexity >= 8) return '#dc3545';
    if (complexity >= 5) return '#ffc107';
    return '#28a745';
  };

  if (compact) {
    return (
      <div className={`prd-analysis-results compact ${className}`}>
        <div className="compact-summary">
          <div className="summary-item">
            <span className="label">Tasks:</span>
            <span className="value">{stats.totalTasks}</span>
          </div>
          <div className="summary-item">
            <span className="label">Hours:</span>
            <span className="value">{stats.totalHours}h</span>
          </div>
          <div className="summary-item">
            <span className="label">Complexity:</span>
            <span className="value">{stats.complexityScore}%</span>
          </div>
        </div>
        <style>{getCompactStyles()}</style>
      </div>
    );
  }

  return (
    <div className={`prd-analysis-results ${className}`}>
      {/* Header */}
      <div className="results-header">
        <div className="header-info">
          <h3>PRD Analysis Results</h3>
          <span className="timestamp">
            Analyzed on {new Date(result.timestamp).toLocaleString()}
          </span>
          <span className="execution-time">
            ({result.executionTime}ms)
          </span>
        </div>
        {showExportOptions && (
          <div className="header-actions">
            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="export-button"
            >
              📤 Export
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="results-tabs">
        <button
          type="button"
          className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          📊 Summary
        </button>
        <button
          type="button"
          className={`tab ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          📋 Tasks ({stats.totalTasks})
        </button>
        <button
          type="button"
          className={`tab ${activeTab === 'dependencies' ? 'active' : ''}`}
          onClick={() => setActiveTab('dependencies')}
        >
          🔗 Dependencies ({analysis.dependencies.length})
        </button>
        <button
          type="button"
          className={`tab ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          💡 Recommendations ({analysis.recommendations.length})
        </button>
      </div>

      {/* Content */}
      <div className="results-content">
        {activeTab === 'summary' && (
          <div className="summary-view">
            <div className="stats-grid">
              <div className="stat-card">
                <h4>📋 Total Tasks</h4>
                <div className="stat-value">{stats.totalTasks}</div>
              </div>
              <div className="stat-card">
                <h4>⏱️ Total Hours</h4>
                <div className="stat-value">{stats.totalHours}h</div>
              </div>
              <div className="stat-card">
                <h4>🧮 Complexity Score</h4>
                <div className="stat-value">{stats.complexityScore}%</div>
              </div>
              <div className="stat-card">
                <h4>📈 Avg Complexity</h4>
                <div className="stat-value">{stats.avgComplexity.toFixed(1)}/10</div>
              </div>
            </div>

            <div className="priority-breakdown">
              <h4>Priority Breakdown</h4>
              <div className="priority-bars">
                {(['high', 'medium', 'low'] as const).map(priority => (
                  <div key={priority} className="priority-bar">
                    <div className="priority-label">
                      <span className="priority-name" style={{ color: getPriorityColor(priority) }}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </span>
                      <span className="priority-count">
                        {stats.priorityBreakdown[priority] || 0}
                      </span>
                    </div>
                    <div className="priority-progress">
                      <div 
                        className="priority-fill"
                        style={{ 
                          width: `${((stats.priorityBreakdown[priority] || 0) / stats.totalTasks) * 100}%`,
                          backgroundColor: getPriorityColor(priority)
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="tasks-view">
            <div className="tasks-controls">
              <div className="control-group">
                <label>Sort by:</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <option value="priority">Priority</option>
                  <option value="complexity">Complexity</option>
                  <option value="hours">Hours</option>
                  <option value="title">Title</option>
                </select>
              </div>
              <div className="control-group">
                <label>Filter:</label>
                <select 
                  value={filterPriority} 
                  onChange={(e) => setFilterPriority(e.target.value as any)}
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
            </div>

            <div className="tasks-list">
              {sortedTasks.map((task, index) => (
                <div 
                  key={index}
                  className="task-item"
                  onClick={() => onTaskSelect?.(index)}
                >
                  <div className="task-header">
                    <h5 className="task-title">{task.title}</h5>
                    <div className="task-meta">
                      <span 
                        className="task-priority"
                        style={{ color: getPriorityColor(task.priority) }}
                      >
                        {task.priority.toUpperCase()}
                      </span>
                      <span className="task-hours">{task.estimatedHours}h</span>
                      <span 
                        className="task-complexity"
                        style={{ color: getComplexityColor(task.complexity) }}
                      >
                        {task.complexity}/10
                      </span>
                    </div>
                  </div>
                  <p className="task-description">{task.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'dependencies' && (
          <div className="dependencies-view">
            {analysis.dependencies.length === 0 ? (
              <div className="empty-state">
                <p>No dependencies detected in this PRD</p>
              </div>
            ) : (
              <div className="dependencies-list">
                {analysis.dependencies.map((dep, index) => (
                  <div 
                    key={index}
                    className="dependency-item"
                    onClick={() => onDependencySelect?.(dep)}
                  >
                    <div className="dependency-type">{dep.type}</div>
                    <div className="dependency-flow">
                      <span className="dependency-from">{dep.from}</span>
                      <span className="dependency-arrow">→</span>
                      <span className="dependency-to">{dep.to}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="recommendations-view">
            {analysis.recommendations.length === 0 ? (
              <div className="empty-state">
                <p>No specific recommendations for this PRD</p>
              </div>
            ) : (
              <div className="recommendations-list">
                {analysis.recommendations.map((rec, index) => (
                  <div key={index} className="recommendation-item">
                    <div className="recommendation-icon">💡</div>
                    <div className="recommendation-text">{rec}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="export-modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="export-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Export Analysis Results</h4>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="close-button"
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="export-option">
                <button
                  type="button"
                  onClick={() => {
                    handleExportJSON();
                    setShowExportModal(false);
                  }}
                  className="export-option-button"
                >
                  📄 Export as JSON
                </button>
                <p>Complete analysis data including all metadata</p>
              </div>
              <div className="export-option">
                <button
                  type="button"
                  onClick={() => {
                    handleExportCSV();
                    setShowExportModal(false);
                  }}
                  className="export-option-button"
                >
                  📊 Export Tasks as CSV
                </button>
                <p>Task list in spreadsheet format</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{getFullStyles()}</style>
    </div>
  );
};

function getCompactStyles() {
  return `
    .prd-analysis-results.compact {
      padding: 8px;
      background: #f8f9fa;
      border-radius: 4px;
      border: 1px solid #e9ecef;
    }

    .compact-summary {
      display: flex;
      gap: 12px;
      font-size: 12px;
    }

    .summary-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }

    .summary-item .label {
      color: #6c757d;
      font-weight: 500;
    }

    .summary-item .value {
      font-weight: 600;
      color: #1a1a1a;
    }
  `;
}

function getFullStyles() {
  return `
    .prd-analysis-results {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
    }

    .header-info h3 {
      margin: 0 0 4px 0;
      color: #1a1a1a;
      font-size: 18px;
    }

    .timestamp {
      color: #6c757d;
      font-size: 12px;
      margin-right: 8px;
    }

    .execution-time {
      color: #6c757d;
      font-size: 12px;
    }

    .export-button {
      padding: 8px 16px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.2s;
    }

    .export-button:hover {
      background: #0056b3;
    }

    .results-tabs {
      display: flex;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
    }

    .tab {
      padding: 12px 16px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 14px;
      color: #6c757d;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }

    .tab:hover {
      color: #495057;
      background: #e9ecef;
    }

    .tab.active {
      color: #007bff;
      border-bottom-color: #007bff;
    }

    .results-content {
      padding: 20px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      padding: 16px;
      background: #f8f9fa;
      border-radius: 6px;
      text-align: center;
    }

    .stat-card h4 {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #6c757d;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 600;
      color: #1a1a1a;
    }

    .priority-breakdown {
      margin-top: 24px;
    }

    .priority-breakdown h4 {
      margin: 0 0 16px 0;
      color: #1a1a1a;
    }

    .priority-bars {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .priority-bar {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .priority-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100px;
      font-size: 14px;
    }

    .priority-name {
      font-weight: 600;
    }

    .priority-count {
      color: #6c757d;
    }

    .priority-progress {
      flex: 1;
      height: 8px;
      background: #e9ecef;
      border-radius: 4px;
      overflow: hidden;
    }

    .priority-fill {
      height: 100%;
      transition: width 0.3s ease;
    }

    .tasks-controls {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e9ecef;
    }

    .control-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .control-group label {
      font-size: 14px;
      font-weight: 500;
      color: #495057;
    }

    .control-group select {
      padding: 6px 12px;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      font-size: 14px;
    }

    .tasks-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .task-item {
      padding: 16px;
      background: #f8f9fa;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .task-item:hover {
      background: #e9ecef;
    }

    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .task-title {
      margin: 0;
      font-size: 16px;
      color: #1a1a1a;
    }

    .task-meta {
      display: flex;
      gap: 12px;
      align-items: center;
      font-size: 12px;
    }

    .task-priority {
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 3px;
      background: rgba(0, 0, 0, 0.1);
    }

    .task-hours {
      color: #6c757d;
    }

    .task-complexity {
      font-weight: 600;
    }

    .task-description {
      margin: 0;
      color: #6c757d;
      font-size: 14px;
      line-height: 1.4;
    }

    .dependencies-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .dependency-item {
      padding: 16px;
      background: #f8f9fa;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .dependency-item:hover {
      background: #e9ecef;
    }

    .dependency-type {
      font-size: 12px;
      color: #6c757d;
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .dependency-flow {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .dependency-from,
    .dependency-to {
      font-weight: 500;
      color: #1a1a1a;
    }

    .dependency-arrow {
      color: #007bff;
      font-weight: 600;
    }

    .recommendations-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .recommendation-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 6px;
    }

    .recommendation-icon {
      font-size: 20px;
      margin-top: 2px;
    }

    .recommendation-text {
      flex: 1;
      color: #1a1a1a;
      line-height: 1.5;
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: #6c757d;
    }

    .export-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .export-modal {
      background: white;
      border-radius: 8px;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #e9ecef;
    }

    .modal-header h4 {
      margin: 0;
      color: #1a1a1a;
    }

    .close-button {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #6c757d;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-button:hover {
      color: #495057;
    }

    .modal-content {
      padding: 20px;
    }

    .export-option {
      margin-bottom: 16px;
    }

    .export-option:last-child {
      margin-bottom: 0;
    }

    .export-option-button {
      width: 100%;
      padding: 12px 16px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin-bottom: 8px;
      transition: background-color 0.2s;
    }

    .export-option-button:hover {
      background: #0056b3;
    }

    .export-option p {
      margin: 0;
      color: #6c757d;
      font-size: 12px;
    }

    @media (max-width: 768px) {
      .results-header {
        flex-direction: column;
        gap: 12px;
        align-items: flex-start;
      }

      .stats-grid {
        grid-template-columns: 1fr 1fr;
      }

      .tasks-controls {
        flex-direction: column;
        gap: 8px;
      }

      .task-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .task-meta {
        align-self: stretch;
        justify-content: space-between;
      }
    }
  `;
}

export default PRDAnalysisResults;