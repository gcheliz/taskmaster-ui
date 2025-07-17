"use strict";
/**
 * Performance Monitoring Routes
 *
 * Routes for database performance monitoring and query analysis
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const performanceController_1 = __importDefault(require("../controllers/performanceController"));
const router = (0, express_1.Router)();
/**
 * @route GET /api/performance/analysis
 * @desc Get query performance analysis
 * @access Public
 */
router.get('/analysis', performanceController_1.default.getQueryAnalysis.bind(performanceController_1.default));
/**
 * @route DELETE /api/performance/logs
 * @desc Clear query logs and metrics
 * @access Public
 */
router.delete('/logs', performanceController_1.default.clearLogs.bind(performanceController_1.default));
/**
 * @route GET /api/performance/logs/export
 * @desc Export query logs for external analysis
 * @access Public
 */
router.get('/logs/export', performanceController_1.default.exportLogs.bind(performanceController_1.default));
/**
 * @route GET /api/performance/connection
 * @desc Get database connection info and pool status
 * @access Public
 */
router.get('/connection', performanceController_1.default.getConnectionInfo.bind(performanceController_1.default));
/**
 * @route POST /api/performance/test
 * @desc Run database performance test
 * @access Public
 */
router.post('/test', performanceController_1.default.runPerformanceTest.bind(performanceController_1.default));
/**
 * @route GET /api/performance/slow-queries
 * @desc Get slow query analysis with EXPLAIN plans
 * @access Public
 */
router.get('/slow-queries', performanceController_1.default.analyzeSlowQueries.bind(performanceController_1.default));
/**
 * @route PUT /api/performance/toggle
 * @desc Toggle query analysis on/off
 * @access Public
 */
router.put('/toggle', performanceController_1.default.toggleAnalysis.bind(performanceController_1.default));
exports.default = router;
//# sourceMappingURL=performanceRoutes.js.map