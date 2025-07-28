import { ComponentDevelopmentAgent } from '../frontend-agents/component-development-core';
import { tailwindIntegration } from '../frontend-agents/tailwind-integration';
import * as fs from 'fs/promises';
import * as path from 'path';

// Mock the template engine
jest.mock('../template-engine', () => ({
  templateEngine: {
    saveGeneratedFile: jest.fn(async (content: string, filePath: string) => {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, content);
    }),
  },
}));

describe('Tailwind CSS and Storybook Integration', () => {
  const testDir = '/tmp/tailwind-storybook-test';
  let agent: ComponentDevelopmentAgent;

  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
    agent = new ComponentDevelopmentAgent(testDir);
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe('Tailwind CSS Integration', () => {
    it('should generate button with Tailwind classes', async () => {
      const result = await agent.generateComponent({
        name: 'PrimaryButton',
        type: 'atom',
        props: [
          { name: 'label', type: 'string', required: true },
          { name: 'onClick', type: '() => void', required: true },
        ],
        styling: {
          variant: 'primary',
          size: 'md',
          rounded: true,
        },
      });

      const componentFile = result.files.find(f => f.endsWith('PrimaryButton.tsx'));
      const content = await fs.readFile(componentFile!, 'utf-8');
      
      expect(content).toContain('import { cn }');
      expect(content).toContain('className={cn(');
      expect(content).toContain('bg-blue-600');
      expect(content).toContain('hover:bg-blue-700');
      expect(content).toContain('rounded-full');
    });

    it('should generate card with elevation', async () => {
      const result = await agent.generateComponent({
        name: 'InfoCard',
        type: 'molecule',
        children: true,
        styling: {
          elevation: 2,
        },
      });

      const componentFile = result.files.find(f => f.endsWith('InfoCard.tsx'));
      const content = await fs.readFile(componentFile!, 'utf-8');
      
      expect(content).toContain('shadow');
      expect(content).toContain('bg-white');
      expect(content).toContain('dark:bg-gray-800');
    });
  });

  describe('Storybook Story Generation', () => {
    it('should generate comprehensive Storybook story', async () => {
      const result = await agent.generateComponent({
        name: 'ActionButton',
        type: 'atom',
        props: [
          { name: 'label', type: 'string', required: true },
          { name: 'onClick', type: '() => void', required: true },
          { name: 'variant', type: "'primary' | 'secondary' | 'danger'", required: false },
          { name: 'size', type: "'sm' | 'md' | 'lg'", required: false },
          { name: 'disabled', type: 'boolean', required: false },
        ],
      });

      const storyFile = result.files.find(f => f.endsWith('ActionButton.stories.tsx'));
      const content = await fs.readFile(storyFile!, 'utf-8');
      
      // Check story structure
      expect(content).toContain("import type { Meta, StoryObj } from '@storybook/react'");
      expect(content).toContain('export default meta');
      expect(content).toContain('export const Default: Story');
      
      // Check argTypes generation
      expect(content).toContain('argTypes: {');
      expect(content).toContain("control: {\"type\":\"select\",\"options\":[\"primary\",\"secondary\",\"danger\"]}");
      
      // Check auto-generated variants
      expect(content).toContain('export const VariantPrimary: Story');
      expect(content).toContain('export const VariantSecondary: Story');
      expect(content).toContain('export const Disabled: Story');
      expect(content).toContain('export const Playground: Story');
    });

    it('should generate story with custom stories', async () => {
      const result = await agent.generateComponent({
        name: 'LoginForm',
        type: 'organism',
        stories: [
          {
            name: 'WithError',
            args: { error: 'Invalid credentials' },
            description: 'Login form showing error state',
          },
          {
            name: 'Loading',
            args: { isLoading: true },
            description: 'Login form in loading state',
          },
        ],
      });

      const storyFile = result.files.find(f => f.endsWith('LoginForm.stories.tsx'));
      const content = await fs.readFile(storyFile!, 'utf-8');
      
      expect(content).toContain('export const WithError: Story');
      expect(content).toContain("error: 'Invalid credentials'");
      expect(content).toContain('export const Loading: Story');
      expect(content).toContain('isLoading: true');
    });
  });

  describe('Tailwind Helper Functions', () => {
    it('should generate correct button classes', () => {
      const classes = tailwindIntegration.generateButtonClasses({
        variant: 'primary',
        size: 'lg',
        fullWidth: true,
      });

      expect(classes).toContain('bg-blue-600');
      expect(classes).toContain('px-5 py-2.5');
      expect(classes).toContain('w-full');
    });

    it('should generate responsive grid classes', () => {
      const classes = tailwindIntegration.generateGridClasses(
        { sm: 1, md: 2, lg: 3 },
        '4'
      );

      expect(classes).toContain('grid');
      expect(classes).toContain('sm:grid-cols-1');
      expect(classes).toContain('md:grid-cols-2');
      expect(classes).toContain('lg:grid-cols-3');
      expect(classes).toContain('gap-4');
    });
  });

  describe('Complete Component Generation', () => {
    it('should generate a fully styled component with story', async () => {
      const result = await agent.generateComponent({
        name: 'FeatureCard',
        type: 'molecule',
        description: 'Card component for displaying features',
        props: [
          { name: 'title', type: 'string', required: true },
          { name: 'description', type: 'string', required: true },
          { name: 'icon', type: 'React.ReactNode', required: false },
          { name: 'highlighted', type: 'boolean', required: false },
        ],
        children: true,
        styling: {
          elevation: 2,
          rounded: true,
        },
        accessibility: {
          role: 'article',
          ariaLabel: true,
        },
      });

      // Check all files were created
      expect(result.files).toHaveLength(6);
      
      // Check component includes Tailwind styling
      const componentFile = result.files.find(f => f.endsWith('FeatureCard.tsx'));
      const componentContent = await fs.readFile(componentFile!, 'utf-8');
      expect(componentContent).toContain('className={cn(');
      expect(componentContent).toContain('rounded-lg');
      
      // Check story includes proper controls
      const storyFile = result.files.find(f => f.endsWith('FeatureCard.stories.tsx'));
      const storyContent = await fs.readFile(storyFile!, 'utf-8');
      expect(storyContent).toContain('title: \'Molecules/FeatureCard\'');
      expect(storyContent).toContain('argTypes:');
      expect(storyContent).toContain('control:');
    });
  });
});