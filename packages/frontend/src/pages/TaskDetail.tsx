import React from 'react'
import { useParams } from 'react-router-dom'
import { PageHeader } from '../components/layouts/PageHeader'

const TaskDetail = () => {
  const { taskId } = useParams()
  
  return (
    <>
      <PageHeader
        title={`Task #${taskId}`}
        showBackButton
        breadcrumbs={[
          { label: 'Tasks', href: '/tasks' },
          { label: `Task #${taskId}` },
        ]}
      />
      
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-secondary-600">Task detail view for ID: {taskId}</p>
      </div>
    </>
  )
}

export default TaskDetail