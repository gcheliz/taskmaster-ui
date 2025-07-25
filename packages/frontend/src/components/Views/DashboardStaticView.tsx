import React from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useRepositoryList } from '../../hooks/useRepositoryList'
import { useTaskData } from '../../hooks/useTaskData'
import { useDashboard } from '../../hooks/useDashboard'
import { Spinner } from '../ui/atoms/Spinner'
import { TrendingUp, ArrowUpRight } from 'lucide-react'

export const DashboardStaticView = () => {
  const { user } = useAuth()
  const { repositories, isLoading: reposLoading } = useRepositoryList()
  const { tasksData, isLoading: tasksLoading } = useTaskData()
  const dashboardData = useDashboard({ projectId: 'default' })

  const isLoading = reposLoading || tasksLoading || dashboardData.loading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <Spinner size="lg" />
      </div>
    )
  }

  const tasks = tasksData?.tasks || []
  const activeTasks = tasks.filter((t: any) => t.status === 'in-progress').length
  const completedToday = tasks.filter((t: any) => {
    const completedToday = new Date(t.metadata?.updated || '').toDateString() === new Date().toDateString()
    return t.status === 'done' && completedToday
  }).length

  const activeRepos = repositories.filter((r: any) => r.status === 'active' || r.status === 'connected').length
  const onlineTeamMembers = 2 // This would come from real-time data
  const performanceScore = dashboardData.data?.taskMetrics?.total ? 
    Math.round((dashboardData.data.taskMetrics.completed / dashboardData.data.taskMetrics.total) * 100) : 92

  return (
    <div className="bg-slate-950 text-slate-50 min-h-screen">
      {/* Main Content */}
      <main className="p-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.name?.split(' ')[0] || 'User'} 👋
          </h1>
          <p className="text-slate-400">Your comprehensive task management dashboard</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Active Tasks */}
          <div className="stat-card bg-slate-800 border border-slate-700 rounded-xl p-6 hover:transform hover:-translate-y-1 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Active Tasks</p>
                <p className="text-2xl font-bold text-white">{activeTasks}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-green-500">+{completedToday}</span>
              <span className="text-slate-400 ml-1">completed today</span>
            </div>
          </div>

          {/* Repositories */}
          <div className="stat-card bg-slate-800 border border-slate-700 rounded-xl p-6 hover:transform hover:-translate-y-1 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Repositories</p>
                <p className="text-2xl font-bold text-white">{repositories.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 7a2 2 0 012-2h10a2 2 0 012 2v2M7 7h10"></path>
                </svg>
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-green-500">{activeRepos} active</span>
              <span className="text-slate-400 ml-1">deployments</span>
            </div>
          </div>

          {/* Team Members */}
          <div className="stat-card bg-slate-800 border border-slate-700 rounded-xl p-6 hover:transform hover:-translate-y-1 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Team Members</p>
                <p className="text-2xl font-bold text-white">3</p>
              </div>
              <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                </svg>
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-green-500">{onlineTeamMembers} online</span>
              <span className="text-slate-400 ml-1">right now</span>
            </div>
          </div>

          {/* Performance */}
          <div className="stat-card bg-slate-800 border border-slate-700 rounded-xl p-6 hover:transform hover:-translate-y-1 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Performance</p>
                <p className="text-2xl font-bold text-white">{performanceScore}%</p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500">+5%</span>
              <span className="text-slate-400 ml-1">from last week</span>
            </div>
          </div>
        </div>

        {/* Activity and Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Activity */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {dashboardData.data?.recentActivity?.slice(0, 5).map((activity, index) => (
                <div key={activity.id || index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-slate-300">{activity.message}</p>
                    <p className="text-slate-500 text-sm">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Project Health */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Project Health</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Overall Health</span>
                  <span className="text-white font-medium">
                    {dashboardData.health?.overallScore || 85}%
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-[width] duration-300"
                    style={{ width: `${dashboardData.health?.overallScore || 85}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Task Completion</span>
                  <span className="text-white font-medium">{performanceScore}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-[width] duration-300"
                    style={{ width: `${performanceScore}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Code Quality</span>
                  <span className="text-white font-medium">
                    {dashboardData.health?.metrics?.codeQuality || 82}%
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-[width] duration-300"
                    style={{ width: `${dashboardData.health?.metrics?.codeQuality || 82}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Test Coverage</span>
                  <span className="text-white font-medium">
                    {dashboardData.health?.metrics?.testCoverage || 76}%
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-[width] duration-300"
                    style={{ width: `${dashboardData.health?.metrics?.testCoverage || 76}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg p-4 transition-colors text-center">
              <svg className="w-8 h-8 text-blue-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
              <span className="text-slate-300">Create Task</span>
            </button>
            
            <button className="bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg p-4 transition-colors text-center">
              <svg className="w-8 h-8 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
              <span className="text-slate-300">Add Repository</span>
            </button>

            <button className="bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg p-4 transition-colors text-center">
              <svg className="w-8 h-8 text-amber-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <span className="text-slate-300">Open Terminal</span>
            </button>

            <button className="bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg p-4 transition-colors text-center">
              <svg className="w-8 h-8 text-purple-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              <span className="text-slate-300">View Analytics</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default DashboardStaticView