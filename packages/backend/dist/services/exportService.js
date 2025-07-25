"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportService = exports.ExportService = void 0;
const logger_1 = require("../utils/logger");
const json2csv_1 = require("json2csv");
const stream_1 = require("stream");
class ExportService {
    /**
     * Export tasks in the specified format
     */
    async exportTasks(tasks, options) {
        logger_1.logger.info('Exporting tasks', {
            count: tasks.length,
            format: options.format
        });
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        if (options.format === 'csv') {
            return this.exportTasksAsCSV(tasks, timestamp, options);
        }
        else {
            return this.exportTasksAsJSON(tasks, timestamp, options);
        }
    }
    /**
     * Export tasks as CSV
     */
    async exportTasksAsCSV(tasks, timestamp, options) {
        try {
            // Define CSV fields
            const fields = options.fields || [
                { label: 'ID', value: 'id' },
                { label: 'Title', value: 'title' },
                { label: 'Description', value: 'description' },
                { label: 'Status', value: 'status' },
                { label: 'Priority', value: 'priority' },
                { label: 'Complexity', value: 'complexity' },
                { label: 'Dependencies', value: (row) => row.dependencies?.join(', ') || '' },
                { label: 'Details', value: 'details' },
                { label: 'Test Strategy', value: 'testStrategy' }
            ];
            // Flatten tasks data for CSV
            const flattenedTasks = tasks.map(task => ({
                ...task
            }));
            // Include subtasks if requested
            if (options.includeSubtasks && flattenedTasks.some(t => t.subtasks?.length)) {
                const tasksWithSubtasks = [];
                flattenedTasks.forEach(task => {
                    tasksWithSubtasks.push(task);
                    if (task.subtasks) {
                        task.subtasks.forEach((subtask) => {
                            tasksWithSubtasks.push({
                                ...subtask,
                                id: `${task.id}.${subtask.id}`,
                                title: `  → ${subtask.title}`
                            });
                        });
                    }
                });
                flattenedTasks.length = 0;
                flattenedTasks.push(...tasksWithSubtasks);
            }
            // Create CSV parser
            const json2csvParser = new json2csv_1.Parser({
                fields,
                delimiter: ',',
                quote: '"',
                header: true,
                withBOM: true // For Excel compatibility
            });
            const csv = json2csvParser.parse(flattenedTasks);
            return {
                data: Buffer.from(csv, 'utf8'),
                filename: `tasks-export-${timestamp}.csv`,
                contentType: 'text/csv',
                totalCount: tasks.length
            };
        }
        catch (error) {
            logger_1.logger.error('Error generating CSV', error);
            throw new Error('Failed to generate CSV export');
        }
    }
    /**
     * Export tasks as JSON
     */
    async exportTasksAsJSON(tasks, timestamp, options) {
        try {
            const exportData = {
                data: tasks,
                metadata: {
                    totalCount: tasks.length,
                    exportedCount: tasks.length,
                    exportDate: new Date().toISOString(),
                    filters: {
                        projectId: options.projectId,
                        status: options.status,
                        priority: options.priority,
                        assigneeId: options.assigneeId,
                        dateFrom: options.dateFrom,
                        dateTo: options.dateTo
                    }
                }
            };
            const jsonString = JSON.stringify(exportData, null, 2);
            return {
                data: Buffer.from(jsonString, 'utf8'),
                filename: `tasks-export-${timestamp}.json`,
                contentType: 'application/json',
                totalCount: tasks.length
            };
        }
        catch (error) {
            logger_1.logger.error('Error generating JSON', error);
            throw new Error('Failed to generate JSON export');
        }
    }
    /**
     * Create a readable stream for large exports
     */
    createExportStream(tasks, options) {
        const stream = new stream_1.Readable({
            read() { }
        });
        // Process in chunks to avoid memory issues
        const chunkSize = 1000;
        let index = 0;
        const processChunk = () => {
            const chunk = tasks.slice(index, index + chunkSize);
            if (chunk.length === 0) {
                stream.push(null); // End stream
                return;
            }
            if (options.format === 'csv') {
                // For CSV, we need special handling for headers
                const isFirstChunk = index === 0;
                const fields = this.getCSVFields(options);
                const parser = new json2csv_1.Parser({
                    fields,
                    header: isFirstChunk,
                    withBOM: isFirstChunk
                });
                const csv = parser.parse(chunk);
                stream.push(csv + '\n');
            }
            else {
                // For JSON streaming
                if (index === 0) {
                    stream.push('{"data":[');
                }
                chunk.forEach((task, i) => {
                    const isLast = index + i === tasks.length - 1;
                    stream.push(JSON.stringify(task) + (isLast ? '' : ','));
                });
                if (index + chunk.length === tasks.length) {
                    stream.push('],"metadata":' + JSON.stringify(this.getMetadata(tasks, options)) + '}');
                }
            }
            index += chunkSize;
            setImmediate(processChunk);
        };
        processChunk();
        return stream;
    }
    /**
     * Get CSV field definitions
     */
    getCSVFields(options) {
        return options.fields || [
            { label: 'ID', value: 'id' },
            { label: 'Title', value: 'title' },
            { label: 'Description', value: 'description' },
            { label: 'Status', value: 'status' },
            { label: 'Priority', value: 'priority' },
            { label: 'Complexity', value: 'complexity' },
            { label: 'Dependencies', value: (row) => row.dependencies?.join(', ') || '' },
            { label: 'Details', value: 'details' },
            { label: 'Test Strategy', value: 'testStrategy' }
        ];
    }
    /**
     * Get export metadata
     */
    getMetadata(tasks, options) {
        return {
            totalCount: tasks.length,
            exportedCount: tasks.length,
            exportDate: new Date().toISOString(),
            filters: {
                projectId: options.projectId,
                status: options.status,
                priority: options.priority,
                assigneeId: options.assigneeId,
                dateFrom: options.dateFrom,
                dateTo: options.dateTo
            }
        };
    }
    /**
     * Validate export request
     */
    validateExportRequest(options) {
        const validFormats = ['csv', 'json'];
        if (!validFormats.includes(options.format)) {
            throw new Error(`Invalid format. Valid formats: ${validFormats.join(', ')}`);
        }
        const validStatuses = ['pending', 'in_progress', 'completed', 'archived'];
        if (options.status && !validStatuses.includes(options.status)) {
            throw new Error(`Invalid status. Valid statuses: ${validStatuses.join(', ')}`);
        }
        const validPriorities = ['low', 'medium', 'high'];
        if (options.priority && !validPriorities.includes(options.priority)) {
            throw new Error(`Invalid priority. Valid priorities: ${validPriorities.join(', ')}`);
        }
    }
}
exports.ExportService = ExportService;
exports.exportService = new ExportService();
//# sourceMappingURL=exportService.js.map