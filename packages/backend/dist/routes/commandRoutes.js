"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const commandController_1 = require("../controllers/commandController");
const router = express_1.default.Router();
// One-click command execution
router.post('/execute', commandController_1.commandController.executeCommand);
router.post('/execute-sequence', commandController_1.commandController.executeSequence);
// Command discovery and presets
router.get('/available', commandController_1.commandController.getAvailableCommands);
router.get('/presets', commandController_1.commandController.getCommandPresets);
exports.default = router;
//# sourceMappingURL=commandRoutes.js.map