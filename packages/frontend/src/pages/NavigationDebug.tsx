import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

export default function NavigationDebug() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    logger.info('NavigationDebug: Mounted at path', location.pathname)
  }, [location.pathname])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Navigation Debug Page</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Current Location:</h2>
          <p>Pathname: {location.pathname}</p>
          <p>Search: {location.search || 'none'}</p>
          <p>Hash: {location.hash || 'none'}</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Link Navigation:</h2>
          <div className="space-x-4">
            <Link to="/" className="text-blue-500 hover:underline">Dashboard (Link)</Link>
            <Link to="/repositories" className="text-blue-500 hover:underline">Repositories (Link)</Link>
            <Link to="/tasks" className="text-blue-500 hover:underline">Tasks (Link)</Link>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Programmatic Navigation:</h2>
          <div className="space-x-4">
            <button
              onClick={() => {
                logger.info('Navigating to /')
                navigate('/')
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Dashboard (navigate)
            </button>
            <button
              onClick={() => {
                logger.info('Navigating to /repositories')
                navigate('/repositories')
              }}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Repositories (navigate)
            </button>
            <button
              onClick={() => {
                logger.info('Navigating to /tasks')
                navigate('/tasks')
              }}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Tasks (navigate)
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Window Navigation:</h2>
          <button
            onClick={() => {
              logger.info('Using window.location.href')
              window.location.href = '/repositories'
            }}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Repositories (window.location)
          </button>
        </div>
      </div>
    </div>
  )
}