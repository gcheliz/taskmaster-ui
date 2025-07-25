import type { Task } from '../../../../types/task'

/**
 * Convert a task object to CSV format
 */
export const convertTaskToCSV = (task: Task): string => {
  const headers = [
    'ID',
    'Title',
    'Description',
    'Status',
    'Priority',
    'Assigned To',
    'Due Date',
    'Estimated Hours',
    'Tags',
    'Dependencies',
    'Created At',
    'Updated At',
    'Details',
    'Test Strategy'
  ]

  const values = [
    task.id,
    `"${task.title.replace(/"/g, '""')}"`,
    `"${task.description.replace(/"/g, '""')}"`,
    task.status,
    task.priority,
    task.assignedTo || '',
    task.dueDate || '',
    task.estimatedHours || '',
    task.tags?.join(';') || '',
    task.dependencies?.join(';') || '',
    task.createdAt || '',
    task.updatedAt || '',
    `"${(task.details || '').replace(/"/g, '""')}"`,
    `"${(task.testStrategy || '').replace(/"/g, '""')}"`
  ]

  return `${headers.join(',')}\n${values.join(',')}`
}

/**
 * Convert multiple tasks to CSV format
 */
export const convertTasksToCSV = (tasks: Task[]): string => {
  if (tasks.length === 0) return ''

  const headers = [
    'ID',
    'Title',
    'Description',
    'Status',
    'Priority',
    'Assigned To',
    'Due Date',
    'Estimated Hours',
    'Tags',
    'Dependencies',
    'Created At',
    'Updated At'
  ]

  const rows = tasks.map(task => [
    task.id,
    `"${task.title.replace(/"/g, '""')}"`,
    `"${task.description.replace(/"/g, '""')}"`,
    task.status,
    task.priority,
    task.assignedTo || '',
    task.dueDate || '',
    task.estimatedHours || '',
    task.tags?.join(';') || '',
    task.dependencies?.join(';') || '',
    task.createdAt || '',
    task.updatedAt || ''
  ])

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
}

/**
 * Export task data to a file
 */
export const exportTaskToFile = (task: Task, format: 'json' | 'csv' = 'json'): void => {
  const dataStr = format === 'json' 
    ? JSON.stringify(task, null, 2)
    : convertTaskToCSV(task)
  
  const mimeType = format === 'json' ? 'application/json' : 'text/csv'
  const blob = new Blob([dataStr], { type: mimeType })
  const url = URL.createObjectURL(blob)
  
  const linkElement = document.createElement('a')
  linkElement.href = url
  linkElement.download = `task-${task.id}-${new Date().toISOString().split('T')[0]}.${format}`
  
  document.body.appendChild(linkElement)
  linkElement.click()
  document.body.removeChild(linkElement)
  
  // Clean up the URL object
  URL.revokeObjectURL(url)
}

/**
 * Export multiple tasks to a file
 */
export const exportTasksToFile = (tasks: Task[], filename: string, format: 'json' | 'csv' = 'json'): void => {
  const dataStr = format === 'json' 
    ? JSON.stringify(tasks, null, 2)
    : convertTasksToCSV(tasks)
  
  const mimeType = format === 'json' ? 'application/json' : 'text/csv'
  const blob = new Blob([dataStr], { type: mimeType })
  const url = URL.createObjectURL(blob)
  
  const linkElement = document.createElement('a')
  linkElement.href = url
  linkElement.download = `${filename}-${new Date().toISOString().split('T')[0]}.${format}`
  
  document.body.appendChild(linkElement)
  linkElement.click()
  document.body.removeChild(linkElement)
  
  // Clean up the URL object
  URL.revokeObjectURL(url)
}