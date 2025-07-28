import { APIDevelopmentAgent, GenerateEndpointInput } from './api-development-core';
import { promises as fs } from 'fs';
import path from 'path';
import { logger } from '../../packages/backend/src/utils/winston-adapter';

export interface APICommand {
  name: string;
  description: string;
  execute: (args: any) => Promise<any>;
}

export class APIDevelopmentCommands {
  private agent: APIDevelopmentAgent;
  private workspacePath: string;

  constructor(workspacePath: string) {
    this.workspacePath = workspacePath;
    this.agent = new APIDevelopmentAgent(workspacePath);
  }

  /**
   * Get all available commands
   */
  getCommands(): APICommand[] {
    return [
      {
        name: 'generate',
        description: 'Generate a new API endpoint',
        execute: this.generateEndpoint.bind(this),
      },
      {
        name: 'update',
        description: 'Update an existing endpoint',
        execute: this.updateEndpoint.bind(this),
      },
      {
        name: 'document',
        description: 'Generate API documentation',
        execute: this.generateDocumentation.bind(this),
      },
      {
        name: 'validate',
        description: 'Validate API structure and patterns',
        execute: this.validateAPI.bind(this),
      },
    ];
  }

  /**
   * Generate endpoint command handler
   */
  private async generateEndpoint(args: GenerateEndpointInput): Promise<any> {
    try {
      // Validate input
      if (!args.endpoint || !args.method || !args.description) {
        throw new Error('Missing required fields: endpoint, method, and description are required');
      }

      // Generate the endpoint
      const result = await this.agent.generateEndpoint(args);

      // Write files
      for (const file of result.files) {
        const dir = path.dirname(file.path);
        await fs.mkdir(dir, { recursive: true });
        
        if (file.action === 'create') {
          // Check if file already exists
          try {
            await fs.access(file.path);
            console.warn(`File already exists: ${file.path}. Skipping...`);
            continue;
          } catch {
            // File doesn't exist, proceed with creation
          }
        }
        
        await fs.writeFile(file.path, file.content, 'utf-8');
        console.log(`${file.action === 'create' ? 'Created' : 'Updated'}: ${file.path}`);
      }

      // Update route registration if needed
      await this.updateRouteRegistration(args.endpoint, result);

      return {
        success: true,
        message: `Successfully generated ${args.method} ${args.endpoint}`,
        files: result.files.map(f => f.path),
        documentation: result.documentation,
      };
    } catch (error) {
      logger.error('Error generating endpoint:', error);
      throw error;
    }
  }

  /**
   * Update endpoint command handler
   */
  private async updateEndpoint(args: { endpoint: string; changes: Partial<GenerateEndpointInput> }): Promise<any> {
    try {
      const result = await this.agent.updateEndpoint(args.endpoint, args.changes);
      
      return {
        success: true,
        message: `Successfully updated ${args.endpoint}`,
        files: result.files.map(f => f.path),
      };
    } catch (error) {
      logger.error('Error updating endpoint:', error);
      throw error;
    }
  }

  /**
   * Generate documentation command handler
   */
  private async generateDocumentation(args: { format?: 'openapi' | 'markdown' }): Promise<any> {
    try {
      const format = args.format || 'openapi';
      const documentation = await this.agent.generateAPIDocumentation(format);
      
      const docPath = path.join(this.workspacePath, 'docs', 'api', `api-documentation.${format === 'openapi' ? 'json' : 'md'}`);
      await fs.mkdir(path.dirname(docPath), { recursive: true });
      await fs.writeFile(docPath, documentation, 'utf-8');
      
      return {
        success: true,
        message: `Generated API documentation in ${format} format`,
        path: docPath,
      };
    } catch (error) {
      logger.error('Error generating documentation:', error);
      throw error;
    }
  }

  /**
   * Validate API structure command handler
   */
  private async validateAPI(args: { path?: string }): Promise<any> {
    try {
      const targetPath = args.path || path.join(this.workspacePath, 'packages', 'backend', 'src');
      
      // Validate route structure
      const routesPath = path.join(targetPath, 'routes');
      const controllersPath = path.join(targetPath, 'controllers');
      const servicesPath = path.join(targetPath, 'services');
      
      const issues: string[] = [];
      
      // Check for orphaned routes
      const routeFiles = await fs.readdir(routesPath);
      for (const routeFile of routeFiles) {
        if (!routeFile.endsWith('Routes.ts')) continue;
        
        const baseName = routeFile.replace('Routes.ts', '');
        const controllerFile = `${baseName}Controller.ts`;
        const serviceFile = `${baseName}Service.ts`;
        
        try {
          await fs.access(path.join(controllersPath, controllerFile));
        } catch {
          issues.push(`Missing controller for route: ${routeFile}`);
        }
        
        try {
          await fs.access(path.join(servicesPath, serviceFile));
        } catch {
          issues.push(`Missing service for route: ${routeFile}`);
        }
      }
      
      return {
        success: issues.length === 0,
        message: issues.length === 0 ? 'API structure is valid' : 'Found API structure issues',
        issues,
      };
    } catch (error) {
      logger.error('Error validating API:', error);
      throw error;
    }
  }

  /**
   * Update main route registration file
   */
  private async updateRouteRegistration(endpoint: string, result: any): Promise<void> {
    const routeIndexPath = path.join(this.workspacePath, 'packages', 'backend', 'src', 'routes', 'index.ts');
    
    try {
      let content = await fs.readFile(routeIndexPath, 'utf-8');
      
      // Extract resource name from the generated files
      const routeFile = result.files.find(f => f.path.includes('Routes.ts'));
      if (!routeFile) return;
      
      const routeFileName = path.basename(routeFile.path, '.ts');
      const resourceName = routeFileName.replace('Routes', '');
      
      // Check if already imported
      if (!content.includes(`import ${resourceName}Routes`)) {
        // Add import
        const importStatement = `import ${resourceName}Routes from './${resourceName}Routes';`;
        const lastImportIndex = content.lastIndexOf('import');
        const nextNewlineIndex = content.indexOf('\n', lastImportIndex);
        content = content.slice(0, nextNewlineIndex + 1) + importStatement + '\n' + content.slice(nextNewlineIndex + 1);
        
        // Add route registration
        const useStatement = `router.use('/${resourceName.toLowerCase()}', ${resourceName}Routes);`;
        const exportIndex = content.indexOf('export default');
        content = content.slice(0, exportIndex) + useStatement + '\n\n' + content.slice(exportIndex);
        
        await fs.writeFile(routeIndexPath, content, 'utf-8');
        console.log(`Updated route registration for ${resourceName}`);
      }
    } catch (error) {
      console.warn('Could not update route registration:', error.message);
    }
  }
}

/**
 * CLI command parser for API development
 */
export async function handleAPICommand(command: string, args: any): Promise<any> {
  const workspacePath = process.cwd();
  const commands = new APIDevelopmentCommands(workspacePath);
  
  const availableCommands = commands.getCommands();
  const cmd = availableCommands.find(c => c.name === command);
  
  if (!cmd) {
    throw new Error(`Unknown command: ${command}. Available commands: ${availableCommands.map(c => c.name).join(', ')}`);
  }
  
  return cmd.execute(args);
}