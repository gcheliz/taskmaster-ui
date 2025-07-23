import React from 'react'
import { Button } from '../components/ui/Button'
import { Plus } from 'lucide-react'

const Tasks = () => {
  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Tasks</h1>
          <p className="text-slate-400 mt-2">Manage and track all your project tasks</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      <div className="bg-slate-800 rounded-lg shadow border border-slate-700 p-6">
        <p className="text-slate-400">Task list will be implemented here</p>
      </div>
    </>
  )
}

export default Tasks
