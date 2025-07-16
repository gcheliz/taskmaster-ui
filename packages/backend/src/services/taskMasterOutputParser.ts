import { ParsedTaskMasterOutput, TaskInfo, ProjectInfo, ITaskMasterOutputParser } from '../types/taskMaster';

/**
 * Strategy Pattern Implementation for Output Parsing
 * Demonstrates: Strategy pattern, regex parsing, data extraction
 */

interface IParsingStrategy {
  canParse(output: string, command: string): boolean;
  parse(output: string): ParsedTaskMasterOutput[];
}

/**
 * Task List Parsing Strategy
 */
class TaskListParsingStrategy implements IParsingStrategy {
  canParse(output: string, command: string): boolean {
    return command.includes('list') && (output.includes('┌') || output.includes('Task Files'));
  }

  parse(output: string): ParsedTaskMasterOutput[] {
    const results: ParsedTaskMasterOutput[] = [];
    
    // Extract task table data
    const tableRegex = /│\s*(\d+(?:\.\d+)?)\s*│\s*([^│]+?)\s*│\s*([^│]+?)\s*│\s*([^│]+?)\s*│/g;
    let match;
    
    while ((match = tableRegex.exec(output)) !== null) {
      const [, id, title, status, priority] = match;
      
      results.push({
        type: 'success',
        message: `Task ${id}: ${title.trim()}`,
        data: {
          id: id.trim(),
          title: title.trim(),
          status: this.parseStatus(status.trim()),
          priority: priority.trim().toLowerCase(),
        },
        metadata: { type: 'task' }
      });
    }

    // Extract progress information
    const progressRegex = /Progress:\s*█+░*\s*(\d+)%|Tasks Progress:\s*█+░*\s*(\d+)%|(\d+)% complete/gi;
    let progressMatch;
    while ((progressMatch = progressRegex.exec(output)) !== null) {
      const percentage = progressMatch[1] || progressMatch[2] || progressMatch[3];
      if (percentage) {
        results.push({
          type: 'info',
          message: `Project progress: ${percentage}%`,
          data: { progress: parseInt(percentage) },
          metadata: { type: 'progress' }
        });
        break;
      }
    }

    return results;
  }

  private parseStatus(statusStr: string): string {
    if (statusStr.includes('✓') || statusStr.includes('done')) return 'done';
    if (statusStr.includes('►') || statusStr.includes('in-progress')) return 'in-progress';
    if (statusStr.includes('○') || statusStr.includes('pending')) return 'pending';
    if (statusStr.includes('!') || statusStr.includes('blocked')) return 'blocked';
    return 'pending';
  }
}

/**
 * Task Detail Parsing Strategy
 */
class TaskDetailParsingStrategy implements IParsingStrategy {
  canParse(output: string, command: string): boolean {
    return command.includes('show') && output.includes('Task:') || output.includes('Subtask:');
  }

  parse(output: string): ParsedTaskMasterOutput[] {
    const results: ParsedTaskMasterOutput[] = [];
    
    // Extract task ID and title
    const taskHeaderRegex = /(?:Task|Subtask):\s*#([\d.]+)\s*-\s*(.+?)(?=\s*│|\n|$)/s;
    const headerMatch = taskHeaderRegex.exec(output);
    
    if (headerMatch) {
      const [, id, title] = headerMatch;
      
      // Extract details from the formatted output
      const statusMatch = /Status:\s*│\s*([^│\n]+)/s.exec(output);
      const priorityMatch = /Priority:\s*│\s*([^│\n]+)/s.exec(output);
      const complexityMatch = /Complexity:\s*│\s*●\s*(\d+)/s.exec(output);
      const descriptionMatch = /Description:\s*│\s*([^│\n]+(?:\n\s*│\s*[^│\n]+)*)/s.exec(output);
      
      results.push({
        type: 'success',
        message: `Task details for ${id}`,
        data: {
          id: id.trim(),
          title: title.trim(),
          status: statusMatch ? this.parseStatus(statusMatch[1].trim()) : 'pending',
          priority: priorityMatch ? priorityMatch[1].trim().toLowerCase() : 'medium',
          complexity: complexityMatch ? parseInt(complexityMatch[1]) : undefined,
          description: descriptionMatch ? descriptionMatch[1].trim() : undefined
        },
        metadata: { type: 'task_detail' }
      });
    }

    // Extract subtasks if present
    const subtaskTableRegex = /│\s*([\d.]+)\s*│\s*([^│]+?)\s*│\s*([^│]+?)\s*│/g;
    let subtaskMatch;
    
    while ((subtaskMatch = subtaskTableRegex.exec(output)) !== null) {
      const [, id, title, status] = subtaskMatch;
      
      results.push({
        type: 'info',
        message: `Subtask ${id}: ${title.trim()}`,
        data: {
          id: id.trim(),
          title: title.trim(),
          status: this.parseStatus(status.trim()),
          type: 'subtask'
        },
        metadata: { type: 'subtask' }
      });
    }

    return results;
  }

  private parseStatus(statusStr: string): string {
    if (statusStr.includes('✓') || statusStr.includes('done')) return 'done';
    if (statusStr.includes('►') || statusStr.includes('in-progress')) return 'in-progress';
    if (statusStr.includes('○') || statusStr.includes('pending')) return 'pending';
    if (statusStr.includes('!') || statusStr.includes('blocked')) return 'blocked';
    return 'pending';
  }
}

/**
 * Status Update Parsing Strategy
 */
class StatusUpdateParsingStrategy implements IParsingStrategy {
  canParse(output: string, command: string): boolean {
    return command.includes('set-status') && output.includes('Successfully updated');
  }

  parse(output: string): ParsedTaskMasterOutput[] {
    const results: ParsedTaskMasterOutput[] = [];
    
    const updateRegex = /Successfully updated (?:task|subtask) ([\d.]+) status:[\s\S]*?From:\s*([\w-]+)[\s\S]*?To:\s*([\w-]+)/s;
    const match = updateRegex.exec(output);
    
    if (match) {
      const [, id, fromStatus, toStatus] = match;
      
      results.push({
        type: 'success',
        message: `Task ${id} status updated from ${fromStatus} to ${toStatus}`,
        data: {
          id: id.trim(),
          previousStatus: fromStatus.trim(),
          newStatus: toStatus.trim()
        },
        metadata: { type: 'status_update' }
      });
    }

    return results;
  }
}

/**
 * Next Task Parsing Strategy
 */
class NextTaskParsingStrategy implements IParsingStrategy {
  canParse(output: string, command: string): boolean {
    return command.includes('next') && output.includes('Next Task to Work On');
  }

  parse(output: string): ParsedTaskMasterOutput[] {
    const results: ParsedTaskMasterOutput[] = [];
    
    // Extract next task information
    const nextTaskRegex = /Next Task to Work On:\s*#([\d.]+)\s*-\s*(.+?)(?=\s*│|\n|$)/s;
    const match = nextTaskRegex.exec(output);
    
    if (match) {
      const [, id, title] = match;
      
      // Extract additional details
      const priorityMatch = /Priority:\s*(\w+)\s*Status:/s.exec(output);
      const statusMatch = /Status:\s*([^│\n]+?)(?=\s*│|\n)/s.exec(output);
      const dependenciesMatch = /Dependencies:\s*([^│\n]+?)(?=\s*│|\n)/s.exec(output);
      const descriptionMatch = /Description:\s*([^│\n]+(?:\n[^│\n]*?)*?)(?=\n\n|\n.*Start working|\n.*View details|$)/s.exec(output);
      
      results.push({
        type: 'success',
        message: `Next recommended task: ${id} - ${title.trim()}`,
        data: {
          id: id.trim(),
          title: title.trim(),
          priority: priorityMatch ? priorityMatch[1].trim().toLowerCase() : 'medium',
          status: statusMatch ? this.parseStatus(statusMatch[1].trim()) : 'pending',
          dependencies: dependenciesMatch ? this.parseDependencies(dependenciesMatch[1].trim()) : [],
          description: descriptionMatch ? descriptionMatch[1].trim() : undefined,
          isNext: true
        },
        metadata: { type: 'next_task' }
      });
    }

    return results;
  }

  private parseStatus(statusStr: string): string {
    if (statusStr.includes('✓') || statusStr.includes('done')) return 'done';
    if (statusStr.includes('►') || statusStr.includes('in-progress')) return 'in-progress';
    if (statusStr.includes('○') || statusStr.includes('pending')) return 'pending';
    if (statusStr.includes('!') || statusStr.includes('blocked')) return 'blocked';
    return 'pending';
  }

  private parseDependencies(depStr: string): string[] {
    if (depStr.toLowerCase().includes('none')) return [];
    // Clean up any table formatting characters
    const cleaned = depStr.replace(/│/g, '').trim();
    return cleaned.split(',').map(d => d.trim()).filter(d => d && !d.includes('│'));
  }
}

/**
 * Complexity Analysis Parsing Strategy
 */
class ComplexityAnalysisParsingStrategy implements IParsingStrategy {
  canParse(output: string, command: string): boolean {
    return command.includes('analyze-complexity') && 
           (output.includes('Complexity Analysis') || output.includes('Average complexity'));
  }

  parse(output: string): ParsedTaskMasterOutput[] {
    const results: ParsedTaskMasterOutput[] = [];
    
    // Extract overall complexity metrics
    const avgComplexityMatch = /Average complexity:\s*([\d.]+)/i.exec(output);
    const totalTasksMatch = /Total tasks analyzed:\s*(\d+)/i.exec(output);
    const recommendationsMatch = /Recommendations:\s*([^\n]+(?:\n[^\n]+)*?)(?=\n\n|$)/s.exec(output);
    
    if (avgComplexityMatch || totalTasksMatch) {
      const analysisData: any = {};
      
      if (avgComplexityMatch) analysisData.averageComplexity = parseFloat(avgComplexityMatch[1]);
      if (totalTasksMatch) analysisData.totalTasks = parseInt(totalTasksMatch[1]);
      if (recommendationsMatch) {
        analysisData.recommendations = recommendationsMatch[1].split('\n')
          .map(r => r.trim())
          .filter(r => r && !r.startsWith('-'));
      }
      
      results.push({
        type: 'success',
        message: 'Complexity analysis completed',
        data: analysisData,
        metadata: { type: 'complexity_analysis' }
      });
    }

    // Extract individual task complexities
    const taskComplexityRegex = /Task\s+([\d.]+):\s*complexity\s*(\d+)/gi;
    let taskMatch;
    
    while ((taskMatch = taskComplexityRegex.exec(output)) !== null) {
      const [, taskId, complexity] = taskMatch;
      
      results.push({
        type: 'info',
        message: `Task ${taskId} complexity: ${complexity}`,
        data: {
          taskId: taskId.trim(),
          complexity: parseInt(complexity)
        },
        metadata: { type: 'task_complexity' }
      });
    }

    return results;
  }
}

/**
 * PRD Parsing Strategy
 */
class PRDParsingStrategy implements IParsingStrategy {
  canParse(output: string, command: string): boolean {
    return command.includes('parse-prd') && 
           (output.includes('Generated') || output.includes('tasks from PRD'));
  }

  parse(output: string): ParsedTaskMasterOutput[] {
    const results: ParsedTaskMasterOutput[] = [];
    
    // Extract generation summary
    const generatedTasksMatch = /Generated\s+(\d+)\s+tasks|tasks from PRD/i.exec(output);
    const appendedMatch = /Appended\s+(\d+)\s+tasks|appended.*?(\d+).*?tasks/i.exec(output);
    const prdFileMatch = /PRD file:\s*(.+?)(?=\n|$)/i.exec(output);
    
    if (generatedTasksMatch || appendedMatch) {
      const taskCount = generatedTasksMatch ? 
        (generatedTasksMatch[1] ? parseInt(generatedTasksMatch[1]) : 1) : 
        (appendedMatch ? (appendedMatch[1] ? parseInt(appendedMatch[1]) : parseInt(appendedMatch[2] || '1')) : 1);
      
      results.push({
        type: 'success',
        message: `Successfully ${generatedTasksMatch ? 'generated' : 'appended'} ${taskCount} tasks from PRD`,
        data: {
          taskCount,
          operation: generatedTasksMatch ? 'generate' : 'append',
          prdFile: prdFileMatch ? prdFileMatch[1].trim() : undefined
        },
        metadata: { type: 'prd_parse' }
      });
    }

    // Extract task IDs that were created
    const createdTasksRegex = /Created task\s+([\d.]+):\s*(.+?)(?=\n|$)/gi;
    let createdMatch;
    
    while ((createdMatch = createdTasksRegex.exec(output)) !== null) {
      const [, taskId, title] = createdMatch;
      
      results.push({
        type: 'info',
        message: `Created task ${taskId}: ${title.trim()}`,
        data: {
          id: taskId.trim(),
          title: title.trim(),
          operation: 'created'
        },
        metadata: { type: 'task_created' }
      });
    }

    return results;
  }
}

/**
 * Expansion Parsing Strategy
 */
class ExpansionParsingStrategy implements IParsingStrategy {
  canParse(output: string, command: string): boolean {
    return command.includes('expand') && 
           (output.includes('Expanded task') || output.includes('subtasks created'));
  }

  parse(output: string): ParsedTaskMasterOutput[] {
    const results: ParsedTaskMasterOutput[] = [];
    
    // Extract expansion summary
    const expandedTaskMatch = /Expanded task\s+([\d.]+)\s+into\s+(\d+)\s+subtasks/i.exec(output);
    const subtasksCreatedMatch = /(\d+)\s+subtasks created/i.exec(output);
    
    if (expandedTaskMatch) {
      const [, taskId, subtaskCount] = expandedTaskMatch;
      
      results.push({
        type: 'success',
        message: `Task ${taskId} expanded into ${subtaskCount} subtasks`,
        data: {
          taskId: taskId.trim(),
          subtaskCount: parseInt(subtaskCount),
          operation: 'expand'
        },
        metadata: { type: 'task_expansion' }
      });
    } else if (subtasksCreatedMatch) {
      const [, count] = subtasksCreatedMatch;
      
      results.push({
        type: 'success',
        message: `${count} subtasks created`,
        data: {
          subtaskCount: parseInt(count),
          operation: 'expand'
        },
        metadata: { type: 'task_expansion' }
      });
    }

    // Extract individual subtask information
    const subtaskRegex = /Created subtask\s+([\d.]+):\s*(.+?)(?=\n|$)/gi;
    let subtaskMatch;
    
    while ((subtaskMatch = subtaskRegex.exec(output)) !== null) {
      const [, subtaskId, title] = subtaskMatch;
      
      results.push({
        type: 'info',
        message: `Created subtask ${subtaskId}: ${title.trim()}`,
        data: {
          id: subtaskId.trim(),
          title: title.trim(),
          type: 'subtask',
          operation: 'created'
        },
        metadata: { type: 'subtask_created' }
      });
    }

    return results;
  }
}

/**
 * Initialization Parsing Strategy
 */
class InitializationParsingStrategy implements IParsingStrategy {
  canParse(output: string, command: string): boolean {
    return command.includes('init') && 
           (output.includes('Initialized') || output.includes('TaskMaster initialized'));
  }

  parse(output: string): ParsedTaskMasterOutput[] {
    const results: ParsedTaskMasterOutput[] = [];
    
    // Extract initialization details
    const initializedMatch = /TaskMaster initialized in\s*(.+?)(?=\n|$)/i.exec(output);
    const configCreatedMatch = /Created config file:\s*(.+?)(?=\n|$)/i.exec(output);
    const templatesMatch = /Created\s+(\d+)\s+template files/i.exec(output);
    
    if (initializedMatch) {
      results.push({
        type: 'success',
        message: `TaskMaster initialized successfully in ${initializedMatch[1].trim()}`,
        data: {
          projectPath: initializedMatch[1].trim(),
          operation: 'init',
          configFile: configCreatedMatch ? configCreatedMatch[1].trim() : undefined,
          templateCount: templatesMatch ? parseInt(templatesMatch[1]) : undefined
        },
        metadata: { type: 'project_init' }
      });
    }

    return results;
  }
}

/**
 * Dependency Validation Parsing Strategy
 */
class DependencyValidationParsingStrategy implements IParsingStrategy {
  canParse(output: string, command: string): boolean {
    return command.includes('validate-dependencies') && 
           (output.includes('Dependencies') || output.includes('validation'));
  }

  parse(output: string): ParsedTaskMasterOutput[] {
    const results: ParsedTaskMasterOutput[] = [];
    
    // Extract validation results
    const validationPassedMatch = /All dependencies are valid|Validating.*dependencies.*valid/i.exec(output);
    const issuesFoundMatch = /Found\s+(\d+)\s+dependency issues|dependency issues/i.exec(output);
    const circularDepsMatch = /Circular dependency detected|circular dependency/i.exec(output);
    
    if (validationPassedMatch) {
      results.push({
        type: 'success',
        message: 'All task dependencies are valid',
        data: {
          validationStatus: 'passed',
          issues: 0
        },
        metadata: { type: 'dependency_validation' }
      });
    } else if (issuesFoundMatch) {
      const issueCount = parseInt(issuesFoundMatch[1]);
      
      results.push({
        type: 'warning',
        message: `Found ${issueCount} dependency issues`,
        data: {
          validationStatus: 'failed',
          issues: issueCount,
          hasCircularDependencies: !!circularDepsMatch
        },
        metadata: { type: 'dependency_validation' }
      });
    }

    // Extract specific dependency issues
    const issueRegex = /Issue:\s*Task\s+([\d.]+)\s+(.+?)(?=\n|$)/gi;
    let issueMatch;
    
    while ((issueMatch = issueRegex.exec(output)) !== null) {
      const [, taskId, issue] = issueMatch;
      
      results.push({
        type: 'warning',
        message: `Dependency issue in task ${taskId}: ${issue.trim()}`,
        data: {
          taskId: taskId.trim(),
          issue: issue.trim()
        },
        metadata: { type: 'dependency_issue' }
      });
    }

    return results;
  }
}

/**
 * Error Parsing Strategy
 */
class ErrorParsingStrategy implements IParsingStrategy {
  canParse(output: string, command: string): boolean {
    return output.toLowerCase().includes('error') || 
           output.toLowerCase().includes('failed') ||
           output.includes('[ERROR]') ||
           output.includes('npm error');
  }

  parse(output: string): ParsedTaskMasterOutput[] {
    const results: ParsedTaskMasterOutput[] = [];
    
    // Extract error messages with context
    const errorLines = output.split('\n').filter(line => 
      line.toLowerCase().includes('error') || 
      line.toLowerCase().includes('failed') ||
      line.includes('[ERROR]') ||
      line.includes('npm error')
    );
    
    errorLines.forEach(line => {
      const cleanLine = line.trim();
      if (cleanLine) {
        // Try to extract error code and message
        const errorCodeMatch = /(?:error|npm error)\s+([A-Z_]+[\d]*):?\s*(.+)|error\s+(TS\d+):\s*(.+)/i.exec(cleanLine);
        
        if (errorCodeMatch) {
          const code = errorCodeMatch[1] || errorCodeMatch[3]; // Handle both formats
          const message = errorCodeMatch[2] || errorCodeMatch[4];
          
          if (code && message) {
            results.push({
              type: 'error',
              message: message.trim(),
              data: {
                errorCode: code.trim(),
                fullMessage: cleanLine
              },
              metadata: { type: 'error' }
            });
          } else {
            results.push({
              type: 'error',
              message: cleanLine,
              metadata: { type: 'error' }
            });
          }
        } else {
          results.push({
            type: 'error',
            message: cleanLine,
            metadata: { type: 'error' }
          });
        }
      }
    });

    return results;
  }
}

/**
 * Main Output Parser using Strategy Pattern
 */
export class TaskMasterOutputParser implements ITaskMasterOutputParser {
  private strategies: IParsingStrategy[] = [
    new NextTaskParsingStrategy(),
    new ComplexityAnalysisParsingStrategy(),
    new PRDParsingStrategy(),
    new ExpansionParsingStrategy(),
    new InitializationParsingStrategy(),
    new DependencyValidationParsingStrategy(),
    new TaskListParsingStrategy(),
    new TaskDetailParsingStrategy(),
    new StatusUpdateParsingStrategy(),
    new ErrorParsingStrategy() // Keep error parsing last as fallback
  ];

  /**
   * Parse output using appropriate strategy
   */
  parseOutput(rawOutput: string, command: string): ParsedTaskMasterOutput[] {
    const allResults: ParsedTaskMasterOutput[] = [];
    
    // Try each strategy
    for (const strategy of this.strategies) {
      if (strategy.canParse(rawOutput, command)) {
        const results = strategy.parse(rawOutput);
        allResults.push(...results);
      }
    }

    // If no specific strategy worked, create a generic result
    if (allResults.length === 0) {
      allResults.push({
        type: 'info',
        message: 'Command executed',
        data: { rawOutput },
        metadata: { type: 'generic' }
      });
    }

    return allResults;
  }

  /**
   * Extract task information from output
   */
  extractTaskInfo(output: string): TaskInfo | null {
    const parsed = this.parseOutput(output, 'show');
    const taskData = parsed.find(p => p.metadata?.type === 'task_detail' || p.metadata?.type === 'next_task');
    
    if (taskData && taskData.data) {
      return {
        id: taskData.data.id,
        title: taskData.data.title,
        status: taskData.data.status,
        priority: taskData.data.priority,
        complexity: taskData.data.complexity,
        description: taskData.data.description,
        dependencies: taskData.data.dependencies
      };
    }

    return null;
  }

  /**
   * Extract multiple tasks from list output
   */
  extractTaskList(output: string): TaskInfo[] {
    const parsed = this.parseOutput(output, 'list');
    const tasks: TaskInfo[] = [];
    
    parsed.forEach(p => {
      if (p.metadata?.type === 'task' && p.data) {
        tasks.push({
          id: p.data.id,
          title: p.data.title,
          status: p.data.status,
          priority: p.data.priority,
          complexity: p.data.complexity,
          description: p.data.description,
          dependencies: p.data.dependencies || []
        });
      }
    });
    
    return tasks;
  }

  /**
   * Extract complexity analysis data
   */
  extractComplexityAnalysis(output: string): any {
    const parsed = this.parseOutput(output, 'analyze-complexity');
    const analysisData = parsed.find(p => p.metadata?.type === 'complexity_analysis');
    
    if (analysisData && analysisData.data) {
      return analysisData.data;
    }
    
    return null;
  }

  /**
   * Extract next task recommendation
   */
  extractNextTask(output: string): TaskInfo | null {
    const parsed = this.parseOutput(output, 'next');
    const nextTaskData = parsed.find(p => p.metadata?.type === 'next_task');
    
    if (nextTaskData && nextTaskData.data) {
      return {
        id: nextTaskData.data.id,
        title: nextTaskData.data.title,
        status: nextTaskData.data.status,
        priority: nextTaskData.data.priority,
        complexity: nextTaskData.data.complexity,
        description: nextTaskData.data.description,
        dependencies: nextTaskData.data.dependencies || []
      };
    }
    
    return null;
  }

  /**
   * Extract operation result (for actions like init, expand, parse-prd)
   */
  extractOperationResult(output: string, operation: string): any {
    const parsed = this.parseOutput(output, operation);
    
    // Find the main operation result
    const operationTypes = {
      'init': 'project_init',
      'expand': 'task_expansion',
      'parse-prd': 'prd_parse',
      'validate-dependencies': 'dependency_validation'
    };
    
    const expectedType = operationTypes[operation as keyof typeof operationTypes];
    const operationData = parsed.find(p => p.metadata?.type === expectedType);
    
    if (operationData) {
      return {
        success: operationData.type === 'success',
        message: operationData.message,
        data: operationData.data,
        additionalResults: parsed.filter(p => p !== operationData)
      };
    }
    
    return {
      success: false,
      message: 'Unknown operation result',
      data: null,
      additionalResults: parsed
    };
  }

  /**
   * Extract project information from output
   */
  extractProjectInfo(output: string): ProjectInfo | null {
    const progressMatch = /Progress:.*?(\d+)%/g.exec(output);
    const taskCountMatch = /Done:\s*(\d+).*?Pending:\s*(\d+)/g.exec(output);
    
    if (progressMatch || taskCountMatch) {
      return {
        name: 'TaskMaster Project',
        path: '', // Will be filled by calling service
        taskCount: taskCountMatch ? 
          parseInt(taskCountMatch[1]) + parseInt(taskCountMatch[2]) : 0,
        completedTasks: taskCountMatch ? parseInt(taskCountMatch[1]) : 0,
        lastUpdated: new Date()
      };
    }

    return null;
  }

  /**
   * Check if output indicates an error
   */
  isErrorOutput(output: string): boolean {
    return output.toLowerCase().includes('error') || 
           output.toLowerCase().includes('failed') ||
           output.includes('[ERROR]') ||
           output.includes('npm error');
  }

  /**
   * Add a custom parsing strategy
   */
  addStrategy(strategy: IParsingStrategy): void {
    this.strategies.unshift(strategy); // Add to beginning for priority
  }
}

// Export singleton instance
export const taskMasterOutputParser = new TaskMasterOutputParser();