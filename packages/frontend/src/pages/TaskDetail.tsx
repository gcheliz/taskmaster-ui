import React from 'react'
import { useParams } from "react-router"

const TaskDetail = () => {
  const { taskId } = useParams()

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Task #{taskId}</h1>
        <p className="text-slate-400 mt-2">Task details and management</p>
      </div>

      <div className="bg-slate-800 rounded-lg shadow border border-slate-700 p-6">
        <p className="text-slate-400">Task detail view for ID: {taskId}</p>
      </div>
    </>
  )
}

export default TaskDetail
