import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import { settingsApi } from '../services/settingsApi';
import type { UserSettings, SettingsCategory } from '../services/settingsApi';

interface SettingsState {
  settings: UserSettings | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  isDirty: boolean; // Has unsaved changes
}

type SettingsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SETTINGS'; payload: UserSettings }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<UserSettings> }
  | { type: 'MARK_DIRTY'; payload: boolean }
  | { type: 'RESET_SETTINGS' };

interface SettingsContextType {
  state: SettingsState;
  // Actions
  loadSettings: () => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  updateCategory: (category: SettingsCategory, data: any) => Promise<void>;
  resetSettings: () => Promise<void>;
  // Utility functions
  getSetting: <T>(key: keyof UserSettings) => T | undefined;
  isLoading: boolean;
  hasError: boolean;
  isDirty: boolean;
}

const initialState: SettingsState = {
  settings: null,
  loading: false,
  error: null,
  lastUpdated: null,
  isDirty: false,
};

function settingsReducer(
  state: SettingsState,
  action: SettingsAction
): SettingsState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };

    case 'SET_SETTINGS':
      return {
        ...state,
        settings: action.payload,
        loading: false,
        error: null,
        lastUpdated: new Date().toISOString(),
        isDirty: false,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: state.settings
          ? { ...state.settings, ...action.payload }
          : null,
        isDirty: true,
      };

    case 'MARK_DIRTY':
      return {
        ...state,
        isDirty: action.payload,
      };

    case 'RESET_SETTINGS':
      return initialState;

    default:
      return state;
  }
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

interface SettingsProviderProps {
  children: ReactNode;
  autoLoad?: boolean;
}

export function SettingsProvider({
  children,
  autoLoad = true,
}: SettingsProviderProps) {
  const [state, dispatch] = useReducer(settingsReducer, initialState);

  // Load settings on mount
  useEffect(() => {
    if (autoLoad) {
      loadSettings();
    }
  }, [autoLoad]);

  const loadSettings = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const settings = await settingsApi.getSettings();
      dispatch({ type: 'SET_SETTINGS', payload: settings });
    } catch (error) {
      console.error('Failed to load settings:', error);
      dispatch({
        type: 'SET_ERROR',
        payload:
          error instanceof Error ? error.message : 'Failed to load settings',
      });
    }
  };

  const updateSettings = async (settings: Partial<UserSettings>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedSettings = await settingsApi.updateSettings(settings);
      dispatch({ type: 'SET_SETTINGS', payload: updatedSettings });
    } catch (error) {
      console.error('Failed to update settings:', error);
      dispatch({
        type: 'SET_ERROR',
        payload:
          error instanceof Error ? error.message : 'Failed to update settings',
      });
      throw error; // Re-throw to allow component-level error handling
    }
  };

  const updateCategory = async (category: SettingsCategory, data: any) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedSettings = await settingsApi.updateCategory(category, data);
      dispatch({ type: 'SET_SETTINGS', payload: updatedSettings });
    } catch (error) {
      console.error(`Failed to update ${category} settings:`, error);
      dispatch({
        type: 'SET_ERROR',
        payload:
          error instanceof Error
            ? error.message
            : `Failed to update ${category} settings`,
      });
      throw error; // Re-throw to allow component-level error handling
    }
  };

  const resetSettings = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const defaultSettings = await settingsApi.resetSettings();
      dispatch({ type: 'SET_SETTINGS', payload: defaultSettings });
    } catch (error) {
      console.error('Failed to reset settings:', error);
      dispatch({
        type: 'SET_ERROR',
        payload:
          error instanceof Error ? error.message : 'Failed to reset settings',
      });
      throw error;
    }
  };

  const getSetting = <T,>(key: keyof UserSettings): T | undefined => {
    return state.settings?.[key] as T;
  };

  const contextValue: SettingsContextType = {
    state,
    loadSettings,
    updateSettings,
    updateCategory,
    resetSettings,
    getSetting,
    isLoading: state.loading,
    hasError: !!state.error,
    isDirty: state.isDirty,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

// Hook for optimistic updates (for better UX)
export function useOptimisticSettings() {
  const { state, updateSettings } = useSettings();
  const [optimisticState, setOptimisticState] =
    React.useState<Partial<UserSettings> | null>(null);

  const updateOptimistic = (updates: Partial<UserSettings>) => {
    setOptimisticState(prev => ({ ...prev, ...updates }));
  };

  const commitOptimistic = async () => {
    if (optimisticState) {
      try {
        await updateSettings(optimisticState);
        setOptimisticState(null);
      } catch (error) {
        // Revert optimistic updates on error
        setOptimisticState(null);
        throw error;
      }
    }
  };

  const revertOptimistic = () => {
    setOptimisticState(null);
  };

  const currentSettings = optimisticState
    ? { ...state.settings, ...optimisticState }
    : state.settings;

  return {
    settings: currentSettings,
    updateOptimistic,
    commitOptimistic,
    revertOptimistic,
    hasOptimisticUpdates: !!optimisticState,
  };
}

export default SettingsContext;
