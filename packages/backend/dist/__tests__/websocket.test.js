"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const websocket_1 = require("../services/websocket");
const http_1 = require("http");
describe('WebSocketService', () => {
    let wsService;
    let server;
    beforeEach(() => {
        wsService = new websocket_1.WebSocketService();
        server = new http_1.Server();
    });
    afterEach(() => {
        wsService.close();
        server.close();
    });
    it('should initialize WebSocket server', () => {
        expect(() => wsService.initialize(server)).not.toThrow();
    });
    it('should return initial client count as 0', () => {
        wsService.initialize(server);
        expect(wsService.getClientCount()).toBe(0);
    });
    it('should close WebSocket server gracefully', () => {
        wsService.initialize(server);
        expect(() => wsService.close()).not.toThrow();
    });
    it('should handle broadcast when server not initialized', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        wsService.broadcast({ test: 'message' });
        expect(consoleSpy).toHaveBeenCalledWith('WebSocket server not initialized');
        consoleSpy.mockRestore();
    });
});
//# sourceMappingURL=websocket.test.js.map