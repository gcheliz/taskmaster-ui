import type { Task, TaskStatus, TaskPriority } from '../../../../types/task'

export const DEFAULT_TASK_VALUES: Partial<Task> = {
  title: '',
  description: '',
  details: '',
  testStrategy: '',
  priority: 'medium',
  status: 'pending',
  dependencies: [],
  tags: [],
  estimatedHours: undefined,
  assignedTo: '',
  dueDate: undefined,
}

export const TASK_STATUSES: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'To Do', color: '#6b7280' },
  { value: 'in-progress', label: 'In Progress', color: '#3b82f6' },
  { value: 'done', label: 'Done', color: '#10b981' },
  { value: 'blocked', label: 'Blocked', color: '#ef4444' },
  { value: 'deferred', label: 'Deferred', color: '#f59e0b' },
  { value: 'cancelled', label: 'Cancelled', color: '#6b7280' },
]

export const TASK_PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: '#10b981' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high', label: 'High', color: '#ef4444' },
  { value: 'urgent', label: 'Urgent', color: '#dc2626' },
]