import { Router } from 'express'
import { exportController } from '../controllers/exportController'
import { authenticateJWT } from '../middleware/auth'
import { rateLimiter } from '../middleware/rateLimiter'

const router = Router()

// Apply authentication to all export routes
router.use(authenticateJWT)

// Apply rate limiting for exports (10 requests per hour)
const exportRateLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'Export rate limit exceeded. Please try again later.'
})

// Export tasks
router.get('/tasks', 
  exportRateLimiter,
  exportController.exportTasks.bind(exportController)
)

// Export analytics
router.get('/analytics',
  exportRateLimiter,
  exportController.exportAnalytics.bind(exportController)
)

// Get export progress (for async exports)
router.get('/progress/:exportId',
  exportController.getExportProgress.bind(exportController)
)

// Initiate async export
router.post('/async',
  exportRateLimiter,
  exportController.initiateAsyncExport.bind(exportController)
)

// Download completed export
router.get('/download/:exportId/:filename',
  exportController.downloadExport.bind(exportController)
)

export default router