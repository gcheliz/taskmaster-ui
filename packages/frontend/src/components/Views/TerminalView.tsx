import React, { useState, useCallback } from 'react';
import { TerminalContainer } from '../Terminal/TerminalContainer';
import { useRepository } from '../../contexts/RepositoryContext';
import { useNotification } from '../../contexts/NotificationContext';
import './TerminalView.css';

export interface TerminalViewProps {
  /** Additional CSS class */
  className?: string;
  /** Default repository path */
  defaultRepositoryPath?: string;
  /** Terminal theme */
  theme?: 'dark' | 'light';
  /** Terminal mode */
  mode?: 'embedded' | 'popup' | 'fullscreen';
}

/**
 * Terminal View Component
 * 
 * Provides a terminal interface with repository selection and scoped sessions.
 */
export const TerminalView: React.FC<TerminalViewProps> = ({
  className = '',
  defaultRepositoryPath,
  theme = 'dark',
  mode = 'embedded'
}) => {
  const [selectedRepository, setSelectedRepository] = useState<string | null>(
    defaultRepositoryPath || null
  );
  const [terminalSessions, setTerminalSessions] = useState<Array<{
    id: string;
    repositoryPath: string;
    workingDirectory: string;
    title: string;
    isActive: boolean;
  }>>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const { state } = useRepository();
  const { repositories, isLoading: isLoadingRepositories } = state;
  const { showSuccess, showError } = useNotification();

  const handleRepositorySelect = useCallback((repositoryPath: string) => {
    setSelectedRepository(repositoryPath);
  }, []);

  const handleCreateSession = useCallback(() => {
    if (!selectedRepository) {
      showError('Repository Required', 'Please select a repository before creating a terminal session');
      return;
    }

    const sessionId = `session-${Date.now()}`;
    const newSession = {
      id: sessionId,
      repositoryPath: selectedRepository,
      workingDirectory: selectedRepository,
      title: `Terminal - ${selectedRepository.split('/').pop()}`,
      isActive: true
    };

    setTerminalSessions(prev => [...prev, newSession]);
    setActiveSessionId(sessionId);
    
    showSuccess('Terminal Session Created', `Created terminal session for ${selectedRepository}`);
  }, [selectedRepository, showSuccess, showError]);

  const handleCloseSession = useCallback((sessionId: string) => {
    setTerminalSessions(prev => prev.filter(session => session.id !== sessionId));
    
    if (activeSessionId === sessionId) {
      // Switch to another session if available
      const remainingSessions = terminalSessions.filter(session => session.id !== sessionId);
      setActiveSessionId(remainingSessions.length > 0 ? remainingSessions[0].id : null);
    }
  }, [activeSessionId, terminalSessions]);

  const handleSwitchSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
  }, []);

  const activeSession = terminalSessions.find(session => session.id === activeSessionId);

  return (
    <div className={`terminal-view ${className}`}>
      <div className="terminal-view__header">
        <h2 className="terminal-view__title">Terminal</h2>
        
        <div className="terminal-view__controls">
          <div className="repository-selector">
            <label htmlFor="repository-select">Repository:</label>
            <select 
              id="repository-select"
              value={selectedRepository || ''}
              onChange={(e) => handleRepositorySelect(e.target.value)}
              disabled={isLoadingRepositories}
            >
              <option value="">Select a repository...</option>
              {repositories.map((repo) => (
                <option key={repo.path} value={repo.path}>
                  {repo.name} ({repo.path})
                </option>
              ))}
            </select>
          </div>

          <button 
            className="create-session-button"
            onClick={handleCreateSession}
            disabled={!selectedRepository || isLoadingRepositories}
          >
            New Terminal
          </button>
        </div>
      </div>

      {/* Terminal Session Tabs */}
      {terminalSessions.length > 0 && (
        <div className="terminal-view__tabs">
          {terminalSessions.map((session) => (
            <div
              key={session.id}
              className={`terminal-tab ${session.id === activeSessionId ? 'terminal-tab--active' : ''}`}
              onClick={() => handleSwitchSession(session.id)}
            >
              <span className="terminal-tab__title">{session.title}</span>
              <button
                className="terminal-tab__close"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseSession(session.id);
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Terminal Content */}
      <div className="terminal-view__content">
        {activeSession ? (
          <TerminalContainer
            key={activeSession.id}
            workingDirectory={activeSession.workingDirectory}
            repositoryPath={activeSession.repositoryPath}
            title={activeSession.title}
            theme={theme}
            mode={mode}
            showHeader={false} // We have our own header
            showStatusBar={true}
            onClose={() => handleCloseSession(activeSession.id)}
            autoCreate={true}
            autoConnect={true}
            showNotifications={true}
          />
        ) : (
          <div className="terminal-view__empty">
            <div className="empty-state">
              <div className="empty-state__icon">🖥️</div>
              <h3 className="empty-state__title">No Terminal Sessions</h3>
              <p className="empty-state__description">
                Select a repository and create a new terminal session to get started.
              </p>
              {selectedRepository && (
                <button 
                  className="empty-state__button"
                  onClick={handleCreateSession}
                >
                  Create Terminal Session
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TerminalView;