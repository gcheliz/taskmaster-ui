/**
 * Performance Monitoring Routes
 * 
 * Routes for database performance monitoring and query analysis
 */

import { Router } from 'express';
import performanceController from '../controllers/performanceController';

const router = Router();

/**
 * @route GET /api/performance/analysis
 * @desc Get query performance analysis
 * @access Public
 */
router.get('/analysis', performanceController.getQueryAnalysis.bind(performanceController));

/**
 * @route DELETE /api/performance/logs
 * @desc Clear query logs and metrics
 * @access Public
 */
router.delete('/logs', performanceController.clearLogs.bind(performanceController));

/**
 * @route GET /api/performance/logs/export
 * @desc Export query logs for external analysis
 * @access Public
 */
router.get('/logs/export', performanceController.exportLogs.bind(performanceController));

/**
 * @route GET /api/performance/connection
 * @desc Get database connection info and pool status
 * @access Public
 */
router.get('/connection', performanceController.getConnectionInfo.bind(performanceController));

/**
 * @route POST /api/performance/test
 * @desc Run database performance test
 * @access Public
 */
router.post('/test', performanceController.runPerformanceTest.bind(performanceController));

/**
 * @route GET /api/performance/slow-queries
 * @desc Get slow query analysis with EXPLAIN plans
 * @access Public
 */
router.get('/slow-queries', performanceController.analyzeSlowQueries.bind(performanceController));

/**
 * @route PUT /api/performance/toggle
 * @desc Toggle query analysis on/off
 * @access Public
 */
router.put('/toggle', performanceController.toggleAnalysis.bind(performanceController));

export default router;