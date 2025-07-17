import React, { useState, useEffect, useRef } from 'react';
import { RepositoryService } from '../../services/repositoryService';
import { validateProjectName } from '../../utils/security';
import './CreateProjectModal.css';

export interface Repository {
  id: string;
  name: string;
  path: string;
}

export interface CreateProjectModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should be closed */
  onClose: () => void;
  /** Callback when project creation is requested */
  onCreateProject: (repositoryId: string, projectName: string) => Promise<void>;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Create Project Modal Component
 * 
 * Provides a modal interface for creating new TaskMaster projects.
 * Includes repository selection and project name validation.
 */
export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
  className = '',
}) => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepositoryId, setSelectedRepositoryId] = useState<string>('');
  const [projectName, setProjectName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    repositoryId?: string;
    projectName?: string;
  }>({});

  // Refs for focus management
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  const lastFocusableRef = useRef<HTMLButtonElement>(null);

  // Fetch repositories when modal opens
  useEffect(() => {
    if (isOpen) {
      loadRepositories();
      // Reset form state
      setSelectedRepositoryId('');
      setProjectName('');
      setError(null);
      setValidationErrors({});
      
      // Focus management
      setTimeout(() => {
        if (firstFocusableRef.current) {
          firstFocusableRef.current.focus();
        }
      }, 0);
    }
  }, [isOpen]);

  // Keyboard event handler for focus trapping
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'Escape') {
      handleClose();
      return;
    }

    if (e.key === 'Tab') {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
      );

      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        // Shift + Tab (backward)
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab (forward)
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  const loadRepositories = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await RepositoryService.getRepositories();
      if (response.success && response.data) {
        setRepositories(response.data);
      } else {
        setError(response.error || 'Failed to load repositories');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load repositories');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};

    // Validate repository selection
    if (!selectedRepositoryId) {
      errors.repositoryId = 'Please select a repository';
    }

    // Validate project name using security utility
    const nameValidation = validateProjectName(projectName);
    if (!nameValidation.isValid) {
      errors.projectName = nameValidation.error || 'Invalid project name';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // Get sanitized project name
      const nameValidation = validateProjectName(projectName);
      const sanitizedProjectName = nameValidation.sanitizedValue || projectName.trim();
      
      await onCreateProject(selectedRepositoryId, sanitizedProjectName);
      // Close modal on success - parent component will handle success feedback
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const getSelectedRepository = (): Repository | undefined => {
    return repositories.find(repo => repo.id === selectedRepositoryId);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className={`create-project-modal ${className}`} 
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="create-project-modal__content" ref={modalRef}>
        <div className="create-project-modal__header">
          <h2 id="modal-title" className="modal-title">Create New Project</h2>
          <button
            ref={firstFocusableRef}
            className="modal-close-button"
            onClick={handleClose}
            disabled={isCreating}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="create-project-modal__body">
          {error && (
            <div className="error-banner">
              <span className="error-icon">⚠️</span>
              <span className="error-message">{error}</span>
              <button 
                className="error-dismiss"
                onClick={() => setError(null)}
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="project-form">
            {/* Repository Selection */}
            <div className="form-group">
              <label htmlFor="repository-select" className="form-label">
                Repository *
              </label>
              {isLoading ? (
                <div className="repository-loading">
                  <span className="loading-spinner">⏳</span>
                  <span>Loading repositories...</span>
                </div>
              ) : repositories.length === 0 ? (
                <div className="repository-empty">
                  <span className="empty-icon">📁</span>
                  <span>No repositories connected</span>
                  <button 
                    type="button" 
                    className="link-button"
                    onClick={loadRepositories}
                  >
                    Refresh
                  </button>
                </div>
              ) : (
                <select
                  id="repository-select"
                  value={selectedRepositoryId}
                  onChange={(e) => setSelectedRepositoryId(e.target.value)}
                  className={`form-select ${validationErrors.repositoryId ? 'error' : ''}`}
                  disabled={isCreating}
                  data-testid="repository-select"
                >
                  <option value="">Select a repository...</option>
                  {repositories.map(repo => (
                    <option key={repo.id} value={repo.id}>
                      {repo.name} ({repo.path})
                    </option>
                  ))}
                </select>
              )}
              {validationErrors.repositoryId && (
                <span className="form-error">{validationErrors.repositoryId}</span>
              )}
              {selectedRepositoryId && (
                <div className="selected-repository-info">
                  <span className="info-icon">📂</span>
                  <span className="repository-path">{getSelectedRepository()?.path}</span>
                </div>
              )}
            </div>

            {/* Project Name */}
            <div className="form-group">
              <label htmlFor="project-name" className="form-label">
                Project Name *
              </label>
              <input
                id="project-name"
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className={`form-input ${validationErrors.projectName ? 'error' : ''}`}
                placeholder="Enter project name..."
                disabled={isCreating}
                maxLength={50}
                autoComplete="off"
                data-testid="project-name-input"
              />
              {validationErrors.projectName && (
                <span className="form-error">{validationErrors.projectName}</span>
              )}
              <div className="form-help">
                Project names can contain letters, numbers, spaces, hyphens, and underscores.
              </div>
            </div>

            {/* Preview */}
            {selectedRepositoryId && projectName.trim() && !validationErrors.projectName && (
              <div className="project-preview">
                <h4 className="preview-title">Project Preview</h4>
                <div className="preview-content">
                  <div className="preview-item">
                    <span className="preview-label">Repository:</span>
                    <span className="preview-value">{getSelectedRepository()?.name}</span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-label">Project Name:</span>
                    <span className="preview-value">{projectName.trim()}</span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-label">Will create:</span>
                    <span className="preview-value">{getSelectedRepository()?.path}/.taskmaster/</span>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="create-project-modal__footer">
          <button
            type="button"
            className="button button--secondary"
            onClick={handleClose}
            disabled={isCreating}
          >
            Cancel
          </button>
          <button
            ref={lastFocusableRef}
            type="submit"
            className="button button--primary"
            onClick={handleSubmit}
            disabled={isCreating || repositories.length === 0 || !selectedRepositoryId || !projectName.trim()}
            data-testid="create-project-submit"
          >
            {isCreating ? (
              <>
                <span className="button-spinner">⏳</span>
                Creating...
              </>
            ) : (
              'Create Project'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;