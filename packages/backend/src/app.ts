import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRoutes from './routes/healthRoutes';
import { createRepositoryRoutes } from './routes/repositoryRoutes';
import projectRoutes from './routes/projectRoutes';
import realtimeRoutes from './routes/realtimeRoutes';
import terminalRoutes from './routes/terminalRoutes';
import prdRoutes from './routes/prdRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import DatabaseService from './services/database';

dotenv.config();

const app = express();

// Initialize database on startup
const initializeDatabase = async () => {
  try {
    await DatabaseService.connect();
    await DatabaseService.initializeSchema();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
};

// Initialize database (skip during tests)
if (process.env.NODE_ENV !== 'test') {
  initializeDatabase();
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', healthRoutes);
app.use('/api/repositories', createRepositoryRoutes());
app.use('/api/projects', projectRoutes);
app.use('/api/realtime', realtimeRoutes);
app.use('/api/terminal', terminalRoutes);
app.use('/api/prd', prdRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

export default app;