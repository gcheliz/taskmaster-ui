import React from 'react'
import { RepositoryManagementEnhanced } from '../components/Repository/RepositoryManagementEnhanced'
import { AddRepository } from '../components/Repository/AddRepository'
import { Modal } from '../components/ui/molecules/Modal'
import { useState } from 'react'

const RepositoryManagementDemo: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false)

  const handleAddRepository = () => {
    setShowAddModal(true)
  }

  const handleRepositoryAdded = async (path: string) => {
    console.log('Repository added:', path)
    // In a real app, this would call the API to add the repository
    setShowAddModal(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Repository Management Demo
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Advanced repository search, filtering, and batch operations
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <RepositoryManagementEnhanced onAddRepository={handleAddRepository} />
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Features Demonstrated</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-green-600 mb-2">✓ Search & Filter</h3>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• Real-time search by name, path, or branch</li>
                <li>• Filter by status, type, branch, and date</li>
                <li>• Advanced filter panel with multiple criteria</li>
                <li>• Clear filters with one click</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-green-600 mb-2">✓ Sorting Options</h3>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• Sort by name, last update, activity, branches</li>
                <li>• Ascending and descending order</li>
                <li>• Visual indicators for active sort</li>
                <li>• Maintains selection during sort</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-green-600 mb-2">✓ Batch Operations</h3>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• Select multiple repositories</li>
                <li>• Batch sync with progress tracking</li>
                <li>• Batch remove with confirmation</li>
                <li>• Select/deselect all filtered items</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-green-600 mb-2">✓ Export Features</h3>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• Export to JSON format</li>
                <li>• Export to CSV for spreadsheets</li>
                <li>• Export filtered or selected items</li>
                <li>• Automatic download generation</li>
              </ul>
            </div>
          </div>
        </div>

        <Modal open={showAddModal} onOpenChange={setShowAddModal}>
          <AddRepository onRepositoryAdd={handleRepositoryAdded} />
        </Modal>
      </div>
    </div>
  )
}

export default RepositoryManagementDemo