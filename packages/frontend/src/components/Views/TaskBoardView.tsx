import React, { useState } from 'react';
import { TaskBoard } from '../TaskBoard';
import { TaskBoardWithFilters } from '../TaskBoard/TaskBoardWithFilters';
import { KanbanBoard } from '../ui/organisms/KanbanBoard';
import type { TaskStatus } from '../../types/task';
import { useTaskData } from '../../hooks/useTaskData';
import './TaskBoardView.css';

export interface TaskBoardViewProps {
  className?: string;
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
  /** Enable filtering and sorting features */
  enableFiltering?: boolean;
  /** Use new Kanban board layout */
  useKanbanLayout?: boolean;
}

export const TaskBoardView: React.FC<TaskBoardViewProps> = ({
  className = '',
  repositoryPath,
  projectTag,
  projectId,
  filePath,
  refreshInterval = 30000, // 30 seconds default
  enableFiltering = true,
  useKanbanLayout = true,
}) => {
  const [showFilters, setShowFilters] = useState(enableFiltering);
  const [, setFilteredTasks] = useState<unknown[]>([]);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [, setFilterError] = useState<Error | null>(null);
  const { taskBoardData, isLoading, error, refresh, loadSampleTasks } =
    useTaskData({
      repositoryPath,
      projectTag,
      projectId,
      filePath,
      autoLoad: true,
      pollingInterval: refreshInterval,
    });

  const handleTaskClick = (taskId: number) => {
    // TODO: Implement task details modal
    console.log('Task clicked:', taskId);
  };

  const handleTaskMove = (
    taskId: number,
    fromStatus: TaskStatus,
    toStatus: TaskStatus
  ) => {
    // TODO: Implement task status update API call
    console.log('Task moved:', { taskId, fromStatus, toStatus });
    // This would typically call an API to update the task status
    // For now, we'll just log the move action
  };

  const handleCreateTask = (status: TaskStatus) => {
    // TODO: Implement task creation modal
    console.log('Create task with status:', status);
  };

  const handleRefresh = async () => {
    await refresh();
  };

  return (
    <div className={`task-board-view ${className}`.trim()}>
      <div className="view-content">
        {/* Toggle between filtered and original view */}
        {enableFiltering && (
          <div className="view-toggle">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`toggle-button ${showFilters ? 'active' : ''}`}
            >
              {showFilters ? '📋 Board View' : '🔍 Filtered View'}
            </button>
          </div>
        )}

        {showFilters && repositoryPath ? (
          /* Filtered Task Board with search and sorting */
          <TaskBoardWithFilters
            repositoryPath={repositoryPath}
            onTasksChange={setFilteredTasks}
            onLoadingChange={setIsFilterLoading}
            onErrorChange={setFilterError}
            className="filtered-task-board"
          />
        ) : useKanbanLayout ? (
          /* New Kanban Board Layout */
          <KanbanBoard
            tasks={taskBoardData?.tasks || []}
            loading={isLoading}
            error={error || undefined}
            onTaskClick={handleTaskClick}
            onAddTask={handleCreateTask}
            onTaskMove={handleTaskMove}
            onRefresh={handleRefresh}
            showSearch={true}
            showFilters={true}
            className="kanban-board-view"
          />
        ) : (
          /* Original Task Board */
          <TaskBoard
            data={taskBoardData || undefined}
            isLoading={isLoading}
            error={error}
            onTaskClick={handleTaskClick}
            onTaskMove={handleTaskMove}
            onCreateTask={handleCreateTask}
            showCreateButton={true}
          />
        )}

        {/* Development Tools */}
        <div
          className="task-board-dev-tools"
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            display: 'flex',
            gap: '10px',
            zIndex: 1000,
          }}
        >
          <button
            onClick={handleRefresh}
            disabled={isLoading || isFilterLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading || isFilterLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading || isFilterLoading ? 0.6 : 1,
            }}
          >
            {isLoading || isFilterLoading ? 'Loading...' : 'Refresh'}
          </button>

          <button
            onClick={() => loadSampleTasks()}
            disabled={isLoading || isFilterLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading || isFilterLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading || isFilterLoading ? 0.6 : 1,
            }}
          >
            Load Sample
          </button>
        </div>
      </div>
    </div>
  );
};
