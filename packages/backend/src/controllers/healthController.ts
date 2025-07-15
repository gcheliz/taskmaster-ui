import { Request, Response } from 'express';
import { HealthResponse } from '../types';

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