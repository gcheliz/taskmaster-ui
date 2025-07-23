import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Grid, GridItem } from '../components/layouts/Grid'
import { 
  StatisticsCard, 
  ActivityTimeline, 
  ProjectHealthIndicator, 
  QuickActions 
} from '../components/dashboard'
import type { ActivityItem } from '../components/dashboard'
import { ROUTES } from '../routes/navigation'
import { useActivityStream } from '../hooks/useActivityStream'

const Dashboard = () => {
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Get greeting based on time
  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  // Mock data - in real app, this would come from API
  const userName = 'Alex'
  const statistics = [
    {
      title: 'Active Tasks',
      value: 128,
      subtitle: 'across 8 projects',
      trend: { value: 12, isPositive: true },
      color: 'primary' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      title: 'Repositories',
      value: 24,
      subtitle: '3 need attention',
      trend: { value: 8, isPositive: true },
      color: 'success' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
    },
    {
      title: 'Team Members',
      value: 12,
      subtitle: '3 online now',
      color: 'warning' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      title: 'Performance',
      value: 92,
      subtitle: 'efficiency score',
      trend: { value: 5, isPositive: true },
      color: 'success' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
  ]

  // Initialize activity stream with mock data
  const initialActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'task',
      title: 'Updated task #45: Implement user authentication',
      user: { name: 'Sarah Chen', avatar: 'https://i.pravatar.cc/40?img=1' },
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      meta: { status: 'in-progress' },
    },
    {
      id: '2',
      type: 'commit',
      title: 'Pushed 3 commits to feature/dashboard',
      description: 'feat: add statistics cards, fix: responsive layout',
      user: { name: 'Mike Johnson' },
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: '3',
      type: 'comment',
      title: 'Commented on PR #128',
      description: 'LGTM! Great work on the refactoring.',
      user: { name: 'Emily Davis', avatar: 'https://i.pravatar.cc/40?img=2' },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      id: '4',
      type: 'deploy',
      title: 'Deployed to production',
      description: 'Version 2.3.0 successfully deployed',
      user: { name: 'System' },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      meta: { status: 'completed' },
    },
    {
      id: '5',
      type: 'review',
      title: 'Code review requested on PR #129',
      user: { name: 'David Kim' },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
    },
  ]

  const { activities, isConnected } = useActivityStream({ 
    initialActivities,
    maxItems: 20 
  })

  const projectHealth = {
    projectName: 'TaskMaster UI',
    overallHealth: 85,
    metrics: [
      { name: 'Code Coverage', value: 78, max: 100, status: 'warning' as const },
      { name: 'Build Success Rate', value: 95, max: 100, status: 'healthy' as const },
      { name: 'Open Issues', value: 23, max: 50, status: 'healthy' as const },
      { name: 'Tech Debt Score', value: 82, max: 100, status: 'healthy' as const },
    ],
  }

  const quickActions = [
    {
      id: 'create-task',
      title: 'Create Task',
      description: 'Start a new task',
      color: 'primary' as const,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      onClick: () => navigate(ROUTES.TASKS),
    },
    {
      id: 'view-repos',
      title: 'View Repos',
      description: 'Manage repositories',
      color: 'success' as const,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
      onClick: () => navigate(ROUTES.REPOSITORIES),
    },
    {
      id: 'open-terminal',
      title: 'Terminal',
      description: 'Open terminal',
      color: 'purple' as const,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      onClick: () => navigate(ROUTES.TERMINAL),
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'View insights',
      color: 'warning' as const,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      onClick: () => navigate(ROUTES.ANALYTICS),
    },
    {
      id: 'team',
      title: 'Team',
      description: 'Manage team',
      color: 'pink' as const,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      onClick: () => navigate(ROUTES.TEAM),
    },
    {
      id: 'docs',
      title: 'Documentation',
      description: 'Browse docs',
      color: 'error' as const,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      onClick: () => navigate(ROUTES.DOCUMENTATION),
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">
            {getGreeting()}, {userName}!
          </h1>
          <p className="text-secondary-600 mt-1">
            Here's what's happening with your projects today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-secondary-500">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <Grid cols={1} md={2} lg={4} gap={6}>
        {statistics.map((stat, index) => (
          <GridItem key={stat.title}>
            <StatisticsCard {...stat} delay={index * 0.1} />
          </GridItem>
        ))}
      </Grid>

      {/* Main Content Grid */}
      <Grid cols={1} lg={3} gap={6}>
        {/* Activity Timeline - 2 columns */}
        <GridItem lg={2}>
          <ActivityTimeline 
            activities={activities} 
            showLiveIndicator={isConnected}
          />
        </GridItem>

        {/* Project Health - 1 column */}
        <GridItem>
          <ProjectHealthIndicator {...projectHealth} />
        </GridItem>
      </Grid>

      {/* Quick Actions */}
      <QuickActions actions={quickActions} />
    </div>
  )
}

export default Dashboard