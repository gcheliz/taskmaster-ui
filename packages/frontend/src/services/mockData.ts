// Mock data service for development and testing
import type { Repository } from '../hooks/useRepositoryFilters'
import type { RepositoryDetailsResponse, RepositoryHealthMetrics } from './repositoryService'
import type { DashboardData, ProjectHealthData } from './api'

// Helper to generate random dates
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// Mock Repositories
export const mockRepositories: Repository[] = [
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
  },
  {
    id: 'repo-5',
    name: 'docs-site',
    path: '/Users/gonzalo/workspace/docs-site',
    status: 'error',
    isGitRepository: true,
    isTaskMasterProject: false,
    gitBranch: 'main',
    lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    connectedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// Mock Repository Details
export const mockRepositoryDetails: Record<string, RepositoryDetailsResponse> = {
  'repo-1': {
    name: 'taskmaster-ui',
    path: '/Users/gonzalo/workspace/taskmaster-ui',
    currentBranch: 'main',
    lastCommit: {
      hash: 'a1b2c3d4e5f6',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      message: 'feat: Add repository search and filtering',
      author: {
        name: 'Gonzalo Martinez',
        email: 'gonzalo@example.com',
      },
    },
    status: {
      isClean: false,
      staged: 3,
      unstaged: 5,
      untracked: 2,
      conflicted: 0,
      ahead: 2,
      behind: 0,
    },
    remotes: [
      {
        name: 'origin',
        url: 'https://github.com/gonzalo/taskmaster-ui.git',
      },
    ],
    branches: [
      {
        name: 'main',
        isLocal: true,
        isRemote: true,
        isCurrent: true,
        lastCommit: {
          hash: 'a1b2c3d4e5f6',
          date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          message: 'feat: Add repository search and filtering',
          author: {
            name: 'Gonzalo Martinez',
            email: 'gonzalo@example.com',
          },
        },
        tracking: {
          remote: 'origin/main',
          ahead: 2,
          behind: 0,
        },
      },
      {
        name: 'feature/dashboard-redesign',
        isLocal: true,
        isRemote: true,
        isCurrent: false,
        lastCommit: {
          hash: 'b2c3d4e5f6a7',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          message: 'wip: Dashboard layout improvements',
          author: {
            name: 'Gonzalo Martinez',
            email: 'gonzalo@example.com',
          },
        },
      },
      {
        name: 'fix/auth-bug',
        isLocal: true,
        isRemote: false,
        isCurrent: false,
        lastCommit: {
          hash: 'c3d4e5f6a7b8',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          message: 'fix: Resolve authentication token refresh issue',
          author: {
            name: 'Gonzalo Martinez',
            email: 'gonzalo@example.com',
          },
        },
      },
    ],
  },
}

// Mock Repository Health
export const mockRepositoryHealth: Record<string, RepositoryHealthMetrics> = {
  'repo-1': {
    score: 85,
    issues: [
      {
        severity: 'medium',
        type: 'quality',
        message: 'Code complexity in TaskBoard component exceeds threshold',
        file: 'src/components/TaskBoard.tsx',
        line: 234,
      },
      {
        severity: 'low',
        type: 'maintenance',
        message: '3 TODO comments found in codebase',
      },
      {
        severity: 'high',
        type: 'security',
        message: 'Outdated dependency: react-router-dom@5.3.0 has known vulnerabilities',
      },
    ],
    metrics: {
      codeQuality: {
        score: 82,
        complexity: 15.3,
        duplication: 3.2,
        maintainabilityIndex: 78,
      },
      security: {
        score: 75,
        vulnerabilities: 2,
        outdatedDependencies: 5,
      },
      performance: {
        score: 90,
        bundleSize: 2.3,
        buildTime: 45,
      },
      testing: {
        score: 88,
        coverage: 76.5,
        testsCount: 234,
        passRate: 98.7,
      },
    },
    trends: {
      period: 'last-30-days',
      data: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
        score: 80 + Math.floor(Math.random() * 10),
        commits: Math.floor(Math.random() * 10),
        contributors: Math.floor(Math.random() * 3) + 1,
      })),
    },
  },
}

// Mock Tasks
export const mockTasks = [
  {
    id: 'task-1',
    title: 'Implement user authentication',
    description: 'Add JWT-based authentication to the API',
    status: 'done',
    priority: 'high',
    assignee: 'Gonzalo Martinez',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-2',
    title: 'Design dashboard wireframes',
    description: 'Create wireframes for the new dashboard layout',
    status: 'in-progress',
    priority: 'medium',
    assignee: 'Sarah Chen',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-3',
    title: 'Fix mobile responsive issues',
    description: 'Resolve layout problems on mobile devices',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Alex Johnson',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-4',
    title: 'Write API documentation',
    description: 'Document all REST endpoints with examples',
    status: 'pending',
    priority: 'low',
    assignee: 'Mike Wilson',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-5',
    title: 'Optimize database queries',
    description: 'Improve performance of slow queries',
    status: 'pending',
    priority: 'medium',
    assignee: 'Gonzalo Martinez',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-6',
    title: 'Set up CI/CD pipeline',
    description: 'Configure GitHub Actions for automated testing and deployment',
    status: 'pending',
    priority: 'high',
    assignee: 'Alex Johnson',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-7',
    title: 'Implement search functionality',
    description: 'Add full-text search capabilities to the application',
    status: 'review',
    priority: 'medium',
    assignee: 'Sarah Chen',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-8',
    title: 'Update user profile UI',
    description: 'Redesign the user profile page with new components',
    status: 'review',
    priority: 'low',
    assignee: 'Mike Wilson',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-9',
    title: 'Add email notifications',
    description: 'Implement email notifications for task updates',
    status: 'done',
    priority: 'medium',
    assignee: 'Gonzalo Martinez',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-10',
    title: 'Performance optimization',
    description: 'Optimize React component rendering and bundle size',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Sarah Chen',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
]

// Mock Dashboard Data
export const mockDashboardData: DashboardData = {
  project: {
    id: 'proj-1',
    name: 'TaskMaster Suite',
    path: '/Users/gonzalo/workspace/taskmaster-suite',
    lastUpdated: new Date().toISOString(),
  },
  taskMetrics: {
    total: 156,
    completed: 89,
    inProgress: 34,
    pending: 28,
    blocked: 3,
    deferred: 2,
    cancelled: 0,
    completionRate: 57.1,
    statusBreakdown: {
      done: 89,
      'in-progress': 34,
      pending: 28,
      blocked: 3,
      deferred: 2,
    },
    priorityBreakdown: {
      high: 45,
      medium: 78,
      low: 33,
    },
    complexityDistribution: {
      simple: 67,
      moderate: 65,
      complex: 24,
    },
  },
  subtaskMetrics: {
    total: 412,
    completed: 298,
    inProgress: 67,
    pending: 47,
    completionRate: 72.3,
  },
  recentActivity: [
    {
      id: 'act-1',
      type: 'commit',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      message: 'feat: Add repository search functionality',
      author: 'Gonzalo Martinez',
      details: { repository: 'taskmaster-ui', branch: 'main' },
    },
    {
      id: 'act-2',
      type: 'task_update',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      message: 'Task completed: Implement user authentication',
      author: 'Sarah Chen',
      details: { taskId: 'task-1', previousStatus: 'in-progress', newStatus: 'done' },
    },
    {
      id: 'act-3',
      type: 'project_update',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      message: 'New repository connected: api-gateway',
      author: 'System',
      details: { repositoryId: 'repo-3' },
    },
  ],
  chartData: {
    taskCompletionTrend: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
      completed: 80 + Math.floor(Math.random() * 20),
      total: 150 + Math.floor(Math.random() * 10),
      completionRate: 50 + Math.floor(Math.random() * 15),
    })),
    priorityDistribution: [
      { priority: 'High', count: 45, percentage: 28.8 },
      { priority: 'Medium', count: 78, percentage: 50.0 },
      { priority: 'Low', count: 33, percentage: 21.2 },
    ],
    complexityBreakdown: [
      { complexity: 'Simple', count: 67, averageTime: 2.5 },
      { complexity: 'Moderate', count: 65, averageTime: 5.2 },
      { complexity: 'Complex', count: 24, averageTime: 12.8 },
    ],
  },
  insights: {
    totalEstimatedHours: 240,
    averageTaskComplexity: 2.3,
    productivityScore: 78,
    recommendations: [
      'Consider breaking down complex tasks into smaller subtasks',
      'Allocate more resources to high-priority items',
      'Review and update blocked tasks',
      'Improve task estimation accuracy',
    ],
  },
}

// Mock Project Health Data
export const mockProjectHealth: ProjectHealthData = {
  score: 85,
  status: 'good',
  overallScore: 85,
  timestamp: new Date().toISOString(),
  metrics: {
    codeQuality: 82,
    testCoverage: 76,
    documentation: 68,
    performance: 90,
    security: 88,
    total: 156,
    completed: 123,
    inProgress: 20,
    pending: 13,
    blocked: 0,
    deferred: 0,
    cancelled: 0,
    completionRate: 78.8,
    statusBreakdown: {},
    priorityBreakdown: {},
    complexityDistribution: {},
  },
  trends: {
    daily: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
      score: 80 + Math.floor(Math.random() * 10),
    })),
    weekly: Array.from({ length: 4 }, (_, i) => ({
      date: new Date(Date.now() - (3 - i) * 7 * 24 * 60 * 60 * 1000).toISOString(),
      score: 82 + Math.floor(Math.random() * 8),
    })),
  },
  issues: [
    {
      id: '1',
      type: 'warning',
      message: 'API documentation coverage is below 70%',
      severity: 'medium',
      timestamp: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'error',
      message: '2 high-severity vulnerabilities in dependencies',
      severity: 'high',
      timestamp: new Date().toISOString(),
    },
  ],
}

// Mock Terminal Sessions
export const mockTerminalSessions = [
  {
    id: 'term-1',
    name: 'Frontend Dev',
    type: 'bash',
    status: 'active',
    output: [
      '$ pnpm run dev',
      '',
      '> frontend@0.0.0 dev /Users/gonzalo/workspace/taskmaster-ui/packages/frontend',
      '> vite',
      '',
      '  VITE v5.0.0  ready in 523 ms',
      '',
      '  ➜  Local:   http://localhost:5173/',
      '  ➜  Network: http://192.168.1.100:5173/',
    ].join('\n'),
  },
  {
    id: 'term-2',
    name: 'Backend API',
    type: 'bash',
    status: 'active',
    output: [
      '$ pnpm run start:dev',
      '',
      '> backend@1.0.0 start:dev /Users/gonzalo/workspace/taskmaster-ui/packages/backend',
      '> nodemon',
      '',
      '[nodemon] 3.0.1',
      '[nodemon] to restart at any time, enter `rs`',
      '[nodemon] watching path(s): src/**/*',
      '[nodemon] watching extensions: ts,js',
      '[nodemon] starting `ts-node src/index.ts`',
      '[INFO] Server running on http://localhost:3001',
      '[INFO] Database connected successfully',
    ].join('\n'),
  },
  {
    id: 'term-3',
    name: 'Git Operations',
    type: 'bash',
    status: 'idle',
    output: [
      '$ git status',
      'On branch main',
      'Your branch is up to date with \'origin/main\'.',
      '',
      'Changes not staged for commit:',
      '  (use "git add <file>..." to update what will be committed)',
      '  (use "git restore <file>..." to discard changes in working directory)',
      '        modified:   src/components/Dashboard.tsx',
      '        modified:   src/hooks/useAuth.ts',
      '',
      'Untracked files:',
      '  (use "git add <file>..." to include in what will be committed)',
      '        src/services/mockData.ts',
      '',
      'no changes added to commit (use "git add" and/or "git commit -a")',
    ].join('\n'),
  },
]

// Mock Git Events for WebSocket
export const mockGitEvents = [
  {
    type: 'branch-changed',
    repositoryId: 'repo-1',
    data: {
      previousValue: 'develop',
      currentValue: 'main',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
  },
  {
    type: 'commit-added',
    repositoryId: 'repo-1',
    data: {
      currentValue: {
        hash: 'abc123',
        message: 'feat: Add new dashboard component',
        author: 'Gonzalo Martinez',
      },
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    },
  },
  {
    type: 'status-changed',
    repositoryId: 'repo-2',
    data: {
      changes: {
        staged: 3,
        unstaged: 1,
        untracked: 2,
      },
      timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    },
  },
]

// Mock User Data
export const mockUser = {
  id: 'user-1',
  name: 'Gonzalo Martinez',
  email: 'gonzalo@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gonzalo',
  role: 'admin',
  preferences: {
    theme: 'light',
    notifications: true,
    autoSave: true,
  },
}

// Helper to simulate API delay
export const simulateDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms))

// Helper to get random mock data
export const getRandomTasks = (count: number) => {
  const statuses = ['pending', 'in-progress', 'done', 'blocked']
  const priorities = ['low', 'medium', 'high']
  const assignees = ['Gonzalo Martinez', 'Sarah Chen', 'Alex Johnson', 'Mike Wilson']
  
  return Array.from({ length: count }, (_, i) => ({
    id: `task-${Date.now()}-${i}`,
    title: `Task ${i + 1}`,
    description: `Description for task ${i + 1}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    assignee: assignees[Math.floor(Math.random() * assignees.length)],
    createdAt: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()).toISOString(),
    updatedAt: new Date().toISOString(),
  }))
}