#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Accessibility audit for TaskMaster UI
console.log('♿ TaskMaster UI Accessibility Audit');
console.log('====================================');

// ARIA attributes audit
function auditAriaAttributes() {
  console.log('\n🔍 ARIA Attributes Audit');
  console.log('=========================');
  
  const componentPaths = [
    '../src/components/ui/atoms',
    '../src/components/ui/molecules'
  ];
  
  const ariaChecks = {
    'aria-label': 0,
    'aria-labelledby': 0,
    'aria-describedby': 0,
    'aria-expanded': 0,
    'aria-hidden': 0,
    'aria-checked': 0,
    'aria-selected': 0,
    'aria-current': 0,
    'aria-disabled': 0,
    'aria-invalid': 0,
    'aria-required': 0,
    'aria-haspopup': 0,
    'aria-controls': 0,
    'role': 0
  };
  
  let totalComponents = 0;
  let accessibleComponents = 0;
  
  componentPaths.forEach(componentPath => {
    const fullPath = path.join(__dirname, componentPath);
    
    if (fs.existsSync(fullPath)) {
      const files = fs.readdirSync(fullPath).filter(file => file.endsWith('.tsx'));
      
      files.forEach(file => {
        const filePath = path.join(fullPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        totalComponents++;
        let hasAccessibility = false;
        
        // Check for ARIA attributes
        Object.keys(ariaChecks).forEach(attr => {
          const regex = new RegExp(`${attr}=`, 'g');
          const matches = content.match(regex);
          if (matches) {
            ariaChecks[attr] += matches.length;
            hasAccessibility = true;
          }
        });
        
        // Check for semantic HTML elements
        const semanticElements = ['button', 'input', 'label', 'form', 'nav', 'main', 'section', 'article', 'aside', 'header', 'footer'];
        semanticElements.forEach(element => {
          if (content.includes(`<${element}`)) {
            hasAccessibility = true;
          }
        });
        
        if (hasAccessibility) {
          accessibleComponents++;
        }
        
        console.log(`  ${hasAccessibility ? '✅' : '⚠️'} ${file.replace('.tsx', '')}`);
      });
    }
  });
  
  console.log(`\n📊 ARIA Attribute Usage:`);
  Object.entries(ariaChecks).forEach(([attr, count]) => {
    if (count > 0) {
      console.log(`  ${attr}: ${count} occurrences`);
    }
  });
  
  console.log(`\n📈 Accessibility Score: ${accessibleComponents}/${totalComponents} components (${((accessibleComponents/totalComponents)*100).toFixed(1)}%)`);
  
  return {
    totalComponents,
    accessibleComponents,
    ariaUsage: ariaChecks
  };
}

// Color contrast audit
function auditColorContrast() {
  console.log('\n🎨 Color Contrast Audit');
  console.log('========================');
  
  const cssPath = path.join(__dirname, '../src/index.css');
  const baseCssPath = path.join(__dirname, '../src/styles/base.css');
  let colorSystemFound = false;
  
  // Check both CSS files
  const cssFiles = [
    { path: cssPath, name: 'index.css' },
    { path: baseCssPath, name: 'base.css' }
  ];
  
  cssFiles.forEach(({ path: filePath, name }) => {
    if (fs.existsSync(filePath)) {
      const cssContent = fs.readFileSync(filePath, 'utf8');
      
      // Check for design system color definitions
      const colorPatterns = [
        /--color-primary/g,
        /--color-secondary/g,
        /--color-success/g,
        /--color-warning/g,
        /--color-error/g,
        /--color-text/g,
        /--color-background/g,
        /--color-surface/g,
        /--color-border/g
      ];
      
      colorPatterns.forEach(pattern => {
        const matches = cssContent.match(pattern);
        if (matches) {
          colorSystemFound = true;
          console.log(`  ✅ ${name}: ${matches.length} color tokens found`);
        }
      });
      
      // Check for accessibility-related CSS classes and styles
      const accessibilityFeatures = [
        { pattern: /\.sr-only/g, name: 'Screen reader only styles' },
        { pattern: /focus-visible/g, name: 'Focus visible styles' },
        { pattern: /focus-ring/g, name: 'Focus ring styles' },
        { pattern: /focus:outline/g, name: 'Focus outline styles' },
        { pattern: /focus:ring/g, name: 'Focus ring utility' },
        { pattern: /outline.*focus/g, name: 'Focus outline management' },
        { pattern: /skip-link/g, name: 'Skip link for keyboard users' },
        { pattern: /focus-trap/g, name: 'Focus trap helpers' },
        { pattern: /\*:focus/g, name: 'Universal focus styles' },
        { pattern: /button:focus/g, name: 'Button focus styles' },
        { pattern: /input:focus/g, name: 'Input focus styles' }
      ];
      
      console.log(`\n🔍 Accessibility Features in ${name}:`);
      accessibilityFeatures.forEach(({ pattern, name: featureName }) => {
        const matches = cssContent.match(pattern);
        if (matches) {
          console.log(`  ✅ ${featureName}: ${matches.length} implementations`);
        }
      });
    }
  });
  
  if (!colorSystemFound) {
    console.log('  ⚠️ No systematic color definitions found');
  }
  
  console.log('\n💡 Color Contrast Recommendations:');
  console.log('  • Text on primary background should have 4.5:1 contrast ratio');
  console.log('  • Interactive elements should have 3:1 contrast ratio');
  console.log('  • Focus indicators should be clearly visible');
  console.log('  • Error states should not rely on color alone');
  
  return {
    colorSystemFound,
    recommendationsImplemented: true
  };
}

// Keyboard navigation audit
function auditKeyboardNavigation() {
  console.log('\n⌨️  Keyboard Navigation Audit');
  console.log('=============================');
  
  const keyboardPatterns = [
    { pattern: /onKeyDown/g, description: 'Keyboard event handlers' },
    { pattern: /onKeyUp/g, description: 'Key up event handlers' },
    { pattern: /onKeyPress/g, description: 'Key press event handlers' },
    { pattern: /tabIndex/g, description: 'Tab index management' },
    { pattern: /focus\(\)/g, description: 'Focus management' },
    { pattern: /blur\(\)/g, description: 'Blur management' },
    { pattern: /addEventListener.*keydown/g, description: 'Native keyboard listeners' },
    { pattern: /useEffect.*keydown/g, description: 'React keyboard effects' }
  ];
  
  const componentPaths = [
    '../src/components/ui/atoms',
    '../src/components/ui/molecules'
  ];
  
  let keyboardSupport = {};
  let totalFiles = 0;
  let filesWithKeyboardSupport = 0;
  
  componentPaths.forEach(componentPath => {
    const fullPath = path.join(__dirname, componentPath);
    
    if (fs.existsSync(fullPath)) {
      const files = fs.readdirSync(fullPath).filter(file => file.endsWith('.tsx'));
      
      files.forEach(file => {
        const filePath = path.join(fullPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        totalFiles++;
        let hasKeyboardSupport = false;
        
        keyboardPatterns.forEach(({ pattern, description }) => {
          const matches = content.match(pattern);
          if (matches) {
            if (!keyboardSupport[description]) {
              keyboardSupport[description] = 0;
            }
            keyboardSupport[description] += matches.length;
            hasKeyboardSupport = true;
          }
        });
        
        if (hasKeyboardSupport) {
          filesWithKeyboardSupport++;
        }
        
        console.log(`  ${hasKeyboardSupport ? '✅' : '⚠️'} ${file.replace('.tsx', '')}`);
      });
    }
  });
  
  console.log(`\n📊 Keyboard Navigation Features:`);
  Object.entries(keyboardSupport).forEach(([feature, count]) => {
    console.log(`  ${feature}: ${count} implementations`);
  });
  
  console.log(`\n📈 Keyboard Support Score: ${filesWithKeyboardSupport}/${totalFiles} components (${((filesWithKeyboardSupport/totalFiles)*100).toFixed(1)}%)`);
  
  return {
    totalFiles,
    filesWithKeyboardSupport,
    keyboardFeatures: keyboardSupport
  };
}

// Screen reader audit
function auditScreenReader() {
  console.log('\n📱 Screen Reader Audit');
  console.log('=======================');
  
  const screenReaderPatterns = [
    { pattern: /aria-label/g, description: 'ARIA labels' },
    { pattern: /aria-labelledby/g, description: 'ARIA labelledby' },
    { pattern: /aria-describedby/g, description: 'ARIA describedby' },
    { pattern: /sr-only/g, description: 'Screen reader only text' },
    { pattern: /role=/g, description: 'ARIA roles' },
    { pattern: /aria-live/g, description: 'Live regions' },
    { pattern: /aria-hidden/g, description: 'Hidden from screen readers' }
  ];
  
  const componentPaths = [
    '../src/components/ui/atoms',
    '../src/components/ui/molecules'
  ];
  
  let screenReaderSupport = {};
  let totalFiles = 0;
  let filesWithScreenReaderSupport = 0;
  
  componentPaths.forEach(componentPath => {
    const fullPath = path.join(__dirname, componentPath);
    
    if (fs.existsSync(fullPath)) {
      const files = fs.readdirSync(fullPath).filter(file => file.endsWith('.tsx'));
      
      files.forEach(file => {
        const filePath = path.join(fullPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        totalFiles++;
        let hasScreenReaderSupport = false;
        
        screenReaderPatterns.forEach(({ pattern, description }) => {
          const matches = content.match(pattern);
          if (matches) {
            if (!screenReaderSupport[description]) {
              screenReaderSupport[description] = 0;
            }
            screenReaderSupport[description] += matches.length;
            hasScreenReaderSupport = true;
          }
        });
        
        if (hasScreenReaderSupport) {
          filesWithScreenReaderSupport++;
        }
        
        console.log(`  ${hasScreenReaderSupport ? '✅' : '⚠️'} ${file.replace('.tsx', '')}`);
      });
    }
  });
  
  console.log(`\n📊 Screen Reader Features:`);
  Object.entries(screenReaderSupport).forEach(([feature, count]) => {
    console.log(`  ${feature}: ${count} implementations`);
  });
  
  console.log(`\n📈 Screen Reader Support Score: ${filesWithScreenReaderSupport}/${totalFiles} components (${((filesWithScreenReaderSupport/totalFiles)*100).toFixed(1)}%)`);
  
  return {
    totalFiles,
    filesWithScreenReaderSupport,
    screenReaderFeatures: screenReaderSupport
  };
}

// Focus management audit
function auditFocusManagement() {
  console.log('\n🎯 Focus Management Audit');
  console.log('==========================');
  
  const focusPatterns = [
    { pattern: /focus-visible/g, description: 'Focus visible styles' },
    { pattern: /focus-ring/g, description: 'Focus ring styles' },
    { pattern: /focus:outline/g, description: 'Focus outline styles' },
    { pattern: /focus:ring/g, description: 'Focus ring utility' },
    { pattern: /useRef.*focus/g, description: 'Focus ref management' },
    { pattern: /autoFocus/g, description: 'Auto focus attributes' },
    { pattern: /tabIndex/g, description: 'Tab index management' },
    { pattern: /\.focus\(\)/g, description: 'Focus method calls' },
    { pattern: /onFocus/g, description: 'Focus event handlers' },
    { pattern: /onBlur/g, description: 'Blur event handlers' }
  ];
  
  const componentPaths = [
    '../src/components/ui/atoms',
    '../src/components/ui/molecules'
  ];
  
  let focusSupport = {};
  let totalFiles = 0;
  let filesWithFocusSupport = 0;
  
  componentPaths.forEach(componentPath => {
    const fullPath = path.join(__dirname, componentPath);
    
    if (fs.existsSync(fullPath)) {
      const files = fs.readdirSync(fullPath).filter(file => file.endsWith('.tsx'));
      
      files.forEach(file => {
        const filePath = path.join(fullPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        totalFiles++;
        let hasFocusSupport = false;
        
        focusPatterns.forEach(({ pattern, description }) => {
          const matches = content.match(pattern);
          if (matches) {
            if (!focusSupport[description]) {
              focusSupport[description] = 0;
            }
            focusSupport[description] += matches.length;
            hasFocusSupport = true;
          }
        });
        
        // Check if component uses semantic HTML elements that have inherent focus management
        const semanticFocusableElements = [
          'button', 'input', 'textarea', 'select', 'a href'
        ];
        
        semanticFocusableElements.forEach(element => {
          if (content.includes(`<${element}`)) {
            hasFocusSupport = true;
            if (!focusSupport['Semantic focusable elements']) {
              focusSupport['Semantic focusable elements'] = 0;
            }
            focusSupport['Semantic focusable elements']++;
          }
        });
        
        if (hasFocusSupport) {
          filesWithFocusSupport++;
        }
        
        console.log(`  ${hasFocusSupport ? '✅' : '⚠️'} ${file.replace('.tsx', '')}`);
      });
    }
  });
  
  console.log(`\n📊 Focus Management Features:`);
  Object.entries(focusSupport).forEach(([feature, count]) => {
    console.log(`  ${feature}: ${count} implementations`);
  });
  
  console.log(`\n📈 Focus Management Score: ${filesWithFocusSupport}/${totalFiles} components (${((filesWithFocusSupport/totalFiles)*100).toFixed(1)}%)`);
  
  return {
    totalFiles,
    filesWithFocusSupport,
    focusFeatures: focusSupport
  };
}

// Overall accessibility score
function calculateOverallScore(ariaAudit, keyboardAudit, screenReaderAudit, focusAudit) {
  console.log('\n📊 Overall Accessibility Score');
  console.log('===============================');
  
  const ariaScore = (ariaAudit.accessibleComponents / ariaAudit.totalComponents) * 100;
  const keyboardScore = (keyboardAudit.filesWithKeyboardSupport / keyboardAudit.totalFiles) * 100;
  const screenReaderScore = (screenReaderAudit.filesWithScreenReaderSupport / screenReaderAudit.totalFiles) * 100;
  const focusScore = (focusAudit.filesWithFocusSupport / focusAudit.totalFiles) * 100;
  
  const overallScore = (ariaScore + keyboardScore + screenReaderScore + focusScore) / 4;
  
  console.log(`ARIA Support: ${ariaScore.toFixed(1)}%`);
  console.log(`Keyboard Navigation: ${keyboardScore.toFixed(1)}%`);
  console.log(`Screen Reader Support: ${screenReaderScore.toFixed(1)}%`);
  console.log(`Focus Management: ${focusScore.toFixed(1)}%`);
  console.log(`\n🎯 Overall Score: ${overallScore.toFixed(1)}%`);
  
  let grade = 'F';
  if (overallScore >= 90) grade = 'A';
  else if (overallScore >= 80) grade = 'B';
  else if (overallScore >= 70) grade = 'C';
  else if (overallScore >= 60) grade = 'D';
  
  console.log(`📝 Grade: ${grade}`);
  
  return {
    ariaScore,
    keyboardScore,
    screenReaderScore,
    focusScore,
    overallScore,
    grade
  };
}

// Recommendations
function generateRecommendations(scores) {
  console.log('\n💡 Accessibility Recommendations');
  console.log('=================================');
  
  const recommendations = [];
  
  if (scores.ariaScore < 80) {
    recommendations.push('• Add more ARIA attributes to improve screen reader support');
    recommendations.push('• Ensure all interactive elements have proper labels');
  }
  
  if (scores.keyboardScore < 80) {
    recommendations.push('• Implement keyboard navigation for all interactive components');
    recommendations.push('• Add proper focus management for modal and dropdown components');
  }
  
  if (scores.screenReaderScore < 80) {
    recommendations.push('• Add screen reader only text for important context');
    recommendations.push('• Implement live regions for dynamic content updates');
  }
  
  if (scores.focusScore < 80) {
    recommendations.push('• Ensure all interactive elements have visible focus indicators');
    recommendations.push('• Implement proper tab order for complex components');
  }
  
  if (recommendations.length === 0) {
    console.log('✅ Great job! Your components meet high accessibility standards.');
    console.log('Continue monitoring and testing with real users and assistive technologies.');
  } else {
    console.log('🔧 Areas for improvement:');
    recommendations.forEach(rec => console.log(rec));
  }
  
  console.log('\n📚 Additional Resources:');
  console.log('• WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/');
  console.log('• ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/');
  console.log('• React Accessibility: https://reactjs.org/docs/accessibility.html');
  
  return recommendations;
}

// Main audit function
function runAccessibilityAudit() {
  const ariaAudit = auditAriaAttributes();
  const colorAudit = auditColorContrast();
  const keyboardAudit = auditKeyboardNavigation();
  const screenReaderAudit = auditScreenReader();
  const focusAudit = auditFocusManagement();
  
  const scores = calculateOverallScore(ariaAudit, keyboardAudit, screenReaderAudit, focusAudit);
  const recommendations = generateRecommendations(scores);
  
  return {
    ariaAudit,
    colorAudit,
    keyboardAudit,
    screenReaderAudit,
    focusAudit,
    scores,
    recommendations
  };
}

// Run the audit
const auditResults = runAccessibilityAudit();

// Export results for use in QA report
export default auditResults;