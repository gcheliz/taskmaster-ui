/**
 * Storybook Story Generator
 * 
 * Generates Storybook 7+ Component Story Format (CSF) stories
 * with controls, args, and documentation
 */

import { ComponentGenerationOptions, ComponentProp } from './component-development-core';

export interface StoryGenerationOptions {
  component: ComponentGenerationOptions;
  stories?: StoryVariant[];
  decorators?: string[];
  parameters?: Record<string, any>;
  argTypes?: Record<string, ArgTypeConfig>;
}

export interface StoryVariant {
  name: string;
  args: Record<string, any>;
  description?: string;
  play?: string; // Play function code for interaction testing
}

export interface ArgTypeConfig {
  control: {
    type: string;
    options?: string[];
    min?: number;
    max?: number;
    step?: number;
  };
  description?: string;
  defaultValue?: any;
  table?: {
    category?: string;
    subcategory?: string;
    disable?: boolean;
  };
}

export class StorybookGenerator {
  /**
   * Generate a complete Storybook story file
   */
  generateStoryFile(options: StoryGenerationOptions): string {
    const { component } = options;
    const storyPath = this.getStoryPath(component.type, component.name);

    return `import type { Meta, StoryObj } from '@storybook/react';
${this.generateImports(options)}

/**
 * ${component.description || `${component.name} component stories`}
 */
const meta = {
  title: '${storyPath}',
  component: ${component.name},
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '${component.description || `${component.name} ${component.type} component`}',
      },
    },
    ${this.generateParameters(options.parameters)}
  },
  tags: ['autodocs'],
  ${this.generateDecorators(options.decorators)}
  argTypes: {
    ${this.generateArgTypes(component.props, options.argTypes)}
  },
} satisfies Meta<typeof ${component.name}>;

export default meta;
type Story = StoryObj<typeof meta>;

${this.generateDefaultStory(component)}

${this.generateStoryVariants(options.stories || this.generateDefaultVariants(component))}

${this.generatePlaygroundStory(component)}
`;
  }

  /**
   * Generate import statements
   */
  private generateImports(options: StoryGenerationOptions): string {
    const imports: string[] = [
      `import { ${options.component.name} } from '${options.component.name}';`,
    ];

    // Add testing library imports if play functions are used
    if (options.stories?.some(s => s.play)) {
      imports.push("import { within, userEvent, expect } from '@storybook/test';");
    }

    // Add decorator imports
    if (options.decorators?.length) {
      imports.push("import { withTheme } from '@/stories/decorators';");
    }

    return imports.join('\n');
  }

  /**
   * Generate parameters
   */
  private generateParameters(parameters?: Record<string, any>): string {
    if (!parameters) return '';

    return Object.entries(parameters)
      .map(([key, value]) => `${key}: ${JSON.stringify(value, null, 2)}`)
      .join(',\n    ');
  }

  /**
   * Generate decorators
   */
  private generateDecorators(decorators?: string[]): string {
    if (!decorators?.length) return '';

    return `decorators: [${decorators.join(', ')}],\n  `;
  }

  /**
   * Generate argTypes configuration
   */
  private generateArgTypes(props?: ComponentProp[], customArgTypes?: Record<string, ArgTypeConfig>): string {
    if (!props?.length) return '';

    const argTypes = props.map(prop => {
      const customConfig = customArgTypes?.[prop.name];
      const control = customConfig?.control || this.inferControl(prop.type);
      
      return `${prop.name}: {
      ${prop.description ? `description: '${prop.description}',` : ''}
      control: ${JSON.stringify(control)},
      ${prop.defaultValue ? `defaultValue: ${prop.defaultValue},` : ''}
      ${customConfig?.table ? `table: ${JSON.stringify(customConfig.table)},` : ''}
    }`;
    }).join(',\n    ');

    // Add children control if component supports children
    const childrenArgType = customArgTypes?.children ? `children: {
      description: 'Component children',
      control: { type: 'text' },
      table: { category: 'Content' },
    },` : '';

    return argTypes + (childrenArgType ? ',\n    ' + childrenArgType : '');
  }

  /**
   * Infer control type from prop type
   */
  private inferControl(type: string): { type: string; options?: string[] } {
    // Handle union types (e.g., 'small' | 'medium' | 'large')
    if (type.includes('|')) {
      const options = type
        .split('|')
        .map(t => t.trim().replace(/['"]/g, ''))
        .filter(t => t !== '');
      return { type: 'select', options };
    }

    // Handle specific types
    const typeMap: Record<string, { type: string }> = {
      'string': { type: 'text' },
      'number': { type: 'number' },
      'boolean': { type: 'boolean' },
      'Date': { type: 'date' },
      '() => void': { type: 'action' },
      'React.ReactNode': { type: 'text' },
    };

    return typeMap[type] || { type: 'object' };
  }

  /**
   * Generate default story
   */
  private generateDefaultStory(component: ComponentGenerationOptions): string {
    const defaultArgs = this.generateDefaultArgs(component);
    
    return `/**
 * Default ${component.name} story
 */
export const Default: Story = {
  args: {
    ${defaultArgs}
  },
};`;
  }

  /**
   * Generate default args
   */
  private generateDefaultArgs(component: ComponentGenerationOptions): string {
    const args: string[] = [];

    component.props?.forEach(prop => {
      if (prop.defaultValue) {
        args.push(`${prop.name}: ${prop.defaultValue}`);
      } else if (prop.required) {
        args.push(`${prop.name}: ${this.getDefaultValue(prop.type, prop.name)}`);
      }
    });

    if (component.children) {
      args.push(`children: 'Example content'`);
    }

    return args.join(',\n    ');
  }

  /**
   * Get default value for a type
   */
  private getDefaultValue(type: string, name: string): string {
    if (type.includes('|')) {
      const firstOption = type.split('|')[0].trim().replace(/['"]/g, '');
      return `'${firstOption}'`;
    }

    const defaultMap: Record<string, string> = {
      'string': `'Example ${name}'`,
      'number': '42',
      'boolean': 'true',
      '() => void': '() => console.log("Clicked")',
      'React.ReactNode': '<span>Content</span>',
    };

    return defaultMap[type] || 'undefined';
  }

  /**
   * Generate default story variants
   */
  private generateDefaultVariants(component: ComponentGenerationOptions): StoryVariant[] {
    const variants: StoryVariant[] = [];

    // Add size variants if size prop exists
    const sizeProp = component.props?.find(p => p.name === 'size');
    if (sizeProp && sizeProp.type.includes('|')) {
      const sizes = sizeProp.type.split('|').map(s => s.trim().replace(/['"]/g, ''));
      sizes.forEach(size => {
        variants.push({
          name: `Size${size.charAt(0).toUpperCase() + size.slice(1)}`,
          args: { size },
          description: `${component.name} with ${size} size`,
        });
      });
    }

    // Add variant variants if variant prop exists
    const variantProp = component.props?.find(p => p.name === 'variant');
    if (variantProp && variantProp.type.includes('|')) {
      const variantTypes = variantProp.type.split('|').map(v => v.trim().replace(/['"]/g, ''));
      variantTypes.forEach(variant => {
        variants.push({
          name: `Variant${variant.charAt(0).toUpperCase() + variant.slice(1)}`,
          args: { variant },
          description: `${component.name} with ${variant} variant`,
        });
      });
    }

    // Add disabled state if applicable
    if (component.props?.some(p => p.name === 'disabled')) {
      variants.push({
        name: 'Disabled',
        args: { disabled: true },
        description: `${component.name} in disabled state`,
      });
    }

    // Add loading state if applicable
    if (component.props?.some(p => p.name === 'loading')) {
      variants.push({
        name: 'Loading',
        args: { loading: true },
        description: `${component.name} in loading state`,
      });
    }

    return variants;
  }

  /**
   * Generate story variants
   */
  private generateStoryVariants(variants: StoryVariant[]): string {
    return variants.map(variant => {
      const playFunction = variant.play ? `
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    ${variant.play}
  },` : '';

      return `/**
 * ${variant.description || variant.name}
 */
export const ${variant.name}: Story = {
  args: {
    ...Default.args,
    ${Object.entries(variant.args).map(([key, value]) => 
      `${key}: ${typeof value === 'string' ? `'${value}'` : JSON.stringify(value)}`
    ).join(',\n    ')},
  },${playFunction}
};`;
    }).join('\n\n');
  }

  /**
   * Generate playground story for experimentation
   */
  private generatePlaygroundStory(component: ComponentGenerationOptions): string {
    return `/**
 * Playground story for experimenting with ${component.name}
 */
export const Playground: Story = {
  args: {
    ...Default.args,
  },
  parameters: {
    docs: {
      description: {
        story: 'Use the controls below to experiment with different prop combinations.',
      },
    },
  },
};`;
  }

  /**
   * Get story path based on atomic design type
   */
  private getStoryPath(type: string, name: string): string {
    const typeCapitalized = type.charAt(0).toUpperCase() + type.slice(1) + 's';
    return `${typeCapitalized}/${name}`;
  }

  /**
   * Generate interaction test for a story
   */
  generateInteractionTest(_componentName: string, interactions: {
    action: 'click' | 'type' | 'hover' | 'focus';
    target: string;
    value?: string;
    assertion?: string;
  }[]): string {
    const steps = interactions.map(interaction => {
      switch (interaction.action) {
        case 'click':
          return `await userEvent.click(canvas.getByRole('${interaction.target}'));`;
        case 'type':
          return `await userEvent.type(canvas.getByRole('${interaction.target}'), '${interaction.value}');`;
        case 'hover':
          return `await userEvent.hover(canvas.getByRole('${interaction.target}'));`;
        case 'focus':
          return `canvas.getByRole('${interaction.target}').focus();`;
        default:
          return '';
      }
    });

    const assertions = interactions
      .filter(i => i.assertion)
      .map(i => `await expect(${i.assertion}).toBeTruthy();`);

    return [...steps, ...assertions].join('\n    ');
  }
}

export const storybookGenerator = new StorybookGenerator();