import { Request, Response } from 'express';
import { terminalService, TerminalSession } from '../services/terminalService';
import { logger } from '../utils/logger';

export class TerminalController {
  /**
   * Create a new terminal session
   */
  async createSession(req: Request, res: Response): Promise<void> {
    try {
      const { workingDirectory, repositoryPath } = req.body;
      
      const sessionId = terminalService.createSession(workingDirectory, repositoryPath);
      
      res.json({
        success: true,
        data: {
          sessionId,
          message: 'Terminal session created successfully'
        }
      });
    } catch (error) {
      logger.error('Failed to create terminal session:', {}, error instanceof Error ? error : new Error('Unknown error'));
      res.status(500).json({
        success: false,
        error: {
          code: 'TERMINAL_SESSION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create terminal session'
        }
      });
    }
  }

  /**
   * Get terminal session information
   */
  async getSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      
      const session = terminalService.getSession(sessionId);
      
      if (!session) {
        res.status(404).json({
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: `Terminal session not found: ${sessionId}`
          }
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: session.id,
          workingDirectory: session.workingDirectory,
          repositoryPath: session.repositoryPath,
          shell: session.shell,
          isActive: session.isActive,
          createdAt: session.createdAt,
          lastActivity: session.lastActivity
        }
      });
    } catch (error) {
      logger.error('Failed to get terminal session:', {}, error instanceof Error ? error : new Error('Unknown error'));
      res.status(500).json({
        success: false,
        error: {
          code: 'TERMINAL_SESSION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get terminal session'
        }
      });
    }
  }

  /**
   * Get all active terminal sessions
   */
  async getActiveSessions(req: Request, res: Response): Promise<void> {
    try {
      const sessions = terminalService.getActiveSessions();
      
      const sessionData = sessions.map(session => ({
        id: session.id,
        workingDirectory: session.workingDirectory,
        repositoryPath: session.repositoryPath,
        shell: session.shell,
        isActive: session.isActive,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity
      }));

      res.json({
        success: true,
        data: {
          sessions: sessionData,
          count: sessionData.length
        }
      });
    } catch (error) {
      logger.error('Failed to get active terminal sessions:', {}, error instanceof Error ? error : new Error('Unknown error'));
      res.status(500).json({
        success: false,
        error: {
          code: 'TERMINAL_SESSION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get active terminal sessions'
        }
      });
    }
  }

  /**
   * Execute a command in a terminal session
   */
  async executeCommand(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { command } = req.body;
      
      if (!command || typeof command !== 'string') {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_COMMAND',
            message: 'Command is required and must be a string'
          }
        });
        return;
      }

      await terminalService.executeCommand(sessionId, command);
      
      res.json({
        success: true,
        data: {
          message: 'Command executed successfully'
        }
      });
    } catch (error) {
      logger.error('Failed to execute command:', {}, error instanceof Error ? error : new Error('Unknown error'));
      res.status(500).json({
        success: false,
        error: {
          code: 'COMMAND_EXECUTION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to execute command'
        }
      });
    }
  }

  /**
   * Send input to a running process
   */
  async sendInput(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { input } = req.body;
      
      if (!input || typeof input !== 'string') {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Input is required and must be a string'
          }
        });
        return;
      }

      terminalService.sendInput(sessionId, input);
      
      res.json({
        success: true,
        data: {
          message: 'Input sent successfully'
        }
      });
    } catch (error) {
      logger.error('Failed to send input:', {}, error instanceof Error ? error : new Error('Unknown error'));
      res.status(500).json({
        success: false,
        error: {
          code: 'INPUT_SEND_ERROR',
          message: error instanceof Error ? error.message : 'Failed to send input'
        }
      });
    }
  }

  /**
   * Kill a running process in a session
   */
  async killProcess(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      
      terminalService.killProcess(sessionId);
      
      res.json({
        success: true,
        data: {
          message: 'Process killed successfully'
        }
      });
    } catch (error) {
      logger.error('Failed to kill process:', {}, error instanceof Error ? error : new Error('Unknown error'));
      res.status(500).json({
        success: false,
        error: {
          code: 'PROCESS_KILL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to kill process'
        }
      });
    }
  }

  /**
   * Change working directory for a session
   */
  async changeDirectory(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { directory } = req.body;
      
      if (!directory || typeof directory !== 'string') {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_DIRECTORY',
            message: 'Directory is required and must be a string'
          }
        });
        return;
      }

      terminalService.changeDirectory(sessionId, directory);
      
      res.json({
        success: true,
        data: {
          message: 'Directory changed successfully'
        }
      });
    } catch (error) {
      logger.error('Failed to change directory:', {}, error instanceof Error ? error : new Error('Unknown error'));
      res.status(500).json({
        success: false,
        error: {
          code: 'DIRECTORY_CHANGE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to change directory'
        }
      });
    }
  }

  /**
   * Close a terminal session
   */
  async closeSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      
      terminalService.closeSession(sessionId);
      
      res.json({
        success: true,
        data: {
          message: 'Terminal session closed successfully'
        }
      });
    } catch (error) {
      logger.error('Failed to close terminal session:', {}, error instanceof Error ? error : new Error('Unknown error'));
      res.status(500).json({
        success: false,
        error: {
          code: 'TERMINAL_SESSION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to close terminal session'
        }
      });
    }
  }
}

export const terminalController = new TerminalController();