"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const healthController_1 = require("../controllers/healthController");
const router = (0, express_1.Router)();
router.get('/health', healthController_1.getHealth);
router.get('/api/v1/health', healthController_1.getApiHealth);
router.get('/health/secrets', healthController_1.getSecretsHealth);
router.get('/health/ssl', healthController_1.getSSLHealth);
router.get('/health/system', healthController_1.getSystemHealth);
exports.default = router;
//# sourceMappingURL=healthRoutes.js.map