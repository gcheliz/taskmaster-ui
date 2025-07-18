import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { Icon, TaskIcon, ArchiveIcon, DuplicateIcon, SettingsIcon, PlusIcon } from '../atoms/Icon';
import { Input } from '../atoms/Input';
import { Spinner } from '../atoms/Spinner';
import { KanbanColumn, type KanbanTask } from '../molecules/KanbanColumn';
import type { TaskStatus, TaskPriority } from '../../../types/task';

export interface KanbanBoardColumn {
  id: string;
  title: string;
  status: TaskStatus;
  color: string;
  limit?: number;
}

export interface KanbanBoardProps {
  tasks: KanbanTask[];
  loading?: boolean;
  error?: string;
  onTaskClick?: (taskId: number) => void;
  onAddTask?: (status: TaskStatus) => void;
  onRefresh?: () => void;
  showSearch?: boolean;
  showFilters?: boolean;
  className?: string;
}

const DEFAULT_COLUMNS: KanbanBoardColumn[] = [
  {
    id: 'todo',
    title: 'To Do',
    status: 'pending',
    color: 'secondary',
    limit: 20,
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    status: 'in-progress',
    color: 'primary',
    limit: 5,
  },
  {
    id: 'review',
    title: 'Review',
    status: 'done', // We'll use 'done' for review since we don't have a 'review' status
    color: 'warning',
    limit: 10,
  },
  {
    id: 'testing',
    title: 'Testing',
    status: 'done', // We'll use 'done' for testing since we don't have a 'testing' status
    color: 'success',
    limit: 8,
  },
  {
    id: 'done',
    title: 'Done',
    status: 'done',
    color: 'success',
  },
];

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  loading = false,
  error,
  onTaskClick,
  onAddTask,
  onRefresh,
  showSearch = true,
  showFilters = true,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Filter tasks based on search and filters
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply priority filter
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === selectedPriority);
    }

    return filtered;
  }, [tasks, searchTerm, selectedPriority]);

  // Group tasks by status for each column
  const tasksByStatus = useMemo(() => {
    const grouped: Record<string, KanbanTask[]> = {};
    
    DEFAULT_COLUMNS.forEach(column => {
      grouped[column.id] = [];
    });

    filteredTasks.forEach(task => {
      // Map task status to columns
      switch (task.status) {
        case 'pending':
          grouped['todo'].push(task);
          break;
        case 'in-progress':
          grouped['in-progress'].push(task);
          break;
        case 'done':
          // For now, put all done tasks in the 'done' column
          // In a real app, you'd have more specific status tracking
          grouped['done'].push(task);
          break;
        case 'blocked':
          grouped['todo'].push(task); // Put blocked tasks in todo for now
          break;
        case 'deferred':
          grouped['todo'].push(task); // Put deferred tasks in todo for now
          break;
        default:
          grouped['todo'].push(task);
      }
    });

    return grouped;
  }, [filteredTasks]);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  const getTotalTaskCount = () => {
    return filteredTasks.length;
  };

  const getCompletedTaskCount = () => {
    return filteredTasks.filter(task => task.status === 'done').length;
  };

  const getCompletionPercentage = () => {
    const total = getTotalTaskCount();
    if (total === 0) return 0;
    return Math.round((getCompletedTaskCount() / total) * 100);
  };

  // Loading State
  if (loading) {
    return (
      <Card variant="elevated" className={className}>
        <CardContent className="text-center py-12">
          <Spinner size="lg" className="mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
            Loading Kanban Board
          </h3>
          <p className="text-secondary-600 dark:text-secondary-400">
            Fetching your tasks...
          </p>
        </CardContent>
      </Card>
    );
  }

  // Error State
  if (error) {
    return (
      <Card variant="elevated" className={className}>
        <CardContent className="text-center py-12">
          <Icon icon={ArchiveIcon} size="2xl" color="error" className="mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-error-600 dark:text-error-400 mb-2">
            Failed to Load Board
          </h3>
          <p className="text-secondary-600 dark:text-secondary-400 mb-6">
            {error}
          </p>
          {onRefresh && (
            <Button variant="primary" onClick={handleRefresh}>
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`kanban-board ${className}`}>
      {/* Header */}
      <Card variant="elevated" className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Icon icon={TaskIcon} size="md" color="primary" />
              <span>Kanban Board</span>
              <Badge variant="secondary" size="sm">
                {getTotalTaskCount()} tasks
              </Badge>
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              <Badge variant="success" size="sm">
                {getCompletionPercentage()}% Complete
              </Badge>
              {onRefresh && (
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                  {refreshing ? (
                    <Spinner size="sm" className="mr-2" />
                  ) : (
                    <Icon icon={DuplicateIcon} size="sm" className="mr-2" />
                  )}
                  Refresh
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Search and Filter Bar */}
        {(showSearch || showFilters) && (
          <CardContent className="pt-0">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              {showSearch && (
                <div className="flex-1">
                  <div className="relative">
                    <Icon icon={PlusIcon} size="sm" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
                    <Input
                      type="text"
                      placeholder="Search tasks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              )}

              {/* Filters */}
              {showFilters && (
                <div className="flex items-center space-x-2">
                  <Icon icon={SettingsIcon} size="sm" color="muted" />
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value as TaskPriority | 'all')}
                    className="px-3 py-2 border border-surface-200 dark:border-surface-700 rounded-md bg-surface-100 dark:bg-surface-800 text-sm"
                  >
                    <option value="all">All Priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Kanban Columns */}
      <div className="kanban-columns-container">
        <div className="flex space-x-4 overflow-x-auto pb-4 min-h-[600px]">
          {DEFAULT_COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              status={column.status}
              tasks={tasksByStatus[column.id] || []}
              color={column.color}
              limit={column.limit}
              onTaskClick={onTaskClick}
              onAddTask={onAddTask}
              showAddButton={true}
              className="flex-shrink-0"
            />
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredTasks.length === 0 && !loading && (
        <Card variant="outline" className="mt-6">
          <CardContent className="text-center py-12">
            <Icon icon={ArchiveIcon} size="2xl" color="muted" className="mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
              No Tasks Found
            </h3>
            <p className="text-secondary-600 dark:text-secondary-400 mb-6">
              {searchTerm || selectedPriority !== 'all' 
                ? 'No tasks match your current filters.' 
                : 'Get started by adding your first task.'}
            </p>
            {onAddTask && (
              <Button variant="primary" onClick={() => onAddTask('pending')}>
                <Icon icon={TaskIcon} size="sm" className="mr-2" />
                Add First Task
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export { KanbanBoard };