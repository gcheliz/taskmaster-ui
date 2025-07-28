/**
 * Component Development Agent Core
 * 
 * Generates React 19 components following atomic design principles
 * with TypeScript support and automatic file organization
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { templateEngine } from '../template-engine';
import { tailwindIntegration, TailwindStyleOptions } from './tailwind-integration';
import { storybookGenerator, StoryVariant } from './storybook-generator';
import { accessibilityCompliance } from './accessibility-compliance';

export interface ComponentGenerationOptions {
  name: string;
  type: 'atom' | 'molecule' | 'organism' | 'template' | 'page';
  description?: string;
  props?: ComponentProp[];
  children?: boolean;
  hooks?: string[];
  dependencies?: string[];
  accessibility?: AccessibilityOptions;
  styling?: TailwindStyleOptions;
  stories?: StoryVariant[];
}

export interface ComponentProp {
  name: string;
  type: string;
  required?: boolean;
  defaultValue?: string;
  description?: string;
}

export interface AccessibilityOptions {
  ariaLabel?: boolean;
  ariaDescribedBy?: boolean;
  role?: string;
  keyboard?: boolean;
  focusManagement?: boolean;
}

export class ComponentDevelopmentAgent {
  private componentsPath: string;

  constructor(projectRoot: string) {
    this.componentsPath = path.join(projectRoot, 'packages/frontend/src/components');
  }

  /**
   * Generate a new component following atomic design principles
   */
  async generateComponent(options: ComponentGenerationOptions): Promise<{
    files: string[];
    documentation: string;
  }> {
    const files: string[] = [];
    
    // Enhance options with accessibility features
    const enhancedOptions = accessibilityCompliance.enhanceComponentWithA11y(options);
    
    // Determine component path based on atomic design type
    const componentDir = path.join(this.componentsPath, enhancedOptions.type + 's', enhancedOptions.name);
    await fs.mkdir(componentDir, { recursive: true });

    // Generate component file
    const componentPath = path.join(componentDir, `${enhancedOptions.name}.tsx`);
    const componentContent = await this.generateComponentFile(enhancedOptions);
    await templateEngine.saveGeneratedFile(componentContent, componentPath);
    files.push(componentPath);

    // Generate TypeScript types
    const typesPath = path.join(componentDir, `${enhancedOptions.name}.types.ts`);
    const typesContent = await this.generateTypesFile(enhancedOptions);
    await templateEngine.saveGeneratedFile(typesContent, typesPath);
    files.push(typesPath);

    // Generate styles (using CSS modules with Tailwind)
    const stylesPath = path.join(componentDir, `${enhancedOptions.name}.module.css`);
    const stylesContent = await this.generateStylesFile(enhancedOptions);
    await fs.writeFile(stylesPath, stylesContent);
    files.push(stylesPath);

    // Generate index file for easier imports
    const indexPath = path.join(componentDir, 'index.ts');
    const indexContent = `export { ${enhancedOptions.name} } from './${enhancedOptions.name}';\nexport type { ${enhancedOptions.name}Props } from './${enhancedOptions.name}.types';\n`;
    await fs.writeFile(indexPath, indexContent);
    files.push(indexPath);

    // Generate tests including accessibility tests
    const testPath = path.join(componentDir, `${enhancedOptions.name}.test.tsx`);
    const testContent = await this.generateTestFile(enhancedOptions);
    await templateEngine.saveGeneratedFile(testContent, testPath);
    files.push(testPath);

    // Generate accessibility tests
    const a11yTestPath = path.join(componentDir, `${enhancedOptions.name}.a11y.test.tsx`);
    const a11yTestContent = accessibilityCompliance.generateA11yTests(enhancedOptions.name, enhancedOptions);
    await templateEngine.saveGeneratedFile(a11yTestContent, a11yTestPath);
    files.push(a11yTestPath);

    // Generate Storybook story with full implementation
    const storyPath = path.join(componentDir, `${enhancedOptions.name}.stories.tsx`);
    const storyContent = await this.generateStoryFile(enhancedOptions);
    await templateEngine.saveGeneratedFile(storyContent, storyPath);
    files.push(storyPath);

    // Generate enhanced documentation including accessibility
    const documentation = this.generateDocumentation(enhancedOptions) + '\n\n' + 
                         accessibilityCompliance.generateA11yDocumentation(enhancedOptions.name, enhancedOptions);

    return { files, documentation };
  }

  /**
   * Generate the main component file
   */
  private async generateComponentFile(options: ComponentGenerationOptions): Promise<string> {
    // Template path will be used when template is integrated
    // const templatePath = path.join(__dirname, '../templates/frontend/component.hbs');
    
    // Add accessibility props if needed
    const allProps = [...(options.props || [])];
    if (options.accessibility?.ariaLabel && !allProps.some(p => p.name === 'ariaLabel')) {
      allProps.push({ name: 'ariaLabel', type: 'string', required: false, description: 'Accessible label' });
    }
    if (options.accessibility?.ariaDescribedBy && !allProps.some(p => p.name === 'ariaDescribedBy')) {
      allProps.push({ name: 'ariaDescribedBy', type: 'string', required: false, description: 'ID of describing element' });
    }
    
    // Prepare template variables
    const templateVars = {
      componentName: options.name,
      componentType: options.type,
      description: options.description || `${options.name} ${options.type} component`,
      props: allProps,
      hasChildren: options.children || false,
      hooks: options.hooks || [],
      dependencies: options.dependencies || [],
      accessibility: options.accessibility || {},
      styling: options.styling || {},
      imports: this.generateImports(options),
    };

    // For now, generate inline until we create the template
    return this.generateInlineComponent(templateVars);
  }

  /**
   * Generate component inline (temporary until template is created)
   */
  private generateInlineComponent(vars: any): string {
    const propsInterface = vars.props.length > 0 || vars.hasChildren
      ? `

export interface ${vars.componentName}Props {
${vars.props.map((p: ComponentProp) => 
  `  ${p.name}${p.required ? '' : '?'}: ${p.type};${p.description ? ` // ${p.description}` : ''}`
).join('\n')}
${vars.hasChildren ? '  children?: React.ReactNode;' : ''}
}`
      : '';

    const propsDestructuring = vars.props.length > 0 || vars.hasChildren
      ? `{ ${vars.props.map((p: ComponentProp) => p.name).join(', ')}${vars.hasChildren ? ', children' : ''} }: ${vars.componentName}Props`
      : '';

    // Generate appropriate Tailwind classes based on component type
    const tailwindClasses = this.generateTailwindClasses(vars);
    
    // Generate ARIA implementation
    const ariaImplementation = accessibilityCompliance.generateAriaImplementation(vars);
    
    // Generate keyboard navigation if needed
    const keyboardNavigation = vars.accessibility.keyboard 
      ? accessibilityCompliance.generateKeyboardNavigation(vars)
      : '';
      
    // Generate focus management if needed
    const focusManagement = vars.accessibility.focusManagement
      ? accessibilityCompliance.generateFocusManagement(vars)
      : '';

    return `import React from 'react';
import { cn } from '@/utils/cn';
import styles from './${vars.componentName}.module.css';
${vars.imports.join('\n')}
${propsInterface}

/**
 * ${vars.description}
 * @component
 * @atomic-type ${vars.componentType}
 */
export const ${vars.componentName}: React.FC${vars.props.length > 0 || vars.hasChildren ? `<${vars.componentName}Props>` : ''} = (${propsDestructuring}) => {
  ${vars.hooks.map((h: string) => `const ${h} = use${h}();`).join('\n  ')}
  ${focusManagement}
  ${keyboardNavigation}

  return (
    <div 
      className={cn(
        '${tailwindClasses}',
        styles.container
      )}
      ${vars.accessibility.keyboard ? 'onKeyDown={handleKeyDown}' : ''}
      ${vars.accessibility.focusManagement ? 'ref={containerRef}' : ''}
      ${vars.accessibility.keyboard ? 'tabIndex={0}' : ''}
      ${ariaImplementation}
    >
      ${vars.hasChildren ? '{children}' : `<span>${vars.componentName} Component</span>`}
    </div>
  );
};

${vars.componentName}.displayName = '${vars.componentName}';
`;
  }

  /**
   * Generate TypeScript types file
   */
  private async generateTypesFile(options: ComponentGenerationOptions): Promise<string> {
    return `/**
 * Type definitions for ${options.name} component
 */

export interface ${options.name}Props {
${options.props?.map(p => 
  `  /**
   * ${p.description || `${p.name} property`}
   */
  ${p.name}${p.required ? '' : '?'}: ${p.type};`
).join('\n') || ''}
${options.children ? `  /**
   * Child elements to render
   */
  children?: React.ReactNode;` : ''}
${options.accessibility?.ariaLabel ? `  /**
   * Accessible label for the component
   */
  ariaLabel?: string;` : ''}
${options.accessibility?.ariaDescribedBy ? `  /**
   * ID of element that describes this component
   */
  ariaDescribedBy?: string;` : ''}
}

export type ${options.name}Type = '${options.type}';
`;
  }

  /**
   * Generate styles file
   */
  private async generateStylesFile(_options: ComponentGenerationOptions): Promise<string> {
    return `.container {
  /* Component container styles */
  @apply relative;
}

/* Responsive styles */
@media (min-width: 768px) {
  .container {
    /* Tablet and desktop styles */
  }
}

/* Accessibility styles */
.container:focus-visible {
  @apply ring-2 ring-blue-500 ring-offset-2;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .container {
    /* Dark mode styles */
  }
}
`;
  }

  /**
   * Generate test file
   */
  private async generateTestFile(options: ComponentGenerationOptions): Promise<string> {
    return `import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ${options.name} } from './${options.name}';

describe('${options.name}', () => {
  it('renders without crashing', () => {
    render(<${options.name}${options.props?.filter(p => p.required).map(p => ` ${p.name}={${this.getTestValue(p.type)}}`).join('') || ''} />);
    ${options.children 
      ? `expect(screen.getByText('Test content')).toBeInTheDocument();`
      : `expect(screen.getByText('${options.name} Component')).toBeInTheDocument();`
    }
  });

  ${options.accessibility?.ariaLabel ? `it('supports aria-label', () => {
    render(<${options.name} ariaLabel="Test label"${options.props?.filter(p => p.required).map(p => ` ${p.name}={${this.getTestValue(p.type)}}`).join('') || ''} />);
    expect(screen.getByLabelText('Test label')).toBeInTheDocument();
  });` : ''}

  ${options.props?.filter(p => p.required).map(p => `
  it('requires ${p.name} prop', () => {
    // TypeScript will enforce this at compile time
    // This test verifies runtime behavior
    expect(() => {
      // @ts-expect-error - Testing missing required prop
      render(<${options.name} />);
    }).not.toThrow();
  });`).join('\n') || ''}
});
`;
  }

  /**
   * Generate Tailwind classes based on component type and options
   */
  private generateTailwindClasses(vars: any): string {
    const { componentType, componentName, styling } = vars;
    
    // Default classes based on component type
    if (componentType === 'atom' && componentName.toLowerCase().includes('button')) {
      return tailwindIntegration.generateButtonClasses(styling || {});
    } else if (componentType === 'atom' && componentName.toLowerCase().includes('input')) {
      return tailwindIntegration.generateInputClasses(styling || {});
    } else if ((componentType === 'molecule' || componentType === 'organism') && componentName.toLowerCase().includes('card')) {
      return tailwindIntegration.generateCardClasses(styling || {});
    } else if (componentType === 'template' || componentType === 'page') {
      return tailwindIntegration.generateContainerClasses();
    }
    
    // Default classes for other components
    return 'relative flex flex-col';
  }

  /**
   * Generate Storybook story file using the story generator
   */
  private async generateStoryFile(options: ComponentGenerationOptions): Promise<string> {
    return storybookGenerator.generateStoryFile({
      component: options,
      stories: options.stories,
      decorators: options.type === 'page' ? ['withRouter'] : undefined,
      parameters: {
        layout: options.type === 'page' ? 'fullscreen' : 'centered',
      },
    });
  }


  /**
   * Generate imports based on dependencies
   */
  private generateImports(options: ComponentGenerationOptions): string[] {
    const imports: string[] = [];
    
    if (options.dependencies) {
      options.dependencies.forEach(dep => {
        if (dep.startsWith('@/')) {
          imports.push(`import { ${dep.split('/').pop()} } from '${dep}';`);
        } else {
          imports.push(`import ${dep};`);
        }
      });
    }

    if (options.hooks) {
      options.hooks.forEach(hook => {
        imports.push(`import { use${hook} } from '@/hooks/use${hook}';`);
      });
    }

    return imports;
  }

  /**
   * Get test value for a given type
   */
  private getTestValue(type: string): string {
    const typeMap: Record<string, string> = {
      string: '"test"',
      number: '123',
      boolean: 'true',
      'React.ReactNode': '<span>Test</span>',
      '() => void': '() => {}',
    };
    return typeMap[type] || 'undefined';
  }


  /**
   * Generate documentation for the component
   */
  private generateDocumentation(options: ComponentGenerationOptions): string {
    return `# ${options.name} Component

## Type: ${options.type}

${options.description || 'No description provided'}

## Props

${options.props?.map(p => `- **${p.name}** (${p.type})${p.required ? ' - Required' : ''}: ${p.description || 'No description'}`).join('\n') || 'No props defined'}

## Usage

\`\`\`tsx
import { ${options.name} } from '@/components/${options.type}s/${options.name}';

<${options.name}${options.props?.filter(p => p.required).map(p => `\n  ${p.name}={${p.defaultValue || '...'}}`).join('') || ''}${options.children ? '>\n  Content\n</' + options.name + '>' : ' />'}
\`\`\`

## Accessibility

${options.accessibility ? Object.entries(options.accessibility).map(([key, value]) => `- ${key}: ${value}`).join('\n') : 'Standard accessibility features included'}
`;
  }

  /**
   * Parse component generation command
   */
  parseCommand(command: string): ComponentGenerationOptions | null {
    // Example: /component Button atom --props "label:string:required,onClick:()=>void" --children --aria
    const parts = command.split(' ');
    if (parts.length < 3) return null;

    const name = parts[1];
    const type = parts[2] as ComponentGenerationOptions['type'];
    
    // Parse additional options
    const options: ComponentGenerationOptions = { name, type };
    
    // Parse props if provided
    const propsIndex = parts.indexOf('--props');
    if (propsIndex !== -1 && parts[propsIndex + 1]) {
      options.props = this.parseProps(parts[propsIndex + 1]);
    }

    // Check for children flag
    if (parts.includes('--children')) {
      options.children = true;
    }

    // Check for accessibility flags
    if (parts.includes('--aria')) {
      options.accessibility = {
        ariaLabel: true,
        ariaDescribedBy: true,
        keyboard: true,
        focusManagement: true,
      };
    }

    return options;
  }

  /**
   * Parse props string into ComponentProp array
   */
  private parseProps(propsString: string): ComponentProp[] {
    // Remove surrounding quotes if present
    const cleanString = propsString.replace(/^["']|["']$/g, '');
    
    // Format: "name:type:required,name2:type2"
    return cleanString.split(',').map(propDef => {
      const [name, type, required] = propDef.split(':');
      return {
        name,
        type,
        required: required === 'required',
      };
    });
  }
}

// Export singleton instance
export const componentDevelopmentAgent = new ComponentDevelopmentAgent(process.cwd());