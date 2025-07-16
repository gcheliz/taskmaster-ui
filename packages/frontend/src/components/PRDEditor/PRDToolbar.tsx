import React from 'react';
import { Editor } from '@tiptap/react';
import './PRDToolbar.css';

export interface PRDToolbarProps {
  /** TipTap editor instance */
  editor: Editor;
  /** Whether the toolbar is disabled */
  disabled?: boolean;
  /** Additional CSS class name */
  className?: string;
}

/**
 * PRD Editor Toolbar Component
 * 
 * Provides formatting controls for the PRD editor including:
 * - Heading levels (H1-H6)
 * - Text formatting (bold, italic, underline)
 * - Lists (bullet and ordered)
 * - Undo/Redo functionality
 */
export const PRDToolbar: React.FC<PRDToolbarProps> = ({
  editor,
  disabled = false,
  className = ''
}) => {
  if (!editor) {
    return null;
  }

  const ToolbarButton: React.FC<{
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
  }> = ({ onClick, isActive = false, disabled = false, title, children }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`toolbar-button ${isActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
    >
      {children}
    </button>
  );

  return (
    <div className={`prd-toolbar ${className} ${disabled ? 'disabled' : ''}`}>
      {/* Undo/Redo */}
      <div className="toolbar-group">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={disabled || !editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          ↶
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={disabled || !editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          ↷
        </ToolbarButton>
      </div>

      <div className="toolbar-divider"></div>

      {/* Headings */}
      <div className="toolbar-group">
        <select
          value={
            editor.isActive('heading', { level: 1 }) ? 'h1' :
            editor.isActive('heading', { level: 2 }) ? 'h2' :
            editor.isActive('heading', { level: 3 }) ? 'h3' :
            editor.isActive('heading', { level: 4 }) ? 'h4' :
            editor.isActive('heading', { level: 5 }) ? 'h5' :
            editor.isActive('heading', { level: 6 }) ? 'h6' :
            'p'
          }
          onChange={(e) => {
            const value = e.target.value;
            if (value === 'p') {
              editor.chain().focus().setParagraph().run();
            } else {
              const level = parseInt(value.replace('h', '')) as 1 | 2 | 3 | 4 | 5 | 6;
              editor.chain().focus().toggleHeading({ level }).run();
            }
          }}
          disabled={disabled}
          className="heading-select"
          title="Text style"
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="h5">Heading 5</option>
          <option value="h6">Heading 6</option>
        </select>
      </div>

      <div className="toolbar-divider"></div>

      {/* Text Formatting */}
      <div className="toolbar-group">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          disabled={disabled}
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          disabled={disabled}
          title="Italic (Ctrl+I)"
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          disabled={disabled}
          title="Underline (Ctrl+U)"
        >
          <u>U</u>
        </ToolbarButton>
      </div>

      <div className="toolbar-divider"></div>

      {/* Lists */}
      <div className="toolbar-group">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          disabled={disabled}
          title="Bullet List"
        >
          • List
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          disabled={disabled}
          title="Numbered List"
        >
          1. List
        </ToolbarButton>
      </div>

      <div className="toolbar-divider"></div>

      {/* Clear Formatting and Code */}
      <div className="toolbar-group">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          disabled={disabled}
          title="Inline Code"
        >
          &lt;/&gt;
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          disabled={disabled}
          title="Blockquote"
        >
          "&nbsp;
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
          disabled={disabled}
          title="Clear Formatting"
        >
          Clear
        </ToolbarButton>
      </div>

      {/* Document Stats */}
      <div className="toolbar-spacer"></div>
      <div className="toolbar-stats">
        <span className="char-count">
          {editor.getText().length} chars
        </span>
      </div>
    </div>
  );
};

export default PRDToolbar;