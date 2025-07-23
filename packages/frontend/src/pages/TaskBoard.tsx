import React from 'react'
import { useTaskData } from '../hooks/useTaskData'
import { Spinner } from '../components/ui/atoms/Spinner'
import { Plus, Filter, Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react'

const TaskBoard: React.FC = () => {
  const { taskBoardData, isLoading, error } = useTaskData()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-medium">Error loading tasks</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    )
  }

  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-500' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-500' },
    { id: 'review', title: 'Review', color: 'bg-purple-500' },
    { id: 'done', title: 'Done', color: 'bg-green-500' },
  ]

  const getTasksForColumn = (columnId: string) => {
    return taskBoardData?.columns[columnId]?.tasks || []
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-400 bg-red-50'
      case 'medium': return 'border-amber-400 bg-amber-50'
      case 'low': return 'border-gray-300 bg-gray-50'
      default: return 'border-gray-200'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-4 h-4 text-red-600" />
      case 'medium': return <Clock className="w-4 h-4 text-amber-600" />
      case 'low': return <CheckCircle2 className="w-4 h-4 text-gray-600" />
      default: return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Board</h1>
          <p className="text-gray-600 mt-1">Manage and track your project tasks</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Board Stats */}
      <div className="grid grid-cols-4 gap-4">
        {columns.map((column) => {
          const tasks = getTasksForColumn(column.id)
          const taskCount = tasks.length
          return (
            <div key={column.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">{column.title}</span>
                <span className="text-2xl font-bold text-gray-900">{taskCount}</span>
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div className={`${column.color} h-1 rounded-full`} style={{ width: '100%' }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => (
          <div key={column.id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{column.title}</h3>
              <span className="text-sm text-gray-500">{getTasksForColumn(column.id).length}</span>
            </div>
            
            <div className="space-y-3">
              {getTasksForColumn(column.id).map((task: any) => (
                <div 
                  key={task.id} 
                  className={`bg-white rounded-lg p-4 border-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${getPriorityColor(task.priority)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 flex-1">{task.title}</h4>
                    {getPriorityIcon(task.priority)}
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {task.assignee && (
                        <div className="flex items-center gap-1">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-700">
                              {task.assignee.split(' ').map((n: string) => n[0]).join('')}
                            </span>
                          </div>
                          <span className="text-xs text-gray-600">{task.assignee.split(' ')[0]}</span>
                        </div>
                      )}
                    </div>
                    
                    {task.dueDate && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {task.tags.map((tag: string, index: number) => (
                        <span 
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {getTasksForColumn(column.id).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No tasks yet</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TaskBoard