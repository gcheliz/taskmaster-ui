import React, { useState } from 'react'
import { Plus } from 'lucide-react'

interface Task {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  column: string
}

const TaskBoardSimple: React.FC = () => {
  React.useEffect(() => {
    console.log('[TaskBoardSimple] Component mounted')
    return () => {
      console.log('[TaskBoardSimple] Component unmounting')
    }
  }, [])

  const [tasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Simple Task 1',
      description: 'Description 1',
      priority: 'high',
      column: 'todo',
    },
    {
      id: '2',
      title: 'Simple Task 2',
      description: 'Description 2',
      priority: 'medium',
      column: 'in-progress',
    },
  ])

  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-500' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-600' },
    { id: 'done', title: 'Done', color: 'bg-green-600' },
  ]

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Simple Task Board</h1>

      <div className="flex gap-4">
        {columns.map((column) => (
          <div key={column.id} className="flex-1 bg-gray-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{column.title}</h3>
              <button className="p-1 hover:bg-gray-200 rounded">
                <Plus size={16} />
              </button>
            </div>

            <div className="space-y-2">
              {tasks
                .filter((task) => task.column === column.id)
                .map((task) => (
                  <div key={task.id} className="bg-white p-3 rounded shadow-sm">
                    <h4 className="font-medium text-sm">{task.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                    <span
                      className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                        task.priority === 'high'
                          ? 'bg-red-100 text-red-700'
                          : task.priority === 'medium'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TaskBoardSimple
