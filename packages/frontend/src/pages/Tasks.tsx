import React from 'react'
import { PageHeader } from '../components/layouts/PageHeader'
import { Button } from '../components/ui/Button'
import { Plus } from 'lucide-react'

const Tasks = () => {
  return (
    <>
      <PageHeader
        title="Tasks"
        subtitle="Manage and track all your project tasks"
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        }
      />
      
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-secondary-600">Task list will be implemented here</p>
      </div>
    </>
  )
}

export default Tasks