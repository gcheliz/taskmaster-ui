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
  GitCommit,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Shield,
  MoreVertical,
  Settings
} from 'lucide-react'
import { Card } from '../components/ui/molecules/Card'
import { Badge } from '../components/ui/atoms/Badge'
import { Button } from '../components/ui/atoms/Button'
import { formatDistanceToNow } from 'date-fns'

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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return {
          color: 'text-green-700 bg-green-50 border-green-200',
          icon: <CheckCircle className="w-4 h-4" />,
          label: 'Active',
        }
      case 'inactive':
        return {
          color: 'text-gray-700 bg-gray-50 border-gray-200',
          icon: <Activity className="w-4 h-4" />,
          label: 'Inactive',
        }
      case 'error':
        return {
          color: 'text-red-700 bg-red-50 border-red-200',
          icon: <AlertCircle className="w-4 h-4" />,
          label: 'Error',
        }
      default:
        return {
          color: 'text-gray-700 bg-gray-50 border-gray-200',
          icon: <Activity className="w-4 h-4" />,
          label: 'Unknown',
        }
    }
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
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
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Repository Management</h1>
          <p className="text-gray-600 mt-1">
            Connect and manage your Git repositories with TaskMaster integration
            {repositories.length > 0 && (
              <span className="ml-2 text-sm font-medium text-gray-700">
                • {repositories.length} connected
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Repository
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-white to-gray-50 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Repositories</p>
              <p className="text-3xl font-bold text-gray-900">{repositories.length}</p>
              <p className="text-xs text-gray-500 mt-1">Connected to TaskMaster</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <GitBranch className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-white to-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Active</p>
              <p className="text-3xl font-bold text-green-600">
                {repositories.filter((r: any) => r.status === 'active').length}
              </p>
              <p className="text-xs text-green-600 mt-1">Currently synced</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-white to-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">With Issues</p>
              <p className="text-3xl font-bold text-red-600">
                {repositories.filter((r: any) => r.status === 'error').length}
              </p>
              <p className="text-xs text-red-600 mt-1">Requires attention</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Error loading repositories</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Repository List */}
      {repositories.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {repositories.map((repo: any) => {
            const statusConfig = getStatusConfig(repo.status || 'inactive')
            const healthScore = Math.floor(Math.random() * 40) + 60 // Mock health score
            
            return (
              <Card key={repo.id} className="overflow-hidden hover:shadow-lg transition-all duration-200">
                {/* Card Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <GitBranch className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 truncate">{repo.name}</h3>
                          <p className="text-sm text-gray-500 truncate">{repo.path}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="custom"
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}
                      >
                        {statusConfig.icon}
                        <span>{statusConfig.label}</span>
                      </Badge>
                      
                      {/* More Actions */}
                      <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="px-6 py-4">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                        <GitCommit className="w-4 h-4" />
                        <span className="text-xs">Commits</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {Math.floor(Math.random() * 500) + 100}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                        <Users className="w-4 h-4" />
                        <span className="text-xs">Contributors</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {Math.floor(Math.random() * 10) + 1}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                        <Shield className="w-4 h-4" />
                        <span className="text-xs">Health</span>
                      </div>
                      <p className={`text-lg font-semibold ${getHealthScoreColor(healthScore)}`}>
                        {healthScore}%
                      </p>
                    </div>
                  </div>

                  {/* Repository Info */}
                  <div className="space-y-3 py-3 border-y border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <GitBranch className="w-4 h-4" />
                        <span>Current Branch</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {repo.gitBranch || 'main'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>Last Activity</span>
                      </div>
                      <span className="text-sm text-gray-900">
                        {repo.lastUpdated 
                          ? formatDistanceToNow(new Date(repo.lastUpdated), { addSuffix: true })
                          : 'No recent activity'}
                      </span>
                    </div>
                  </div>

                  {/* Features & Tags */}
                  <div className="flex items-center gap-2 mt-4">
                    {repo.isGitRepository && (
                      <Badge variant="outline" className="text-xs">
                        <GitCommit className="w-3 h-3 mr-1" />
                        Git Enabled
                      </Badge>
                    )}
                    {repo.isTaskMasterProject && (
                      <Badge variant="outline" className="text-xs text-blue-600 border-blue-200 bg-blue-50">
                        <Activity className="w-3 h-3 mr-1" />
                        TaskMaster
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-sm"
                      onClick={() => console.log('View details:', repo.id)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="px-3"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="px-3"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

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