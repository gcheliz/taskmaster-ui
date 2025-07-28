import { WorkflowContext, WorkflowVariable } from '../types';
import { logger } from '../../utils/logger';

export class WorkflowContextResolver {
  async resolve(
    context: WorkflowContext,
    variables?: WorkflowVariable[]
  ): Promise<WorkflowContext> {
    try {
      const resolvedContext = { ...context };

      // Initialize variables object if not present
      if (!resolvedContext.variables) {
        resolvedContext.variables = {};
      }

      // Add system variables
      resolvedContext.variables = {
        ...resolvedContext.variables,
        ...this.getSystemVariables(context),
      };

      // Apply variable definitions and defaults
      if (variables) {
        for (const varDef of variables) {
          if (varDef.required && !(varDef.name in resolvedContext.variables)) {
            throw new Error(`Required variable '${varDef.name}' is missing`);
          }

          if (
            !(varDef.name in resolvedContext.variables) &&
            varDef.default !== undefined
          ) {
            resolvedContext.variables[varDef.name] = varDef.default;
          }

          // Validate variable type
          if (varDef.name in resolvedContext.variables) {
            this.validateVariableType(
              varDef.name,
              resolvedContext.variables[varDef.name],
              varDef.type
            );
          }
        }
      }

      // Resolve environment variables
      resolvedContext.variables = this.resolveEnvironmentVariables(
        resolvedContext.variables
      );

      return resolvedContext;
    } catch (error) {
      logger.error('Failed to resolve workflow context', { error, context });
      throw error;
    }
  }

  private getSystemVariables(context: WorkflowContext): Record<string, any> {
    return {
      PROJECT_ID: context.projectId,
      REPOSITORY_PATH: context.repositoryPath,
      BRANCH: context.branch,
      TASK_ID: context.taskId || '',
      TIMESTAMP: new Date().toISOString(),
      USER: process.env['USER'] || 'system',
      WORKFLOW_ID: context.metadata?.['workflowId'] || '',
    };
  }

  private resolveEnvironmentVariables(
    variables: Record<string, any>
  ): Record<string, any> {
    const resolved: Record<string, any> = {};

    for (const [key, value] of Object.entries(variables)) {
      if (typeof value === 'string') {
        // Replace environment variable references like ${ENV_VAR}
        resolved[key] = value.replace(/\$\{([^}]+)\}/g, (match, envVar) => {
          return process.env[envVar] || match;
        });
      } else {
        resolved[key] = value;
      }
    }

    return resolved;
  }

  private validateVariableType(
    name: string,
    value: any,
    expectedType: string
  ): void {
    let actualType: string = typeof value;

    if (Array.isArray(value)) {
      actualType = 'array';
    } else if (value === null) {
      actualType = 'object';
    }

    const isValid = (() => {
      switch (expectedType) {
        case 'string':
          return actualType === 'string';
        case 'number':
          return actualType === 'number' && !isNaN(value);
        case 'boolean':
          return actualType === 'boolean';
        case 'array':
          return Array.isArray(value);
        case 'object':
          return (
            actualType === 'object' && !Array.isArray(value) && value !== null
          );
        default:
          return false;
      }
    })();

    if (!isValid) {
      throw new Error(
        `Variable '${name}' has invalid type. Expected ${expectedType}, got ${actualType}`
      );
    }
  }
}
