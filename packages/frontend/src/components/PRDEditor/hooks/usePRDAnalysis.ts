import { useState, useCallback } from 'react';
import { apiService } from '../../../services/api';
import type { PRDAnalysisRequest, PRDAnalysisResult } from '../../../services/api';

export interface UsePRDAnalysisOptions {
  onAnalysisComplete?: (result: PRDAnalysisResult) => void;
  onAnalysisError?: (error: Error) => void;
  onAnalysisStart?: () => void;
}

export interface UsePRDAnalysisReturn {
  // State
  isAnalyzing: boolean;
  analysisResult: PRDAnalysisResult | null;
  analysisError: Error | null;
  analysisHistory: PRDAnalysisResult[];
  
  // Actions
  analyzePRD: (content: string, options?: Partial<PRDAnalysisRequest>) => Promise<PRDAnalysisResult | null>;
  clearAnalysis: () => void;
  clearError: () => void;
  getAnalysisHistory: (limit?: number) => Promise<void>;
  
  // Utilities
  hasAnalysis: boolean;
  hasError: boolean;
  canAnalyze: boolean;
}

/**
 * Custom hook for PRD analysis functionality
 * 
 * Provides methods to analyze PRD content using the backend API,
 * manage analysis state, and handle results.
 */
export const usePRDAnalysis = (options: UsePRDAnalysisOptions = {}): UsePRDAnalysisReturn => {
  const { onAnalysisComplete, onAnalysisError, onAnalysisStart } = options;
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PRDAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<Error | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<PRDAnalysisResult[]>([]);

  const analyzePRD = useCallback(async (
    content: string,
    options: Partial<PRDAnalysisRequest> = {}
  ): Promise<PRDAnalysisResult | null> => {
    if (!content.trim()) {
      const error = new Error('PRD content cannot be empty');
      setAnalysisError(error);
      onAnalysisError?.(error);
      return null;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    onAnalysisStart?.();

    try {
      const request: PRDAnalysisRequest = {
        content,
        analysisType: options.analysisType || 'detailed',
        options: {
          includeComplexity: options.options?.includeComplexity ?? true,
          includeEstimation: options.options?.includeEstimation ?? true,
          includeDependencies: options.options?.includeDependencies ?? true,
          ...options.options,
        },
      };

      const result = await apiService.analyzePRD(request);
      
      setAnalysisResult(result);
      onAnalysisComplete?.(result);
      
      return result;
    } catch (error) {
      const analysisError = error instanceof Error ? error : new Error('Analysis failed');
      setAnalysisError(analysisError);
      onAnalysisError?.(analysisError);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [onAnalysisComplete, onAnalysisError, onAnalysisStart]);

  const clearAnalysis = useCallback(() => {
    setAnalysisResult(null);
    setAnalysisError(null);
  }, []);

  const clearError = useCallback(() => {
    setAnalysisError(null);
  }, []);

  const getAnalysisHistory = useCallback(async (limit?: number) => {
    try {
      const response = await apiService.getPRDAnalysisHistory(limit);
      setAnalysisHistory(response.analyses);
    } catch (error) {
      console.error('Failed to fetch analysis history:', error);
    }
  }, []);

  return {
    // State
    isAnalyzing,
    analysisResult,
    analysisError,
    analysisHistory,
    
    // Actions
    analyzePRD,
    clearAnalysis,
    clearError,
    getAnalysisHistory,
    
    // Utilities
    hasAnalysis: analysisResult !== null,
    hasError: analysisError !== null,
    canAnalyze: !isAnalyzing,
  };
};