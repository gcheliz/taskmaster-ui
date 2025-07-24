import type { RouteObject } from 'react-router-dom'
import { AppLayout } from '../components/Layout'
import { ProtectedRoute } from './ProtectedRoute'
import { lazy } from 'react'

// Import pages directly for debugging
import DashboardPage from '../pages/Dashboard'
import SettingsPage from '../pages/Settings'
import RepositoriesPage from '../pages/Repositories'
import TerminalPage from '../pages/Terminal'
import TaskBoardPage from '../pages/TaskBoard'

// Lazy load less critical pages
const TasksPage = lazy(() => import('../pages/Tasks'))
const TaskDetailPage = lazy(() => import('../pages/TaskDetail'))
const AnalyticsPage = lazy(() => import('../pages/Analytics'))
const TeamPage = lazy(() => import('../pages/Team'))
const CalendarPage = lazy(() => import('../pages/Calendar'))
const DocumentationPage = lazy(() => import('../pages/Documentation'))
const ProfilePage = lazy(() => import('../pages/Profile'))
const LoginPage = lazy(() => import('../pages/Login'))
const RegisterPage = lazy(() => import('../pages/Register'))
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPassword'))
const ResetPasswordPage = lazy(() => import('../pages/ResetPassword'))
const NotFoundPage = lazy(() => import('../pages/NotFound'))
const OnboardingPage = lazy(() => import('../pages/Onboarding'))
const NavigationTestPage = lazy(() => import('../pages/NavigationTest'))

// Import the Auth page wrapper
const AuthPageWrapper = lazy(() => import('../pages/Auth'))
const OAuthCallback = lazy(() => import('../components/Auth/OAuthCallback').then(module => ({ default: module.OAuthCallback })))

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
            element: <TaskBoardPage />,
          },
          {
            path: 'tasks/list',
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
          {
            path: 'navigation-test',
            element: <NavigationTestPage />,
          },
        ],
      },
    ],
  },
  {
    path: '/onboarding',
    element: <ProtectedRoute />,
    children: [
      {
        index: true,
        element: <OnboardingPage />,
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthPageWrapper />,
  },
  {
    path: '/auth/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/auth/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/auth/callback',
    element: <OAuthCallback />,
  },
  // Legacy routes for backward compatibility - redirect to new auth page
  {
    path: '/auth/login',
    element: <AuthPageWrapper />,
  },
  {
    path: '/auth/register', 
    element: <AuthPageWrapper />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]
