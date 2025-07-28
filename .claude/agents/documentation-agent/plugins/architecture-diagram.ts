/**
 * Architecture Diagram Generator Plugin
 * 
 * Generates Mermaid diagrams showing system architecture, component relationships,
 * and data flow following Google Cloud Platform style guidelines
 */

import * as ts from 'typescript';
import * as path from 'path';
import {
  DocumentationPlugin,
  DocumentationType,
  PluginContext,
  DocumentationItem
} from '../core-engine';

interface ComponentInfo {
  name: string;
  type: ComponentType;
  path: string;
  dependencies: string[];
  exports: string[];
  imports: ImportInfo[];
  description?: string;
  layer?: ArchitectureLayer;
}

interface ImportInfo {
  from: string;
  items: string[];
  isExternal: boolean;
  isRelative: boolean;
}

enum ComponentType {
  SERVICE = 'service',
  CONTROLLER = 'controller',
  COMPONENT = 'component',
  HOOK = 'hook',
  UTILITY = 'utility',
  MODEL = 'model',
  MIDDLEWARE = 'middleware',
  ROUTE = 'route',
  CONFIG = 'config',
  LIBRARY = 'library'
}

enum ArchitectureLayer {
  PRESENTATION = 'presentation',
  APPLICATION = 'application',
  DOMAIN = 'domain',
  INFRASTRUCTURE = 'infrastructure',
  SHARED = 'shared'
}

interface DiagramSection {
  title: string;
  type: DiagramType;
  content: string;
  description?: string;
}

enum DiagramType {
  SYSTEM_OVERVIEW = 'system-overview',
  COMPONENT_RELATIONSHIP = 'component-relationship',
  DATA_FLOW = 'data-flow',
  DEPLOYMENT = 'deployment',
  SEQUENCE = 'sequence',
  CLASS = 'class'
}

export class ArchitectureDiagramPlugin implements DocumentationPlugin {
  name = 'architecture-diagram';
  type = DocumentationType.ARCHITECTURE;
  description = 'Generates Mermaid architecture diagrams following GCP style guidelines';

  private components: Map<string, ComponentInfo> = new Map();
  private projectStructure: Map<string, string[]> = new Map();
  private externalDependencies: Set<string> = new Set();

  async generate(context: PluginContext): Promise<DocumentationItem[]> {
    // Clear previous data
    this.components.clear();
    this.projectStructure.clear();
    this.externalDependencies.clear();

    // Analyze codebase structure
    await this.analyzeCodebase(context);
    
    // Generate different diagram types
    const diagrams = this.generateDiagrams(context);
    
    // Create documentation items
    return diagrams.map((diagram, index) => ({
      id: `architecture-${diagram.type}-${index}`,
      name: diagram.title,
      type: 'diagram',
      category: 'Architecture Diagrams',
      description: diagram.description || `${diagram.title} showing system architecture`,
      tags: ['architecture', 'diagram', 'mermaid', diagram.type],
      metadata: {
        diagramType: diagram.type,
        mermaidCode: diagram.content,
        format: 'mermaid'
      }
    }));
  }

  /**
   * Analyze codebase structure
   */
  private async analyzeCodebase(context: PluginContext): Promise<void> {
    for (const [filePath, sourceFile] of context.astCache) {
      // Skip test files and external modules
      if (filePath.includes('node_modules') || filePath.includes('.test.') || filePath.includes('.spec.')) {
        continue;
      }

      const componentInfo = this.analyzeFile(sourceFile, filePath, context);
      if (componentInfo) {
        this.components.set(filePath, componentInfo);
        
        // Track project structure
        const dir = path.dirname(filePath);
        const fileName = path.basename(filePath);
        
        if (!this.projectStructure.has(dir)) {
          this.projectStructure.set(dir, []);
        }
        this.projectStructure.get(dir)!.push(fileName);
      }
    }
  }

  /**
   * Analyze a single file
   */
  private analyzeFile(
    sourceFile: ts.SourceFile,
    filePath: string,
    context: PluginContext
  ): ComponentInfo | null {
    const componentName = this.extractComponentName(filePath);
    const componentType = this.detectComponentType(filePath, sourceFile);
    const layer = this.detectArchitectureLayer(filePath, componentType);
    
    const imports = this.extractImports(sourceFile, filePath);
    const exports = this.extractExports(sourceFile);
    const dependencies = this.extractDependencies(imports);
    
    return {
      name: componentName,
      type: componentType,
      path: filePath,
      dependencies,
      exports,
      imports,
      layer,
      description: this.extractDescription(sourceFile)
    };
  }

  /**
   * Extract component name from file path
   */
  private extractComponentName(filePath: string): string {
    const fileName = path.basename(filePath, path.extname(filePath));
    // Convert kebab-case or snake_case to PascalCase
    return fileName
      .split(/[-_]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  }

  /**
   * Detect component type from file path and content
   */
  private detectComponentType(filePath: string, sourceFile: ts.SourceFile): ComponentType {
    const fileName = path.basename(filePath).toLowerCase();
    const dirName = path.dirname(filePath).toLowerCase();
    
    // Check by directory
    if (dirName.includes('service')) return ComponentType.SERVICE;
    if (dirName.includes('controller')) return ComponentType.CONTROLLER;
    if (dirName.includes('component')) return ComponentType.COMPONENT;
    if (dirName.includes('hook')) return ComponentType.HOOK;
    if (dirName.includes('util') || dirName.includes('helper')) return ComponentType.UTILITY;
    if (dirName.includes('model') || dirName.includes('schema')) return ComponentType.MODEL;
    if (dirName.includes('middleware')) return ComponentType.MIDDLEWARE;
    if (dirName.includes('route')) return ComponentType.ROUTE;
    if (dirName.includes('config')) return ComponentType.CONFIG;
    
    // Check by file name
    if (fileName.includes('service')) return ComponentType.SERVICE;
    if (fileName.includes('controller')) return ComponentType.CONTROLLER;
    if (fileName.includes('component')) return ComponentType.COMPONENT;
    if (fileName.includes('hook')) return ComponentType.HOOK;
    if (fileName.includes('util') || fileName.includes('helper')) return ComponentType.UTILITY;
    if (fileName.includes('model') || fileName.includes('schema')) return ComponentType.MODEL;
    if (fileName.includes('middleware')) return ComponentType.MIDDLEWARE;
    if (fileName.includes('route')) return ComponentType.ROUTE;
    if (fileName.includes('config')) return ComponentType.CONFIG;
    
    // Check by content
    const content = sourceFile.getText();
    if (content.includes('express.Router') || content.includes('router.')) return ComponentType.ROUTE;
    if (content.includes('React.Component') || content.includes('useState')) return ComponentType.COMPONENT;
    
    return ComponentType.LIBRARY;
  }

  /**
   * Detect architecture layer
   */
  private detectArchitectureLayer(filePath: string, componentType: ComponentType): ArchitectureLayer {
    const lowerPath = filePath.toLowerCase();
    
    // Check by path
    if (lowerPath.includes('frontend') || lowerPath.includes('ui') || lowerPath.includes('view')) {
      return ArchitectureLayer.PRESENTATION;
    }
    if (lowerPath.includes('backend') || lowerPath.includes('api')) {
      if (componentType === ComponentType.CONTROLLER || componentType === ComponentType.ROUTE) {
        return ArchitectureLayer.APPLICATION;
      }
      if (componentType === ComponentType.SERVICE) {
        return ArchitectureLayer.DOMAIN;
      }
    }
    if (lowerPath.includes('database') || lowerPath.includes('repository')) {
      return ArchitectureLayer.INFRASTRUCTURE;
    }
    if (lowerPath.includes('shared') || lowerPath.includes('common')) {
      return ArchitectureLayer.SHARED;
    }
    
    // Default by component type
    switch (componentType) {
      case ComponentType.COMPONENT:
        return ArchitectureLayer.PRESENTATION;
      case ComponentType.CONTROLLER:
      case ComponentType.ROUTE:
        return ArchitectureLayer.APPLICATION;
      case ComponentType.SERVICE:
      case ComponentType.MODEL:
        return ArchitectureLayer.DOMAIN;
      case ComponentType.MIDDLEWARE:
      case ComponentType.CONFIG:
        return ArchitectureLayer.INFRASTRUCTURE;
      default:
        return ArchitectureLayer.SHARED;
    }
  }

  /**
   * Extract imports from source file
   */
  private extractImports(sourceFile: ts.SourceFile, currentPath: string): ImportInfo[] {
    const imports: ImportInfo[] = [];
    
    ts.forEachChild(sourceFile, node => {
      if (ts.isImportDeclaration(node) && node.moduleSpecifier) {
        const moduleSpecifier = (node.moduleSpecifier as ts.StringLiteral).text;
        const items: string[] = [];
        
        if (node.importClause) {
          // Default import
          if (node.importClause.name) {
            items.push(node.importClause.name.text);
          }
          
          // Named imports
          if (node.importClause.namedBindings) {
            if (ts.isNamedImports(node.importClause.namedBindings)) {
              node.importClause.namedBindings.elements.forEach(element => {
                items.push(element.name.text);
              });
            } else if (ts.isNamespaceImport(node.importClause.namedBindings)) {
              items.push(`* as ${node.importClause.namedBindings.name.text}`);
            }
          }
        }
        
        const isRelative = moduleSpecifier.startsWith('.') || moduleSpecifier.startsWith('/');
        const isExternal = !isRelative && !moduleSpecifier.startsWith('@/');
        
        if (isExternal) {
          this.externalDependencies.add(moduleSpecifier);
        }
        
        imports.push({
          from: moduleSpecifier,
          items,
          isExternal,
          isRelative
        });
      }
    });
    
    return imports;
  }

  /**
   * Extract exports from source file
   */
  private extractExports(sourceFile: ts.SourceFile): string[] {
    const exports: string[] = [];
    
    ts.forEachChild(sourceFile, node => {
      if (ts.isExportDeclaration(node)) {
        if (node.exportClause && ts.isNamedExports(node.exportClause)) {
          node.exportClause.elements.forEach(element => {
            exports.push(element.name.text);
          });
        }
      } else if (node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
        if (ts.isClassDeclaration(node) && node.name) {
          exports.push(node.name.text);
        } else if (ts.isFunctionDeclaration(node) && node.name) {
          exports.push(node.name.text);
        } else if (ts.isVariableStatement(node)) {
          node.declarationList.declarations.forEach(decl => {
            if (ts.isIdentifier(decl.name)) {
              exports.push(decl.name.text);
            }
          });
        }
      }
    });
    
    return exports;
  }

  /**
   * Extract dependencies from imports
   */
  private extractDependencies(imports: ImportInfo[]): string[] {
    return imports
      .filter(imp => imp.isRelative)
      .map(imp => imp.from);
  }

  /**
   * Extract description from JSDoc
   */
  private extractDescription(sourceFile: ts.SourceFile): string | undefined {
    // Look for file-level JSDoc comment
    const firstStatement = sourceFile.statements[0];
    if (!firstStatement) return undefined;
    
    const jsDoc = ts.getJSDocCommentsAndTags(firstStatement)[0];
    if (jsDoc && ts.isJSDoc(jsDoc) && jsDoc.comment) {
      return typeof jsDoc.comment === 'string' ? jsDoc.comment : jsDoc.comment.map(c => c.getText()).join('');
    }
    
    return undefined;
  }

  /**
   * Generate all diagram types
   */
  private generateDiagrams(context: PluginContext): DiagramSection[] {
    const diagrams: DiagramSection[] = [];
    
    // System Overview
    diagrams.push(this.generateSystemOverview());
    
    // Component Relationships
    diagrams.push(this.generateComponentRelationships());
    
    // Data Flow
    diagrams.push(this.generateDataFlow());
    
    // Layer Architecture
    diagrams.push(this.generateLayerArchitecture());
    
    // Deployment Architecture
    if (this.hasDeploymentInfo()) {
      diagrams.push(this.generateDeploymentDiagram());
    }
    
    return diagrams;
  }

  /**
   * Generate system overview diagram
   */
  private generateSystemOverview(): DiagramSection {
    const lines: string[] = [];
    
    lines.push('graph TB');
    lines.push('    %% System Overview');
    lines.push('    ');
    
    // Group components by layer
    const layers = new Map<ArchitectureLayer, ComponentInfo[]>();
    for (const component of this.components.values()) {
      if (!layers.has(component.layer!)) {
        layers.set(component.layer!, []);
      }
      layers.get(component.layer!)!.push(component);
    }
    
    // Frontend components
    if (layers.has(ArchitectureLayer.PRESENTATION)) {
      lines.push('    subgraph Frontend["Frontend (React + Vite)"]');
      lines.push('        style Frontend fill:#e1f5fe,stroke:#01579b,stroke-width:2px');
      
      const components = layers.get(ArchitectureLayer.PRESENTATION)!;
      components.forEach((comp, i) => {
        const id = `FE${i}`;
        const icon = this.getComponentIcon(comp.type);
        lines.push(`        ${id}["${icon} ${comp.name}"]`);
      });
      
      lines.push('    end');
      lines.push('    ');
    }
    
    // Backend components
    if (layers.has(ArchitectureLayer.APPLICATION) || layers.has(ArchitectureLayer.DOMAIN)) {
      lines.push('    subgraph Backend["Backend (Express + Prisma)"]');
      lines.push('        style Backend fill:#f3e5f5,stroke:#4a148c,stroke-width:2px');
      
      // API Layer
      if (layers.has(ArchitectureLayer.APPLICATION)) {
        lines.push('        subgraph API["API Layer"]');
        lines.push('            style API fill:#fce4ec,stroke:#880e4f');
        
        const controllers = layers.get(ArchitectureLayer.APPLICATION)!;
        controllers.forEach((comp, i) => {
          const id = `API${i}`;
          const icon = this.getComponentIcon(comp.type);
          lines.push(`            ${id}["${icon} ${comp.name}"]`);
        });
        
        lines.push('        end');
      }
      
      // Business Logic
      if (layers.has(ArchitectureLayer.DOMAIN)) {
        lines.push('        subgraph Business["Business Logic"]');
        lines.push('            style Business fill:#e8f5e9,stroke:#1b5e20');
        
        const services = layers.get(ArchitectureLayer.DOMAIN)!;
        services.forEach((comp, i) => {
          const id = `BL${i}`;
          const icon = this.getComponentIcon(comp.type);
          lines.push(`            ${id}["${icon} ${comp.name}"]`);
        });
        
        lines.push('        end');
      }
      
      lines.push('    end');
      lines.push('    ');
    }
    
    // Infrastructure
    if (layers.has(ArchitectureLayer.INFRASTRUCTURE)) {
      lines.push('    subgraph Infrastructure["Infrastructure"]');
      lines.push('        style Infrastructure fill:#fff3e0,stroke:#e65100,stroke-width:2px');
      
      lines.push('        DB[(PostgreSQL)]');
      lines.push('        Cache[(Redis)]');
      lines.push('        Storage[("Object Storage")]');
      
      lines.push('    end');
      lines.push('    ');
    }
    
    // External Services
    if (this.externalDependencies.size > 0) {
      lines.push('    subgraph External["External Services"]');
      lines.push('        style External fill:#f5f5f5,stroke:#616161,stroke-width:2px,stroke-dasharray: 5 5');
      
      const majorDeps = this.getMajorExternalDependencies();
      majorDeps.forEach((dep, i) => {
        lines.push(`        EXT${i}["${dep}"]`);
      });
      
      lines.push('    end');
      lines.push('    ');
    }
    
    // Add connections
    lines.push('    %% Connections');
    lines.push('    Frontend --> API');
    lines.push('    API --> Business');
    lines.push('    Business --> DB');
    lines.push('    Business --> Cache');
    lines.push('    Frontend --> Storage');
    
    return {
      title: 'System Architecture Overview',
      type: DiagramType.SYSTEM_OVERVIEW,
      content: lines.join('\n'),
      description: 'High-level overview of the system architecture showing major components and their relationships'
    };
  }

  /**
   * Generate component relationships diagram
   */
  private generateComponentRelationships(): DiagramSection {
    const lines: string[] = [];
    
    lines.push('graph LR');
    lines.push('    %% Component Dependencies');
    lines.push('    ');
    
    // Create simplified component map
    const componentMap = new Map<string, string>();
    const componentPaths = new Map<string, string>();
    let componentId = 0;
    
    for (const [path, component] of this.components) {
      const id = `C${componentId++}`;
      componentMap.set(path, id);
      componentPaths.set(id, component.name);
      
      const icon = this.getComponentIcon(component.type);
      const style = this.getComponentStyle(component.type);
      lines.push(`    ${id}["${icon} ${component.name}"]`);
      lines.push(`    style ${id} ${style}`);
    }
    
    lines.push('    ');
    lines.push('    %% Dependencies');
    
    // Add dependency arrows
    for (const [path, component] of this.components) {
      const fromId = componentMap.get(path)!;
      
      for (const dep of component.dependencies) {
        // Resolve dependency path
        const depPath = this.resolveDependencyPath(path, dep);
        const toId = componentMap.get(depPath);
        
        if (toId && fromId !== toId) {
          lines.push(`    ${fromId} --> ${toId}`);
        }
      }
    }
    
    return {
      title: 'Component Dependencies',
      type: DiagramType.COMPONENT_RELATIONSHIP,
      content: lines.join('\n'),
      description: 'Detailed view of component dependencies and relationships'
    };
  }

  /**
   * Generate data flow diagram
   */
  private generateDataFlow(): DiagramSection {
    const lines: string[] = [];
    
    lines.push('sequenceDiagram');
    lines.push('    %% Typical Data Flow');
    lines.push('    ');
    
    lines.push('    participant U as User');
    lines.push('    participant F as Frontend');
    lines.push('    participant A as API Gateway');
    lines.push('    participant C as Controller');
    lines.push('    participant S as Service');
    lines.push('    participant D as Database');
    lines.push('    participant Ca as Cache');
    lines.push('    ');
    
    // Request flow
    lines.push('    Note over U,Ca: User Request Flow');
    lines.push('    U->>F: User Action');
    lines.push('    F->>F: Validate Input');
    lines.push('    F->>A: API Request');
    lines.push('    A->>A: Auth Check');
    lines.push('    A->>C: Route to Controller');
    lines.push('    C->>S: Business Logic');
    lines.push('    ');
    
    // Cache check
    lines.push('    alt Cache Hit');
    lines.push('        S->>Ca: Check Cache');
    lines.push('        Ca-->>S: Return Cached Data');
    lines.push('    else Cache Miss');
    lines.push('        S->>D: Query Database');
    lines.push('        D-->>S: Return Data');
    lines.push('        S->>Ca: Update Cache');
    lines.push('    end');
    lines.push('    ');
    
    // Response flow
    lines.push('    S-->>C: Process Result');
    lines.push('    C-->>A: Format Response');
    lines.push('    A-->>F: JSON Response');
    lines.push('    F-->>F: Update UI State');
    lines.push('    F-->>U: Display Result');
    
    return {
      title: 'Data Flow Diagram',
      type: DiagramType.DATA_FLOW,
      content: lines.join('\n'),
      description: 'Sequence diagram showing typical data flow through the system'
    };
  }

  /**
   * Generate layer architecture diagram
   */
  private generateLayerArchitecture(): DiagramSection {
    const lines: string[] = [];
    
    lines.push('graph TB');
    lines.push('    %% Layered Architecture');
    lines.push('    ');
    
    // Presentation Layer
    lines.push('    subgraph PL["Presentation Layer"]');
    lines.push('        style PL fill:#e3f2fd,stroke:#1565c0,stroke-width:2px');
    lines.push('        UI["UI Components"]');
    lines.push('        Store["State Management"]');
    lines.push('        Router["Routing"]');
    lines.push('    end');
    lines.push('    ');
    
    // Application Layer
    lines.push('    subgraph AL["Application Layer"]');
    lines.push('        style AL fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px');
    lines.push('        API["REST API"]');
    lines.push('        GraphQL["GraphQL"]');
    lines.push('        WebSocket["WebSocket"]');
    lines.push('    end');
    lines.push('    ');
    
    // Domain Layer
    lines.push('    subgraph DL["Domain Layer"]');
    lines.push('        style DL fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px');
    lines.push('        Services["Business Services"]');
    lines.push('        Models["Domain Models"]');
    lines.push('        Rules["Business Rules"]');
    lines.push('    end');
    lines.push('    ');
    
    // Infrastructure Layer
    lines.push('    subgraph IL["Infrastructure Layer"]');
    lines.push('        style IL fill:#fff8e1,stroke:#f57c00,stroke-width:2px');
    lines.push('        Database[(Database)]');
    lines.push('        MessageQueue[["Message Queue"]]');
    lines.push('        FileStorage["File Storage"]');
    lines.push('        Email["Email Service"]');
    lines.push('    end');
    lines.push('    ');
    
    // Connections
    lines.push('    %% Layer Connections');
    lines.push('    UI --> Store');
    lines.push('    Store --> API');
    lines.push('    Router --> API');
    lines.push('    API --> Services');
    lines.push('    GraphQL --> Services');
    lines.push('    WebSocket --> Services');
    lines.push('    Services --> Models');
    lines.push('    Services --> Rules');
    lines.push('    Services --> Database');
    lines.push('    Services --> MessageQueue');
    lines.push('    Services --> FileStorage');
    lines.push('    Services --> Email');
    
    return {
      title: 'Layered Architecture',
      type: DiagramType.SYSTEM_OVERVIEW,
      content: lines.join('\n'),
      description: 'System architecture organized by layers following clean architecture principles'
    };
  }

  /**
   * Generate deployment diagram
   */
  private generateDeploymentDiagram(): DiagramSection {
    const lines: string[] = [];
    
    lines.push('graph TB');
    lines.push('    %% Deployment Architecture');
    lines.push('    ');
    
    // Client
    lines.push('    subgraph Client["Client Devices"]');
    lines.push('        style Client fill:#e1f5fe,stroke:#01579b');
    lines.push('        Browser["Web Browser"]');
    lines.push('        Mobile["Mobile App"]');
    lines.push('    end');
    lines.push('    ');
    
    // CDN
    lines.push('    CDN["CDN<br/>(CloudFlare)"]');
    lines.push('    style CDN fill:#f5f5f5,stroke:#616161');
    lines.push('    ');
    
    // Load Balancer
    lines.push('    LB["Load Balancer<br/>(NGINX)"]');
    lines.push('    style LB fill:#ffecb3,stroke:#ff6f00');
    lines.push('    ');
    
    // Application Servers
    lines.push('    subgraph Servers["Application Servers"]');
    lines.push('        style Servers fill:#f3e5f5,stroke:#6a1b9a');
    lines.push('        Server1["Server 1<br/>(Node.js)"]');
    lines.push('        Server2["Server 2<br/>(Node.js)"]');
    lines.push('        Server3["Server 3<br/>(Node.js)"]');
    lines.push('    end');
    lines.push('    ');
    
    // Data Layer
    lines.push('    subgraph Data["Data Layer"]');
    lines.push('        style Data fill:#e8f5e9,stroke:#2e7d32');
    lines.push('        Primary[(Primary DB<br/>PostgreSQL)]');
    lines.push('        Replica[(Read Replica<br/>PostgreSQL)]');
    lines.push('        RedisCache[(Redis Cache)]');
    lines.push('    end');
    lines.push('    ');
    
    // Storage
    lines.push('    S3["Object Storage<br/>(S3/GCS)"]');
    lines.push('    style S3 fill:#fff3e0,stroke:#ef6c00');
    lines.push('    ');
    
    // Connections
    lines.push('    Browser --> CDN');
    lines.push('    Mobile --> CDN');
    lines.push('    CDN --> LB');
    lines.push('    LB --> Server1');
    lines.push('    LB --> Server2');
    lines.push('    LB --> Server3');
    lines.push('    Server1 --> Primary');
    lines.push('    Server2 --> Primary');
    lines.push('    Server3 --> Primary');
    lines.push('    Server1 --> Replica');
    lines.push('    Server2 --> Replica');
    lines.push('    Server3 --> Replica');
    lines.push('    Server1 --> RedisCache');
    lines.push('    Server2 --> RedisCache');
    lines.push('    Server3 --> RedisCache');
    lines.push('    Server1 --> S3');
    lines.push('    Server2 --> S3');
    lines.push('    Server3 --> S3');
    lines.push('    Primary -.->|Replication| Replica');
    
    return {
      title: 'Deployment Architecture',
      type: DiagramType.DEPLOYMENT,
      content: lines.join('\n'),
      description: 'Production deployment architecture showing infrastructure components and their relationships'
    };
  }

  /**
   * Get component icon based on type
   */
  private getComponentIcon(type: ComponentType): string {
    const icons: Record<ComponentType, string> = {
      [ComponentType.SERVICE]: '⚙️',
      [ComponentType.CONTROLLER]: '🎮',
      [ComponentType.COMPONENT]: '🧩',
      [ComponentType.HOOK]: '🪝',
      [ComponentType.UTILITY]: '🔧',
      [ComponentType.MODEL]: '📊',
      [ComponentType.MIDDLEWARE]: '🔌',
      [ComponentType.ROUTE]: '🛣️',
      [ComponentType.CONFIG]: '⚡',
      [ComponentType.LIBRARY]: '📚'
    };
    
    return icons[type] || '📦';
  }

  /**
   * Get component style based on type
   */
  private getComponentStyle(type: ComponentType): string {
    const styles: Record<ComponentType, string> = {
      [ComponentType.SERVICE]: 'fill:#e8f5e9,stroke:#2e7d32',
      [ComponentType.CONTROLLER]: 'fill:#f3e5f5,stroke:#6a1b9a',
      [ComponentType.COMPONENT]: 'fill:#e3f2fd,stroke:#1565c0',
      [ComponentType.HOOK]: 'fill:#e1f5fe,stroke:#0277bd',
      [ComponentType.UTILITY]: 'fill:#fff3e0,stroke:#ef6c00',
      [ComponentType.MODEL]: 'fill:#fce4ec,stroke:#c2185b',
      [ComponentType.MIDDLEWARE]: 'fill:#f5f5f5,stroke:#616161',
      [ComponentType.ROUTE]: 'fill:#ffebee,stroke:#c62828',
      [ComponentType.CONFIG]: 'fill:#fffde7,stroke:#f9a825',
      [ComponentType.LIBRARY]: 'fill:#efebe9,stroke:#4e342e'
    };
    
    return styles[type] || 'fill:#f5f5f5,stroke:#9e9e9e';
  }

  /**
   * Get major external dependencies
   */
  private getMajorExternalDependencies(): string[] {
    const major = [
      'react', 'express', 'prisma', 'axios', 'lodash',
      'moment', 'date-fns', 'zod', 'yup', 'formik',
      '@tanstack/react-query', 'react-router', 'redux',
      'socket.io', 'graphql', 'apollo'
    ];
    
    return Array.from(this.externalDependencies)
      .filter(dep => major.some(m => dep.includes(m)))
      .slice(0, 6);
  }

  /**
   * Check if deployment info is available
   */
  private hasDeploymentInfo(): boolean {
    // Check for Docker, Kubernetes, or deployment config files
    for (const path of this.components.keys()) {
      if (path.includes('docker') || path.includes('k8s') || path.includes('deploy')) {
        return true;
      }
    }
    return false;
  }

  /**
   * Resolve dependency path
   */
  private resolveDependencyPath(fromPath: string, dep: string): string {
    if (dep.startsWith('./')) {
      return path.join(path.dirname(fromPath), dep);
    }
    if (dep.startsWith('../')) {
      return path.join(path.dirname(fromPath), dep);
    }
    return dep;
  }
}

// Export singleton instance
export const architecturePlugin = new ArchitectureDiagramPlugin();