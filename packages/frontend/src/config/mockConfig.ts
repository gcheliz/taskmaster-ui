// Mock data configuration
// Set USE_MOCK_DATA to true to use mock data instead of real API calls

export const USE_MOCK_DATA = true // Toggle this to switch between mock and real data
export const MOCK_DELAY = 500 // Simulated API delay in milliseconds
export const MOCK_ERROR_RATE = 0 // Percentage of requests that should fail (0-100)

// Feature flags for mock data
export const MOCK_FEATURES = {
  repositories: true,
  tasks: true,
  dashboard: true,
  terminal: true,
  auth: true,
  websocket: true,
}

// Mock WebSocket events configuration
export const MOCK_WEBSOCKET_CONFIG = {
  enabled: true,
  eventInterval: 5000, // Send a random event every 5 seconds
  eventTypes: [
    'branch-changed',
    'commit-added',
    'status-changed',
    'remote-updated',
  ],
}