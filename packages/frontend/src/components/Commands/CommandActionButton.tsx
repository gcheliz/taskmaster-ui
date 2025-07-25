import React from 'react'
import { Button } from '../ui/atoms/Button'
import { Icon } from '../ui/atoms/Icon'
import { Spinner } from '../ui/atoms/Spinner'
import { useCommandExecution } from '../../hooks/useCommandExecution'
import type { CommandRequest } from '../../services/commandService'

export interface CommandActionButtonProps {
  command: string
  args?: string[]
  label: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon'
  workingDirectory?: string
  repositoryPath?: string
  timeout?: number
  disabled?: boolean
  confirmationMessage?: string
  className?: string
  onExecutionStart?: () => void
  onExecutionComplete?: (success: boolean, result?: any) => void
}

export const CommandActionButton = ({
  command,
  args = [],
  label,
  description,
  icon: IconComponent,
  variant = 'outline',
  size = 'md',
  workingDirectory,
  repositoryPath,
  timeout,
  disabled = false,
  confirmationMessage,
  className,
  onExecutionStart,
  onExecutionComplete,
}: CommandActionButtonProps) => {
  const { state, executeCommand } = useCommandExecution()

  const handleClick = async () => {
    // Show confirmation if required
    if (confirmationMessage) {
      const confirmed = window.confirm(confirmationMessage)
      if (!confirmed) {
        return
      }
    }

    onExecutionStart?.()

    const request: CommandRequest = {
      command,
      args,
      workingDirectory,
      repositoryPath,
      timeout,
    }

    try {
      await executeCommand(request)
      onExecutionComplete?.(state.result?.success || false, state.result)
    } catch (error) {
      onExecutionComplete?.(false, error)
    }
  }

  const isDisabled = disabled || state.isExecuting
  const commandText = `${command} ${args.join(' ')}`.trim()

  return (
    <Button
      variant={variant}
      size={size}
      disabled={isDisabled}
      onClick={handleClick}
      className={className}
      title={description || `Execute: ${commandText}`}
      leftIcon={
        state.isExecuting ? (
          <Spinner size="sm" />
        ) : (
          IconComponent && <Icon icon={IconComponent} size="sm" />
        )
      }
    >
      {state.isExecuting ? 'Executing...' : label}
    </Button>
  )
}
