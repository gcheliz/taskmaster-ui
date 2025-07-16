import React from 'react';
import './ProjectList.css';

export interface Project {
  id: string;
  name: string;
  repositoryId: string;
  repositoryName: string;
  repositoryPath: string;
  createdAt: string;
  lastAccessed?: string;
  tasksCount?: number;
  status?: 'active' | 'archived' | 'inactive';
}

export interface ProjectListProps {
  /** Array of projects to display */
  projects: Project[];
  /** Whether the component is in a loading state */
  isLoading?: boolean;
  /** Error message to display */
  error?: string | null;
  /** Additional CSS class name */
  className?: string;
  /** Callback when a project is clicked */
  onProjectClick?: (project: Project) => void;
  /** Callback when create project is clicked */
  onCreateProject?: () => void;
  /** Whether to show the create project button */
  showCreateButton?: boolean;
  /** Empty state message */
  emptyStateMessage?: string;
}

/**
 * Project List Component
 * 
 * Displays a list of TaskMaster projects with:
 * - Project information and status
 * - Repository association
 * - Task counts and last accessed time
 * - Create new project functionality
 */
export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  isLoading = false,
  error = null,
  className = '',
  onProjectClick,
  onCreateProject,
  showCreateButton = true,
  emptyStateMessage = 'No projects found'
}) => {
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return 'Today';
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch {
      return 'Unknown';
    }
  };

  const getStatusIcon = (status?: string): string => {
    switch (status) {
      case 'active':
        return '🟢';
      case 'archived':
        return '📁';
      case 'inactive':
        return '⚪';
      default:
        return '🟡';
    }
  };

  const getStatusLabel = (status?: string): string => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'archived':
        return 'Archived';
      case 'inactive':
        return 'Inactive';
      default:
        return 'Unknown';
    }
  };

  const handleProjectClick = (project: Project) => {
    if (onProjectClick) {
      onProjectClick(project);
    }
  };

  if (isLoading) {
    return (
      <div className={`project-list loading ${className}`}>
        <div className="project-list__header">
          <h3 className="project-list__title">Projects</h3>
          {showCreateButton && (
            <button className="create-project-button" disabled>
              <span className="button-icon">➕</span>
              New Project
            </button>
          )}
        </div>
        <div className="project-list__content">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="project-item__skeleton">
              <div className="skeleton-line skeleton-title"></div>
              <div className="skeleton-line skeleton-subtitle"></div>
              <div className="skeleton-line skeleton-info"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`project-list error ${className}`}>
        <div className="project-list__header">
          <h3 className="project-list__title">Projects</h3>
          {showCreateButton && (
            <button 
              className="create-project-button"
              onClick={onCreateProject}
            >
              <span className="button-icon">➕</span>
              New Project
            </button>
          )}
        </div>
        <div className="project-list__error">
          <span className="error-icon">⚠️</span>
          <span className="error-message">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`project-list ${className}`}>
      <div className="project-list__header">
        <div className="header-info">
          <h3 className="project-list__title">
            Projects {projects.length > 0 && `(${projects.length})`}
          </h3>
          {projects.length > 0 && (
            <div className="project-stats">
              <span className="stat-item">
                {getStatusIcon('active')} {projects.filter(p => p.status === 'active').length} active
              </span>
              <span className="stat-item">
                📊 {projects.reduce((sum, p) => sum + (p.tasksCount || 0), 0)} total tasks
              </span>
            </div>
          )}
        </div>
        {showCreateButton && (
          <button 
            className="create-project-button"
            onClick={onCreateProject}
            title="Create new project"
          >
            <span className="button-icon">➕</span>
            New Project
          </button>
        )}
      </div>

      <div className="project-list__content">
        {projects.length === 0 ? (
          <div className="project-list__empty">
            <div className="empty-icon">📋</div>
            <div className="empty-message">{emptyStateMessage}</div>
            {showCreateButton && (
              <button 
                className="empty-create-button"
                onClick={onCreateProject}
              >
                Create Your First Project
              </button>
            )}
          </div>
        ) : (
          <div className="project-grid">
            {projects.map((project) => (
              <div
                key={project.id}
                className={`project-item ${onProjectClick ? 'clickable' : ''}`}
                onClick={() => handleProjectClick(project)}
                role={onProjectClick ? 'button' : 'article'}
                tabIndex={onProjectClick ? 0 : undefined}
                onKeyDown={(e) => {
                  if (onProjectClick && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleProjectClick(project);
                  }
                }}
              >
                <div className="project-item__header">
                  <div className="project-title-section">
                    <h4 className="project-name">{project.name}</h4>
                    <div className="project-status">
                      <span className="status-icon" title={getStatusLabel(project.status)}>
                        {getStatusIcon(project.status)}
                      </span>
                      <span className="status-label">{getStatusLabel(project.status)}</span>
                    </div>
                  </div>
                </div>

                <div className="project-item__repository">
                  <span className="repository-icon">📁</span>
                  <div className="repository-info">
                    <span className="repository-name">{project.repositoryName}</span>
                    <span className="repository-path">{project.repositoryPath}</span>
                  </div>
                </div>

                <div className="project-item__stats">
                  {project.tasksCount !== undefined && (
                    <div className="stat-badge">
                      <span className="stat-icon">📋</span>
                      <span className="stat-value">{project.tasksCount}</span>
                      <span className="stat-label">tasks</span>
                    </div>
                  )}
                  <div className="stat-badge">
                    <span className="stat-icon">📅</span>
                    <span className="stat-value">{formatDate(project.createdAt)}</span>
                    <span className="stat-label">created</span>
                  </div>
                </div>

                {project.lastAccessed && (
                  <div className="project-item__footer">
                    <span className="last-accessed">
                      Last accessed {formatDate(project.lastAccessed)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectList;