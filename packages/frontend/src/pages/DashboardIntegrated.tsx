import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useRepositoryList } from '../hooks/useRepositoryList'
import { useTaskData } from '../hooks/useTaskData'
import { useDashboard } from '../hooks/useDashboard'
import { GitSyncIndicator } from '../components/Repository/GitSyncIndicator'
import { BranchHealthVisualization } from '../components/Repository/BranchHealthVisualization'
import { PullRequestStatus } from '../components/Repository/PullRequestStatus'
import { RepositoryStatisticsCard } from '../components/Repository/RepositoryStatisticsCard'
import { Button } from '../components/ui/atoms/Button'
import { Spinner } from '../components/ui/atoms/Spinner'
import { Alert } from '../components/ui/molecules/Alert'
import {
  ClipboardList,
  GitBranch,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowRight,
  Plus,
  Code2,
  BarChart3,
} from 'lucide-react'

const DashboardIntegrated: React.FC = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { repositories, isLoading: reposLoading, error: reposError } = useRepositoryList()
  const { tasks, isLoading: tasksLoading } = useTaskData()
  const { metrics, activity, isLoading: dashboardLoading } = useDashboard()
  const [selectedRepository, setSelectedRepository] = useState<string | null>(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  // Select first repository by default
  useEffect(() => {
    if (repositories.length > 0 && !selectedRepository) {
      setSelectedRepository(repositories[0].id)
    }
  }, [repositories, selectedRepository])

  if (!isAuthenticated) {
    return null
  }

  const isLoading = reposLoading || tasksLoading || dashboardLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  const activeTasks = tasks.filter(t => t.status === 'in-progress').length
  const completedTasks = tasks.filter(t => t.status === 'done').length
  const onlineTeamMembers = 2 // This would come from real-time data
  const performanceScore = metrics?.performance || 92

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {user?.name || 'User'}!
            </h1>
            <p className="text-blue-100">
              Here's what's happening with your projects today.
            </p>
          </div>
          {selectedRepository && (
            <GitSyncIndicator repositoryId={selectedRepository} compact />
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Tasks */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-200 transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Tasks</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{activeTasks}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-green-600 font-medium">{completedTasks} completed</span>
            <span className="text-gray-500 ml-1">this week</span>
          </div>
        </div>

        {/* Repositories */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-green-200 transition-all duration-200 transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Repositories</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{repositories.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <GitBranch className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-green-600 font-medium">
              {repositories.filter(r => r.status === 'connected').length} connected
            </span>
          </div>
        </div>

        {/* Team Members */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-amber-200 transition-all duration-200 transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Team Members</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">3</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-green-600 font-medium">{onlineTeamMembers} online</span>
            <span className="text-gray-500 ml-1">right now</span>
          </div>
        </div>

        {/* Performance */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-purple-200 transition-all duration-200 transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Performance</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{performanceScore}%</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-green-600 font-medium">+5%</span>
            <span className="text-gray-500 ml-1">from last week</span>
          </div>
        </div>
      </div>

      {/* Repository Selection */}
      {repositories.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Select Repository:
            </label>
            <select
              value={selectedRepository || ''}
              onChange={(e) => setSelectedRepository(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {repositories.map(repo => (
                <option key={repo.id} value={repo.id}>
                  {repo.name} ({repo.branch})
                </option>
              ))}
            </select>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/repositories')}
            >
              Manage Repositories
            </Button>
          </div>
        </div>
      )}

      {/* Git Integration Features */}
      {selectedRepository ? (
        <div className="space-y-8">
          {/* Repository Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RepositoryStatisticsCard repositoryId={selectedRepository} />
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Git Sync Status</h3>
              <GitSyncIndicator repositoryId={selectedRepository} showEvents />
            </div>
          </div>

          {/* Branch Health and PR Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BranchHealthVisualization repositoryId={selectedRepository} />
            <PullRequestStatus repositoryId={selectedRepository} />
          </div>
        </div>
      ) : (
        <Alert variant="info">
          <p>No repositories found. Add a repository to see Git integration features.</p>
          <Button
            variant="primary"
            size="sm"
            className="mt-2"
            onClick={() => navigate('/repositories')}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Repository
          </Button>
        </Alert>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="secondary"
            onClick={() => navigate('/tasks')}
            className="justify-start"
          >
            <Plus className="w-4 h-4 mr-2 text-blue-600" />
            Create Task
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/repositories')}
            className="justify-start"
          >
            <GitBranch className="w-4 h-4 mr-2 text-green-600" />
            Add Repository
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/terminal')}
            className="justify-start"
          >
            <Code2 className="w-4 h-4 mr-2 text-amber-600" />
            Open Terminal
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/analytics')}
            className="justify-start"
          >
            <BarChart3 className="w-4 h-4 mr-2 text-purple-600" />
            View Analytics
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {reposError && (
        <Alert variant="error">
          <p>Failed to load repositories: {reposError}</p>
        </Alert>
      )}
    </div>
  )
}

export default DashboardIntegrated