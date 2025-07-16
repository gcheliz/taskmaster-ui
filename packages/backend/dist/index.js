"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const websocket_1 = require("./services/websocket");
const realtimeTaskSyncService_1 = require("./services/realtimeTaskSyncService");
const PORT = process.env.PORT || 3001;
// Only start the server if this file is run directly
if (require.main === module) {
    const server = app_1.default.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
    // Initialize WebSocket server
    const wsService = new websocket_1.WebSocketService();
    wsService.initialize(server);
    // Initialize real-time task sync service
    const realtimeSyncService = (0, realtimeTaskSyncService_1.createRealtimeTaskSyncService)(wsService, {
        enabled: true,
        debounceMs: 500,
        maxRepositories: 10
    });
    realtimeSyncService.initialize().catch((error) => {
        console.error('Failed to initialize real-time sync service:', error);
    });
    // Handle graceful shutdown
    const gracefulShutdown = async (signal) => {
        console.log(`\n🛑 Received ${signal}, starting graceful shutdown...`);
        try {
            await realtimeSyncService.shutdown();
            wsService.close();
            server.close(() => {
                console.log('✅ Server shut down gracefully');
                process.exit(0);
            });
        }
        catch (error) {
            console.error('❌ Error during shutdown:', error);
            process.exit(1);
        }
    };
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}
exports.default = app_1.default;
//# sourceMappingURL=index.js.map