import React, { useState } from 'react'
import { RepositoryManagementEnhanced } from '../components/Repository/RepositoryManagementEnhanced'
import { AddRepository } from '../components/Repository/AddRepository'
import { Modal } from '../components/ui/molecules/Modal'
import { useRepositoryOperations } from '../hooks/useRepositoryOperations'

const Repository = () => {
  const [showAddModal, setShowAddModal] = useState(false)
  const { connectRepository } = useRepositoryOperations()

  const handleAddRepository = () => {
    setShowAddModal(true)
  }

  const handleRepositoryAdded = async (path: string) => {
    try {
      await connectRepository(path, {
        validateGit: true,
        validateTaskMaster: true,
        selectAfterConnect: true
      })
      setShowAddModal(false)
    } catch (error) {
      logger.error('Failed to add repository:', error)
    }
  }

  return (
    <div className="space-y-8">
      <RepositoryManagementEnhanced onAddRepository={handleAddRepository} />
      
      <Modal open={showAddModal} onOpenChange={setShowAddModal}>
        <AddRepository onRepositoryAdd={handleRepositoryAdded} />
      </Modal>
    </div>
  )
}

export default Repository