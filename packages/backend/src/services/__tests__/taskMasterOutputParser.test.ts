// Comprehensive tests for TaskMaster Output Parser
// Tests all parsing strategies with real TaskMaster CLI output examples

import { TaskMasterOutputParser } from '../taskMasterOutputParser';

describe('TaskMasterOutputParser', () => {
  let parser: TaskMasterOutputParser;

  beforeEach(() => {
    parser = new TaskMasterOutputParser();
  });

  describe('Task List Parsing', () => {
    it('should parse task list output with table format', () => {
      const output = `
┌────┬─────────────────────────┬──────────┬────────┬──────────────┬───────┐
│ ID │ Title                   │ Status   │ Prior… │ Dependencies │ Comp… │
├────┼─────────────────────────┼──────────┼────────┼──────────────┼───────┤
│ 1  │ Project Foundation ...  │ ✓ done   │ high   │ None         │ ● 8   │
├────┼─────────────────────────┼──────────┼────────┼──────────────┼───────┤
│ 2  │ Backend API and Dat...  │ ► in-progress │ high   │ 1            │ ● 7   │
├────┼─────────────────────────┼──────────┼────────┼──────────────┼───────┤
│ 3  │ Core UI Layout...       │ ○ pending │ medium │ 1, 2         │ ● 5   │
└────┴─────────────────────────┴──────────┴────────┴──────────────┴───────┘
      `;

      const results = parser.parseOutput(output, 'list');
      
      expect(results.length).toBeGreaterThan(0);
      
      const tasks = results.filter(r => r.metadata?.type === 'task');
      expect(tasks).toHaveLength(3);
      
      expect(tasks[0].data).toMatchObject({
        id: '1',
        title: 'Project Foundation ...',
        status: 'done',
        priority: 'high'
      });
      
      expect(tasks[1].data).toMatchObject({
        id: '2',
        status: 'in-progress'
      });
      
      expect(tasks[2].data).toMatchObject({
        id: '3',
        status: 'pending'
      });
    });

    it('should extract progress information from task list', () => {
      const output = `
Project Progress: █████░░░░░░░░░░░░░░░░░░░░░░░ 25%
Done: 5  In Progress: 2  Pending: 15
      `;

      const results = parser.parseOutput(output, 'list');
      const progressInfo = results.find(r => r.metadata?.type === 'progress');
      
      expect(progressInfo).toBeDefined();
      expect(progressInfo!.data.progress).toBe(25);
    });
  });

  describe('Task Detail Parsing', () => {
    it('should parse detailed task information', () => {
      const output = `
╭─────────────────────────────────────────────╮
│ Task: #1.2 - Implement User Authentication   │
╰─────────────────────────────────────────────╯
┌───────────────┬────────────────────────────────────────────────────────────┐
│ ID:           │ 1.2                                                        │
│ Status:       │ ► in-progress                                              │
│ Priority:     │ High                                                       │
│ Complexity:   │ ● 8                                                        │
│ Description:  │ Set up JWT-based authentication system with bcrypt        │
│               │ for password hashing and secure token management.         │
└───────────────┴────────────────────────────────────────────────────────────┘
      `;

      const results = parser.parseOutput(output, 'show');
      const taskDetail = results.find(r => r.metadata?.type === 'task_detail');
      
      expect(taskDetail).toBeDefined();
      expect(taskDetail!.data).toMatchObject({
        id: '1.2',
        title: 'Implement User Authentication',
        status: 'in-progress',
        priority: 'high',
        complexity: 8
      });
    });

    it('should parse subtask information from task details', () => {
      const output = `
╭─────────────────────────────────────────────╮
│ Subtask: #1.2.1 - JWT Token Implementation  │
╰─────────────────────────────────────────────╯
┌───────────────┬────────────────────────────────────────────────────────────┐
│ ID:           │ 1.2.1                                                      │
│ Status:       │ ✓ done                                                     │
└───────────────┴────────────────────────────────────────────────────────────┘
      `;

      const results = parser.parseOutput(output, 'show');
      const subtaskDetail = results.find(r => r.metadata?.type === 'task_detail');
      
      expect(subtaskDetail).toBeDefined();
      expect(subtaskDetail!.data).toMatchObject({
        id: '1.2.1',
        title: 'JWT Token Implementation',
        status: 'done'
      });
    });
  });

  describe('Next Task Parsing', () => {
    it('should parse next task recommendation', () => {
      const output = `
╭────────────────────── ⚡ RECOMMENDED NEXT TASK ⚡ ───────────────────────╮
│                                                                          │
│  🔥 Next Task to Work On: #6.4 - Structured Output Parsing Logic         │
│                                                                          │
│  Priority: high   Status: ○ pending                                      │
│  Dependencies: 6.2                                                       │
│                                                                          │
│  Description: Implement parsers to transform the raw text output from    │
│  specific task-master commands into structured JSON data. This is        │
│  critical for commands that return lists or detailed object              │
│  information.                                                            │
│                                                                          │
│  Start working: task-master set-status --id=6.4 --status=in-progress     │
│  View details: task-master show 6.4                                      │
│                                                                          │
╰──────────────────────────────────────────────────────────────────────────╯
      `;

      const results = parser.parseOutput(output, 'next');
      const nextTask = results.find(r => r.metadata?.type === 'next_task');
      
      expect(nextTask).toBeDefined();
      expect(nextTask!.data).toMatchObject({
        id: '6.4',
        title: 'Structured Output Parsing Logic',
        priority: 'high',
        status: 'pending',
        dependencies: ['6.2'],
        isNext: true
      });
    });
  });

  describe('Status Update Parsing', () => {
    it('should parse successful status updates', () => {
      const output = `
╭───────────────────────────────────────────╮
│                                           │
│   Successfully updated task 6.4 status:   │
│   From: pending                           │
│   To:   in-progress                       │
│                                           │
╰───────────────────────────────────────────╯
      `;

      const results = parser.parseOutput(output, 'set-status');
      const statusUpdate = results.find(r => r.metadata?.type === 'status_update');
      
      expect(statusUpdate).toBeDefined();
      expect(statusUpdate!.data).toMatchObject({
        id: '6.4',
        previousStatus: 'pending',
        newStatus: 'in-progress'
      });
    });
  });

  describe('Complexity Analysis Parsing', () => {
    it('should parse complexity analysis results', () => {
      const output = `
╭─────────────────────────────────────────────╮
│            Complexity Analysis              │
│                                             │
│  Total tasks analyzed: 15                   │
│  Average complexity: 6.2                   │
│                                             │
│  Task complexities:                         │
│  Task 1: complexity 8                      │
│  Task 2: complexity 7                      │
│  Task 3: complexity 4                      │
│                                             │
│  Recommendations:                           │
│  - Consider breaking down high complexity   │
│    tasks into smaller subtasks              │
│  - Focus on tasks with complexity < 6       │
╰─────────────────────────────────────────────╯
      `;

      const results = parser.parseOutput(output, 'analyze-complexity');
      const analysis = results.find(r => r.metadata?.type === 'complexity_analysis');
      
      expect(analysis).toBeDefined();
      expect(analysis!.data).toMatchObject({
        totalTasks: 15,
        averageComplexity: 6.2,
        recommendations: expect.arrayContaining([
          expect.stringContaining('breaking down high complexity')
        ])
      });

      const taskComplexities = results.filter(r => r.metadata?.type === 'task_complexity');
      expect(taskComplexities).toHaveLength(3);
      expect(taskComplexities[0].data).toMatchObject({
        taskId: '1',
        complexity: 8
      });
    });
  });

  describe('PRD Parsing', () => {
    it('should parse PRD generation results', () => {
      const output = `
[INFO] Parsing PRD file: ./docs/requirements.txt
[INFO] Generated 12 tasks from PRD
[INFO] Created task 1: Project Setup and Configuration
[INFO] Created task 2: Backend API Development
[INFO] Created task 3: Frontend UI Implementation
      `;

      const results = parser.parseOutput(output, 'parse-prd');
      const prdResult = results.find(r => r.metadata?.type === 'prd_parse');
      
      expect(prdResult).toBeDefined();
      expect(prdResult!.data).toMatchObject({
        taskCount: 12,
        operation: 'generate',
        prdFile: './docs/requirements.txt'
      });

      const createdTasks = results.filter(r => r.metadata?.type === 'task_created');
      expect(createdTasks).toHaveLength(3);
      expect(createdTasks[0].data).toMatchObject({
        id: '1',
        title: 'Project Setup and Configuration'
      });
    });

    it('should parse PRD append results', () => {
      const output = `
[INFO] Appended 5 tasks to existing project
[INFO] Created task 21: Additional Feature Implementation
      `;

      const results = parser.parseOutput(output, 'parse-prd');
      const prdResult = results.find(r => r.metadata?.type === 'prd_parse');
      
      expect(prdResult).toBeDefined();
      expect(prdResult!.data).toMatchObject({
        taskCount: 5,
        operation: 'append'
      });
    });
  });

  describe('Task Expansion Parsing', () => {
    it('should parse task expansion results', () => {
      const output = `
[INFO] Expanded task 6 into 5 subtasks
[INFO] Created subtask 6.1: Core Command Execution Module
[INFO] Created subtask 6.2: TaskMaster CLI Service Abstraction
[INFO] Created subtask 6.3: Backend API Endpoint for CLI Execution
      `;

      const results = parser.parseOutput(output, 'expand');
      const expansion = results.find(r => r.metadata?.type === 'task_expansion');
      
      expect(expansion).toBeDefined();
      expect(expansion!.data).toMatchObject({
        taskId: '6',
        subtaskCount: 5,
        operation: 'expand'
      });

      const subtasks = results.filter(r => r.metadata?.type === 'subtask_created');
      expect(subtasks).toHaveLength(3);
      expect(subtasks[0].data).toMatchObject({
        id: '6.1',
        title: 'Core Command Execution Module',
        type: 'subtask'
      });
    });
  });

  describe('Initialization Parsing', () => {
    it('should parse project initialization results', () => {
      const output = `
[INFO] TaskMaster initialized in /Users/john/projects/my-app
[INFO] Created config file: .taskmaster/config.json
[INFO] Created 3 template files
      `;

      const results = parser.parseOutput(output, 'init');
      const initResult = results.find(r => r.metadata?.type === 'project_init');
      
      expect(initResult).toBeDefined();
      expect(initResult!.data).toMatchObject({
        projectPath: '/Users/john/projects/my-app',
        operation: 'init',
        configFile: '.taskmaster/config.json',
        templateCount: 3
      });
    });
  });

  describe('Dependency Validation Parsing', () => {
    it('should parse successful dependency validation', () => {
      const output = `
[INFO] Validating task dependencies...
[INFO] All dependencies are valid
[INFO] No circular dependencies detected
      `;

      const results = parser.parseOutput(output, 'validate-dependencies');
      const validation = results.find(r => r.metadata?.type === 'dependency_validation');
      
      expect(validation).toBeDefined();
      expect(validation!.data).toMatchObject({
        validationStatus: 'passed',
        issues: 0
      });
    });

    it('should parse dependency validation failures', () => {
      const output = `
[WARNING] Found 2 dependency issues
[WARNING] Issue: Task 5.2 depends on non-existent task 4.7
[WARNING] Issue: Task 8.1 has circular dependency
[ERROR] Circular dependency detected in task chain
      `;

      const results = parser.parseOutput(output, 'validate-dependencies');
      const validation = results.find(r => r.metadata?.type === 'dependency_validation');
      
      expect(validation).toBeDefined();
      expect(validation!.data).toMatchObject({
        validationStatus: 'failed',
        issues: 2,
        hasCircularDependencies: true
      });

      const issues = results.filter(r => r.metadata?.type === 'dependency_issue');
      expect(issues).toHaveLength(2);
    });
  });

  describe('Error Parsing', () => {
    it('should parse various error formats', () => {
      const output = `
[ERROR] Command failed with exit code 1
npm error code ENOENT
error TS2304: Cannot find name 'undefined'
[ERROR] VALIDATION_ERROR: Required field missing
      `;

      const results = parser.parseOutput(output, 'any-command');
      const errors = results.filter(r => r.type === 'error');
      
      expect(errors.length).toBeGreaterThan(0);
      
      const npmError = errors.find(e => e.message.includes('ENOENT'));
      expect(npmError).toBeDefined();
      
      const tsError = errors.find(e => e.message.includes('TS2304'));
      expect(tsError).toBeDefined();
      
      const validationError = errors.find(e => e.data?.errorCode === 'VALIDATION_ERROR');
      expect(validationError).toBeDefined();
    });
  });

  describe('Extraction Methods', () => {
    it('should extract task list correctly', () => {
      const output = `
┌────┬─────────────────────────┬──────────┬────────┐
│ ID │ Title                   │ Status   │ Prior… │
├────┼─────────────────────────┼──────────┼────────┤
│ 1  │ Task One               │ ✓ done   │ high   │
│ 2  │ Task Two               │ ○ pending │ medium │
└────┴─────────────────────────┴──────────┴────────┘
      `;

      const tasks = parser.extractTaskList(output);
      
      expect(tasks).toHaveLength(2);
      expect(tasks[0]).toMatchObject({
        id: '1',
        title: 'Task One',
        status: 'done',
        priority: 'high'
      });
    });

    it('should extract next task correctly', () => {
      const output = `
Next Task to Work On: #3.1 - Database Setup
Priority: high   Status: ○ pending
Dependencies: 2.1, 2.2
      `;

      const nextTask = parser.extractNextTask(output);
      
      expect(nextTask).toMatchObject({
        id: '3.1',
        title: 'Database Setup',
        priority: 'high',
        status: 'pending',
        dependencies: ['2.1', '2.2']
      });
    });

    it('should extract operation results correctly', () => {
      const output = `
[INFO] TaskMaster initialized in /project/path
[INFO] Created config file: .taskmaster/config.json
      `;

      const result = parser.extractOperationResult(output, 'init');
      
      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        projectPath: '/project/path',
        operation: 'init'
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty output gracefully', () => {
      const results = parser.parseOutput('', 'list');
      
      expect(results).toHaveLength(1);
      expect(results[0].metadata?.type).toBe('generic');
    });

    it('should handle malformed table data', () => {
      const output = `
┌────┬─────────────────────────┬──────────┐
│ ID │ Title                   │ Status   │
├────┼─────────────────────────┼──────────┤
│ 1  │ Incomplete row         
│    │ Another malformed      │ data     │
└────┴─────────────────────────┴──────────┘
      `;

      const results = parser.parseOutput(output, 'list');
      
      // Should not crash, might have fewer results than expected
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should detect error output correctly', () => {
      const errorOutput = '[ERROR] Something went wrong';
      const normalOutput = 'Task completed successfully';
      
      expect(parser.isErrorOutput(errorOutput)).toBe(true);
      expect(parser.isErrorOutput(normalOutput)).toBe(false);
    });

    it('should add custom strategies', () => {
      const customStrategy = {
        canParse: (output: string, command: string) => command === 'custom',
        parse: (output: string) => [{
          type: 'success' as const,
          message: 'Custom parsed',
          metadata: { type: 'custom' }
        }]
      };

      parser.addStrategy(customStrategy);
      const results = parser.parseOutput('test', 'custom');
      
      expect(results[0].message).toBe('Custom parsed');
      expect(results[0].metadata?.type).toBe('custom');
    });
  });
});