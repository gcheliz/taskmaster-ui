"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const websocket_1 = require("./services/websocket");
const PORT = process.env.PORT || 3001;
// Only start the server if this file is run directly
if (require.main === module) {
    const server = app_1.default.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
    // Initialize WebSocket server
    const wsService = new websocket_1.WebSocketService();
    wsService.initialize(server);
}
exports.default = app_1.default;
//# sourceMappingURL=index.js.map