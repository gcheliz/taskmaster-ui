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
import { savePRDData, loadPRDData, isLocalStorageAvailable } from './utils/localStorage';
import './PRDEditor.css';

export interface PRDEditorProps {
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
}

/**
 * PRD Rich Text Editor Component
 * 
 * A sophisticated rich text editor built on TipTap for creating and editing
 * Product Requirements Documents (PRDs). Features include:
 * - Full formatting toolbar (headings, lists, bold/italic/underline)
 * - Auto-save functionality
 * - Local storage persistence
 * - Keyboard shortcuts
 * - Extensible architecture for custom features
 */
export const PRDEditor: React.FC<PRDEditorProps> = ({
  initialContent = '',
  onContentChange,
  readOnly = false,
  className = '',
  placeholder = 'Start writing your PRD...',
  autoSave = true,
  autoSaveInterval = 2000,
  onAutoSave
}) => {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

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
      setContent(html);
      onContentChange?.(html);
    },
    onCreate: ({ editor }) => {
      // Set initial content if provided
      if (initialContent) {
        editor.commands.setContent(initialContent);
      }
    },
  });

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !editor || readOnly) return;

    const saveTimer = setTimeout(() => {
      handleAutoSave();
    }, autoSaveInterval);

    return () => clearTimeout(saveTimer);
  }, [content, autoSave, autoSaveInterval, editor, readOnly]);

  const handleAutoSave = useCallback(async () => {
    if (!editor || !content || readOnly || !isLocalStorageAvailable()) return;

    setIsSaving(true);
    
    try {
      // Calculate word count for saving
      const text = editor.getText();
      const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
      
      // Save to local storage using utility function
      const saveSuccess = savePRDData({
        content,
        title: '', // Basic editor doesn't have title
        timestamp: new Date().toISOString(),
        wordCount,
        charCount: text.length
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
    } finally {
      setIsSaving(false);
    }
  }, [editor, content, readOnly, onAutoSave]);

  // Load content from local storage on mount
  useEffect(() => {
    if (!isLocalStorageAvailable() || initialContent) return;
    
    const savedData = loadPRDData();
    
    if (savedData && savedData.content) {
      editor?.commands.setContent(savedData.content);
      setContent(savedData.content);
      
      if (savedData.timestamp) {
        setLastSaved(new Date(savedData.timestamp));
      }
    }
  }, [editor, initialContent]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  if (!editor) {
    return (
      <div className={`prd-editor loading ${className}`}>
        <div className="prd-editor__loading">
          <div className="loading-spinner"></div>
          <span>Loading editor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`prd-editor ${className} ${readOnly ? 'read-only' : ''}`}>
      {/* Editor Status Bar */}
      <div className="prd-editor__status">
        <div className="status-left">
          <span className="word-count">
            {editor.storage.characterCount?.words() || 0} words
          </span>
          {lastSaved && (
            <span className="last-saved">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
        <div className="status-right">
          {isSaving && (
            <span className="saving-indicator">
              <div className="saving-spinner"></div>
              Saving...
            </span>
          )}
          {!readOnly && (
            <span className="editor-mode">Edit Mode</span>
          )}
        </div>
      </div>

      {/* Editor Content */}
      <div className="prd-editor__content">
        <EditorContent 
          editor={editor}
          className="editor-content"
        />
      </div>

      {/* Empty State */}
      {!content && !readOnly && (
        <div className="prd-editor__empty-state">
          <div className="empty-state-content">
            <h3>Start Your PRD</h3>
            <p>Begin writing your Product Requirements Document here.</p>
            <div className="empty-state-tips">
              <h4>Tips:</h4>
              <ul>
                <li>Use headings to structure your document</li>
                <li>Create lists for requirements and features</li>
                <li>Bold important terms and concepts</li>
                <li>Your work is automatically saved</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PRDEditor;