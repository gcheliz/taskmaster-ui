// Task Data Model Types
// Based on TaskMaster tasks.json format

export interface TaskSubtask {
  id: number;
  title: string;
  description: string;
  dependencies?: number[];
  details?: string;
  status: TaskStatus;
  testStrategy?: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  details?: string;
  testStrategy?: string;
  priority: TaskPriority;
  dependencies?: number[];
  status: TaskStatus;
  subtasks?: TaskSubtask[];
  complexity?: number;
  estimatedHours?: number;
  assignedTo?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  dueDate?: string;
}

export type TaskStatus = 
  | 'pending'
  | 'in-progress'
  | 'done'
  | 'blocked'
  | 'cancelled'
  | 'deferred';

export type TaskPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent';

export interface TaskMetadata {
  created: string;
  updated: string;
  description: string;
  version?: string;
  projectName?: string;
  repositoryPath?: string;
}

export interface TasksData {
  tasks: Task[];
  metadata: TaskMetadata;
}

export interface TaskMasterProject {
  [projectName: string]: TasksData;
}

// UI-specific task types for the Kanban board
export interface TaskColumn {
  id: string;
  title: string;
  status: TaskStatus;
  tasks: Task[];
  color?: string;
  limit?: number;
}

export interface TaskBoardData {
  columns: TaskColumn[];
  tasks: Task[];
  metadata: TaskMetadata;
}

// Task filtering and sorting
export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assignedTo?: string[];
  tags?: string[];
  search?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface TaskSortOptions {
  field: keyof Task;
  direction: 'asc' | 'desc';
}

// Task statistics
export interface TaskStats {
  total: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
  completed: number;
  inProgress: number;
  pending: number;
  blocked: number;
  completionRate: number;
}

// Task actions
export interface TaskAction {
  type: 'create' | 'update' | 'delete' | 'move' | 'assign';
  taskId?: number;
  data?: Partial<Task>;
  timestamp: string;
  user?: string;
}

// Default column configurations
export const DEFAULT_COLUMNS: Omit<TaskColumn, 'tasks'>[] = [
  {
    id: 'pending',
    title: 'To Do',
    status: 'pending',
    color: '#6b7280',
    limit: 10
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    status: 'in-progress',
    color: '#3b82f6',
    limit: 5
  },
  {
    id: 'done',
    title: 'Done',
    status: 'done',
    color: '#10b981',
    limit: 20
  },
  {
    id: 'blocked',
    title: 'Blocked',
    status: 'blocked',
    color: '#ef4444',
    limit: 5
  },
  {
    id: 'deferred',
    title: 'Deferred',
    status: 'deferred',
    color: '#f59e0b',
    limit: 10
  }
];

// Task utilities
export const getTasksByStatus = (tasks: Task[], status: TaskStatus): Task[] => {
  return tasks.filter(task => task.status === status);
};

export const getTaskStats = (tasks: Task[]): TaskStats => {
  const byStatus = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<TaskStatus, number>);

  const byPriority = tasks.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    return acc;
  }, {} as Record<TaskPriority, number>);

  const completed = byStatus.done || 0;
  const total = tasks.length;
  const completionRate = total > 0 ? (completed / total) * 100 : 0;

  return {
    total,
    byStatus,
    byPriority,
    completed,
    inProgress: byStatus['in-progress'] || 0,
    pending: byStatus.pending || 0,
    blocked: byStatus.blocked || 0,
    completionRate
  };
};

export const filterTasks = (tasks: Task[], filters: TaskFilters): Task[] => {
  return tasks.filter(task => {
    // Status filter
    if (filters.status && !filters.status.includes(task.status)) {
      return false;
    }

    // Priority filter
    if (filters.priority && !filters.priority.includes(task.priority)) {
      return false;
    }

    // Assigned to filter
    if (filters.assignedTo && task.assignedTo && !filters.assignedTo.includes(task.assignedTo)) {
      return false;
    }

    // Tags filter
    if (filters.tags && task.tags && !filters.tags.some(tag => task.tags!.includes(tag))) {
      return false;
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const searchableText = `${task.title} ${task.description} ${task.details || ''}`.toLowerCase();
      if (!searchableText.includes(searchTerm)) {
        return false;
      }
    }

    return true;
  });
};

export const sortTasks = (tasks: Task[], sortOptions: TaskSortOptions): Task[] => {
  return [...tasks].sort((a, b) => {
    const aValue = a[sortOptions.field];
    const bValue = b[sortOptions.field];

    if (aValue === undefined || bValue === undefined) {
      return 0;
    }

    const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    return sortOptions.direction === 'asc' ? comparison : -comparison;
  });
};