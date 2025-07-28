import { EventEmitter } from 'events';
import { WorkflowService } from '../WorkflowService';
import { WorkflowContext, WorkflowType } from '../types';
import { logger } from '../../utils/logger';

export interface TriggerRule {
  id: string;
  name: string;
  description: string;
  event: string;
  conditions?: TriggerCondition[];
  workflowType: WorkflowType;
  variables?: Record<string, any>;
  enabled: boolean;
}

export interface TriggerCondition {
  field: string;
  operator: 'equals' | 'contains' | 'matches' | 'gt' | 'lt' | 'exists';
  value?: any;
}

export interface TriggerEvent {
  type: string;
  data: any;
  timestamp: Date;
  source: string;
}

export class WorkflowTriggers extends EventEmitter {
  private workflowService: WorkflowService;
  private rules: Map<string, TriggerRule>;
  private eventQueue: TriggerEvent[];
  private processing: boolean;

  constructor(workflowService: WorkflowService) {
    super();
    this.workflowService = workflowService;
    this.rules = new Map();
    this.eventQueue = [];
    this.processing = false;

    this.setupDefaultTriggers();
    this.startProcessing();
  }

  private setupDefaultTriggers(): void {
    // Trigger feature workflow on new feature task
    this.addRule({
      id: 'feature-task-created',
      name: 'Feature Task Created',
      description: 'Start feature workflow when a feature task is created',
      event: 'task.created',
      conditions: [
        {
          field: 'type',
          operator: 'equals',
          value: 'feature',
        },
      ],
      workflowType: 'feature',
      enabled: true,
    });

    // Trigger bug fix workflow on bug task
    this.addRule({
      id: 'bug-task-created',
      name: 'Bug Task Created',
      description: 'Start bug fix workflow when a bug task is created',
      event: 'task.created',
      conditions: [
        {
          field: 'type',
          operator: 'equals',
          value: 'bug',
        },
      ],
      workflowType: 'bugfix',
      enabled: true,
    });

    // Trigger test workflow on PR created
    this.addRule({
      id: 'pr-created-tests',
      name: 'PR Created - Run Tests',
      description: 'Run test workflow when a pull request is created',
      event: 'pr.created',
      workflowType: 'testing',
      enabled: true,
    });

    // Trigger review workflow on PR ready
    this.addRule({
      id: 'pr-ready-review',
      name: 'PR Ready for Review',
      description: 'Start code review workflow when PR is ready',
      event: 'pr.ready_for_review',
      workflowType: 'code-review',
      enabled: true,
    });

    // Trigger documentation update on major feature completion
    this.addRule({
      id: 'feature-completed-docs',
      name: 'Feature Completed - Update Docs',
      description: 'Update documentation when a major feature is completed',
      event: 'task.completed',
      conditions: [
        {
          field: 'type',
          operator: 'equals',
          value: 'feature',
        },
        {
          field: 'priority',
          operator: 'equals',
          value: 'high',
        },
      ],
      workflowType: 'documentation',
      enabled: true,
    });
  }

  addRule(rule: TriggerRule): void {
    this.rules.set(rule.id, rule);
    logger.info('Workflow trigger rule added', {
      ruleId: rule.id,
      event: rule.event,
    });
  }

  removeRule(ruleId: string): boolean {
    const removed = this.rules.delete(ruleId);
    if (removed) {
      logger.info('Workflow trigger rule removed', { ruleId });
    }
    return removed;
  }

  enableRule(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = true;
      logger.info('Workflow trigger rule enabled', { ruleId });
    }
  }

  disableRule(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = false;
      logger.info('Workflow trigger rule disabled', { ruleId });
    }
  }

  async handleEvent(event: TriggerEvent): Promise<void> {
    this.eventQueue.push(event);
    this.emit('event.received', event);
  }

  async handleWebhook(
    source: string,
    eventType: string,
    payload: any
  ): Promise<void> {
    const event: TriggerEvent = {
      type: `webhook.${source}.${eventType}`,
      data: payload,
      timestamp: new Date(),
      source: `webhook:${source}`,
    };

    await this.handleEvent(event);
  }

  private startProcessing(): void {
    setInterval(() => {
      if (!this.processing && this.eventQueue.length > 0) {
        this.processQueue();
      }
    }, 1000);
  }

  private async processQueue(): Promise<void> {
    this.processing = true;

    try {
      while (this.eventQueue.length > 0) {
        const event = this.eventQueue.shift()!;
        await this.processEvent(event);
      }
    } catch (error) {
      logger.error('Error processing trigger queue', { error });
    } finally {
      this.processing = false;
    }
  }

  private async processEvent(event: TriggerEvent): Promise<void> {
    logger.debug('Processing trigger event', { event });

    // Find matching rules
    const matchingRules = Array.from(this.rules.values()).filter(
      rule => rule.enabled && this.eventMatches(event, rule)
    );

    if (matchingRules.length === 0) {
      logger.debug('No matching trigger rules', { eventType: event.type });
      return;
    }

    // Execute workflows for matching rules
    for (const rule of matchingRules) {
      try {
        await this.executeWorkflowForRule(rule, event);
      } catch (error) {
        logger.error('Failed to execute workflow for rule', {
          error,
          ruleId: rule.id,
          event,
        });
      }
    }
  }

  private eventMatches(event: TriggerEvent, rule: TriggerRule): boolean {
    // Check event type
    if (event.type !== rule.event && !event.type.includes(rule.event)) {
      return false;
    }

    // Check conditions
    if (rule.conditions && rule.conditions.length > 0) {
      return rule.conditions.every(condition =>
        this.evaluateCondition(event.data, condition)
      );
    }

    return true;
  }

  private evaluateCondition(data: any, condition: TriggerCondition): boolean {
    const fieldValue = this.getFieldValue(data, condition.field);

    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;

      case 'contains':
        return String(fieldValue).includes(String(condition.value));

      case 'matches':
        return new RegExp(condition.value).test(String(fieldValue));

      case 'gt':
        return Number(fieldValue) > Number(condition.value);

      case 'lt':
        return Number(fieldValue) < Number(condition.value);

      case 'exists':
        return fieldValue !== undefined && fieldValue !== null;

      default:
        return false;
    }
  }

  private getFieldValue(data: any, field: string): any {
    const parts = field.split('.');
    let value = data;

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  private async executeWorkflowForRule(
    rule: TriggerRule,
    event: TriggerEvent
  ): Promise<void> {
    logger.info('Executing workflow for trigger rule', {
      ruleId: rule.id,
      workflowType: rule.workflowType,
      event: event.type,
    });

    // Build workflow context
    const context: WorkflowContext = {
      projectId: event.data.projectId || 'default',
      repositoryPath: event.data.repositoryPath || process.cwd(),
      branch: event.data.branch || 'main',
      taskId: event.data.taskId,
      variables: {
        ...rule.variables,
        triggerEvent: event.type,
        triggerData: event.data,
        triggeredBy: rule.id,
      },
      metadata: {
        source: 'trigger',
        triggerId: rule.id,
        triggerName: rule.name,
        eventType: event.type,
        eventSource: event.source,
        timestamp: event.timestamp.toISOString(),
      },
    };

    // Execute workflow based on type
    let workflow;

    switch (rule.workflowType) {
      case 'feature':
        workflow = await this.workflowService.createFeatureWorkflow(
          context.projectId,
          context.repositoryPath,
          context.branch,
          event.data.description || event.data.title || 'Triggered feature',
          context.taskId
        );
        break;

      case 'bugfix':
        workflow = await this.workflowService.createBugfixWorkflow(
          context.projectId,
          context.repositoryPath,
          context.branch,
          event.data.description || event.data.title || 'Triggered bug fix',
          context.taskId
        );
        break;

      default:
        workflow = await this.workflowService.executeWorkflowByType(
          rule.workflowType,
          context
        );
    }

    this.emit('workflow.triggered', {
      ruleId: rule.id,
      workflowId: workflow.id,
      event,
    });

    logger.info('Workflow triggered successfully', {
      ruleId: rule.id,
      workflowId: workflow.id,
      workflowType: rule.workflowType,
    });
  }

  getRules(): TriggerRule[] {
    return Array.from(this.rules.values());
  }

  getRule(ruleId: string): TriggerRule | undefined {
    return this.rules.get(ruleId);
  }

  getMetrics(): Record<string, any> {
    const metrics = {
      totalRules: this.rules.size,
      enabledRules: 0,
      disabledRules: 0,
      queuedEvents: this.eventQueue.length,
      rulesByEvent: {} as Record<string, number>,
    };

    for (const rule of this.rules.values()) {
      if (rule.enabled) {
        metrics.enabledRules++;
      } else {
        metrics.disabledRules++;
      }

      metrics.rulesByEvent[rule.event] =
        (metrics.rulesByEvent[rule.event] || 0) + 1;
    }

    return metrics;
  }
}
