import React, { useState } from 'react'
import { Button } from '../components/ui/Button'
import { 
  Plus, 
  Filter, 
  Calendar, 
  User, 
  Tag, 
  Clock, 
  CheckCircle2,
  Circle,
  AlertCircle,
  Search,
  ArrowUpRight,
  GitBranch,
  MoreVertical,
  ArrowRight
} from 'lucide-react'

const Tasks = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Mock task data
  const mockTasks = [
    {
      id: 1,
      title: 'Implement user authentication flow',
      description: 'Create login and registration components with JWT authentication',
      status: 'in-progress',
      priority: 'high',
      assignee: 'John Doe',
      dueDate: '2024-01-25',
      tags: ['auth', 'frontend', 'security'],
      progress: 65,
      repository: 'taskmaster-ui'
    },
    {
      id: 2,
      title: 'Design database schema for task management',
      description: 'Create ERD and implement Prisma schema for task-related models',
      status: 'pending',
      priority: 'high',
      assignee: 'Jane Smith',
      dueDate: '2024-01-28',
      tags: ['database', 'backend', 'architecture'],
      progress: 0,
      repository: 'taskmaster-backend'
    },
    {
      id: 3,
      title: 'Add real-time notifications',
      description: 'Implement WebSocket connections for live task updates',
      status: 'completed',
      priority: 'medium',
      assignee: 'Bob Johnson',
      dueDate: '2024-01-20',
      tags: ['websocket', 'realtime', 'frontend'],
      progress: 100,
      repository: 'taskmaster-ui'
    },
    {
      id: 4,
      title: 'Create API documentation',
      description: 'Document all REST endpoints using Swagger/OpenAPI',
      status: 'in-progress',
      priority: 'medium',
      assignee: 'Alice Brown',
      dueDate: '2024-01-30',
      tags: ['documentation', 'api', 'backend'],
      progress: 40,
      repository: 'api-gateway'
    },
    {
      id: 5,
      title: 'Implement task search functionality',
      description: 'Add full-text search with filters and sorting options',
      status: 'pending',
      priority: 'low',
      assignee: 'Charlie Wilson',
      dueDate: '2024-02-05',
      tags: ['search', 'frontend', 'ux'],
      progress: 0,
      repository: 'taskmaster-ui'
    },
    {
      id: 6,
      title: 'Setup CI/CD pipeline',
      description: 'Configure GitHub Actions for automated testing and deployment',
      status: 'completed',
      priority: 'high',
      assignee: 'Diana Martinez',
      dueDate: '2024-01-15',
      tags: ['devops', 'automation', 'infrastructure'],
      progress: 100,
      repository: 'infrastructure'
    },
    {
      id: 7,
      title: 'Performance optimization',
      description: 'Optimize React components and reduce bundle size',
      status: 'in-progress',
      priority: 'medium',
      assignee: 'Eric Davis',
      dueDate: '2024-02-01',
      tags: ['performance', 'optimization', 'frontend'],
      progress: 30,
      repository: 'taskmaster-ui'
    },
    {
      id: 8,
      title: 'Mobile responsive design',
      description: 'Ensure all components work well on mobile devices',
      status: 'pending',
      priority: 'medium',
      assignee: 'Fiona Garcia',
      dueDate: '2024-02-10',
      tags: ['mobile', 'responsive', 'css'],
      progress: 0,
      repository: 'taskmaster-ui'
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'in-progress':
        return <Circle className="w-5 h-5 text-blue-600" />
      case 'pending':
        return <Circle className="w-5 h-5 text-gray-400" />
      default:
        return <AlertCircle className="w-5 h-5 text-red-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'medium':
        return 'text-amber-600 bg-amber-50 border-amber-200'
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-700 bg-green-50 border-green-200'
      case 'in-progress':
        return 'text-blue-700 bg-blue-50 border-blue-200'
      case 'pending':
        return 'text-gray-700 bg-gray-50 border-gray-200'
      default:
        return 'text-red-700 bg-red-50 border-red-200'
    }
  }

  // Filter tasks based on search and status
  const filteredTasks = mockTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="bg-white p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Minimalist Header */}
        <div className="border-b border-gray-100 pb-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>
              <p className="text-sm text-gray-500 mt-1">{mockTasks.length} total tasks</p>
            </div>
            <Button className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-200 transform hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{mockTasks.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center text-sm">
              <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">+12%</span>
              <span className="text-gray-500 ml-1">from last week</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-green-200 transition-all duration-200 transform hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {mockTasks.filter(t => t.status === 'completed').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-green-600 font-medium">
                {Math.round((mockTasks.filter(t => t.status === 'completed').length / mockTasks.length) * 100)}%
              </span>
              <span className="text-gray-500 ml-1">completion rate</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-amber-200 transition-all duration-200 transform hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {mockTasks.filter(t => t.status === 'in-progress').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-amber-600 font-medium">3 urgent</span>
              <span className="text-gray-500 ml-1">tasks</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-purple-200 transition-all duration-200 transform hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Due This Week</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">5</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-purple-600 font-medium">2 overdue</span>
              <span className="text-gray-500 ml-1">tasks</span>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search tasks..."
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
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <button className="px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 hover:bg-white transition-colors flex items-center gap-2">
              <Filter className="w-4 h-4" />
              More Filters
            </button>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div key={task.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {getStatusIcon(task.status)}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{task.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-gray-500">
                        <User className="w-4 h-4" />
                        <span>{task.assignee}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{task.dueDate}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <GitBranch className="w-4 h-4" />
                        <span>{task.repository}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex items-center gap-2 mt-3">
                      {task.tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 bg-gray-50 rounded-md">
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Progress Bar */}
                    {task.progress > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500">Progress</span>
                          <span className="text-xs text-gray-600 font-medium">{task.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                    {task.status.replace('-', ' ')}
                  </span>
                  <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors flex items-center gap-1">
                  View Details
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first task'}
            </p>
            {(!searchTerm && statusFilter === 'all') && (
              <button className="inline-flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                Create Task
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Tasks