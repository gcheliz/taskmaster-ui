import { Request, Response } from 'express';
export declare class TerminalController {
    /**
     * Create a new terminal session
     */
    createSession(req: Request, res: Response): Promise<void>;
    /**
     * Get terminal session information
     */
    getSession(req: Request, res: Response): Promise<void>;
    /**
     * Get all active terminal sessions
     */
    getActiveSessions(req: Request, res: Response): Promise<void>;
    /**
     * Execute a command in a terminal session
     */
    executeCommand(req: Request, res: Response): Promise<void>;
    /**
     * Send input to a running process
     */
    sendInput(req: Request, res: Response): Promise<void>;
    /**
     * Kill a running process in a session
     */
    killProcess(req: Request, res: Response): Promise<void>;
    /**
     * Change working directory for a session
     */
    changeDirectory(req: Request, res: Response): Promise<void>;
    /**
     * Close a terminal session
     */
    closeSession(req: Request, res: Response): Promise<void>;
}
export declare const terminalController: TerminalController;
//# sourceMappingURL=terminalController.d.ts.map