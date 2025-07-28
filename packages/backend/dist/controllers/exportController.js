"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportController = exports.ExportController = void 0;
const exportService_1 = require("../services/exportService");
const logger_1 = require("../utils/logger");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
class ExportController {
    /**
     * Export tasks
     * GET /api/export/tasks
     */
    async exportTasks(req, res, next) {
        try {
            const options = {
                format: req.query['format'] || 'json',
            };
            // Add optional properties only if they have values
            const projectId = req.query['projectId'];
            if (projectId)
                options.projectId = projectId;
            const status = req.query['status'];
            if (status)
                options.status = status;
            const priority = req.query['priority'];
            if (priority)
                options.priority = priority;
            const assigneeId = req.query['assigneeId'];
            if (assigneeId)
                options.assigneeId = assigneeId;
            if (req.query['dateFrom']) {
                options.dateFrom = new Date(req.query['dateFrom']);
            }
            if (req.query['dateTo']) {
                options.dateTo = new Date(req.query['dateTo']);
            }
            if (req.query['includeSubtasks'] === 'true') {
                options.includeSubtasks = true;
            }
            if (req.query['fields']) {
                options.fields = req.query['fields'].split(',');
            }
            // Validate export request
            exportService_1.exportService.validateExportRequest(options);
            // Get tasks from TaskMaster service
            // For now, return mock data until TaskMaster integration is complete
            const tasks = [
                {
                    id: '1',
                    title: 'Sample Task 1',
                    description: 'Description for task 1',
                    status: 'in-progress',
                    priority: 'high',
                    complexity: 5,
                    dependencies: [],
                },
                {
                    id: '2',
                    title: 'Sample Task 2',
                    description: 'Description for task 2',
                    status: 'pending',
                    priority: 'medium',
                    complexity: 3,
                    dependencies: ['1'],
                },
            ];
            // TODO: Replace with actual TaskMaster service call
            // const tasks = await taskMasterService.getTasks(options)
            // Check export size limit
            const EXPORT_LIMIT = 50000;
            if (tasks.length > EXPORT_LIMIT) {
                res.status(413).json({
                    error: 'Export size exceeds limit',
                    code: 'EXPORT_TOO_LARGE',
                    recordCount: tasks.length,
                    limit: EXPORT_LIMIT,
                    suggestion: 'Use async export endpoint for large datasets',
                });
                return;
            }
            // Generate export
            const result = await exportService_1.exportService.exportTasks(tasks, options);
            // Set response headers
            res.setHeader('Content-Type', result.contentType);
            res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
            res.setHeader('X-Total-Count', result.totalCount.toString());
            // Send file
            res.send(result.data);
            logger_1.logger.info('Tasks exported successfully', {
                userId: req.user?.id,
                format: options.format,
                count: result.totalCount,
            });
        }
        catch (error) {
            logger_1.logger.error('Error exporting tasks', error);
            next(error);
        }
    }
    /**
     * Export analytics data
     * GET /api/export/analytics
     */
    async exportAnalytics(req, res, next) {
        try {
            const { format, type, 
            // projectId,
            // userId,
            dateFrom, dateTo, groupBy = 'day', } = req.query;
            if (!format || !type || !dateFrom || !dateTo) {
                res.status(400).json({
                    error: 'Missing required parameters',
                    required: ['format', 'type', 'dateFrom', 'dateTo'],
                });
                return;
            }
            // TODO: Implement analytics export logic based on type
            // For now, return a sample response
            const analyticsData = {
                summary: {
                    totalTasks: 500,
                    completedTasks: 350,
                    inProgressTasks: 100,
                    pendingTasks: 50,
                    completionRate: 0.7,
                    averageCompletionTime: '5.2 days',
                },
                timeline: [],
            };
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            if (format === 'csv') {
                // Convert analytics to CSV format
                const csvData = this.analyticsToCSV(analyticsData);
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename="analytics-${type}-${timestamp}.csv"`);
                res.send(csvData);
            }
            else {
                // Return as JSON
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', `attachment; filename="analytics-${type}-${timestamp}.json"`);
                res.json({
                    data: analyticsData,
                    metadata: {
                        exportDate: new Date().toISOString(),
                        period: { from: dateFrom, to: dateTo },
                        type,
                        groupBy,
                    },
                });
            }
        }
        catch (error) {
            logger_1.logger.error('Error exporting analytics', error);
            next(error);
        }
    }
    /**
     * Get export progress for async exports
     * GET /api/export/progress/:exportId
     */
    async getExportProgress(req, res, next) {
        try {
            const { exportId } = req.params;
            const { asyncExportService } = await Promise.resolve().then(() => __importStar(require('../services/asyncExportService')));
            const exportJob = await asyncExportService.getExportProgress(exportId);
            if (!exportJob) {
                return res.status(404).json({
                    success: false,
                    error: 'Export not found',
                });
            }
            res.json({
                status: exportJob.status,
                progress: exportJob.progress / 100, // Convert to 0-1 range
                downloadUrl: exportJob.downloadUrl,
                error: exportJob.error,
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting export progress', error);
            next(error);
        }
    }
    /**
     * Initiate async export for large datasets
     * POST /api/export/async
     */
    async initiateAsyncExport(req, res, next) {
        try {
            const { type, format, filters, notifyEmail } = req.body;
            if (!type || !format) {
                res.status(400).json({
                    error: 'Missing required fields',
                    required: ['type', 'format'],
                });
                return;
            }
            // Validate export type
            const validTypes = ['tasks', 'analytics', 'repository-activity'];
            if (!validTypes.includes(type)) {
                res.status(400).json({
                    error: 'Invalid export type',
                    valid: validTypes,
                });
                return;
            }
            // Validate format
            const validFormats = ['csv', 'json'];
            if (!validFormats.includes(format)) {
                res.status(400).json({
                    error: 'Invalid export format',
                    valid: validFormats,
                });
                return;
            }
            const { asyncExportService } = await Promise.resolve().then(() => __importStar(require('../services/asyncExportService')));
            const result = await asyncExportService.initiateExport({
                type,
                format,
                filters: filters || {},
                userId: req.user?.id,
                notifyEmail,
            });
            res.json({
                exportId: result.exportId,
                estimatedTime: result.estimatedTime,
            });
            logger_1.logger.info('Async export initiated', {
                userId: req.user?.id,
                exportId: result.exportId,
                type,
                format,
            });
        }
        catch (error) {
            logger_1.logger.error('Error initiating async export', error);
            next(error);
        }
    }
    /**
     * Download completed export file
     * GET /api/export/download/:exportId/:filename
     */
    async downloadExport(req, res, next) {
        try {
            const { exportId, filename } = req.params;
            // Validate export exists and is completed
            const { asyncExportService } = await Promise.resolve().then(() => __importStar(require('../services/asyncExportService')));
            const exportJob = await asyncExportService.getExportProgress(exportId);
            if (!exportJob) {
                return res.status(404).json({
                    success: false,
                    error: 'Export not found',
                });
            }
            if (exportJob.status !== 'completed') {
                return res.status(400).json({
                    success: false,
                    error: 'Export not completed yet',
                    status: exportJob.status,
                });
            }
            // In production, redirect to S3 signed URL
            // For now, serve from local filesystem
            const filepath = path.join(process.cwd(), 'exports', `${exportId}-${filename}`);
            if (!fs.existsSync(filepath)) {
                res.status(404).json({
                    success: false,
                    error: 'Export file not found',
                });
                return;
            }
            // Set appropriate headers
            const contentType = filename.endsWith('.csv')
                ? 'text/csv'
                : 'application/json';
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            // Stream the file
            const stream = fs.createReadStream(filepath);
            stream.pipe(res);
        }
        catch (error) {
            logger_1.logger.error('Error downloading export', error);
            next(error);
        }
    }
    /**
     * Convert analytics data to CSV format
     */
    analyticsToCSV(data) {
        const rows = [];
        // Add headers
        rows.push('Metric,Value');
        // Add summary data
        rows.push(`Total Tasks,${data.summary.totalTasks}`);
        rows.push(`Completed Tasks,${data.summary.completedTasks}`);
        rows.push(`In Progress Tasks,${data.summary.inProgressTasks}`);
        rows.push(`Pending Tasks,${data.summary.pendingTasks}`);
        rows.push(`Completion Rate,${(data.summary.completionRate * 100).toFixed(1)}%`);
        rows.push(`Average Completion Time,${data.summary.averageCompletionTime}`);
        return rows.join('\n');
    }
}
exports.ExportController = ExportController;
exports.exportController = new ExportController();
//# sourceMappingURL=exportController.js.map