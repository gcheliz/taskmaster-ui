import React, { useState } from 'react';
import { usePRDAnalysis } from './hooks/usePRDAnalysis';
import type { PRDAnalysisRequest, PRDAnalysisResult } from '../../services/api';

export interface PRDAnalysisButtonProps {
  /** PRD content to analyze */
  content: string;
  /** Whether the button should be disabled */
  disabled?: boolean;
  /** Additional CSS class name */
  className?: string;
  /** Analysis completion callback */
  onAnalysisComplete?: (result: PRDAnalysisResult) => void;
  /** Analysis error callback */
  onAnalysisError?: (error: Error) => void;
  /** Analysis start callback */
  onAnalysisStart?: () => void;
}

/**
 * PRD Analysis Button Component
 * 
 * Provides a button to trigger PRD analysis with loading states
 * and error handling. Integrates with the usePRDAnalysis hook.
 */
export const PRDAnalysisButton: React.FC<PRDAnalysisButtonProps> = ({
  content,
  disabled = false,
  className = '',
  onAnalysisComplete,
  onAnalysisError,
  onAnalysisStart,
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [analysisOptions, setAnalysisOptions] = useState<Partial<PRDAnalysisRequest>>({
    analysisType: 'detailed',
    options: {
      includeComplexity: true,
      includeEstimation: true,
      includeDependencies: true,
    },
  });

  const {
    isAnalyzing,
    analysisError,
    analyzePRD,
    clearError,
    canAnalyze,
  } = usePRDAnalysis({
    onAnalysisComplete,
    onAnalysisError,
    onAnalysisStart,
  });

  const handleAnalyze = async () => {
    if (!content.trim()) {
      return;
    }

    await analyzePRD(content, analysisOptions);
    setShowOptions(false);
  };

  const handleOptionsChange = (key: keyof PRDAnalysisRequest, value: any) => {
    setAnalysisOptions(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleOptionToggle = (optionKey: string, value: boolean) => {
    setAnalysisOptions(prev => ({
      ...prev,
      options: {
        ...prev.options,
        [optionKey]: value,
      },
    }));
  };

  const isEmpty = !content.trim();
  const isDisabled = disabled || isEmpty || !canAnalyze;

  return (
    <div className={`prd-analysis-button ${className}`}>
      <div className="analysis-controls">
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={isDisabled}
          className={`analyze-button ${isAnalyzing ? 'analyzing' : ''} ${isDisabled ? 'disabled' : ''}`}
          title={isEmpty ? 'Add content to analyze' : 'Analyze PRD for tasks and complexity'}
        >
          {isAnalyzing ? (
            <>
              <div className="spinner"></div>
              Analyzing...
            </>
          ) : (
            <>
              🔍 Analyze PRD
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => setShowOptions(!showOptions)}
          className="options-toggle"
          disabled={isAnalyzing}
          title="Analysis options"
        >
          ⚙️
        </button>
      </div>

      {/* Analysis Options Panel */}
      {showOptions && (
        <div className="analysis-options">
          <div className="options-header">
            <h4>Analysis Options</h4>
            <button
              type="button"
              onClick={() => setShowOptions(false)}
              className="close-button"
            >
              ×
            </button>
          </div>

          <div className="options-content">
            <div className="option-group">
              <label>Analysis Type:</label>
              <select
                value={analysisOptions.analysisType || 'detailed'}
                onChange={(e) => handleOptionsChange('analysisType', e.target.value)}
              >
                <option value="basic">Basic Analysis</option>
                <option value="detailed">Detailed Analysis</option>
              </select>
            </div>

            <div className="option-group">
              <label>Include Features:</label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={analysisOptions.options?.includeComplexity ?? true}
                    onChange={(e) => handleOptionToggle('includeComplexity', e.target.checked)}
                  />
                  Complexity Analysis
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={analysisOptions.options?.includeEstimation ?? true}
                    onChange={(e) => handleOptionToggle('includeEstimation', e.target.checked)}
                  />
                  Time Estimation
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={analysisOptions.options?.includeDependencies ?? true}
                    onChange={(e) => handleOptionToggle('includeDependencies', e.target.checked)}
                  />
                  Dependency Detection
                </label>
              </div>
            </div>

            <div className="options-actions">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isDisabled}
                className="analyze-with-options"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze with Options'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {analysisError && (
        <div className="analysis-error">
          <span className="error-message">
            {analysisError.message}
          </span>
          <button
            type="button"
            onClick={clearError}
            className="clear-error"
          >
            ×
          </button>
        </div>
      )}

      <style>{`
        .prd-analysis-button {
          position: relative;
          display: inline-block;
        }

        .analysis-controls {
          display: flex;
          gap: 4px;
          align-items: center;
        }

        .analyze-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .analyze-button:hover:not(:disabled) {
          background: #0056b3;
        }

        .analyze-button:disabled {
          background: #6c757d;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .analyze-button.analyzing {
          background: #17a2b8;
        }

        .options-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          padding: 4px;
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .options-toggle:hover:not(:disabled) {
          background: #e9ecef;
          border-color: #adb5bd;
        }

        .options-toggle:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .spinner {
          width: 12px;
          height: 12px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .analysis-options {
          position: absolute;
          top: 100%;
          left: 0;
          width: 320px;
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          margin-top: 4px;
        }

        .options-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #e9ecef;
        }

        .options-header h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 16px;
          cursor: pointer;
          color: #6c757d;
          padding: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-button:hover {
          color: #495057;
        }

        .options-content {
          padding: 16px;
        }

        .option-group {
          margin-bottom: 16px;
        }

        .option-group:last-child {
          margin-bottom: 0;
        }

        .option-group > label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #495057;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .option-group select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          font-size: 14px;
          background: white;
        }

        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #495057;
          cursor: pointer;
          text-transform: none;
          letter-spacing: normal;
          margin-bottom: 0;
        }

        .checkbox-label input[type="checkbox"] {
          margin: 0;
        }

        .options-actions {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #e9ecef;
        }

        .analyze-with-options {
          width: 100%;
          padding: 10px 16px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .analyze-with-options:hover:not(:disabled) {
          background: #218838;
        }

        .analyze-with-options:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        .analysis-error {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 8px;
          padding: 8px 12px;
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
          border-radius: 4px;
          font-size: 12px;
        }

        .error-message {
          flex: 1;
        }

        .clear-error {
          background: none;
          border: none;
          color: #721c24;
          cursor: pointer;
          font-size: 14px;
          padding: 0;
          margin-left: 8px;
        }

        .clear-error:hover {
          color: #491217;
        }
      `}</style>
    </div>
  );
};

export default PRDAnalysisButton;