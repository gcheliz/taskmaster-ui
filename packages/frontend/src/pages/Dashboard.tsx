import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useRepositoryList } from '../hooks/useRepositoryList'
import { useTaskData } from '../hooks/useTaskData'
import { useDashboard } from '../hooks/useDashboard'
import { Spinner } from '../components/ui/atoms/Spinner'
import { 
  TrendingUp, 
  ArrowUpRight, 
  GitBranch, 
  Users, 
  BarChart3,
  Calendar,
  Target,
  Activity,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { repositories, isLoading: reposLoading } = useRepositoryList()
  const { tasksData, isLoading: tasksLoading } = useTaskData()
  const dashboardData = useDashboard({ projectId: 'default' })

  const isLoading = reposLoading || tasksLoading || dashboardData.loading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  const tasks = tasksData?.tasks || []
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t: any) => t.status === 'done').length
  const inProgressTasks = tasks.filter((t: any) => t.status === 'in-progress').length
  const blockedTasks = tasks.filter((t: any) => t.status === 'blocked').length
  
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const activeRepos = repositories.filter((r: any) => r.status === 'active').length

  const projectHealth = dashboardData.health?.overallScore || 85
  const healthColor = projectHealth >= 80 ? 'text-green-600' : projectHealth >= 60 ? 'text-amber-600' : 'text-red-600'
  const healthBg = projectHealth >= 80 ? 'bg-green-50' : projectHealth >= 60 ? 'bg-amber-50' : 'bg-red-50'

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 px-4 sm:px-6 lg:px-0">
      {/* Welcome Section */}
      <div className="pt-4 sm:pt-0">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
          Project Overview
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Welcome back, {user?.name?.split(' ')[0]}. Here's your project planning dashboard.
        </p>
      </div>

      {/* Project Health Overview */}
      <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Project Health</h2>
          <div className={`flex items-center gap-2 px-3 py-1.5 sm:py-1 rounded-full ${healthBg} self-start sm:self-auto`}>
            <Activity className={`w-4 h-4 ${healthColor}`} />
            <span className={`text-sm sm:text-base font-medium ${healthColor}`}>{projectHealth}%</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="text-center p-3 sm:p-0 rounded-lg bg-gray-50 sm:bg-transparent">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{completionRate}%</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">Completion Rate</div>
          </div>
          <div className="text-center p-3 sm:p-0 rounded-lg bg-gray-50 sm:bg-transparent">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{activeRepos}</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">Active Repos</div>
          </div>
          <div className="text-center p-3 sm:p-0 rounded-lg bg-gray-50 sm:bg-transparent">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">3</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">Team Members</div>
          </div>
          <div className="text-center p-3 sm:p-0 rounded-lg bg-gray-50 sm:bg-transparent">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">
              {dashboardData.data?.taskMetrics?.statusBreakdown?.['in-progress'] || inProgressTasks}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">In Progress</div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {/* Total Tasks */}
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-5 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <span className="text-xs sm:text-sm text-gray-500">This Sprint</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">{totalTasks}</div>
          <div className="text-xs sm:text-sm text-gray-600 mt-1">Total Tasks</div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-gray-600">Completed</span>
              <span className="font-medium text-gray-900">{completedTasks}</span>
            </div>
          </div>
        </div>

        {/* Sprint Progress */}
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-5 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <div className="flex items-center text-xs sm:text-sm text-green-600">
              <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>12%</span>
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">{completionRate}%</div>
          <div className="text-xs sm:text-sm text-gray-600 mt-1">Sprint Progress</div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
              <div 
                className="bg-green-600 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Blocked Items */}
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-5 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-50 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
            </div>
            <span className="text-xs sm:text-sm text-gray-500">Attention</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">{blockedTasks}</div>
          <div className="text-xs sm:text-sm text-gray-600 mt-1">Blocked Tasks</div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <button 
              onClick={() => navigate('/tasks')}
              className="text-xs sm:text-sm text-amber-600 hover:text-amber-700 font-medium touch-target"
            >
              View blocked items →
            </button>
          </div>
        </div>

        {/* Team Velocity */}
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-5 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
            <span className="text-xs sm:text-sm text-gray-500">Avg/Week</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">24</div>
          <div className="text-xs sm:text-sm text-gray-600 mt-1">Team Velocity</div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center text-xs sm:text-sm text-gray-600">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mr-1" />
              <span>On track</span>
            </div>
          </div>
        </div>
      </div>

      {/* Project Timeline & Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Upcoming Milestones */}
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Upcoming Milestones</h3>
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hidden sm:block" />
          </div>
          <div className="space-y-3 sm:space-y-4 overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <div className="flex items-start gap-2 sm:gap-3 min-w-0">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm sm:text-base text-gray-900 truncate">Authentication System</div>
                <div className="text-xs sm:text-sm text-gray-600">Due in 5 days • 85% complete</div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1 sm:h-1.5">
                  <div className="bg-blue-600 h-1 sm:h-1.5 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2 sm:gap-3 min-w-0">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm sm:text-base text-gray-900 truncate">Repository Integration</div>
                <div className="text-xs sm:text-sm text-gray-600">Due in 12 days • 60% complete</div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1 sm:h-1.5">
                  <div className="bg-green-600 h-1 sm:h-1.5 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2 sm:gap-3 min-w-0">
              <div className="w-2 h-2 bg-purple-600 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm sm:text-base text-gray-900 truncate">Dashboard Analytics</div>
                <div className="text-xs sm:text-sm text-gray-600">Due in 20 days • 30% complete</div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1 sm:h-1.5">
                  <div className="bg-purple-600 h-1 sm:h-1.5 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Repository Status */}
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Repository Status</h3>
            <GitBranch className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hidden sm:block" />
          </div>
          <div className="space-y-2 sm:space-y-3">
            {repositories.slice(0, 4).map((repo: any) => (
              <div key={repo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    repo.status === 'active' ? 'bg-green-600' : 
                    repo.status === 'inactive' ? 'bg-gray-400' : 'bg-red-600'
                  }`} />
                  <div className="min-w-0">
                    <div className="font-medium text-sm sm:text-base text-gray-900 truncate">{repo.name}</div>
                    <div className="text-xs sm:text-sm text-gray-600">{repo.gitBranch || 'main'}</div>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/repositories')}
                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 touch-target px-2"
                >
                  View
                </button>
              </div>
            ))}
            <button 
              onClick={() => navigate('/repositories')}
              className="w-full mt-2 text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium py-2 touch-target"
            >
              View all repositories →
            </button>
          </div>
        </div>
      </div>

      {/* Team Activity */}
      <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Team Activity</h3>
          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hidden sm:block" />
        </div>
        <div className="space-y-3 max-h-64 sm:max-h-none overflow-y-auto">
          {dashboardData.data?.recentActivity?.slice(0, 5).map((activity, index) => (
            <div key={activity.id || index} className="flex items-start gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium text-blue-700">
                  {activity.author?.charAt(0) || 'S'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base text-gray-900 break-words">{activity.message}</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  {activity.author} • {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pb-4 sm:pb-0">
        <button 
          onClick={() => navigate('/tasks')}
          className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow text-center touch-target"
        >
          <Target className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-1 sm:mb-2" />
          <span className="text-xs sm:text-sm lg:text-base text-gray-700 font-medium">View Tasks</span>
        </button>
        
        <button 
          onClick={() => navigate('/repositories')}
          className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow text-center touch-target"
        >
          <GitBranch className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mb-1 sm:mb-2" />
          <span className="text-xs sm:text-sm lg:text-base text-gray-700 font-medium">Repositories</span>
        </button>

        <button 
          onClick={() => navigate('/analytics')}
          className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow text-center touch-target"
        >
          <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 mx-auto mb-1 sm:mb-2" />
          <span className="text-xs sm:text-sm lg:text-base text-gray-700 font-medium">Analytics</span>
        </button>

        <button 
          onClick={() => navigate('/calendar')}
          className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow text-center touch-target"
        >
          <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600 mx-auto mb-1 sm:mb-2" />
          <span className="text-xs sm:text-sm lg:text-base text-gray-700 font-medium">Calendar</span>
        </button>
      </div>
    </div>
  )
}

export default Dashboard