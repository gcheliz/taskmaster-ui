import express, { Router } from 'express';
import { commandController } from '../controllers/commandController';

const router: Router = express.Router();

// One-click command execution
router.post('/execute', commandController.executeCommand);
router.post('/execute-sequence', commandController.executeSequence);

// Command discovery and presets
router.get('/available', commandController.getAvailableCommands);
router.get('/presets', commandController.getCommandPresets);

export default router;
