import React from 'react';
import { TaskBoard } from '../TaskBoard';
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
}

export const TaskBoardView: React.FC<TaskBoardViewProps> = ({ 
  className = '',
  repositoryPath,
  projectTag,
  projectId,
  filePath,
  refreshInterval = 30000 // 30 seconds default
}) => {
  const {
    taskBoardData,
    isLoading,
    error,
    refresh,
    loadSampleTasks
  } = useTaskData({
    repositoryPath,
    projectTag,
    projectId,
    filePath,
    autoLoad: true,
    pollingInterval: refreshInterval
  });

  const handleTaskClick = (taskId: number) => {
    // TODO: Implement task details modal
    console.log('Task clicked:', taskId);
  };

  const handleTaskMove = (taskId: number, fromStatus: TaskStatus, toStatus: TaskStatus) => {
    // TODO: Implement task status update
    console.log('Task moved:', { taskId, fromStatus, toStatus });
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
        <TaskBoard
          data={taskBoardData || undefined}
          isLoading={isLoading}
          error={error}
          onTaskClick={handleTaskClick}
          onTaskMove={handleTaskMove}
          onCreateTask={handleCreateTask}
          showCreateButton={true}
        />
        
        {/* Development Tools */}
        <div className="task-board-dev-tools" style={{ 
          position: 'fixed', 
          bottom: '20px', 
          right: '20px', 
          display: 'flex', 
          gap: '10px',
          zIndex: 1000
        }}>
          <button 
            onClick={handleRefresh}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
          
          <button 
            onClick={() => loadSampleTasks()}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            Load Sample
          </button>
        </div>
      </div>
    </div>
  );
};