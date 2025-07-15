"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const healthController_1 = require("../controllers/healthController");
const router = (0, express_1.Router)();
router.get('/health', healthController_1.getHealth);
router.get('/api/v1/health', healthController_1.getApiHealth);
exports.default = router;
//# sourceMappingURL=healthRoutes.js.map