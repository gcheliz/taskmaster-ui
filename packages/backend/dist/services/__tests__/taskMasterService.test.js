"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const taskMasterService_1 = require("../taskMasterService");
const commandExecutor_1 = require("../commandExecutor");
const taskMasterCommandBuilder_1 = require("../taskMasterCommandBuilder");
const taskMasterOutputParser_1 = require("../taskMasterOutputParser");
// Mock implementations for testing
class MockCommandExecutor extends commandExecutor_1.CommandExecutor {
    async executeCommand(command, args, options) {
        // Simulate different responses based on command
        if (args.includes('list')) {
            return {
                success: true,
                stdout: `
┌────┬─────────────────────────┬──────────┬────────┐
│ ID │ Title                   │ Status   │ Prior… │
├────┼─────────────────────────┼──────────┼────────┤
│ 1  │ Project Foundation      │ ✓ done   │ high   │
│ 2  │ Backend API             │ ✓ done   │ high   │
│ 3  │ Core UI Layout          │ ► in-p…  │ high   │
└────┴─────────────────────────┴──────────┴────────┘
Progress: ██████░░░░░░░░░░░░░░░░░░░░░░░░░ 30%
Done: 2  In Progress: 1  Pending: 5
        `,
                stderr: '',
                exitCode: 0,
                signal: null,
                duration: 100
            };
        }
        if (args.includes('show')) {
            return {
                success: true,
                stdout: `
╭────────────────────────────────────────────╮
│ Task: #3 - Core UI Layout and Components   │
╰────────────────────────────────────────────╯
┌───────────────┬────────────────────────────────────────────────────────────┐
│ ID:           │ 3                                                          │
│ Title:        │ Core UI Layout and Components                              │
│ Status:       │ ► in-progress                                              │
│ Priority:     │ high                                                       │
│ Complexity:   │ ● 8                                                        │
│ Description:  │ Implement main layout components and navigation            │
└───────────────┴────────────────────────────────────────────────────────────┘
        `,
                stderr: '',
                exitCode: 0,
                signal: null,
                duration: 150
            };
        }
        if (args.includes('set-status')) {
            return {
                success: true,
                stdout: `
╭───────────────────────────────────────────╮
│   Successfully updated task 3 status:     │
│   From: in-progress                       │
│   To:   done                              │
╰───────────────────────────────────────────╯
        `,
                stderr: '',
                exitCode: 0,
                signal: null,
                duration: 200
            };
        }
        if (args.includes('next')) {
            return {
                success: true,
                stdout: `
╭─────────────────────────────────────────────────╮
│ Next Task: #4 - Repository Connection UI       │
╰─────────────────────────────────────────────────╯
┌───────────────┬────────────────────────────────────────────────────────────┐
│ ID:           │ 4                                                          │
│ Title:        │ Repository Connection UI                                   │
│ Status:       │ ○ pending                                                  │
│ Priority:     │ high                                                       │
└───────────────┴────────────────────────────────────────────────────────────┘
        `,
                stderr: '',
                exitCode: 0,
                signal: null,
                duration: 120
            };
        }
        // Default response
        return {
            success: true,
            stdout: 'Command executed successfully',
            stderr: '',
            exitCode: 0,
            signal: null,
            duration: 100
        };
    }
}
describe('TaskMasterService - Advanced Service Abstraction Patterns', () => {
    let service;
    let mockExecutor;
    let commandBuilder;
    let outputParser;
    beforeEach(() => {
        // Dependency injection pattern for testing
        mockExecutor = new MockCommandExecutor();
        commandBuilder = new taskMasterCommandBuilder_1.TaskMasterCommandBuilder();
        outputParser = new taskMasterOutputParser_1.TaskMasterOutputParser();
        service = new taskMasterService_1.TaskMasterService(mockExecutor, commandBuilder, outputParser, { timeout: 5000, verbose: true });
    });
    afterEach(() => {
        service.dispose();
    });
    describe('Service Facade Pattern', () => {
        it('should provide unified interface for project operations', async () => {
            const projectPath = '/test/project';
            // Test project status retrieval
            const status = await service.getProjectStatus(projectPath);
            expect(status.success).toBe(true);
            expect(status.data).toBeDefined();
            expect(status.data?.path).toBe(projectPath);
            expect(status.command).toContain('task-master list');
            expect(status.timestamp).toBeInstanceOf(Date);
        });
        it('should handle complex task operations through simple interface', async () => {
            const projectPath = '/test/project';
            // List tasks
            const tasks = await service.listTasks(projectPath);
            expect(tasks.success).toBe(true);
            expect(Array.isArray(tasks.data)).toBe(true);
            expect(tasks.data?.length).toBeGreaterThan(0);
            // Get specific task
            const task = await service.getTask(projectPath, '3');
            expect(task.success).toBe(true);
            expect(task.data?.id).toBe('3');
            expect(task.data?.title).toContain('Core UI Layout');
            // Update task status
            const updated = await service.updateTaskStatus(projectPath, '3', 'done');
            expect(updated.success).toBe(true);
        });
    });
    describe('Event-Driven Architecture', () => {
        it('should emit events during operations', async () => {
            const events = [];
            service.on('operationStart', (operation) => {
                events.push(`start:${operation}`);
            });
            service.on('operationComplete', (operation) => {
                events.push(`complete:${operation}`);
            });
            await service.getProjectStatus('/test/project');
            expect(events).toContain('start:getProjectStatus');
            expect(events).toContain('complete:getProjectStatus');
        });
        it('should handle operation errors with events', async () => {
            const errorEvents = [];
            service.on('operationError', (operation, error) => {
                errorEvents.push({ operation, error });
            });
            // Create a service with a failing executor
            const failingExecutor = new MockCommandExecutor();
            failingExecutor.executeCommand = async () => {
                throw new Error('Command failed');
            };
            const failingService = new taskMasterService_1.TaskMasterService(failingExecutor);
            failingService.on('operationError', (operation, error) => {
                errorEvents.push({ operation, error });
            });
            try {
                await failingService.getProjectStatus('/test/project');
            }
            catch (error) {
                // Expected to throw
            }
            expect(errorEvents.length).toBeGreaterThan(0);
            failingService.dispose();
        });
    });
    describe('Command Builder Integration', () => {
        it('should build commands correctly for different operations', async () => {
            const projectPath = '/test/project';
            // Spy on command building
            const buildSpy = jest.spyOn(commandBuilder, 'buildCommand');
            await service.listTasks(projectPath, { status: 'pending' });
            expect(buildSpy).toHaveBeenCalledWith('list', expect.objectContaining({
                status: 'pending'
            }));
            await service.updateTaskStatus(projectPath, '1', 'done');
            expect(buildSpy).toHaveBeenCalledWith('set-status', expect.objectContaining({
                id: '1',
                status: 'done'
            }));
        });
    });
    describe('Output Parser Integration', () => {
        it('should parse task information correctly', async () => {
            const projectPath = '/test/project';
            const task = await service.getTask(projectPath, '3');
            expect(task.data).toMatchObject({
                id: '3',
                title: expect.stringContaining('Core UI Layout'),
                status: 'in-progress',
                priority: 'high'
            });
        });
        it('should extract project information from list output', async () => {
            const projectPath = '/test/project';
            const status = await service.getProjectStatus(projectPath);
            expect(status.data).toMatchObject({
                taskCount: expect.any(Number),
                completedTasks: expect.any(Number),
                path: projectPath
            });
        });
    });
    describe('Advanced Operations', () => {
        it('should support PRD parsing', async () => {
            const result = await service.parsePRD('/test/project', 'prd.txt');
            expect(result.success).toBe(true);
            expect(result.command).toContain('parse-prd');
        });
        it('should support task expansion with options', async () => {
            const result = await service.expandTask('/test/project', '1', {
                research: true,
                force: true
            });
            expect(result.success).toBe(true);
            expect(result.command).toContain('expand');
        });
        it('should support complexity analysis', async () => {
            const result = await service.analyzeComplexity('/test/project', {
                from: 1,
                to: 5,
                research: true
            });
            expect(result.success).toBe(true);
            expect(result.command).toContain('analyze-complexity');
        });
    });
    describe('Error Handling and Resilience', () => {
        it('should provide detailed error information', async () => {
            const failingExecutor = new MockCommandExecutor();
            failingExecutor.executeCommand = async () => {
                throw new Error('Network timeout');
            };
            const failingService = new taskMasterService_1.TaskMasterService(failingExecutor);
            try {
                await failingService.getTask('/test/project', '1');
                fail('Should have thrown an error');
            }
            catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error.message).toContain('Network timeout');
            }
            failingService.dispose();
        });
        it('should handle invalid task IDs gracefully', async () => {
            const emptyExecutor = new MockCommandExecutor();
            emptyExecutor.executeCommand = async () => ({
                success: true,
                stdout: 'No task found',
                stderr: '',
                exitCode: 0,
                signal: null,
                duration: 100
            });
            const emptyService = new taskMasterService_1.TaskMasterService(emptyExecutor);
            try {
                await emptyService.getTask('/test/project', 'nonexistent');
                fail('Should have thrown an error');
            }
            catch (error) {
                expect(error.message).toContain('not found');
            }
            emptyService.dispose();
        });
    });
    describe('Resource Management', () => {
        it('should clean up resources on disposal', () => {
            const killSpy = jest.spyOn(mockExecutor, 'killAllProcesses');
            service.dispose();
            expect(killSpy).toHaveBeenCalled();
        });
        it('should handle concurrent operations', async () => {
            const projectPath = '/test/project';
            // Execute multiple operations concurrently
            const operations = await Promise.all([
                service.getProjectStatus(projectPath),
                service.listTasks(projectPath),
                service.getNextTask(projectPath)
            ]);
            operations.forEach(result => {
                expect(result.success).toBe(true);
            });
        });
    });
});
describe('TaskMasterCommandBuilder - Advanced Builder Pattern', () => {
    let builder;
    beforeEach(() => {
        builder = new taskMasterCommandBuilder_1.TaskMasterCommandBuilder();
    });
    describe('Fluent Interface Pattern', () => {
        it('should support fluent command building', () => {
            const command = taskMasterCommandBuilder_1.TaskMasterCommandBuilder.createBuilder()
                .operation('set-status')
                .withId('3')
                .withStatus('done')
                .withTag('test-project')
                .build();
            expect(command.command).toBe('task-master');
            expect(command.args).toContain('set-status');
            expect(command.args).toContain('--id=3');
            expect(command.args).toContain('--status=done');
            expect(command.args).toContain('--tag=test-project');
        });
        it('should support complex command building with fluent interface', () => {
            const command = taskMasterCommandBuilder_1.TaskMasterCommandBuilder.createBuilder()
                .operation('expand')
                .withId('5')
                .withResearch()
                .withForce()
                .withTag('project')
                .build();
            expect(command.args).toContain('expand');
            expect(command.args).toContain('--id=5');
            expect(command.args).toContain('--research');
            expect(command.args).toContain('--force');
            expect(command.args).toContain('--tag=project');
        });
    });
    describe('Command Validation', () => {
        it('should validate required parameters', () => {
            expect(() => {
                builder.buildCommand('show', {});
            }).toThrow('Task ID is required');
            expect(() => {
                builder.buildCommand('set-status', { id: '1' });
            }).toThrow('Status is required');
        });
        it('should validate constructed commands', () => {
            const validCommand = builder.buildCommand('list', { tag: 'project' });
            expect(builder.validateCommand(validCommand)).toBe(true);
            const invalidCommand = {
                command: '',
                args: [],
                description: '',
                requiresRepository: false
            };
            expect(builder.validateCommand(invalidCommand)).toBe(false);
        });
    });
});
//# sourceMappingURL=taskMasterService.test.js.map