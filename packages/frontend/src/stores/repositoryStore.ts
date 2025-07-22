import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { RepositoryService } from '../services/repositoryService';
import type { RepositoryCardEnhancedData } from '../components/Repository/RepositoryCard';

export interface RepositoryState {
  id: string;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  lastSyncTime: number | null;
}

export interface NewBranchModalState {
  isOpen: boolean;
  repositoryId: string | null;
  isCreating: boolean;
  error: string | null;
}

export interface RepositoryStore {
  // Repository states
  repositories: Record<string, RepositoryState>;

  // New Branch Modal state
  newBranchModal: NewBranchModalState;

  // Navigation state
  activeRepositoryId: string | null;
  showCommitHistory: boolean;
  commitHistoryRepositoryId: string | null;

  // Actions for repository management
  setRepositoryLoading: (repositoryId: string, isLoading: boolean) => void;
  setRepositorySyncing: (repositoryId: string, isSyncing: boolean) => void;
  setRepositoryError: (repositoryId: string, error: string | null) => void;
  updateLastSyncTime: (repositoryId: string) => void;

  // Actions for syncing repositories
  syncRepository: (repositoryId: string) => Promise<void>;
  syncAllRepositories: () => Promise<void>;

  // Actions for New Branch Modal
  openNewBranchModal: (repositoryId: string) => void;
  closeNewBranchModal: () => void;
  setNewBranchCreating: (isCreating: boolean) => void;
  setNewBranchError: (error: string | null) => void;
  createNewBranch: (
    repositoryId: string,
    branchName: string,
    fromBranch?: string
  ) => Promise<boolean>;

  // Actions for Commit History
  openCommitHistory: (repositoryId: string) => void;
  closeCommitHistory: () => void;

  // Actions for repository selection
  setActiveRepository: (repositoryId: string | null) => void;

  // Utility actions
  initializeRepository: (repositoryId: string) => void;
  cleanup: () => void;
}

const initialNewBranchModalState: NewBranchModalState = {
  isOpen: false,
  repositoryId: null,
  isCreating: false,
  error: null,
};

export const useRepositoryStore = create<RepositoryStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        repositories: {},
        newBranchModal: initialNewBranchModalState,
        activeRepositoryId: null,
        showCommitHistory: false,
        commitHistoryRepositoryId: null,

        // Repository state management
        setRepositoryLoading: (repositoryId: string, isLoading: boolean) =>
          set(state => {
            if (!state.repositories[repositoryId]) {
              state.repositories[repositoryId] = {
                id: repositoryId,
                isLoading: false,
                isSyncing: false,
                error: null,
                lastSyncTime: null,
              };
            }
            state.repositories[repositoryId].isLoading = isLoading;
          }),

        setRepositorySyncing: (repositoryId: string, isSyncing: boolean) =>
          set(state => {
            if (!state.repositories[repositoryId]) {
              state.repositories[repositoryId] = {
                id: repositoryId,
                isLoading: false,
                isSyncing: false,
                error: null,
                lastSyncTime: null,
              };
            }
            state.repositories[repositoryId].isSyncing = isSyncing;
            if (isSyncing) {
              state.repositories[repositoryId].error = null;
            }
          }),

        setRepositoryError: (repositoryId: string, error: string | null) =>
          set(state => {
            if (!state.repositories[repositoryId]) {
              state.repositories[repositoryId] = {
                id: repositoryId,
                isLoading: false,
                isSyncing: false,
                error: null,
                lastSyncTime: null,
              };
            }
            state.repositories[repositoryId].error = error;
            if (error) {
              state.repositories[repositoryId].isSyncing = false;
              state.repositories[repositoryId].isLoading = false;
            }
          }),

        updateLastSyncTime: (repositoryId: string) =>
          set(state => {
            if (!state.repositories[repositoryId]) {
              state.repositories[repositoryId] = {
                id: repositoryId,
                isLoading: false,
                isSyncing: false,
                error: null,
                lastSyncTime: null,
              };
            }
            state.repositories[repositoryId].lastSyncTime = Date.now();
            state.repositories[repositoryId].isSyncing = false;
            state.repositories[repositoryId].error = null;
          }),

        // Sync functionality
        syncRepository: async (repositoryId: string) => {
          const {
            setRepositorySyncing,
            setRepositoryError,
            updateLastSyncTime,
          } = get();

          try {
            setRepositorySyncing(repositoryId, true);

            // Call the repository service to refresh data
            const result = await RepositoryService.refreshRepository(
              repositoryId,
              true
            );

            if (!result.success) {
              throw new Error(result.error || 'Failed to sync repository');
            }

            updateLastSyncTime(repositoryId);

            // Trigger a refetch of repository data (this will be handled by React Query)
            // The UI components using React Query will automatically update
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Unknown sync error';
            setRepositoryError(repositoryId, errorMessage);
          }
        },

        syncAllRepositories: async () => {
          const { repositories, syncRepository } = get();
          const repositoryIds = Object.keys(repositories);

          // Sync repositories in parallel
          await Promise.allSettled(
            repositoryIds.map(repositoryId => syncRepository(repositoryId))
          );
        },

        // New Branch Modal management
        openNewBranchModal: (repositoryId: string) =>
          set(state => {
            state.newBranchModal.isOpen = true;
            state.newBranchModal.repositoryId = repositoryId;
            state.newBranchModal.error = null;
          }),

        closeNewBranchModal: () =>
          set(state => {
            state.newBranchModal = { ...initialNewBranchModalState };
          }),

        setNewBranchCreating: (isCreating: boolean) =>
          set(state => {
            state.newBranchModal.isCreating = isCreating;
          }),

        setNewBranchError: (error: string | null) =>
          set(state => {
            state.newBranchModal.error = error;
            if (error) {
              state.newBranchModal.isCreating = false;
            }
          }),

        createNewBranch: async (
          repositoryId: string,
          branchName: string,
          fromBranch?: string
        ) => {
          const {
            setNewBranchCreating,
            setNewBranchError,
            closeNewBranchModal,
          } = get();

          try {
            setNewBranchCreating(true);
            setNewBranchError(null);

            const result = await RepositoryService.createBranch(
              repositoryId,
              branchName,
              fromBranch
            );

            if (!result.success) {
              throw new Error(result.error || 'Failed to create branch');
            }

            // Close the modal on success
            closeNewBranchModal();

            // Trigger a sync to update the repository data
            get().syncRepository(repositoryId);

            return true;
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : 'Failed to create branch';
            setNewBranchError(errorMessage);
            return false;
          }
        },

        // Commit History management
        openCommitHistory: (repositoryId: string) =>
          set(state => {
            state.showCommitHistory = true;
            state.commitHistoryRepositoryId = repositoryId;
          }),

        closeCommitHistory: () =>
          set(state => {
            state.showCommitHistory = false;
            state.commitHistoryRepositoryId = null;
          }),

        // Repository selection
        setActiveRepository: (repositoryId: string | null) =>
          set(state => {
            state.activeRepositoryId = repositoryId;
          }),

        // Utility functions
        initializeRepository: (repositoryId: string) =>
          set(state => {
            if (!state.repositories[repositoryId]) {
              state.repositories[repositoryId] = {
                id: repositoryId,
                isLoading: false,
                isSyncing: false,
                error: null,
                lastSyncTime: null,
              };
            }
          }),

        cleanup: () =>
          set(state => {
            state.repositories = {};
            state.newBranchModal = { ...initialNewBranchModalState };
            state.activeRepositoryId = null;
            state.showCommitHistory = false;
            state.commitHistoryRepositoryId = null;
          }),
      })),
      {
        name: 'repository-store',
        // Only persist non-sensitive state
        partialize: state => ({
          activeRepositoryId: state.activeRepositoryId,
          repositories: Object.fromEntries(
            Object.entries(state.repositories).map(([id, repo]) => [
              id,
              {
                ...repo,
                isLoading: false,
                isSyncing: false,
                error: null, // Don't persist errors
              },
            ])
          ),
        }),
      }
    ),
    {
      name: 'repository-store',
    }
  )
);

// Selectors for common use cases
export const useRepositoryState = (repositoryId: string) =>
  useRepositoryStore(state => state.repositories[repositoryId]);

export const useNewBranchModal = () =>
  useRepositoryStore(state => state.newBranchModal);

export const useCommitHistory = () =>
  useRepositoryStore(state => ({
    showCommitHistory: state.showCommitHistory,
    repositoryId: state.commitHistoryRepositoryId,
  }));

export const useActiveRepository = () =>
  useRepositoryStore(state => state.activeRepositoryId);

// Action selectors
export const useRepositoryActions = () => {
  const syncRepository = useRepositoryStore(state => state.syncRepository);
  const syncAllRepositories = useRepositoryStore(
    state => state.syncAllRepositories
  );
  const openNewBranchModal = useRepositoryStore(
    state => state.openNewBranchModal
  );
  const closeNewBranchModal = useRepositoryStore(
    state => state.closeNewBranchModal
  );
  const createNewBranch = useRepositoryStore(state => state.createNewBranch);
  const openCommitHistory = useRepositoryStore(
    state => state.openCommitHistory
  );
  const closeCommitHistory = useRepositoryStore(
    state => state.closeCommitHistory
  );
  const setActiveRepository = useRepositoryStore(
    state => state.setActiveRepository
  );
  const initializeRepository = useRepositoryStore(
    state => state.initializeRepository
  );

  return {
    syncRepository,
    syncAllRepositories,
    openNewBranchModal,
    closeNewBranchModal,
    createNewBranch,
    openCommitHistory,
    closeCommitHistory,
    setActiveRepository,
    initializeRepository,
  };
};
