import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'
import type { RepositoryInfo, RepositoryValidationResult } from '../services/api'

// Types
export interface Repository extends RepositoryInfo {
  id: string
  connectedAt: string
  validationResult: RepositoryValidationResult
}

export interface RepositoryState {
  repositories: Repository[]
  selectedRepository: Repository | null
  isLoading: boolean
  error: string | null
}

export type RepositoryAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_REPOSITORY'; payload: Repository }
  | { type: 'REMOVE_REPOSITORY'; payload: string }
  | { type: 'SELECT_REPOSITORY'; payload: Repository | null }
  | {
      type: 'UPDATE_REPOSITORY'
      payload: { id: string; updates: Partial<Repository> }
    }
  | { type: 'CLEAR_REPOSITORIES' }
  | { type: 'SET_REPOSITORIES'; payload: Repository[] }

// Initial state
const initialState: RepositoryState = {
  repositories: [],
  selectedRepository: null,
  isLoading: false,
  error: null,
}

// Reducer
function repositoryReducer(state: RepositoryState, action: RepositoryAction): RepositoryState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      }

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      }

    case 'ADD_REPOSITORY': {
      // Check if repository already exists
      const existingIndex = state.repositories.findIndex(
        (repo) => repo.path === action.payload.path
      )

      if (existingIndex >= 0) {
        // Update existing repository
        const updatedRepositories = [...state.repositories]
        updatedRepositories[existingIndex] = action.payload
        return {
          ...state,
          repositories: updatedRepositories,
          error: null,
          isLoading: false,
        }
      }

      // Add new repository
      return {
        ...state,
        repositories: [...state.repositories, action.payload],
        error: null,
        isLoading: false,
      }
    }

    case 'REMOVE_REPOSITORY':
      return {
        ...state,
        repositories: state.repositories.filter((repo) => repo.id !== action.payload),
        selectedRepository:
          state.selectedRepository?.id === action.payload ? null : state.selectedRepository,
      }

    case 'SELECT_REPOSITORY':
      return {
        ...state,
        selectedRepository: action.payload,
      }

    case 'UPDATE_REPOSITORY':
      return {
        ...state,
        repositories: state.repositories.map((repo) =>
          repo.id === action.payload.id ? { ...repo, ...action.payload.updates } : repo
        ),
        selectedRepository:
          state.selectedRepository?.id === action.payload.id
            ? { ...state.selectedRepository, ...action.payload.updates }
            : state.selectedRepository,
      }

    case 'CLEAR_REPOSITORIES':
      return {
        ...state,
        repositories: [],
        selectedRepository: null,
      }

    case 'SET_REPOSITORIES':
      return {
        ...state,
        repositories: action.payload,
      }

    default:
      return state
  }
}

// Context
export interface RepositoryContextType {
  state: RepositoryState
  dispatch: React.Dispatch<RepositoryAction>
  // Convenience methods
  addRepository: (repository: Repository) => void
  removeRepository: (id: string) => void
  selectRepository: (repository: Repository | null) => void
  updateRepository: (id: string, updates: Partial<Repository>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearRepositories: () => void
  getRepositoryById: (id: string) => Repository | undefined
  getRepositoryByPath: (path: string) => Repository | undefined
}

const RepositoryContext = createContext<RepositoryContextType | undefined>(undefined)

// Provider component
export interface RepositoryProviderProps {
  children: ReactNode
  initialRepositories?: Repository[]
}

export const RepositoryProvider = ({
  children,
  initialRepositories = [],
}: RepositoryProviderProps) => {
  const [state, dispatch] = useReducer(repositoryReducer, {
    ...initialState,
    repositories: initialRepositories,
  })

  // Convenience methods
  const addRepository = useCallback((repository: Repository) => {
    dispatch({ type: 'ADD_REPOSITORY', payload: repository })
  }, [])

  const removeRepository = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_REPOSITORY', payload: id })
  }, [])

  const selectRepository = useCallback((repository: Repository | null) => {
    dispatch({ type: 'SELECT_REPOSITORY', payload: repository })
  }, [])

  const updateRepository = useCallback((id: string, updates: Partial<Repository>) => {
    dispatch({ type: 'UPDATE_REPOSITORY', payload: { id, updates } })
  }, [])

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading })
  }, [])

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error })
  }, [])

  const clearRepositories = useCallback(() => {
    dispatch({ type: 'CLEAR_REPOSITORIES' })
  }, [])

  const getRepositoryById = useCallback((id: string): Repository | undefined => {
    return state.repositories.find((repo) => repo.id === id)
  }, [state.repositories])

  const getRepositoryByPath = useCallback((path: string): Repository | undefined => {
    return state.repositories.find((repo) => repo.path === path)
  }, [state.repositories])

  const contextValue: RepositoryContextType = useMemo(() => ({
    state,
    dispatch,
    addRepository,
    removeRepository,
    selectRepository,
    updateRepository,
    setLoading,
    setError,
    clearRepositories,
    getRepositoryById,
    getRepositoryByPath,
  }), [state, dispatch, addRepository, removeRepository, selectRepository, updateRepository, setLoading, setError, clearRepositories, getRepositoryById, getRepositoryByPath])

  return <RepositoryContext.Provider value={contextValue}>{children}</RepositoryContext.Provider>
}

// Hook to use the context
export const useRepository = (): RepositoryContextType => {
  const context = useContext(RepositoryContext)
  if (context === undefined) {
    throw new Error('useRepository must be used within a RepositoryProvider')
  }
  return context
}
