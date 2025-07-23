import { lazy, Suspense } from 'react'
import type { RouteObject } from 'react-router-dom'
import { Layout } from '../components/layouts'
import { LoadingScreen } from '../components/common/LoadingScreen'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleGuard } from './RoleGuard'

// Lazy load all route components
const SimpleDashboardView = lazy(() => import('../components/Views/SimpleDashboardView').then(m => ({ default: m.SimpleDashboardView })))
const SimpleRepositoryView = lazy(() => import('../components/Views/SimpleRepositoryView').then(m => ({ default: m.SimpleRepositoryView })))
const SimpleTaskBoardView = lazy(() => import('../components/Views/SimpleTaskBoardView').then(m => ({ default: m.SimpleTaskBoardView })))
const SimpleTerminalView = lazy(() => import('../components/Views/SimpleTerminalView').then(m => ({ default: m.SimpleTerminalView })))
const LoginPage = lazy(() => import('../pages/Login'))
const NotFoundPage = lazy(() => import('../pages/NotFound'))

// Route configuration with enhanced features
export const routeConfig: RouteObject[] = [
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          {
            index: true,
            element: <SimpleDashboardView />,
          },
          {
            path: 'dashboard',
            element: <SimpleDashboardView />,
          },
          {
            path: 'repository-management',
            element: (
              <Suspense fallback={<LoadingScreen message="Loading repositories..." />}>
                <SimpleRepositoryView />
              </Suspense>
            ),
          },
          {
            path: 'task-board',
            element: (
              <Suspense fallback={<LoadingScreen message="Loading tasks..." />}>
                <SimpleTaskBoardView />
              </Suspense>
            ),
          },
          {
            path: 'terminal',
            element: (
              <Suspense fallback={<LoadingScreen message="Loading terminal..." />}>
                <SimpleTerminalView />
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