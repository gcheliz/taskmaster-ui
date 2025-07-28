/**
 * README Generator Plugin
 * 
 * Automatically generates and updates README files with project information,
 * installation instructions, API documentation, and configuration details
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import {
  DocumentationPlugin,
  DocumentationType,
  PluginContext,
  DocumentationItem
} from '../core-engine';

interface ReadmeSection {
  title: string;
  content: string;
  order: number;
}

interface ProjectInfo {
  name: string;
  version: string;
  description: string;
  license: string;
  author?: string;
  repository?: string;
  homepage?: string;
  keywords?: string[];
}

interface DependencyInfo {
  name: string;
  version: string;
  description?: string;
  isDevDependency: boolean;
}

interface ScriptInfo {
  name: string;
  command: string;
  description?: string;
}

interface ApiEndpointInfo {
  method: string;
  path: string;
  description: string;
  authentication?: boolean;
}

interface EnvironmentVariable {
  name: string;
  description: string;
  required: boolean;
  default?: string;
  example?: string;
}

export class ReadmeGeneratorPlugin implements DocumentationPlugin {
  name = 'readme-generator';
  type = DocumentationType.README;
  description = 'Generates comprehensive README documentation for projects';

  private projectInfo: ProjectInfo | null = null;
  private dependencies: DependencyInfo[] = [];
  private scripts: ScriptInfo[] = [];
  private apiEndpoints: ApiEndpointInfo[] = [];
  private envVariables: EnvironmentVariable[] = [];
  private features: string[] = [];
  private techStack: Map<string, string[]> = new Map();

  async generate(context: PluginContext): Promise<DocumentationItem[]> {
    // Reset state
    this.reset();

    // Analyze project
    await this.analyzeProject(context);

    // Generate README sections
    const sections = this.generateReadmeSections(context);

    // Combine sections into README
    const readmeContent = this.combinesSections(sections);

    // Create documentation items
    const items: DocumentationItem[] = [];

    // Main README
    items.push({
      id: 'readme-main',
      name: 'README.md',
      type: 'readme',
      category: 'Project Documentation',
      description: 'Main project README file',
      tags: ['readme', 'documentation', 'getting-started'],
      metadata: {
        content: readmeContent,
        sections: sections.map(s => s.title),
        format: 'markdown'
      }
    });

    // Generate additional README files for subdirectories
    const subReadmes = await this.generateSubdirectoryReadmes(context);
    items.push(...subReadmes);

    return items;
  }

  /**
   * Reset plugin state
   */
  private reset(): void {
    this.projectInfo = null;
    this.dependencies = [];
    this.scripts = [];
    this.apiEndpoints = [];
    this.envVariables = [];
    this.features = [];
    this.techStack.clear();
  }

  /**
   * Analyze project structure and gather information
   */
  private async analyzeProject(context: PluginContext): Promise<void> {
    // Load package.json
    await this.loadPackageInfo(context.projectRoot);

    // Analyze tech stack
    this.analyzeTechStack();

    // Extract API endpoints
    await this.extractApiEndpoints(context);

    // Extract environment variables
    await this.extractEnvironmentVariables(context);

    // Identify features
    this.identifyFeatures(context);
  }

  /**
   * Load package.json information
   */
  private async loadPackageInfo(projectRoot: string): Promise<void> {
    try {
      const packagePath = path.join(projectRoot, 'package.json');
      const packageContent = await fs.readFile(packagePath, 'utf-8');
      const packageJson = JSON.parse(packageContent);

      // Extract project info
      this.projectInfo = {
        name: packageJson.name || 'Project',
        version: packageJson.version || '1.0.0',
        description: packageJson.description || 'No description provided',
        license: packageJson.license || 'MIT',
        author: packageJson.author,
        repository: this.extractRepository(packageJson.repository),
        homepage: packageJson.homepage,
        keywords: packageJson.keywords
      };

      // Extract dependencies
      if (packageJson.dependencies) {
        for (const [name, version] of Object.entries(packageJson.dependencies)) {
          this.dependencies.push({
            name,
            version: version as string,
            isDevDependency: false
          });
        }
      }

      if (packageJson.devDependencies) {
        for (const [name, version] of Object.entries(packageJson.devDependencies)) {
          this.dependencies.push({
            name,
            version: version as string,
            isDevDependency: true
          });
        }
      }

      // Extract scripts
      if (packageJson.scripts) {
        for (const [name, command] of Object.entries(packageJson.scripts)) {
          this.scripts.push({
            name,
            command: command as string,
            description: this.getScriptDescription(name)
          });
        }
      }
    } catch (error) {
      console.warn('Failed to load package.json:', error);
    }
  }

  /**
   * Extract repository URL
   */
  private extractRepository(repo: any): string | undefined {
    if (typeof repo === 'string') return repo;
    if (repo && repo.url) return repo.url.replace(/^git\+/, '').replace(/\.git$/, '');
    return undefined;
  }

  /**
   * Get script description
   */
  private getScriptDescription(scriptName: string): string {
    const descriptions: Record<string, string> = {
      start: 'Start the application',
      dev: 'Start development server',
      build: 'Build for production',
      test: 'Run tests',
      'test:watch': 'Run tests in watch mode',
      lint: 'Run linter',
      format: 'Format code',
      'type-check': 'Run TypeScript type checking',
      clean: 'Clean build artifacts',
      deploy: 'Deploy to production',
      'docker:build': 'Build Docker image',
      'docker:run': 'Run Docker container',
      migrate: 'Run database migrations',
      seed: 'Seed database with test data'
    };

    return descriptions[scriptName] || '';
  }

  /**
   * Analyze tech stack
   */
  private analyzeTechStack(): void {
    const frontend: string[] = [];
    const backend: string[] = [];
    const database: string[] = [];
    const devTools: string[] = [];
    const testing: string[] = [];

    for (const dep of this.dependencies) {
      const name = dep.name.toLowerCase();

      // Frontend
      if (name.includes('react')) frontend.push('React');
      if (name.includes('vue')) frontend.push('Vue.js');
      if (name.includes('angular')) frontend.push('Angular');
      if (name.includes('next')) frontend.push('Next.js');
      if (name.includes('vite')) frontend.push('Vite');
      if (name.includes('webpack')) frontend.push('Webpack');
      if (name.includes('tailwind')) frontend.push('Tailwind CSS');
      if (name.includes('@tanstack/react-query')) frontend.push('TanStack Query');

      // Backend
      if (name.includes('express')) backend.push('Express.js');
      if (name.includes('fastify')) backend.push('Fastify');
      if (name.includes('koa')) backend.push('Koa');
      if (name.includes('nestjs')) backend.push('NestJS');
      if (name.includes('prisma')) backend.push('Prisma ORM');
      if (name.includes('typeorm')) backend.push('TypeORM');
      if (name.includes('mongoose')) backend.push('Mongoose');

      // Database
      if (name.includes('postgres')) database.push('PostgreSQL');
      if (name.includes('mysql')) database.push('MySQL');
      if (name.includes('mongodb')) database.push('MongoDB');
      if (name.includes('redis')) database.push('Redis');

      // Dev Tools
      if (name.includes('typescript')) devTools.push('TypeScript');
      if (name.includes('eslint')) devTools.push('ESLint');
      if (name.includes('prettier')) devTools.push('Prettier');
      if (name.includes('husky')) devTools.push('Husky');

      // Testing
      if (name.includes('jest')) testing.push('Jest');
      if (name.includes('vitest')) testing.push('Vitest');
      if (name.includes('playwright')) testing.push('Playwright');
      if (name.includes('cypress')) testing.push('Cypress');
      if (name.includes('@testing-library')) testing.push('Testing Library');
    }

    // Remove duplicates and store
    this.techStack.set('Frontend', [...new Set(frontend)]);
    this.techStack.set('Backend', [...new Set(backend)]);
    this.techStack.set('Database', [...new Set(database)]);
    this.techStack.set('DevTools', [...new Set(devTools)]);
    this.techStack.set('Testing', [...new Set(testing)]);
  }

  /**
   * Extract API endpoints (simplified)
   */
  private async extractApiEndpoints(context: PluginContext): Promise<void> {
    // This is a simplified version - in reality, you would parse route files
    // For now, add common endpoints
    this.apiEndpoints = [
      {
        method: 'GET',
        path: '/api/health',
        description: 'Health check endpoint',
        authentication: false
      },
      {
        method: 'POST',
        path: '/api/auth/login',
        description: 'User login',
        authentication: false
      },
      {
        method: 'POST',
        path: '/api/auth/logout',
        description: 'User logout',
        authentication: true
      },
      {
        method: 'GET',
        path: '/api/users',
        description: 'List users',
        authentication: true
      },
      {
        method: 'GET',
        path: '/api/users/:id',
        description: 'Get user by ID',
        authentication: true
      }
    ];
  }

  /**
   * Extract environment variables
   */
  private async extractEnvironmentVariables(context: PluginContext): Promise<void> {
    try {
      const envExamplePath = path.join(context.projectRoot, '.env.example');
      const envContent = await fs.readFile(envExamplePath, 'utf-8');
      
      const lines = envContent.split('\n');
      for (const line of lines) {
        if (line.trim() && !line.startsWith('#')) {
          const [name, value] = line.split('=');
          if (name) {
            this.envVariables.push({
              name: name.trim(),
              description: this.getEnvDescription(name.trim()),
              required: !value || value.trim() === '',
              example: value?.trim()
            });
          }
        }
      }
    } catch (error) {
      // If .env.example doesn't exist, add common variables
      this.envVariables = [
        {
          name: 'NODE_ENV',
          description: 'Node environment (development, production, test)',
          required: true,
          example: 'development'
        },
        {
          name: 'PORT',
          description: 'Server port',
          required: false,
          default: '3000'
        },
        {
          name: 'DATABASE_URL',
          description: 'Database connection string',
          required: true,
          example: 'postgresql://user:password@localhost:5432/dbname'
        }
      ];
    }
  }

  /**
   * Get environment variable description
   */
  private getEnvDescription(name: string): string {
    const descriptions: Record<string, string> = {
      NODE_ENV: 'Node environment (development, production, test)',
      PORT: 'Server port',
      DATABASE_URL: 'Database connection string',
      REDIS_URL: 'Redis connection string',
      JWT_SECRET: 'JWT secret key for authentication',
      API_KEY: 'API key for external services',
      AWS_ACCESS_KEY_ID: 'AWS access key ID',
      AWS_SECRET_ACCESS_KEY: 'AWS secret access key',
      SENTRY_DSN: 'Sentry error tracking DSN',
      SMTP_HOST: 'SMTP server host',
      SMTP_PORT: 'SMTP server port',
      SMTP_USER: 'SMTP username',
      SMTP_PASS: 'SMTP password'
    };

    return descriptions[name] || 'Configuration variable';
  }

  /**
   * Identify project features
   */
  private identifyFeatures(context: PluginContext): void {
    const features: string[] = [];

    // Check for authentication
    if (this.dependencies.some(d => d.name.includes('passport') || d.name.includes('jsonwebtoken'))) {
      features.push('🔐 Authentication & Authorization');
    }

    // Check for real-time features
    if (this.dependencies.some(d => d.name.includes('socket.io') || d.name.includes('ws'))) {
      features.push('🔄 Real-time Updates (WebSocket)');
    }

    // Check for file upload
    if (this.dependencies.some(d => d.name.includes('multer') || d.name.includes('formidable'))) {
      features.push('📁 File Upload');
    }

    // Check for email
    if (this.dependencies.some(d => d.name.includes('nodemailer') || d.name.includes('sendgrid'))) {
      features.push('📧 Email Integration');
    }

    // Check for caching
    if (this.dependencies.some(d => d.name.includes('redis'))) {
      features.push('⚡ Caching with Redis');
    }

    // Check for API documentation
    if (this.dependencies.some(d => d.name.includes('swagger'))) {
      features.push('📚 API Documentation');
    }

    // Check for testing
    if (this.dependencies.some(d => d.name.includes('jest') || d.name.includes('vitest'))) {
      features.push('🧪 Automated Testing');
    }

    // Check for CI/CD
    if (context.astCache.has('.github/workflows') || context.astCache.has('.gitlab-ci.yml')) {
      features.push('🚀 CI/CD Pipeline');
    }

    this.features = features;
  }

  /**
   * Generate README sections
   */
  private generateReadmeSections(context: PluginContext): ReadmeSection[] {
    const sections: ReadmeSection[] = [];

    // Title and Description
    sections.push(this.generateTitleSection());

    // Badges
    sections.push(this.generateBadgesSection());

    // Table of Contents
    sections.push(this.generateTableOfContents());

    // Features
    if (this.features.length > 0) {
      sections.push(this.generateFeaturesSection());
    }

    // Tech Stack
    sections.push(this.generateTechStackSection());

    // Prerequisites
    sections.push(this.generatePrerequisitesSection());

    // Installation
    sections.push(this.generateInstallationSection());

    // Configuration
    sections.push(this.generateConfigurationSection());

    // Usage
    sections.push(this.generateUsageSection());

    // API Documentation
    if (this.apiEndpoints.length > 0) {
      sections.push(this.generateApiDocumentationSection());
    }

    // Scripts
    sections.push(this.generateScriptsSection());

    // Project Structure
    sections.push(this.generateProjectStructureSection());

    // Testing
    sections.push(this.generateTestingSection());

    // Deployment
    sections.push(this.generateDeploymentSection());

    // Contributing
    sections.push(this.generateContributingSection());

    // License
    sections.push(this.generateLicenseSection());

    return sections.sort((a, b) => a.order - b.order);
  }

  /**
   * Generate title section
   */
  private generateTitleSection(): ReadmeSection {
    return {
      title: 'Title',
      order: 1,
      content: `# ${this.projectInfo?.name || 'Project Name'}

${this.projectInfo?.description || 'Project description goes here.'}
`
    };
  }

  /**
   * Generate badges section
   */
  private generateBadgesSection(): ReadmeSection {
    const badges: string[] = [];

    if (this.projectInfo?.version) {
      badges.push(`![Version](https://img.shields.io/badge/version-${this.projectInfo.version}-blue.svg)`);
    }

    if (this.projectInfo?.license) {
      badges.push(`![License](https://img.shields.io/badge/license-${this.projectInfo.license}-green.svg)`);
    }

    if (this.techStack.get('Frontend')?.includes('React')) {
      badges.push('![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)');
    }

    if (this.techStack.get('DevTools')?.includes('TypeScript')) {
      badges.push('![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)');
    }

    return {
      title: 'Badges',
      order: 2,
      content: badges.join(' ')
    };
  }

  /**
   * Generate table of contents
   */
  private generateTableOfContents(): ReadmeSection {
    const toc = [
      '## Table of Contents',
      '',
      '- [Features](#features)',
      '- [Tech Stack](#tech-stack)',
      '- [Prerequisites](#prerequisites)',
      '- [Installation](#installation)',
      '- [Configuration](#configuration)',
      '- [Usage](#usage)',
      '- [API Documentation](#api-documentation)',
      '- [Scripts](#scripts)',
      '- [Project Structure](#project-structure)',
      '- [Testing](#testing)',
      '- [Deployment](#deployment)',
      '- [Contributing](#contributing)',
      '- [License](#license)'
    ];

    return {
      title: 'Table of Contents',
      order: 3,
      content: toc.join('\n')
    };
  }

  /**
   * Generate features section
   */
  private generateFeaturesSection(): ReadmeSection {
    const content = [
      '## Features',
      '',
      ...this.features.map(f => `- ${f}`)
    ];

    return {
      title: 'Features',
      order: 4,
      content: content.join('\n')
    };
  }

  /**
   * Generate tech stack section
   */
  private generateTechStackSection(): ReadmeSection {
    const content: string[] = ['## Tech Stack', ''];

    for (const [category, technologies] of this.techStack) {
      if (technologies.length > 0) {
        content.push(`### ${category}`);
        content.push('');
        content.push(...technologies.map(tech => `- ${tech}`));
        content.push('');
      }
    }

    return {
      title: 'Tech Stack',
      order: 5,
      content: content.join('\n')
    };
  }

  /**
   * Generate prerequisites section
   */
  private generatePrerequisitesSection(): ReadmeSection {
    const content = [
      '## Prerequisites',
      '',
      'Before you begin, ensure you have the following installed:',
      '',
      '- Node.js (v18 or higher)',
      '- pnpm (v8 or higher)',
      '- PostgreSQL (v14 or higher)',
      '- Redis (optional, for caching)',
      '',
      '```bash',
      '# Check Node.js version',
      'node --version',
      '',
      '# Install pnpm globally',
      'npm install -g pnpm',
      '```'
    ];

    return {
      title: 'Prerequisites',
      order: 6,
      content: content.join('\n')
    };
  }

  /**
   * Generate installation section
   */
  private generateInstallationSection(): ReadmeSection {
    const content = [
      '## Installation',
      '',
      '1. Clone the repository:',
      '',
      '```bash',
      `git clone ${this.projectInfo?.repository || 'https://github.com/username/repo.git'}`,
      `cd ${this.projectInfo?.name || 'project-name'}`,
      '```',
      '',
      '2. Install dependencies:',
      '',
      '```bash',
      'pnpm install',
      '```',
      '',
      '3. Set up the database:',
      '',
      '```bash',
      '# Run database migrations',
      'pnpm run migrate',
      '',
      '# Seed the database (optional)',
      'pnpm run seed',
      '```',
      '',
      '4. Configure environment variables:',
      '',
      '```bash',
      'cp .env.example .env',
      '# Edit .env with your configuration',
      '```'
    ];

    return {
      title: 'Installation',
      order: 7,
      content: content.join('\n')
    };
  }

  /**
   * Generate configuration section
   */
  private generateConfigurationSection(): ReadmeSection {
    const content = [
      '## Configuration',
      '',
      'Create a `.env` file in the root directory with the following variables:',
      '',
      '```env'
    ];

    for (const env of this.envVariables) {
      const value = env.example || env.default || '';
      content.push(`# ${env.description}`);
      content.push(`${env.name}=${value}`);
      content.push('');
    }

    content.push('```');

    return {
      title: 'Configuration',
      order: 8,
      content: content.join('\n')
    };
  }

  /**
   * Generate usage section
   */
  private generateUsageSection(): ReadmeSection {
    const content = [
      '## Usage',
      '',
      '### Development',
      '',
      'Start the development server:',
      '',
      '```bash',
      'pnpm run dev',
      '```',
      '',
      'The application will be available at:',
      '- Frontend: http://localhost:3000',
      '- Backend API: http://localhost:3000/api',
      '',
      '### Production',
      '',
      'Build and start the production server:',
      '',
      '```bash',
      'pnpm run build',
      'pnpm start',
      '```'
    ];

    return {
      title: 'Usage',
      order: 9,
      content: content.join('\n')
    };
  }

  /**
   * Generate API documentation section
   */
  private generateApiDocumentationSection(): ReadmeSection {
    const content = [
      '## API Documentation',
      '',
      '### Base URL',
      '',
      '```',
      'http://localhost:3000/api',
      '```',
      '',
      '### Endpoints',
      ''
    ];

    // Group endpoints by resource
    const grouped = new Map<string, ApiEndpointInfo[]>();
    
    for (const endpoint of this.apiEndpoints) {
      const resource = endpoint.path.split('/')[2] || 'general';
      if (!grouped.has(resource)) {
        grouped.set(resource, []);
      }
      grouped.get(resource)!.push(endpoint);
    }

    for (const [resource, endpoints] of grouped) {
      content.push(`#### ${this.capitalize(resource)}`);
      content.push('');
      content.push('| Method | Endpoint | Description | Auth Required |');
      content.push('|--------|----------|-------------|---------------|');
      
      for (const endpoint of endpoints) {
        const auth = endpoint.authentication ? '✅' : '❌';
        content.push(`| ${endpoint.method} | \`${endpoint.path}\` | ${endpoint.description} | ${auth} |`);
      }
      
      content.push('');
    }

    content.push('For detailed API documentation, see the [API Reference](./docs/api/README.md).');

    return {
      title: 'API Documentation',
      order: 10,
      content: content.join('\n')
    };
  }

  /**
   * Generate scripts section
   */
  private generateScriptsSection(): ReadmeSection {
    const content = [
      '## Scripts',
      '',
      'Available npm scripts:',
      '',
      '| Script | Description |',
      '|--------|-------------|'
    ];

    for (const script of this.scripts) {
      if (!script.name.includes(':')) { // Show only main scripts
        content.push(`| \`pnpm run ${script.name}\` | ${script.description || script.command} |`);
      }
    }

    return {
      title: 'Scripts',
      order: 11,
      content: content.join('\n')
    };
  }

  /**
   * Generate project structure section
   */
  private generateProjectStructureSection(): ReadmeSection {
    const content = [
      '## Project Structure',
      '',
      '```',
      '.',
      '├── packages/',
      '│   ├── frontend/          # React frontend application',
      '│   │   ├── src/',
      '│   │   │   ├── components/   # React components',
      '│   │   │   ├── hooks/        # Custom React hooks',
      '│   │   │   ├── pages/        # Page components',
      '│   │   │   ├── services/     # API services',
      '│   │   │   └── utils/        # Utility functions',
      '│   │   └── public/           # Static assets',
      '│   └── backend/           # Express backend application',
      '│       ├── src/',
      '│       │   ├── controllers/  # Route controllers',
      '│       │   ├── services/     # Business logic',
      '│       │   ├── models/       # Database models',
      '│       │   ├── middleware/   # Express middleware',
      '│       │   └── utils/        # Utility functions',
      '│       └── prisma/           # Database schema',
      '├── .claude/               # Claude AI configuration',
      '├── docs/                  # Documentation',
      '├── scripts/               # Build and deployment scripts',
      '└── docker/                # Docker configuration',
      '```'
    ];

    return {
      title: 'Project Structure',
      order: 12,
      content: content.join('\n')
    };
  }

  /**
   * Generate testing section
   */
  private generateTestingSection(): ReadmeSection {
    const content = [
      '## Testing',
      '',
      '### Run all tests',
      '',
      '```bash',
      'pnpm test',
      '```',
      '',
      '### Run tests in watch mode',
      '',
      '```bash',
      'pnpm test:watch',
      '```',
      '',
      '### Generate coverage report',
      '',
      '```bash',
      'pnpm test:coverage',
      '```',
      '',
      '### Run E2E tests',
      '',
      '```bash',
      'pnpm test:e2e',
      '```'
    ];

    return {
      title: 'Testing',
      order: 13,
      content: content.join('\n')
    };
  }

  /**
   * Generate deployment section
   */
  private generateDeploymentSection(): ReadmeSection {
    const content = [
      '## Deployment',
      '',
      '### Docker',
      '',
      'Build and run with Docker:',
      '',
      '```bash',
      '# Build the image',
      'docker build -t app-name .',
      '',
      '# Run the container',
      'docker run -p 3000:3000 app-name',
      '```',
      '',
      '### Docker Compose',
      '',
      '```bash',
      'docker-compose up -d',
      '```',
      '',
      '### Manual Deployment',
      '',
      '1. Build the application:',
      '',
      '```bash',
      'pnpm run build',
      '```',
      '',
      '2. Set environment variables for production',
      '',
      '3. Start the application:',
      '',
      '```bash',
      'NODE_ENV=production pnpm start',
      '```'
    ];

    return {
      title: 'Deployment',
      order: 14,
      content: content.join('\n')
    };
  }

  /**
   * Generate contributing section
   */
  private generateContributingSection(): ReadmeSection {
    const content = [
      '## Contributing',
      '',
      'Contributions are welcome! Please follow these steps:',
      '',
      '1. Fork the repository',
      '2. Create your feature branch (`git checkout -b feature/amazing-feature`)',
      '3. Commit your changes (`git commit -m "feat: add amazing feature"`)',
      '4. Push to the branch (`git push origin feature/amazing-feature`)',
      '5. Open a Pull Request',
      '',
      '### Commit Convention',
      '',
      'This project follows [Conventional Commits](https://www.conventionalcommits.org/):',
      '',
      '- `feat:` - New features',
      '- `fix:` - Bug fixes',
      '- `docs:` - Documentation changes',
      '- `style:` - Code style changes (formatting, etc)',
      '- `refactor:` - Code refactoring',
      '- `test:` - Test additions or modifications',
      '- `chore:` - Build process or auxiliary tool changes'
    ];

    return {
      title: 'Contributing',
      order: 15,
      content: content.join('\n')
    };
  }

  /**
   * Generate license section
   */
  private generateLicenseSection(): ReadmeSection {
    const year = new Date().getFullYear();
    const author = this.projectInfo?.author || 'Your Name';
    
    return {
      title: 'License',
      order: 16,
      content: `## License

This project is licensed under the ${this.projectInfo?.license || 'MIT'} License - see the [LICENSE](LICENSE) file for details.

---

Copyright © ${year} ${author}. All rights reserved.`
    };
  }

  /**
   * Combine sections into final README
   */
  private combinesSections(sections: ReadmeSection[]): string {
    return sections
      .map(section => section.content)
      .join('\n\n');
  }

  /**
   * Generate subdirectory READMEs
   */
  private async generateSubdirectoryReadmes(context: PluginContext): Promise<DocumentationItem[]> {
    const items: DocumentationItem[] = [];

    // Frontend README
    items.push({
      id: 'readme-frontend',
      name: 'Frontend README',
      type: 'readme',
      category: 'Component Documentation',
      description: 'Frontend package documentation',
      tags: ['readme', 'frontend', 'react'],
      metadata: {
        content: this.generateFrontendReadme(),
        path: 'packages/frontend/README.md'
      }
    });

    // Backend README
    items.push({
      id: 'readme-backend',
      name: 'Backend README',
      type: 'readme',
      category: 'API Documentation',
      description: 'Backend package documentation',
      tags: ['readme', 'backend', 'api'],
      metadata: {
        content: this.generateBackendReadme(),
        path: 'packages/backend/README.md'
      }
    });

    return items;
  }

  /**
   * Generate frontend README
   */
  private generateFrontendReadme(): string {
    return `# Frontend Package

React-based frontend application built with Vite and TypeScript.

## Architecture

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query
- **Routing**: React Router
- **Testing**: Vitest + Playwright

## Development

\`\`\`bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build

# Run tests
pnpm test
\`\`\`

## Component Structure

Components follow Atomic Design principles:

- **Atoms**: Basic building blocks (Button, Input, etc.)
- **Molecules**: Simple component groups
- **Organisms**: Complex UI sections
- **Templates**: Page layouts
- **Pages**: Specific page instances

## Key Directories

- \`src/components/\` - Reusable UI components
- \`src/pages/\` - Page components
- \`src/hooks/\` - Custom React hooks
- \`src/services/\` - API integration services
- \`src/utils/\` - Utility functions
- \`src/styles/\` - Global styles and themes
`;
  }

  /**
   * Generate backend README
   */
  private generateBackendReadme(): string {
    return `# Backend Package

Express-based REST API with Prisma ORM and PostgreSQL.

## Architecture

- **Framework**: Express 5 with TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Validation**: Zod
- **Testing**: Jest

## Development

\`\`\`bash
# Install dependencies
pnpm install

# Run database migrations
pnpm run migrate

# Seed database
pnpm run seed

# Start development server
pnpm run dev

# Run tests
pnpm test
\`\`\`

## API Structure

- \`src/controllers/\` - Request handlers
- \`src/services/\` - Business logic
- \`src/models/\` - Data models
- \`src/middleware/\` - Express middleware
- \`src/routes/\` - API routes
- \`src/utils/\` - Helper functions

## Database

Prisma schema is located at \`prisma/schema.prisma\`.

### Common Commands

\`\`\`bash
# Generate Prisma client
pnpm run prisma:generate

# Create migration
pnpm run prisma:migrate

# Open Prisma Studio
pnpm run prisma:studio
\`\`\`
`;
  }

  /**
   * Capitalize string
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Export singleton instance
export const readmePlugin = new ReadmeGeneratorPlugin();