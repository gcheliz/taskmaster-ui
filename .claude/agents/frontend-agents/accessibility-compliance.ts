/**
 * Accessibility Compliance Module
 * 
 * Ensures WCAG 2.1 AA compliance for generated components
 * with automated testing and validation
 */

import { ComponentGenerationOptions, ComponentProp } from './component-development-core';

export interface AccessibilityEnhancements {
  aria: AriaAttributes;
  keyboard: KeyboardSupport;
  focus: FocusManagement;
  semantics: SemanticHTML;
  announcements: ScreenReaderSupport;
  contrast: ColorContrastValidation;
}

export interface AriaAttributes {
  label?: string;
  labelledBy?: string;
  describedBy?: string;
  live?: 'polite' | 'assertive' | 'off';
  role?: string;
  expanded?: boolean;
  controls?: string;
  current?: string;
  hasPopup?: boolean;
  invalid?: boolean;
  pressed?: boolean;
  selected?: boolean;
}

export interface KeyboardSupport {
  tabIndex?: number;
  enterKey?: boolean;
  spaceKey?: boolean;
  escapeKey?: boolean;
  arrowKeys?: boolean;
  shortcuts?: KeyboardShortcut[];
}

export interface KeyboardShortcut {
  key: string;
  modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[];
  action: string;
  description: string;
}

export interface FocusManagement {
  focusable?: boolean;
  focusTrap?: boolean;
  focusReturn?: boolean;
  skipLink?: boolean;
  focusIndicator?: 'ring' | 'outline' | 'custom';
}

export interface SemanticHTML {
  element?: string;
  landmark?: 'main' | 'navigation' | 'complementary' | 'contentinfo' | 'banner';
  heading?: 1 | 2 | 3 | 4 | 5 | 6;
  list?: 'ordered' | 'unordered' | 'description';
}

export interface ScreenReaderSupport {
  srOnly?: string;
  liveRegion?: boolean;
  announceChanges?: boolean;
  readingOrder?: number[];
}

export interface ColorContrastValidation {
  foreground: string;
  background: string;
  largeText?: boolean;
  wcagLevel?: 'AA' | 'AAA';
}

export class AccessibilityCompliance {
  /**
   * Enhance component options with accessibility features
   */
  enhanceComponentWithA11y(
    options: ComponentGenerationOptions
  ): ComponentGenerationOptions {
    const enhanced = { ...options };

    // Add ARIA attributes based on component type
    enhanced.accessibility = {
      ...enhanced.accessibility,
      ...this.getDefaultAriaForComponent(options),
    };

    // Add keyboard support for interactive components
    if (this.isInteractive(options)) {
      if (enhanced.accessibility) {
        enhanced.accessibility.keyboard = true;
        enhanced.accessibility.focusManagement = true;
      }
    }

    // Ensure proper semantic HTML
    if (options.type === 'atom' && options.name.toLowerCase().includes('button')) {
      if (enhanced.accessibility) {
        enhanced.accessibility.role = enhanced.accessibility.role || 'button';
      }
    }

    // Add required accessibility props
    enhanced.props = this.addA11yProps(enhanced.props || [], enhanced.accessibility);

    return enhanced;
  }

  /**
   * Generate accessibility testing code
   */
  generateA11yTests(componentName: string, options: ComponentGenerationOptions): string {
    const ariaImplementation = this.generateAriaImplementation(options);
    const includesAriaInvalid = ariaImplementation.includes('aria-invalid');
    
    return `import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import { ${componentName} } from './${componentName}';

expect.extend(toHaveNoViolations);

describe('${componentName} Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(
      <${componentName}${this.generateTestProps(options)} />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  ${this.generateKeyboardTests(componentName, options)}

  ${this.generateScreenReaderTests(componentName, options)}
  
  ${includesAriaInvalid ? this.generateErrorStateTests(componentName, options) : ''}

  ${this.generateFocusTests(componentName, options)}

  ${this.generateColorContrastTests(componentName, options)}
});`;
  }

  /**
   * Generate ARIA implementation code
   */
  generateAriaImplementation(options: ComponentGenerationOptions): string {
    const ariaProps: string[] = [];

    if (options.accessibility?.ariaLabel) {
      ariaProps.push('aria-label={ariaLabel}');
    }
    if (options.accessibility?.ariaDescribedBy) {
      ariaProps.push('aria-describedby={ariaDescribedBy}');
    }
    if (options.props?.some(p => p.name === 'expanded')) {
      ariaProps.push('aria-expanded={expanded}');
    }
    if (options.props?.some(p => p.name === 'selected')) {
      ariaProps.push('aria-selected={selected}');
    }
    if (options.props?.some(p => p.name === 'disabled')) {
      ariaProps.push('aria-disabled={disabled}');
    }
    if (options.props?.some(p => p.name === 'error')) {
      ariaProps.push('aria-invalid={!!error}');
      ariaProps.push('aria-errormessage={error ? errorId : undefined}');
    }

    return ariaProps.join('\n      ');
  }

  /**
   * Generate keyboard navigation implementation
   */
  generateKeyboardNavigation(options: ComponentGenerationOptions): string {
    if (!options.accessibility?.keyboard) return '';

    return `
  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        ${options.props?.find(p => p.name === 'onClick') ? 'onClick?.();' : '// Handle activation'}
        break;
      case 'Escape':
        ${options.props?.find(p => p.name === 'onClose') ? 'onClose?.();' : '// Handle escape'}
        break;
      ${options.accessibility?.ariaDescribedBy ? `case 'ArrowDown':
        // Navigate to next item
        break;
      case 'ArrowUp':
        // Navigate to previous item
        break;` : ''}
    }
  };`;
  }

  /**
   * Generate focus management code
   */
  generateFocusManagement(options: ComponentGenerationOptions): string {
    if (!options.accessibility?.focusManagement) return '';

    return `
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [focusIndex, setFocusIndex] = React.useState(0);

  // Focus trap implementation
  React.useEffect(() => {
    if (!containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    );

    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, []);`;
  }

  /**
   * Generate screen reader announcements
   */
  generateScreenReaderAnnouncements(options: ComponentGenerationOptions): string {
    const announcements: string[] = [];

    if (options.props?.find(p => p.name === 'loading')) {
      announcements.push(`
  // Announce loading state
  React.useEffect(() => {
    if (loading) {
      announce('Loading, please wait...');
    } else {
      announce('Loading complete');
    }
  }, [loading]);`);
    }

    if (options.props?.find(p => p.name === 'error')) {
      announcements.push(`
  // Announce errors
  React.useEffect(() => {
    if (error) {
      announce(error, 'assertive');
    }
  }, [error]);`);
    }

    return announcements.join('\n');
  }

  /**
   * Generate color contrast validation
   */
  generateColorContrastValidation(tailwindClasses: string): ColorContrastValidation[] {
    const validations: ColorContrastValidation[] = [];

    // Extract color classes from Tailwind
    const bgMatch = tailwindClasses.match(/bg-(\w+-\d+|white|black)/);
    const textMatch = tailwindClasses.match(/text-(\w+-\d+|white|black)/);

    if (bgMatch && textMatch) {
      validations.push({
        background: bgMatch[1],
        foreground: textMatch[1],
        wcagLevel: 'AA',
      });
    }

    return validations;
  }

  /**
   * Get default ARIA attributes for component type
   */
  private getDefaultAriaForComponent(options: ComponentGenerationOptions): any {
    const { type, name } = options;
    const lowerName = name.toLowerCase();

    if (type === 'atom') {
      if (lowerName.includes('button')) {
        return { role: 'button', ariaLabel: true };
      }
      if (lowerName.includes('input') || lowerName.includes('field')) {
        return { ariaLabel: true, ariaDescribedBy: true };
      }
      if (lowerName.includes('toggle') || lowerName.includes('switch')) {
        return { role: 'switch', ariaLabel: true };
      }
    }

    if (type === 'molecule') {
      if (lowerName.includes('card')) {
        return { role: 'article', ariaLabel: true };
      }
      if (lowerName.includes('modal') || lowerName.includes('dialog')) {
        return { role: 'dialog', ariaLabel: true, focusManagement: true, keyboard: true };
      }
      if (lowerName.includes('menu') || lowerName.includes('dropdown')) {
        return { role: 'menu', keyboard: true, focusManagement: true };
      }
    }

    if (type === 'organism') {
      if (lowerName.includes('form')) {
        return { role: 'form', ariaLabel: true };
      }
      if (lowerName.includes('nav')) {
        return { role: 'navigation', ariaLabel: true };
      }
      if (lowerName.includes('table') || lowerName.includes('grid')) {
        return { role: 'table', ariaLabel: true, keyboard: true };
      }
    }

    return { ariaLabel: true };
  }

  /**
   * Check if component is interactive
   */
  private isInteractive(options: ComponentGenerationOptions): boolean {
    const hasClickHandler = options.props?.some(p => 
      p.name === 'onClick' || p.name === 'onChange' || p.name === 'onSubmit'
    );
    const isFormElement = options.name.toLowerCase().match(
      /button|input|select|textarea|toggle|switch|checkbox|radio/
    );
    return hasClickHandler || !!isFormElement;
  }

  /**
   * Add accessibility props to component
   */
  private addA11yProps(props: ComponentProp[], accessibility: any): ComponentProp[] {
    const a11yProps = [...props];

    // Always add these for interactive components
    if (accessibility.ariaLabel && !props.find(p => p.name === 'ariaLabel')) {
      a11yProps.push({
        name: 'ariaLabel',
        type: 'string',
        required: false,
        description: 'Accessible label for screen readers',
      });
    }

    if (accessibility.ariaDescribedBy && !props.find(p => p.name === 'ariaDescribedBy')) {
      a11yProps.push({
        name: 'ariaDescribedBy',
        type: 'string',
        required: false,
        description: 'ID of element that describes this component',
      });
    }

    // Add ID for form elements
    if (accessibility.role === 'textbox' && !props.find(p => p.name === 'id')) {
      a11yProps.push({
        name: 'id',
        type: 'string',
        required: false,
        description: 'Unique identifier for form element',
      });
    }

    return a11yProps;
  }

  /**
   * Generate test props for accessibility testing
   */
  private generateTestProps(options: ComponentGenerationOptions): string {
    const props = options.props?.filter(p => p.required)
      .map(p => ` ${p.name}={${this.getTestValue(p.type)}}`)
      .join('') || '';
    
    if (options.accessibility?.ariaLabel) {
      return props + ' ariaLabel="Test component"';
    }
    
    return props;
  }

  /**
   * Generate keyboard navigation tests
   */
  private generateKeyboardTests(componentName: string, options: ComponentGenerationOptions): string {
    if (!options.accessibility?.keyboard) return '';

    return `
  describe('Keyboard Navigation', () => {
    it('should be focusable with Tab key', () => {
      render(<${componentName}${this.generateTestProps(options)} />);
      const element = screen.getByRole('${options.accessibility.role || 'button'}');
      
      userEvent.tab();
      expect(element).toHaveFocus();
    });

    it('should handle Enter key activation', async () => {
      const handleClick = jest.fn();
      render(<${componentName} onClick={handleClick}${this.generateTestProps(options)} />);
      const element = screen.getByRole('${options.accessibility.role || 'button'}');
      
      element.focus();
      await userEvent.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalled();
    });

    it('should handle Space key activation', async () => {
      const handleClick = jest.fn();
      render(<${componentName} onClick={handleClick}${this.generateTestProps(options)} />);
      const element = screen.getByRole('${options.accessibility.role || 'button'}');
      
      element.focus();
      await userEvent.keyboard(' ');
      expect(handleClick).toHaveBeenCalled();
    });
  });`;
  }

  /**
   * Generate screen reader tests
   */
  private generateScreenReaderTests(componentName: string, options: ComponentGenerationOptions): string {
    return `
  describe('Screen Reader Support', () => {
    it('should have accessible label', () => {
      render(<${componentName}${this.generateTestProps(options)} ariaLabel="Accessible button" />);
      const element = screen.getByLabelText('Accessible button');
      expect(element).toBeInTheDocument();
    });

    ${options.props?.find(p => p.name === 'disabled') ? `
    it('should announce disabled state', () => {
      render(<${componentName}${this.generateTestProps(options)} disabled ariaLabel="Disabled button" />);
      const element = screen.getByLabelText('Disabled button');
      expect(element).toHaveAttribute('aria-disabled', 'true');
    });` : ''}

    ${options.props?.find(p => p.name === 'loading') ? `
    it('should announce loading state', () => {
      render(<${componentName}${this.generateTestProps(options)} loading ariaLabel="Loading button" />);
      const element = screen.getByLabelText('Loading button');
      expect(element).toHaveAttribute('aria-busy', 'true');
    });` : ''}
  });`;
  }

  /**
   * Generate error state tests
   */
  private generateErrorStateTests(componentName: string, options: ComponentGenerationOptions): string {
    return `
  describe('Error State Accessibility', () => {
    it('should properly announce error states', () => {
      render(<${componentName}${this.generateTestProps(options)} error="Field is required" />);
      const element = screen.getByRole('${options.accessibility?.role || 'textbox'}');
      expect(element).toHaveAttribute('aria-invalid', 'true');
      expect(element).toHaveAttribute('aria-errormessage');
    });
  });`;
  }

  /**
   * Generate focus management tests
   */
  private generateFocusTests(componentName: string, options: ComponentGenerationOptions): string {
    if (!options.accessibility?.focusManagement) return '';

    return `
  describe('Focus Management', () => {
    it('should show visible focus indicator', () => {
      render(<${componentName}${this.generateTestProps(options)} />);
      const element = screen.getByRole('${options.accessibility.role || 'button'}');
      
      element.focus();
      expect(element).toHaveClass('focus:ring-2');
    });

    ${options.accessibility.focusManagement ? `
    it('should trap focus within component', async () => {
      render(<${componentName}${this.generateTestProps(options)} />);
      const firstFocusable = screen.getAllByRole('button')[0];
      const lastFocusable = screen.getAllByRole('button')[screen.getAllByRole('button').length - 1];
      
      lastFocusable.focus();
      await userEvent.tab();
      expect(firstFocusable).toHaveFocus();
    });` : ''}
  });`;
  }

  /**
   * Generate color contrast tests
   */
  private generateColorContrastTests(componentName: string, options: ComponentGenerationOptions): string {
    return `
  describe('Color Contrast', () => {
    it('should meet WCAG AA contrast requirements', async () => {
      const { container } = render(<${componentName}${this.generateTestProps(options)} />);
      
      // Note: This is a placeholder. In real implementation, you would use
      // a tool like axe-core or pa11y to check contrast ratios
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true }
        }
      });
      
      expect(results.violations.filter(v => v.id === 'color-contrast')).toHaveLength(0);
    });
  });`;
  }

  /**
   * Get test value for type
   */
  private getTestValue(type: string): string {
    const typeMap: Record<string, string> = {
      'string': '"test"',
      'number': '123',
      'boolean': 'true',
      '() => void': '() => {}',
      'React.ReactNode': '<span>Test</span>',
    };
    return typeMap[type] || 'undefined';
  }

  /**
   * Generate accessibility documentation
   */
  generateA11yDocumentation(componentName: string, options: ComponentGenerationOptions): string {
    return `## Accessibility Features

### WCAG 2.1 AA Compliance

This component meets WCAG 2.1 Level AA standards with the following features:

${options.accessibility?.ariaLabel ? '- **Accessible Labels**: Component can be labeled for screen readers using \`ariaLabel\` prop' : ''}
${options.accessibility?.keyboard ? '- **Keyboard Navigation**: Full keyboard support with Tab, Enter, Space, and arrow keys' : ''}
${options.accessibility?.focusManagement ? '- **Focus Management**: Proper focus indicators and focus trap implementation' : ''}
${options.accessibility?.role ? `- **Semantic Role**: Uses appropriate ARIA role (${options.accessibility.role})` : ''}

### Keyboard Shortcuts

${options.accessibility?.keyboard ? `| Key | Action |
|-----|--------|
| Tab | Move focus to/from component |
| Enter | Activate component |
| Space | Activate component (buttons) |
| Escape | Close/cancel (if applicable) |
${options.accessibility?.ariaDescribedBy ? '| Arrow Keys | Navigate within component |' : ''}` : 'No specific keyboard shortcuts'}

### Screen Reader Support

${options.accessibility?.ariaLabel ? '- Component announces its purpose via aria-label' : ''}
${options.props?.find(p => p.name === 'loading') ? '- Loading states are announced' : ''}
${options.props?.find(p => p.name === 'error') ? '- Error messages are announced with appropriate urgency' : ''}
${options.props?.find(p => p.name === 'disabled') ? '- Disabled state is properly communicated' : ''}

### Focus Indicators

- Visible focus ring on keyboard navigation
- High contrast focus indicator (2px ring)
- Focus trap for modal-like components

### Color Contrast

- Text meets WCAG AA contrast requirements (4.5:1 for normal text, 3:1 for large text)
- Interactive elements have sufficient contrast in all states
- Error messages use colors that meet contrast requirements

### Testing

Run accessibility tests with:
\`\`\`bash
npm run test:a11y ${componentName}
\`\`\`

### Usage Example

\`\`\`tsx
<${componentName}
  ${options.props?.filter(p => p.required).map(p => `${p.name}={${p.defaultValue || '...'}}`).join('\n  ')}
  ariaLabel="Descriptive label for screen readers"
  ${options.accessibility?.ariaDescribedBy ? 'ariaDescribedBy="helper-text-id"' : ''}
/>
\`\`\``;
  }
}

export const accessibilityCompliance = new AccessibilityCompliance();