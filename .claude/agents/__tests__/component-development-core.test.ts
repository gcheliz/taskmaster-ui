import { ComponentDevelopmentAgent } from '../frontend-agents/component-development-core';
import * as fs from 'fs/promises';
import * as path from 'path';

// Mock the template engine
jest.mock('../template-engine', () => ({
  templateEngine: {
    saveGeneratedFile: jest.fn(async (content: string, filePath: string) => {
      // Just write the file directly in tests
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, content);
    }),
  },
}));

describe('ComponentDevelopmentAgent', () => {
  const testDir = '/tmp/component-agent-test';
  let agent: ComponentDevelopmentAgent;

  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
    agent = new ComponentDevelopmentAgent(testDir);
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe('generateComponent', () => {
    it('should generate a basic atom component', async () => {
      const result = await agent.generateComponent({
        name: 'TestButton',
        type: 'atom',
        description: 'A test button component',
        props: [
          { name: 'label', type: 'string', required: true },
          { name: 'onClick', type: '() => void', required: true },
        ],
      });

      expect(result.files).toHaveLength(6);
      expect(result.files.some(f => f.endsWith('TestButton.tsx'))).toBe(true);
      expect(result.files.some(f => f.endsWith('TestButton.types.ts'))).toBe(true);
      expect(result.files.some(f => f.endsWith('TestButton.module.css'))).toBe(true);
      expect(result.files.some(f => f.endsWith('TestButton.test.tsx'))).toBe(true);
      expect(result.files.some(f => f.endsWith('index.ts'))).toBe(true);
      expect(result.documentation).toContain('TestButton Component');
    });

    it('should generate a molecule with children', async () => {
      const result = await agent.generateComponent({
        name: 'Card',
        type: 'molecule',
        props: [
          { name: 'title', type: 'string', required: true },
        ],
        children: true,
      });

      const componentFile = result.files.find(f => f.endsWith('Card.tsx'));
      expect(componentFile).toBeDefined();
      
      const content = await fs.readFile(componentFile!, 'utf-8');
      expect(content).toContain('children');
      expect(content).toContain('{children}');
    });

    it('should include accessibility options', async () => {
      const result = await agent.generateComponent({
        name: 'Modal',
        type: 'organism',
        accessibility: {
          ariaLabel: true,
          ariaDescribedBy: true,
          role: 'dialog',
          keyboard: true,
          focusManagement: true,
        },
      });

      const componentFile = result.files.find(f => f.endsWith('Modal.tsx'));
      const content = await fs.readFile(componentFile!, 'utf-8');
      
      expect(content).toContain('aria-label');
      expect(content).toContain('aria-describedby');
      expect(content).toContain('role="dialog"');
    });
  });

  describe('parseCommand', () => {
    it('should parse a basic component command', () => {
      const result = agent.parseCommand('/component Button atom');
      
      expect(result).toEqual({
        name: 'Button',
        type: 'atom',
      });
    });

    it('should parse props from command', () => {
      const result = agent.parseCommand(
        '/component Input atom --props "value:string:required,onChange:()=>void:required,placeholder:string"'
      );
      
      expect(result?.props).toHaveLength(3);
      expect(result?.props?.[0]).toEqual({
        name: 'value',
        type: 'string',
        required: true,
      });
      expect(result?.props?.[2]).toEqual({
        name: 'placeholder',
        type: 'string',
        required: false,
      });
    });

    it('should parse children flag', () => {
      const result = agent.parseCommand('/component Card molecule --children');
      
      expect(result?.children).toBe(true);
    });

    it('should parse accessibility flags', () => {
      const result = agent.parseCommand('/component Modal organism --aria');
      
      expect(result?.accessibility).toEqual({
        ariaLabel: true,
        ariaDescribedBy: true,
        keyboard: true,
        focusManagement: true,
      });
    });
  });

  describe('File organization', () => {
    it('should organize files by atomic type', async () => {
      // Generate components of different types
      await agent.generateComponent({ name: 'Button', type: 'atom' });
      await agent.generateComponent({ name: 'SearchBar', type: 'molecule' });
      await agent.generateComponent({ name: 'Header', type: 'organism' });

      // Check directory structure
      const atomsDir = path.join(testDir, 'packages/frontend/src/components/atoms');
      const moleculesDir = path.join(testDir, 'packages/frontend/src/components/molecules');
      const organismsDir = path.join(testDir, 'packages/frontend/src/components/organisms');

      const atomsExist = await fs.access(atomsDir).then(() => true).catch(() => false);
      const moleculesExist = await fs.access(moleculesDir).then(() => true).catch(() => false);
      const organismsExist = await fs.access(organismsDir).then(() => true).catch(() => false);

      expect(atomsExist).toBe(true);
      expect(moleculesExist).toBe(true);
      expect(organismsExist).toBe(true);
    });
  });
});