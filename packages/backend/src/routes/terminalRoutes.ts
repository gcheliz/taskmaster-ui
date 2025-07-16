import express from 'express';
import { terminalController } from '../controllers/terminalController';

const router = express.Router();

// Terminal Session Management
router.post('/sessions', terminalController.createSession);
router.get('/sessions', terminalController.getActiveSessions);
router.get('/sessions/:sessionId', terminalController.getSession);
router.delete('/sessions/:sessionId', terminalController.closeSession);

// Terminal Operations
router.post('/sessions/:sessionId/execute', terminalController.executeCommand);
router.post('/sessions/:sessionId/input', terminalController.sendInput);
router.post('/sessions/:sessionId/kill', terminalController.killProcess);
router.post('/sessions/:sessionId/cd', terminalController.changeDirectory);

export default router;