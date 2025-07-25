import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { Card, CardHeader, CardTitle, CardContent } from '../atoms/Card'
import { Badge } from '../atoms/Badge'
import { Button } from '../atoms/Button'
import { Icon, PlusIcon } from '../atoms/Icon'
import { KanbanTaskCard } from './KanbanTaskCard'
import type { TaskStatus, TaskPriority } from '../../../types/task'

export interface KanbanTask {
  id: number
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  complexity?: number
  estimatedHours?: number
  assignedTo?: string
  tags?: string[]
  createdAt?: string
  updatedAt?: string
  dueDate?: string
  subtasks?: Array<{
    id: number
    title: string
    status: TaskStatus
  }>
}

export interface DropData {
  type: 'column'
  status: TaskStatus
}

export interface KanbanColumnProps {
  id: string
  title: string
  status: TaskStatus
  tasks: KanbanTask[]
  color?: string
  limit?: number
  onTaskClick?: (taskId: number) => void
  onAddTask?: (status: TaskStatus) => void
  showAddButton?: boolean
  className?: string
}

const KanbanColumn = ({
  id,
  title,
  status,
  tasks,
  color = 'primary',
  limit,
  onTaskClick,
  onAddTask,
  showAddButton = true,
  className = '',
}: KanbanColumnProps) => {
  const taskCount = tasks.length
  const isOverLimit = limit && taskCount > limit

  // Configure droppable behavior
  const dropData: DropData = {
    type: 'column',
    status: status,
  }

  const { setNodeRef, isOver } = useDroppable({
    id: `column-${id}`,
    data: dropData,
  })

  const getStatusColor = (columnStatus: TaskStatus) => {
    switch (columnStatus) {
      case 'pending':
        return 'secondary'
      case 'in-progress':
        return 'primary'
      case 'done':
        return 'success'
      case 'blocked':
        return 'error'
      case 'cancelled':
        return 'error'
      case 'deferred':
        return 'warning'
      default:
        return 'secondary'
    }
  }

  const _getStatusIcon = (columnStatus: TaskStatus) => {
    switch (columnStatus) {
      case 'pending':
        return 'pending'
      case 'in-progress':
        return 'in-progress'
      case 'done':
        return 'done'
      case 'blocked':
        return 'blocked'
      case 'cancelled':
        return 'blocked'
      case 'deferred':
        return 'deferred'
      default:
        return 'pending'
    }
  }

  const formatColumnTitle = (columnTitle: string) => {
    return columnTitle.charAt(0).toUpperCase() + columnTitle.slice(1).replace(/-/g, ' ')
  }

  const handleAddTask = () => {
    onAddTask?.(status)
  }

  return (
    <div
      ref={setNodeRef}
      className={`kanban-column flex flex-col h-full w-full ${className}`}
      data-column-id={id}
      data-status={status}
    >
      <Card
        variant="outline"
        className={`
          flex-1 flex flex-col bg-surface-50 dark:bg-surface-900 transition-[background-color] duration-200
          ${isOver ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-600' : ''}
        `}
      >
        <CardHeader className="flex-shrink-0 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full bg-${color}-500`} />
              <span className="text-sm font-semibold text-secondary-900 dark:text-secondary-100">
                {formatColumnTitle(title)}
              </span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge
                variant={
                  getStatusColor(status) as
                    | 'primary'
                    | 'secondary'
                    | 'success'
                    | 'warning'
                    | 'error'
                }
                size="sm"
              >
                {taskCount}
              </Badge>
              {limit && (
                <Badge variant={isOverLimit ? 'error' : 'secondary'} size="sm">
                  {limit}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col space-y-3 p-3">
          {/* Add Task Button */}
          {showAddButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddTask}
              className="w-full justify-center text-xs py-3 border-dashed border-2 hover:border-solid transition-[border-style] touch-target"
            >
              <Icon icon={PlusIcon} size="sm" className="mr-2" />
              Add Task
            </Button>
          )}

          {/* Tasks Container */}
          <div className="flex-1 space-y-3 overflow-y-auto scrollbar-kanban">
            {tasks.length === 0 ? (
              <div className="flex-1 flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-surface-200 dark:bg-surface-700 flex items-center justify-center mx-auto mb-2">
                    <Icon icon={PlusIcon} size="md" color="muted" />
                  </div>
                  <p className="text-sm text-secondary-500 dark:text-secondary-500">No tasks yet</p>
                </div>
              </div>
            ) : (
              tasks.map((task) => (
                <KanbanTaskCard
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  description={task.description}
                  status={task.status}
                  priority={task.priority}
                  complexity={task.complexity}
                  estimatedHours={task.estimatedHours}
                  assignedTo={task.assignedTo}
                  tags={task.tags}
                  createdAt={task.createdAt}
                  updatedAt={task.updatedAt}
                  dueDate={task.dueDate}
                  subtasks={task.subtasks}
                  onClick={onTaskClick}
                  isDraggable={true}
                  className="transition-[box-shadow,transform] duration-200"
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { KanbanColumn }
