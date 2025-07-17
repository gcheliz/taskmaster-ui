"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemHealth = exports.getSecretsHealth = exports.getApiHealth = exports.getHealth = void 0;
const secrets_manager_1 = require("../config/secrets-manager");
const database_1 = __importDefault(require("../services/database"));
const getHealth = (req, res) => {
    const response = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'taskmaster-ui-backend',
    };
    res.status(200).json(response);
};
exports.getHealth = getHealth;
const getApiHealth = (req, res) => {
    const response = {
        status: 'API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        service: 'taskmaster-ui-backend',
    };
    res.status(200).json(response);
};
exports.getApiHealth = getApiHealth;
const getSecretsHealth = async (req, res) => {
    try {
        const secretsManager = (0, secrets_manager_1.getSecretsManager)();
        const statusMap = await secretsManager.getProviderStatus();
        const cacheStats = secretsManager.getCacheStats();
        const providerStatus = Object.fromEntries(statusMap);
        const activeProviderAvailable = await secretsManager.isProviderAvailable();
        const response = {
            status: activeProviderAvailable ? 'OK' : 'DEGRADED',
            timestamp: new Date().toISOString(),
            service: 'secrets-manager',
            providers: providerStatus,
            cache: {
                size: cacheStats.size,
                entries: cacheStats.entries.length,
            },
        };
        res.status(activeProviderAvailable ? 200 : 503).json(response);
    }
    catch (error) {
        res.status(500).json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            service: 'secrets-manager',
            error: error.message,
        });
    }
};
exports.getSecretsHealth = getSecretsHealth;
const getSystemHealth = async (req, res) => {
    try {
        const secretsManager = (0, secrets_manager_1.getSecretsManager)();
        const dbService = database_1.default;
        // Check database health
        const dbHealth = await dbService.healthCheck();
        // Check secrets manager health
        const secretsHealth = await secretsManager.isProviderAvailable();
        // Check required secrets
        let secretsValid = true;
        try {
            await secretsManager.getSecret('JWT_SECRET');
            await secretsManager.getSecret('DATABASE_URL');
        }
        catch (error) {
            secretsValid = false;
        }
        const allHealthy = dbHealth && secretsHealth && secretsValid;
        const response = {
            status: allHealthy ? 'OK' : 'DEGRADED',
            timestamp: new Date().toISOString(),
            service: 'taskmaster-ui-backend',
            components: {
                database: dbHealth ? 'OK' : 'DEGRADED',
                secrets: secretsHealth ? 'OK' : 'DEGRADED',
                secretsValid: secretsValid ? 'OK' : 'ERROR',
            },
        };
        res.status(allHealthy ? 200 : 503).json(response);
    }
    catch (error) {
        res.status(500).json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            service: 'taskmaster-ui-backend',
            error: error.message,
        });
    }
};
exports.getSystemHealth = getSystemHealth;
//# sourceMappingURL=healthController.js.map