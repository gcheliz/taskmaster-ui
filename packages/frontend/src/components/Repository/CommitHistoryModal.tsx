import React, { useState, useEffect, useCallback } from 'react'
import { cn } from '../../utils/cn'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  ModalClose,
} from '../ui/molecules/Modal'
import { Button } from '../ui/atoms/Button'
import { Badge } from '../ui/atoms/Badge'
import { Spinner } from '../ui/atoms/Spinner'
import { RepositoryService } from '../../services/repositoryService'
import { VirtualizedList } from '../common/VirtualizedList'

export interface CommitData {
  hash: string
  date: string
  message: string
  author: {
    name: string
    email: string
  }
}

export interface CommitHistoryModalProps {
  /** Whether the modal is open */
  open: boolean
  /** Callback when the modal open state changes */
  onOpenChange: (open: boolean) => void
  /** Repository ID to fetch commits for */
  repositoryId: string
  /** Repository name for display */
  repositoryName: string
  /** Branch name to filter commits (optional) */
  branchName?: string
  /** Additional CSS classes */
  className?: string
}

export interface CommitHistoryState {
  commits: CommitData[]
  isLoading: boolean
  error: string | null
  hasMore: boolean
  page: number
  total: number
}

const COMMITS_PER_PAGE = 50

export const CommitHistoryModal = ({
  open,
  onOpenChange,
  repositoryId,
  repositoryName,
  branchName,
  className,
}: CommitHistoryModalProps) => {
  const [state, setState] = useState<CommitHistoryState>({
    commits: [],
    isLoading: false,
    error: null,
    hasMore: true,
    page: 1,
    total: 0,
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [filteredCommits, setFilteredCommits] = useState<CommitData[]>([])

  // Load initial commits when modal opens
  useEffect(() => {
    if (open && repositoryId) {
      loadCommits(true)
    }
  }, [open, repositoryId, branchName])

  // Filter commits based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCommits(state.commits)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = state.commits.filter(
      (commit) =>
        commit.message.toLowerCase().includes(query) ||
        commit.author.name.toLowerCase().includes(query) ||
        commit.author.email.toLowerCase().includes(query) ||
        commit.hash.toLowerCase().includes(query)
    )
    setFilteredCommits(filtered)
  }, [searchQuery, state.commits])

  const loadCommits = useCallback(
    async (reset = false) => {
      if (state.isLoading) return

      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        ...(reset && {
          commits: [],
          page: 1,
          hasMore: true,
          total: 0,
        }),
      }))

      try {
        const currentPage = reset ? 1 : state.page

        // Check for Storybook mock service first
        const mockService = (window as any).__STORYBOOK_REPOSITORY_SERVICE__
        const response = mockService
          ? await mockService.getCommitHistory(repositoryId, COMMITS_PER_PAGE, branchName)
          : await RepositoryService.getCommitHistory(repositoryId, COMMITS_PER_PAGE, branchName)

        if (response.success && response.data) {
          const newCommits = response.data

          setState((prev) => ({
            ...prev,
            commits: reset ? newCommits : [...prev.commits, ...newCommits],
            hasMore: newCommits.length === COMMITS_PER_PAGE,
            page: currentPage + 1,
            total: reset ? newCommits.length : prev.total + newCommits.length,
            isLoading: false,
            error: null,
          }))
        } else {
          setState((prev) => ({
            ...prev,
            error: response.error || 'Failed to load commit history',
            isLoading: false,
          }))
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to load commit history',
          isLoading: false,
        }))
      }
    },
    [repositoryId, branchName, state.isLoading, state.page]
  )

  const handleLoadMore = () => {
    if (state.hasMore && !state.isLoading) {
      loadCommits(false)
    }
  }

  const handleRefresh = () => {
    setSearchQuery('')
    loadCommits(true)
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`
    if (diffInHours < 24 * 7) return `${Math.floor(diffInHours / 24)}d ago`
    if (diffInHours < 24 * 30) return `${Math.floor(diffInHours / (24 * 7))}w ago`
    return date.toLocaleDateString()
  }

  const copyCommitHash = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash)
      // Could show a toast notification here
    } catch (error) {
      console.error('Failed to copy commit hash:', error)
    }
  }

  const getCommitMessagePreview = (message: string): string => {
    const firstLine = message.split('\n')[0]
    return firstLine.length > 80 ? firstLine.substring(0, 77) + '...' : firstLine
  }

  const highlightSearchText = (text: string, query: string): React.ReactNode => {
    if (!query.trim()) return text

    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 text-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="xl" className={className}>
        <ModalHeader>
          <div className="flex items-center justify-between">
            <div>
              <ModalTitle className="text-xl font-semibold">Commit History</ModalTitle>
              <ModalDescription className="mt-1">
                {repositoryName}
                {branchName && (
                  <Badge variant="secondary" size="sm" className="ml-2">
                    {branchName}
                  </Badge>
                )}
              </ModalDescription>
            </div>
            <ModalClose />
          </div>

          {/* Search and Actions */}
          <div className="flex items-center space-x-3 mt-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search commits by message, author, or hash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={state.isLoading}>
              {state.isLoading ? <Spinner size="sm" /> : <RefreshIcon className="w-4 h-4" />}
              Refresh
            </Button>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
            <span>{state.total} commits loaded</span>
            {searchQuery && (
              <span>
                {filteredCommits.length} match
                {filteredCommits.length !== 1 ? 'es' : ''}
              </span>
            )}
            {state.hasMore && <span>More available</span>}
          </div>
        </ModalHeader>

        <ModalBody className="max-h-[60vh]">
          {state.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex">
                <div className="text-red-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error loading commits</h3>
                  <p className="text-sm text-red-700 mt-1">{state.error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadCommits(true)}
                    className="mt-2"
                  >
                    Try again
                  </Button>
                </div>
              </div>
            </div>
          )}

          {state.isLoading && filteredCommits.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <Spinner size="md" />
              <span className="ml-3 text-gray-600">Loading commits...</span>
            </div>
          )}

          {!state.isLoading && filteredCommits.length === 0 && !state.error && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? 'No matching commits found' : 'No commits found'}
              </h3>
              <p className="text-gray-500">
                {searchQuery
                  ? 'Try adjusting your search query or check a different branch.'
                  : "This repository doesn't have any commits yet."}
              </p>
            </div>
          )}

          {/* Commit List */}
          <VirtualizedList
            items={filteredCommits}
            height={400}
            itemHeight={120}
            gap={12}
            overscan={3}
            className="pr-2"
            renderItem={(commit) => (
              <div className="bg-gray-50/50 rounded-lg p-4 hover:bg-gray-100/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {highlightSearchText(getCommitMessagePreview(commit.message), searchQuery)}
                      </h4>
                      {commit.message.includes('\n') && (
                        <Badge variant="secondary" size="sm">
                          +details
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span>by {highlightSearchText(commit.author.name, searchQuery)}</span>
                      <span>{formatDate(commit.date)}</span>
                      <button
                        onClick={() => copyCommitHash(commit.hash)}
                        className="font-mono text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                        title="Click to copy commit hash"
                      >
                        {highlightSearchText(commit.hash.substring(0, 7), searchQuery)}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Extended commit message */}
                {commit.message.includes('\n') && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                      Show full message
                    </summary>
                    <div className="mt-2 p-3 bg-white rounded border text-sm">
                      <pre className="whitespace-pre-wrap text-gray-700 font-mono text-xs">
                        {highlightSearchText(commit.message, searchQuery)}
                      </pre>
                    </div>
                  </details>
                )}
              </div>
            )}
            getItemKey={(index) => filteredCommits[index].hash}
          />

          {/* Load More Button */}
          {state.hasMore && !searchQuery && (
            <div className="flex justify-center pt-6">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={state.isLoading}
                className="min-w-32"
              >
                {state.isLoading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-gray-500">
              {filteredCommits.length > 0 && (
                <span>
                  Showing {filteredCommits.length} of {state.total} commits
                  {state.hasMore && ' (more available)'}
                </span>
              )}
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

// Simple refresh icon component
const RefreshIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
)

export default CommitHistoryModal
