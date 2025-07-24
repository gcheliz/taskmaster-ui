import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/atoms/Card'
import { Badge } from '../ui/atoms/Badge'
import { Button } from '../ui/atoms/Button'
import type { CommandResult } from '../../services/commandService'

export interface CommandOutputDisplayProps {
  result: CommandResult
  executionId?: string
  command?: string
  onClear?: () => void
  className?: string
}

export const CommandOutputDisplay: React.FC<CommandOutputDisplayProps> = ({
  result,
  executionId,
  command,
  onClear,
  className,
}) => {
  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  const formatOutput = (output: string): string => {
    // Clean up and format the output for better display
    return output.trim() || '(no output)'
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Command Output</CardTitle>
            <Badge variant={result.success ? 'success' : 'error'} size="sm">
              {result.success ? 'Success' : 'Failed'}
            </Badge>
            {result.exitCode !== null && (
              <Badge variant="outline" size="sm">
                Exit: {result.exitCode}
              </Badge>
            )}
          </div>
          {onClear && (
            <Button variant="ghost" size="sm" onClick={onClear}>
              Clear
            </Button>
          )}
        </div>
        {command && <p className="text-sm text-secondary-600 font-mono">{command}</p>}
        <div className="flex items-center gap-4 text-xs text-secondary-500">
          <span>Duration: {formatDuration(result.duration)}</span>
          {executionId && <span>ID: {executionId}</span>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Standard Output */}
        {result.stdout && (
          <div>
            <h4 className="text-sm font-medium text-secondary-700 mb-2">Standard Output</h4>
            <div className="bg-secondary-50 rounded-md p-3 font-mono text-sm overflow-x-auto">
              <pre className="whitespace-pre-wrap">{formatOutput(result.stdout)}</pre>
            </div>
          </div>
        )}

        {/* Standard Error */}
        {result.stderr && (
          <div>
            <h4 className="text-sm font-medium text-error-700 mb-2">Standard Error</h4>
            <div className="bg-error-50 border border-error-200 rounded-md p-3 font-mono text-sm overflow-x-auto">
              <pre className="whitespace-pre-wrap text-error-800">
                {formatOutput(result.stderr)}
              </pre>
            </div>
          </div>
        )}

        {/* No Output */}
        {!result.stdout && !result.stderr && (
          <div className="text-center py-4 text-secondary-500">
            <p>No output produced</p>
          </div>
        )}

        {/* Signal Information */}
        {result.signal && (
          <div className="text-xs text-secondary-500">
            <strong>Signal:</strong> {result.signal}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
