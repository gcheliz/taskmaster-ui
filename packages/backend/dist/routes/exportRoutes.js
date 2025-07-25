"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const exportController_1 = require("../controllers/exportController");
const auth_1 = require("../middleware/auth");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
// Apply authentication to all export routes
router.use(auth_1.authenticate);
// Apply rate limiting for exports (10 requests per hour)
const exportRateLimiter = (0, rateLimiter_1.rateLimiter)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: 'Export rate limit exceeded. Please try again later.'
});
// Export tasks
router.get('/tasks', exportRateLimiter, exportController_1.exportController.exportTasks.bind(exportController_1.exportController));
// Export analytics
router.get('/analytics', exportRateLimiter, exportController_1.exportController.exportAnalytics.bind(exportController_1.exportController));
// Get export progress (for async exports)
router.get('/progress/:exportId', exportController_1.exportController.getExportProgress.bind(exportController_1.exportController));
// Initiate async export
router.post('/async', exportRateLimiter, exportController_1.exportController.initiateAsyncExport.bind(exportController_1.exportController));
exports.default = router;
//# sourceMappingURL=exportRoutes.js.map