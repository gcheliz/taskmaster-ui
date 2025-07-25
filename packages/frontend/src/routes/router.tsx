import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Suspense } from 'react'
import { routes } from './routes'
import { LoadingScreen } from '../components/common/LoadingScreen'

export const router = createBrowserRouter(routes, {
  future: {
    v7_startTransition: true,
  },
})

export const AppRouter = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <RouterProvider router={router} />
    </Suspense>
  )
}
