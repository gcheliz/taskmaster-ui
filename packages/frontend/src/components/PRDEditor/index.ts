/**
 * PRD Editor Component Exports
 * 
 * This module provides comprehensive rich text editing capabilities for
 * Product Requirements Documents (PRDs) built on TipTap.
 */

// Main editor components
export { PRDEditor } from './PRDEditor';
export { PRDToolbar } from './PRDToolbar';
export { PRDEditorWithToolbar } from './PRDEditorWithToolbar';
export { PRDDocumentManager } from './PRDDocumentManager';
export { PRDEditorSettings } from './PRDEditorSettings';

// Hooks
export { usePRDDocument } from './hooks/usePRDDocument';

// Services
export * from './services/prdApi';

// Utilities
export * from './utils/localStorage';

// TypeScript interfaces
export type { PRDEditorProps } from './PRDEditor';
export type { PRDToolbarProps } from './PRDToolbar';
export type { PRDEditorWithToolbarProps } from './PRDEditorWithToolbar';
export type { PRDDocumentManagerProps } from './PRDDocumentManager';
export type { PRDEditorSettingsProps } from './PRDEditorSettings';

// Default export for convenience
export { PRDDocumentManager as default } from './PRDDocumentManager';