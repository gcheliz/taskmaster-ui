import React from 'react'
import { NewBranchModal } from './NewBranchModal'
import { CommitHistoryModal } from './CommitHistoryModal'
import { useCommitHistory, useRepositoryActions } from '../../stores/repositoryStore'

export interface RepositoryManagementProps {
  /** Children components */
  children: React.ReactNode
  /** Additional CSS classes */
  className?: string
}

/**
 * RepositoryManagement wrapper component that handles global repository modals and state
 *
 * This component should wrap the entire application or repository-related sections
 * to provide global modals like NewBranchModal and CommitHistoryModal.
 */
export const RepositoryManagement = ({
  children,
  className,
}: RepositoryManagementProps) => {
  const { showCommitHistory, repositoryId: commitHistoryRepositoryId } = useCommitHistory()
  const { closeCommitHistory } = useRepositoryActions()

  return (
    <div className={className}>
      {children}

      {/* Global Repository Modals */}
      <NewBranchModal />

      {/* Commit History Modal */}
      {showCommitHistory && commitHistoryRepositoryId && (
        <CommitHistoryModal
          repositoryId={commitHistoryRepositoryId}
          repositoryName={commitHistoryRepositoryId}
          open={showCommitHistory}
          onOpenChange={(open) => {
            if (!open) {
              closeCommitHistory()
            }
          }}
        />
      )}
    </div>
  )
}

export default RepositoryManagement
