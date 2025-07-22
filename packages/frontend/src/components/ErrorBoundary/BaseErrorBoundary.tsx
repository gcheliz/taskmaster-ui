import React, { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '../ui/atoms/Button';
import { Card } from '../ui/atoms/Card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
  level?: 'page' | 'section' | 'component';
  context?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class BaseErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate unique error ID for tracking
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error for monitoring (in production, this would go to your error tracking service)
    this.logError(error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Reset error boundary if resetKeys change
    if (hasError && resetKeys && prevProps.resetKeys !== resetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (resetKey, idx) => prevProps.resetKeys?.[idx] !== resetKey
      );
      
      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }

    // Reset on any props change if resetOnPropsChange is true
    if (hasError && resetOnPropsChange && prevProps !== this.props) {
      this.resetErrorBoundary();
    }
  }

  logError = (error: Error, errorInfo: ErrorInfo) => {
    const errorData = {
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
      context: this.props.context,
      level: this.props.level,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Error Data:', errorData);
      console.groupEnd();
    }

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error tracking service
      // errorTrackingService.captureError(errorData);
      
      // For now, we'll store in sessionStorage for debugging
      try {
        const existingErrors = JSON.parse(sessionStorage.getItem('taskmaster_errors') || '[]');
        existingErrors.push(errorData);
        // Keep only last 10 errors
        if (existingErrors.length > 10) {
          existingErrors.shift();
        }
        sessionStorage.setItem('taskmaster_errors', JSON.stringify(existingErrors));
      } catch (e) {
        console.error('Failed to store error in sessionStorage:', e);
      }
    }
  };

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId);
    }
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });
  };

  handleRetry = () => {
    this.resetErrorBoundary();
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  copyErrorDetails = () => {
    const errorDetails = {
      errorId: this.state.errorId,
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      component: this.state.errorInfo?.componentStack,
    };

    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
      .then(() => {
        // Could show a toast notification here
        console.log('Error details copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy error details:', err);
      });
  };

  renderErrorFallback() {
    const { level = 'component', context } = this.props;
    const { error, errorId } = this.state;

    // If custom fallback is provided, use it
    if (this.props.fallback) {
      return this.props.fallback;
    }

    // Different UI based on error level
    if (level === 'page') {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <Card className="py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="text-center">
                <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Something went wrong
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  We encountered an unexpected error. Please try one of the options below.
                </p>
                
                {process.env.NODE_ENV === 'development' && (
                  <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md text-left">
                    <p className="text-xs text-red-800 font-mono">
                      Error ID: {errorId}
                    </p>
                    <p className="text-xs text-red-800 font-mono mt-1">
                      {error?.message}
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <Button
                    onClick={this.handleRetry}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </Button>
                  
                  <Button
                    onClick={this.handleReload}
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reload Page
                  </Button>
                  
                  <Button
                    onClick={this.handleGoHome}
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Home className="h-4 w-4" />
                    Go to Dashboard
                  </Button>

                  {process.env.NODE_ENV === 'development' && (
                    <Button
                      onClick={this.copyErrorDetails}
                      variant="ghost"
                      size="sm"
                      className="w-full flex items-center justify-center gap-2 text-xs"
                    >
                      <Bug className="h-3 w-3" />
                      Copy Error Details
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      );
    }

    if (level === 'section') {
      return (
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-red-500 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Section Error
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {context ? `Error in ${context}` : 'This section encountered an error.'}
            </p>
            
            <div className="flex gap-2 justify-center">
              <Button
                onClick={this.handleRetry}
                size="sm"
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Retry
              </Button>
              
              {process.env.NODE_ENV === 'development' && (
                <Button
                  onClick={this.copyErrorDetails}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Bug className="h-3 w-3" />
                  Debug
                </Button>
              )}
            </div>
          </div>
        </Card>
      );
    }

    // Component level error
    return (
      <div className="p-4 border border-red-200 rounded-md bg-red-50">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-red-800 mb-1">
              Component Error
            </h4>
            <p className="text-xs text-red-700 mb-2">
              {context || 'This component encountered an error.'}
            </p>
            <Button
              onClick={this.handleRetry}
              size="sm"
              variant="ghost"
              className="text-xs p-1 h-auto text-red-800 hover:bg-red-100"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      return this.renderErrorFallback();
    }

    return this.props.children;
  }
}