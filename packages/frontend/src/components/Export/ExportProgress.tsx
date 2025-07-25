import React, { useEffect, useState } from 'react'
import { FileDown, X } from 'lucide-react'
import { checkExportProgress } from '../../services/exportService'

export interface ExportProgressProps {
  exportId: string
  onClose: () => void
  onComplete?: (downloadUrl: string) => void
}

export const ExportProgress = ({
  exportId,
  onClose,
  onComplete
}: ExportProgressProps) => {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'processing' | 'completed' | 'failed'>('processing')
  const [error, setError] = useState<string>()
  const [downloadUrl, setDownloadUrl] = useState<string>()

  useEffect(() => {
    const checkProgress = async () => {
      try {
        const result = await checkExportProgress(exportId)
        setProgress(result.progress * 100)
        setStatus(result.status)
        
        if (result.status === 'completed' && result.downloadUrl) {
          setDownloadUrl(result.downloadUrl)
          onComplete?.(result.downloadUrl)
        } else if (result.status === 'failed') {
          setError(result.error || 'Export failed')
        }
      } catch (err) {
        setStatus('failed')
        setError('Failed to check export progress')
      }
    }

    // Check progress immediately
    checkProgress()

    // Then check every 2 seconds while processing
    const interval = setInterval(() => {
      if (status === 'processing') {
        checkProgress()
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [exportId, status, onComplete])

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank')
    }
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-80">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Export Progress</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Close export progress"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {status === 'processing' && (
        <>
          <div className="mb-2">
            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Processing export... {Math.round(progress)}%
          </p>
        </>
      )}

      {status === 'completed' && (
        <div className="space-y-3">
          <div className="flex items-center text-green-600">
            <FileDown className="h-5 w-5 mr-2" />
            <span className="text-sm font-medium">Export completed!</span>
          </div>
          <button
            onClick={handleDownload}
            className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Download File
          </button>
        </div>
      )}

      {status === 'failed' && (
        <div className="text-red-600">
          <p className="text-sm font-medium mb-1">Export failed</p>
          <p className="text-xs">{error}</p>
        </div>
      )}
    </div>
  )
}