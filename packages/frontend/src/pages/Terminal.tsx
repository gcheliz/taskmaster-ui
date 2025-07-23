import React from 'react'
import { PageHeader } from '../components/layouts/PageHeader'

const Terminal = () => {
  return (
    <>
      <PageHeader
        title="Terminal"
        subtitle="Execute TaskMaster CLI commands"
      />
      
      <div className="bg-secondary-900 rounded-lg shadow p-4 h-[600px]">
        <p className="text-green-400 font-mono">TaskMaster Terminal v1.0.0</p>
        <p className="text-secondary-400 font-mono">Terminal interface will be implemented here</p>
      </div>
    </>
  )
}

export default Terminal