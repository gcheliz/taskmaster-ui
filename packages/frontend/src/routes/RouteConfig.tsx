import { lazy, Suspense } from 'react'
import type { RouteObject } from "react-router-dom"
import { AppLayout } from '../components/Layout'
import { LoadingScreen } from '../components/common/LoadingScreen'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleGuard } from './RoleGuard'

// Lazy load all route components
const DashboardIntegrated = lazy(() => import('../pages/DashboardIntegrated'))
const RepositoryPage = lazy(() => import('../pages/Repository'))
const TaskBoardView = lazy(() =>
  import('../components/Views/TaskBoardView').then((m) => ({ default: m.TaskBoardView }))
)
const TerminalView = lazy(() =>
  import('../components/Views/TerminalView').then((m) => ({ default: m.TerminalView }))
)
const LoginPage = lazy(() => import('../pages/Login'))
const NotFoundPage = lazy(() => import('../pages/NotFound'))

// Route configuration with enhanced features
export const routeConfig: RouteObject[] = [
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <DashboardIntegrated />,
          },
          {
            path: 'dashboard',
            element: <DashboardIntegrated />,
          },
          {
            path: 'repository-management',
            element: (
              <Suspense fallback={<LoadingScreen message="Loading repositories..." />}>
                <RepositoryPage />
              </Suspense>
            ),
          },
          {
            path: 'task-board',
            element: (
              <Suspense fallback={<LoadingScreen message="Loading tasks..." />}>
                <TaskBoardView />
              </Suspense>
            ),
          },
          {
            path: 'terminal',
            element: (
              <Suspense fallback={<LoadingScreen message="Loading terminal..." />}>
                <TerminalView />
              </Suspense>
            ),
          },
          {
            path: 'settings',
            element: (
              <Suspense fallback={<LoadingScreen message="Loading settings..." />}>
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold text-secondary-900">Settings</h1>
                  <div className="bg-white rounded-lg shadow p-6">
                    <p>Settings page implementation coming soon</p>
                  </div>
                </div>
              </Suspense>
            ),
          },
          // Admin routes (only for managers)
          {
            element: <RoleGuard allowedRoles={['manager']} />,
            children: [
              {
                path: 'admin',
                children: [
                  {
                    index: true,
                    element: <div>Admin Dashboard</div>,
                  },
                  {
                    path: 'users',
                    element: <div>User Management</div>,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '/auth',
    children: [
      {
        path: 'login',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <LoginPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
]
