import React, { useState, useEffect } from 'react';
import { ProjectList } from './ProjectList';
import { CreateProjectModal } from './CreateProjectModal';
import { useProjectOperations } from '../../hooks/useProjectOperations';
import { useRepository } from '../../contexts/RepositoryContext';
import type { Project } from './ProjectList';
import type { ProjectResponse } from '../../services/api';
import './ProjectDashboard.css';

export interface ProjectDashboardProps {
  /** Additional CSS class name */
  className?: string;
  /** Callback when a project is selected */
  onProjectSelect?: (project: Project) => void;
  /** Callback when project creation succeeds */
  onProjectCreated?: (project: Project) => void;
}

/**
 * Project Dashboard Component
 * 
 * Main dashboard for project management that includes:
 * - Project listing and overview
 * - Project creation functionality
 * - Project selection and navigation
 */
export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
  className = '',
  onProjectSelect,
  onProjectCreated
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  
  const { getProjects, createProject, isLoading, error: projectError } = useProjectOperations();
  const { state: repositoryState } = useRepository();

  // Helper function to convert ProjectResponse to Project
  const convertProjectResponseToProject = (projectResponse: ProjectResponse): Project => {
    // Find repository info from context
    const repository = repositoryState.repositories.find(repo => repo.id === projectResponse.repositoryId);
    
    return {
      id: projectResponse.id,
      name: projectResponse.name,
      repositoryId: projectResponse.repositoryId,
      repositoryName: repository?.name || 'Unknown Repository',
      repositoryPath: projectResponse.repositoryPath,
      createdAt: projectResponse.createdAt,
      lastAccessed: undefined, // Not provided by backend yet
      tasksCount: undefined, // Not provided by backend yet
      status: projectResponse.status === 'active' ? 'active' : 'inactive'
    };
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const projectResponses = await getProjects();
      const convertedProjects = projectResponses.map(convertProjectResponseToProject);
      setProjects(convertedProjects);
    } catch (err) {
      console.error('Failed to load projects:', err);
      showNotification('error', 'Failed to load projects');
    }
  };

  const handleCreateProject = async (repositoryId: string, projectName: string): Promise<void> => {
    try {
      const result = await createProject({ repositoryId, projectName });
      
      if (result.success && result.project) {
        const newProject = convertProjectResponseToProject(result.project);
        setProjects(prev => [newProject, ...prev]);
        
        // Show success notification with TaskMaster info if available
        let message = `Project "${projectName}" created successfully!`;
        if (result.taskMasterInfo) {
          message += ` TaskMaster initialized with ${result.taskMasterInfo.taskCount} tasks.`;
        }
        showNotification('success', message);
        
        if (onProjectCreated) {
          onProjectCreated(newProject);
        }
      } else {
        const errorMessage = result.error?.message || 'Failed to create project';
        showNotification('error', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create project';
      showNotification('error', errorMessage);
      throw new Error(errorMessage);
    }
  };

  const handleProjectClick = (project: Project) => {
    if (onProjectSelect) {
      onProjectSelect(project);
    }
  };

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const dismissNotification = () => {
    setNotification(null);
  };

  return (
    <div className={`project-dashboard ${className}`} data-testid="project-dashboard">
      {/* Notification */}
      {notification && (
        <div className={`notification notification--${notification.type}`} data-testid="notification">
          <span className="notification-message" data-testid="notification-message">{notification.message}</span>
          <button 
            className="notification-dismiss"
            onClick={dismissNotification}
            aria-label="Dismiss notification"
            data-testid="notification-dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* Dashboard Header */}
      <div className="project-dashboard__header">
        <div className="header-content">
          <h1 className="dashboard-title">Project Dashboard</h1>
          <p className="dashboard-subtitle">
            Manage your TaskMaster projects and repositories
          </p>
        </div>
        
        {!isLoading && projects.length > 0 && (
          <div className="dashboard-stats">
            <div className="stat-card">
              <span className="stat-value">{projects.length}</span>
              <span className="stat-label">Total Projects</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">
                {projects.filter(p => p.status === 'active').length}
              </span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">
                {projects.reduce((sum, p) => sum + (p.tasksCount || 0), 0)}
              </span>
              <span className="stat-label">Total Tasks</span>
            </div>
          </div>
        )}
      </div>

      {/* Project List */}
      <div className="project-dashboard__content">
        <ProjectList
          projects={projects}
          isLoading={isLoading}
          error={projectError}
          onProjectClick={handleProjectClick}
          onCreateProject={() => setIsCreateModalOpen(true)}
          showCreateButton={true}
          emptyStateMessage="No projects found. Create your first project to get started!"
        />
      </div>

      {/* Quick Actions (when no projects) */}
      {!isLoading && projects.length === 0 && !projectError && (
        <div className="project-dashboard__quick-actions">
          <div className="quick-actions-content">
            <h3 className="quick-actions-title">Get Started</h3>
            <p className="quick-actions-description">
              Create your first TaskMaster project to start organizing and tracking your development tasks.
            </p>
            <div className="quick-actions-steps">
              <div className="step-item">
                <span className="step-number">1</span>
                <div className="step-content">
                  <span className="step-title">Connect Repository</span>
                  <span className="step-description">Add a Git repository to your workspace</span>
                </div>
              </div>
              <div className="step-item">
                <span className="step-number">2</span>
                <div className="step-content">
                  <span className="step-title">Create Project</span>
                  <span className="step-description">Initialize TaskMaster in your repository</span>
                </div>
              </div>
              <div className="step-item">
                <span className="step-number">3</span>
                <div className="step-content">
                  <span className="step-title">Start Managing Tasks</span>
                  <span className="step-description">Create, organize, and track your development tasks</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
};

export default ProjectDashboard;