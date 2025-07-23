import { apiService } from './api'

export interface CommandRequest {
  command: string
  args?: string[]
  workingDirectory?: string
  repositoryPath?: string
  timeout?: number
}

export interface CommandResult {
  stdout: string
  stderr: string
  exitCode: number | null
  signal: string | null
  success: boolean
  duration: number
}

export interface CommandResponse {
  success: boolean
  data?: {
    result: CommandResult
    executionId: string
  }
  error?: {
    code: string
    message: string
    details?: any
  }
}

export interface CommandSequenceRequest {
  commands: Array<{ command: string; args?: string[] }>
  workingDirectory?: string
  repositoryPath?: string
}

export interface CommandPreset {
  name: string
  description: string
  commands: Array<{ command: string; args?: string[] }>
  requiresRepository: boolean
}

export interface AvailableCommand {
  command: string
  subcommands: string[]
  requiresRepository: boolean
  available: boolean
}

export const commandService = {
  /**
   * Execute a single command
   */
  async executeCommand(request: CommandRequest): Promise<CommandResponse> {
    // Add method to ApiService to handle this, for now using fetch directly
    const response = await fetch('/api/commands/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  },

  /**
   * Execute a sequence of commands
   */
  async executeSequence(request: CommandSequenceRequest): Promise<{
    success: boolean
    data?: {
      results: CommandResult[]
      executionId: string
    }
    error?: {
      code: string
      message: string
      details?: any
    }
  }> {
    const response = await fetch('/api/commands/execute-sequence', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  },

  /**
   * Get available commands
   */
  async getAvailableCommands(repositoryPath?: string): Promise<{
    success: boolean
    data?: {
      commands: AvailableCommand[]
    }
    error?: {
      code: string
      message: string
    }
  }> {
    const params = new URLSearchParams()
    if (repositoryPath) {
      params.append('repositoryPath', repositoryPath)
    }

    const response = await fetch(`/api/commands/available?${params.toString()}`, {
      method: 'GET',
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  },

  /**
   * Get command presets
   */
  async getCommandPresets(): Promise<{
    success: boolean
    data?: {
      presets: CommandPreset[]
    }
    error?: {
      code: string
      message: string
    }
  }> {
    const response = await fetch('/api/commands/presets', {
      method: 'GET',
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  },
}

export default commandService
