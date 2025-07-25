import React, { useState, useEffect } from 'react'
import { Modal, ModalHeader, ModalContent, ModalFooter } from '../ui/molecules/Modal'
import { Button } from '../ui/atoms/Button'
import { Input } from '../ui/atoms/Input'
import { Label } from '../ui/atoms/Label'
import { Alert } from '../ui/molecules/Alert'
import { Spinner } from '../ui/atoms/Spinner'
import { useNewBranchModal, useRepositoryActions } from '../../stores/repositoryStore'
import { useRepositoryData } from '../../hooks/useRepositoryData'

export interface NewBranchModalProps {
  /** Additional CSS classes */
  className?: string
}

interface BranchFormData {
  branchName: string
  fromBranch: string
}

const BRANCH_NAME_REGEX = /^[a-zA-Z0-9._/-]+$/
const RESERVED_BRANCH_NAMES = ['HEAD', 'refs', 'origin']

const validateBranchName = (name: string): string | null => {
  if (!name.trim()) {
    return 'Branch name is required'
  }

  if (name.length < 1 || name.length > 100) {
    return 'Branch name must be between 1 and 100 characters'
  }

  if (!BRANCH_NAME_REGEX.test(name)) {
    return 'Branch name can only contain letters, numbers, dots, underscores, hyphens, and forward slashes'
  }

  if (name.startsWith('.') || name.endsWith('.')) {
    return 'Branch name cannot start or end with a dot'
  }

  if (name.includes('..')) {
    return 'Branch name cannot contain consecutive dots'
  }

  if (name.startsWith('/') || name.endsWith('/')) {
    return 'Branch name cannot start or end with a forward slash'
  }

  if (
    RESERVED_BRANCH_NAMES.some((reserved) => name.toLowerCase().includes(reserved.toLowerCase()))
  ) {
    return 'Branch name cannot contain reserved words'
  }

  return null
}

export const NewBranchModal = ({ className }: NewBranchModalProps) => {
  const { isOpen, repositoryId, isCreating, error } = useNewBranchModal()
  const { closeNewBranchModal, createNewBranch } = useRepositoryActions()

  const [formData, setFormData] = useState<BranchFormData>({
    branchName: '',
    fromBranch: 'main',
  })
  const [validationError, setValidationError] = useState<string | null>(null)
  const [availableBranches, setAvailableBranches] = useState<string[]>([
    'main',
    'develop',
    'master',
  ])

  // Fetch repository details when modal opens
  const {
    metadata: repositoryDetails,
    branches: repositoryBranches,
    isLoading: isLoadingDetails,
  } = useRepositoryData({
    repositoryId: repositoryId || '',
    autoFetch: isOpen && !!repositoryId,
  })

  // Update available branches when repository details are loaded
  useEffect(() => {
    if (repositoryBranches && repositoryBranches.length > 0) {
      const branchNames = repositoryBranches
        .filter((branch) => branch.isLocal)
        .map((branch) => branch.name)
        .sort()
      setAvailableBranches(branchNames.length > 0 ? branchNames : ['main', 'develop', 'master'])

      // Set default "from" branch to current branch if available
      if (repositoryDetails?.currentBranch) {
        setFormData((prev) => ({
          ...prev,
          fromBranch: repositoryDetails.currentBranch,
        }))
      }
    }
  }, [repositoryBranches, repositoryDetails])

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        branchName: '',
        fromBranch: 'main',
      })
      setValidationError(null)
    }
  }, [isOpen])

  const handleInputChange = (field: keyof BranchFormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Validate branch name as user types
    if (field === 'branchName') {
      const error = validateBranchName(value)
      setValidationError(error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!repositoryId) return

    const branchNameError = validateBranchName(formData.branchName)
    if (branchNameError) {
      setValidationError(branchNameError)
      return
    }

    // Check if branch name already exists
    if (availableBranches.includes(formData.branchName)) {
      setValidationError('A branch with this name already exists')
      return
    }

    const success = await createNewBranch(
      repositoryId,
      formData.branchName.trim(),
      formData.fromBranch || undefined
    )

    // Modal will be closed automatically on success by the store action
  }

  const handleClose = () => {
    if (!isCreating) {
      closeNewBranchModal()
    }
  }

  const canSubmit =
    formData.branchName.trim() &&
    formData.fromBranch &&
    !validationError &&
    !isCreating &&
    !isLoadingDetails

  if (!isOpen) return null

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          <h2 className="text-xl font-semibold text-gray-900">Create New Branch</h2>
          <p className="text-sm text-gray-600 mt-1">
            {repositoryId && `Create a new branch in repository ${repositoryId}`}
          </p>
        </ModalHeader>

        <ModalContent>
          <div className="space-y-6">
            {/* Error Alert */}
            {error && (
              <Alert variant="error" title="Failed to Create Branch">
                {error}
              </Alert>
            )}

            {/* Branch Name Input */}
            <div className="space-y-2">
              <Label htmlFor="branch-name" required>
                Branch Name
              </Label>
              <Input
                id="branch-name"
                type="text"
                placeholder="feature/new-feature"
                value={formData.branchName}
                onChange={(e) => handleInputChange('branchName')(e.target.value)}
                disabled={isCreating}
                error={!!validationError}
                aria-describedby={validationError ? 'branch-name-error' : undefined}
              />
              {validationError && (
                <p id="branch-name-error" className="text-sm text-red-600">
                  {validationError}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Use a descriptive name like "feature/user-authentication" or "bugfix/login-issue"
              </p>
            </div>

            {/* From Branch Selection */}
            <div className="space-y-2">
              <Label htmlFor="from-branch" required>
                Create from Branch
              </Label>
              {isLoadingDetails ? (
                <div className="flex items-center space-x-2 p-3 border rounded-md">
                  <Spinner size="sm" />
                  <span className="text-sm text-gray-600">Loading branches...</span>
                </div>
              ) : (
                <select
                  id="from-branch"
                  value={formData.fromBranch}
                  onChange={(e) => handleInputChange('fromBranch')(e.target.value)}
                  disabled={isCreating}
                  className="flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm transition-[border-color,box-shadow] duration-200 ease-in-out border-secondary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {availableBranches.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                      {repositoryDetails?.currentBranch === branch && ' (current)'}
                    </option>
                  ))}
                </select>
              )}
              <p className="text-xs text-gray-500">
                The new branch will be created from the selected branch
              </p>
            </div>

            {/* Branch Creation Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">About Branch Creation</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>The new branch will be created locally</li>
                      <li>You can push it to remote later using the sync feature</li>
                      <li>Use forward slashes (/) to organize branches into folders</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ModalContent>

        <ModalFooter>
          <div className="flex items-center justify-end space-x-3">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isCreating}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={!canSubmit} className="min-w-24">
              {isCreating ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                'Create Branch'
              )}
            </Button>
          </div>
        </ModalFooter>
      </form>
    </Modal>
  )
}

export default NewBranchModal
