"use strict";
// Real-time Task Synchronization Routes
// API endpoints for managing real-time task monitoring
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const realtimeTaskSyncService_1 = require("../services/realtimeTaskSyncService");
const router = (0, express_1.Router)();
/**
 * GET /api/realtime/status
 * Get real-time sync service status and statistics
 */
router.get('/status', (req, res) => {
    try {
        const syncService = (0, realtimeTaskSyncService_1.getRealtimeTaskSyncService)();
        if (!syncService) {
            return res.status(503).json({
                success: false,
                error: 'Real-time sync service not available'
            });
        }
        const stats = syncService.getStats();
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        console.error('Error getting real-time status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get real-time sync status'
        });
    }
});
/**
 * POST /api/realtime/repositories
 * Add a repository for real-time monitoring
 */
router.post('/repositories', (req, res) => {
    try {
        const { repositoryPath } = req.body;
        if (!repositoryPath || typeof repositoryPath !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Repository path is required and must be a string'
            });
        }
        const syncService = (0, realtimeTaskSyncService_1.getRealtimeTaskSyncService)();
        if (!syncService) {
            return res.status(503).json({
                success: false,
                error: 'Real-time sync service not available'
            });
        }
        syncService.addRepository(repositoryPath);
        res.json({
            success: true,
            message: `Repository added for real-time monitoring: ${repositoryPath}`,
            data: {
                repositoryPath,
                monitoredRepositories: syncService.getMonitoredRepositories()
            }
        });
    }
    catch (error) {
        console.error('Error adding repository for monitoring:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to add repository for monitoring'
        });
    }
});
/**
 * DELETE /api/realtime/repositories/:repositoryPath
 * Remove a repository from real-time monitoring
 */
router.delete('/repositories/*', async (req, res) => {
    try {
        // Get the repository path from the URL (everything after /repositories/)
        const repositoryPath = '/' + req.params[0];
        if (!repositoryPath || repositoryPath === '/') {
            return res.status(400).json({
                success: false,
                error: 'Repository path is required'
            });
        }
        const syncService = (0, realtimeTaskSyncService_1.getRealtimeTaskSyncService)();
        if (!syncService) {
            return res.status(503).json({
                success: false,
                error: 'Real-time sync service not available'
            });
        }
        await syncService.removeRepository(repositoryPath);
        res.json({
            success: true,
            message: `Repository removed from real-time monitoring: ${repositoryPath}`,
            data: {
                repositoryPath,
                monitoredRepositories: syncService.getMonitoredRepositories()
            }
        });
    }
    catch (error) {
        console.error('Error removing repository from monitoring:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to remove repository from monitoring'
        });
    }
});
/**
 * GET /api/realtime/repositories
 * Get list of monitored repositories
 */
router.get('/repositories', (req, res) => {
    try {
        const syncService = (0, realtimeTaskSyncService_1.getRealtimeTaskSyncService)();
        if (!syncService) {
            return res.status(503).json({
                success: false,
                error: 'Real-time sync service not available'
            });
        }
        const monitoredRepositories = syncService.getMonitoredRepositories();
        res.json({
            success: true,
            data: {
                repositories: monitoredRepositories,
                count: monitoredRepositories.length
            }
        });
    }
    catch (error) {
        console.error('Error getting monitored repositories:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get monitored repositories'
        });
    }
});
exports.default = router;
//# sourceMappingURL=realtimeRoutes.js.map