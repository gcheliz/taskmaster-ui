import { WorkflowTemplate, WorkflowStep, WorkflowVariable } from '../types';
import { logger } from '../../utils/logger';

export class WorkflowValidator {
  async validateTemplate(template: WorkflowTemplate): Promise<void> {
    const errors: string[] = [];

    // Validate basic properties
    if (!template.id) {
      errors.push('Template ID is required');
    }

    if (!template.name) {
      errors.push('Template name is required');
    }

    if (!template.type) {
      errors.push('Template type is required');
    }

    if (!template.version) {
      errors.push('Template version is required');
    }

    if (!template.steps || template.steps.length === 0) {
      errors.push('Template must have at least one step');
    }

    // Validate variables
    if (template.variables) {
      template.variables.forEach((variable, index) => {
        const varErrors = this.validateVariable(variable, index);
        errors.push(...varErrors);
      });
    }

    // Validate steps
    const stepIds = new Set<string>();
    const allStepIds = this.collectAllStepIds(template.steps);

    template.steps.forEach((step, index) => {
      const stepErrors = this.validateStep(step, index, stepIds, allStepIds);
      errors.push(...stepErrors);
    });

    // Check for circular dependencies
    const circularErrors = this.checkCircularDependencies(template.steps);
    errors.push(...circularErrors);

    if (errors.length > 0) {
      const message = `Template validation failed: ${errors.join(', ')}`;
      logger.error(message, { templateId: template.id, errors });
      throw new Error(message);
    }
  }

  private validateVariable(
    variable: WorkflowVariable,
    index: number
  ): string[] {
    const errors: string[] = [];
    const prefix = `Variable[${index}]`;

    if (!variable.name) {
      errors.push(`${prefix}: name is required`);
    }

    if (!variable.type) {
      errors.push(`${prefix}: type is required`);
    }

    const validTypes = ['string', 'number', 'boolean', 'array', 'object'];
    if (variable.type && !validTypes.includes(variable.type)) {
      errors.push(`${prefix}: invalid type '${variable.type}'`);
    }

    if (variable.required && variable.default !== undefined) {
      errors.push(
        `${prefix}: required variables should not have default values`
      );
    }

    return errors;
  }

  private validateStep(
    step: WorkflowStep,
    index: number,
    stepIds: Set<string>,
    allStepIds: Set<string>
  ): string[] {
    const errors: string[] = [];
    const prefix = `Step[${index}]`;

    if (!step.id) {
      errors.push(`${prefix}: id is required`);
    } else if (stepIds.has(step.id)) {
      errors.push(`${prefix}: duplicate step id '${step.id}'`);
    } else {
      stepIds.add(step.id);
    }

    if (!step.name) {
      errors.push(`${prefix}: name is required`);
    }

    if (!step.type) {
      errors.push(`${prefix}: type is required`);
    }

    const validTypes = [
      'agent',
      'command',
      'condition',
      'parallel',
      'sequential',
    ];
    if (step.type && !validTypes.includes(step.type)) {
      errors.push(`${prefix}: invalid type '${step.type}'`);
    }

    // Type-specific validation
    switch (step.type) {
      case 'agent':
        if (!step.agentType) {
          errors.push(`${prefix}: agentType is required for agent steps`);
        }
        break;

      case 'command':
        if (!step.command) {
          errors.push(`${prefix}: command is required for command steps`);
        }
        break;

      case 'condition':
        if (!step.condition) {
          errors.push(`${prefix}: condition is required for condition steps`);
        }
        break;

      case 'parallel':
      case 'sequential':
        if (!step.steps || step.steps.length === 0) {
          errors.push(`${prefix}: steps are required for ${step.type} steps`);
        }
        break;
    }

    // Validate dependencies
    if (step.dependsOn) {
      step.dependsOn.forEach(depId => {
        if (!allStepIds.has(depId)) {
          errors.push(`${prefix}: dependency '${depId}' does not exist`);
        }
      });
    }

    // Validate nested steps
    if (step.steps) {
      const nestedStepIds = new Set<string>();
      step.steps.forEach((nestedStep, nestedIndex) => {
        const nestedErrors = this.validateStep(
          nestedStep,
          nestedIndex,
          nestedStepIds,
          allStepIds
        );
        errors.push(...nestedErrors.map(e => `${prefix}.${e}`));
      });
    }

    return errors;
  }

  private collectAllStepIds(steps: WorkflowStep[]): Set<string> {
    const ids = new Set<string>();

    const collect = (stepList: WorkflowStep[]) => {
      stepList.forEach(step => {
        if (step.id) {
          ids.add(step.id);
        }
        if (step.steps) {
          collect(step.steps);
        }
      });
    };

    collect(steps);
    return ids;
  }

  private checkCircularDependencies(steps: WorkflowStep[]): string[] {
    const errors: string[] = [];
    const graph = this.buildDependencyGraph(steps);

    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const dependencies = graph.get(nodeId) || [];
      for (const depId of dependencies) {
        if (!visited.has(depId)) {
          if (hasCycle(depId)) {
            return true;
          }
        } else if (recursionStack.has(depId)) {
          errors.push(`Circular dependency detected: ${nodeId} -> ${depId}`);
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const stepId of graph.keys()) {
      if (!visited.has(stepId)) {
        hasCycle(stepId);
      }
    }

    return errors;
  }

  private buildDependencyGraph(steps: WorkflowStep[]): Map<string, string[]> {
    const graph = new Map<string, string[]>();

    const addToGraph = (stepList: WorkflowStep[]) => {
      stepList.forEach(step => {
        if (step.id && step.dependsOn) {
          graph.set(step.id, step.dependsOn);
        }
        if (step.steps) {
          addToGraph(step.steps);
        }
      });
    };

    addToGraph(steps);
    return graph;
  }
}
