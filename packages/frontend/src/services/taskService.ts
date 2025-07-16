// Task Service
// Handles reading and parsing tasks.json files

import type { 
  Task, 
  TasksData, 
  TaskMasterProject, 
  TaskBoardData, 
  TaskColumn, 
  TaskStats,
  TaskFilters,
  TaskSortOptions
} from '../types/task';
import {
  DEFAULT_COLUMNS,
  getTasksByStatus,
  getTaskStats,
  filterTasks,
  sortTasks
} from '../types/task';
import { ApiError, apiService } from './api';

export interface TaskServiceConfig {
  apiBaseUrl?: string;
  projectId?: string;
  enableCache?: boolean;
  cacheTimeout?: number;
  repositoryPath?: string;
  projectTag?: string;
}

export class TaskService {
  private config: TaskServiceConfig;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();

  constructor(config: TaskServiceConfig = {}) {
    this.config = {
      apiBaseUrl: config.apiBaseUrl || '/api',
      enableCache: config.enableCache !== false,
      cacheTimeout: config.cacheTimeout || 5 * 60 * 1000, // 5 minutes
      ...config
    };
  }

  /**
   * Load tasks from a tasks.json file for a specific project
   */
  async loadTasksFromProject(projectId: string): Promise<TasksData> {
    const cacheKey = `tasks-${projectId}`;
    
    // Check cache first
    if (this.config.enableCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < this.config.cacheTimeout!) {
        return cached.data;
      }
    }

    try {
      const response = await fetch(`${this.config.apiBaseUrl}/projects/${projectId}/tasks`);
      
      if (!response.ok) {
        throw new ApiError(
          'FETCH_TASKS_ERROR',
          `Failed to fetch tasks: ${response.status} ${response.statusText}`,
          response.status
        );
      }

      const tasksData: TasksData = await response.json();
      
      // Validate and transform data
      const validatedData = this.validateTasksData(tasksData);
      
      // Cache the result
      if (this.config.enableCache) {
        this.cache.set(cacheKey, {
          data: validatedData,
          timestamp: Date.now()
        });
      }

      return validatedData;
      
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        'NETWORK_ERROR',
        'Failed to load tasks from server',
        500
      );
    }
  }

  /**
   * Load sample tasks for development and testing
   */
  async loadSampleTasks(): Promise<TasksData> {
    try {
      // Import sample data
      const sampleData = await import('../data/sample-tasks.json');
      const projectData = sampleData.default as TaskMasterProject;
      
      // Get the first project in the sample data
      const projectKey = Object.keys(projectData)[0];
      const tasksData = projectData[projectKey];
      
      return this.validateTasksData(tasksData);
      
    } catch (error) {
      throw new ApiError(
        'SAMPLE_DATA_ERROR',
        'Failed to load sample tasks',
        500
      );
    }
  }

  /**
   * Load tasks from a specific tasks.json file path
   */
  async loadTasksFromFile(filePath: string): Promise<TasksData> {
    const cacheKey = `tasks-file-${filePath}`;
    
    // Check cache first
    if (this.config.enableCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < this.config.cacheTimeout!) {
        return cached.data;
      }
    }

    try {
      const response = await apiService.getTasksFromFile(filePath);
      let tasksData: TasksData;

      // Handle TaskMaster project format (project -> tasks structure)
      if (response && typeof response === 'object' && !Array.isArray(response.tasks)) {
        // Check if it's a TaskMaster project format
        const projectKeys = Object.keys(response);
        if (projectKeys.length > 0) {
          const firstProject = response[projectKeys[0]];
          if (firstProject && firstProject.tasks) {
            tasksData = firstProject;
          } else {
            throw new Error('Invalid project structure in tasks file');
          }
        } else {
          throw new Error('Empty or invalid tasks file');
        }
      } else {
        // Handle direct TasksData format
        tasksData = response;
      }

      // Validate and cache the result
      const validatedData = this.validateTasksData(tasksData);
      
      if (this.config.enableCache) {
        this.cache.set(cacheKey, {
          data: validatedData,
          timestamp: Date.now()
        });
      }

      return validatedData;
      
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        'TASK_FILE_ERROR',
        error instanceof Error ? error.message : 'Failed to load tasks from file',
        500
      );
    }
  }

  /**
   * Load tasks from a repository's TaskMaster project
   */
  async loadTasksFromRepository(repositoryPath: string, projectTag?: string): Promise<TasksData> {
    const cacheKey = `tasks-repo-${repositoryPath}-${projectTag || 'default'}`;
    
    // Check cache first
    if (this.config.enableCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < this.config.cacheTimeout!) {
        return cached.data;
      }
    }

    try {
      const response = await apiService.getTasksFromRepository(repositoryPath, projectTag);
      let tasksData: TasksData;

      // Handle TaskMaster project format
      if (response && typeof response === 'object') {
        if (projectTag && response[projectTag]) {
          tasksData = response[projectTag];
        } else {
          // Get the first project if no tag specified
          const projectKeys = Object.keys(response);
          if (projectKeys.length > 0) {
            tasksData = response[projectKeys[0]];
          } else {
            throw new Error('No projects found in repository');
          }
        }
      } else {
        throw new Error('Invalid response format from repository');
      }

      // Validate and cache the result
      const validatedData = this.validateTasksData(tasksData);
      
      if (this.config.enableCache) {
        this.cache.set(cacheKey, {
          data: validatedData,
          timestamp: Date.now()
        });
      }

      return validatedData;
      
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        'REPOSITORY_TASK_ERROR',
        error instanceof Error ? error.message : 'Failed to load tasks from repository',
        500
      );
    }
  }

  /**
   * Auto-detect and load tasks from the best available source
   */
  async loadTasks(): Promise<TasksData> {
    try {
      // Try to load from configured repository first
      if (this.config.repositoryPath) {
        return await this.loadTasksFromRepository(this.config.repositoryPath, this.config.projectTag);
      }
      
      // Try to load from configured project
      if (this.config.projectId) {
        return await this.loadTasksFromProject(this.config.projectId);
      }
      
      // Fall back to sample data
      return await this.loadSampleTasks();
      
    } catch (error) {
      // If all else fails, use sample data
      console.warn('Failed to load tasks from configured sources, using sample data:', error);
      return await this.loadSampleTasks();
    }
  }

  /**
   * Transform tasks data into Kanban board format
   */
  createTaskBoard(tasksData: TasksData, filters?: TaskFilters, sortOptions?: TaskSortOptions): TaskBoardData {
    let tasks = tasksData.tasks;
    
    // Apply filters if provided
    if (filters) {
      tasks = filterTasks(tasks, filters);
    }
    
    // Apply sorting if provided
    if (sortOptions) {
      tasks = sortTasks(tasks, sortOptions);
    }
    
    // Group tasks by status into columns
    const columns: TaskColumn[] = DEFAULT_COLUMNS.map(columnDef => ({
      ...columnDef,
      tasks: getTasksByStatus(tasks, columnDef.status)
    }));
    
    return {
      columns,
      tasks,
      metadata: tasksData.metadata
    };
  }

  /**
   * Get task statistics
   */
  getTaskStatistics(tasksData: TasksData): TaskStats {
    return getTaskStats(tasksData.tasks);
  }

  /**
   * Find a task by ID
   */
  findTaskById(tasksData: TasksData, taskId: number): Task | undefined {
    return tasksData.tasks.find(task => task.id === taskId);
  }

  /**
   * Get tasks by status
   */
  getTasksByStatus(tasksData: TasksData, status: Task['status']): Task[] {
    return getTasksByStatus(tasksData.tasks, status);
  }

  /**
   * Get tasks assigned to a specific user
   */
  getTasksByAssignee(tasksData: TasksData, assignee: string): Task[] {
    return tasksData.tasks.filter(task => task.assignedTo === assignee);
  }

  /**
   * Get tasks with specific priority
   */
  getTasksByPriority(tasksData: TasksData, priority: Task['priority']): Task[] {
    return tasksData.tasks.filter(task => task.priority === priority);
  }

  /**
   * Get overdue tasks
   */
  getOverdueTasks(tasksData: TasksData): Task[] {
    const now = new Date();
    return tasksData.tasks.filter(task => {
      if (!task.dueDate) return false;
      return new Date(task.dueDate) < now && task.status !== 'done';
    });
  }

  /**
   * Get tasks due within a specific time period
   */
  getTasksDueSoon(tasksData: TasksData, days: number = 7): Task[] {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return tasksData.tasks.filter(task => {
      if (!task.dueDate || task.status === 'done') return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= now && dueDate <= futureDate;
    });
  }

  /**
   * Search tasks by text
   */
  searchTasks(tasksData: TasksData, searchTerm: string): Task[] {
    if (!searchTerm.trim()) return tasksData.tasks;
    
    const term = searchTerm.toLowerCase();
    return tasksData.tasks.filter(task => {
      const searchableText = `${task.title} ${task.description} ${task.details || ''}`.toLowerCase();
      return searchableText.includes(term);
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Update service configuration
   */
  updateConfig(config: Partial<TaskServiceConfig>): void {
    this.config = {
      ...this.config,
      ...config
    };
    // Clear cache when config changes
    this.clearCache();
  }

  /**
   * Set repository path for task loading
   */
  setRepositoryPath(repositoryPath: string, projectTag?: string): void {
    this.updateConfig({
      repositoryPath,
      projectTag
    });
  }

  /**
   * Set project ID for task loading
   */
  setProjectId(projectId: string): void {
    this.updateConfig({
      projectId
    });
  }

  /**
   * Get current configuration
   */
  getConfig(): TaskServiceConfig {
    return { ...this.config };
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Check if a data source is configured
   */
  hasDataSource(): boolean {
    return !!(this.config.repositoryPath || this.config.projectId);
  }

  /**
   * Validate tasks data structure
   */
  private validateTasksData(data: any): TasksData {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid tasks data: must be an object');
    }

    if (!Array.isArray(data.tasks)) {
      throw new Error('Invalid tasks data: tasks must be an array');
    }

    if (!data.metadata || typeof data.metadata !== 'object') {
      throw new Error('Invalid tasks data: metadata must be an object');
    }

    // Validate each task
    data.tasks.forEach((task: any, index: number) => {
      if (!task.id || typeof task.id !== 'number') {
        throw new Error(`Invalid task at index ${index}: id must be a number`);
      }
      
      if (!task.title || typeof task.title !== 'string') {
        throw new Error(`Invalid task at index ${index}: title must be a string`);
      }
      
      if (!task.status || typeof task.status !== 'string') {
        throw new Error(`Invalid task at index ${index}: status must be a string`);
      }
      
      if (!task.priority || typeof task.priority !== 'string') {
        throw new Error(`Invalid task at index ${index}: priority must be a string`);
      }
    });

    return data as TasksData;
  }

  /**
   * Format task for display
   */
  formatTaskForDisplay(task: Task): Task {
    return {
      ...task,
      createdAt: task.createdAt ? new Date(task.createdAt).toISOString() : undefined,
      updatedAt: task.updatedAt ? new Date(task.updatedAt).toISOString() : undefined,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : undefined
    };
  }

  /**
   * Get task dependency chain
   */
  getTaskDependencies(tasksData: TasksData, taskId: number): Task[] {
    const task = this.findTaskById(tasksData, taskId);
    if (!task || !task.dependencies) return [];

    return task.dependencies
      .map(depId => this.findTaskById(tasksData, depId))
      .filter(Boolean) as Task[];
  }

  /**
   * Get tasks that depend on a specific task
   */
  getTaskDependents(tasksData: TasksData, taskId: number): Task[] {
    return tasksData.tasks.filter(task => 
      task.dependencies && task.dependencies.includes(taskId)
    );
  }

  /**
   * Check if a task can be moved to a new status
   */
  canMoveTask(tasksData: TasksData, taskId: number, newStatus: Task['status']): boolean {
    const task = this.findTaskById(tasksData, taskId);
    if (!task) return false;

    // Can't move completed tasks back to pending
    if (task.status === 'done' && newStatus === 'pending') {
      return false;
    }

    // Can't move to in-progress if dependencies are not done
    if (newStatus === 'in-progress' && task.dependencies) {
      const dependencies = this.getTaskDependencies(tasksData, taskId);
      const incompleteDeps = dependencies.filter(dep => dep.status !== 'done');
      if (incompleteDeps.length > 0) {
        return false;
      }
    }

    return true;
  }
}

// Default instance
export const taskService = new TaskService();