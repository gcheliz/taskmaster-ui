import React from 'react';
import { Button } from '../ui/atoms/Button';
import { Icon } from '../ui/atoms/Icon';
import { Spinner } from '../ui/atoms/Spinner';
import { useCommandExecution } from '../../hooks/useCommandExecution';

export interface CommandPresetButtonProps {
  presetName: string;
  label?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?:
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'link'
    | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon';
  workingDirectory?: string;
  repositoryPath?: string;
  disabled?: boolean;
  confirmationMessage?: string;
  className?: string;
  onExecutionStart?: () => void;
  onExecutionComplete?: (success: boolean, results?: any) => void;
}

export const CommandPresetButton: React.FC<CommandPresetButtonProps> = ({
  presetName,
  label,
  description,
  icon: IconComponent,
  variant = 'outline',
  size = 'md',
  workingDirectory,
  repositoryPath,
  disabled = false,
  confirmationMessage,
  className,
  onExecutionStart,
  onExecutionComplete,
}) => {
  const { state, executePreset } = useCommandExecution();

  const handleClick = async () => {
    // Show confirmation if required
    if (confirmationMessage) {
      const confirmed = window.confirm(confirmationMessage);
      if (!confirmed) {
        return;
      }
    }

    onExecutionStart?.();

    try {
      await executePreset(presetName, workingDirectory, repositoryPath);
      onExecutionComplete?.(state.result?.success || false, state.result);
    } catch (error) {
      onExecutionComplete?.(false, error);
    }
  };

  const isDisabled = disabled || state.isExecuting;
  const displayLabel = label || presetName;

  return (
    <Button
      variant={variant}
      size={size}
      disabled={isDisabled}
      onClick={handleClick}
      className={className}
      title={description || `Execute preset: ${presetName}`}
      leftIcon={
        state.isExecuting ? (
          <Spinner size="sm" />
        ) : (
          IconComponent && <Icon icon={IconComponent} size="sm" />
        )
      }
    >
      {state.isExecuting ? 'Executing...' : displayLabel}
    </Button>
  );
};
