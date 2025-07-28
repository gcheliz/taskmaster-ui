/**
 * Documentation Agent
 * 
 * Main entry point for the documentation generation system
 */

import {
  documentationEngine,
  DocumentationOptions,
  DocumentationResult,
  DocumentationFormat,
  DocumentationType
} from './core-engine';
import { apiDocumentationPlugin } from './plugins/api-documentation';
import { openAPIGeneratorPlugin } from './plugins/openapi-generator';
import { architecturePlugin } from './plugins/architecture-diagram';
import { readmePlugin } from './plugins/readme-generator';
import { changelogPlugin } from './plugins/changelog-generator';
import { claudeContextPlugin } from './plugins/claude-context';

// Register all plugins
documentationEngine.registerPlugin(apiDocumentationPlugin);
documentationEngine.registerPlugin(openAPIGeneratorPlugin);
documentationEngine.registerPlugin(architecturePlugin);
documentationEngine.registerPlugin(readmePlugin);
documentationEngine.registerPlugin(changelogPlugin);
documentationEngine.registerPlugin(claudeContextPlugin);

export {
  documentationEngine,
  DocumentationOptions,
  DocumentationResult,
  DocumentationFormat,
  DocumentationType
};

/**
 * Documentation commands
 */
export const documentationCommands = {
  '/docs': 'Generate comprehensive documentation for the project',
  '/docs:api': 'Generate API documentation from code annotations',
  '/docs:architecture': 'Generate architecture diagrams using Mermaid',
  '/docs:readme': 'Update or generate README files',
  '/docs:changelog': 'Generate changelog from git commits',
  '/docs:claude': 'Update CLAUDE.md context file',
  '/docs:all': 'Generate all documentation types',
  '/docs:watch': 'Watch for changes and auto-generate documentation',
  '/docs:serve': 'Serve generated documentation in browser'
} as const;

/**
 * Generate documentation with default options
 */
export async function generateDocumentation(
  sourcePaths: string[] = ['src'],
  options: Partial<DocumentationOptions> = {}
): Promise<DocumentationResult> {
  const defaultOptions: DocumentationOptions = {
    sourcePaths,
    outputPath: options.outputPath || 'docs',
    formats: options.formats || [DocumentationFormat.MARKDOWN],
    excludePatterns: options.excludePatterns,
    includePrivate: options.includePrivate || false
  };

  return documentationEngine.generate(defaultOptions);
}

/**
 * Generate specific documentation type
 */
export async function generateSpecificType(
  type: DocumentationType,
  sourcePaths: string[] = ['src'],
  options: Partial<DocumentationOptions> = {}
): Promise<DocumentationResult> {
  const plugins = documentationEngine.getAvailablePlugins()
    .filter(p => p.type === type);

  return generateDocumentation(sourcePaths, {
    ...options,
    plugins
  });
}

/**
 * Generate API documentation
 */
export async function generateAPIDocumentation(
  sourcePaths: string[] = ['src'],
  options: Partial<DocumentationOptions> = {}
): Promise<DocumentationResult> {
  return generateSpecificType(DocumentationType.API, sourcePaths, options);
}

/**
 * Generate architecture diagrams
 */
export async function generateArchitectureDiagrams(
  sourcePaths: string[] = ['src'],
  options: Partial<DocumentationOptions> = {}
): Promise<DocumentationResult> {
  return generateSpecificType(DocumentationType.ARCHITECTURE, sourcePaths, options);
}

/**
 * Generate README files
 */
export async function generateReadme(
  sourcePaths: string[] = ['src'],
  options: Partial<DocumentationOptions> = {}
): Promise<DocumentationResult> {
  return generateSpecificType(DocumentationType.README, sourcePaths, options);
}

/**
 * Generate changelog
 */
export async function generateChangelog(
  sourcePaths: string[] = ['.'],
  options: Partial<DocumentationOptions> = {}
): Promise<DocumentationResult> {
  return generateSpecificType(DocumentationType.CHANGELOG, sourcePaths, options);
}

/**
 * Update CLAUDE.md context
 */
export async function updateClaudeContext(
  sourcePaths: string[] = ['.'],
  options: Partial<DocumentationOptions> = {}
): Promise<DocumentationResult> {
  const plugin = documentationEngine.getPluginInfo('claude-context');
  if (!plugin) {
    throw new Error('Claude context plugin not found');
  }

  return generateDocumentation(sourcePaths, {
    ...options,
    plugins: [plugin],
    outputPath: '.'
  });
}

/**
 * Watch for changes and regenerate documentation
 */
export async function watchDocumentation(
  sourcePaths: string[] = ['src'],
  options: Partial<DocumentationOptions> = {}
): Promise<void> {
  const chokidar = await import('chokidar');
  
  const watcher = chokidar.watch(sourcePaths, {
    ignored: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.git/**',
      ...(options.excludePatterns || [])
    ],
    persistent: true
  });

  console.log('📚 Documentation watcher started...');
  console.log(`Watching: ${sourcePaths.join(', ')}`);

  const regenerate = async () => {
    console.log('🔄 Regenerating documentation...');
    try {
      const result = await generateDocumentation(sourcePaths, options);
      if (result.success) {
        console.log(`✅ Generated ${result.files.length} documentation files`);
      } else {
        console.error('❌ Documentation generation failed:', result.errors);
      }
    } catch (error) {
      console.error('❌ Error generating documentation:', error);
    }
  };

  watcher
    .on('add', regenerate)
    .on('change', regenerate)
    .on('unlink', regenerate);

  // Initial generation
  await regenerate();

  // Keep process alive
  process.on('SIGINT', () => {
    watcher.close();
    process.exit(0);
  });
}

/**
 * Serve documentation in browser
 */
export async function serveDocumentation(
  docsPath: string = 'docs',
  port: number = 3000
): Promise<void> {
  const express = await import('express');
  const app = express.default();
  
  app.use(express.static(docsPath));
  
  app.get('/', (_req, res) => {
    res.redirect('/README.md');
  });

  app.listen(port, () => {
    console.log(`📚 Documentation server running at http://localhost:${port}`);
    console.log(`Serving files from: ${docsPath}`);
  });
}

/**
 * Command handlers for slash commands
 */
export const commandHandlers = {
  '/docs': async (args: string[]) => {
    const paths = args.length > 0 ? args : ['src'];
    const result = await generateDocumentation(paths);
    return formatResult(result);
  },
  
  '/docs:api': async (args: string[]) => {
    const paths = args.length > 0 ? args : ['src'];
    const result = await generateAPIDocumentation(paths);
    return formatResult(result);
  },
  
  '/docs:architecture': async (args: string[]) => {
    const paths = args.length > 0 ? args : ['src'];
    const result = await generateArchitectureDiagrams(paths);
    return formatResult(result);
  },
  
  '/docs:readme': async (args: string[]) => {
    const paths = args.length > 0 ? args : ['.'];
    const result = await generateReadme(paths);
    return formatResult(result);
  },
  
  '/docs:changelog': async (args: string[]) => {
    const result = await generateChangelog();
    return formatResult(result);
  },
  
  '/docs:claude': async (_args: string[]) => {
    const result = await updateClaudeContext();
    return formatResult(result);
  },
  
  '/docs:all': async (args: string[]) => {
    const paths = args.length > 0 ? args : ['src'];
    const result = await generateDocumentation(paths, {
      formats: [
        DocumentationFormat.MARKDOWN,
        DocumentationFormat.HTML,
        DocumentationFormat.JSON
      ]
    });
    return formatResult(result);
  },
  
  '/docs:watch': async (args: string[]) => {
    const paths = args.length > 0 ? args : ['src'];
    await watchDocumentation(paths);
    return 'Documentation watcher started. Press Ctrl+C to stop.';
  },
  
  '/docs:serve': async (args: string[]) => {
    const docsPath = args[0] || 'docs';
    const port = parseInt(args[1]) || 3000;
    await serveDocumentation(docsPath, port);
    return `Documentation server started at http://localhost:${port}`;
  }
};

/**
 * Format documentation result for display
 */
function formatResult(result: DocumentationResult): string {
  const lines: string[] = [];
  
  lines.push('# Documentation Generation Results\n');
  lines.push(`Status: ${result.success ? '✅ Success' : '❌ Failed'}`);
  lines.push(`Files generated: ${result.files.length}`);
  lines.push(`Time elapsed: ${(result.summary.timeElapsed / 1000).toFixed(2)}s`);
  
  if (result.summary.coverage) {
    lines.push(`\nDocumentation coverage: ${result.summary.coverage.percentage}%`);
    lines.push(`- Total items: ${result.summary.coverage.totalItems}`);
    lines.push(`- Documented: ${result.summary.coverage.documented}`);
  }
  
  lines.push('\n## Generated Files\n');
  
  // Group files by type
  const byType = new Map<DocumentationType, typeof result.files>();
  for (const file of result.files) {
    const list = byType.get(file.type) || [];
    list.push(file);
    byType.set(file.type, list);
  }
  
  for (const [type, files] of byType) {
    lines.push(`### ${formatTypeName(type)}\n`);
    for (const file of files) {
      lines.push(`- ${file.path} (${formatFileSize(file.size)})`);
    }
    lines.push('');
  }
  
  if (result.errors && result.errors.length > 0) {
    lines.push('## Errors\n');
    for (const error of result.errors) {
      lines.push(`- ❌ ${error}`);
    }
  }
  
  return lines.join('\n');
}

/**
 * Format type name for display
 */
function formatTypeName(type: DocumentationType): string {
  const names = {
    [DocumentationType.API]: 'API Documentation',
    [DocumentationType.ARCHITECTURE]: 'Architecture Diagrams',
    [DocumentationType.README]: 'README Files',
    [DocumentationType.CHANGELOG]: 'Change Logs',
    [DocumentationType.GUIDE]: 'Guides',
    [DocumentationType.TUTORIAL]: 'Tutorials'
  };
  return names[type] || type;
}

/**
 * Format file size for display
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Initialize documentation agent
 */
export async function initializeDocumentationAgent(projectRoot: string): Promise<void> {
  console.log('📚 Initializing Documentation Agent...');
  
  const fs = await import('fs/promises');
  const path = await import('path');
  
  // Create docs directory if it doesn't exist
  const docsPath = path.join(projectRoot, 'docs');
  await fs.mkdir(docsPath, { recursive: true });
  
  // Create default configuration
  const configPath = path.join(projectRoot, '.documentation.json');
  try {
    await fs.access(configPath);
  } catch {
    const defaultConfig = {
      title: 'Project Documentation',
      version: '1.0.0',
      description: 'Comprehensive project documentation',
      outputFormats: ['markdown', 'html'],
      excludePatterns: [
        '**/node_modules/**',
        '**/*.test.*',
        '**/*.spec.*',
        '**/dist/**',
        '**/build/**'
      ],
      includePrivate: false
    };
    
    await fs.writeFile(configPath, JSON.stringify(defaultConfig, null, 2));
    console.log('✅ Created default documentation configuration');
  }
  
  console.log('✅ Documentation Agent ready');
  console.log('📚 Available commands:', Object.keys(documentationCommands).join(', '));
}

/**
 * Example usage
 */
export async function exampleUsage(): Promise<void> {
  // Generate all documentation
  const result = await generateDocumentation(['src'], {
    formats: [DocumentationFormat.MARKDOWN, DocumentationFormat.HTML],
    outputPath: 'docs'
  });
  
  console.log(`Generated ${result.files.length} documentation files`);
  console.log(`Coverage: ${result.summary.coverage.percentage}%`);
  
  // Generate specific types
  await generateAPIDocumentation(['src/api']);
  await generateArchitectureDiagrams(['src']);
  await generateReadme();
  await generateChangelog();
  
  // Update Claude context
  await updateClaudeContext();
  
  // Watch for changes
  // await watchDocumentation(['src']);
  
  // Serve documentation
  // await serveDocumentation('docs', 3000);
}