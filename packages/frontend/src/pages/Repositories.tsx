import React from 'react'
import { PageHeader } from '../components/layouts/PageHeader'

const Repositories = () => {
  return (
    <>
      <PageHeader
        title="Repositories"
        subtitle="Manage your Git repositories"
      />
      
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-secondary-600">Repository management interface will be implemented here</p>
      </div>
    </>
  )
}

export default Repositories