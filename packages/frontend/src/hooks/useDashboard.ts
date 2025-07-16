import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import type { DashboardData, ProjectHealthData } from '../services/api';

export interface UseDashboardOptions {
  projectId: string;
  projectTag?: string;
  refreshInterval?: number;
  autoRefresh?: boolean;
  onError?: (error: Error) => void;
  onDataUpdate?: (data: DashboardData) => void;
}

export interface UseDashboardReturn {
  // Data state
  data: DashboardData | null;
  health: ProjectHealthData | null;
  loading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  
  // Actions
  refresh: () => Promise<void>;
  refreshHealth: () => Promise<void>;
  clearError: () => void;
  
  // Utilities
  isStale: boolean;
  retryCount: number;
}

/**
 * Custom hook for dashboard data management
 * 
 * Provides comprehensive dashboard data fetching, caching, and state management
 * with automatic refresh capabilities and error handling.
 */
export const useDashboard = (options: UseDashboardOptions): UseDashboardReturn => {
  const {
    projectId,
    projectTag,
    refreshInterval = 30000, // 30 seconds
    autoRefresh = true,
    onError,
    onDataUpdate
  } = options;

  const [data, setData] = useState<DashboardData | null>(null);
  const [health, setHealth] = useState<ProjectHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Calculate if data is stale
  const isStale = lastUpdated ? Date.now() - lastUpdated.getTime() > refreshInterval : true;

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const dashboardData = await apiService.getDashboardData(projectId, projectTag);
      
      setData(dashboardData);
      setLastUpdated(new Date());
      setRetryCount(0);
      
      onDataUpdate?.(dashboardData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch dashboard data');
      setError(error);
      setRetryCount(prev => prev + 1);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [projectId, projectTag, onDataUpdate, onError]);

  // Fetch health data
  const fetchHealthData = useCallback(async () => {
    try {
      const healthData = await apiService.getProjectHealth(projectId, projectTag);
      setHealth(healthData);
    } catch (err) {
      console.warn('Failed to fetch health data:', err);
      // Don't set error for health data failures
    }
  }, [projectId, projectTag]);

  // Refresh all data
  const refresh = useCallback(async () => {
    await Promise.allSettled([
      fetchDashboardData(),
      fetchHealthData()
    ]);
  }, [fetchDashboardData, fetchHealthData]);

  // Refresh only health data
  const refreshHealth = useCallback(async () => {
    await fetchHealthData();
  }, [fetchHealthData]);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
    setRetryCount(0);
  }, []);

  // Initial data fetch
  useEffect(() => {
    if (projectId) {
      refresh();
    }
  }, [projectId, projectTag, refresh]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh || !projectId) return;

    const interval = setInterval(() => {
      if (isStale) {
        refresh();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, projectId, refreshInterval, isStale, refresh]);

  // Retry logic for failed requests
  useEffect(() => {
    if (error && retryCount < 3) {
      const retryTimeout = setTimeout(() => {
        refresh();
      }, Math.min(1000 * Math.pow(2, retryCount), 10000)); // Exponential backoff, max 10s

      return () => clearTimeout(retryTimeout);
    }
  }, [error, retryCount, refresh]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setData(null);
      setHealth(null);
      setError(null);
      setLastUpdated(null);
    };
  }, []);

  return {
    // Data state
    data,
    health,
    loading,
    error,
    lastUpdated,
    
    // Actions
    refresh,
    refreshHealth,
    clearError,
    
    // Utilities
    isStale,
    retryCount
  };
};