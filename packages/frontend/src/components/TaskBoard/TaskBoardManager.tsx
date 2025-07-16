import React, { useState, useCallback, useEffect } from 'react';
import { TaskBoard } from './TaskBoard';
import { TaskModal, type TaskModalMode } from './TaskModal';
import type { Task, TaskStatus, TaskFilters, TaskSortOptions, TaskBoardData } from '../../types/task';
import { useRealtimeTaskData } from '../../hooks/useRealtimeTaskData';
import { useTaskUpdates } from '../../hooks/useTaskUpdates';
import { useNotification } from '../../contexts/NotificationContext';
import { taskService } from '../../services/taskService';
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
  /** Whether to enable real-time WebSocket updates */
  enableRealtime?: boolean;
  /** Whether to show notifications for real-time updates */
  showRealtimeNotifications?: boolean;
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
 * sorting, data source management, and real-time WebSocket updates.
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
  enableRealtime = true,
  showRealtimeNotifications = true,
  onTaskClick,
  onTaskMove,
  onCreateTask
}) => {
  const [filters, setFilters] = useState<TaskFilters>({});
  const [sortOptions, setSortOptions] = useState<TaskSortOptions>({
    field: 'createdAt',
    direction: 'desc'
  });
  const [localTaskBoardData, setLocalTaskBoardData] = useState<TaskBoardData | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<TaskModalMode>('create');
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);

  const { showSuccess, showError } = useNotification();

  const {
    taskBoardData,
    isLoading,
    error,
    isRealtimeActive,
    connectionState,
    lastUpdateTime,
    updateCount,
    refresh,
    loadFromRepository,
    loadFromFile,
    loadFromProject,
    loadSampleTasks,
    updateFilters,
    updateSortOptions,
    clear,
    requestRealtimeRefresh,
    toggleRealtime
  } = useRealtimeTaskData({
    repositoryPath,
    projectTag,
    projectId,
    filePath,
    autoLoad: true,
    pollingInterval: refreshInterval,
    filters,
    sortOptions,
    enableRealtime,
    showUpdateNotifications: showRealtimeNotifications
  });

  const {
    isUpdating,
    updateError,
    updateTaskStatus,
    clearUpdateError
  } = useTaskUpdates({
    projectId,
    onUpdateSuccess: (task) => {
      showSuccess(`Task "${task.title}" updated successfully`);
      // Refresh data to sync with server
      refresh();
    },
    onUpdateError: (error) => {
      showError(`Failed to update task: ${error}`);
    },
    optimisticUpdates: true
  });

  // Sync local data with remote data
  useEffect(() => {
    if (taskBoardData) {
      setLocalTaskBoardData(taskBoardData);
      // Clear any previous update errors when new data is loaded
      if (updateError) {
        clearUpdateError();
      }
    }
  }, [taskBoardData, updateError, clearUpdateError]);

  // Display current data (local if available, otherwise remote)
  const currentTaskBoardData = localTaskBoardData || taskBoardData;

  const handleTaskClick = useCallback((taskId: number) => {
    if (onTaskClick) {
      onTaskClick(taskId);
    } else {
      // Open task modal in view mode
      const task = currentTaskBoardData?.tasks.find(t => t.id === taskId);
      if (task) {
        setSelectedTask(task);
        setModalMode('view');
        setIsModalOpen(true);
      }
    }
  }, [onTaskClick, currentTaskBoardData]);

  const handleTaskMove = useCallback(async (taskId: number, fromStatus: TaskStatus, toStatus: TaskStatus) => {
    if (onTaskMove) {
      onTaskMove(taskId, fromStatus, toStatus);
      return;
    }

    if (!currentTaskBoardData) {
      console.error('No task board data available for task move');
      return;
    }

    console.log('Task moved:', { taskId, fromStatus, toStatus });
    
    try {
      // Update task status with optimistic update
      const updatedBoardData = await updateTaskStatus(taskId, toStatus, currentTaskBoardData);
      
      if (updatedBoardData) {
        setLocalTaskBoardData(updatedBoardData);
      }
    } catch (error) {
      console.error('Failed to move task:', error);
    }
  }, [onTaskMove, currentTaskBoardData, updateTaskStatus]);

  const handleCreateTask = useCallback((status: TaskStatus) => {
    if (onCreateTask) {
      onCreateTask(status);
    } else {
      // Open task modal in create mode
      setSelectedTask(undefined);
      setModalMode('create');
      setIsModalOpen(true);
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

  // Modal handlers
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedTask(undefined);
    setModalMode('create');
  }, []);

  const handleSaveTask = useCallback(async (taskData: Partial<Task>) => {
    try {
      if (modalMode === 'create') {
        // Create new task
        const newTask = await taskService.createTask(taskData, projectId);
        showSuccess(`Task "${newTask.title}" created successfully`);
        
        // Refresh data to sync with server
        await refresh();
      } else if (modalMode === 'edit' && selectedTask) {
        // Update existing task
        const updatedTask = await taskService.updateTask(selectedTask.id, taskData, projectId);
        showSuccess(`Task "${updatedTask.title}" updated successfully`);
        
        // Refresh data to sync with server
        await refresh();
      }
      
      handleCloseModal();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save task';
      showError(errorMessage);
      throw error; // Re-throw to let the modal handle the error state
    }
  }, [modalMode, selectedTask, projectId, refresh, showSuccess, showError, handleCloseModal]);

  const handleDeleteTask = useCallback(async (taskId: number) => {
    try {
      await taskService.deleteTask(taskId, projectId);
      showSuccess('Task deleted successfully');
      
      // Refresh data to sync with server
      await refresh();
      handleCloseModal();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete task';
      showError(errorMessage);
      throw error; // Re-throw to let the modal handle the error state
    }
  }, [projectId, refresh, showSuccess, showError, handleCloseModal]);

  const handleEditTask = useCallback(() => {
    // Switch from view mode to edit mode
    setModalMode('edit');
  }, []);

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
                  onChange={(e) => handleSortChange({ ...sortOptions, field: e.target.value as keyof Task })}
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
        data={currentTaskBoardData || undefined}
        isLoading={isLoading || isUpdating}
        error={error || updateError}
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
            
            <button 
              onClick={toggleRealtime}
              disabled={isLoading}
              className={`dev-tool-button realtime ${isRealtimeActive ? 'active' : ''}`}
            >
              {isRealtimeActive ? 'Disable' : 'Enable'} Real-time
            </button>
            
            <button 
              onClick={requestRealtimeRefresh}
              disabled={isLoading || !isRealtimeActive}
              className="dev-tool-button realtime-refresh"
            >
              Request RT Refresh
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
            <p><strong>Real-time:</strong> {isRealtimeActive ? 'Active' : 'Inactive'}</p>
            <p><strong>WebSocket:</strong> {connectionState}</p>
            <p><strong>Updates:</strong> {updateCount}</p>
            <p><strong>Task Updates:</strong> {isUpdating ? 'In Progress' : 'Ready'}</p>
            {lastUpdateTime && (
              <p><strong>Last Update:</strong> {new Date(lastUpdateTime).toLocaleTimeString()}</p>
            )}
            {updateError && (
              <div className="dev-tools-error">
                <p><strong>Update Error:</strong> {updateError}</p>
                <button 
                  onClick={clearUpdateError}
                  className="dev-tool-button clear-error"
                >
                  Clear Error
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        mode={modalMode}
        task={selectedTask}
        availableTasks={currentTaskBoardData?.tasks || []}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
        onDelete={modalMode === 'edit' ? handleDeleteTask : undefined}
        onEdit={modalMode === 'view' ? handleEditTask : undefined}
      />
    </div>
  );
};

export default TaskBoardManager;