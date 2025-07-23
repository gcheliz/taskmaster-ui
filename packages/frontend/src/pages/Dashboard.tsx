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

  const projectHealth = 85 // Default project health score
  const healthColor = projectHealth >= 80 ? 'text-green-600' : projectHealth >= 60 ? 'text-amber-600' : 'text-red-600'
  const healthBg = projectHealth >= 80 ? 'bg-green-50' : projectHealth >= 60 ? 'bg-amber-50' : 'bg-red-50'

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-6 sm:space-y-8 lg:space-y-10">
        {/* Welcome Section */}
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
            Project Overview
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Welcome back, {user?.name?.split(' ')[0]}. Here's your project planning dashboard.
          </p>
        </div>

        {/* Project Health Overview */}
        <div className="max-w-7xl mx-auto w-full">
          <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Project Health</h2>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${healthBg} border ${healthColor.replace('text-', 'border-')} self-start sm:self-auto`}>
                <Activity className={`w-4 h-4 ${healthColor}`} />
                <span className={`text-sm sm:text-base font-semibold ${healthColor}`}>{projectHealth}%</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">{completionRate}%</div>
                <div className="text-sm text-gray-600 mt-2">Completion Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">{activeRepos}</div>
                <div className="text-sm text-gray-600 mt-2">Active Repos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">3</div>
                <div className="text-sm text-gray-600 mt-2">Team Members</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                  {dashboardData.data?.taskMetrics?.statusBreakdown?.['in-progress'] || inProgressTasks}
                </div>
                <div className="text-sm text-gray-600 mt-2">In Progress</div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {/* Total Tasks */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl sm:rounded-2xl border border-blue-100 p-5 sm:p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl shadow-sm flex items-center justify-center">
                  <Target className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
                </div>
                <span className="text-sm text-blue-600 font-medium">This Sprint</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{totalTasks}</div>
              <div className="text-sm text-gray-600 mt-1">Total Tasks</div>
              <div className="mt-4 pt-4 border-t border-blue-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-semibold text-gray-900">{completedTasks}</span>
                </div>
              </div>
            </div>

            {/* Sprint Progress */}
            <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl sm:rounded-2xl border border-green-100 p-5 sm:p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl shadow-sm flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
                </div>
                <div className="flex items-center text-sm text-green-600 font-medium">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>12%</span>
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{completionRate}%</div>
              <div className="text-sm text-gray-600 mt-1">Sprint Progress</div>
              <div className="mt-4 pt-4 border-t border-green-100">
                <div className="w-full bg-green-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Blocked Items */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl sm:rounded-2xl border border-amber-100 p-5 sm:p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl shadow-sm flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 sm:w-7 sm:h-7 text-amber-600" />
                </div>
                <span className="text-sm text-amber-600 font-medium">Attention</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{blockedTasks}</div>
              <div className="text-sm text-gray-600 mt-1">Blocked Tasks</div>
              <div className="mt-4 pt-4 border-t border-amber-100">
                <button 
                  onClick={() => navigate('/tasks')}
                  className="text-sm text-amber-600 hover:text-amber-700 font-semibold transition-colors"
                >
                  View blocked items →
                </button>
              </div>
            </div>

            {/* Team Velocity */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl sm:rounded-2xl border border-purple-100 p-5 sm:p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl shadow-sm flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" />
                </div>
                <span className="text-sm text-purple-600 font-medium">Avg/Week</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">24</div>
              <div className="text-sm text-gray-600 mt-1">Team Velocity</div>
              <div className="mt-4 pt-4 border-t border-purple-100">
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-1.5" />
                  <span className="font-medium">On track</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Timeline & Milestones */}
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            {/* Upcoming Milestones */}
            <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl sm:rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Upcoming Milestones</h3>
                <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-gray-600" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-blue-600 rounded-full mt-1.5 flex-shrink-0 ring-4 ring-blue-100"></div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Authentication System</div>
                    <div className="text-sm text-gray-600 mt-1">Due in 5 days • 85% complete</div>
                    <div className="mt-3 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-green-600 rounded-full mt-1.5 flex-shrink-0 ring-4 ring-green-100"></div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Repository Integration</div>
                    <div className="text-sm text-gray-600 mt-1">Due in 12 days • 60% complete</div>
                    <div className="mt-3 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-purple-600 rounded-full mt-1.5 flex-shrink-0 ring-4 ring-purple-100"></div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Dashboard Analytics</div>
                    <div className="text-sm text-gray-600 mt-1">Due in 20 days • 30% complete</div>
                    <div className="mt-3 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500" style={{ width: '30%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Repository Status */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl sm:rounded-2xl border border-green-100 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Repository Status</h3>
                <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center">
                  <GitBranch className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="space-y-3">
                {repositories.slice(0, 4).map((repo: any) => (
                  <div key={repo.id} className="flex items-center justify-between p-3.5 bg-white/70 rounded-lg border border-green-100/50 hover:bg-white transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        repo.status === 'active' ? 'bg-green-600 shadow-green-200 shadow-sm' : 
                        repo.status === 'inactive' ? 'bg-gray-400' : 'bg-red-600 shadow-red-200 shadow-sm'
                      }`} />
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">{repo.name}</div>
                        <div className="text-sm text-gray-600">{repo.gitBranch || 'main'}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate('/repositories')}
                      className="text-sm text-green-600 hover:text-green-700 font-medium px-3 py-1 rounded-md hover:bg-green-50 transition-colors"
                    >
                      View
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => navigate('/repositories')}
                  className="w-full mt-2 text-sm text-green-600 hover:text-green-700 font-semibold py-2.5 rounded-lg hover:bg-green-50 transition-colors"
                >
                  View all repositories →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Team Activity */}
        <div className="max-w-7xl mx-auto w-full">
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl sm:rounded-2xl border border-indigo-100 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Recent Team Activity</h3>
              <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {dashboardData.data?.recentActivity?.slice(0, 5).map((activity, index) => (
                <div key={activity.id || index} className="flex items-start gap-3 p-3 bg-white/70 rounded-lg hover:bg-white transition-colors">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-xs font-semibold text-white">
                      {activity.author?.charAt(0) || 'S'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base text-gray-900 break-words font-medium">{activity.message}</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      {activity.author} • {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {(!dashboardData.data?.recentActivity || dashboardData.data.recentActivity.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No recent activity to display</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
            <button 
              onClick={() => navigate('/tasks')}
              className="group bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 sm:p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] text-center"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-3 group-hover:shadow-md transition-shadow">
                <Target className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <span className="text-sm sm:text-base text-gray-700 font-semibold">View Tasks</span>
            </button>
            
            <button 
              onClick={() => navigate('/repositories')}
              className="group bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-xl p-5 sm:p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] text-center"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-3 group-hover:shadow-md transition-shadow">
                <GitBranch className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
              </div>
              <span className="text-sm sm:text-base text-gray-700 font-semibold">Repositories</span>
            </button>

            <button 
              onClick={() => navigate('/analytics')}
              className="group bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100 rounded-xl p-5 sm:p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] text-center"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-3 group-hover:shadow-md transition-shadow">
                <BarChart3 className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" />
              </div>
              <span className="text-sm sm:text-base text-gray-700 font-semibold">Analytics</span>
            </button>

            <button 
              onClick={() => navigate('/calendar')}
              className="group bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 rounded-xl p-5 sm:p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] text-center"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-3 group-hover:shadow-md transition-shadow">
                <Calendar className="w-7 h-7 sm:w-8 sm:h-8 text-amber-600" />
              </div>
              <span className="text-sm sm:text-base text-gray-700 font-semibold">Calendar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard