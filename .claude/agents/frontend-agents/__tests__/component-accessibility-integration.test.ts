import * as fs from 'fs/promises';
import { componentDevelopmentAgent } from '../component-development-core';
import { accessibilityCompliance } from '../accessibility-compliance';

// Mock fs and templateEngine
jest.mock('fs/promises');
jest.mock('../../template-engine', () => ({
  templateEngine: {
    saveGeneratedFile: jest.fn().mockResolvedValue(undefined),
    renderTemplate: jest.fn().mockResolvedValue('rendered content'),
    getTemplateVariables: jest.fn().mockReturnValue([])
  }
}));

describe('Component Development with Accessibility Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fs.mkdir as any).mockResolvedValue(undefined);
    (fs.writeFile as any).mockResolvedValue(undefined);
  });

  it('should generate a button component with full accessibility features', async () => {
    const options = {
      name: 'AccessibleButton',
      type: 'atom' as const,
      props: [
        { name: 'label', type: 'string', required: true },
        { name: 'onClick', type: '() => void', required: true },
        { name: 'loading', type: 'boolean', required: false },
        { name: 'disabled', type: 'boolean', required: false }
      ],
      accessibility: {
        ariaLabel: true,
        keyboard: true,
        focusManagement: true
      }
    };

    const result = await componentDevelopmentAgent.generateComponent(options);

    // Check that all files were generated
    expect(result.files).toHaveLength(7); // Including a11y test file
    expect(result.files.some(f => f.includes('AccessibleButton.tsx'))).toBe(true);
    expect(result.files.some(f => f.includes('AccessibleButton.types.ts'))).toBe(true);
    expect(result.files.some(f => f.includes('AccessibleButton.test.tsx'))).toBe(true);
    expect(result.files.some(f => f.includes('AccessibleButton.a11y.test.tsx'))).toBe(true);
    expect(result.files.some(f => f.includes('AccessibleButton.stories.tsx'))).toBe(true);

    // Check that documentation includes accessibility section
    expect(result.documentation).toContain('## Accessibility Features');
    expect(result.documentation).toContain('WCAG 2.1 AA Compliance');
    expect(result.documentation).toContain('Keyboard Navigation');
  });

  it('should enhance modal component with focus trap and keyboard handling', async () => {
    const options = {
      name: 'Modal',
      type: 'molecule' as const,
      props: [
        { name: 'isOpen', type: 'boolean', required: true },
        { name: 'onClose', type: '() => void', required: true },
        { name: 'title', type: 'string', required: true }
      ],
      children: true
    };

    const result = await componentDevelopmentAgent.generateComponent(options);

    // The component should be enhanced with dialog role and focus management
    expect(result.documentation).toContain('role: dialog');
    expect(result.documentation).toContain('focusManagement: true');
    expect(result.documentation).toContain('ariaLabel: true');
  });

  it('should add appropriate ARIA attributes for form components', async () => {
    const options = {
      name: 'FormField',
      type: 'atom' as const,
      props: [
        { name: 'label', type: 'string', required: true },
        { name: 'value', type: 'string', required: true },
        { name: 'onChange', type: '(value: string) => void', required: true },
        { name: 'error', type: 'string', required: false }
      ]
    };

    const result = await componentDevelopmentAgent.generateComponent(options);

    // Check that accessibility props were added
    expect(result.documentation).toContain('ariaLabel');
    expect(result.documentation).toContain('ariaDescribedBy');
  });

  it('should generate navigation component with proper landmarks', async () => {
    const options = {
      name: 'MainNav',
      type: 'organism' as const,
      props: [
        { name: 'items', type: 'NavItem[]', required: true }
      ]
    };

    const result = await componentDevelopmentAgent.generateComponent(options);

    // Navigation components should have navigation role
    expect(result.documentation).toContain('role: navigation');
    expect(result.documentation).toContain('ariaLabel: true');
  });

  it('should generate accessible data table with keyboard navigation', async () => {
    const options = {
      name: 'DataTable',
      type: 'organism' as const,
      props: [
        { name: 'data', type: 'any[]', required: true },
        { name: 'columns', type: 'Column[]', required: true }
      ]
    };

    const result = await componentDevelopmentAgent.generateComponent(options);

    // Tables should have table role and keyboard navigation
    expect(result.documentation).toContain('role: table');
    expect(result.documentation).toContain('keyboard: true');
    expect(result.documentation).toContain('ariaLabel: true');
  });

  it('should handle component without explicit accessibility options', async () => {
    const options = {
      name: 'SimpleText',
      type: 'atom' as const,
      props: [
        { name: 'text', type: 'string', required: true }
      ]
    };

    const result = await componentDevelopmentAgent.generateComponent(options);

    // Even simple components should have basic accessibility
    expect(result.documentation).toContain('ariaLabel: true');
    expect(result.files.some(f => f.includes('.a11y.test.tsx'))).toBe(true);
  });

  it('should generate accessibility tests that check for violations', async () => {
    const options = {
      name: 'Card',
      type: 'molecule' as const,
      props: [
        { name: 'title', type: 'string', required: true },
        { name: 'description', type: 'string', required: false }
      ],
      children: true
    };

    const enhanced = accessibilityCompliance.enhanceComponentWithA11y(options);
    const a11yTests = accessibilityCompliance.generateA11yTests('Card', enhanced);

    expect(a11yTests).toContain('should have no accessibility violations');
    expect(a11yTests).toContain('await axe(container)');
    expect(a11yTests).toContain('expect(results).toHaveNoViolations()');
  });

  it('should generate keyboard event handlers for interactive components', async () => {
    const options = {
      name: 'ToggleSwitch',
      type: 'atom' as const,
      props: [
        { name: 'checked', type: 'boolean', required: true },
        { name: 'onChange', type: '(checked: boolean) => void', required: true }
      ]
    };

    const enhanced = accessibilityCompliance.enhanceComponentWithA11y(options);
    const keyboardNav = accessibilityCompliance.generateKeyboardNavigation(enhanced);

    expect(keyboardNav).toContain('handleKeyDown');
    expect(keyboardNav).toContain('Enter');
    expect(keyboardNav).toContain(' '); // Space character
    expect(enhanced.accessibility?.role).toBe('switch');
  });

  it('should generate focus management for complex components', async () => {
    const options = {
      name: 'Dropdown',
      type: 'molecule' as const,
      props: [
        { name: 'options', type: 'Option[]', required: true },
        { name: 'value', type: 'string', required: false },
        { name: 'onChange', type: '(value: string) => void', required: true }
      ]
    };

    const enhanced = accessibilityCompliance.enhanceComponentWithA11y(options);
    const focusManagement = accessibilityCompliance.generateFocusManagement(enhanced);

    expect(enhanced.accessibility?.role).toBe('menu');
    expect(enhanced.accessibility?.keyboard).toBe(true);
    expect(enhanced.accessibility?.focusManagement).toBe(true);
    expect(focusManagement).toContain('focusableElements');
    expect(focusManagement).toContain('Tab');
  });

  it('should validate color contrast in generated components', async () => {
    const tailwindClasses = 'bg-gray-900 text-white hover:bg-gray-800';
    const validations = accessibilityCompliance.generateColorContrastValidation(tailwindClasses);

    expect(validations).toHaveLength(1);
    expect(validations[0]).toEqual({
      background: 'gray-900',
      foreground: 'white',
      wcagLevel: 'AA'
    });
  });
});