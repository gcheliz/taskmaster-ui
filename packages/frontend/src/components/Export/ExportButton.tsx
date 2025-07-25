import React, { useState, useRef, useEffect } from 'react'
import { Download, FileDown, FileJson, Clock } from 'lucide-react'
import { exportTasks, ExportOptions, initiateAsyncExport } from '../../services/exportService'
import { useNotification } from '../../contexts/NotificationContext'
import { ExportProgress } from './ExportProgress'

export interface ExportButtonProps {
  projectId?: string
  currentFilters?: Record<string, any>
  className?: string
}

export const ExportButton = ({
  projectId,
  currentFilters = {},
  className = ''
}: ExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [activeExportId, setActiveExportId] = useState<string | null>(null)
  const [showLargeExportDialog, setShowLargeExportDialog] = useState(false)
  const [pendingExportFormat, setPendingExportFormat] = useState<'csv' | 'json' | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { showSuccess, showError, showInfo } = useNotification()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  const handleExport = async (format: 'csv' | 'json') => {
    setShowDropdown(false)
    
    // Check if this might be a large export (could check task count from API)
    // For now, assume exports with no filters might be large
    const hasNoFilters = Object.keys(currentFilters).length === 0 && !projectId
    
    if (hasNoFilters) {
      setPendingExportFormat(format)
      setShowLargeExportDialog(true)
      return
    }

    // Proceed with direct export
    await performDirectExport(format)
  }

  const performDirectExport = async (format: 'csv' | 'json') => {
    setIsExporting(true)

    try {
      const options: ExportOptions = {
        format,
        type: 'tasks',
        projectId,
        ...currentFilters
      }

      await exportTasks(options)
      showSuccess(`Tasks exported successfully as ${format.toUpperCase()}`)
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to export tasks')
    } finally {
      setIsExporting(false)
    }
  }

  const performAsyncExport = async (format: 'csv' | 'json', notifyEmail?: string) => {
    setShowLargeExportDialog(false)
    
    try {
      const result = await initiateAsyncExport({
        type: 'tasks',
        format,
        filters: { projectId, ...currentFilters },
        notifyEmail
      })
      
      setActiveExportId(result.exportId)
      showInfo(`Export started. Estimated time: ${result.estimatedTime} seconds`)
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to start export')
    }
  }

  const handleExportComplete = (downloadUrl: string) => {
    setActiveExportId(null)
    showSuccess('Export completed successfully!')
    
    // Automatically download the file
    window.open(downloadUrl, '_blank')
  }

  return (
    <>
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={isExporting}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Export tasks"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700 mr-2" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export
            </>
          )}
        </button>

        {showDropdown && !isExporting && (
          <div className="absolute right-0 z-10 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200">
            <div className="py-1" role="menu" aria-orientation="vertical">
              <button
                type="button"
                onClick={() => handleExport('csv')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                role="menuitem"
              >
                <FileDown className="h-4 w-4 mr-3 text-green-600" />
                Export as CSV
              </button>
              <button
                type="button"
                onClick={() => handleExport('json')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                role="menuitem"
              >
                <FileJson className="h-4 w-4 mr-3 text-blue-600" />
                Export as JSON
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Large Export Dialog */}
      {showLargeExportDialog && pendingExportFormat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Large Export Detected</h3>
            <p className="text-gray-600 mb-4">
              This export may contain a large amount of data and could take some time to process.
              We recommend using background processing for better performance.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email notification (optional)
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
                id="notify-email"
              />
              <p className="text-xs text-gray-500 mt-1">
                We'll send you an email when your export is ready
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  const email = (document.getElementById('notify-email') as HTMLInputElement)?.value
                  performAsyncExport(pendingExportFormat, email)
                }}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center"
              >
                <Clock className="h-4 w-4 mr-2" />
                Process in Background
              </button>
              <button
                onClick={() => {
                  setShowLargeExportDialog(false)
                  performDirectExport(pendingExportFormat)
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Export Now
              </button>
              <button
                onClick={() => setShowLargeExportDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Progress Tracker */}
      {activeExportId && (
        <ExportProgress
          exportId={activeExportId}
          onClose={() => setActiveExportId(null)}
          onComplete={handleExportComplete}
        />
      )}
    </>
  )
}