import React, { useState, useEffect } from 'react';
import { PRDEditorWithToolbar } from './PRDEditorWithToolbar';
import { PRDAnalysisPanel } from './PRDAnalysisPanel';
import { usePRDDocument } from './hooks/usePRDDocument';
import type { PRDDocument } from './services/prdApi';
import type { PRDAnalysisResult } from '../../services/api';

export interface PRDDocumentManagerProps {
  /** Initial document ID to load */
  initialDocumentId?: string;
  /** Whether to enable auto-save to backend */
  enableBackendAutoSave?: boolean;
  /** Auto-save interval in milliseconds */
  autoSaveInterval?: number;
  /** Additional CSS class name */
  className?: string;
  /** Callback when document operations complete */
  onOperationComplete?: (operation: string, success: boolean, data?: any) => void;
  /** Callback when PRD analysis completes */
  onAnalysisComplete?: (result: PRDAnalysisResult) => void;
  /** Whether to show analysis panel */
  showAnalysisPanel?: boolean;
  /** Initial analysis panel visibility */
  initialAnalysisPanelVisible?: boolean;
  /** Whether to show analysis panel in compact mode */
  compactAnalysisPanel?: boolean;
  /** Callback when task is selected from analysis */
  onTaskSelect?: (taskIndex: number, task: any) => void;
  /** Callback when dependency is selected from analysis */
  onDependencySelect?: (dependency: any) => void;
}

/**
 * PRD Document Manager Component
 * 
 * Provides a complete document management interface with:
 * - Document listing and selection
 * - Create, update, delete operations
 * - Backend API integration
 * - Auto-save functionality
 * - Document export capabilities
 */
export const PRDDocumentManager: React.FC<PRDDocumentManagerProps> = ({
  initialDocumentId,
  enableBackendAutoSave = true,
  autoSaveInterval = 5000,
  className = '',
  onOperationComplete,
  onAnalysisComplete,
  showAnalysisPanel = true,
  initialAnalysisPanelVisible = false,
  compactAnalysisPanel = false,
  onTaskSelect,
  onDependencySelect
}) => {
  const [showDocumentList, setShowDocumentList] = useState(false);
  const [currentContent, setCurrentContent] = useState('');
  const [currentTitle, setCurrentTitle] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [analysisPanelVisible, setAnalysisPanelVisible] = useState(initialAnalysisPanelVisible);

  const {
    document,
    documents,
    loading,
    saving,
    error,
    apiHealthy,
    lastSaved,
    saveDocument,
    updateDocument,
    loadDocument,
    deleteDocument,
    listDocuments,
    clearDocument,
    clearError,
    // checkHealth,
    startAutoSave,
    // stopAutoSave,
    saveNow,
  } = usePRDDocument({
    autoSaveInterval,
    enableAutoSave: enableBackendAutoSave,
    onOperationComplete: (operation, success, data) => {
      onOperationComplete?.(operation, success, data);
      
      // Show notification
      if (success) {
        setNotification({ type: 'success', message: `Document ${operation} successful` });
      } else {
        setNotification({ type: 'error', message: `Document ${operation} failed: ${data}` });
      }
      
      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    },
    onError: (error) => {
      setNotification({ type: 'error', message: error });
      setTimeout(() => setNotification(null), 3000);
    }
  });

  // Load initial document
  useEffect(() => {
    if (initialDocumentId) {
      loadDocument(initialDocumentId);
    }
  }, [initialDocumentId, loadDocument]);

  // Load document list when panel opens
  useEffect(() => {
    if (showDocumentList) {
      listDocuments();
    }
  }, [showDocumentList, listDocuments]);

  // Update current content when document changes
  useEffect(() => {
    if (document) {
      setCurrentContent(document.content);
      setCurrentTitle(document.title);
    }
  }, [document]);

  // Handle content changes
  const handleContentChange = (content: string) => {
    setCurrentContent(content);
    
    if (enableBackendAutoSave && document) {
      // Start auto-save timer for backend
      startAutoSave(content, currentTitle);
    }
  };

  // Handle title changes
  const handleTitleChange = (title: string) => {
    setCurrentTitle(title);
    
    if (enableBackendAutoSave && document) {
      // Start auto-save timer for backend
      startAutoSave(currentContent, title);
    }
  };

  // Handle manual save
  const handleSave = async () => {
    if (document) {
      await updateDocument(document.id, {
        content: currentContent,
        title: currentTitle,
        wordCount: currentContent.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length,
        charCount: currentContent.replace(/<[^>]*>/g, '').length,
      });
    } else {
      await saveDocument({
        title: currentTitle || 'Untitled Document',
        content: currentContent,
        wordCount: currentContent.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length,
        charCount: currentContent.replace(/<[^>]*>/g, '').length,
      });
    }
  };

  // Handle new document
  const handleNewDocument = () => {
    clearDocument();
    setCurrentContent('');
    setCurrentTitle('');
    setShowDocumentList(false);
  };

  // Handle document selection
  const handleDocumentSelect = async (doc: PRDDocument) => {
    await loadDocument(doc.id);
    setShowDocumentList(false);
  };

  // Handle document deletion
  const handleDeleteDocument = async (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      const success = await deleteDocument(id);
      if (success) {
        await listDocuments(); // Refresh list
        if (document?.id === id) {
          handleNewDocument(); // Clear current document if it was deleted
        }
      }
    }
  };

  // Auto-save callback for local storage
  const handleAutoSave = async (content: string) => {
    if (enableBackendAutoSave && document) {
      await saveNow(content, currentTitle);
    }
  };

  // Analysis handlers
  const handleAnalysisComplete = (result: PRDAnalysisResult) => {
    setNotification({
      type: 'success',
      message: `Analysis complete! Found ${result.analysis.taskCount} tasks with ${result.analysis.complexityScore}% complexity.`
    });
    setTimeout(() => setNotification(null), 5000);
    onAnalysisComplete?.(result);
  };

  const handleAnalysisPanelVisibilityChange = (isVisible: boolean) => {
    setAnalysisPanelVisible(isVisible);
  };

  const handleToggleAnalysisPanel = () => {
    setAnalysisPanelVisible(!analysisPanelVisible);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={`prd-document-manager ${className}`}>
      {/* Toolbar */}
      <div className="document-toolbar">
        <div className="toolbar-left">
          <button 
            type="button" 
            onClick={handleNewDocument}
            className="toolbar-button"
            title="New Document"
          >
            📄 New
          </button>
          <button 
            type="button" 
            onClick={() => setShowDocumentList(!showDocumentList)}
            className="toolbar-button"
            title="Open Document"
          >
            📁 Open
          </button>
          <button 
            type="button" 
            onClick={handleSave}
            className="toolbar-button"
            disabled={saving}
            title="Save Document"
          >
            💾 {saving ? 'Saving...' : 'Save'}
          </button>
          {showAnalysisPanel && (
            <button
              type="button"
              onClick={handleToggleAnalysisPanel}
              className={`toolbar-button analysis-toggle ${analysisPanelVisible ? 'active' : ''}`}
              title={analysisPanelVisible ? 'Hide Analysis Panel' : 'Show Analysis Panel'}
            >
              🔍 {analysisPanelVisible ? 'Hide Analysis' : 'Show Analysis'}
            </button>
          )}
        </div>
        
        <div className="toolbar-right">
          <div className="status-indicators">
            <span className={`api-status ${apiHealthy ? 'healthy' : 'unhealthy'}`}>
              {apiHealthy ? '🟢 API Connected' : '🔴 API Disconnected'}
            </span>
            {lastSaved && (
              <span className="last-saved">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Document List Panel */}
      {showDocumentList && (
        <div className="document-list-panel">
          <div className="panel-header">
            <h3>Documents</h3>
            <button 
              type="button" 
              onClick={() => setShowDocumentList(false)}
              className="close-button"
            >
              ×
            </button>
          </div>
          
          <div className="panel-content">
            {loading ? (
              <div className="loading">Loading documents...</div>
            ) : documents.length === 0 ? (
              <div className="empty-state">No documents found</div>
            ) : (
              <div className="document-list">
                {documents.map((doc) => (
                  <div 
                    key={doc.id} 
                    className={`document-item ${document?.id === doc.id ? 'active' : ''}`}
                  >
                    <div 
                      className="document-info"
                      onClick={() => handleDocumentSelect(doc)}
                    >
                      <div className="document-title">{doc.title}</div>
                      <div className="document-meta">
                        {formatDate(doc.updatedAt)} • {doc.wordCount} words
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDocument(doc.id);
                      }}
                      className="delete-button"
                      title="Delete Document"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="main-content">
        {/* Editor */}
        <div className="editor-container">
          <PRDEditorWithToolbar
            initialContent={currentContent}
            title={currentTitle}
            onContentChange={handleContentChange}
            onTitleChange={handleTitleChange}
            onAutoSave={handleAutoSave}
            autoSave={true}
            autoSaveInterval={2000} // Local auto-save interval
            placeholder="Start writing your PRD document..."
          />
        </div>

        {/* Analysis Panel */}
        {showAnalysisPanel && (
          <div className="analysis-panel-container">
            <PRDAnalysisPanel
              content={currentContent}
              isVisible={analysisPanelVisible}
              compact={compactAnalysisPanel}
              onAnalysisComplete={handleAnalysisComplete}
              onTaskSelect={onTaskSelect}
              onDependencySelect={onDependencySelect}
              onVisibilityChange={handleAnalysisPanelVisibilityChange}
            />
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button type="button" onClick={clearError}>×</button>
        </div>
      )}

      <style>{`
        .prd-document-manager {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: #f8f9fa;
        }

        .document-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: white;
          border-bottom: 1px solid #e9ecef;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .toolbar-left {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .analysis-toggle {
          margin-left: 8px;
          padding-left: 8px;
          border-left: 1px solid #e9ecef;
        }

        .analysis-toggle.active {
          background: #007bff;
          color: white;
          border-color: #007bff;
        }

        .analysis-toggle.active:hover {
          background: #0056b3;
          border-color: #0056b3;
        }

        .toolbar-button {
          padding: 8px 12px;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .toolbar-button:hover:not(:disabled) {
          background: #f8f9fa;
          border-color: #adb5bd;
        }

        .toolbar-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .toolbar-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .status-indicators {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 12px;
        }

        .api-status.healthy {
          color: #28a745;
        }

        .api-status.unhealthy {
          color: #dc3545;
        }

        .last-saved {
          color: #6c757d;
        }

        .notification {
          padding: 8px 16px;
          margin: 0;
          font-size: 14px;
          text-align: center;
        }

        .notification.success {
          background: #d4edda;
          color: #155724;
          border-bottom: 1px solid #c3e6cb;
        }

        .notification.error {
          background: #f8d7da;
          color: #721c24;
          border-bottom: 1px solid #f5c6cb;
        }

        .document-list-panel {
          position: absolute;
          top: 60px;
          left: 16px;
          width: 400px;
          max-height: 500px;
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          overflow: hidden;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid #e9ecef;
        }

        .panel-header h3 {
          margin: 0;
          color: #1a1a1a;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #6c757d;
          padding: 4px;
        }

        .close-button:hover {
          color: #495057;
        }

        .panel-content {
          max-height: 400px;
          overflow-y: auto;
        }

        .loading, .empty-state {
          padding: 40px;
          text-align: center;
          color: #6c757d;
        }

        .document-list {
          padding: 8px;
        }

        .document-item {
          display: flex;
          align-items: center;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .document-item:hover {
          background: #f8f9fa;
        }

        .document-item.active {
          background: #e7f3ff;
          border: 1px solid #007bff;
        }

        .document-info {
          flex: 1;
        }

        .document-title {
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 4px;
        }

        .document-meta {
          font-size: 12px;
          color: #6c757d;
        }

        .delete-button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          font-size: 14px;
          opacity: 0.5;
          transition: opacity 0.2s;
        }

        .delete-button:hover {
          opacity: 1;
        }

        .main-content {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        .editor-container {
          flex: 1;
          padding: 16px;
          overflow: hidden;
          min-width: 0;
        }

        .analysis-panel-container {
          width: 400px;
          border-left: 1px solid #e9ecef;
          background: #f8f9fa;
          overflow: hidden;
        }

        .error-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #f8d7da;
          color: #721c24;
          border-bottom: 1px solid #f5c6cb;
        }

        .error-banner button {
          background: none;
          border: none;
          color: #721c24;
          cursor: pointer;
          font-size: 16px;
        }

        @media (max-width: 768px) {
          .document-toolbar {
            flex-direction: column;
            gap: 8px;
            padding: 8px 12px;
          }

          .toolbar-left {
            order: 2;
          }

          .toolbar-right {
            order: 1;
          }

          .document-list-panel {
            left: 8px;
            right: 8px;
            width: auto;
          }

          .main-content {
            flex-direction: column;
          }

          .editor-container {
            padding: 8px;
          }

          .analysis-panel-container {
            width: 100%;
            border-left: none;
            border-top: 1px solid #e9ecef;
            max-height: 400px;
          }
        }
      `}</style>
    </div>
  );
};

export default PRDDocumentManager;