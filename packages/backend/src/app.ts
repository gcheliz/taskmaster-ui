import express, { Application } from 'express';
import cors from 'cors';
import healthRoutes from './routes/healthRoutes';
import { createRepositoryRoutes } from './routes/repositoryRoutes';
import projectRoutes from './routes/projectRoutes';
import realtimeRoutes from './routes/realtimeRoutes';
import terminalRoutes from './routes/terminalRoutes';
import commandRoutes from './routes/commandRoutes';
import prdRoutes from './routes/prdRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import performanceRoutes from './routes/performanceRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import DatabaseService from './services/database';
import {
  env,
  getSecurityConfig,
  validateProductionSecrets,
  logConfiguration,
} from './config/environment';

// Validate environment and secrets
validateProductionSecrets();
logConfiguration();

const app: Application = express();

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

// Security configuration
const securityConfig = getSecurityConfig();

// Middleware
app.use(
  cors({
    origin: securityConfig.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (securityConfig.enableSsl) {
    res.header(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
  }

  next();
});

// Routes
app.use('/', healthRoutes);
app.use('/api/repositories', createRepositoryRoutes());
app.use('/api/projects', projectRoutes);
app.use('/api/realtime', realtimeRoutes);
app.use('/api/terminal', terminalRoutes);
app.use('/api/commands', commandRoutes);
app.use('/api/prd', prdRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/performance', performanceRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
