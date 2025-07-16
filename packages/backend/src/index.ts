import app from './app';
import { WebSocketService } from './services/websocket';
import { createRealtimeTaskSyncService } from './services/realtimeTaskSyncService';

const PORT = process.env.PORT || 3001;

// Only start the server if this file is run directly
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  // Initialize WebSocket server
  const wsService = new WebSocketService();
  wsService.initialize(server);

  // Initialize real-time task sync service
  const realtimeSyncService = createRealtimeTaskSyncService(wsService, {
    enabled: true,
    debounceMs: 500,
    maxRepositories: 10
  });
  
  realtimeSyncService.initialize().catch((error) => {
    console.error('Failed to initialize real-time sync service:', error);
  });

  // Handle graceful shutdown
  const gracefulShutdown = async (signal: string) => {
    console.log(`\n🛑 Received ${signal}, starting graceful shutdown...`);
    
    try {
      await realtimeSyncService.shutdown();
      wsService.close();
      server.close(() => {
        console.log('✅ Server shut down gracefully');
        process.exit(0);
      });
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

export default app;
