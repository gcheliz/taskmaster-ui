import { WebSocketService } from '../services/websocket';
import { Server } from 'http';
import WebSocket from 'ws';

describe('WebSocketService', () => {
  let wsService: WebSocketService;
  let server: Server;

  beforeEach(() => {
    wsService = new WebSocketService();
    server = new Server();
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