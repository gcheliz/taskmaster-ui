/**
 * Documentation Generator Core Engine
 * 
 * Foundational documentation generation engine with plugin architecture
 * for different documentation types (API, architecture, release notes)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as ts from 'typescript';
import { glob } from 'glob';

export interface DocumentationOptions {
  sourcePaths: string[];
  outputPath: string;
  formats?: DocumentationFormat[];
  plugins?: DocumentationPlugin[];
  templatePath?: string;
  configPath?: string;
  excludePatterns?: string[];
  includePrivate?: boolean;
}

export enum DocumentationFormat {
  MARKDOWN = 'markdown',
  HTML = 'html',
  JSON = 'json',
  DOCUSAURUS = 'docusaurus',
  GITBOOK = 'gitbook'
}

export interface DocumentationResult {
  success: boolean;
  files: GeneratedFile[];
  summary: DocumentationSummary;
  errors?: string[];
}

export interface GeneratedFile {
  path: string;
  format: DocumentationFormat;
  type: DocumentationType;
  size: number;
  content?: string;
}

export interface DocumentationSummary {
  totalFiles: number;
  byType: Record<DocumentationType, number>;
  byFormat: Record<DocumentationFormat, number>;
  timeElapsed: number;
  coverage: DocumentationCoverage;
}

export interface DocumentationCoverage {
  totalItems: number;
  documented: number;
  percentage: number;
  byType: Record<string, CoverageStats>;
}

export interface CoverageStats {
  total: number;
  documented: number;
  percentage: number;
}

export enum DocumentationType {
  API = 'api',
  ARCHITECTURE = 'architecture',
  README = 'readme',
  CHANGELOG = 'changelog',
  GUIDE = 'guide',
  TUTORIAL = 'tutorial'
}

export interface DocumentationPlugin {
  name: string;
  type: DocumentationType;
  description: string;
  generate(context: PluginContext): Promise<DocumentationItem[]>;
  supportsFormat?(format: DocumentationFormat): boolean;
}

export interface PluginContext {
  sourcePaths: string[];
  config: DocumentationConfig;
  astCache: Map<string, ts.SourceFile>;
  projectRoot: string;
  outputPath: string;
}

export interface DocumentationItem {
  id: string;
  name: string;
  type: string;
  description?: string;
  category?: string;
  tags?: string[];
  source?: SourceLocation;
  examples?: CodeExample[];
  seeAlso?: string[];
  metadata?: Record<string, any>;
}

export interface SourceLocation {
  file: string;
  line: number;
  column?: number;
}

export interface CodeExample {
  title?: string;
  code: string;
  language: string;
  description?: string;
}

export interface DocumentationConfig {
  title: string;
  version: string;
  description?: string;
  organization?: string;
  repository?: string;
  outputFormats: DocumentationFormat[];
  excludePatterns: string[];
  includePrivate: boolean;
  templateOverrides?: Record<string, string>;
  pluginOptions?: Record<string, any>;
}

export interface TemplateEngine {
  render(template: string, data: any): string;
  loadTemplate(name: string): Promise<string>;
  registerHelper(name: string, fn: Function): void;
}

export class DocumentationEngine {
  private plugins: Map<string, DocumentationPlugin> = new Map();
  private config: DocumentationConfig;
  private templateEngine: TemplateEngine;
  private astCache: Map<string, ts.SourceFile> = new Map();
  private defaultConfig: DocumentationConfig = {
    title: 'API Documentation',
    version: '1.0.0',
    outputFormats: [DocumentationFormat.MARKDOWN],
    excludePatterns: [
      '**/node_modules/**',
      '**/*.test.*',
      '**/*.spec.*',
      '**/dist/**',
      '**/build/**'
    ],
    includePrivate: false
  };

  constructor(configPath?: string) {
    this.config = this.defaultConfig;
    if (configPath) {
      this.loadConfig(configPath);
    }
    this.templateEngine = this.createTemplateEngine();
  }

  /**
   * Register a documentation plugin
   */
  registerPlugin(plugin: DocumentationPlugin): void {
    this.plugins.set(plugin.name, plugin);
  }

  /**
   * Generate documentation
   */
  async generate(options: DocumentationOptions): Promise<DocumentationResult> {
    const startTime = Date.now();
    const generatedFiles: GeneratedFile[] = [];
    const errors: string[] = [];

    try {
      // Load configuration
      if (options.configPath) {
        await this.loadConfig(options.configPath);
      }

      // Merge options with config
      const formats = options.formats || this.config.outputFormats;
      const outputPath = options.outputPath || 'docs';

      // Create output directory
      await fs.mkdir(outputPath, { recursive: true });

      // Build AST cache for source files
      await this.buildASTCache(options.sourcePaths, options.excludePatterns);

      // Create plugin context
      const context: PluginContext = {
        sourcePaths: options.sourcePaths,
        config: this.config,
        astCache: this.astCache,
        projectRoot: process.cwd(),
        outputPath
      };

      // Get plugins to run
      const pluginsToRun = options.plugins || Array.from(this.plugins.values());

      // Run each plugin
      const allItems: Map<DocumentationType, DocumentationItem[]> = new Map();
      
      for (const plugin of pluginsToRun) {
        try {
          const items = await plugin.generate(context);
          const existingItems = allItems.get(plugin.type) || [];
          allItems.set(plugin.type, [...existingItems, ...items]);
        } catch (error) {
          errors.push(`Plugin '${plugin.name}' failed: ${error}`);
        }
      }

      // Generate documentation in each format
      for (const format of formats) {
        try {
          const formatFiles = await this.generateFormat(
            allItems,
            format,
            outputPath
          );
          generatedFiles.push(...formatFiles);
        } catch (error) {
          errors.push(`Format '${format}' generation failed: ${error}`);
        }
      }

      // Calculate coverage
      const coverage = this.calculateCoverage(this.astCache, allItems);

      return {
        success: errors.length === 0,
        files: generatedFiles,
        summary: this.createSummary(
          generatedFiles,
          coverage,
          Date.now() - startTime
        ),
        ...(errors.length > 0 && { errors })
      };
    } catch (error) {
      return {
        success: false,
        files: [],
        summary: this.createSummary([], this.createEmptyCoverage(), Date.now() - startTime),
        errors: [`Documentation generation failed: ${error}`]
      };
    }
  }

  /**
   * Build AST cache for source files
   */
  private async buildASTCache(
    sourcePaths: string[],
    excludePatterns?: string[]
  ): Promise<void> {
    const files = await this.expandPaths(sourcePaths, excludePatterns);
    
    for (const file of files) {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          const sourceFile = ts.createSourceFile(
            file,
            content,
            ts.ScriptTarget.Latest,
            true
          );
          this.astCache.set(file, sourceFile);
        } catch (error) {
          console.error(`Failed to parse ${file}:`, error);
        }
      }
    }
  }

  /**
   * Expand paths to actual files
   */
  private async expandPaths(
    paths: string[],
    excludePatterns?: string[]
  ): Promise<string[]> {
    const allFiles = new Set<string>();
    const exclude = [...this.config.excludePatterns, ...(excludePatterns || [])];

    for (const targetPath of paths) {
      const stat = await fs.stat(targetPath).catch(() => null);
      
      if (!stat) {
        // Try as glob pattern
        const matches = await glob(targetPath, { ignore: exclude });
        matches.forEach(file => allFiles.add(file));
      } else if (stat.isDirectory()) {
        // Expand directory
        const pattern = path.join(targetPath, '**/*.{ts,tsx,js,jsx}');
        const matches = await glob(pattern, { ignore: exclude });
        matches.forEach(file => allFiles.add(file));
      } else {
        // Single file
        allFiles.add(targetPath);
      }
    }

    return Array.from(allFiles);
  }

  /**
   * Generate documentation in specific format
   */
  private async generateFormat(
    items: Map<DocumentationType, DocumentationItem[]>,
    format: DocumentationFormat,
    outputPath: string
  ): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];

    switch (format) {
      case DocumentationFormat.MARKDOWN:
        files.push(...await this.generateMarkdown(items, outputPath));
        break;
      case DocumentationFormat.HTML:
        files.push(...await this.generateHTML(items, outputPath));
        break;
      case DocumentationFormat.JSON:
        files.push(...await this.generateJSON(items, outputPath));
        break;
      case DocumentationFormat.DOCUSAURUS:
        files.push(...await this.generateDocusaurus(items, outputPath));
        break;
      case DocumentationFormat.GITBOOK:
        files.push(...await this.generateGitbook(items, outputPath));
        break;
    }

    return files;
  }

  /**
   * Generate Markdown documentation
   */
  private async generateMarkdown(
    items: Map<DocumentationType, DocumentationItem[]>,
    outputPath: string
  ): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];
    
    // Generate index
    const indexContent = await this.generateMarkdownIndex(items);
    const indexPath = path.join(outputPath, 'README.md');
    await fs.writeFile(indexPath, indexContent);
    files.push({
      path: indexPath,
      format: DocumentationFormat.MARKDOWN,
      type: DocumentationType.README,
      size: Buffer.byteLength(indexContent),
      content: indexContent
    });

    // Generate documentation for each type
    for (const [type, typeItems] of items) {
      if (typeItems.length === 0) continue;

      const typeDir = path.join(outputPath, type);
      await fs.mkdir(typeDir, { recursive: true });

      // Group items by category
      const byCategory = this.groupByCategory(typeItems);

      for (const [category, categoryItems] of byCategory) {
        const content = await this.generateMarkdownCategory(
          type,
          category,
          categoryItems
        );
        
        const fileName = `${category.toLowerCase().replace(/\s+/g, '-')}.md`;
        const filePath = path.join(typeDir, fileName);
        
        await fs.writeFile(filePath, content);
        files.push({
          path: filePath,
          format: DocumentationFormat.MARKDOWN,
          type,
          size: Buffer.byteLength(content),
          content
        });
      }
    }

    return files;
  }

  /**
   * Generate Markdown index
   */
  private async generateMarkdownIndex(
    items: Map<DocumentationType, DocumentationItem[]>
  ): Promise<string> {
    const lines: string[] = [];
    
    lines.push(`# ${this.config.title}`);
    lines.push('');
    if (this.config.description) {
      lines.push(this.config.description);
      lines.push('');
    }
    
    lines.push(`**Version:** ${this.config.version}`);
    lines.push(`**Generated:** ${new Date().toLocaleString()}`);
    lines.push('');
    
    lines.push('## Contents');
    lines.push('');
    
    for (const [type, typeItems] of items) {
      if (typeItems.length === 0) continue;
      
      const typeTitle = this.formatTypeName(type);
      lines.push(`### ${typeTitle}`);
      lines.push('');
      
      const byCategory = this.groupByCategory(typeItems);
      for (const [category, categoryItems] of byCategory) {
        const fileName = `${category.toLowerCase().replace(/\s+/g, '-')}.md`;
        lines.push(`- [${category}](${type}/${fileName}) (${categoryItems.length} items)`);
      }
      
      lines.push('');
    }
    
    return lines.join('\n');
  }

  /**
   * Generate Markdown for category
   */
  private async generateMarkdownCategory(
    type: DocumentationType,
    category: string,
    items: DocumentationItem[]
  ): Promise<string> {
    const template = await this.templateEngine.loadTemplate('markdown-category');
    
    return this.templateEngine.render(template, {
      type: this.formatTypeName(type),
      category,
      items: items.sort((a, b) => a.name.localeCompare(b.name)),
      config: this.config
    });
  }

  /**
   * Generate HTML documentation
   */
  private async generateHTML(
    items: Map<DocumentationType, DocumentationItem[]>,
    outputPath: string
  ): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];
    const htmlDir = path.join(outputPath, 'html');
    await fs.mkdir(htmlDir, { recursive: true });
    
    // Copy static assets
    await this.copyStaticAssets(htmlDir);
    
    // Generate index.html
    const indexContent = await this.generateHTMLIndex(items);
    const indexPath = path.join(htmlDir, 'index.html');
    await fs.writeFile(indexPath, indexContent);
    files.push({
      path: indexPath,
      format: DocumentationFormat.HTML,
      type: DocumentationType.README,
      size: Buffer.byteLength(indexContent)
    });
    
    // Generate pages for each type
    for (const [type, typeItems] of items) {
      if (typeItems.length === 0) continue;
      
      const content = await this.generateHTMLType(type, typeItems);
      const filePath = path.join(htmlDir, `${type}.html`);
      
      await fs.writeFile(filePath, content);
      files.push({
        path: filePath,
        format: DocumentationFormat.HTML,
        type,
        size: Buffer.byteLength(content)
      });
    }
    
    return files;
  }

  /**
   * Generate HTML index
   */
  private async generateHTMLIndex(
    items: Map<DocumentationType, DocumentationItem[]>
  ): Promise<string> {
    const template = await this.templateEngine.loadTemplate('html-index');
    
    const navigation = Array.from(items.entries())
      .filter(([_, typeItems]) => typeItems.length > 0)
      .map(([type, typeItems]) => ({
        type,
        title: this.formatTypeName(type),
        count: typeItems.length,
        href: `${type}.html`
      }));
    
    return this.templateEngine.render(template, {
      config: this.config,
      navigation,
      stats: this.calculateStats(items)
    });
  }

  /**
   * Generate HTML for documentation type
   */
  private async generateHTMLType(
    type: DocumentationType,
    items: DocumentationItem[]
  ): Promise<string> {
    const template = await this.templateEngine.loadTemplate('html-type');
    
    return this.templateEngine.render(template, {
      config: this.config,
      type: this.formatTypeName(type),
      items: items.sort((a, b) => a.name.localeCompare(b.name)),
      byCategory: this.groupByCategory(items)
    });
  }

  /**
   * Generate JSON documentation
   */
  private async generateJSON(
    items: Map<DocumentationType, DocumentationItem[]>,
    outputPath: string
  ): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];
    
    const documentation = {
      metadata: {
        title: this.config.title,
        version: this.config.version,
        description: this.config.description,
        generated: new Date().toISOString()
      },
      items: Object.fromEntries(items)
    };
    
    const content = JSON.stringify(documentation, null, 2);
    const filePath = path.join(outputPath, 'documentation.json');
    
    await fs.writeFile(filePath, content);
    files.push({
      path: filePath,
      format: DocumentationFormat.JSON,
      type: DocumentationType.API,
      size: Buffer.byteLength(content)
    });
    
    return files;
  }

  /**
   * Generate Docusaurus documentation
   */
  private async generateDocusaurus(
    items: Map<DocumentationType, DocumentationItem[]>,
    outputPath: string
  ): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];
    const docsDir = path.join(outputPath, 'docusaurus');
    await fs.mkdir(docsDir, { recursive: true });
    
    // Generate sidebar configuration
    const sidebarConfig = this.generateDocusaurusSidebar(items);
    const sidebarPath = path.join(docsDir, 'sidebar.js');
    await fs.writeFile(sidebarPath, `module.exports = ${JSON.stringify(sidebarConfig, null, 2)};`);
    
    // Generate documentation files
    for (const [type, typeItems] of items) {
      if (typeItems.length === 0) continue;
      
      const typeDir = path.join(docsDir, type);
      await fs.mkdir(typeDir, { recursive: true });
      
      // Generate index for type
      const indexContent = this.generateDocusaurusTypeIndex(type, typeItems);
      const indexPath = path.join(typeDir, '_category_.json');
      await fs.writeFile(indexPath, JSON.stringify({
        label: this.formatTypeName(type),
        position: this.getTypePosition(type)
      }, null, 2));
      
      // Generate pages
      const byCategory = this.groupByCategory(typeItems);
      for (const [category, categoryItems] of byCategory) {
        const content = this.generateDocusaurusCategory(type, category, categoryItems);
        const fileName = `${category.toLowerCase().replace(/\s+/g, '-')}.md`;
        const filePath = path.join(typeDir, fileName);
        
        await fs.writeFile(filePath, content);
        files.push({
          path: filePath,
          format: DocumentationFormat.DOCUSAURUS,
          type,
          size: Buffer.byteLength(content)
        });
      }
    }
    
    return files;
  }

  /**
   * Generate Gitbook documentation
   */
  private async generateGitbook(
    items: Map<DocumentationType, DocumentationItem[]>,
    outputPath: string
  ): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];
    const gitbookDir = path.join(outputPath, 'gitbook');
    await fs.mkdir(gitbookDir, { recursive: true });
    
    // Generate SUMMARY.md
    const summaryContent = this.generateGitbookSummary(items);
    const summaryPath = path.join(gitbookDir, 'SUMMARY.md');
    await fs.writeFile(summaryPath, summaryContent);
    files.push({
      path: summaryPath,
      format: DocumentationFormat.GITBOOK,
      type: DocumentationType.README,
      size: Buffer.byteLength(summaryContent)
    });
    
    // Generate README.md
    const readmeContent = this.generateGitbookReadme();
    const readmePath = path.join(gitbookDir, 'README.md');
    await fs.writeFile(readmePath, readmeContent);
    files.push({
      path: readmePath,
      format: DocumentationFormat.GITBOOK,
      type: DocumentationType.README,
      size: Buffer.byteLength(readmeContent)
    });
    
    // Generate documentation files
    for (const [type, typeItems] of items) {
      if (typeItems.length === 0) continue;
      
      const typeDir = path.join(gitbookDir, type);
      await fs.mkdir(typeDir, { recursive: true });
      
      const byCategory = this.groupByCategory(typeItems);
      for (const [category, categoryItems] of byCategory) {
        const content = this.generateGitbookCategory(type, category, categoryItems);
        const fileName = `${category.toLowerCase().replace(/\s+/g, '-')}.md`;
        const filePath = path.join(typeDir, fileName);
        
        await fs.writeFile(filePath, content);
        files.push({
          path: filePath,
          format: DocumentationFormat.GITBOOK,
          type,
          size: Buffer.byteLength(content)
        });
      }
    }
    
    return files;
  }

  /**
   * Calculate documentation coverage
   */
  private calculateCoverage(
    astCache: Map<string, ts.SourceFile>,
    items: Map<DocumentationType, DocumentationItem[]>
  ): DocumentationCoverage {
    const stats: Record<string, CoverageStats> = {};
    let totalItems = 0;
    let documentedItems = 0;

    // Count exportable items in AST
    for (const sourceFile of astCache.values()) {
      const fileStats = this.analyzeFileCoverage(sourceFile);
      for (const [key, value] of Object.entries(fileStats)) {
        if (!stats[key]) {
          stats[key] = { total: 0, documented: 0, percentage: 0 };
        }
        stats[key].total += value.total;
        totalItems += value.total;
      }
    }

    // Count documented items
    for (const typeItems of items.values()) {
      documentedItems += typeItems.length;
      for (const item of typeItems) {
        const statKey = this.getItemStatKey(item);
        if (stats[statKey]) {
          stats[statKey].documented++;
        }
      }
    }

    // Calculate percentages
    for (const stat of Object.values(stats)) {
      stat.percentage = stat.total > 0 
        ? Math.round((stat.documented / stat.total) * 100)
        : 100;
    }

    return {
      totalItems,
      documented: documentedItems,
      percentage: totalItems > 0 
        ? Math.round((documentedItems / totalItems) * 100)
        : 100,
      byType: stats
    };
  }

  /**
   * Analyze file coverage
   */
  private analyzeFileCoverage(sourceFile: ts.SourceFile): Record<string, CoverageStats> {
    const stats: Record<string, CoverageStats> = {};
    
    const visit = (node: ts.Node) => {
      if (ts.isClassDeclaration(node) && node.name && this.isExported(node)) {
        this.incrementStat(stats, 'classes');
      } else if (ts.isFunctionDeclaration(node) && node.name && this.isExported(node)) {
        this.incrementStat(stats, 'functions');
      } else if (ts.isInterfaceDeclaration(node) && this.isExported(node)) {
        this.incrementStat(stats, 'interfaces');
      } else if (ts.isTypeAliasDeclaration(node) && this.isExported(node)) {
        this.incrementStat(stats, 'types');
      } else if (ts.isEnumDeclaration(node) && this.isExported(node)) {
        this.incrementStat(stats, 'enums');
      } else if (ts.isVariableStatement(node) && this.isExported(node)) {
        this.incrementStat(stats, 'variables');
      }
      
      ts.forEachChild(node, visit);
    };
    
    visit(sourceFile);
    
    return stats;
  }

  /**
   * Check if node is exported
   */
  private isExported(node: ts.Node): boolean {
    return !!(ts.getCombinedModifierFlags(node as any) & ts.ModifierFlags.Export);
  }

  /**
   * Increment stat counter
   */
  private incrementStat(stats: Record<string, CoverageStats>, key: string): void {
    if (!stats[key]) {
      stats[key] = { total: 0, documented: 0, percentage: 0 };
    }
    stats[key].total++;
  }

  /**
   * Get stat key for documentation item
   */
  private getItemStatKey(item: DocumentationItem): string {
    const typeMap: Record<string, string> = {
      'class': 'classes',
      'function': 'functions',
      'interface': 'interfaces',
      'type': 'types',
      'enum': 'enums',
      'variable': 'variables',
      'constant': 'variables'
    };
    
    return typeMap[item.type.toLowerCase()] || 'other';
  }

  /**
   * Group items by category
   */
  private groupByCategory(items: DocumentationItem[]): Map<string, DocumentationItem[]> {
    const groups = new Map<string, DocumentationItem[]>();
    
    for (const item of items) {
      const category = item.category || 'General';
      const list = groups.get(category) || [];
      list.push(item);
      groups.set(category, list);
    }
    
    return groups;
  }

  /**
   * Create template engine
   */
  private createTemplateEngine(): TemplateEngine {
    const templates = new Map<string, string>();
    
    // Default templates
    templates.set('markdown-category', `# {{category}}

{{#each items}}
## {{name}}

{{#if description}}
{{description}}
{{/if}}

{{#if source}}
**Source:** \`{{source.file}}:{{source.line}}\`
{{/if}}

{{#if examples}}
### Examples

{{#each examples}}
{{#if title}}
#### {{title}}
{{/if}}

\`\`\`{{language}}
{{{code}}}
\`\`\`

{{#if description}}
{{description}}
{{/if}}
{{/each}}
{{/if}}

{{#if seeAlso}}
### See Also

{{#each seeAlso}}
- {{this}}
{{/each}}
{{/if}}

---

{{/each}}`);

    templates.set('html-index', `<!DOCTYPE html>
<html>
<head>
  <title>{{config.title}} - Documentation</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <nav>
    <h1>{{config.title}}</h1>
    <ul>
      {{#each navigation}}
      <li><a href="{{href}}">{{title}} ({{count}})</a></li>
      {{/each}}
    </ul>
  </nav>
  <main>
    <h1>{{config.title}}</h1>
    <p>Version: {{config.version}}</p>
    {{#if config.description}}
    <p>{{config.description}}</p>
    {{/if}}
    
    <h2>Statistics</h2>
    <ul>
      <li>Total Items: {{stats.total}}</li>
      <li>Coverage: {{stats.coverage}}%</li>
    </ul>
  </main>
</body>
</html>`);

    return {
      render(template: string, data: any): string {
        // Simple template rendering (in production, use handlebars or similar)
        return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
          const keys = key.trim().split('.');
          let value = data;
          for (const k of keys) {
            value = value?.[k];
          }
          return value !== undefined ? String(value) : match;
        });
      },
      
      async loadTemplate(name: string): Promise<string> {
        return templates.get(name) || '';
      },
      
      registerHelper(name: string, fn: Function): void {
        // Helper registration (simplified)
      }
    };
  }

  /**
   * Load configuration
   */
  private async loadConfig(configPath: string): Promise<void> {
    try {
      const content = await fs.readFile(configPath, 'utf-8');
      const customConfig = JSON.parse(content);
      this.config = { ...this.defaultConfig, ...customConfig };
    } catch (error) {
      console.warn(`Failed to load config from ${configPath}, using defaults`);
    }
  }

  /**
   * Create documentation summary
   */
  private createSummary(
    files: GeneratedFile[],
    coverage: DocumentationCoverage,
    timeElapsed: number
  ): DocumentationSummary {
    const byType: Record<DocumentationType, number> = {} as any;
    const byFormat: Record<DocumentationFormat, number> = {} as any;
    
    for (const file of files) {
      byType[file.type] = (byType[file.type] || 0) + 1;
      byFormat[file.format] = (byFormat[file.format] || 0) + 1;
    }
    
    return {
      totalFiles: files.length,
      byType,
      byFormat,
      timeElapsed,
      coverage
    };
  }

  /**
   * Create empty coverage stats
   */
  private createEmptyCoverage(): DocumentationCoverage {
    return {
      totalItems: 0,
      documented: 0,
      percentage: 100,
      byType: {}
    };
  }

  /**
   * Format type name for display
   */
  private formatTypeName(type: DocumentationType): string {
    const names = {
      [DocumentationType.API]: 'API Reference',
      [DocumentationType.ARCHITECTURE]: 'Architecture',
      [DocumentationType.README]: 'Getting Started',
      [DocumentationType.CHANGELOG]: 'Change Log',
      [DocumentationType.GUIDE]: 'Guides',
      [DocumentationType.TUTORIAL]: 'Tutorials'
    };
    return names[type] || type;
  }

  /**
   * Get type position for ordering
   */
  private getTypePosition(type: DocumentationType): number {
    const positions = {
      [DocumentationType.README]: 1,
      [DocumentationType.GUIDE]: 2,
      [DocumentationType.TUTORIAL]: 3,
      [DocumentationType.API]: 4,
      [DocumentationType.ARCHITECTURE]: 5,
      [DocumentationType.CHANGELOG]: 6
    };
    return positions[type] || 99;
  }

  /**
   * Generate Docusaurus sidebar configuration
   */
  private generateDocusaurusSidebar(items: Map<DocumentationType, DocumentationItem[]>): any {
    const sidebar: any[] = [];
    
    for (const [type, typeItems] of items) {
      if (typeItems.length === 0) continue;
      
      const byCategory = this.groupByCategory(typeItems);
      const typeSection = {
        type: 'category',
        label: this.formatTypeName(type),
        items: Array.from(byCategory.entries()).map(([category, categoryItems]) => ({
          type: 'doc',
          id: `${type}/${category.toLowerCase().replace(/\s+/g, '-')}`
        }))
      };
      
      sidebar.push(typeSection);
    }
    
    return { docs: sidebar };
  }

  /**
   * Generate Docusaurus type index
   */
  private generateDocusaurusTypeIndex(type: DocumentationType, items: DocumentationItem[]): string {
    return `---
id: ${type}-index
title: ${this.formatTypeName(type)}
---

# ${this.formatTypeName(type)}

This section contains ${items.length} items.

## Categories

${Array.from(this.groupByCategory(items).keys())
  .map(cat => `- [${cat}](./${cat.toLowerCase().replace(/\s+/g, '-')})`)
  .join('\n')}
`;
  }

  /**
   * Generate Docusaurus category page
   */
  private generateDocusaurusCategory(
    type: DocumentationType,
    category: string,
    items: DocumentationItem[]
  ): string {
    const lines: string[] = [];
    
    lines.push('---');
    lines.push(`id: ${category.toLowerCase().replace(/\s+/g, '-')}`);
    lines.push(`title: ${category}`);
    lines.push('---');
    lines.push('');
    lines.push(`# ${category}`);
    lines.push('');
    
    for (const item of items) {
      lines.push(`## ${item.name}`);
      lines.push('');
      
      if (item.description) {
        lines.push(item.description);
        lines.push('');
      }
      
      if (item.examples && item.examples.length > 0) {
        lines.push('### Examples');
        lines.push('');
        
        for (const example of item.examples) {
          if (example.title) {
            lines.push(`#### ${example.title}`);
            lines.push('');
          }
          
          lines.push(`\`\`\`${example.language}`);
          lines.push(example.code);
          lines.push('```');
          lines.push('');
          
          if (example.description) {
            lines.push(example.description);
            lines.push('');
          }
        }
      }
      
      lines.push('---');
      lines.push('');
    }
    
    return lines.join('\n');
  }

  /**
   * Generate Gitbook SUMMARY.md
   */
  private generateGitbookSummary(items: Map<DocumentationType, DocumentationItem[]>): string {
    const lines: string[] = [];
    
    lines.push('# Summary');
    lines.push('');
    lines.push('* [Introduction](README.md)');
    lines.push('');
    
    for (const [type, typeItems] of items) {
      if (typeItems.length === 0) continue;
      
      lines.push(`* [${this.formatTypeName(type)}](${type}/README.md)`);
      
      const byCategory = this.groupByCategory(typeItems);
      for (const category of byCategory.keys()) {
        const fileName = `${category.toLowerCase().replace(/\s+/g, '-')}.md`;
        lines.push(`  * [${category}](${type}/${fileName})`);
      }
      
      lines.push('');
    }
    
    return lines.join('\n');
  }

  /**
   * Generate Gitbook README
   */
  private generateGitbookReadme(): string {
    return `# ${this.config.title}

${this.config.description || ''}

**Version:** ${this.config.version}  
**Generated:** ${new Date().toLocaleString()}

## Overview

This documentation provides comprehensive information about the project.

## Getting Started

Navigate through the documentation using the sidebar on the left.
`;
  }

  /**
   * Generate Gitbook category page
   */
  private generateGitbookCategory(
    type: DocumentationType,
    category: string,
    items: DocumentationItem[]
  ): string {
    const lines: string[] = [];
    
    lines.push(`# ${category}`);
    lines.push('');
    
    // Add table of contents
    lines.push('## Table of Contents');
    lines.push('');
    for (const item of items) {
      lines.push(`* [${item.name}](#${item.name.toLowerCase().replace(/\s+/g, '-')})`);
    }
    lines.push('');
    
    // Add items
    for (const item of items) {
      lines.push(`## ${item.name}`);
      lines.push('');
      
      if (item.description) {
        lines.push(item.description);
        lines.push('');
      }
      
      if (item.source) {
        lines.push(`**Source:** \`${item.source.file}:${item.source.line}\``);
        lines.push('');
      }
      
      if (item.examples && item.examples.length > 0) {
        lines.push('### Examples');
        lines.push('');
        
        for (const example of item.examples) {
          if (example.title) {
            lines.push(`**${example.title}**`);
            lines.push('');
          }
          
          lines.push('```' + example.language);
          lines.push(example.code);
          lines.push('```');
          lines.push('');
          
          if (example.description) {
            lines.push(example.description);
            lines.push('');
          }
        }
      }
      
      if (item.seeAlso && item.seeAlso.length > 0) {
        lines.push('### See Also');
        lines.push('');
        for (const ref of item.seeAlso) {
          lines.push(`* ${ref}`);
        }
        lines.push('');
      }
      
      lines.push('---');
      lines.push('');
    }
    
    return lines.join('\n');
  }

  /**
   * Copy static assets for HTML documentation
   */
  private async copyStaticAssets(outputPath: string): Promise<void> {
    // Create basic CSS file
    const css = `
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

nav {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

nav h1 {
  margin: 0 0 20px 0;
  color: #2c3e50;
}

nav ul {
  list-style: none;
  padding: 0;
}

nav li {
  margin: 10px 0;
}

nav a {
  color: #3498db;
  text-decoration: none;
}

nav a:hover {
  text-decoration: underline;
}

code {
  background: #f4f4f4;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: Consolas, Monaco, monospace;
}

pre {
  background: #f4f4f4;
  padding: 15px;
  border-radius: 5px;
  overflow-x: auto;
}

.item {
  border-bottom: 1px solid #eee;
  padding: 20px 0;
}

.item:last-child {
  border-bottom: none;
}

.source {
  color: #666;
  font-size: 0.9em;
}

.example {
  margin: 20px 0;
}

.example-title {
  font-weight: bold;
  margin-bottom: 10px;
}
`;

    await fs.writeFile(path.join(outputPath, 'style.css'), css);
  }

  /**
   * Calculate documentation statistics
   */
  private calculateStats(items: Map<DocumentationType, DocumentationItem[]>): any {
    let total = 0;
    for (const typeItems of items.values()) {
      total += typeItems.length;
    }
    
    return {
      total,
      coverage: 100 // Simplified for now
    };
  }

  /**
   * Get available plugins
   */
  getAvailablePlugins(): DocumentationPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get plugin info
   */
  getPluginInfo(name: string): DocumentationPlugin | undefined {
    return this.plugins.get(name);
  }
}

// Export singleton instance
export const documentationEngine = new DocumentationEngine();