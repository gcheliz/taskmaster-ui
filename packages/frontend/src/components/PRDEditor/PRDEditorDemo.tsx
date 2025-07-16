import React, { useState } from 'react';
import { PRDEditor, PRDEditorWithToolbar, PRDDocumentManager } from './index';

/**
 * PRD Editor Demo Component
 * 
 * Demonstrates all variations of the PRD Editor components
 * for testing and showcasing capabilities.
 */
export const PRDEditorDemo: React.FC = () => {
  const [content, setContent] = useState('');
  const [activeTab, setActiveTab] = useState<'basic' | 'with-toolbar' | 'document-manager' | 'separate'>('document-manager');

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    console.log('Content changed:', newContent);
  };

  const handleAutoSave = async (content: string) => {
    console.log('Auto-saving content:', content);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const tabStyle = {
    padding: '8px 16px',
    border: '1px solid #dee2e6',
    borderBottom: 'none',
    backgroundColor: '#f8f9fa',
    cursor: 'pointer',
    marginRight: '4px',
    borderRadius: '4px 4px 0 0',
  };

  const activeTabStyle = {
    ...tabStyle,
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #ffffff',
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>PRD Editor Demo</h1>
      
      {/* Tab Navigation */}
      <div style={{ marginBottom: '20px', borderBottom: '1px solid #dee2e6' }}>
        <button
          style={activeTab === 'document-manager' ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab('document-manager')}
        >
          Document Manager (Full System)
        </button>
        <button
          style={activeTab === 'with-toolbar' ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab('with-toolbar')}
        >
          Complete Editor
        </button>
        <button
          style={activeTab === 'basic' ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab('basic')}
        >
          Basic Editor
        </button>
        <button
          style={activeTab === 'separate' ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab('separate')}
        >
          Separate Components
        </button>
      </div>

      {/* Document Manager */}
      {activeTab === 'document-manager' && (
        <div>
          <h2>Complete PRD Document Management System</h2>
          <p>Full document management with backend integration, auto-save, and document operations.</p>
          <div style={{ height: '800px', border: '1px solid #dee2e6', borderRadius: '8px', overflow: 'hidden' }}>
            <PRDDocumentManager
              enableBackendAutoSave={true}
              autoSaveInterval={3000}
              onOperationComplete={(operation, success, data) => {
                console.log(`Operation ${operation}:`, success ? 'Success' : 'Failed', data);
              }}
            />
          </div>
        </div>
      )}

      {/* Complete Editor with Toolbar */}
      {activeTab === 'with-toolbar' && (
        <div>
          <h2>Complete PRD Editor with Toolbar</h2>
          <p>Full-featured editor with integrated toolbar, document title, and auto-save.</p>
          <div style={{ height: '600px', border: '1px solid #dee2e6', borderRadius: '8px' }}>
            <PRDEditorWithToolbar
              initialContent="<h1>Sample PRD</h1><p>This is a sample Product Requirements Document with <strong>bold text</strong> and <em>italic text</em>.</p><ul><li>Feature 1</li><li>Feature 2</li></ul>"
              onContentChange={handleContentChange}
              onAutoSave={handleAutoSave}
              title="My PRD Document"
              placeholder="Start writing your PRD here..."
              autoSave={true}
              autoSaveInterval={2000}
            />
          </div>
        </div>
      )}

      {/* Basic Editor */}
      {activeTab === 'basic' && (
        <div>
          <h2>Basic PRD Editor</h2>
          <p>Simple editor without toolbar - formatting via keyboard shortcuts only.</p>
          <div style={{ height: '400px', border: '1px solid #dee2e6', borderRadius: '8px' }}>
            <PRDEditor
              initialContent="<p>Basic editor example. Use <strong>Ctrl+B</strong> for bold, <em>Ctrl+I</em> for italic.</p>"
              onContentChange={handleContentChange}
              onAutoSave={handleAutoSave}
              placeholder="Type here..."
              autoSave={true}
            />
          </div>
        </div>
      )}

      {/* Separate Components */}
      {activeTab === 'separate' && (
        <div>
          <h2>Separate Editor and Toolbar</h2>
          <p>Demonstration of using editor and toolbar as separate components.</p>
          <div style={{ border: '1px solid #dee2e6', borderRadius: '8px', overflow: 'hidden' }}>
            <PRDEditor
              initialContent="<h2>Separate Components Demo</h2><p>This shows the editor and toolbar as separate components.</p>"
              onContentChange={handleContentChange}
              onAutoSave={handleAutoSave}
              placeholder="Start typing..."
            />
          </div>
        </div>
      )}

      {/* Debug Information */}
      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>Debug Information</h3>
        <div style={{ fontSize: '14px', color: '#6c757d' }}>
          <p><strong>Content Length:</strong> {content.length} characters</p>
          <p><strong>Word Count:</strong> {content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length} words</p>
          <p><strong>Active Tab:</strong> {activeTab}</p>
        </div>
        
        {content && (
          <details style={{ marginTop: '16px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>HTML Content</summary>
            <pre style={{ 
              backgroundColor: '#ffffff', 
              padding: '12px', 
              borderRadius: '4px', 
              overflow: 'auto',
              fontSize: '12px',
              marginTop: '8px'
            }}>
              {content}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default PRDEditorDemo;