import { Request, Response } from 'express';
import { HealthResponse } from '../types';
import { getSecretsManager } from '../config/secrets-manager';
import DatabaseService from '../services/database';

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

export const getSecretsHealth = async (req: Request, res: Response): Promise<void> => {
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

export const getSystemHealth = async (req: Request, res: Response): Promise<void> => {
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
  } catch (error: any) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      service: 'taskmaster-ui-backend',
      error: error.message,
    });
  }
};