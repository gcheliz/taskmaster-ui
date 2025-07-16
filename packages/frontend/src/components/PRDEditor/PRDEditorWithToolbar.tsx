import React, { useCallback, useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Bold } from '@tiptap/extension-bold';
import { Italic } from '@tiptap/extension-italic';
import { Underline } from '@tiptap/extension-underline';
import { Heading } from '@tiptap/extension-heading';
import { BulletList } from '@tiptap/extension-bullet-list';
import { OrderedList } from '@tiptap/extension-ordered-list';
import { ListItem } from '@tiptap/extension-list-item';
import { Code } from '@tiptap/extension-code';
import { Blockquote } from '@tiptap/extension-blockquote';
import { PRDToolbar } from './PRDToolbar';
import { savePRDData, loadPRDData, isLocalStorageAvailable } from './utils/localStorage';
import './PRDEditorWithToolbar.css';

export interface PRDEditorWithToolbarProps {
  /** Initial content for the editor */
  initialContent?: string;
  /** Callback fired when content changes */
  onContentChange?: (content: string) => void;
  /** Whether the editor is in read-only mode */
  readOnly?: boolean;
  /** Additional CSS class name */
  className?: string;
  /** Placeholder text when editor is empty */
  placeholder?: string;
  /** Whether to enable auto-save functionality */
  autoSave?: boolean;
  /** Auto-save interval in milliseconds */
  autoSaveInterval?: number;
  /** Callback fired when auto-save occurs */
  onAutoSave?: (content: string) => void;
  /** Whether to show the toolbar */
  showToolbar?: boolean;
  /** Title for the PRD document */
  title?: string;
  /** Callback fired when title changes */
  onTitleChange?: (title: string) => void;
}

/**
 * PRD Editor with Toolbar Component
 * 
 * Complete PRD editing solution with integrated toolbar for formatting controls.
 * Features include:
 * - Full formatting toolbar with all controls
 * - Document title editing
 * - Auto-save functionality
 * - Local storage persistence
 * - Keyboard shortcuts
 * - Status indicators
 * - Responsive design
 */
export const PRDEditorWithToolbar: React.FC<PRDEditorWithToolbarProps> = ({
  initialContent = '',
  onContentChange,
  readOnly = false,
  className = '',
  placeholder = 'Start writing your PRD...',
  autoSave = true,
  autoSaveInterval = 2000,
  onAutoSave,
  showToolbar = true,
  title = '',
  onTitleChange
}) => {
  const [content, setContent] = useState(initialContent);
  const [documentTitle, setDocumentTitle] = useState(title);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  // Initialize TipTap editor with extensions
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable default extensions we're replacing
        bold: false,
        italic: false,
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      // Custom configured extensions
      Bold,
      Italic,
      Underline,
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
        HTMLAttributes: {
          class: 'prd-heading',
        },
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: 'prd-bullet-list',
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'prd-ordered-list',
        },
      }),
      ListItem.configure({
        HTMLAttributes: {
          class: 'prd-list-item',
        },
      }),
      Code.configure({
        HTMLAttributes: {
          class: 'prd-code',
        },
      }),
      Blockquote.configure({
        HTMLAttributes: {
          class: 'prd-blockquote',
        },
      }),
    ],
    content: initialContent,
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: 'prd-editor-content',
        'data-placeholder': placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      
      setContent(html);
      setWordCount(text.split(/\s+/).filter(word => word.length > 0).length);
      setCharCount(text.length);
      
      onContentChange?.(html);
    },
    onCreate: ({ editor }) => {
      // Set initial content if provided
      if (initialContent) {
        editor.commands.setContent(initialContent);
      }
      
      // Initialize word and character counts
      const text = editor.getText();
      setWordCount(text.split(/\s+/).filter(word => word.length > 0).length);
      setCharCount(text.length);
    },
  });

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !editor || readOnly) return;

    const saveTimer = setTimeout(() => {
      handleAutoSave();
    }, autoSaveInterval);

    return () => clearTimeout(saveTimer);
  }, [content, documentTitle, autoSave, autoSaveInterval, editor, readOnly]);

  const handleAutoSave = useCallback(async () => {
    if (!editor || readOnly || !isLocalStorageAvailable()) return;

    setIsSaving(true);
    
    try {
      // Save to local storage using utility function
      const saveSuccess = savePRDData({
        content,
        title: documentTitle,
        timestamp: new Date().toISOString(),
        wordCount,
        charCount
      });
      
      if (!saveSuccess) {
        throw new Error('Failed to save to local storage');
      }
      
      // Call external save callback if provided
      if (onAutoSave) {
        await onAutoSave(content);
      }
      
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
      // Could show a user notification here
    } finally {
      setIsSaving(false);
    }
  }, [editor, content, documentTitle, wordCount, charCount, readOnly, onAutoSave]);

  // Load content from local storage on mount
  useEffect(() => {
    if (!isLocalStorageAvailable() || initialContent || title) return;
    
    const savedData = loadPRDData();
    
    if (savedData) {
      // Load content into editor
      if (savedData.content) {
        editor?.commands.setContent(savedData.content);
        setContent(savedData.content);
      }
      
      // Load title
      if (savedData.title) {
        setDocumentTitle(savedData.title);
      }
      
      // Load metadata
      if (savedData.timestamp) {
        setLastSaved(new Date(savedData.timestamp));
      }
      
      if (savedData.wordCount) {
        setWordCount(savedData.wordCount);
      }
      
      if (savedData.charCount) {
        setCharCount(savedData.charCount);
      }
    }
  }, [editor, initialContent, title]);

  // Handle title changes
  const handleTitleChange = useCallback((newTitle: string) => {
    setDocumentTitle(newTitle);
    onTitleChange?.(newTitle);
  }, [onTitleChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  if (!editor) {
    return (
      <div className={`prd-editor-with-toolbar loading ${className}`}>
        <div className="prd-editor__loading">
          <div className="loading-spinner"></div>
          <span>Loading editor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`prd-editor-with-toolbar ${className} ${readOnly ? 'read-only' : ''}`}>
      {/* Document Header */}
      <div className="prd-editor__header">
        <div className="header-content">
          <input
            type="text"
            value={documentTitle}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Enter PRD title..."
            className="document-title-input"
            disabled={readOnly}
          />
          <div className="header-actions">
            {isSaving && (
              <span className="saving-indicator">
                <div className="saving-spinner"></div>
                Saving...
              </span>
            )}
            {lastSaved && (
              <span className="last-saved">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
            {!readOnly && (
              <button
                type="button"
                onClick={handleAutoSave}
                className="save-button"
                disabled={isSaving}
              >
                Save Now
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      {showToolbar && !readOnly && (
        <PRDToolbar
          editor={editor}
          disabled={isSaving}
        />
      )}

      {/* Editor Content */}
      <div className="prd-editor__content">
        <EditorContent 
          editor={editor}
          className="editor-content"
        />
      </div>

      {/* Status Bar */}
      <div className="prd-editor__status">
        <div className="status-left">
          <span className="word-count">
            {wordCount} words
          </span>
          <span className="char-count">
            {charCount} characters
          </span>
        </div>
        <div className="status-right">
          {!readOnly && (
            <span className="editor-mode">Edit Mode</span>
          )}
          {readOnly && (
            <span className="editor-mode read-only">Read Only</span>
          )}
        </div>
      </div>

      {/* Empty State */}
      {!content && !readOnly && (
        <div className="prd-editor__empty-state">
          <div className="empty-state-content">
            <h3>Start Your PRD</h3>
            <p>Begin writing your Product Requirements Document here.</p>
            <div className="empty-state-tips">
              <h4>Pro Tips:</h4>
              <ul>
                <li>Use <strong>Ctrl+1-6</strong> for headings</li>
                <li>Use <strong>Ctrl+B</strong> for bold text</li>
                <li>Use <strong>Ctrl+I</strong> for italic text</li>
                <li>Use <strong>Ctrl+Shift+8</strong> for bullet lists</li>
                <li>Use <strong>Ctrl+Shift+7</strong> for numbered lists</li>
                <li>Your work is automatically saved</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PRDEditorWithToolbar;