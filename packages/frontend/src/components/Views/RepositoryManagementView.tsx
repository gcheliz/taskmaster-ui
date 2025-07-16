import React from 'react';
import './RepositoryManagementView.css';
import { AddRepository } from '../Repository';
import { useRepositoryOperations } from '../../hooks/useRepositoryOperations';
import { useRepository } from '../../contexts/RepositoryContext';

export interface RepositoryManagementViewProps {
  className?: string;
}

export const RepositoryManagementView: React.FC<RepositoryManagementViewProps> = ({ 
  className = '' 
}) => {
  const { connectRepository, disconnectRepository, isLoading, error } = useRepositoryOperations();
  const { state, selectRepository } = useRepository();

  const handleRepositoryAdd = async (repositoryPath: string) => {
    try {
      await connectRepository(repositoryPath, {
        validateGit: true,
        validateTaskMaster: true,
        selectAfterConnect: true,
      });
      
      // Success - the repository has been added to the global state
      console.log('Repository connected successfully:', repositoryPath);
      
    } catch (err) {
      // Error handling is managed by the useRepositoryOperations hook
      console.error('Failed to connect repository:', err);
    }
  };

  const handleRepositoryDisconnect = async (repositoryId: string) => {
    try {
      await disconnectRepository(repositoryId);
      console.log('Repository disconnected successfully');
    } catch (err) {
      console.error('Failed to disconnect repository:', err);
    }
  };

  return (
    <div className={`repository-management-view ${className}`.trim()}>
      <div className="view-header">
        <h1>Repository Management</h1>
        <p className="view-description">
          Connect and manage your Git repositories for task tracking and automation.
        </p>
      </div>
      
      <div className="view-content">
        <AddRepository 
          onRepositoryAdd={handleRepositoryAdd}
          isLoading={isLoading}
          error={error}
        />
        
        <div className="connected-repositories-section">
          {state.repositories.length > 0 ? (
            <div className="repositories-list">
              <h2>Connected Repositories ({state.repositories.length})</h2>
              <div className="repositories-grid">
                {state.repositories.map((repository) => (
                  <div 
                    key={repository.id} 
                    className={`repository-card ${state.selectedRepository?.id === repository.id ? 'selected' : ''}`}
                  >
                    <div className="repository-header">
                      <h3 className="repository-name">{repository.name}</h3>
                      <div className="repository-status">
                        {repository.isGitRepository && (
                          <span className="status-badge git">Git</span>
                        )}
                        {repository.isTaskMasterProject && (
                          <span className="status-badge taskmaster">TaskMaster</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="repository-details">
                      <p className="repository-path" title={repository.path}>
                        {repository.path}
                      </p>
                      {repository.gitBranch && (
                        <p className="repository-branch">
                          <strong>Branch:</strong> {repository.gitBranch}
                        </p>
                      )}
                      <p className="repository-connected">
                        <strong>Connected:</strong> {new Date(repository.connectedAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="repository-actions">
                      <button 
                        className="select-button"
                        onClick={() => selectRepository(repository)}
                        disabled={isLoading}
                      >
                        {state.selectedRepository?.id === repository.id ? 'Selected' : 'Select'}
                      </button>
                      <button 
                        className="disconnect-button"
                        onClick={() => handleRepositoryDisconnect(repository.id)}
                        disabled={isLoading}
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="placeholder-message">
              <h2>Connected Repositories</h2>
              <p>Your connected repositories will appear here.</p>
              <ul className="feature-list">
                <li>View repository status and commits</li>
                <li>Manage repository settings</li>
                <li>Track repository-linked tasks</li>
                <li>Monitor Git activity</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};