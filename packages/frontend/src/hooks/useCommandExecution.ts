import { useState, useCallback } from 'react'
import {
  commandService,
  type CommandRequest,
  type CommandResult,
  type CommandSequenceRequest,
} from '../services/commandService'
import { useNotification } from '../contexts/NotificationContext'

export interface CommandExecutionState {
  isExecuting: boolean
  result: CommandResult | null
  error: string | null
  executionId: string | null
}

export interface UseCommandExecutionReturn {
  state: CommandExecutionState
  executeCommand: (request: CommandRequest) => Promise<void>
  executeSequence: (request: CommandSequenceRequest) => Promise<void>
  executePreset: (
    presetName: string,
    workingDirectory?: string,
    repositoryPath?: string
  ) => Promise<void>
  clearResult: () => void
}

export function useCommandExecution(): UseCommandExecutionReturn {
  const [state, setState] = useState<CommandExecutionState>({
    isExecuting: false,
    result: null,
    error: null,
    executionId: null,
  })

  const { showSuccess, showError, showInfo } = useNotification()

  const executeCommand = useCallback(
    async (request: CommandRequest) => {
      setState((prev) => ({
        ...prev,
        isExecuting: true,
        error: null,
        result: null,
      }))

      try {
        showInfo(
          'Command Execution',
          `Executing: ${request.command} ${(request.args || []).join(' ')}`
        )

        const response = await commandService.executeCommand(request)

        if (response.success && response.data) {
          setState((prev) => ({
            ...prev,
            isExecuting: false,
            result: response.data!.result,
            executionId: response.data!.executionId,
          }))

          const { result } = response.data
          if (result.success) {
            showSuccess(
              'Command Completed',
              `Command executed successfully in ${result.duration}ms`
            )
          } else {
            showError(
              'Command Failed',
              `Command failed with exit code ${result.exitCode}: ${result.stderr || 'Unknown error'}`
            )
          }
        } else {
          const errorMessage = response.error?.message || 'Unknown error occurred'
          setState((prev) => ({
            ...prev,
            isExecuting: false,
            error: errorMessage,
          }))
          showError('Command Error', errorMessage)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to execute command'
        setState((prev) => ({
          ...prev,
          isExecuting: false,
          error: errorMessage,
        }))
        showError('Command Execution Error', errorMessage)
      }
    },
    [showSuccess, showError, showInfo]
  )

  const executeSequence = useCallback(
    async (request: CommandSequenceRequest) => {
      setState((prev) => ({
        ...prev,
        isExecuting: true,
        error: null,
        result: null,
      }))

      try {
        const commandNames = request.commands
          .map((cmd) => `${cmd.command} ${(cmd.args || []).join(' ')}`)
          .join(', ')

        showInfo('Command Sequence', `Executing sequence: ${commandNames}`)

        const response = await commandService.executeSequence(request)

        if (response.success && response.data) {
          // For sequence, we'll show the result of the last command
          const lastResult = response.data.results[response.data.results.length - 1]

          setState((prev) => ({
            ...prev,
            isExecuting: false,
            result: lastResult,
            executionId: response.data!.executionId,
          }))

          const successCount = response.data.results.filter((r) => r.success).length
          const totalCount = response.data.results.length

          if (successCount === totalCount) {
            showSuccess('Sequence Completed', `All ${totalCount} commands executed successfully`)
          } else {
            showError(
              'Sequence Partially Failed',
              `${successCount}/${totalCount} commands succeeded`
            )
          }
        } else {
          const errorMessage = response.error?.message || 'Unknown error occurred'
          setState((prev) => ({
            ...prev,
            isExecuting: false,
            error: errorMessage,
          }))
          showError('Sequence Error', errorMessage)
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to execute command sequence'
        setState((prev) => ({
          ...prev,
          isExecuting: false,
          error: errorMessage,
        }))
        showError('Sequence Execution Error', errorMessage)
      }
    },
    [showSuccess, showError, showInfo]
  )

  const executePreset = useCallback(
    async (presetName: string, workingDirectory?: string, repositoryPath?: string) => {
      try {
        // First get the presets to find the one we want
        const presetsResponse = await commandService.getCommandPresets()

        if (!presetsResponse.success || !presetsResponse.data) {
          throw new Error('Failed to load command presets')
        }

        const preset = presetsResponse.data.presets.find((p) => p.name === presetName)
        if (!preset) {
          throw new Error(`Preset '${presetName}' not found`)
        }

        // Execute the preset as a sequence
        await executeSequence({
          commands: preset.commands,
          workingDirectory,
          repositoryPath,
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to execute preset'
        setState((prev) => ({
          ...prev,
          isExecuting: false,
          error: errorMessage,
        }))
        showError('Preset Execution Error', errorMessage)
      }
    },
    [executeSequence, showError]
  )

  const clearResult = useCallback(() => {
    setState((prev) => ({
      ...prev,
      result: null,
      error: null,
      executionId: null,
    }))
  }, [])

  return {
    state,
    executeCommand,
    executeSequence,
    executePreset,
    clearResult,
  }
}
