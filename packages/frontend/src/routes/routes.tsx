import type { RouteObject } from 'react-router-dom'
import { AppLayout } from '../components/Layout'
import { ProtectedRoute } from './ProtectedRoute'
import { lazy } from 'react'

// Lazy load pages for better performance
const DashboardPage = lazy(() => import('../pages/Dashboard'))
const TasksPage = lazy(() => import('../pages/Tasks'))
const TaskDetailPage = lazy(() => import('../pages/TaskDetail'))
const RepositoriesPage = lazy(() => import('../pages/Repositories'))
const TerminalPage = lazy(() => import('../pages/Terminal'))
const AnalyticsPage = lazy(() => import('../pages/Analytics'))
const TeamPage = lazy(() => import('../pages/Team'))
const CalendarPage = lazy(() => import('../pages/Calendar'))
const DocumentationPage = lazy(() => import('../pages/Documentation'))
const SettingsPage = lazy(() => import('../pages/Settings'))
const ProfilePage = lazy(() => import('../pages/Profile'))
const LoginPage = lazy(() => import('../pages/Login'))
const RegisterPage = lazy(() => import('../pages/Register'))
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPassword'))
const ResetPasswordPage = lazy(() => import('../pages/ResetPassword'))
const NotFoundPage = lazy(() => import('../pages/NotFound'))

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: 'tasks',
            children: [
              {
                index: true,
                element: <TasksPage />,
              },
              {
                path: ':taskId',
                element: <TaskDetailPage />,
              },
            ],
          },
          {
            path: 'repositories',
            element: <RepositoriesPage />,
          },
          {
            path: 'terminal',
            element: <TerminalPage />,
          },
          {
            path: 'analytics',
            element: <AnalyticsPage />,
          },
          {
            path: 'team',
            element: <TeamPage />,
          },
          {
            path: 'calendar',
            element: <CalendarPage />,
          },
          {
            path: 'docs',
            element: <DocumentationPage />,
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          },
          {
            path: 'profile',
            element: <ProfilePage />,
          },
        ],
      },
    ],
  },
  {
    path: '/auth',
    element: <div className="min-h-screen bg-slate-950" />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: 'reset-password',
        element: <ResetPasswordPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]