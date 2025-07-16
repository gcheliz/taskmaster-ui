import { useState, useCallback } from 'react';
import type { PRDAnalysisResult } from '../../../services/api';

export interface UsePRDAnalysisResultsOptions {
  /** Default view mode */
  defaultView?: 'summary' | 'tasks' | 'dependencies' | 'recommendations';
  /** Whether to enable task selection */
  enableTaskSelection?: boolean;
  /** Whether to enable dependency selection */
  enableDependencySelection?: boolean;
  /** Callback when task is selected */
  onTaskSelect?: (taskIndex: number, task: any) => void;
  /** Callback when dependency is selected */
  onDependencySelect?: (dependency: any) => void;
}

export interface UsePRDAnalysisResultsReturn {
  // Current view state
  currentView: 'summary' | 'tasks' | 'dependencies' | 'recommendations';
  setCurrentView: (view: 'summary' | 'tasks' | 'dependencies' | 'recommendations') => void;
  
  // Task management
  selectedTaskIndex: number | null;
  selectTask: (index: number) => void;
  clearTaskSelection: () => void;
  
  // Dependency management
  selectedDependency: any | null;
  selectDependency: (dependency: any) => void;
  clearDependencySelection: () => void;
  
  // Data processing
  getTasksSummary: (result: PRDAnalysisResult) => TasksSummary;
  getFilteredTasks: (result: PRDAnalysisResult, filters: TaskFilters) => any[];
  getDependenciesSummary: (result: PRDAnalysisResult) => DependenciesSummary;
  
  // Export functionality
  exportToJSON: (result: PRDAnalysisResult) => void;
  exportTasksToCSV: (result: PRDAnalysisResult) => void;
  exportDependenciesToCSV: (result: PRDAnalysisResult) => void;
  
  // Utilities
  formatDuration: (ms: number) => string;
  formatComplexity: (score: number) => string;
  getPriorityColor: (priority: string) => string;
  getComplexityColor: (complexity: number) => string;
}

export interface TasksSummary {
  total: number;
  totalHours: number;
  averageComplexity: number;
  priorityBreakdown: Record<string, number>;
  complexityDistribution: Record<string, number>;
}

export interface DependenciesSummary {
  total: number;
  byType: Record<string, number>;
  cycleDetected: boolean;
  criticalPath: string[];
}

export interface TaskFilters {
  priority?: 'all' | 'high' | 'medium' | 'low';
  complexity?: 'all' | 'low' | 'medium' | 'high';
  sortBy?: 'priority' | 'complexity' | 'hours' | 'title';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Custom hook for managing PRD analysis results display and interaction
 * 
 * Provides comprehensive functionality for displaying, filtering, and
 * interacting with PRD analysis results.
 */
export const usePRDAnalysisResults = (
  options: UsePRDAnalysisResultsOptions = {}
): UsePRDAnalysisResultsReturn => {
  const {
    defaultView = 'summary',
    enableTaskSelection = true,
    enableDependencySelection = true,
    onTaskSelect,
    onDependencySelect
  } = options;

  const [currentView, setCurrentView] = useState<'summary' | 'tasks' | 'dependencies' | 'recommendations'>(defaultView);
  const [selectedTaskIndex, setSelectedTaskIndex] = useState<number | null>(null);
  const [selectedDependency, setSelectedDependency] = useState<any | null>(null);

  // Task selection
  const selectTask = useCallback((index: number) => {
    if (!enableTaskSelection) return;
    
    setSelectedTaskIndex(index);
    onTaskSelect?.(index, null); // Task will be provided by the component
  }, [enableTaskSelection, onTaskSelect]);

  const clearTaskSelection = useCallback(() => {
    setSelectedTaskIndex(null);
  }, []);

  // Dependency selection
  const selectDependency = useCallback((dependency: any) => {
    if (!enableDependencySelection) return;
    
    setSelectedDependency(dependency);
    onDependencySelect?.(dependency);
  }, [enableDependencySelection, onDependencySelect]);

  const clearDependencySelection = useCallback(() => {
    setSelectedDependency(null);
  }, []);

  // Data processing functions
  const getTasksSummary = useCallback((result: PRDAnalysisResult): TasksSummary => {
    const tasks = result.analysis.extractedTasks;
    const total = tasks.length;
    const totalHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0);
    const averageComplexity = total > 0 
      ? tasks.reduce((sum, task) => sum + task.complexity, 0) / total 
      : 0;

    const priorityBreakdown = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const complexityDistribution = tasks.reduce((acc, task) => {
      const level = task.complexity >= 8 ? 'high' : task.complexity >= 5 ? 'medium' : 'low';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      totalHours,
      averageComplexity,
      priorityBreakdown,
      complexityDistribution
    };
  }, []);

  const getFilteredTasks = useCallback((result: PRDAnalysisResult, filters: TaskFilters) => {
    let tasks = [...result.analysis.extractedTasks];

    // Apply filters
    if (filters.priority && filters.priority !== 'all') {
      tasks = tasks.filter(task => task.priority === filters.priority);
    }

    if (filters.complexity && filters.complexity !== 'all') {
      tasks = tasks.filter(task => {
        const level = task.complexity >= 8 ? 'high' : task.complexity >= 5 ? 'medium' : 'low';
        return level === filters.complexity;
      });
    }

    // Apply sorting
    if (filters.sortBy) {
      tasks.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (filters.sortBy) {
          case 'priority':
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            aValue = priorityOrder[a.priority as keyof typeof priorityOrder];
            bValue = priorityOrder[b.priority as keyof typeof priorityOrder];
            break;
          case 'complexity':
            aValue = a.complexity;
            bValue = b.complexity;
            break;
          case 'hours':
            aValue = a.estimatedHours;
            bValue = b.estimatedHours;
            break;
          case 'title':
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          default:
            return 0;
        }

        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return filters.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    return tasks;
  }, []);

  const getDependenciesSummary = useCallback((result: PRDAnalysisResult): DependenciesSummary => {
    const deps = result.analysis.dependencies;
    const total = deps.length;
    
    const byType = deps.reduce((acc, dep) => {
      acc[dep.type] = (acc[dep.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Simple cycle detection (could be enhanced)
    const cycleDetected = false; // TODO: Implement cycle detection algorithm
    const criticalPath: string[] = []; // TODO: Implement critical path analysis

    return {
      total,
      byType,
      cycleDetected,
      criticalPath
    };
  }, []);

  // Export functions
  const exportToJSON = useCallback((result: PRDAnalysisResult) => {
    const dataStr = JSON.stringify(result, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `prd-analysis-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, []);

  const exportTasksToCSV = useCallback((result: PRDAnalysisResult) => {
    const headers = ['Title', 'Description', 'Priority', 'Complexity', 'Estimated Hours'];
    const csvContent = [
      headers.join(','),
      ...result.analysis.extractedTasks.map(task => [
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
  }, []);

  const exportDependenciesToCSV = useCallback((result: PRDAnalysisResult) => {
    const headers = ['From', 'To', 'Type'];
    const csvContent = [
      headers.join(','),
      ...result.analysis.dependencies.map(dep => [
        `"${dep.from.replace(/"/g, '""')}"`,
        `"${dep.to.replace(/"/g, '""')}"`,
        dep.type
      ].join(','))
    ].join('\n');
    
    const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    const exportFileDefaultName = `prd-analysis-dependencies-${new Date().toISOString().split('T')[0]}.csv`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, []);

  // Utility functions
  const formatDuration = useCallback((ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  }, []);

  const formatComplexity = useCallback((score: number): string => {
    if (score >= 80) return 'Very High';
    if (score >= 60) return 'High';
    if (score >= 40) return 'Medium';
    if (score >= 20) return 'Low';
    return 'Very Low';
  }, []);

  const getPriorityColor = useCallback((priority: string): string => {
    switch (priority.toLowerCase()) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  }, []);

  const getComplexityColor = useCallback((complexity: number): string => {
    if (complexity >= 8) return '#dc3545';
    if (complexity >= 5) return '#ffc107';
    return '#28a745';
  }, []);

  return {
    // Current view state
    currentView,
    setCurrentView,
    
    // Task management
    selectedTaskIndex,
    selectTask,
    clearTaskSelection,
    
    // Dependency management
    selectedDependency,
    selectDependency,
    clearDependencySelection,
    
    // Data processing
    getTasksSummary,
    getFilteredTasks,
    getDependenciesSummary,
    
    // Export functionality
    exportToJSON,
    exportTasksToCSV,
    exportDependenciesToCSV,
    
    // Utilities
    formatDuration,
    formatComplexity,
    getPriorityColor,
    getComplexityColor
  };
};