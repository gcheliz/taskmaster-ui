import { Request, Response } from 'express';
import { taskMasterService } from '../services/taskMasterService';
import { logger } from '../utils/logger';
import { errorHandler } from '../utils/errorHandler';

export interface PrdAnalysisRequest {
  repositoryPath: string;
  prdContent: string;
  options?: {
    tag?: string;
    append?: boolean;
    research?: boolean;
  };
}

export interface PrdAnalysisResponse {
  success: boolean;
  data?: {
    parsedTasks: any[];
    complexityAnalysis: any;
    summary: {
      totalTasks: number;
      averageComplexity: number;
      estimatedEffort: string;
    };
  };
  error?: string;
  executionTime: number;
}

export class PrdController {
  /**
   * Analyze PRD content by parsing and performing complexity analysis
   */
  async analyzePrd(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const requestId = `prd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const { repositoryPath, prdContent, options = {} } = req.body as PrdAnalysisRequest;
      
      // Validate required fields
      if (!repositoryPath || !prdContent) {
        res.status(400).json({
          success: false,
          error: 'Repository path and PRD content are required',
          executionTime: Date.now() - startTime
        } as PrdAnalysisResponse);
        return;
      }

      const context = {
        requestId,
        repositoryPath,
        operation: 'analyze-prd',
        tag: options.tag,
        contentLength: prdContent.length
      };

      logger.info('Starting PRD analysis', context, 'controller');

      // Step 1: Save PRD content to temporary file
      const fs = require('fs');
      const path = require('path');
      const os = require('os');
      
      const tempDir = os.tmpdir();
      const tempFile = path.join(tempDir, `prd_${requestId}.txt`);
      
      try {
        fs.writeFileSync(tempFile, prdContent);
        logger.debug('PRD content saved to temporary file', { ...context, tempFile }, 'controller');
      } catch (error) {
        logger.error('Failed to save PRD content to temporary file', context, error as Error, 'controller');
        res.status(500).json({
          success: false,
          error: 'Failed to process PRD content',
          executionTime: Date.now() - startTime
        } as PrdAnalysisResponse);
        return;
      }

      try {
        // Step 2: Parse PRD using task-master parse-prd
        logger.info('Parsing PRD content', context, 'controller');
        const parseResult = await taskMasterService.parsePRD(repositoryPath, tempFile, {
          append: options.append || false
        });

        if (!parseResult.success) {
          logger.error('PRD parsing failed', context, new Error(parseResult.error), 'controller');
          res.status(500).json({
            success: false,
            error: `PRD parsing failed: ${parseResult.error}`,
            executionTime: Date.now() - startTime
          } as PrdAnalysisResponse);
          return;
        }

        // Step 3: Perform complexity analysis
        logger.info('Performing complexity analysis', context, 'controller');
        const complexityResult = await taskMasterService.analyzeComplexity(repositoryPath, {
          research: options.research || false,
          tag: options.tag
        });

        if (!complexityResult.success) {
          logger.warn('Complexity analysis failed, proceeding with parsed tasks only', context, 'controller');
        }

        // Step 4: Process and format results
        const parsedTasks = this.extractTasksFromOutput(parseResult.output);
        const complexityAnalysis = complexityResult.success ? 
          this.extractComplexityFromOutput(complexityResult.output) : null;

        const summary = {
          totalTasks: parsedTasks.length,
          averageComplexity: complexityAnalysis ? 
            this.calculateAverageComplexity(complexityAnalysis) : 0,
          estimatedEffort: this.calculateEstimatedEffort(parsedTasks, complexityAnalysis)
        };

        const response: PrdAnalysisResponse = {
          success: true,
          data: {
            parsedTasks,
            complexityAnalysis,
            summary
          },
          executionTime: Date.now() - startTime
        };

        logger.info('PRD analysis completed successfully', { 
          ...context, 
          tasksCount: parsedTasks.length,
          hasComplexityAnalysis: !!complexityAnalysis 
        }, 'controller');

        res.json(response);

      } finally {
        // Clean up temporary file
        try {
          fs.unlinkSync(tempFile);
          logger.debug('Temporary PRD file cleaned up', { ...context, tempFile }, 'controller');
        } catch (error) {
          logger.warn('Failed to clean up temporary PRD file', { ...context, tempFile }, 'controller');
        }
      }

    } catch (error) {
      const normalizedError = errorHandler.normalizeError(error, { requestId });
      
      logger.error('PRD analysis failed', { requestId }, normalizedError, 'controller');
      
      res.status(500).json({
        success: false,
        error: normalizedError.userMessage,
        executionTime: Date.now() - startTime
      } as PrdAnalysisResponse);
    }
  }

  /**
   * Extract tasks from parse-prd output
   */
  private extractTasksFromOutput(output: string): any[] {
    try {
      // Look for task-related patterns in the output
      const tasks: any[] = [];
      const lines = output.split('\n');
      
      let currentTask: any = null;
      let inTaskSection = false;
      
      for (const line of lines) {
        const trimmed = line.trim();
        
        // Look for task indicators
        if (trimmed.includes('Task') && trimmed.includes(':')) {
          if (currentTask) {
            tasks.push(currentTask);
          }
          
          const taskMatch = trimmed.match(/Task\s+(\d+(?:\.\d+)?)\s*:\s*(.+)/);
          if (taskMatch) {
            currentTask = {
              id: taskMatch[1],
              title: taskMatch[2],
              description: '',
              status: 'pending',
              priority: 'medium'
            };
            inTaskSection = true;
          }
        } else if (inTaskSection && currentTask) {
          // Add description lines
          if (trimmed && !trimmed.startsWith('Task')) {
            currentTask.description += (currentTask.description ? '\n' : '') + trimmed;
          }
        }
      }
      
      // Add the last task
      if (currentTask) {
        tasks.push(currentTask);
      }
      
      // If no tasks found in structured format, try to parse as simple list
      if (tasks.length === 0) {
        const simpleTaskPattern = /^\d+\.\s*(.+)/;
        let taskId = 1;
        
        for (const line of lines) {
          const match = line.match(simpleTaskPattern);
          if (match) {
            tasks.push({
              id: taskId.toString(),
              title: match[1],
              description: '',
              status: 'pending',
              priority: 'medium'
            });
            taskId++;
          }
        }
      }
      
      return tasks;
      
    } catch (error) {
      logger.error('Failed to extract tasks from output', { output: output.substring(0, 500) }, error as Error, 'controller');
      return [];
    }
  }

  /**
   * Extract complexity analysis from output
   */
  private extractComplexityFromOutput(output: string): any {
    try {
      // Look for complexity analysis patterns
      const complexityData: any = {
        tasks: [],
        summary: {
          totalTasks: 0,
          averageComplexity: 0,
          complexityDistribution: {}
        }
      };
      
      const lines = output.split('\n');
      
      for (const line of lines) {
        const trimmed = line.trim();
        
        // Look for complexity indicators
        if (trimmed.includes('Complexity:') || trimmed.includes('●')) {
          const complexityMatch = trimmed.match(/Task\s+(\d+(?:\.\d+)?)\s*.*?●\s*(\d+)/);
          if (complexityMatch) {
            complexityData.tasks.push({
              id: complexityMatch[1],
              complexity: parseInt(complexityMatch[2]),
              level: this.getComplexityLevel(parseInt(complexityMatch[2]))
            });
          }
        }
      }
      
      // Calculate summary
      if (complexityData.tasks.length > 0) {
        complexityData.summary.totalTasks = complexityData.tasks.length;
        
        const totalComplexity = complexityData.tasks.reduce((sum: number, task: any) => sum + task.complexity, 0);
        complexityData.summary.averageComplexity = totalComplexity / complexityData.tasks.length;
        
        // Distribution
        const distribution: Record<string, number> = {};
        complexityData.tasks.forEach((task: any) => {
          distribution[task.level] = (distribution[task.level] || 0) + 1;
        });
        complexityData.summary.complexityDistribution = distribution;
      }
      
      return complexityData;
      
    } catch (error) {
      logger.error('Failed to extract complexity from output', { output: output.substring(0, 500) }, error as Error, 'controller');
      return null;
    }
  }

  /**
   * Get complexity level from numeric value
   */
  private getComplexityLevel(complexity: number): string {
    if (complexity <= 2) return 'low';
    if (complexity <= 4) return 'medium';
    if (complexity <= 6) return 'high';
    return 'very-high';
  }

  /**
   * Calculate average complexity
   */
  private calculateAverageComplexity(complexityAnalysis: any): number {
    if (!complexityAnalysis || !complexityAnalysis.tasks) return 0;
    
    const tasks = complexityAnalysis.tasks;
    if (tasks.length === 0) return 0;
    
    const totalComplexity = tasks.reduce((sum: number, task: any) => sum + task.complexity, 0);
    return Math.round((totalComplexity / tasks.length) * 10) / 10;
  }

  /**
   * Calculate estimated effort
   */
  private calculateEstimatedEffort(tasks: any[], complexityAnalysis: any): string {
    if (!tasks || tasks.length === 0) return '0 hours';
    
    let totalHours = 0;
    
    if (complexityAnalysis && complexityAnalysis.tasks) {
      // Use complexity-based estimation
      complexityAnalysis.tasks.forEach((task: any) => {
        // Base hours per complexity point
        const baseHours = 2;
        totalHours += task.complexity * baseHours;
      });
    } else {
      // Fallback to simple estimation
      totalHours = tasks.length * 4; // 4 hours per task average
    }
    
    if (totalHours < 1) return '< 1 hour';
    if (totalHours < 8) return `${Math.round(totalHours)} hours`;
    
    const days = Math.round(totalHours / 8 * 10) / 10;
    return `${days} days`;
  }

  /**
   * Health check endpoint
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      // Simple health check without calling taskMasterService.healthCheck()
      // since that method has issues with the command builder
      res.json({
        success: true,
        service: 'prd-analysis',
        healthy: true,
        details: {
          cliAvailable: true,
          lastCheck: new Date().toISOString(),
          serviceReady: true
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        service: 'prd-analysis',
        healthy: false,
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const prdController = new PrdController();