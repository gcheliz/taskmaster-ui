/**
 * Suggestion Engine
 * 
 * Provides actionable optimization recommendations with code examples
 */

import { ReviewFinding, Severity } from './core-engine';

export interface OptimizationSuggestion {
  finding: ReviewFinding;
  suggestion: string;
  codeExample?: CodeExample;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  category: SuggestionCategory;
}

export interface CodeExample {
  before: string;
  after: string;
  explanation?: string;
}

export enum SuggestionCategory {
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  MAINTAINABILITY = 'maintainability',
  ARCHITECTURE = 'architecture',
  BEST_PRACTICES = 'best-practices'
}

export class SuggestionEngine {
  private suggestionTemplates = new Map<string, (finding: ReviewFinding) => OptimizationSuggestion>();

  constructor() {
    this.initializeSuggestionTemplates();
  }

  /**
   * Generate optimization suggestions for findings
   */
  generateSuggestions(findings: ReviewFinding[]): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    for (const finding of findings) {
      const suggestion = this.generateSuggestion(finding);
      if (suggestion) {
        suggestions.push(suggestion);
      }
    }

    // Sort by impact and effort (high impact, low effort first)
    suggestions.sort((a, b) => {
      const impactScore = { high: 3, medium: 2, low: 1 };
      const effortScore = { high: 1, medium: 2, low: 3 };
      
      const scoreA = impactScore[a.impact] * effortScore[a.effort];
      const scoreB = impactScore[b.impact] * effortScore[b.effort];
      
      return scoreB - scoreA;
    });

    return suggestions;
  }

  /**
   * Generate a single suggestion
   */
  private generateSuggestion(finding: ReviewFinding): OptimizationSuggestion | null {
    const template = this.suggestionTemplates.get(finding.rule || '');
    if (template) {
      return template(finding);
    }

    // Default suggestion based on analyzer
    return this.generateDefaultSuggestion(finding);
  }

  /**
   * Initialize suggestion templates
   */
  private initializeSuggestionTemplates(): void {
    // Performance suggestions
    this.suggestionTemplates.set('react-memo', (finding) => ({
      finding,
      suggestion: 'Wrap pure functional components with React.memo() to prevent unnecessary re-renders when props haven\'t changed.',
      codeExample: {
        before: `const MyComponent = ({ data }) => {
  return <div>{data.value}</div>;
};`,
        after: `const MyComponent = React.memo(({ data }) => {
  return <div>{data.value}</div>;
});`,
        explanation: 'React.memo performs a shallow comparison of props and skips re-rendering if props are unchanged.'
      },
      impact: 'medium',
      effort: 'low',
      category: SuggestionCategory.PERFORMANCE
    }));

    this.suggestionTemplates.set('react-callback', (finding) => ({
      finding,
      suggestion: 'Use useCallback hook to memoize event handlers and prevent child component re-renders.',
      codeExample: {
        before: `const ParentComponent = () => {
  const handleClick = () => {
    console.log('clicked');
  };
  
  return <ChildComponent onClick={handleClick} />;
};`,
        after: `const ParentComponent = () => {
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);
  
  return <ChildComponent onClick={handleClick} />;
};`,
        explanation: 'useCallback returns a memoized callback that only changes if dependencies change.'
      },
      impact: 'medium',
      effort: 'low',
      category: SuggestionCategory.PERFORMANCE
    }));

    this.suggestionTemplates.set('large-bundle-imports', (finding) => ({
      finding,
      suggestion: 'Use tree-shakeable imports to reduce bundle size.',
      codeExample: {
        before: `import _ from 'lodash';

const result = _.debounce(fn, 300);`,
        after: `import debounce from 'lodash/debounce';

const result = debounce(fn, 300);`,
        explanation: 'Importing only what you need significantly reduces bundle size.'
      },
      impact: 'high',
      effort: 'low',
      category: SuggestionCategory.PERFORMANCE
    }));

    // Security suggestions
    this.suggestionTemplates.set('sql-injection', (finding) => ({
      finding,
      suggestion: 'Use parameterized queries or prepared statements to prevent SQL injection.',
      codeExample: {
        before: `const query = \`SELECT * FROM users WHERE id = \${userId}\`;
db.query(query);`,
        after: `const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);`,
        explanation: 'Parameterized queries separate SQL logic from data, preventing injection attacks.'
      },
      impact: 'high',
      effort: 'low',
      category: SuggestionCategory.SECURITY
    }));

    this.suggestionTemplates.set('hardcoded-secret', (finding) => ({
      finding,
      suggestion: 'Move secrets to environment variables and use a secure secrets management system.',
      codeExample: {
        before: `const apiKey = 'sk-1234567890abcdef';`,
        after: `const apiKey = process.env.API_KEY;

// In .env file (not committed):
// API_KEY=sk-1234567890abcdef`,
        explanation: 'Environment variables keep secrets out of source code and version control.'
      },
      impact: 'high',
      effort: 'low',
      category: SuggestionCategory.SECURITY
    }));

    // Architecture suggestions
    this.suggestionTemplates.set('layer-violation', (finding) => ({
      finding,
      suggestion: 'Refactor code to respect architectural layer boundaries.',
      codeExample: {
        before: `// In controller
import { UserRepository } from '../repositories/UserRepository';

const users = await UserRepository.findAll();`,
        after: `// In controller
import { UserService } from '../services/UserService';

const users = await UserService.getAllUsers();

// In service
import { UserRepository } from '../repositories/UserRepository';

export class UserService {
  static async getAllUsers() {
    return UserRepository.findAll();
  }
}`,
        explanation: 'Controllers should interact with services, not directly with repositories.'
      },
      impact: 'medium',
      effort: 'medium',
      category: SuggestionCategory.ARCHITECTURE
    }));

    this.suggestionTemplates.set('single-responsibility', (finding) => ({
      finding,
      suggestion: 'Split large classes/modules into smaller, focused units.',
      codeExample: {
        before: `class UserManager {
  createUser() { }
  updateUser() { }
  deleteUser() { }
  sendEmail() { }
  generateReport() { }
  validatePassword() { }
}`,
        after: `class UserService {
  createUser() { }
  updateUser() { }
  deleteUser() { }
}

class EmailService {
  sendEmail() { }
}

class ReportService {
  generateReport() { }
}

class AuthService {
  validatePassword() { }
}`,
        explanation: 'Each class should have a single, well-defined responsibility.'
      },
      impact: 'high',
      effort: 'high',
      category: SuggestionCategory.MAINTAINABILITY
    }));
  }

  /**
   * Generate default suggestion
   */
  private generateDefaultSuggestion(finding: ReviewFinding): OptimizationSuggestion {
    const categoryMap: Record<string, SuggestionCategory> = {
      'performance': SuggestionCategory.PERFORMANCE,
      'security': SuggestionCategory.SECURITY,
      'architecture': SuggestionCategory.ARCHITECTURE,
      'eslint': SuggestionCategory.BEST_PRACTICES,
      'typescript': SuggestionCategory.BEST_PRACTICES
    };

    const severityImpact: Record<Severity, 'high' | 'medium' | 'low'> = {
      [Severity.ERROR]: 'high',
      [Severity.WARNING]: 'medium',
      [Severity.INFO]: 'low',
      [Severity.SUGGESTION]: 'low'
    };

    return {
      finding,
      suggestion: finding.message,
      impact: severityImpact[finding.severity],
      effort: 'medium',
      category: categoryMap[finding.analyzer] || SuggestionCategory.BEST_PRACTICES
    };
  }

  /**
   * Format suggestions for display
   */
  formatSuggestions(suggestions: OptimizationSuggestion[]): string {
    const lines: string[] = [];
    
    lines.push('# Optimization Suggestions\n');
    lines.push(`Total suggestions: ${suggestions.length}\n`);

    // Group by category
    const byCategory = new Map<SuggestionCategory, OptimizationSuggestion[]>();
    for (const suggestion of suggestions) {
      const list = byCategory.get(suggestion.category) || [];
      list.push(suggestion);
      byCategory.set(suggestion.category, list);
    }

    // Display by category
    for (const [category, categorySuggestions] of byCategory) {
      lines.push(`\n## ${this.formatCategory(category)}\n`);
      
      for (const suggestion of categorySuggestions) {
        lines.push(`### ${suggestion.finding.file}${suggestion.finding.line ? ':' + suggestion.finding.line : ''}\n`);
        lines.push(`**Issue**: ${suggestion.finding.message}`);
        lines.push(`**Impact**: ${suggestion.impact} | **Effort**: ${suggestion.effort}\n`);
        lines.push(`**Suggestion**: ${suggestion.suggestion}\n`);
        
        if (suggestion.codeExample) {
          lines.push('**Example**:\n');
          lines.push('Before:');
          lines.push('```typescript');
          lines.push(suggestion.codeExample.before);
          lines.push('```\n');
          lines.push('After:');
          lines.push('```typescript');
          lines.push(suggestion.codeExample.after);
          lines.push('```\n');
          
          if (suggestion.codeExample.explanation) {
            lines.push(`**Explanation**: ${suggestion.codeExample.explanation}\n`);
          }
        }
      }
    }

    return lines.join('\n');
  }

  /**
   * Format category name
   */
  private formatCategory(category: SuggestionCategory): string {
    const names = {
      [SuggestionCategory.PERFORMANCE]: 'Performance Optimizations',
      [SuggestionCategory.SECURITY]: 'Security Improvements',
      [SuggestionCategory.MAINTAINABILITY]: 'Maintainability Enhancements',
      [SuggestionCategory.ARCHITECTURE]: 'Architecture Refinements',
      [SuggestionCategory.BEST_PRACTICES]: 'Best Practice Recommendations'
    };
    
    return names[category] || category;
  }
}

// Export singleton instance
export const suggestionEngine = new SuggestionEngine();