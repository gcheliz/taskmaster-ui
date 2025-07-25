"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncExportService = void 0;
const uuid_1 = require("uuid");
const database_1 = require("./database");
const exportService_1 = require("./exportService");
const ioredis_1 = require("ioredis");
// Redis client for export progress tracking
const redis = new ioredis_1.Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD
});
// Bull queue for background export jobs
const exportQueue = new bull_1.Queue('export-jobs', {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD
    }
});
class AsyncExportService {
    constructor() {
        this.EXPORT_TTL = 24 * 60 * 60; // 24 hours
        this.PROGRESS_UPDATE_INTERVAL = 1000; // 1 second
    }
    /**
     * Initiate an async export job
     */
    async initiateExport(options) {
        const exportId = (0, uuid_1.v4)();
        // Create export job record
        const exportJob = {
            id: exportId,
            type: options.type,
            format: options.format,
            status: 'queued',
            progress: 0,
            filters: options.filters,
            userId: options.userId,
            notifyEmail: options.notifyEmail,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        // Store in Redis
        await redis.setex(`export:${exportId}`, this.EXPORT_TTL, JSON.stringify(exportJob));
        // Add to processing queue
        await exportQueue.add('process-export', {
            exportId,
            ...options
        });
        // Estimate time based on data size
        const estimatedTime = await this.estimateExportTime(options);
        return { exportId, estimatedTime };
    }
    /**
     * Get export progress
     */
    async getExportProgress(exportId) {
        const data = await redis.get(`export:${exportId}`);
        if (!data)
            return null;
        return JSON.parse(data);
    }
    /**
     * Update export progress
     */
    async updateExportProgress(exportId, updates) {
        const current = await this.getExportProgress(exportId);
        if (!current)
            return;
        const updated = {
            ...current,
            ...updates,
            updatedAt: new Date()
        };
        await redis.setex(`export:${exportId}`, this.EXPORT_TTL, JSON.stringify(updated));
    }
    /**
     * Process export job (called by queue worker)
     */
    async processExportJob(exportId, options) {
        try {
            // Update status to processing
            await this.updateExportProgress(exportId, {
                status: 'processing',
                progress: 0
            });
            // Get total count for progress tracking
            const totalCount = await this.getExportItemCount(options);
            let processedCount = 0;
            // Create progress callback
            const onProgress = async (count) => {
                processedCount = count;
                const progress = Math.round((processedCount / totalCount) * 100);
                await this.updateExportProgress(exportId, { progress });
            };
            // Generate export based on type
            let result;
            let filename;
            switch (options.type) {
                case 'tasks':
                    result = await this.exportTasksWithProgress(options.filters, options.format, onProgress);
                    filename = `tasks-export-${new Date().toISOString()}.${options.format}`;
                    break;
                case 'analytics':
                    result = await this.exportAnalyticsWithProgress(options.filters, options.format, onProgress);
                    filename = `analytics-export-${new Date().toISOString()}.${options.format}`;
                    break;
                case 'repository-activity':
                    result = await this.exportRepositoryActivityWithProgress(options.filters, options.format, onProgress);
                    filename = `repository-activity-${new Date().toISOString()}.${options.format}`;
                    break;
                default:
                    throw new Error('Invalid export type');
            }
            // Store the file (in production, upload to S3 or similar)
            const downloadUrl = await this.storeExportFile(exportId, filename, result);
            // Update export as completed
            await this.updateExportProgress(exportId, {
                status: 'completed',
                progress: 100,
                downloadUrl
            });
            // Send email notification if requested
            if (options.notifyEmail) {
                await this.sendExportCompletionEmail(options.notifyEmail, downloadUrl, filename);
            }
        }
        catch (error) {
            // Update export as failed
            await this.updateExportProgress(exportId, {
                status: 'failed',
                error: error instanceof Error ? error.message : 'Export failed'
            });
            throw error;
        }
    }
    /**
     * Estimate export time based on data size
     */
    async estimateExportTime(options) {
        const count = await this.getExportItemCount(options);
        // Rough estimate: 100 items per second
        const seconds = Math.ceil(count / 100);
        // Add buffer time
        return Math.max(10, seconds + 5);
    }
    /**
     * Get total count of items to export
     */
    async getExportItemCount(options) {
        switch (options.type) {
            case 'tasks':
                return await database_1.prisma.task.count({
                    where: this.buildTaskWhereClause(options.filters)
                });
            case 'analytics':
                // For analytics, estimate based on date range
                const dayCount = this.getDayCountFromFilters(options.filters);
                return dayCount * 10; // Assume 10 data points per day
            case 'repository-activity':
                return await database_1.prisma.repositoryActivity.count({
                    where: this.buildActivityWhereClause(options.filters)
                });
            default:
                return 0;
        }
    }
    /**
     * Export tasks with progress tracking
     */
    async exportTasksWithProgress(filters, format, onProgress) {
        const pageSize = 100;
        let page = 0;
        let processedCount = 0;
        const allTasks = [];
        // Fetch tasks in batches
        while (true) {
            const tasks = await database_1.prisma.task.findMany({
                where: this.buildTaskWhereClause(filters),
                skip: page * pageSize,
                take: pageSize,
                include: {
                    project: true,
                    subtasks: true
                }
            });
            if (tasks.length === 0)
                break;
            allTasks.push(...tasks);
            processedCount += tasks.length;
            await onProgress(processedCount);
            page++;
        }
        // Convert to desired format
        if (format === 'csv') {
            return Buffer.from(exportService_1.exportService.convertTasksToCSV(allTasks));
        }
        else {
            return Buffer.from(JSON.stringify(allTasks, null, 2));
        }
    }
    /**
     * Export analytics with progress tracking
     */
    async exportAnalyticsWithProgress(filters, format, onProgress) {
        // Implementation would fetch analytics data in batches
        // For now, return mock data
        const data = {
            dateRange: filters.dateRange,
            metrics: {
                totalTasks: 100,
                completedTasks: 75,
                averageCompletionTime: 3.5
            }
        };
        await onProgress(1);
        if (format === 'csv') {
            return Buffer.from('metric,value\ntotalTasks,100\ncompletedTasks,75');
        }
        else {
            return Buffer.from(JSON.stringify(data, null, 2));
        }
    }
    /**
     * Export repository activity with progress tracking
     */
    async exportRepositoryActivityWithProgress(filters, format, onProgress) {
        // Implementation would fetch activity data in batches
        const activities = await database_1.prisma.repositoryActivity.findMany({
            where: this.buildActivityWhereClause(filters),
            include: {
                repository: true
            }
        });
        await onProgress(activities.length);
        if (format === 'csv') {
            return Buffer.from(this.convertActivitiesToCSV(activities));
        }
        else {
            return Buffer.from(JSON.stringify(activities, null, 2));
        }
    }
    /**
     * Store export file and return download URL
     */
    async storeExportFile(exportId, filename, data) {
        // In production, upload to S3 or similar
        // For now, store in local filesystem
        const fs = require('fs').promises;
        const path = require('path');
        const exportDir = path.join(process.cwd(), 'exports');
        await fs.mkdir(exportDir, { recursive: true });
        const filepath = path.join(exportDir, `${exportId}-${filename}`);
        await fs.writeFile(filepath, data);
        // Return download URL
        const baseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
        return `${baseUrl}/api/export/download/${exportId}/${filename}`;
    }
    /**
     * Send export completion email
     */
    async sendExportCompletionEmail(email, downloadUrl, filename) {
        // In production, use email service
        console.log(`Export completed: ${filename}`);
        console.log(`Download URL: ${downloadUrl}`);
        console.log(`Notification sent to: ${email}`);
    }
    /**
     * Build where clause for tasks
     */
    buildTaskWhereClause(filters) {
        const where = {};
        if (filters.projectId) {
            where.projectId = filters.projectId;
        }
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.priority) {
            where.priority = filters.priority;
        }
        if (filters.assigneeId) {
            where.assigneeId = filters.assigneeId;
        }
        if (filters.dateFrom || filters.dateTo) {
            where.createdAt = {};
            if (filters.dateFrom) {
                where.createdAt.gte = new Date(filters.dateFrom);
            }
            if (filters.dateTo) {
                where.createdAt.lte = new Date(filters.dateTo);
            }
        }
        return where;
    }
    /**
     * Build where clause for activities
     */
    buildActivityWhereClause(filters) {
        const where = {};
        if (filters.repositoryId) {
            where.repositoryId = filters.repositoryId;
        }
        if (filters.dateFrom || filters.dateTo) {
            where.timestamp = {};
            if (filters.dateFrom) {
                where.timestamp.gte = new Date(filters.dateFrom);
            }
            if (filters.dateTo) {
                where.timestamp.lte = new Date(filters.dateTo);
            }
        }
        return where;
    }
    /**
     * Get day count from date filters
     */
    getDayCountFromFilters(filters) {
        if (!filters.dateFrom || !filters.dateTo)
            return 30; // Default 30 days
        const from = new Date(filters.dateFrom);
        const to = new Date(filters.dateTo);
        const diffTime = Math.abs(to.getTime() - from.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }
    /**
     * Convert activities to CSV
     */
    convertActivitiesToCSV(activities) {
        if (activities.length === 0)
            return 'No data';
        const headers = ['Repository', 'Type', 'Description', 'Timestamp'];
        const rows = activities.map(activity => [
            activity.repository?.name || '',
            activity.type || '',
            activity.description || '',
            activity.timestamp?.toISOString() || ''
        ]);
        return [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
    }
    /**
     * Setup queue processor
     */
    setupQueueProcessor() {
        exportQueue.process('process-export', async (job) => {
            const { exportId, ...options } = job.data;
            await this.processExportJob(exportId, options);
        });
        exportQueue.on('failed', (job, err) => {
            console.error(`Export job ${job.id} failed:`, err);
        });
        exportQueue.on('completed', (job) => {
            console.log(`Export job ${job.id} completed`);
        });
    }
}
exports.asyncExportService = new AsyncExportService();
// Setup queue processor when module loads
exports.asyncExportService.setupQueueProcessor();
//# sourceMappingURL=asyncExportService.js.map