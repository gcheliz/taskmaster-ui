import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRoutes from './routes/healthRoutes';
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

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

export default app;