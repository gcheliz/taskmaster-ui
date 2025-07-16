"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const healthRoutes_1 = __importDefault(require("./routes/healthRoutes"));
const repositoryRoutes_1 = require("./routes/repositoryRoutes");
const projectRoutes_1 = __importDefault(require("./routes/projectRoutes"));
const realtimeRoutes_1 = __importDefault(require("./routes/realtimeRoutes"));
const terminalRoutes_1 = __importDefault(require("./routes/terminalRoutes"));
const prdRoutes_1 = __importDefault(require("./routes/prdRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
const database_1 = __importDefault(require("./services/database"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Initialize database on startup
const initializeDatabase = async () => {
    try {
        await database_1.default.connect();
        await database_1.default.initializeSchema();
        console.log('Database initialized successfully');
    }
    catch (error) {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    }
};
// Initialize database (skip during tests)
if (process.env.NODE_ENV !== 'test') {
    initializeDatabase();
}
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use('/', healthRoutes_1.default);
app.use('/api/repositories', (0, repositoryRoutes_1.createRepositoryRoutes)());
app.use('/api/projects', projectRoutes_1.default);
app.use('/api/realtime', realtimeRoutes_1.default);
app.use('/api/terminal', terminalRoutes_1.default);
app.use('/api/prd', prdRoutes_1.default);
app.use('/api/dashboard', dashboardRoutes_1.default);
// Error handling middleware
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map