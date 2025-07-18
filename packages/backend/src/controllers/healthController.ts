import { Request, Response } from 'express';
import { HealthResponse } from '../types';
import { getSecretsManager } from '../config/secrets-manager';
import DatabaseService from '../services/database';
import {
  validateSSLConfiguration,
  getSSLCertificateInfo,
  checkSSLCertificateExpiration,
} from '../config/ssl-validator';

export const getHealth = (req: Request, res: Response): void => {
  const response: HealthResponse = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'taskmaster-ui-backend',
  };

  res.status(200).json(response);
};

export const getApiHealth = (req: Request, res: Response): void => {
  const response: HealthResponse = {
    status: 'API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    service: 'taskmaster-ui-backend',
  };

  res.status(200).json(response);
};

export const getSecretsHealth = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const secretsManager = getSecretsManager();
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
  } catch (error: any) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      service: 'secrets-manager',
      error: error.message,
    });
  }
};

export const getSSLHealth = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validation = validateSSLConfiguration();
    const certInfo = getSSLCertificateInfo();
    const expirationInfo = checkSSLCertificateExpiration();

    const response = {
      status: validation.valid ? 'OK' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      service: 'ssl-validator',
      ssl: {
        enabled: validation.configuration.enabled,
        valid: validation.valid,
        errors: validation.errors,
        warnings: validation.warnings,
      },
      certificate: {
        expiring: expirationInfo.expiring,
        daysUntilExpiration: expirationInfo.daysUntilExpiration,
        files: certInfo.files,
      },
    };

    res.status(validation.valid ? 200 : 503).json(response);
  } catch (error: any) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      service: 'ssl-validator',
      error: error.message,
    });
  }
};

export const getSystemHealth = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const secretsManager = getSecretsManager();
    const dbService = DatabaseService;

    // Check database health
    const dbHealth = await dbService.healthCheck();

    // Check secrets manager health
    const secretsHealth = await secretsManager.isProviderAvailable();

    // Check required secrets
    let secretsValid = true;
    try {
      await secretsManager.getSecret('JWT_SECRET');
      await secretsManager.getSecret('DATABASE_URL');
    } catch (error) {
      secretsValid = false;
    }

    // Check SSL configuration
    const sslValidation = validateSSLConfiguration();
    const sslValid = sslValidation.valid;

    const allHealthy = dbHealth && secretsHealth && secretsValid && sslValid;

    const response = {
      status: allHealthy ? 'OK' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      service: 'taskmaster-ui-backend',
      components: {
        database: dbHealth ? 'OK' : 'DEGRADED',
        secrets: secretsHealth ? 'OK' : 'DEGRADED',
        secretsValid: secretsValid ? 'OK' : 'ERROR',
        ssl: sslValid ? 'OK' : 'DEGRADED',
      },
    };

    res.status(allHealthy ? 200 : 503).json(response);
  } catch (error: any) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      service: 'taskmaster-ui-backend',
      error: error.message,
    });
  }
};
