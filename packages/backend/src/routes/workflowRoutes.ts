import { Router } from 'express';
import * as workflowController from '../controllers/workflowController';
import authMiddleware from '../middleware/auth';

const router = Router();

// All workflow routes require authentication
router.use(authMiddleware.authenticateJWT);

// Execute workflows
router.post('/execute', workflowController.executeWorkflow);
router.post('/execute/type', workflowController.executeWorkflowByType);
router.post('/execute/feature', workflowController.createFeatureWorkflow);
router.post('/execute/bugfix', workflowController.createBugfixWorkflow);

// Workflow management
router.get('/list', workflowController.listWorkflows);
router.get('/:workflowId', workflowController.getWorkflowStatus);
router.post('/:workflowId/pause', workflowController.pauseWorkflow);
router.post('/:workflowId/resume', workflowController.resumeWorkflow);
router.post('/:workflowId/cancel', workflowController.cancelWorkflow);

// Template management
router.get('/templates/list', workflowController.listTemplates);
router.get('/templates/:templateId', workflowController.getTemplate);
router.post('/templates/upload', workflowController.uploadTemplate);

export default router;
