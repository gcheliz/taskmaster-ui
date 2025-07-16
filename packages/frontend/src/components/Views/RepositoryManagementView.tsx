import React, { useState } from 'react';
import './RepositoryManagementView.css';
import { AddRepository } from '../Repository';

export interface RepositoryManagementViewProps {
  className?: string;
}

export const RepositoryManagementView: React.FC<RepositoryManagementViewProps> = ({ 
  className = '' 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRepositoryAdd = async (repositoryPath: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Implement actual API call to validate and add repository
      // This is a placeholder for Task 4.3
      console.log('Adding repository:', repositoryPath);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: Update application state with new repository
      alert(`Repository "${repositoryPath}" connected successfully!`);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect repository');
    } finally {
      setIsLoading(false);
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
        </div>
      </div>
    </div>
  );
};