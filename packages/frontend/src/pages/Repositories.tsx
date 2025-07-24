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
  Settings,
  Search,
  GitPullRequest,
  Rocket,
  TrendingUp,
  ArrowUpRight,
  ArrowRight
} from 'lucide-react'
import { Card } from '../components/ui/molecules/Card'
import { Badge } from '../components/ui/atoms/Badge'
import { Button } from '../components/ui/atoms/Button'
import { formatDistanceToNow } from 'date-fns'
import { PageHeader } from '../components/Layout'

const Repositories: React.FC = () => {
  const { repositories, isLoading, error, refetch } = useRepositoryList()
  const { connectRepository } = useRepositoryOperations()
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Enhanced mock repositories with realistic data
  const mockRepositories = [
    {
      id: 'repo-1',
      name: 'taskmaster-ui',
      path: '/Users/gonzalo/workspace/taskmaster-ui',
      status: 'active',
      isGitRepository: true,
      isTaskMasterProject: true,
      gitBranch: 'main',
      lastUpdated: new Date().toISOString(),
      connectedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      stats: {
        commits: 487,
        contributors: 5,
        branches: 12,
        openPRs: 3,
        health: 92
      }
    },
    {
      id: 'repo-2',
      name: 'taskmaster-backend',
      path: '/Users/gonzalo/workspace/taskmaster-backend',
      status: 'active',
      isGitRepository: true,
      isTaskMasterProject: true,
      gitBranch: 'develop',
      lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      connectedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      stats: {
        commits: 892,
        contributors: 8,
        branches: 15,
        openPRs: 5,
        health: 88
      }
    },
    {
      id: 'repo-3',
      name: 'api-gateway',
      path: '/Users/gonzalo/workspace/api-gateway',
      status: 'active',
      isGitRepository: true,
      isTaskMasterProject: false,
      gitBranch: 'feature/auth-integration',
      lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      connectedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      stats: {
        commits: 234,
        contributors: 3,
        branches: 8,
        openPRs: 2,
        health: 75
      }
    },
    {
      id: 'repo-4',
      name: 'mobile-app',
      path: '/Users/gonzalo/workspace/mobile-app',
      status: 'inactive',
      isGitRepository: true,
      isTaskMasterProject: true,
      gitBranch: 'main',
      lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      connectedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      stats: {
        commits: 156,
        contributors: 2,
        branches: 4,
        openPRs: 0,
        health: 65
      }
    },
    {
      id: 'repo-5',
      name: 'documentation',
      path: '/Users/gonzalo/workspace/documentation',
      status: 'active',
      isGitRepository: true,
      isTaskMasterProject: false,
      gitBranch: 'main',
      lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      connectedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      stats: {
        commits: 89,
        contributors: 4,
        branches: 2,
        openPRs: 1,
        health: 95
      }
    },
    {
      id: 'repo-6',
      name: 'analytics-service',
      path: '/Users/gonzalo/workspace/analytics-service',
      status: 'error',
      isGitRepository: true,
      isTaskMasterProject: true,
      gitBranch: 'hotfix/memory-leak',
      lastUpdated: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      connectedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      stats: {
        commits: 445,
        contributors: 6,
        branches: 9,
        openPRs: 4,
        health: 45
      }
    },
    {
      id: 'repo-7',
      name: 'ml-pipeline',
      path: '/Users/gonzalo/workspace/ml-pipeline',
      status: 'active',
      isGitRepository: true,
      isTaskMasterProject: false,
      gitBranch: 'experiment/new-model',
      lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      connectedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      stats: {
        commits: 678,
        contributors: 4,
        branches: 18,
        openPRs: 6,
        health: 82
      }
    },
    {
      id: 'repo-8',
      name: 'infrastructure',
      path: '/Users/gonzalo/workspace/infrastructure',
      status: 'active',
      isGitRepository: true,
      isTaskMasterProject: true,
      gitBranch: 'main',
      lastUpdated: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      connectedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      stats: {
        commits: 312,
        contributors: 7,
        branches: 6,
        openPRs: 2,
        health: 90
      }
    }
  ]

  // Filter repositories based on search and status
  const filteredRepositories = mockRepositories.filter(repo => {
    const matchesSearch = repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         repo.path.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || repo.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Use filtered mock data
  const displayRepositories = filteredRepositories


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
      logger.error('Failed to add repository:', error)
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
    <>
      <PageHeader 
        title="Repositories" 
        subtitle={`${displayRepositories.length} connected • ${displayRepositories.filter(r => r.status === 'active').length} active`}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              className="p-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Repository
            </button>
          </div>
        }
      />
      <div className="bg-white p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search repositories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="error">With Issues</option>
          </select>
        </div>
      </div>

      {/* Stats - Enhanced with more metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-200 transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Repositories</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{displayRepositories.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <GitBranch className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-gray-600 font-medium">{displayRepositories.filter((r: any) => r.isTaskMasterProject).length}</span>
            <span className="text-gray-500 ml-1">with TaskMaster</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-green-200 transition-all duration-200 transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Branches</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {displayRepositories.reduce((sum: number, r: any) => sum + (r.stats?.branches || 0), 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <GitBranch className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-green-600 font-medium">+12</span>
            <span className="text-gray-500 ml-1">this week</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-amber-200 transition-all duration-200 transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Open PRs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {displayRepositories.reduce((sum: number, r: any) => sum + (r.stats?.openPRs || 0), 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
              <GitPullRequest className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-amber-600 font-medium">{displayRepositories.filter((r: any) => r.stats?.openPRs > 0).length}</span>
            <span className="text-gray-500 ml-1">repositories</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-purple-200 transition-all duration-200 transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Health Score</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {Math.round(displayRepositories.reduce((sum: number, r: any) => sum + (r.stats?.health || 0), 0) / displayRepositories.length)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-green-600 font-medium">+8%</span>
            <span className="text-gray-500 ml-1">improvement</span>
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
      {displayRepositories.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {displayRepositories.map((repo: any) => {
            const statusConfig = getStatusConfig(repo.status || 'inactive')
            
            return (
              <div key={repo.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
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
                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                      {statusConfig.icon}
                      <span>{statusConfig.label}</span>
                    </span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{repo.stats?.commits || 0}</p>
                    <p className="text-xs text-gray-500">commits</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{repo.stats?.branches || 0}</p>
                    <p className="text-xs text-gray-500">branches</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{repo.stats?.contributors || 0}</p>
                    <p className="text-xs text-gray-500">contributors</p>
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${getHealthScoreColor(repo.stats?.health || 0)}`}>
                      {repo.stats?.health || 0}%
                    </p>
                    <p className="text-xs text-gray-500">health</p>
                  </div>
                </div>

                {/* Repository Info */}
                <div className="space-y-3 py-3 border-y border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Branch</span>
                    <span className="text-sm font-medium text-gray-900">
                      {repo.gitBranch || 'main'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Activity</span>
                    <span className="text-sm text-gray-900">
                      {repo.lastUpdated 
                        ? formatDistanceToNow(new Date(repo.lastUpdated), { addSuffix: true })
                        : 'No recent activity'}
                    </span>
                  </div>
                  
                  {repo.stats?.openPRs > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Open PRs</span>
                      <span className="text-sm font-medium text-amber-600">
                        {repo.stats.openPRs} pending
                      </span>
                    </div>
                  )}
                </div>

                {/* Features & Tags */}
                <div className="flex items-center gap-2 mt-4">
                  {repo.isGitRepository && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 bg-gray-50 rounded-md">
                      <GitCommit className="w-3 h-3" />
                      Git
                    </span>
                  )}
                  {repo.isTaskMasterProject && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md">
                      <Activity className="w-3 h-3" />
                      TaskMaster
                    </span>
                  )}
                  <button className="ml-auto text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors flex items-center gap-1">
                    View Details
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {displayRepositories.length === 0 && !error && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <GitBranch className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No repositories found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first repository'}
          </p>
          {(!searchTerm && statusFilter === 'all') && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Repository
            </button>
          )}
        </div>
      )}

      {/* Add Repository Modal */}
      <Modal open={showAddModal} onOpenChange={setShowAddModal}>
        <AddRepository onRepositoryAdd={handleAddRepository} />
      </Modal>
        </div>
      </div>
    </>
  )
}

export default Repositories