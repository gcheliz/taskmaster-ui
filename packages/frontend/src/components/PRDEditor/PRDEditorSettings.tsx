import React, { useState, useEffect } from 'react';
import { getStorageInfo, getAutosaveHistory, restoreFromHistory, clearPRDData } from './utils/localStorage';
import type { PRDEditorSaveData } from './utils/localStorage';

export interface PRDEditorSettingsProps {
  /** Whether the settings panel is open */
  isOpen: boolean;
  /** Callback to close the settings panel */
  onClose: () => void;
  /** Callback when content is restored from history */
  onRestoreContent?: (content: string, title?: string) => void;
  /** Additional CSS class name */
  className?: string;
}

/**
 * PRD Editor Settings Component
 * 
 * Provides settings and management for the PRD editor including:
 * - Auto-save history
 * - Local storage management
 * - Content restoration
 * - Storage usage info
 */
export const PRDEditorSettings: React.FC<PRDEditorSettingsProps> = ({
  isOpen,
  onClose,
  onRestoreContent,
  className = ''
}) => {
  const [autosaveHistory, setAutosaveHistory] = useState<PRDEditorSaveData[]>([]);
  const [storageInfo, setStorageInfo] = useState({ used: 0, available: 0, percentage: 0 });
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<string | null>(null);

  // Load data when settings open
  useEffect(() => {
    if (isOpen) {
      setAutosaveHistory(getAutosaveHistory());
      setStorageInfo(getStorageInfo());
    }
  }, [isOpen]);

  const handleRestoreFromHistory = () => {
    if (!selectedHistoryItem) return;
    
    const historyItem = restoreFromHistory(selectedHistoryItem);
    if (historyItem) {
      onRestoreContent?.(historyItem.content, historyItem.title);
      onClose();
    }
  };

  const handleClearStorage = () => {
    if (confirm('Are you sure you want to clear all saved data? This action cannot be undone.')) {
      clearPRDData();
      setAutosaveHistory([]);
      setStorageInfo({ used: 0, available: 0, percentage: 0 });
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className={`prd-editor-settings ${className}`}>
      <div className="settings-overlay" onClick={onClose}></div>
      <div className="settings-panel">
        <div className="settings-header">
          <h3>PRD Editor Settings</h3>
          <button type="button" onClick={onClose} className="close-button">
            ×
          </button>
        </div>

        <div className="settings-content">
          {/* Storage Info */}
          <div className="settings-section">
            <h4>Storage Usage</h4>
            <div className="storage-info">
              <div className="storage-bar">
                <div 
                  className="storage-used" 
                  style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
                ></div>
              </div>
              <div className="storage-details">
                <span>Used: {formatBytes(storageInfo.used)}</span>
                <span>Available: {formatBytes(storageInfo.available)}</span>
                <span>{storageInfo.percentage.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Auto-save History */}
          <div className="settings-section">
            <h4>Auto-save History</h4>
            {autosaveHistory.length === 0 ? (
              <p className="no-history">No auto-save history found.</p>
            ) : (
              <div className="history-list">
                {autosaveHistory.map((item) => (
                  <div 
                    key={item.timestamp} 
                    className={`history-item ${selectedHistoryItem === item.timestamp ? 'selected' : ''}`}
                    onClick={() => setSelectedHistoryItem(item.timestamp)}
                  >
                    <div className="history-info">
                      <div className="history-title">
                        {item.title || 'Untitled Document'}
                      </div>
                      <div className="history-meta">
                        {formatTimestamp(item.timestamp)} • {item.wordCount} words
                      </div>
                    </div>
                    <div className="history-preview">
                      {item.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {selectedHistoryItem && (
              <div className="history-actions">
                <button 
                  type="button" 
                  onClick={handleRestoreFromHistory}
                  className="restore-button"
                >
                  Restore Selected Version
                </button>
              </div>
            )}
          </div>

          {/* Data Management */}
          <div className="settings-section">
            <h4>Data Management</h4>
            <div className="data-actions">
              <button 
                type="button" 
                onClick={handleClearStorage}
                className="clear-button"
              >
                Clear All Data
              </button>
            </div>
            <p className="warning-text">
              This will permanently delete all saved documents and auto-save history.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .prd-editor-settings {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .settings-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
        }

        .settings-panel {
          position: relative;
          background: white;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .settings-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          border-bottom: 1px solid #e9ecef;
        }

        .settings-header h3 {
          margin: 0;
          color: #1a1a1a;
          font-size: 1.25rem;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6c757d;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }

        .close-button:hover {
          background-color: #f8f9fa;
          color: #495057;
        }

        .settings-content {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
        }

        .settings-section {
          margin-bottom: 24px;
        }

        .settings-section h4 {
          margin: 0 0 12px 0;
          color: #495057;
          font-size: 1rem;
        }

        .storage-info {
          background: #f8f9fa;
          padding: 16px;
          border-radius: 6px;
          border: 1px solid #e9ecef;
        }

        .storage-bar {
          height: 8px;
          background: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .storage-used {
          height: 100%;
          background: #007bff;
          transition: width 0.3s ease;
        }

        .storage-details {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #6c757d;
        }

        .no-history {
          color: #6c757d;
          font-style: italic;
          padding: 16px;
          text-align: center;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .history-list {
          max-height: 300px;
          overflow-y: auto;
          border: 1px solid #e9ecef;
          border-radius: 6px;
        }

        .history-item {
          padding: 12px;
          border-bottom: 1px solid #e9ecef;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .history-item:hover {
          background-color: #f8f9fa;
        }

        .history-item.selected {
          background-color: #e7f3ff;
          border-color: #007bff;
        }

        .history-item:last-child {
          border-bottom: none;
        }

        .history-title {
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 4px;
        }

        .history-meta {
          font-size: 12px;
          color: #6c757d;
          margin-bottom: 8px;
        }

        .history-preview {
          font-size: 14px;
          color: #495057;
          line-height: 1.4;
        }

        .history-actions {
          margin-top: 12px;
          text-align: right;
        }

        .restore-button {
          background: #007bff;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .restore-button:hover {
          background: #0056b3;
        }

        .data-actions {
          margin-bottom: 12px;
        }

        .clear-button {
          background: #dc3545;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .clear-button:hover {
          background: #c82333;
        }

        .warning-text {
          font-size: 12px;
          color: #6c757d;
          margin: 0;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default PRDEditorSettings;