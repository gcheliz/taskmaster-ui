import React, { useState } from 'react'
import { useRepositoryList } from '../hooks/useRepositoryList'
import { Spinner } from '../components/ui/atoms/Spinner'
import { Modal } from '../components/ui/molecules/Modal'
import { AddRepository } from '../components/Repository/AddRepository'
import { useRepositoryOperations } from '../hooks/useRepositoryOperations'
import { 
  GitBranch, 
  Plus, 
  RefreshCw, 
  ExternalLink,
  Calendar,
  GitCommit,
  Activity,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

const Repositories: React.FC = () => {
  const { repositories, isLoading, error, refetch } = useRepositoryList()
  const { connectRepository } = useRepositoryOperations()
  const [showAddModal, setShowAddModal] = useState(false)

  const handleAddRepository = async (path: string) => {
    try {
      await connectRepository(path, {
        validateGit: true,
        validateTaskMaster: true,
        selectAfterConnect: true
      })
      setShowAddModal(false)
      refetch()
    } catch (error) {
      console.error('Failed to add repository:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50'
      case 'inactive':
        return 'text-gray-600 bg-gray-50'
      case 'error':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />
      case 'error':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Repositories</h1>
          <p className="text-gray-600 mt-1">Manage your connected Git repositories</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Repository
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Repositories</p>
              <p className="text-2xl font-bold text-gray-900">{repositories.length}</p>
            </div>
            <GitBranch className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {repositories.filter((r: any) => r.status === 'active').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">With Issues</p>
              <p className="text-2xl font-bold text-red-600">
                {repositories.filter((r: any) => r.status === 'error').length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Error loading repositories</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Repository List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {repositories.map((repo: any) => (
          <div key={repo.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{repo.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{repo.path}</p>
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(repo.status)}`}>
                {getStatusIcon(repo.status)}
                <span className="capitalize">{repo.status}</span>
              </div>
            </div>

            {/* Repository Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Branch:</span>
                <span className="font-medium text-gray-900">{repo.gitBranch || 'main'}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Last Updated:</span>
                <span className="text-gray-900">
                  {repo.lastUpdated ? new Date(repo.lastUpdated).toLocaleString() : 'Unknown'}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Connected:</span>
                <span className="text-gray-900">
                  {repo.connectedAt ? new Date(repo.connectedAt).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
            </div>

            {/* Features */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-1">
                <GitCommit className={`w-4 h-4 ${repo.isGitRepository ? 'text-green-600' : 'text-gray-400'}`} />
                <span className={`text-sm ${repo.isGitRepository ? 'text-green-600' : 'text-gray-400'}`}>
                  Git
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Activity className={`w-4 h-4 ${repo.isTaskMasterProject ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className={`text-sm ${repo.isTaskMasterProject ? 'text-blue-600' : 'text-gray-400'}`}>
                  TaskMaster
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-4">
              <button className="flex-1 text-sm font-medium text-blue-600 hover:text-blue-700 py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                View Details
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {repositories.length === 0 && !error && (
        <div className="text-center py-12">
          <GitBranch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No repositories connected</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first repository</p>
          <button 
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Repository
          </button>
        </div>
      )}

      {/* Add Repository Modal */}
      <Modal open={showAddModal} onOpenChange={setShowAddModal}>
        <AddRepository onRepositoryAdd={handleAddRepository} />
      </Modal>
    </div>
  )
}

export default Repositories