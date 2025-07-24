"use strict";
/**
 * SSL/TLS Configuration Validator
 *
 * This module validates and enforces SSL/TLS configurations for database connections
 * and other secure communications.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSSLConfiguration = validateSSLConfiguration;
exports.enforceSSLConfiguration = enforceSSLConfiguration;
exports.getPrismaSSLConfig = getPrismaSSLConfig;
exports.testSSLConnection = testSSLConnection;
exports.getSSLCertificateInfo = getSSLCertificateInfo;
exports.checkSSLCertificateExpiration = checkSSLCertificateExpiration;
const fs = __importStar(require("fs"));
const environment_1 = require("./environment");
const bootstrap_logger_1 = require("../utils/bootstrap-logger");
/**
 * Validate SSL certificate file
 */
function validateCertificateFile(filePath, type) {
    if (!filePath) {
        return {
            valid: false,
            error: `${type} path is required when SSL is enabled`,
        };
    }
    if (!fs.existsSync(filePath)) {
        return { valid: false, error: `${type} file not found: ${filePath}` };
    }
    try {
        const stats = fs.statSync(filePath);
        // Check file permissions (should not be world-readable for private keys)
        if (type === 'Key' && (stats.mode & 0o044) !== 0) {
            return {
                valid: false,
                error: `${type} file has unsafe permissions: ${filePath}`,
            };
        }
        // Check file size (should not be empty)
        if (stats.size === 0) {
            return { valid: false, error: `${type} file is empty: ${filePath}` };
        }
        // Read and validate certificate format
        const content = fs.readFileSync(filePath, 'utf8');
        switch (type) {
            case 'CA':
            case 'Certificate':
                if (!content.includes('BEGIN CERTIFICATE')) {
                    return {
                        valid: false,
                        error: `${type} file does not contain a valid certificate: ${filePath}`,
                    };
                }
                break;
            case 'Key':
                if (!content.includes('BEGIN') || !content.includes('PRIVATE KEY')) {
                    return {
                        valid: false,
                        error: `${type} file does not contain a valid private key: ${filePath}`,
                    };
                }
                break;
        }
        return { valid: true };
    }
    catch (error) {
        return {
            valid: false,
            error: `Failed to validate ${type} file: ${error instanceof Error ? error.message : String(error)}`,
        };
    }
}
/**
 * Validate SSL configuration
 */
function validateSSLConfiguration() {
    const errors = [];
    const warnings = [];
    const sslEnabled = environment_1.env.DATABASE_SSL === 'true';
    const isProduction = environment_1.env.NODE_ENV === 'production';
    // Production SSL requirements
    if (isProduction && !sslEnabled) {
        errors.push('SSL/TLS is required for production database connections');
    }
    if (!sslEnabled) {
        if (isProduction) {
            errors.push('SSL is disabled in production environment');
        }
        else {
            warnings.push('SSL is disabled - only acceptable in development');
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings,
            configuration: {
                enabled: false,
                rejectUnauthorized: false,
            },
        };
    }
    // Validate certificate files
    const certValidation = environment_1.env.SSL_CERT_PATH
        ? validateCertificateFile(environment_1.env.SSL_CERT_PATH, 'Certificate')
        : { valid: true };
    const keyValidation = environment_1.env.SSL_KEY_PATH
        ? validateCertificateFile(environment_1.env.SSL_KEY_PATH, 'Key')
        : { valid: true };
    const caValidation = environment_1.env.SSL_CA_PATH
        ? validateCertificateFile(environment_1.env.SSL_CA_PATH, 'CA')
        : { valid: true };
    if (!certValidation.valid) {
        errors.push(certValidation.error);
    }
    if (!keyValidation.valid) {
        errors.push(keyValidation.error);
    }
    if (!caValidation.valid) {
        errors.push(caValidation.error);
    }
    // SSL configuration warnings
    if (isProduction && !environment_1.env.SSL_CA_PATH) {
        warnings.push('No CA certificate specified - server certificate will not be verified');
    }
    if (isProduction && (!environment_1.env.SSL_CERT_PATH || !environment_1.env.SSL_KEY_PATH)) {
        warnings.push('No client certificate specified - using server-only SSL');
    }
    const configuration = {
        enabled: sslEnabled,
        rejectUnauthorized: isProduction,
        ca: environment_1.env.SSL_CA_PATH ? fs.readFileSync(environment_1.env.SSL_CA_PATH, 'utf8') : undefined,
        cert: environment_1.env.SSL_CERT_PATH
            ? fs.readFileSync(environment_1.env.SSL_CERT_PATH, 'utf8')
            : undefined,
        key: environment_1.env.SSL_KEY_PATH
            ? fs.readFileSync(environment_1.env.SSL_KEY_PATH, 'utf8')
            : undefined,
        checkServerIdentity: isProduction,
    };
    return {
        valid: errors.length === 0,
        errors,
        warnings,
        configuration,
    };
}
/**
 * Enforce SSL configuration for database connections
 */
function enforceSSLConfiguration() {
    const validation = validateSSLConfiguration();
    if (!validation.valid) {
        bootstrap_logger_1.sslLogger.error('❌ SSL Configuration Validation Failed:');
        validation.errors.forEach(error => {
            bootstrap_logger_1.sslLogger.error(`  - ${error}`);
        });
        if (environment_1.env.NODE_ENV === 'production') {
            bootstrap_logger_1.sslLogger.error('SSL configuration errors are fatal in production');
            process.exit(1);
        }
    }
    if (validation.warnings.length > 0) {
        bootstrap_logger_1.sslLogger.warn('⚠️  SSL Configuration Warnings:');
        validation.warnings.forEach(warning => {
            bootstrap_logger_1.sslLogger.warn(`  - ${warning}`);
        });
    }
    if (validation.configuration.enabled) {
        bootstrap_logger_1.sslLogger.info('🔒 SSL/TLS encryption enabled for database connections');
    }
    return validation.configuration;
}
/**
 * Get SSL configuration for Prisma
 */
function getPrismaSSLConfig() {
    const sslConfig = enforceSSLConfiguration();
    if (!sslConfig.enabled) {
        return undefined;
    }
    return {
        ssl: {
            rejectUnauthorized: sslConfig.rejectUnauthorized,
            ca: sslConfig.ca,
            cert: sslConfig.cert,
            key: sslConfig.key,
        },
    };
}
/**
 * Test SSL connection
 */
async function testSSLConnection() {
    try {
        const { getDatabaseConfig } = await Promise.resolve().then(() => __importStar(require('./environment')));
        const config = getDatabaseConfig();
        // Extract connection details from DATABASE_URL
        const dbUrl = new URL(environment_1.env.DATABASE_URL);
        // Use Node.js TLS module to test SSL connection
        const tls = await Promise.resolve().then(() => __importStar(require('tls')));
        return new Promise(resolve => {
            const socket = tls.connect({
                host: dbUrl.hostname,
                port: parseInt(dbUrl.port) || 5432,
                ...config.ssl,
            }, () => {
                socket.destroy();
                resolve({ success: true });
            });
            socket.on('error', error => {
                socket.destroy();
                resolve({ success: false, error: error.message });
            });
            socket.setTimeout(10000, () => {
                socket.destroy();
                resolve({ success: false, error: 'Connection timeout' });
            });
        });
    }
    catch (error) {
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}
/**
 * Generate SSL certificate information
 */
function getSSLCertificateInfo() {
    const validation = validateSSLConfiguration();
    if (!validation.configuration.enabled) {
        return { enabled: false };
    }
    const info = {
        enabled: true,
        rejectUnauthorized: validation.configuration.rejectUnauthorized,
        files: {
            ca: environment_1.env.SSL_CA_PATH || 'Not specified',
            cert: environment_1.env.SSL_CERT_PATH || 'Not specified',
            key: environment_1.env.SSL_KEY_PATH || 'Not specified',
        },
    };
    // Add certificate expiration info if available
    if (validation.configuration.cert) {
        try {
            const crypto = require('crypto');
            const cert = crypto.X509Certificate
                ? new crypto.X509Certificate(validation.configuration.cert)
                : null;
            if (cert) {
                info.certificate = {
                    subject: cert.subject,
                    issuer: cert.issuer,
                    validFrom: cert.validFrom,
                    validTo: cert.validTo,
                    fingerprint: cert.fingerprint,
                };
            }
        }
        catch (error) {
            info.certificate = { error: 'Failed to parse certificate' };
        }
    }
    return info;
}
/**
 * Monitor SSL certificate expiration
 */
function checkSSLCertificateExpiration() {
    const validation = validateSSLConfiguration();
    if (!validation.configuration.enabled || !validation.configuration.cert) {
        return { expiring: false };
    }
    try {
        const crypto = require('crypto');
        const cert = crypto.X509Certificate
            ? new crypto.X509Certificate(validation.configuration.cert)
            : null;
        if (!cert) {
            return { expiring: false, error: 'Could not parse certificate' };
        }
        const validTo = new Date(cert.validTo);
        const now = new Date();
        const daysUntilExpiration = Math.floor((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return {
            expiring: daysUntilExpiration < 30, // Alert if expiring within 30 days
            daysUntilExpiration,
        };
    }
    catch (error) {
        return { expiring: false, error: error instanceof Error ? error.message : String(error) };
    }
}
//# sourceMappingURL=ssl-validator.js.map