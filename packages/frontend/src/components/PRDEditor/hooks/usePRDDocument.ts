import { useState, useCallback, useEffect, useRef } from 'react';
import {
  savePRDDocument,
  updatePRDDocument,
  loadPRDDocument,
  deletePRDDocument,
  listPRDDocuments,
  checkApiHealth,
  PRDAutoSaver,
} from '../services/prdApi';
import type { PRDDocument, CreatePRDRequest, UpdatePRDRequest } from '../services/prdApi';

export interface UsePRDDocumentOptions {
  /** Auto-save interval in milliseconds */
  autoSaveInterval?: number;
  /** Whether to enable auto-save */
  enableAutoSave?: boolean;
  /** Callback when API operations complete */
  onOperationComplete?: (operation: string, success: boolean, data?: any) => void;
  /** Callback when errors occur */
  onError?: (error: string) => void;
}

export interface UsePRDDocumentState {
  /** Current document */
  document: PRDDocument | null;
  /** List of documents */
  documents: PRDDocument[];
  /** Loading state */
  loading: boolean;
  /** Saving state */
  saving: boolean;
  /** Error state */
  error: string | null;
  /** API health status */
  apiHealthy: boolean;
  /** Last save timestamp */
  lastSaved: Date | null;
}

export interface UsePRDDocumentActions {
  /** Save a new document */
  saveDocument: (data: CreatePRDRequest) => Promise<PRDDocument | null>;
  /** Update existing document */
  updateDocument: (id: string, data: UpdatePRDRequest) => Promise<PRDDocument | null>;
  /** Load document by ID */
  loadDocument: (id: string) => Promise<PRDDocument | null>;
  /** Delete document */
  deleteDocument: (id: string) => Promise<boolean>;
  /** List all documents */
  listDocuments: () => Promise<PRDDocument[]>;
  /** Clear current document */
  clearDocument: () => void;
  /** Clear error state */
  clearError: () => void;
  /** Check API health */
  checkHealth: () => Promise<boolean>;
  /** Start auto-save */
  startAutoSave: (content: string, title: string) => void;
  /** Stop auto-save */
  stopAutoSave: () => void;
  /** Save immediately */
  saveNow: (content: string, title: string) => Promise<void>;
}

export const usePRDDocument = (
  options: UsePRDDocumentOptions = {}
): UsePRDDocumentState & UsePRDDocumentActions => {
  const {
    autoSaveInterval = 5000,
    enableAutoSave = true,
    onOperationComplete,
    onError,
  } = options;

  const [state, setState] = useState<UsePRDDocumentState>({
    document: null,
    documents: [],
    loading: false,
    saving: false,
    error: null,
    apiHealthy: false,
    lastSaved: null,
  });

  const autoSaverRef = useRef<PRDAutoSaver | null>(null);

  // Initialize auto-saver
  useEffect(() => {
    if (enableAutoSave) {
      autoSaverRef.current = new PRDAutoSaver(
        autoSaveInterval,
        async (content: string, title: string) => {
          if (state.document) {
            await updateDocument(state.document.id, { content, title });
          } else {
            await saveDocument({ title, content, wordCount: 0, charCount: 0 });
          }
        },
        (error: string) => {
          setState(prev => ({ ...prev, error }));
          onError?.(error);
        }
      );
    }

    return () => {
      autoSaverRef.current?.stop();
    };
  }, [enableAutoSave, autoSaveInterval, state.document, onError]);

  // Check API health on mount
  useEffect(() => {
    checkHealth();
  }, []);

  const updateState = useCallback((updates: Partial<UsePRDDocumentState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const saveDocument = useCallback(async (data: CreatePRDRequest): Promise<PRDDocument | null> => {
    updateState({ saving: true, error: null });
    
    try {
      const response = await savePRDDocument(data);
      
      if (response.success && response.data) {
        updateState({
          document: response.data,
          saving: false,
          lastSaved: new Date(),
        });
        
        onOperationComplete?.('save', true, response.data);
        return response.data;
      } else {
        throw new Error(response.error || 'Save failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Save failed';
      updateState({ saving: false, error: errorMessage });
      onError?.(errorMessage);
      onOperationComplete?.('save', false, errorMessage);
      return null;
    }
  }, [onOperationComplete, onError, updateState]);

  const updateDocument = useCallback(async (id: string, data: UpdatePRDRequest): Promise<PRDDocument | null> => {
    updateState({ saving: true, error: null });
    
    try {
      const response = await updatePRDDocument(id, data);
      
      if (response.success && response.data) {
        updateState({
          document: response.data,
          saving: false,
          lastSaved: new Date(),
        });
        
        onOperationComplete?.('update', true, response.data);
        return response.data;
      } else {
        throw new Error(response.error || 'Update failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Update failed';
      updateState({ saving: false, error: errorMessage });
      onError?.(errorMessage);
      onOperationComplete?.('update', false, errorMessage);
      return null;
    }
  }, [onOperationComplete, onError, updateState]);

  const loadDocument = useCallback(async (id: string): Promise<PRDDocument | null> => {
    updateState({ loading: true, error: null });
    
    try {
      const response = await loadPRDDocument(id);
      
      if (response.success && response.data) {
        updateState({
          document: response.data,
          loading: false,
        });
        
        onOperationComplete?.('load', true, response.data);
        return response.data;
      } else {
        throw new Error(response.error || 'Load failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Load failed';
      updateState({ loading: false, error: errorMessage });
      onError?.(errorMessage);
      onOperationComplete?.('load', false, errorMessage);
      return null;
    }
  }, [onOperationComplete, onError, updateState]);

  const deleteDocument = useCallback(async (id: string): Promise<boolean> => {
    updateState({ loading: true, error: null });
    
    try {
      const response = await deletePRDDocument(id);
      
      if (response.success) {
        updateState({
          document: null,
          loading: false,
        });
        
        onOperationComplete?.('delete', true);
        return true;
      } else {
        throw new Error(response.error || 'Delete failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Delete failed';
      updateState({ loading: false, error: errorMessage });
      onError?.(errorMessage);
      onOperationComplete?.('delete', false, errorMessage);
      return false;
    }
  }, [onOperationComplete, onError, updateState]);

  const listDocuments = useCallback(async (): Promise<PRDDocument[]> => {
    updateState({ loading: true, error: null });
    
    try {
      const response = await listPRDDocuments();
      
      if (response.success && response.data) {
        updateState({
          documents: response.data.documents,
          loading: false,
        });
        
        onOperationComplete?.('list', true, response.data);
        return response.data.documents;
      } else {
        throw new Error(response.error || 'List failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'List failed';
      updateState({ loading: false, error: errorMessage });
      onError?.(errorMessage);
      onOperationComplete?.('list', false, errorMessage);
      return [];
    }
  }, [onOperationComplete, onError, updateState]);

  const clearDocument = useCallback(() => {
    updateState({ document: null, error: null });
    autoSaverRef.current?.stop();
  }, [updateState]);

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  const checkHealth = useCallback(async (): Promise<boolean> => {
    try {
      const response = await checkApiHealth();
      const healthy = response.success;
      updateState({ apiHealthy: healthy });
      return healthy;
    } catch (error) {
      updateState({ apiHealthy: false });
      return false;
    }
  }, [updateState]);

  const startAutoSave = useCallback((content: string, title: string) => {
    if (enableAutoSave && autoSaverRef.current) {
      autoSaverRef.current.start(content, title);
    }
  }, [enableAutoSave]);

  const stopAutoSave = useCallback(() => {
    autoSaverRef.current?.stop();
  }, []);

  const saveNow = useCallback(async (content: string, title: string) => {
    if (autoSaverRef.current) {
      await autoSaverRef.current.saveNow(content, title);
    }
  }, []);

  return {
    ...state,
    saveDocument,
    updateDocument,
    loadDocument,
    deleteDocument,
    listDocuments,
    clearDocument,
    clearError,
    checkHealth,
    startAutoSave,
    stopAutoSave,
    saveNow,
  };
};