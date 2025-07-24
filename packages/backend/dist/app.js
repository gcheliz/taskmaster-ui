"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("./config/passport"));
const healthRoutes_1 = __importDefault(require("./routes/healthRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const repositoryRoutes_1 = require("./routes/repositoryRoutes");
const projectRoutes_1 = __importDefault(require("./routes/projectRoutes"));
const realtimeRoutes_1 = __importDefault(require("./routes/realtimeRoutes"));
const terminalRoutes_1 = __importDefault(require("./routes/terminalRoutes"));
const commandRoutes_1 = __importDefault(require("./routes/commandRoutes"));
const prdRoutes_1 = __importDefault(require("./routes/prdRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const performanceRoutes_1 = __importDefault(require("./routes/performanceRoutes"));
const settingsRoutes_1 = __importDefault(require("./routes/settingsRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
const database_1 = __importDefault(require("./services/database"));
const environment_1 = require("./config/environment");
const winston_adapter_1 = require("./utils/winston-adapter");
const sentry_1 = require("./config/sentry");
// Validate environment and secrets
(0, environment_1.validateProductionSecrets)();
(0, environment_1.logConfiguration)();
const app = (0, express_1.default)();
// Initialize database on startup
const initializeDatabase = async () => {
    try {
        await database_1.default.connect();
        await database_1.default.initializeSchema();
        winston_adapter_1.logger.info('Database initialized successfully');
    }
    catch (error) {
        winston_adapter_1.logger.error('Failed to initialize database:', error);
        process.exit(1);
    }
};
// Initialize database (skip during tests)
if (process.env.NODE_ENV !== 'test') {
    initializeDatabase();
}
// Security configuration
const securityConfig = (0, environment_1.getSecurityConfig)();
// Middleware
app.use((0, cors_1.default)({
    origin: securityConfig.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Session configuration for OAuth
app.use((0, express_session_1.default)({
    secret: environment_1.env.SESSION_SECRET || 'your-session-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: environment_1.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
}));
// Passport middleware
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// Sentry request and tracing middleware (must be after session)
(0, sentry_1.setupSentryMiddleware)(app);
// Security headers
app.use((req, res, next) => {
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    if (securityConfig.enableSsl) {
        res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
});
// Routes
app.use('/', healthRoutes_1.default);
app.use('/api/auth', authRoutes_1.default);
app.use('/api/repositories', (0, repositoryRoutes_1.createRepositoryRoutes)());
app.use('/api/projects', projectRoutes_1.default);
app.use('/api/realtime', realtimeRoutes_1.default);
app.use('/api/terminal', terminalRoutes_1.default);
app.use('/api/commands', commandRoutes_1.default);
app.use('/api/prd', prdRoutes_1.default);
app.use('/api/dashboard', dashboardRoutes_1.default);
app.use('/api/performance', performanceRoutes_1.default);
app.use('/api/settings', settingsRoutes_1.default);
// Error handling middleware
app.use(errorHandler_1.notFoundHandler);
// Sentry error handler (must be before other error middleware)
(0, sentry_1.setupSentryErrorHandler)(app);
// Custom error handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map