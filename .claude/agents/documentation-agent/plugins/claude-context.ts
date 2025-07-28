/**
 * Claude Context Plugin
 * 
 * Maintains and updates CLAUDE.md context file for AI assistant integration
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import {
  DocumentationPlugin,
  DocumentationType,
  PluginContext,
  DocumentationItem
} from '../core-engine';

interface ContextSection {
  title: string;
  content: string;
  order: number;
  autoUpdate: boolean;
}

interface ProjectContext {
  name: string;
  description: string;
  primaryLanguages: string[];
  frameworks: string[];
  architecturePattern: string;
  testingStrategy: string;
  deploymentTarget: string;
}

interface CodingStandards {
  styleGuide: string;
  lintingRules: string[];
  namingConventions: Map<string, string>;
  importOrder: string[];
}

interface CommonPatterns {
  errorHandling: string;
  stateManagement: string;
  apiIntegration: string;
  authentication: string;
  dataValidation: string;
}

interface WorkflowInfo {
  branchingStrategy: string;
  commitConvention: string;
  prProcess: string;
  cicdPipeline: string;
}

export class ClaudeContextPlugin implements DocumentationPlugin {
  name = 'claude-context';
  type = DocumentationType.README;
  description = 'Maintains CLAUDE.md context file for AI assistant integration';

  private projectContext: ProjectContext | null = null;
  private codingStandards: CodingStandards | null = null;
  private commonPatterns: CommonPatterns | null = null;
  private workflowInfo: WorkflowInfo | null = null;
  private customSections: ContextSection[] = [];

  async generate(context: PluginContext): Promise<DocumentationItem[]> {
    // Reset state
    this.reset();

    // Analyze project
    await this.analyzeProject(context);

    // Load existing CLAUDE.md if exists
    await this.loadExistingContext(context.projectRoot);

    // Generate context sections
    const sections = this.generateContextSections(context);

    // Combine sections
    const claudeContent = this.combineSections(sections);

    // Create documentation item
    return [{
      id: 'claude-context',
      name: 'CLAUDE.md',
      type: 'readme',
      category: 'AI Context',
      description: 'Claude AI assistant context and guidelines',
      tags: ['claude', 'ai', 'context', 'guidelines'],
      metadata: {
        content: claudeContent,
        path: 'CLAUDE.md',
        format: 'markdown',
        autoUpdate: true
      }
    }];
  }

  /**
   * Reset plugin state
   */
  private reset(): void {
    this.projectContext = null;
    this.codingStandards = null;
    this.commonPatterns = null;
    this.workflowInfo = null;
    this.customSections = [];
  }

  /**
   * Analyze project to extract context
   */
  private async analyzeProject(context: PluginContext): Promise<void> {
    // Extract project context
    this.projectContext = await this.extractProjectContext(context);
    
    // Extract coding standards
    this.codingStandards = await this.extractCodingStandards(context);
    
    // Extract common patterns
    this.commonPatterns = await this.extractCommonPatterns(context);
    
    // Extract workflow info
    this.workflowInfo = await this.extractWorkflowInfo(context);
  }

  /**
   * Extract project context
   */
  private async extractProjectContext(context: PluginContext): Promise<ProjectContext> {
    // Analyze package.json
    let packageInfo: any = {};
    try {
      const packagePath = path.join(context.projectRoot, 'package.json');
      const packageContent = await fs.readFile(packagePath, 'utf-8');
      packageInfo = JSON.parse(packageContent);
    } catch (error) {
      // Ignore if package.json doesn't exist
    }

    // Detect languages
    const languages = this.detectLanguages(context.astCache);
    
    // Detect frameworks
    const frameworks = this.detectFrameworks(packageInfo.dependencies || {});
    
    // Detect architecture pattern
    const architecturePattern = this.detectArchitecturePattern(context.astCache);
    
    // Detect testing strategy
    const testingStrategy = this.detectTestingStrategy(packageInfo);
    
    // Detect deployment target
    const deploymentTarget = this.detectDeploymentTarget(context.astCache);

    return {
      name: packageInfo.name || 'Project',
      description: packageInfo.description || 'No description provided',
      primaryLanguages: languages,
      frameworks,
      architecturePattern,
      testingStrategy,
      deploymentTarget
    };
  }

  /**
   * Detect primary languages
   */
  private detectLanguages(astCache: Map<string, any>): string[] {
    const languages = new Set<string>();
    
    for (const filePath of astCache.keys()) {
      const ext = path.extname(filePath).toLowerCase();
      switch (ext) {
        case '.ts':
        case '.tsx':
          languages.add('TypeScript');
          break;
        case '.js':
        case '.jsx':
          languages.add('JavaScript');
          break;
        case '.py':
          languages.add('Python');
          break;
        case '.go':
          languages.add('Go');
          break;
        case '.rs':
          languages.add('Rust');
          break;
      }
    }
    
    return Array.from(languages);
  }

  /**
   * Detect frameworks
   */
  private detectFrameworks(dependencies: Record<string, string>): string[] {
    const frameworks: string[] = [];
    const deps = Object.keys(dependencies);
    
    // Frontend frameworks
    if (deps.includes('react')) frameworks.push('React');
    if (deps.includes('vue')) frameworks.push('Vue.js');
    if (deps.includes('@angular/core')) frameworks.push('Angular');
    if (deps.includes('next')) frameworks.push('Next.js');
    
    // Backend frameworks
    if (deps.includes('express')) frameworks.push('Express.js');
    if (deps.includes('fastify')) frameworks.push('Fastify');
    if (deps.includes('@nestjs/core')) frameworks.push('NestJS');
    
    // Build tools
    if (deps.includes('vite')) frameworks.push('Vite');
    if (deps.includes('webpack')) frameworks.push('Webpack');
    
    // ORMs
    if (deps.includes('prisma') || deps.includes('@prisma/client')) frameworks.push('Prisma');
    if (deps.includes('typeorm')) frameworks.push('TypeORM');
    
    return frameworks;
  }

  /**
   * Detect architecture pattern
   */
  private detectArchitecturePattern(astCache: Map<string, any>): string {
    const paths = Array.from(astCache.keys());
    
    // Check for common architecture patterns
    if (paths.some(p => p.includes('/controllers/') && p.includes('/services/'))) {
      return 'MVC (Model-View-Controller)';
    }
    
    if (paths.some(p => p.includes('/domain/') && p.includes('/infrastructure/'))) {
      return 'Clean Architecture';
    }
    
    if (paths.some(p => p.includes('/components/') && p.includes('/hooks/'))) {
      return 'Component-Based Architecture';
    }
    
    if (paths.some(p => p.includes('/features/'))) {
      return 'Feature-Based Architecture';
    }
    
    return 'Modular Architecture';
  }

  /**
   * Detect testing strategy
   */
  private detectTestingStrategy(packageInfo: any): string {
    const deps = {
      ...packageInfo.dependencies,
      ...packageInfo.devDependencies
    };
    
    const strategies: string[] = [];
    
    if (deps['jest'] || deps['vitest']) strategies.push('Unit Testing');
    if (deps['@testing-library/react']) strategies.push('Component Testing');
    if (deps['playwright'] || deps['cypress']) strategies.push('E2E Testing');
    if (deps['supertest']) strategies.push('API Testing');
    
    return strategies.join(', ') || 'No automated testing';
  }

  /**
   * Detect deployment target
   */
  private detectDeploymentTarget(astCache: Map<string, any>): string {
    const paths = Array.from(astCache.keys());
    
    if (paths.some(p => p.includes('Dockerfile'))) {
      return 'Docker/Kubernetes';
    }
    
    if (paths.some(p => p.includes('vercel.json'))) {
      return 'Vercel';
    }
    
    if (paths.some(p => p.includes('netlify.toml'))) {
      return 'Netlify';
    }
    
    if (paths.some(p => p.includes('.github/workflows'))) {
      return 'GitHub Actions';
    }
    
    return 'Traditional Server/Cloud';
  }

  /**
   * Extract coding standards
   */
  private async extractCodingStandards(context: PluginContext): Promise<CodingStandards> {
    // Check for ESLint config
    let lintingRules: string[] = [];
    try {
      const eslintPath = path.join(context.projectRoot, '.eslintrc.js');
      const eslintContent = await fs.readFile(eslintPath, 'utf-8');
      if (eslintContent.includes('airbnb')) lintingRules.push('Airbnb Style Guide');
      if (eslintContent.includes('standard')) lintingRules.push('StandardJS');
    } catch {
      // No ESLint config
    }

    // Naming conventions
    const namingConventions = new Map<string, string>([
      ['components', 'PascalCase (e.g., UserProfile)'],
      ['functions', 'camelCase (e.g., getUserData)'],
      ['constants', 'UPPER_SNAKE_CASE (e.g., MAX_RETRY_COUNT)'],
      ['files', 'kebab-case (e.g., user-profile.tsx)'],
      ['interfaces', 'PascalCase with I prefix (e.g., IUserData)'],
      ['types', 'PascalCase (e.g., UserRole)']
    ]);

    // Import order
    const importOrder = [
      'External dependencies (React, Express, etc.)',
      'Internal aliases (@/components, @/utils)',
      'Relative imports (./Component, ../utils)',
      'Type imports (import type { ... })',
      'Style imports (*.css, *.scss)'
    ];

    return {
      styleGuide: lintingRules[0] || 'Project-specific conventions',
      lintingRules,
      namingConventions,
      importOrder
    };
  }

  /**
   * Extract common patterns
   */
  private async extractCommonPatterns(context: PluginContext): Promise<CommonPatterns> {
    // These would be detected by analyzing actual code patterns
    // For now, return common defaults
    return {
      errorHandling: 'Try-catch blocks with custom error classes and centralized error handling middleware',
      stateManagement: 'React Context API with useReducer for complex state, TanStack Query for server state',
      apiIntegration: 'Axios with interceptors for authentication and error handling',
      authentication: 'JWT-based authentication with refresh tokens',
      dataValidation: 'Zod for runtime validation, TypeScript for compile-time type safety'
    };
  }

  /**
   * Extract workflow info
   */
  private async extractWorkflowInfo(context: PluginContext): Promise<WorkflowInfo> {
    return {
      branchingStrategy: 'Git Flow (main, develop, feature/*, release/*, hotfix/*)',
      commitConvention: 'Conventional Commits (feat:, fix:, docs:, etc.)',
      prProcess: 'PR requires approval, passing tests, and up-to-date with base branch',
      cicdPipeline: 'GitHub Actions for CI/CD with automated testing and deployment'
    };
  }

  /**
   * Load existing CLAUDE.md
   */
  private async loadExistingContext(projectRoot: string): Promise<void> {
    try {
      const claudePath = path.join(projectRoot, 'CLAUDE.md');
      const content = await fs.readFile(claudePath, 'utf-8');
      
      // Parse existing custom sections
      const customSectionRegex = /## Custom:(.*?)\n([\s\S]*?)(?=\n##|$)/g;
      let match;
      let order = 100;
      
      while ((match = customSectionRegex.exec(content)) !== null) {
        this.customSections.push({
          title: match[1].trim(),
          content: match[2].trim(),
          order: order++,
          autoUpdate: false
        });
      }
    } catch {
      // No existing CLAUDE.md
    }
  }

  /**
   * Generate context sections
   */
  private generateContextSections(context: PluginContext): ContextSection[] {
    const sections: ContextSection[] = [];

    // Header
    sections.push({
      title: 'Header',
      order: 1,
      autoUpdate: true,
      content: `# Claude AI Context - ${this.projectContext?.name}

This file provides context and guidelines for Claude AI when working with this codebase.
It is automatically maintained and updated by the Documentation Agent.

Last Updated: ${new Date().toISOString()}`
    });

    // Project Overview
    sections.push({
      title: 'Project Overview',
      order: 2,
      autoUpdate: true,
      content: this.generateProjectOverview()
    });

    // Tech Stack
    sections.push({
      title: 'Tech Stack',
      order: 3,
      autoUpdate: true,
      content: this.generateTechStack()
    });

    // Project Structure
    sections.push({
      title: 'Project Structure',
      order: 4,
      autoUpdate: true,
      content: this.generateProjectStructure()
    });

    // Coding Standards
    sections.push({
      title: 'Coding Standards',
      order: 5,
      autoUpdate: true,
      content: this.generateCodingStandards()
    });

    // Common Patterns
    sections.push({
      title: 'Common Patterns',
      order: 6,
      autoUpdate: true,
      content: this.generateCommonPatterns()
    });

    // Development Workflow
    sections.push({
      title: 'Development Workflow',
      order: 7,
      autoUpdate: true,
      content: this.generateWorkflow()
    });

    // AI Assistant Guidelines
    sections.push({
      title: 'AI Assistant Guidelines',
      order: 8,
      autoUpdate: true,
      content: this.generateAIGuidelines()
    });

    // Key Commands
    sections.push({
      title: 'Key Commands',
      order: 9,
      autoUpdate: true,
      content: this.generateKeyCommands()
    });

    // Add custom sections
    sections.push(...this.customSections);

    return sections.sort((a, b) => a.order - b.order);
  }

  /**
   * Generate project overview section
   */
  private generateProjectOverview(): string {
    const pc = this.projectContext!;
    return `## Project Overview

**Name**: ${pc.name}
**Description**: ${pc.description}
**Primary Languages**: ${pc.primaryLanguages.join(', ')}
**Architecture**: ${pc.architecturePattern}
**Testing Strategy**: ${pc.testingStrategy}
**Deployment Target**: ${pc.deploymentTarget}`;
  }

  /**
   * Generate tech stack section
   */
  private generateTechStack(): string {
    const pc = this.projectContext!;
    const lines = ['## Tech Stack', ''];
    
    // Group frameworks by category
    const frontend = pc.frameworks.filter(f => ['React', 'Vue.js', 'Angular', 'Next.js', 'Vite'].includes(f));
    const backend = pc.frameworks.filter(f => ['Express.js', 'Fastify', 'NestJS'].includes(f));
    const database = pc.frameworks.filter(f => ['Prisma', 'TypeORM'].includes(f));
    
    if (frontend.length > 0) {
      lines.push('### Frontend');
      lines.push(...frontend.map(f => `- ${f}`));
      lines.push('');
    }
    
    if (backend.length > 0) {
      lines.push('### Backend');
      lines.push(...backend.map(f => `- ${f}`));
      lines.push('');
    }
    
    if (database.length > 0) {
      lines.push('### Database/ORM');
      lines.push(...database.map(f => `- ${f}`));
      lines.push('');
    }
    
    return lines.join('\n');
  }

  /**
   * Generate project structure section
   */
  private generateProjectStructure(): string {
    return `## Project Structure

\`\`\`
src/
├── components/     # React components (atomic design)
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── services/      # API services and business logic
├── controllers/   # Express route handlers
├── middleware/    # Express middleware
├── utils/         # Utility functions
├── types/         # TypeScript type definitions
└── styles/        # Global styles and themes
\`\`\`

### Key Directories

- **components/**: Organized by atomic design (atoms, molecules, organisms)
- **services/**: Contains API calls and business logic
- **controllers/**: Express route handlers following RESTful conventions
- **utils/**: Pure utility functions and helpers`;
  }

  /**
   * Generate coding standards section
   */
  private generateCodingStandards(): string {
    const cs = this.codingStandards!;
    const lines = ['## Coding Standards', ''];
    
    lines.push(`### Style Guide: ${cs.styleGuide}`);
    lines.push('');
    
    lines.push('### Naming Conventions');
    lines.push('');
    for (const [type, convention] of cs.namingConventions) {
      lines.push(`- **${type}**: ${convention}`);
    }
    lines.push('');
    
    lines.push('### Import Order');
    lines.push('');
    cs.importOrder.forEach((order, i) => {
      lines.push(`${i + 1}. ${order}`);
    });
    lines.push('');
    
    lines.push('### TypeScript Guidelines');
    lines.push('- Use strict mode');
    lines.push('- Prefer interfaces over types for object shapes');
    lines.push('- Use explicit return types for functions');
    lines.push('- Avoid `any` type - use `unknown` if type is truly unknown');
    
    return lines.join('\n');
  }

  /**
   * Generate common patterns section
   */
  private generateCommonPatterns(): string {
    const cp = this.commonPatterns!;
    return `## Common Patterns

### Error Handling
${cp.errorHandling}

### State Management
${cp.stateManagement}

### API Integration
${cp.apiIntegration}

### Authentication
${cp.authentication}

### Data Validation
${cp.dataValidation}

### Component Patterns
- Use functional components with hooks
- Implement proper loading and error states
- Follow atomic design principles
- Use composition over inheritance`;
  }

  /**
   * Generate workflow section
   */
  private generateWorkflow(): string {
    const wi = this.workflowInfo!;
    return `## Development Workflow

### Branching Strategy
${wi.branchingStrategy}

### Commit Convention
${wi.commitConvention}

Examples:
- \`feat: add user authentication\`
- \`fix: resolve database connection issue\`
- \`docs: update API documentation\`

### Pull Request Process
${wi.prProcess}

### CI/CD Pipeline
${wi.cicdPipeline}`;
  }

  /**
   * Generate AI guidelines section
   */
  private generateAIGuidelines(): string {
    return `## AI Assistant Guidelines

### When Writing Code
1. **Follow existing patterns**: Analyze similar files before creating new ones
2. **Use TypeScript strictly**: Provide proper types and interfaces
3. **Include error handling**: Always handle edge cases and errors
4. **Write tests**: Create tests for new functionality
5. **Update documentation**: Keep README and inline docs current

### When Reviewing Code
1. Check for TypeScript errors and type safety
2. Ensure proper error handling
3. Verify test coverage
4. Look for performance optimizations
5. Suggest improvements following project patterns

### When Refactoring
1. Maintain backward compatibility
2. Update all affected tests
3. Document breaking changes
4. Follow incremental approach
5. Ensure no functionality is lost

### Communication Style
- Be concise and clear
- Provide code examples
- Explain the "why" behind suggestions
- Offer multiple solutions when applicable
- Ask for clarification when requirements are ambiguous`;
  }

  /**
   * Generate key commands section
   */
  private generateKeyCommands(): string {
    return `## Key Commands

### Development
\`\`\`bash
pnpm install          # Install dependencies
pnpm dev             # Start development server
pnpm build           # Build for production
pnpm test            # Run tests
pnpm lint            # Run linter
pnpm format          # Format code
\`\`\`

### Database
\`\`\`bash
pnpm prisma:migrate  # Run migrations
pnpm prisma:generate # Generate Prisma client
pnpm prisma:studio   # Open Prisma Studio
pnpm db:seed         # Seed database
\`\`\`

### Git Workflow
\`\`\`bash
git checkout -b feature/name  # Create feature branch
git commit -m "feat: ..."    # Commit with conventional format
git push origin feature/name # Push to remote
\`\`\`

### Task Management
\`\`\`bash
task-master list             # List all tasks
task-master next             # Get next task
task-master show <id>        # Show task details
task-master set-status       # Update task status
\`\`\``;
  }

  /**
   * Combine sections into final content
   */
  private combineSections(sections: ContextSection[]): string {
    return sections
      .map(section => section.content)
      .join('\n\n') + '\n';
  }
}

// Export singleton instance
export const claudeContextPlugin = new ClaudeContextPlugin();