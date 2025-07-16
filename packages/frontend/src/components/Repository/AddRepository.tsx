import React, { useState } from 'react';
import './AddRepository.css';

export interface AddRepositoryProps {
  onRepositoryAdd?: (repositoryPath: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
  clearOnSuccess?: boolean;
}

export const AddRepository: React.FC<AddRepositoryProps> = ({
  onRepositoryAdd,
  isLoading = false,
  error = null,
  className = '',
  clearOnSuccess = true
}) => {
  const [repositoryPath, setRepositoryPath] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const validatePath = (path: string): string | null => {
    if (!path.trim()) {
      return 'Repository path is required';
    }
    
    if (path.length < 2) {
      return 'Path is too short';
    }
    
    if (path.length > 500) {
      return 'Path is too long (max 500 characters)';
    }
    
    // Basic validation for absolute path
    if (!path.startsWith('/') && !(/^[A-Za-z]:[\\\/]/.test(path))) {
      return 'Please provide an absolute path (e.g., /Users/john/my-repo or C:\\Users\\john\\my-repo)';
    }
    
    return null;
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPath = event.target.value;
    setRepositoryPath(newPath);
    
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    const pathError = validatePath(repositoryPath);
    if (pathError) {
      setValidationError(pathError);
      return;
    }
    
    // Clear any validation errors and call the callback
    setValidationError(null);
    
    try {
      await onRepositoryAdd?.(repositoryPath.trim());
      
      // Clear form on successful submission if clearOnSuccess is enabled
      if (clearOnSuccess) {
        setRepositoryPath('');
      }
    } catch (error) {
      // Error is handled by the parent component
      console.error('Repository add failed:', error);
    }
  };

  const handleClear = () => {
    setRepositoryPath('');
    setValidationError(null);
  };

  const currentError = validationError || error;

  return (
    <div className={`add-repository ${className}`.trim()}>
      <div className="add-repository-header">
        <h2>Add Repository</h2>
        <p className="add-repository-description">
          Connect a local Git repository by providing its absolute path.
        </p>
      </div>

      <form className="add-repository-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="repository-path" className="form-label">
            Repository Path
          </label>
          <div className="input-group">
            <input
              id="repository-path"
              type="text"
              className={`form-input ${currentError ? 'error' : ''}`}
              value={repositoryPath}
              onChange={handleInputChange}
              placeholder="/Users/john/my-project or C:\Users\john\my-project"
              disabled={isLoading}
              aria-describedby={currentError ? "path-error" : undefined}
              aria-invalid={!!currentError}
            />
            {repositoryPath && (
              <button
                type="button"
                className="clear-button"
                onClick={handleClear}
                disabled={isLoading}
                aria-label="Clear path"
              >
                ×
              </button>
            )}
          </div>
          
          {currentError && (
            <div id="path-error" className="error-message" role="alert">
              {currentError}
            </div>
          )}
          
          <div className="input-hint">
            <strong>Examples:</strong>
            <ul>
              <li>macOS/Linux: <code>/Users/john/projects/my-app</code></li>
              <li>Windows: <code>C:\Users\john\projects\my-app</code></li>
            </ul>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="connect-button primary-button"
            disabled={isLoading || !repositoryPath.trim()}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner" aria-hidden="true"></span>
                Connecting...
              </>
            ) : (
              'Connect Repository'
            )}
          </button>
          
          <button
            type="button"
            className="clear-form-button secondary-button"
            onClick={handleClear}
            disabled={isLoading}
          >
            Clear
          </button>
        </div>
      </form>

      <div className="repository-requirements">
        <h3>Repository Requirements</h3>
        <ul className="requirements-list">
          <li>Must be a valid Git repository (contains .git directory)</li>
          <li>Directory must be accessible with read/write permissions</li>
          <li>Path must be an absolute path to the repository root</li>
          <li>Repository should not already be connected</li>
        </ul>
      </div>
    </div>
  );
};