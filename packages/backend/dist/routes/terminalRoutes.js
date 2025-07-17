"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const terminalController_1 = require("../controllers/terminalController");
const router = express_1.default.Router();
// Terminal Session Management
router.post('/sessions', terminalController_1.terminalController.createSession);
router.get('/sessions', terminalController_1.terminalController.getActiveSessions);
router.get('/sessions/:sessionId', terminalController_1.terminalController.getSession);
router.delete('/sessions/:sessionId', terminalController_1.terminalController.closeSession);
// Terminal Operations
router.post('/sessions/:sessionId/execute', terminalController_1.terminalController.executeCommand);
router.post('/sessions/:sessionId/input', terminalController_1.terminalController.sendInput);
router.post('/sessions/:sessionId/kill', terminalController_1.terminalController.killProcess);
router.post('/sessions/:sessionId/cd', terminalController_1.terminalController.changeDirectory);
exports.default = router;
//# sourceMappingURL=terminalRoutes.js.map