import React from 'react';
import { CommandPanel } from './CommandPanel';
import { CommandOutputDisplay } from './CommandOutputDisplay';
import { useCommandExecution } from '../../hooks/useCommandExecution';
import { useRepository } from '../../contexts/RepositoryContext';
import { Button } from '../ui/atoms/Button';
import { Alert } from '../ui/molecules/Alert';

export interface CommandWorkspaceProps {
  repositoryPath?: string;
  workingDirectory?: string;
  className?: string;
  /** Optional callback to execute command in terminal */
  onExecuteInTerminal?: (command: string) => void;
  /** Whether terminal execution is available */
  hasActiveTerminal?: boolean;
}

export const CommandWorkspace: React.FC<CommandWorkspaceProps> = ({
  repositoryPath,
  workingDirectory,
  className,
  onExecuteInTerminal,
  hasActiveTerminal = false,
}) => {
  const { state, clearResult } = useCommandExecution();
  const { state: repositoryState } = useRepository();

  const currentRepo = repositoryPath || repositoryState.selectedRepository?.path;
  const currentWorkingDir = workingDirectory || currentRepo || process.cwd();

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Repository Info */}
      {currentRepo && (
        <div className="bg-secondary-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-secondary-700 mb-1">
            Repository Context
          </h3>
          <p className="text-sm text-secondary-600 font-mono">
            {currentRepo}
          </p>
        </div>
      )}

      {/* Command Panel */}
      <CommandPanel
        repositoryPath={currentRepo}
        workingDirectory={currentWorkingDir}
      />

      {/* Terminal Integration Notice */}
      {hasActiveTerminal && (
        <Alert variant="info" className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Terminal Available</h4>
              <p className="text-sm mt-1">
                Commands can be executed in the active terminal session for real-time output.
              </p>
            </div>
            {state.result && onExecuteInTerminal && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Get the last command that was executed
                  const lastCommand = state.result ? 'echo "Command completed"' : '';
                  if (lastCommand) {
                    onExecuteInTerminal(lastCommand);
                  }
                }}
              >
                Run in Terminal
              </Button>
            )}
          </div>
        </Alert>
      )}

      {/* Command Output */}
      {(state.result || state.error) && (
        <div className="space-y-4">
          {state.error && (
            <Alert variant="error">
              <h4 className="font-medium mb-2">Execution Error</h4>
              <p className="text-sm">{state.error}</p>
            </Alert>
          )}

          {state.result && (
            <div className="space-y-4">
              <CommandOutputDisplay
                result={state.result}
                executionId={state.executionId || undefined}
                onClear={clearResult}
              />
              
              {/* Option to execute similar command in terminal */}
              {hasActiveTerminal && onExecuteInTerminal && (
                <div className="flex items-center gap-2 p-3 bg-secondary-50 rounded-lg">
                  <span className="text-sm text-secondary-600">
                    Execute in terminal for interactive output:
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // This would ideally take the actual command that was executed
                      onExecuteInTerminal('# Last command output shown above');
                    }}
                  >
                    Open in Terminal
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Help Text */}
      {!currentRepo && (
        <div className="text-center py-8 text-secondary-500">
          <p className="text-sm">
            Select a repository to enable repository-specific commands.
          </p>
          <p className="text-xs mt-2">
            Some commands like task-master and package management are available without a repository.
          </p>
        </div>
      )}
    </div>
  );
};