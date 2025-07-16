import React, { useState, useCallback } from 'react';
import { PRDAnalysisButton } from './PRDAnalysisButton';
import { PRDAnalysisResults } from './PRDAnalysisResults';
import { usePRDAnalysisResults } from './hooks/usePRDAnalysisResults';
import type { PRDAnalysisResult } from '../../services/api';

export interface PRDAnalysisPanelProps {
  /** PRD content to analyze */
  content: string;
  /** Whether the panel is visible */
  isVisible?: boolean;
  /** Whether to show in compact mode */
  compact?: boolean;
  /** Additional CSS class name */
  className?: string;
  /** Callback when analysis completes */
  onAnalysisComplete?: (result: PRDAnalysisResult) => void;
  /** Callback when task is selected */
  onTaskSelect?: (taskIndex: number, task: any) => void;
  /** Callback when dependency is selected */
  onDependencySelect?: (dependency: any) => void;
  /** Callback when panel visibility changes */
  onVisibilityChange?: (isVisible: boolean) => void;
}

/**
 * PRD Analysis Panel Component
 * 
 * A comprehensive panel that combines analysis trigger and results display.
 * Provides a complete interface for PRD analysis with state management.
 */
export const PRDAnalysisPanel: React.FC<PRDAnalysisPanelProps> = ({
  content,
  isVisible = true,
  compact = false,
  className = '',
  onAnalysisComplete,
  onTaskSelect,
  onDependencySelect,
  onVisibilityChange,
}) => {
  const [analysisResult, setAnalysisResult] = useState<PRDAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<Error | null>(null);

  const analysisResultsHandler = usePRDAnalysisResults({
    onTaskSelect: (taskIndex) => {
      if (analysisResult) {
        const actualTask = analysisResult.analysis.extractedTasks[taskIndex];
        onTaskSelect?.(taskIndex, actualTask);
      }
    },
    onDependencySelect,
  });

  const handleAnalysisStart = useCallback(() => {
    setIsAnalyzing(true);
    setAnalysisError(null);
  }, []);

  const handleAnalysisComplete = useCallback((result: PRDAnalysisResult) => {
    setAnalysisResult(result);
    setIsAnalyzing(false);
    setAnalysisError(null);
    onAnalysisComplete?.(result);
  }, [onAnalysisComplete]);

  const handleAnalysisError = useCallback((error: Error) => {
    setAnalysisError(error);
    setIsAnalyzing(false);
    setAnalysisResult(null);
  }, []);

  const handleClearResults = useCallback(() => {
    setAnalysisResult(null);
    setAnalysisError(null);
    analysisResultsHandler.clearTaskSelection();
    analysisResultsHandler.clearDependencySelection();
  }, [analysisResultsHandler]);

  const handleToggleVisibility = useCallback(() => {
    const newVisibility = !isVisible;
    onVisibilityChange?.(newVisibility);
  }, [isVisible, onVisibilityChange]);

  if (!isVisible) {
    return (
      <div className={`prd-analysis-panel collapsed ${className}`}>
        <button
          type="button"
          onClick={handleToggleVisibility}
          className="panel-toggle"
          title="Show Analysis Panel"
        >
          🔍 Analysis
        </button>
        <style>{getCollapsedStyles()}</style>
      </div>
    );
  }

  return (
    <div className={`prd-analysis-panel ${compact ? 'compact' : ''} ${className}`}>
      {/* Panel Header */}
      <div className="panel-header">
        <div className="header-content">
          <h3>PRD Analysis</h3>
          <div className="header-actions">
            {analysisResult && (
              <button
                type="button"
                onClick={handleClearResults}
                className="clear-button"
                title="Clear Results"
              >
                🗑️
              </button>
            )}
            <button
              type="button"
              onClick={handleToggleVisibility}
              className="collapse-button"
              title="Hide Analysis Panel"
            >
              −
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Controls */}
      <div className="analysis-controls">
        <PRDAnalysisButton
          content={content}
          onAnalysisStart={handleAnalysisStart}
          onAnalysisComplete={handleAnalysisComplete}
          onAnalysisError={handleAnalysisError}
          disabled={isAnalyzing}
        />
        
        {/* Status Indicators */}
        <div className="status-indicators">
          {isAnalyzing && (
            <div className="status-item analyzing">
              <div className="spinner"></div>
              <span>Analyzing...</span>
            </div>
          )}
          {analysisError && (
            <div className="status-item error">
              <span>❌ {analysisError.message}</span>
            </div>
          )}
          {analysisResult && (
            <div className="status-item success">
              <span>✅ Analysis complete</span>
            </div>
          )}
        </div>
      </div>

      {/* Results Display */}
      {analysisResult && (
        <div className="results-container">
          <PRDAnalysisResults
            result={analysisResult}
            compact={compact}
            onTaskSelect={analysisResultsHandler.selectTask}
            onDependencySelect={analysisResultsHandler.selectDependency}
            showExportOptions={!compact}
          />
        </div>
      )}

      {/* Empty State */}
      {!analysisResult && !isAnalyzing && !analysisError && (
        <div className="empty-state">
          <div className="empty-content">
            <div className="empty-icon">🔍</div>
            <h4>Ready to Analyze</h4>
            <p>Click the analyze button to extract tasks and complexity from your PRD.</p>
            <div className="empty-features">
              <div className="feature-item">
                <span className="feature-icon">📋</span>
                <span>Extract tasks</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <span>Estimate complexity</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔗</span>
                <span>Find dependencies</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">💡</span>
                <span>Get recommendations</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{getMainStyles()}</style>
    </div>
  );
};

function getCollapsedStyles() {
  return `
    .prd-analysis-panel.collapsed {
      display: inline-block;
    }

    .panel-toggle {
      padding: 8px 12px;
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      color: #6c757d;
      transition: all 0.2s;
    }

    .panel-toggle:hover {
      background: #e9ecef;
      color: #495057;
    }
  `;
}

function getMainStyles() {
  return `
    .prd-analysis-panel {
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .prd-analysis-panel.compact {
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .panel-header {
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
      padding: 12px 16px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-content h3 {
      margin: 0;
      color: #1a1a1a;
      font-size: 16px;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }

    .clear-button,
    .collapse-button {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      color: #6c757d;
      font-size: 14px;
      transition: all 0.2s;
    }

    .clear-button:hover,
    .collapse-button:hover {
      background: #e9ecef;
      color: #495057;
    }

    .analysis-controls {
      padding: 16px;
      border-bottom: 1px solid #e9ecef;
    }

    .status-indicators {
      margin-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .status-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 14px;
    }

    .status-item.analyzing {
      background: #e7f3ff;
      color: #0066cc;
    }

    .status-item.error {
      background: #f8d7da;
      color: #721c24;
    }

    .status-item.success {
      background: #d4edda;
      color: #155724;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(0, 102, 204, 0.3);
      border-top: 2px solid #0066cc;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .results-container {
      max-height: 600px;
      overflow-y: auto;
    }

    .empty-state {
      padding: 40px 20px;
      text-align: center;
      color: #6c757d;
    }

    .empty-content {
      max-width: 300px;
      margin: 0 auto;
    }

    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .empty-content h4 {
      margin: 0 0 8px 0;
      color: #1a1a1a;
      font-size: 18px;
    }

    .empty-content p {
      margin: 0 0 24px 0;
      line-height: 1.5;
    }

    .empty-features {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 24px;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      background: #f8f9fa;
      border-radius: 4px;
      font-size: 14px;
      color: #495057;
    }

    .feature-icon {
      font-size: 16px;
    }

    .prd-analysis-panel.compact .panel-header {
      padding: 8px 12px;
    }

    .prd-analysis-panel.compact .header-content h3 {
      font-size: 14px;
    }

    .prd-analysis-panel.compact .analysis-controls {
      padding: 12px;
    }

    .prd-analysis-panel.compact .empty-state {
      padding: 24px 16px;
    }

    .prd-analysis-panel.compact .empty-icon {
      font-size: 32px;
      margin-bottom: 12px;
    }

    .prd-analysis-panel.compact .empty-content h4 {
      font-size: 16px;
    }

    .prd-analysis-panel.compact .empty-features {
      grid-template-columns: 1fr;
      gap: 8px;
      margin-top: 16px;
    }

    .prd-analysis-panel.compact .feature-item {
      padding: 6px 8px;
      font-size: 12px;
    }

    @media (max-width: 768px) {
      .panel-header {
        padding: 8px 12px;
      }

      .header-content h3 {
        font-size: 14px;
      }

      .analysis-controls {
        padding: 12px;
      }

      .empty-state {
        padding: 24px 16px;
      }

      .empty-features {
        grid-template-columns: 1fr;
      }
    }
  `;
}

export default PRDAnalysisPanel;