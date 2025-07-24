import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '../components/ui/atoms/Button'

const NavigationTest = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const routes = [
    { path: '/', label: 'Dashboard' },
    { path: '/tasks', label: 'Tasks' },
    { path: '/repositories', label: 'Repositories' },
    { path: '/terminal', label: 'Terminal' },
    { path: '/settings', label: 'Settings' },
  ]

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Navigation Test Page</h1>
      
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <p>Current Path: <strong>{location.pathname}</strong></p>
        <p>Search: <strong>{location.search || 'none'}</strong></p>
        <p>Hash: <strong>{location.hash || 'none'}</strong></p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Test Navigation Methods:</h2>
        
        <div>
          <h3 className="font-medium mb-2">Using Link Component:</h3>
          <div className="flex gap-2 flex-wrap">
            {routes.map(route => (
              <Link
                key={route.path}
                to={route.path}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {route.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Using navigate() function:</h3>
          <div className="flex gap-2 flex-wrap">
            {routes.map(route => (
              <Button
                key={route.path}
                onClick={() => navigate(route.path)}
                variant="secondary"
              >
                {route.label}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Using window.location:</h3>
          <div className="flex gap-2 flex-wrap">
            {routes.map(route => (
              <button
                key={route.path}
                onClick={() => window.location.href = route.path}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                {route.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NavigationTest