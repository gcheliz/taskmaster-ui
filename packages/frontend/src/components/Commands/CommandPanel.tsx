import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/atoms/Card'
import { Button } from '../ui/atoms/Button'
import { Badge } from '../ui/atoms/Badge'
import { Spinner } from '../ui/atoms/Spinner'
import { CommandActionButton } from './CommandActionButton'
import { CommandPresetButton } from './CommandPresetButton'
import {
  commandService,
  type AvailableCommand,
  type CommandPreset,
} from '../../services/commandService'
import { useRepository } from '../../contexts/RepositoryContext'

// Import some common icons (assuming they exist)
// These would need to be imported based on your icon system
const GitIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
)

const TaskMasterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
)

const PackageIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L2 7v10c0 5.55 3.84 9.95 9 11 5.16-1.05 9-5.45 9-11V7l-10-5z" />
  </svg>
)

export interface CommandPanelProps {
  repositoryPath?: string
  workingDirectory?: string
  className?: string
}

export const CommandPanel = ({
  repositoryPath,
  workingDirectory,
  className,
}: CommandPanelProps) => {
  const [availableCommands, setAvailableCommands] = useState<AvailableCommand[]>([])
  const [presets, setPresets] = useState<CommandPreset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { state: repositoryState } = useRepository()
  const currentRepo = repositoryPath || repositoryState.selectedRepository?.path

  // Load available commands and presets
  useEffect(() => {
    const loadCommands = async () => {
      setLoading(true)
      setError(null)

      try {
        const [commandsResponse, presetsResponse] = await Promise.all([
          commandService.getAvailableCommands(currentRepo),
          commandService.getCommandPresets(),
        ])

        if (commandsResponse.success && commandsResponse.data) {
          setAvailableCommands(commandsResponse.data.commands)
        }

        if (presetsResponse.success && presetsResponse.data) {
          setPresets(presetsResponse.data.presets)
        }

        if (!commandsResponse.success) {
          setError(commandsResponse.error?.message || 'Failed to load commands')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load command data')
      } finally {
        setLoading(false)
      }
    }

    loadCommands()
  }, [currentRepo])

  const getCommandIcon = (command: string) => {
    switch (command) {
      case 'git':
        return GitIcon
      case 'task-master':
        return TaskMasterIcon
      case 'pnpm':
      case 'npm':
        return PackageIcon
      default:
        return undefined
    }
  }

  const getCommandVariant = (command: string) => {
    switch (command) {
      case 'git':
        return 'outline' as const
      case 'task-master':
        return 'primary' as const
      case 'pnpm':
      case 'npm':
        return 'secondary' as const
      default:
        return 'outline' as const
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Command Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Spinner size="md" />
            <span className="ml-2">Loading commands...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Command Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-error-600">
            <p>Failed to load commands: {error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Command Presets */}
        {presets.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-secondary-700 mb-3">Command Presets</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presets
                .filter((preset) => !preset.requiresRepository || currentRepo)
                .map((preset) => (
                  <CommandPresetButton
                    key={preset.name}
                    presetName={preset.name}
                    label={preset.name}
                    description={preset.description}
                    variant="primary"
                    size="sm"
                    workingDirectory={workingDirectory}
                    repositoryPath={currentRepo}
                    confirmationMessage={
                      preset.commands.length > 1
                        ? `Execute ${preset.commands.length} commands: ${preset.description}?`
                        : undefined
                    }
                  />
                ))}
            </div>
          </div>
        )}

        {/* Individual Commands */}
        {availableCommands.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-secondary-700 mb-3">Individual Commands</h4>
            <div className="space-y-3">
              {availableCommands
                .filter((cmd) => cmd.available)
                .map((cmd) => (
                  <div key={cmd.command} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{cmd.command}</span>
                      {cmd.requiresRepository && (
                        <Badge variant="outline" size="sm">
                          Requires Repo
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {cmd.subcommands.slice(0, 6).map((subcommand) => (
                        <CommandActionButton
                          key={`${cmd.command}-${subcommand}`}
                          command={cmd.command}
                          args={[subcommand]}
                          label={subcommand}
                          icon={getCommandIcon(cmd.command)}
                          variant={getCommandVariant(cmd.command)}
                          size="sm"
                          workingDirectory={workingDirectory}
                          repositoryPath={currentRepo}
                          confirmationMessage={
                            ['push', 'reset', 'rebase'].includes(subcommand)
                              ? `Are you sure you want to execute 'git ${subcommand}'?`
                              : undefined
                          }
                        />
                      ))}
                      {cmd.subcommands.length > 6 && (
                        <Badge variant="secondary" size="sm">
                          +{cmd.subcommands.length - 6} more
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {availableCommands.filter((cmd) => cmd.available).length === 0 && (
          <div className="text-center py-4 text-secondary-500">
            <p>No commands available.</p>
            {!currentRepo && (
              <p className="text-sm mt-1">Select a repository to enable Git commands.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
