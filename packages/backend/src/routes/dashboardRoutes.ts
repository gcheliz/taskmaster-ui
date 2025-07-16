import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController';

const router = Router();

/**
 * Dashboard Routes
 * 
 * Handles dashboard data aggregation and reporting endpoints
 */

/**
 * @route GET /api/dashboard/projects/:projectId
 * @description Get comprehensive dashboard data for a project
 * @param projectId - Project identifier
 * @query tag - Project tag for filtering (optional)
 * @access Public
 */
router.get(
  '/projects/:projectId',
  dashboardController.getDashboardData.bind(dashboardController)
);

/**
 * @route GET /api/dashboard/projects/:projectId/health
 * @description Get project health metrics
 * @param projectId - Project identifier
 * @query tag - Project tag for filtering (optional)
 * @access Public
 */
router.get(
  '/projects/:projectId/health',
  dashboardController.getProjectHealth.bind(dashboardController)
);

/**
 * @route GET /api/dashboard/projects/:projectId/metrics
 * @description Get specific project metrics (alias for dashboard data)
 * @param projectId - Project identifier
 * @query tag - Project tag for filtering (optional)
 * @access Public
 */
router.get(
  '/projects/:projectId/metrics',
  dashboardController.getDashboardData.bind(dashboardController)
);

export default router;