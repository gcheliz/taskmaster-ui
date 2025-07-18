import React from 'react';

export const SimpleRepositoryView: React.FC = () => {
  return (
    <div className="repository-view">
      <div className="view-header">
        <h1>📁 Repository Management</h1>
        <p>Connect and manage your Git repositories</p>
      </div>
      
      <div className="view-content">
        <div className="card">
          <h2>Connected Repositories</h2>
          <div className="repository-list">
            <div className="repo-item">
              <div className="repo-info">
                <h3>taskmaster-ui</h3>
                <p>Main project repository</p>
                <span className="repo-path">/Users/gonzalo/workspace/taskmaster-ui</span>
              </div>
              <div className="repo-stats">
                <span className="stat">15 commits</span>
                <span className="stat">3 branches</span>
                <span className="stat">Active</span>
              </div>
            </div>
            
            <div className="repo-item">
              <div className="repo-info">
                <h3>taskmaster-cli</h3>
                <p>Command line interface</p>
                <span className="repo-path">/Users/gonzalo/workspace/taskmaster-cli</span>
              </div>
              <div className="repo-stats">
                <span className="stat">8 commits</span>
                <span className="stat">2 branches</span>
                <span className="stat">Inactive</span>
              </div>
            </div>
          </div>
          
          <div className="actions">
            <button className="primary-button">+ Add Repository</button>
            <button className="secondary-button">Refresh All</button>
          </div>
        </div>
        
        <div className="card">
          <h2>Quick Actions</h2>
          <div className="action-grid">
            <button className="action-card">
              <div className="action-icon">🔄</div>
              <span>Pull Latest</span>
            </button>
            <button className="action-card">
              <div className="action-icon">🌿</div>
              <span>Switch Branch</span>
            </button>
            <button className="action-card">
              <div className="action-icon">📊</div>
              <span>View Status</span>
            </button>
            <button className="action-card">
              <div className="action-icon">📝</div>
              <span>Commit Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleRepositoryView;