import { accessibilityCompliance } from '../accessibility-compliance';
import { ComponentGenerationOptions } from '../component-development-core';

describe('AccessibilityCompliance', () => {
  describe('enhanceComponentWithA11y', () => {
    it('should add ARIA attributes for button components', () => {
      const options: ComponentGenerationOptions = {
        name: 'SubmitButton',
        type: 'atom',
        props: [
          { name: 'onClick', type: '() => void', required: true }
        ]
      };

      const enhanced = accessibilityCompliance.enhanceComponentWithA11y(options);

      expect(enhanced.accessibility?.role).toBe('button');
      expect(enhanced.accessibility?.ariaLabel).toBe(true);
      expect(enhanced.accessibility?.keyboard).toBe(true);
      expect(enhanced.accessibility?.focusManagement).toBe(true);
    });

    it('should add appropriate attributes for input components', () => {
      const options: ComponentGenerationOptions = {
        name: 'TextField',
        type: 'atom',
        props: [
          { name: 'value', type: 'string', required: true },
          { name: 'onChange', type: '(value: string) => void', required: true }
        ]
      };

      const enhanced = accessibilityCompliance.enhanceComponentWithA11y(options);

      expect(enhanced.accessibility?.ariaLabel).toBe(true);
      expect(enhanced.accessibility?.ariaDescribedBy).toBe(true);
      expect(enhanced.accessibility?.keyboard).toBe(true);
    });

    it('should add focus management for modal components', () => {
      const options: ComponentGenerationOptions = {
        name: 'Modal',
        type: 'molecule',
        props: [
          { name: 'isOpen', type: 'boolean', required: true },
          { name: 'onClose', type: '() => void', required: true }
        ]
      };

      const enhanced = accessibilityCompliance.enhanceComponentWithA11y(options);

      expect(enhanced.accessibility?.role).toBe('dialog');
      expect(enhanced.accessibility?.focusManagement).toBe(true);
      expect(enhanced.accessibility?.keyboard).toBe(true);
    });

    it('should add a11y props to component props', () => {
      const options: ComponentGenerationOptions = {
        name: 'Card',
        type: 'molecule',
        props: []
      };

      const enhanced = accessibilityCompliance.enhanceComponentWithA11y(options);

      expect(enhanced.props?.some(p => p.name === 'ariaLabel')).toBe(true);
      const ariaLabelProp = enhanced.props?.find(p => p.name === 'ariaLabel');
      expect(ariaLabelProp?.required).toBe(false);
      expect(ariaLabelProp?.description).toBe('Accessible label for screen readers');
    });
  });

  describe('generateA11yTests', () => {
    it('should generate accessibility test suite', () => {
      const options: ComponentGenerationOptions = {
        name: 'Button',
        type: 'atom',
        props: [
          { name: 'onClick', type: '() => void', required: true }
        ],
        accessibility: {
          ariaLabel: true,
          keyboard: true,
          role: 'button'
        }
      };

      const tests = accessibilityCompliance.generateA11yTests('Button', options);

      expect(tests).toContain('import { axe, toHaveNoViolations } from \'jest-axe\'');
      expect(tests).toContain('should have no accessibility violations');
      expect(tests).toContain('Keyboard Navigation');
      expect(tests).toContain('Screen Reader Support');
      expect(tests).toContain('should be focusable with Tab key');
    });

    it('should include loading state tests when applicable', () => {
      const options: ComponentGenerationOptions = {
        name: 'LoadingButton',
        type: 'atom',
        props: [
          { name: 'loading', type: 'boolean', required: false }
        ],
        accessibility: {
          ariaLabel: true
        }
      };

      const tests = accessibilityCompliance.generateA11yTests('LoadingButton', options);

      expect(tests).toContain('should announce loading state');
      expect(tests).toContain('aria-busy');
    });

    it('should include error state tests when applicable', () => {
      const options: ComponentGenerationOptions = {
        name: 'FormField',
        type: 'atom',
        props: [
          { name: 'error', type: 'string', required: false }
        ],
        accessibility: {
          ariaLabel: true
        }
      };

      const tests = accessibilityCompliance.generateA11yTests('FormField', options);

      expect(tests).toContain('aria-invalid');
      expect(tests).toContain('aria-errormessage');
    });
  });

  describe('generateAriaImplementation', () => {
    it('should generate ARIA attributes for expanded state', () => {
      const options: ComponentGenerationOptions = {
        name: 'Accordion',
        type: 'molecule',
        props: [
          { name: 'expanded', type: 'boolean', required: false }
        ],
        accessibility: {
          ariaLabel: true
        }
      };

      const aria = accessibilityCompliance.generateAriaImplementation(options);

      expect(aria).toContain('aria-expanded={expanded}');
    });

    it('should generate ARIA attributes for disabled state', () => {
      const options: ComponentGenerationOptions = {
        name: 'Button',
        type: 'atom',
        props: [
          { name: 'disabled', type: 'boolean', required: false }
        ],
        accessibility: {
          ariaLabel: true
        }
      };

      const aria = accessibilityCompliance.generateAriaImplementation(options);

      expect(aria).toContain('aria-disabled={disabled}');
    });

    it('should generate ARIA attributes for error state', () => {
      const options: ComponentGenerationOptions = {
        name: 'Input',
        type: 'atom',
        props: [
          { name: 'error', type: 'string', required: false }
        ],
        accessibility: {
          ariaLabel: true
        }
      };

      const aria = accessibilityCompliance.generateAriaImplementation(options);

      expect(aria).toContain('aria-invalid={!!error}');
      expect(aria).toContain('aria-errormessage={error ? errorId : undefined}');
    });
  });

  describe('generateKeyboardNavigation', () => {
    it('should generate keyboard handlers for interactive components', () => {
      const options: ComponentGenerationOptions = {
        name: 'Button',
        type: 'atom',
        props: [
          { name: 'onClick', type: '() => void', required: true }
        ],
        accessibility: {
          keyboard: true
        }
      };

      const keyboard = accessibilityCompliance.generateKeyboardNavigation(options);

      expect(keyboard).toContain('handleKeyDown');
      expect(keyboard).toContain('case \'Enter\'');
      expect(keyboard).toContain('case \' \'');
      expect(keyboard).toContain('onClick?.()');
    });

    it('should handle escape key when onClose is present', () => {
      const options: ComponentGenerationOptions = {
        name: 'Modal',
        type: 'molecule',
        props: [
          { name: 'onClose', type: '() => void', required: true }
        ],
        accessibility: {
          keyboard: true
        }
      };

      const keyboard = accessibilityCompliance.generateKeyboardNavigation(options);

      expect(keyboard).toContain('case \'Escape\'');
      expect(keyboard).toContain('onClose?.()');
    });

    it('should return empty string when keyboard support is disabled', () => {
      const options: ComponentGenerationOptions = {
        name: 'Text',
        type: 'atom',
        props: [],
        accessibility: {}
      };

      const keyboard = accessibilityCompliance.generateKeyboardNavigation(options);

      expect(keyboard).toBe('');
    });
  });

  describe('generateFocusManagement', () => {
    it('should generate focus trap for modal-like components', () => {
      const options: ComponentGenerationOptions = {
        name: 'Dialog',
        type: 'molecule',
        props: [],
        accessibility: {
          focusManagement: true
        }
      };

      const focus = accessibilityCompliance.generateFocusManagement(options);

      expect(focus).toContain('containerRef');
      expect(focus).toContain('focusableElements');
      expect(focus).toContain('handleTabKey');
      expect(focus).toContain('firstFocusable');
      expect(focus).toContain('lastFocusable');
    });

    it('should return empty string when focus management is disabled', () => {
      const options: ComponentGenerationOptions = {
        name: 'Text',
        type: 'atom',
        props: [],
        accessibility: {}
      };

      const focus = accessibilityCompliance.generateFocusManagement(options);

      expect(focus).toBe('');
    });
  });

  describe('generateScreenReaderAnnouncements', () => {
    it('should generate loading announcements', () => {
      const options: ComponentGenerationOptions = {
        name: 'LoadingPanel',
        type: 'molecule',
        props: [
          { name: 'loading', type: 'boolean', required: false }
        ]
      };

      const announcements = accessibilityCompliance.generateScreenReaderAnnouncements(options);

      expect(announcements).toContain('announce(\'Loading, please wait...\')');
      expect(announcements).toContain('announce(\'Loading complete\')');
    });

    it('should generate error announcements', () => {
      const options: ComponentGenerationOptions = {
        name: 'Form',
        type: 'organism',
        props: [
          { name: 'error', type: 'string', required: false }
        ]
      };

      const announcements = accessibilityCompliance.generateScreenReaderAnnouncements(options);

      expect(announcements).toContain('announce(error, \'assertive\')');
    });
  });

  describe('generateColorContrastValidation', () => {
    it('should extract color classes from Tailwind', () => {
      const tailwindClasses = 'bg-blue-500 text-white hover:bg-blue-600';
      
      const validations = accessibilityCompliance.generateColorContrastValidation(tailwindClasses);

      expect(validations).toHaveLength(1);
      expect(validations[0].background).toBe('blue-500');
      expect(validations[0].foreground).toBe('white');
      expect(validations[0].wcagLevel).toBe('AA');
    });

    it('should return empty array when no color classes found', () => {
      const tailwindClasses = 'flex items-center justify-center';
      
      const validations = accessibilityCompliance.generateColorContrastValidation(tailwindClasses);

      expect(validations).toHaveLength(0);
    });
  });

  describe('generateA11yDocumentation', () => {
    it('should generate comprehensive accessibility documentation', () => {
      const options: ComponentGenerationOptions = {
        name: 'AccessibleButton',
        type: 'atom',
        props: [
          { name: 'loading', type: 'boolean', required: false },
          { name: 'disabled', type: 'boolean', required: false }
        ],
        accessibility: {
          ariaLabel: true,
          keyboard: true,
          focusManagement: true,
          role: 'button'
        }
      };

      const docs = accessibilityCompliance.generateA11yDocumentation('AccessibleButton', options);

      expect(docs).toContain('## Accessibility Features');
      expect(docs).toContain('WCAG 2.1 AA Compliance');
      expect(docs).toContain('Keyboard Navigation');
      expect(docs).toContain('Screen Reader Support');
      expect(docs).toContain('Focus Indicators');
      expect(docs).toContain('Color Contrast');
      expect(docs).toContain('### Testing');
      expect(docs).toContain('npm run test:a11y AccessibleButton');
    });
  });
});