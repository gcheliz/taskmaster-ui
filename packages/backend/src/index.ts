import app from './app';
import { WebSocketService } from './services/websocket';

const PORT = process.env.PORT || 3001;

// Only start the server if this file is run directly
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  // Initialize WebSocket server
  const wsService = new WebSocketService();
  wsService.initialize(server);
}

export default app;
