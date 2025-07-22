import React, { useState, useCallback } from 'react';
import { cn } from '../../utils/cn';
import { RepositoryGrid } from '../Repository/RepositoryGrid';
import { CommitHistoryModal } from '../Repository/CommitHistoryModal';
import { RepositoryHealthModal } from '../Repository/RepositoryHealthModal';
import type { RepositoryCardProps } from '../Repository/RepositoryCard';

export interface EnhancedRepositoryViewProps {
  /** Array of repositories to display */
  repositories: RepositoryCardProps['repository'][];
  /** Loading state */
  isLoading?: boolean;
  /** Error message */
  error?: string | null;
  /** Whether to show enhanced features */
  showEnhanced?: boolean;
  /** Whether to enable real-time updates */
  enableRealtime?: boolean;
  /** Event handlers */
  onRepositoryClick?: (repository: RepositoryCardProps['repository']) => void;
  onRepositoryRefresh?: (repositoryId: string) => void;
  onRepositoryDetails?: (repositoryId: string) => void;
  onRepositoryManage?: (repositoryId: string) => void;
  onRefreshAll?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export interface CommitHistoryModalState {
  isOpen: boolean;
  repositoryId: string | null;
  repositoryName: string | null;
  branchName?: string;
}

export interface HealthModalState {
  isOpen: boolean;
  repositoryId: string | null;
  repositoryName: string | null;
}

export const EnhancedRepositoryView: React.FC<EnhancedRepositoryViewProps> = ({
  repositories,
  isLoading = false,
  error = null,
  showEnhanced = true,
  enableRealtime = true,
  onRepositoryClick,
  onRepositoryRefresh,
  onRepositoryDetails,
  onRepositoryManage,
  onRefreshAll,
  className,
}) => {
  const [commitHistoryModal, setCommitHistoryModal] = useState<CommitHistoryModalState>({
    isOpen: false,
    repositoryId: null,
    repositoryName: null,
    branchName: undefined,
  });

  const [healthModal, setHealthModal] = useState<HealthModalState>({
    isOpen: false,
    repositoryId: null,
    repositoryName: null,
  });

  const handleRepositoryCommits = useCallback((repositoryId: string) => {
    const repository = repositories.find(repo => repo.id === repositoryId);
    if (repository) {
      setCommitHistoryModal({
        isOpen: true,
        repositoryId,
        repositoryName: repository.name,
        branchName: repository.currentBranch,
      });
    }
  }, [repositories]);

  const handleCommitHistoryClose = useCallback(() => {
    setCommitHistoryModal({
      isOpen: false,
      repositoryId: null,
      repositoryName: null,
      branchName: undefined,
    });
  }, []);

  const handleRepositoryDetails = useCallback((repositoryId: string) => {
    const repository = repositories.find(repo => repo.id === repositoryId);
    if (repository) {
      setHealthModal({
        isOpen: true,
        repositoryId,
        repositoryName: repository.name,
      });
    }
  }, [repositories]);

  const handleHealthModalClose = useCallback(() => {
    setHealthModal({
      isOpen: false,
      repositoryId: null,
      repositoryName: null,
    });
  }, []);

  return (
    <div className={cn('enhanced-repository-view', className)}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Repository Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Monitor and manage your Git repositories with detailed insights and commit history
              </p>
            </div>
            
            {enableRealtime && (
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Real-time updates enabled</span>
              </div>
            )}
          </div>

          {/* Key Metrics Summary */}
          {repositories.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-semibold text-blue-600">{repositories.length}</div>
                <div className="text-sm text-blue-700">Total Repositories</div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-semibold text-green-600">
                  {repositories.filter(repo => repo.status.isClean).length}
                </div>
                <div className="text-sm text-green-700">Clean Repositories</div>
              </div>
              
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="text-2xl font-semibold text-yellow-600">
                  {repositories.filter(repo => !repo.status.isClean).length}
                </div>
                <div className="text-sm text-yellow-700">With Changes</div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-semibold text-purple-600">
                  {repositories.filter(repo => repo.isPrivate).length}
                </div>
                <div className="text-sm text-purple-700">Private Repos</div>
              </div>
            </div>
          )}
        </div>

        {/* Repository Grid with Enhanced Features */}
        <RepositoryGrid
          repositories={repositories}
          isLoading={isLoading}
          error={error}
          layout="grid"
          showEnhanced={showEnhanced}
          enableRealtime={enableRealtime}
          searchable={true}
          filterable={true}
          sortable={true}
          onRepositoryClick={onRepositoryClick}
          onRepositoryRefresh={onRepositoryRefresh}
          onRepositoryDetails={handleRepositoryDetails}
          onRepositoryCommits={handleRepositoryCommits}
          onRepositoryManage={onRepositoryManage}
          onRefreshAll={onRefreshAll}
        />

        {/* Commit History Modal */}
        <CommitHistoryModal
          open={commitHistoryModal.isOpen}
          onOpenChange={handleCommitHistoryClose}
          repositoryId={commitHistoryModal.repositoryId || ''}
          repositoryName={commitHistoryModal.repositoryName || ''}
          branchName={commitHistoryModal.branchName}
        />

        {/* Repository Health Dashboard Modal */}
        <RepositoryHealthModal
          open={healthModal.isOpen}
          onOpenChange={handleHealthModalClose}
          repositoryId={healthModal.repositoryId || ''}
          repositoryName={healthModal.repositoryName || ''}
        />
      </div>
    </div>
  );
};

export default EnhancedRepositoryView;