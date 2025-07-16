/**
 * Local Storage Utilities for PRD Editor
 * 
 * Provides type-safe and robust local storage operations
 * for saving and loading PRD editor data.
 */

export interface PRDEditorSaveData {
  content: string;
  title?: string;
  timestamp: string;
  wordCount: number;
  charCount: number;
  version: string;
}

export interface PRDEditorSessionData {
  cursorPosition?: number;
  scrollPosition?: number;
  selectedText?: string;
  lastAction?: string;
}

const STORAGE_KEYS = {
  CONTENT: 'prd-editor-data',
  SESSION: 'prd-editor-session',
  AUTOSAVE_HISTORY: 'prd-editor-autosave-history'
} as const;

const STORAGE_VERSION = '1.0.0';
const MAX_AUTOSAVE_HISTORY = 10;

/**
 * Save PRD editor data to local storage
 */
export const savePRDData = (data: Omit<PRDEditorSaveData, 'version'>): boolean => {
  try {
    const saveData: PRDEditorSaveData = {
      ...data,
      version: STORAGE_VERSION
    };

    localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(saveData));
    
    // Also save to autosave history
    saveToAutosaveHistory(saveData);
    
    return true;
  } catch (error) {
    console.error('Failed to save PRD data:', error);
    return false;
  }
};

/**
 * Load PRD editor data from local storage
 */
export const loadPRDData = (): PRDEditorSaveData | null => {
  try {
    const savedDataString = localStorage.getItem(STORAGE_KEYS.CONTENT);
    
    if (!savedDataString) {
      return null;
    }

    const savedData: PRDEditorSaveData = JSON.parse(savedDataString);
    
    // Validate data structure
    if (!isValidPRDData(savedData)) {
      console.warn('Invalid PRD data structure, clearing storage');
      clearPRDData();
      return null;
    }

    return savedData;
  } catch (error) {
    console.error('Failed to load PRD data:', error);
    return null;
  }
};

/**
 * Clear all PRD editor data from local storage
 */
export const clearPRDData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.CONTENT);
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    localStorage.removeItem(STORAGE_KEYS.AUTOSAVE_HISTORY);
  } catch (error) {
    console.error('Failed to clear PRD data:', error);
  }
};

/**
 * Save session data (cursor position, scroll, etc.)
 */
export const saveSessionData = (data: PRDEditorSessionData): boolean => {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to save session data:', error);
    return false;
  }
};

/**
 * Load session data
 */
export const loadSessionData = (): PRDEditorSessionData | null => {
  try {
    const sessionDataString = localStorage.getItem(STORAGE_KEYS.SESSION);
    
    if (!sessionDataString) {
      return null;
    }

    return JSON.parse(sessionDataString);
  } catch (error) {
    console.error('Failed to load session data:', error);
    return null;
  }
};

/**
 * Get autosave history
 */
export const getAutosaveHistory = (): PRDEditorSaveData[] => {
  try {
    const historyString = localStorage.getItem(STORAGE_KEYS.AUTOSAVE_HISTORY);
    
    if (!historyString) {
      return [];
    }

    const history = JSON.parse(historyString);
    
    if (!Array.isArray(history)) {
      return [];
    }

    return history.filter(isValidPRDData);
  } catch (error) {
    console.error('Failed to load autosave history:', error);
    return [];
  }
};

/**
 * Restore from autosave history
 */
export const restoreFromHistory = (timestamp: string): PRDEditorSaveData | null => {
  try {
    const history = getAutosaveHistory();
    return history.find(item => item.timestamp === timestamp) || null;
  } catch (error) {
    console.error('Failed to restore from history:', error);
    return null;
  }
};

/**
 * Check if local storage is available
 */
export const isLocalStorageAvailable = (): boolean => {
  try {
    const testKey = 'prd-editor-test';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Get storage usage info
 */
export const getStorageInfo = (): {
  used: number;
  available: number;
  percentage: number;
} => {
  try {
    const used = new Blob([localStorage.getItem(STORAGE_KEYS.CONTENT) || '']).size;
    const available = 5 * 1024 * 1024; // Typical 5MB limit
    const percentage = (used / available) * 100;

    return {
      used,
      available,
      percentage
    };
  } catch (error) {
    return {
      used: 0,
      available: 0,
      percentage: 0
    };
  }
};

/**
 * Private helper functions
 */

const saveToAutosaveHistory = (data: PRDEditorSaveData): void => {
  try {
    const history = getAutosaveHistory();
    
    // Add new entry
    history.unshift(data);
    
    // Keep only the latest entries
    const trimmedHistory = history.slice(0, MAX_AUTOSAVE_HISTORY);
    
    localStorage.setItem(STORAGE_KEYS.AUTOSAVE_HISTORY, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('Failed to save to autosave history:', error);
  }
};

const isValidPRDData = (data: any): data is PRDEditorSaveData => {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.content === 'string' &&
    typeof data.timestamp === 'string' &&
    typeof data.wordCount === 'number' &&
    typeof data.charCount === 'number' &&
    typeof data.version === 'string'
  );
};

export default {
  savePRDData,
  loadPRDData,
  clearPRDData,
  saveSessionData,
  loadSessionData,
  getAutosaveHistory,
  restoreFromHistory,
  isLocalStorageAvailable,
  getStorageInfo
};