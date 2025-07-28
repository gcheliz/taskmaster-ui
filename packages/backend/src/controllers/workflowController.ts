import { Request, Response } from 'express';
import { WorkflowService } from '../workflow';
import { logger } from '../utils/logger';
import { asyncHandler } from '../config/sentry';

const workflowService = new WorkflowService();

// Subscribe to workflow events for real-time updates
workflowService.on('workflow.event', event => {
  // Emit to WebSocket clients if needed
  logger.debug('Workflow event', { event });
});

export const executeWorkflow = asyncHandler(
  async (req: Request, res: Response) => {
    const { templateId, context } = req.body;

    if (!templateId || !context) {
      res.status(400).json({
        error: 'Missing required parameters: templateId and context',
      });
      return;
    }

    const workflow = await workflowService.executeWorkflow(templateId, context);

    res.json({
      success: true,
      workflow: {
        id: workflow.id,
        name: workflow.name,
        status: workflow.status,
        progress: workflow.progress,
        startedAt: workflow.startedAt,
      },
    });
  }
);

export const executeWorkflowByType = asyncHandler(
  async (req: Request, res: Response) => {
    const { type, context } = req.body;

    if (!type || !context) {
      res.status(400).json({
        error: 'Missing required parameters: type and context',
      });
      return;
    }

    const workflow = await workflowService.executeWorkflowByType(type, context);

    res.json({
      success: true,
      workflow: {
        id: workflow.id,
        name: workflow.name,
        status: workflow.status,
        progress: workflow.progress,
        startedAt: workflow.startedAt,
      },
    });
  }
);

export const getWorkflowStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { workflowId } = req.params;

    const workflow = await workflowService.getWorkflowStatus(workflowId);

    res.json({
      success: true,
      workflow,
    });
  }
);

export const pauseWorkflow = asyncHandler(
  async (req: Request, res: Response) => {
    const { workflowId } = req.params;

    await workflowService.pauseWorkflow(workflowId);

    res.json({
      success: true,
      message: 'Workflow paused successfully',
    });
  }
);

export const resumeWorkflow = asyncHandler(
  async (req: Request, res: Response) => {
    const { workflowId } = req.params;

    await workflowService.resumeWorkflow(workflowId);

    res.json({
      success: true,
      message: 'Workflow resumed successfully',
    });
  }
);

export const cancelWorkflow = asyncHandler(
  async (req: Request, res: Response) => {
    const { workflowId } = req.params;

    await workflowService.cancelWorkflow(workflowId);

    res.json({
      success: true,
      message: 'Workflow cancelled successfully',
    });
  }
);

export const listWorkflows = asyncHandler(
  async (_req: Request, res: Response) => {
    const { status, type, projectId } = req.query;

    const filters: any = {};
    if (status) filters.status = status;
    if (type) filters.type = type;
    if (projectId) filters['context.projectId'] = projectId;

    const workflows = await workflowService.listWorkflows(filters);

    res.json({
      success: true,
      workflows: workflows.map(w => ({
        id: w.id,
        name: w.name,
        type: w.type,
        status: w.status,
        progress: w.progress,
        startedAt: w.startedAt,
        completedAt: w.completedAt,
      })),
    });
  }
);

export const listTemplates = asyncHandler(
  async (req: Request, res: Response) => {
    const templates = await workflowService.listTemplates();

    res.json({
      success: true,
      templates: templates.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        type: t.type,
        version: t.version,
        author: t.author,
        tags: t.tags,
      })),
    });
  }
);

export const getTemplate = asyncHandler(async (req: Request, res: Response) => {
  const { templateId } = req.params;

  const template = await workflowService.getTemplate(templateId);

  if (!template) {
    res.status(404).json({
      error: 'Template not found',
    });
    return;
  }

  res.json({
    success: true,
    template,
  });
});

export const createFeatureWorkflow = asyncHandler(
  async (req: Request, res: Response) => {
    const { projectId, repositoryPath, branch, featureDescription, taskId } =
      req.body;

    if (!projectId || !repositoryPath || !branch || !featureDescription) {
      res.status(400).json({
        error: 'Missing required parameters',
      });
      return;
    }

    const workflow = await workflowService.createFeatureWorkflow(
      projectId,
      repositoryPath,
      branch,
      featureDescription,
      taskId
    );

    res.json({
      success: true,
      workflow: {
        id: workflow.id,
        name: workflow.name,
        status: workflow.status,
        progress: workflow.progress,
        startedAt: workflow.startedAt,
      },
    });
  }
);

export const createBugfixWorkflow = asyncHandler(
  async (req: Request, res: Response) => {
    const { projectId, repositoryPath, branch, bugDescription, taskId } =
      req.body;

    if (!projectId || !repositoryPath || !branch || !bugDescription) {
      res.status(400).json({
        error: 'Missing required parameters',
      });
      return;
    }

    const workflow = await workflowService.createBugfixWorkflow(
      projectId,
      repositoryPath,
      branch,
      bugDescription,
      taskId
    );

    res.json({
      success: true,
      workflow: {
        id: workflow.id,
        name: workflow.name,
        status: workflow.status,
        progress: workflow.progress,
        startedAt: workflow.startedAt,
      },
    });
  }
);

export const uploadTemplate = asyncHandler(
  async (req: Request, res: Response) => {
    const { template } = req.body;

    if (!template) {
      res.status(400).json({
        error: 'Missing template data',
      });
      return;
    }

    await workflowService.saveTemplate(template);

    res.json({
      success: true,
      message: 'Template uploaded successfully',
      templateId: template.id,
    });
  }
);
