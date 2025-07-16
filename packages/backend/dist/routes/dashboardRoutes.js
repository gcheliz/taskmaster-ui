"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboardController_1 = require("../controllers/dashboardController");
const router = (0, express_1.Router)();
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
router.get('/projects/:projectId', dashboardController_1.dashboardController.getDashboardData.bind(dashboardController_1.dashboardController));
/**
 * @route GET /api/dashboard/projects/:projectId/health
 * @description Get project health metrics
 * @param projectId - Project identifier
 * @query tag - Project tag for filtering (optional)
 * @access Public
 */
router.get('/projects/:projectId/health', dashboardController_1.dashboardController.getProjectHealth.bind(dashboardController_1.dashboardController));
/**
 * @route GET /api/dashboard/projects/:projectId/metrics
 * @description Get specific project metrics (alias for dashboard data)
 * @param projectId - Project identifier
 * @query tag - Project tag for filtering (optional)
 * @access Public
 */
router.get('/projects/:projectId/metrics', dashboardController_1.dashboardController.getDashboardData.bind(dashboardController_1.dashboardController));
exports.default = router;
//# sourceMappingURL=dashboardRoutes.js.map