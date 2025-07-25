import express, { Application } from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from './config/passport';
import healthRoutes from './routes/healthRoutes';
import authRoutes from './routes/authRoutes';
import { createRepositoryRoutes } from './routes/repositoryRoutes';
import projectRoutes from './routes/projectRoutes';
import realtimeRoutes from './routes/realtimeRoutes';
import terminalRoutes from './routes/terminalRoutes';
import commandRoutes from './routes/commandRoutes';
import prdRoutes from './routes/prdRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import performanceRoutes from './routes/performanceRoutes';
import settingsRoutes from './routes/settingsRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import DatabaseService from './services/database';
import {
  env,
  getSecurityConfig,
  validateProductionSecrets,
  logConfiguration,
} from './config/environment';
import { logger } from './utils/winston-adapter';
import { setupSentryMiddleware, setupSentryErrorHandler } from './config/sentry';

// Validate environment and secrets
validateProductionSecrets();
logConfiguration();

const app: Application = express();

// Initialize database on startup
const initializeDatabase = async () => {
  try {
    await DatabaseService.connect();
    await DatabaseService.initializeSchema();
    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize database:', error);
    // process.exit(1);
    logger.warn('Running without database connection - some features will be unavailable');
  }
};

// Initialize database (skip during tests)
if (process.env['NODE_ENV'] !== 'test') {
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

// Session configuration for OAuth
app.use(
  session({
    secret: env.SESSION_SECRET || 'your-session-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Sentry request and tracing middleware (must be after session)
setupSentryMiddleware(app);

// Security headers
app.use((_req, res, next) => {
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
app.use('/api/auth', authRoutes);
app.use('/api/repositories', createRepositoryRoutes());
app.use('/api/projects', projectRoutes);
app.use('/api/realtime', realtimeRoutes);
app.use('/api/terminal', terminalRoutes);
app.use('/api/commands', commandRoutes);
app.use('/api/prd', prdRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/settings', settingsRoutes);

// Error handling middleware
app.use(notFoundHandler);

// Sentry error handler (must be before other error middleware)
setupSentryErrorHandler(app);

// Custom error handler
app.use(errorHandler);

export default app;
