import React, { useState, useCallback } from 'react';
import { TaskBoard } from './TaskBoard';
import type { TaskStatus, TaskFilters, TaskSortOptions } from '../../types/task';
import { useTaskData } from '../../hooks/useTaskData';
import './TaskBoardManager.css';

export interface TaskBoardManagerProps {
  /** Repository path to load tasks from */
  repositoryPath?: string;
  /** Project tag to filter tasks */
  projectTag?: string;
  /** Project ID to load tasks from */
  projectId?: string;
  /** File path to load tasks from */
  filePath?: string;
  /** Auto-refresh interval (in ms) */
  refreshInterval?: number;
  /** Additional CSS class name */
  className?: string;
  /** Whether to show development tools */
  showDevTools?: boolean;
  /** Whether to show filtering controls */
  showFilters?: boolean;
  /** Whether to show sorting controls */
  showSorting?: boolean;
  /** Callback when a task is clicked */
  onTaskClick?: (taskId: number) => void;
  /** Callback when a task is moved between columns */
  onTaskMove?: (taskId: number, fromStatus: TaskStatus, toStatus: TaskStatus) => void;
  /** Callback when create task is clicked */
  onCreateTask?: (status: TaskStatus) => void;
}

/**
 * TaskBoard Manager Component
 * 
 * Enhanced wrapper for TaskBoard with additional features like filtering,
 * sorting, and data source management.
 */
export const TaskBoardManager: React.FC<TaskBoardManagerProps> = ({
  repositoryPath,
  projectTag,
  projectId,
  filePath,
  refreshInterval = 30000,
  className = '',
  showDevTools = false,
  showFilters = false,
  showSorting = false,
  onTaskClick,
  onTaskMove,
  onCreateTask
}) => {
  const [filters, setFilters] = useState<TaskFilters>({});
  const [sortOptions, setSortOptions] = useState<TaskSortOptions>({
    field: 'createdAt',
    direction: 'desc'
  });

  const {
    taskBoardData,
    isLoading,
    error,
    refresh,
    loadFromRepository,
    loadFromFile,
    loadFromProject,
    loadSampleTasks,
    updateFilters,
    updateSortOptions,
    clear
  } = useTaskData({
    repositoryPath,
    projectTag,
    projectId,
    filePath,
    autoLoad: true,
    pollingInterval: refreshInterval,
    filters,
    sortOptions
  });

  const handleTaskClick = useCallback((taskId: number) => {
    if (onTaskClick) {
      onTaskClick(taskId);
    } else {
      console.log('Task clicked:', taskId);
    }
  }, [onTaskClick]);

  const handleTaskMove = useCallback((taskId: number, fromStatus: TaskStatus, toStatus: TaskStatus) => {
    if (onTaskMove) {
      onTaskMove(taskId, fromStatus, toStatus);
    } else {
      console.log('Task moved:', { taskId, fromStatus, toStatus });
    }
  }, [onTaskMove]);

  const handleCreateTask = useCallback((status: TaskStatus) => {
    if (onCreateTask) {
      onCreateTask(status);
    } else {
      console.log('Create task with status:', status);
    }
  }, [onCreateTask]);

  const handleRefresh = useCallback(async () => {
    await refresh();
  }, [refresh]);

  const handleFilterChange = useCallback((newFilters: TaskFilters) => {
    setFilters(newFilters);
    updateFilters(newFilters);
  }, [updateFilters]);

  const handleSortChange = useCallback((newSortOptions: TaskSortOptions) => {
    setSortOptions(newSortOptions);
    updateSortOptions(newSortOptions);
  }, [updateSortOptions]);

  const handleLoadFromRepository = useCallback(async () => {
    if (repositoryPath) {
      await loadFromRepository(repositoryPath, projectTag);
    }
  }, [loadFromRepository, repositoryPath, projectTag]);

  const handleLoadFromFile = useCallback(async () => {
    if (filePath) {
      await loadFromFile(filePath);
    }
  }, [loadFromFile, filePath]);

  const handleLoadFromProject = useCallback(async () => {
    if (projectId) {
      await loadFromProject(projectId);
    }
  }, [loadFromProject, projectId]);

  const handleClear = useCallback(() => {
    clear();
  }, [clear]);

  return (
    <div className={`task-board-manager ${className}`}>
      {/* Filters and Sorting Controls */}
      {(showFilters || showSorting) && (
        <div className="task-board-manager__controls">
          {showFilters && (
            <div className="filter-controls">
              <h3>Filters</h3>
              <div className="filter-group">
                <label>Status:</label>
                <select 
                  multiple
                  value={filters.status || []}
                  onChange={(e) => {
                    const selectedStatuses = Array.from(e.target.selectedOptions, option => option.value) as TaskStatus[];
                    handleFilterChange({ ...filters, status: selectedStatuses });
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                  <option value="blocked">Blocked</option>
                  <option value="deferred">Deferred</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Priority:</label>
                <select 
                  multiple
                  value={filters.priority || []}
                  onChange={(e) => {
                    const selectedPriorities = Array.from(e.target.selectedOptions, option => option.value) as ('low' | 'medium' | 'high' | 'urgent')[];
                    handleFilterChange({ ...filters, priority: selectedPriorities });
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Search:</label>
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
                />
              </div>
              
              <button 
                className="clear-filters-button"
                onClick={() => handleFilterChange({})}
              >
                Clear Filters
              </button>
            </div>
          )}
          
          {showSorting && (
            <div className="sorting-controls">
              <h3>Sort By</h3>
              <div className="sort-group">
                <label>Field:</label>
                <select 
                  value={sortOptions.field}
                  onChange={(e) => handleSortChange({ ...sortOptions, field: e.target.value as keyof TaskStatus })}
                >
                  <option value="createdAt">Created Date</option>
                  <option value="updatedAt">Updated Date</option>
                  <option value="title">Title</option>
                  <option value="priority">Priority</option>
                  <option value="status">Status</option>
                  <option value="complexity">Complexity</option>
                </select>
              </div>
              
              <div className="sort-group">
                <label>Direction:</label>
                <select 
                  value={sortOptions.direction}
                  onChange={(e) => handleSortChange({ ...sortOptions, direction: e.target.value as 'asc' | 'desc' })}
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Task Board */}
      <TaskBoard
        data={taskBoardData || undefined}
        isLoading={isLoading}
        error={error}
        onTaskClick={handleTaskClick}
        onTaskMove={handleTaskMove}
        onCreateTask={handleCreateTask}
        showCreateButton={true}
        className="task-board-manager__board"
      />

      {/* Development Tools */}
      {showDevTools && (
        <div className="task-board-manager__dev-tools">
          <h4>Development Tools</h4>
          <div className="dev-tools-grid">
            <button 
              onClick={handleRefresh}
              disabled={isLoading}
              className="dev-tool-button refresh"
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
            
            <button 
              onClick={() => loadSampleTasks()}
              disabled={isLoading}
              className="dev-tool-button sample"
            >
              Load Sample
            </button>
            
            {repositoryPath && (
              <button 
                onClick={handleLoadFromRepository}
                disabled={isLoading}
                className="dev-tool-button repository"
              >
                Load Repository
              </button>
            )}
            
            {filePath && (
              <button 
                onClick={handleLoadFromFile}
                disabled={isLoading}
                className="dev-tool-button file"
              >
                Load File
              </button>
            )}
            
            {projectId && (
              <button 
                onClick={handleLoadFromProject}
                disabled={isLoading}
                className="dev-tool-button project"
              >
                Load Project
              </button>
            )}
            
            <button 
              onClick={handleClear}
              disabled={isLoading}
              className="dev-tool-button clear"
            >
              Clear
            </button>
          </div>
          
          <div className="dev-tools-info">
            <p><strong>Active Filters:</strong> {Object.keys(filters).length}</p>
            <p><strong>Sort:</strong> {sortOptions.field} ({sortOptions.direction})</p>
            <p><strong>Tasks:</strong> {taskBoardData?.tasks.length || 0}</p>
            <p><strong>Data Source:</strong> {
              repositoryPath ? 'Repository' : 
              filePath ? 'File' : 
              projectId ? 'Project' : 
              'Sample'
            }</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskBoardManager;