import React from 'react';
import type { ReactNode } from 'react';
import { BaseErrorBoundary } from './BaseErrorBoundary';
import { AlertTriangle, Database, Wifi, Terminal, GitBranch } from 'lucide-react';
import { Button } from '../ui/atoms/Button';
import { Card } from '../ui/atoms/Card';

interface BoundaryProps {
  children: ReactNode;
  onError?: (error: Error) => void;
}

/**
 * Specialized error boundary for API/Network related errors
 */
export const APIErrorBoundary: React.FC<BoundaryProps> = ({ children, onError }) => {
  const networkErrorFallback = (
    <Card className="p-6 border-orange-200 bg-orange-50">
      <div className="text-center">
        <Wifi className="mx-auto h-8 w-8 text-orange-500 mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Connection Error
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Unable to connect to the server. Please check your internet connection and try again.
        </p>
        <Button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2"
        >
          <Wifi className="h-4 w-4" />
          Retry Connection
        </Button>
      </div>
    </Card>
  );

  return (
    <BaseErrorBoundary
      fallback={networkErrorFallback}
      context="API/Network"
      level="section"
      onError={onError}
    >
      {children}
    </BaseErrorBoundary>
  );
};

/**
 * Specialized error boundary for Database related errors
 */
export const DatabaseErrorBoundary: React.FC<BoundaryProps> = ({ children, onError }) => {
  const databaseErrorFallback = (
    <Card className="p-6 border-red-200 bg-red-50">
      <div className="text-center">
        <Database className="mx-auto h-8 w-8 text-red-500 mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Database Error
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          There was a problem accessing the database. Please try again in a moment.
        </p>
        <Button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2"
        >
          <Database className="h-4 w-4" />
          Reconnect
        </Button>
      </div>
    </Card>
  );

  return (
    <BaseErrorBoundary
      fallback={databaseErrorFallback}
      context="Database"
      level="section"
      onError={onError}
    >
      {children}
    </BaseErrorBoundary>
  );
};

/**
 * Specialized error boundary for Terminal/Command execution errors
 */
export const TerminalErrorBoundary: React.FC<BoundaryProps> = ({ children, onError }) => {
  const terminalErrorFallback = (
    <Card className="p-6 border-yellow-200 bg-yellow-50">
      <div className="text-center">
        <Terminal className="mx-auto h-8 w-8 text-yellow-600 mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Terminal Error
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          The terminal encountered an error while executing a command.
        </p>
        <div className="flex gap-2 justify-center">
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Terminal className="h-3 w-3" />
            Reset Terminal
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <BaseErrorBoundary
      fallback={terminalErrorFallback}
      context="Terminal"
      level="section"
      onError={onError}
    >
      {children}
    </BaseErrorBoundary>
  );
};

/**
 * Specialized error boundary for Repository/Git related errors
 */
export const RepositoryErrorBoundary: React.FC<BoundaryProps> = ({ children, onError }) => {
  const repositoryErrorFallback = (
    <Card className="p-6 border-blue-200 bg-blue-50">
      <div className="text-center">
        <GitBranch className="mx-auto h-8 w-8 text-blue-500 mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Repository Error
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          There was a problem accessing the Git repository. Please verify your permissions and try again.
        </p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="flex items-center gap-2"
        >
          <GitBranch className="h-4 w-4" />
          Refresh Repository
        </Button>
      </div>
    </Card>
  );

  return (
    <BaseErrorBoundary
      fallback={repositoryErrorFallback}
      context="Repository"
      level="section"
      onError={onError}
    >
      {children}
    </BaseErrorBoundary>
  );
};

/**
 * Specialized error boundary for Route/Navigation errors
 */
export const RouteErrorBoundary: React.FC<BoundaryProps> = ({ children, onError }) => {
  const routeErrorFallback = (
    <div className="min-h-[400px] flex flex-col justify-center items-center">
      <AlertTriangle className="h-12 w-12 text-orange-500 mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Page Not Found
      </h2>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="space-x-3">
        <Button
          onClick={() => window.history.back()}
          variant="outline"
        >
          Go Back
        </Button>
        <Button
          onClick={() => window.location.href = '/'}
        >
          Go Home
        </Button>
      </div>
    </div>
  );

  return (
    <BaseErrorBoundary
      fallback={routeErrorFallback}
      context="Navigation"
      level="page"
      onError={onError}
    >
      {children}
    </BaseErrorBoundary>
  );
};

/**
 * Specialized error boundary for WebSocket/Real-time errors
 */
export const WebSocketErrorBoundary: React.FC<BoundaryProps> = ({ children, onError }) => {
  const websocketErrorFallback = (
    <Card className="p-4 border-purple-200 bg-purple-50">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-purple-500 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-900 mb-1">
            Real-time Connection Lost
          </h4>
          <p className="text-xs text-gray-600 mb-2">
            Live updates are temporarily unavailable. The page will continue to work normally.
          </p>
          <Button
            onClick={() => window.location.reload()}
            size="sm"
            variant="ghost"
            className="text-xs p-1 h-auto"
          >
            Reconnect
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <BaseErrorBoundary
      fallback={websocketErrorFallback}
      context="WebSocket"
      level="component"
      onError={onError}
    >
      {children}
    </BaseErrorBoundary>
  );
};