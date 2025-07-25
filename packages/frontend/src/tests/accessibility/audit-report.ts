import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

// Extend Vitest matchers
expect.extend(toHaveNoViolations);

interface AccessibilityViolation {
  component: string;
  violations: any[];
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
}

const auditResults: AccessibilityViolation[] = [];

// Helper function to run accessibility audit
export async function runAccessibilityAudit(
  componentName: string,
  component: React.ReactElement
): Promise<void> {
  const { container } = render(component);
  
  try {
    const results = await axe(container);
    
    if (results.violations.length > 0) {
      auditResults.push({
        component: componentName,
        violations: results.violations,
        impact: results.violations.reduce((maxImpact, violation) => {
          const impacts = ['critical', 'serious', 'moderate', 'minor'];
          const currentIndex = impacts.indexOf(violation.impact || 'minor');
          const maxIndex = impacts.indexOf(maxImpact);
          return currentIndex < maxIndex ? violation.impact || 'minor' : maxImpact;
        }, 'minor' as any),
      });
    }
  } catch (error) {
    console.error(`Error auditing ${componentName}:`, error);
  }
}

// Generate audit report
export function generateAuditReport(): void {
  console.log('\n=== ACCESSIBILITY AUDIT REPORT ===\n');
  
  if (auditResults.length === 0) {
    console.log('✅ No accessibility violations found!');
    return;
  }
  
  // Group by impact
  const byImpact = auditResults.reduce((acc, result) => {
    if (!acc[result.impact]) {
      acc[result.impact] = [];
    }
    acc[result.impact].push(result);
    return acc;
  }, {} as Record<string, AccessibilityViolation[]>);
  
  // Report critical issues first
  const impactOrder = ['critical', 'serious', 'moderate', 'minor'];
  
  for (const impact of impactOrder) {
    const violations = byImpact[impact];
    if (!violations) continue;
    
    console.log(`\n${getImpactEmoji(impact as any)} ${impact.toUpperCase()} ISSUES (${violations.length})\n`);
    
    violations.forEach(({ component, violations }) => {
      console.log(`  📍 ${component}`);
      violations.forEach(violation => {
        console.log(`     - ${violation.description}`);
        console.log(`       Rule: ${violation.id}`);
        console.log(`       Help: ${violation.help}`);
        console.log(`       Affected: ${violation.nodes.length} element(s)`);
        
        // Show first affected element as example
        if (violation.nodes.length > 0) {
          const node = violation.nodes[0];
          console.log(`       Example: ${node.html.substring(0, 80)}...`);
        }
      });
    });
  }
  
  // Summary
  console.log('\n=== SUMMARY ===');
  console.log(`Total components with violations: ${auditResults.length}`);
  console.log(`Total violations: ${auditResults.reduce((sum, r) => sum + r.violations.length, 0)}`);
  
  // Recommendations
  console.log('\n=== TOP RECOMMENDATIONS ===');
  const recommendations = getTopRecommendations(auditResults);
  recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec}`);
  });
}

function getImpactEmoji(impact: 'critical' | 'serious' | 'moderate' | 'minor'): string {
  const emojis = {
    critical: '🔴',
    serious: '🟠',
    moderate: '🟡',
    minor: '🔵',
  };
  return emojis[impact];
}

function getTopRecommendations(results: AccessibilityViolation[]): string[] {
  const recommendations: string[] = [];
  const violationTypes = new Set<string>();
  
  results.forEach(result => {
    result.violations.forEach(violation => {
      violationTypes.add(violation.id);
    });
  });
  
  // Common recommendations based on violation types
  if (violationTypes.has('color-contrast')) {
    recommendations.push('Improve color contrast ratios to meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text)');
  }
  
  if (violationTypes.has('label')) {
    recommendations.push('Ensure all form controls have associated labels');
  }
  
  if (violationTypes.has('button-name')) {
    recommendations.push('Add descriptive text or aria-labels to all buttons');
  }
  
  if (violationTypes.has('image-alt')) {
    recommendations.push('Provide meaningful alt text for all images');
  }
  
  if (violationTypes.has('landmark-one-main')) {
    recommendations.push('Ensure page has one main landmark');
  }
  
  if (violationTypes.has('region')) {
    recommendations.push('Organize content with proper landmark regions');
  }
  
  if (violationTypes.has('heading-order')) {
    recommendations.push('Maintain proper heading hierarchy (h1 → h2 → h3, etc.)');
  }
  
  if (violationTypes.has('link-name')) {
    recommendations.push('Ensure all links have descriptive text');
  }
  
  // General recommendations
  recommendations.push('Test with screen readers (NVDA, JAWS, VoiceOver)');
  recommendations.push('Verify keyboard navigation works for all interactive elements');
  recommendations.push('Add skip links for keyboard users');
  recommendations.push('Ensure focus indicators are visible');
  
  return recommendations.slice(0, 10); // Top 10 recommendations
}

// Export audit results for further processing
export function getAuditResults(): AccessibilityViolation[] {
  return auditResults;
}

// Clear results between test runs
export function clearAuditResults(): void {
  auditResults.length = 0;
}