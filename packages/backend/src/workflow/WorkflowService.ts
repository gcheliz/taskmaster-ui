import { EventEmitter } from 'events';
import { WorkflowEngine } from './WorkflowEngine';
import { InMemoryWorkflowRepository } from './repositories/InMemoryWorkflowRepository';
import { InMemoryWorkflowInstanceRepository } from './repositories/InMemoryWorkflowInstanceRepository';
import { YamlTemplateLoader } from './loaders/YamlTemplateLoader';
import {
  WorkflowTemplate,
  WorkflowInstance,
  WorkflowContext,
  WorkflowType,
  WorkflowEvent,
  WorkflowRepository,
  WorkflowInstanceRepository,
} from './types';
import { logger } from '../utils/logger';
import path from 'path';

export class WorkflowService extends EventEmitter {
  private engine: WorkflowEngine;
  private templateRepository: WorkflowRepository;
  private instanceRepository: WorkflowInstanceRepository;
  private templateLoader: YamlTemplateLoader;

  constructor() {
    super();
    this.instanceRepository = new InMemoryWorkflowInstanceRepository();
    this.templateRepository = new InMemoryWorkflowRepository();
    this.engine = new WorkflowEngine(this.instanceRepository);
    this.templateLoader = new YamlTemplateLoader();

    // Forward engine events
    this.engine.on('workflow.event', (event: WorkflowEvent) => {
      this.emit('workflow.event', event);
    });

    // Load default templates
    this.loadDefaultTemplates();
  }

  async executeWorkflow(
    templateId: string,
    context: WorkflowContext
  ): Promise<WorkflowInstance> {
    try {
      const template = await this.templateRepository.getTemplate(templateId);
      if (!template) {
        throw new Error(`Workflow template '${templateId}' not found`);
      }

      logger.info('Executing workflow', {
        templateId,
        templateName: template.name,
        context,
      });

      return await this.engine.execute(template, context);
    } catch (error) {
      logger.error('Failed to execute workflow', {
        error,
        templateId,
        context,
      });
      throw error;
    }
  }

  async executeWorkflowByType(
    type: WorkflowType,
    context: WorkflowContext
  ): Promise<WorkflowInstance> {
    try {
      const templates = await this.templateRepository.getTemplateByType(type);
      if (templates.length === 0) {
        throw new Error(`No workflow templates found for type '${type}'`);
      }

      // Use the first matching template (could be enhanced with version selection)
      const template = templates[0];

      if (!template) {
        throw new Error(`No workflow template available for type '${type}'`);
      }

      logger.info('Executing workflow by type', {
        type,
        templateId: template.id,
        templateName: template.name,
        context,
      });

      return await this.engine.execute(template, context);
    } catch (error) {
      logger.error('Failed to execute workflow by type', {
        error,
        type,
        context,
      });
      throw error;
    }
  }

  async pauseWorkflow(workflowId: string): Promise<void> {
    return await this.engine.pause(workflowId);
  }

  async resumeWorkflow(workflowId: string): Promise<void> {
    return await this.engine.resume(workflowId);
  }

  async cancelWorkflow(workflowId: string): Promise<void> {
    return await this.engine.cancel(workflowId);
  }

  async getWorkflowStatus(workflowId: string): Promise<WorkflowInstance> {
    return await this.engine.getStatus(workflowId);
  }

  async listWorkflows(
    filters?: Partial<WorkflowInstance>
  ): Promise<WorkflowInstance[]> {
    return await this.instanceRepository.list(filters);
  }

  async getTemplate(templateId: string): Promise<WorkflowTemplate | null> {
    return await this.templateRepository.getTemplate(templateId);
  }

  async listTemplates(): Promise<WorkflowTemplate[]> {
    return await this.templateRepository.listTemplates();
  }

  async saveTemplate(template: WorkflowTemplate): Promise<void> {
    return await this.templateRepository.saveTemplate(template);
  }

  async loadTemplateFromFile(filePath: string): Promise<void> {
    try {
      const template = await this.templateLoader.loadFromFile(filePath);
      await this.templateRepository.saveTemplate(template);
      logger.info('Loaded workflow template', {
        templateId: template.id,
        templateName: template.name,
        filePath,
      });
    } catch (error) {
      logger.error('Failed to load workflow template', { error, filePath });
      throw error;
    }
  }

  private async loadDefaultTemplates(): Promise<void> {
    try {
      const templatesDir = path.join(__dirname, 'templates');
      await this.templateLoader.loadFromDirectory(
        templatesDir,
        async template => {
          await this.templateRepository.saveTemplate(template);
          logger.info('Loaded default template', {
            templateId: template.id,
            templateName: template.name,
          });
        }
      );
    } catch (error) {
      logger.warn('Failed to load default templates', { error });
    }
  }

  async createFeatureWorkflow(
    projectId: string,
    repositoryPath: string,
    branch: string,
    featureDescription: string,
    taskId?: string
  ): Promise<WorkflowInstance> {
    const context: WorkflowContext = {
      projectId,
      repositoryPath,
      branch,
      taskId: taskId || undefined,
      variables: {
        featureDescription,
        featureName: this.extractFeatureName(featureDescription),
      },
      metadata: {
        createdBy: 'system',
        createdAt: new Date().toISOString(),
      },
    };

    return await this.executeWorkflowByType('feature', context);
  }

  async createBugfixWorkflow(
    projectId: string,
    repositoryPath: string,
    branch: string,
    bugDescription: string,
    taskId?: string
  ): Promise<WorkflowInstance> {
    const context: WorkflowContext = {
      projectId,
      repositoryPath,
      branch,
      taskId: taskId || undefined,
      variables: {
        bugDescription,
        bugId: this.extractBugId(bugDescription),
      },
      metadata: {
        createdBy: 'system',
        createdAt: new Date().toISOString(),
      },
    };

    return await this.executeWorkflowByType('bugfix', context);
  }

  private extractFeatureName(description: string): string {
    // Extract a concise feature name from description
    const words = description.split(' ').slice(0, 3);
    return words
      .join('-')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '');
  }

  private extractBugId(description: string): string {
    // Try to extract bug ID from description, or generate one
    const match = description.match(/#(\d+)/);
    return match && match[1] ? match[1] : `bug-${Date.now()}`;
  }
}
