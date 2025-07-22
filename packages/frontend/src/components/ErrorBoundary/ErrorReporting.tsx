import React, { useState, useEffect } from 'react';
import { Bug, X, Copy, ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from '../ui/atoms/Button';
import { Card } from '../ui/atoms/Card';
import { Modal } from '../ui/molecules/Modal';

interface ErrorReport {
  errorId: string;
  timestamp: string;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  errorInfo: {
    componentStack: string;
  };
  context?: string;
  level?: string;
  userAgent: string;
  url: string;
}

interface ErrorReportingProps {
  open: boolean;
  onClose: () => void;
  error?: ErrorReport;
}

/**
 * Error Reporting Modal - allows users to view and report errors
 */
export const ErrorReportingModal: React.FC<ErrorReportingProps> = ({
  open,
  onClose,
  error
}) => {
  const [reportSent, setReportSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userFeedback, setUserFeedback] = useState('');

  const handleSubmitReport = async () => {
    if (!error) return;

    setIsSubmitting(true);
    
    try {
      const report = {
        ...error,
        userFeedback,
        reportedAt: new Date().toISOString(),
      };

      // In a real application, this would send to your error reporting service
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Error report submitted:', report);
      setReportSent(true);
      
      // In production, you would send this to your error tracking service:
      // await errorTrackingService.submitReport(report);
      
    } catch (err) {
      console.error('Failed to submit error report:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyErrorDetails = () => {
    if (!error) return;
    
    const details = {
      errorId: error.errorId,
      timestamp: error.timestamp,
      error: error.error.message,
      context: error.context,
      url: error.url,
      userAgent: error.userAgent,
    };

    navigator.clipboard.writeText(JSON.stringify(details, null, 2))
      .then(() => {
        console.log('Error details copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy error details:', err);
      });
  };

  if (!error) return null;

  return (
    <Modal open={open} onOpenChange={(open) => !open && onClose()}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-red-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Error Report
            </h2>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {reportSent ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bug className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Report Submitted
            </h3>
            <p className="text-gray-600">
              Thank you for helping us improve TaskMaster UI!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Error Details
              </h3>
              <Card className="p-3 bg-gray-50 border">
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Error ID:</span>{' '}
                    <code className="text-xs bg-gray-200 px-1 rounded">
                      {error.errorId}
                    </code>
                  </div>
                  <div>
                    <span className="font-medium">Type:</span>{' '}
                    {error.error.name}
                  </div>
                  <div>
                    <span className="font-medium">Message:</span>{' '}
                    {error.error.message}
                  </div>
                  <div>
                    <span className="font-medium">Context:</span>{' '}
                    {error.context || 'Unknown'}
                  </div>
                  <div>
                    <span className="font-medium">Time:</span>{' '}
                    {new Date(error.timestamp).toLocaleString()}
                  </div>
                </div>
              </Card>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                What were you doing when this error occurred? (Optional)
              </label>
              <textarea
                value={userFeedback}
                onChange={(e) => setUserFeedback(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md resize-none"
                rows={3}
                placeholder="Describe what you were doing when the error happened..."
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex gap-2">
                <Button
                  onClick={copyErrorDetails}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Copy className="h-3 w-3" />
                  Copy Details
                </Button>
                
                {process.env.NODE_ENV === 'development' && (
                  <Button
                    onClick={() => console.log('Full error:', error)}
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View in Console
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={onClose}
                  variant="outline"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitReport}
                  disabled={isSubmitting}
                  className="flex items-center gap-1"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Bug className="h-4 w-4" />
                  )}
                  {isSubmitting ? 'Sending...' : 'Send Report'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

/**
 * Error Reporting Widget - shows in corner when errors occur
 */
export const ErrorReportingWidget: React.FC = () => {
  const [errors, setErrors] = useState<ErrorReport[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedError, setSelectedError] = useState<ErrorReport | null>(null);

  useEffect(() => {
    // Check for stored errors on mount
    const checkStoredErrors = () => {
      try {
        const storedErrors = sessionStorage.getItem('taskmaster_errors');
        if (storedErrors) {
          const parsedErrors = JSON.parse(storedErrors);
          setErrors(parsedErrors);
        }
      } catch (e) {
        console.error('Failed to load stored errors:', e);
      }
    };

    checkStoredErrors();

    // Check for new errors periodically (in case they're added by error boundaries)
    const interval = setInterval(checkStoredErrors, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleShowError = (error: ErrorReport) => {
    setSelectedError(error);
    setShowModal(true);
  };

  const clearAllErrors = () => {
    setErrors([]);
    sessionStorage.removeItem('taskmaster_errors');
  };

  if (errors.length === 0) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="p-3 bg-red-50 border-red-200 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium text-red-800">
              {errors.length} Error{errors.length > 1 ? 's' : ''} Detected
            </span>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => handleShowError(errors[0])}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              View Latest
            </Button>
            <Button
              onClick={clearAllErrors}
              size="sm"
              variant="ghost"
              className="text-xs"
            >
              Dismiss All
            </Button>
          </div>
        </Card>
      </div>

      <ErrorReportingModal
        open={showModal}
        onClose={() => setShowModal(false)}
        error={selectedError || undefined}
      />
    </>
  );
};

/**
 * Global error handler for uncaught errors
 */
export const setupGlobalErrorHandling = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error: ErrorReport = {
      errorId: `global_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      error: {
        name: 'UnhandledPromiseRejection',
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
      },
      errorInfo: {
        componentStack: 'Global promise rejection',
      },
      context: 'Global',
      level: 'global',
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Store error for reporting widget
    try {
      const existingErrors = JSON.parse(sessionStorage.getItem('taskmaster_errors') || '[]');
      existingErrors.push(error);
      if (existingErrors.length > 10) {
        existingErrors.shift();
      }
      sessionStorage.setItem('taskmaster_errors', JSON.stringify(existingErrors));
    } catch (e) {
      console.error('Failed to store global error:', e);
    }
  });

  // Handle general JavaScript errors
  window.addEventListener('error', (event) => {
    const error: ErrorReport = {
      errorId: `global_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      error: {
        name: event.error?.name || 'JavaScriptError',
        message: event.message,
        stack: event.error?.stack,
      },
      errorInfo: {
        componentStack: `At ${event.filename}:${event.lineno}:${event.colno}`,
      },
      context: 'Global',
      level: 'global',
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Store error for reporting widget
    try {
      const existingErrors = JSON.parse(sessionStorage.getItem('taskmaster_errors') || '[]');
      existingErrors.push(error);
      if (existingErrors.length > 10) {
        existingErrors.shift();
      }
      sessionStorage.setItem('taskmaster_errors', JSON.stringify(existingErrors));
    } catch (e) {
      console.error('Failed to store global error:', e);
    }
  });
};