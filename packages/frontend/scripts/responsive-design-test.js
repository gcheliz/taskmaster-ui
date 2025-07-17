#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Responsive design testing for TaskMaster UI
console.log('📱 TaskMaster UI Responsive Design Test');
console.log('======================================');

// Define viewport breakpoints
const viewports = {
  mobile: {
    name: 'Mobile',
    width: 375,
    height: 667,
    description: 'iPhone 8 / Small mobile devices',
    priority: 'Critical'
  },
  mobileLarge: {
    name: 'Mobile Large',
    width: 414,
    height: 896,
    description: 'iPhone 11 / Large mobile devices',
    priority: 'High'
  },
  tablet: {
    name: 'Tablet Portrait',
    width: 768,
    height: 1024,
    description: 'iPad / Tablet devices',
    priority: 'High'
  },
  tabletLandscape: {
    name: 'Tablet Landscape',
    width: 1024,
    height: 768,
    description: 'iPad landscape / Small desktop',
    priority: 'Medium'
  },
  desktop: {
    name: 'Desktop',
    width: 1366,
    height: 768,
    description: 'Common laptop / Desktop',
    priority: 'Critical'
  },
  desktopLarge: {
    name: 'Desktop Large',
    width: 1920,
    height: 1080,
    description: 'Full HD / Large desktop',
    priority: 'High'
  }
};

// Check CSS responsive features
function checkResponsiveCSS() {
  console.log('\n🎨 CSS Responsive Features Analysis');
  console.log('===================================');
  
  const cssFiles = [
    '../src/index.css',
    '../src/styles/base.css'
  ];
  
  const responsiveFeatures = [
    {
      name: 'CSS Grid',
      pattern: /display:\s*grid|grid-template|grid-gap|gap:/gi,
      benefit: 'Responsive grid layouts'
    },
    {
      name: 'Flexbox',
      pattern: /display:\s*flex|flex-direction|flex-wrap|justify-content|align-items/gi,
      benefit: 'Flexible component layouts'
    },
    {
      name: 'Media Queries',
      pattern: /@media\s*\([^)]*\)/gi,
      benefit: 'Viewport-specific styling'
    },
    {
      name: 'Responsive Units (rem, em)',
      pattern: /\d+(?:\.\d+)?(?:rem|em)\b/gi,
      benefit: 'Scalable typography and spacing'
    },
    {
      name: 'Viewport Units (vw, vh, vmin, vmax)',
      pattern: /\d+(?:\.\d+)?(?:vw|vh|vmin|vmax)\b/gi,
      benefit: 'Viewport-relative sizing'
    },
    {
      name: 'Percentage Units',
      pattern: /width:\s*\d+%|height:\s*\d+%|max-width:\s*\d+%/gi,
      benefit: 'Fluid responsive layouts'
    },
    {
      name: 'Min/Max Width',
      pattern: /min-width:|max-width:/gi,
      benefit: 'Responsive constraints'
    },
    {
      name: 'Container Queries',
      pattern: /@container/gi,
      benefit: 'Component-based responsive design'
    }
  ];
  
  let totalFeatures = 0;
  let featureUsage = {};
  
  cssFiles.forEach(cssFile => {
    const cssPath = path.join(__dirname, cssFile);
    const fileName = path.basename(cssFile);
    
    if (fs.existsSync(cssPath)) {
      const cssContent = fs.readFileSync(cssPath, 'utf8');
      
      console.log(`\n📄 Analyzing ${fileName}:`);
      
      responsiveFeatures.forEach(feature => {
        const matches = cssContent.match(feature.pattern);
        if (matches) {
          const count = matches.length;
          totalFeatures += count;
          
          if (!featureUsage[feature.name]) {
            featureUsage[feature.name] = 0;
          }
          featureUsage[feature.name] += count;
          
          console.log(`  ✅ ${feature.name}: ${count} implementations`);
          console.log(`    💡 Benefit: ${feature.benefit}`);
        }
      });
    }
  });
  
  console.log('\n📊 Responsive Features Summary:');
  Object.entries(featureUsage).forEach(([feature, count]) => {
    console.log(`  ${feature}: ${count} uses`);
  });
  
  console.log(`\n📈 Total responsive features: ${totalFeatures}`);
  
  return {
    totalFeatures,
    featureUsage,
    hasMediaQueries: featureUsage['Media Queries'] > 0,
    hasFlexbox: featureUsage['Flexbox'] > 0,
    hasGrid: featureUsage['CSS Grid'] > 0
  };
}

// Analyze component responsiveness
function analyzeComponentResponsiveness() {
  console.log('\n🧩 Component Responsiveness Analysis');
  console.log('====================================');
  
  const componentPaths = [
    '../src/components/ui/atoms',
    '../src/components/ui/molecules'
  ];
  
  const responsivePatterns = [
    {
      name: 'Responsive Props',
      pattern: /(?:sm|md|lg|xl|2xl):/gi,
      description: 'Tailwind responsive prefixes'
    },
    {
      name: 'Conditional Rendering',
      pattern: /hidden|block|flex.*(?:sm|md|lg|xl)/gi,
      description: 'Responsive visibility'
    },
    {
      name: 'Responsive Classes',
      pattern: /(?:mobile|tablet|desktop)-(?:hidden|block|flex)/gi,
      description: 'Custom responsive utilities'
    },
    {
      name: 'Dynamic Sizing',
      pattern: /w-full|h-full|min-w|max-w|min-h|max-h/gi,
      description: 'Flexible sizing utilities'
    }
  ];
  
  let totalComponents = 0;
  let responsiveComponents = 0;
  let responsiveFeatures = {};
  
  componentPaths.forEach(componentPath => {
    const fullPath = path.join(__dirname, componentPath);
    
    if (fs.existsSync(fullPath)) {
      const files = fs.readdirSync(fullPath).filter(file => file.endsWith('.tsx'));
      
      files.forEach(file => {
        const filePath = path.join(fullPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        totalComponents++;
        let isResponsive = false;
        
        responsivePatterns.forEach(pattern => {
          const matches = content.match(pattern.pattern);
          if (matches) {
            isResponsive = true;
            
            if (!responsiveFeatures[pattern.name]) {
              responsiveFeatures[pattern.name] = 0;
            }
            responsiveFeatures[pattern.name] += matches.length;
          }
        });
        
        if (isResponsive) {
          responsiveComponents++;
        }
        
        console.log(`  ${isResponsive ? '✅' : '⚠️'} ${file.replace('.tsx', '')}`);
      });
    }
  });
  
  console.log(`\n📊 Component Responsiveness Features:`);
  Object.entries(responsiveFeatures).forEach(([feature, count]) => {
    console.log(`  ${feature}: ${count} implementations`);
  });
  
  const responsiveScore = (responsiveComponents / totalComponents * 100).toFixed(1);
  console.log(`\n📈 Responsive Components: ${responsiveComponents}/${totalComponents} (${responsiveScore}%)`);
  
  return {
    totalComponents,
    responsiveComponents,
    responsiveScore: parseFloat(responsiveScore),
    responsiveFeatures
  };
}

// Check Tailwind CSS responsive utilities
function checkTailwindResponsiveUtilities() {
  console.log('\n🎯 Tailwind CSS Responsive Utilities');
  console.log('====================================');
  
  const tailwindConfig = path.join(__dirname, '../tailwind.config.js');
  
  if (fs.existsSync(tailwindConfig)) {
    console.log('✅ Tailwind CSS configuration found');
    
    // Check for custom breakpoints
    const configContent = fs.readFileSync(tailwindConfig, 'utf8');
    
    if (configContent.includes('screens')) {
      console.log('✅ Custom breakpoints configuration detected');
    } else {
      console.log('📝 Using default Tailwind breakpoints:');
      console.log('  • sm: 640px');
      console.log('  • md: 768px');
      console.log('  • lg: 1024px');
      console.log('  • xl: 1280px');
      console.log('  • 2xl: 1536px');
    }
  } else {
    console.log('⚠️ No Tailwind configuration found');
  }
  
  // Check for responsive utilities in components
  const componentPaths = [
    '../src/components/ui/atoms',
    '../src/components/ui/molecules'
  ];
  
  const breakpointUsage = {
    sm: 0,
    md: 0,
    lg: 0,
    xl: 0,
    '2xl': 0
  };
  
  componentPaths.forEach(componentPath => {
    const fullPath = path.join(__dirname, componentPath);
    
    if (fs.existsSync(fullPath)) {
      const files = fs.readdirSync(fullPath).filter(file => file.endsWith('.tsx'));
      
      files.forEach(file => {
        const filePath = path.join(fullPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        Object.keys(breakpointUsage).forEach(breakpoint => {
          const pattern = new RegExp(`${breakpoint}:`, 'g');
          const matches = content.match(pattern);
          if (matches) {
            breakpointUsage[breakpoint] += matches.length;
          }
        });
      });
    }
  });
  
  console.log('\n📊 Breakpoint Usage:');
  Object.entries(breakpointUsage).forEach(([breakpoint, count]) => {
    if (count > 0) {
      console.log(`  ${breakpoint}: ${count} implementations`);
    }
  });
  
  const totalBreakpointUsage = Object.values(breakpointUsage).reduce((sum, count) => sum + count, 0);
  console.log(`\n📈 Total responsive utilities: ${totalBreakpointUsage}`);
  
  return {
    hasTailwindConfig: fs.existsSync(tailwindConfig),
    breakpointUsage,
    totalBreakpointUsage
  };
}

// Generate responsive design recommendations
function generateResponsiveRecommendations(cssResults, componentResults, tailwindResults) {
  console.log('\n💡 Responsive Design Recommendations');
  console.log('====================================');
  
  const recommendations = [];
  
  // CSS recommendations
  if (!cssResults.hasMediaQueries) {
    recommendations.push('Add media queries for custom responsive behavior');
  }
  
  if (!cssResults.hasFlexbox && !cssResults.hasGrid) {
    recommendations.push('Implement modern layout systems (Flexbox or CSS Grid)');
  }
  
  // Component recommendations
  if (componentResults.responsiveScore < 70) {
    recommendations.push('Increase responsive component coverage');
    recommendations.push('Add responsive props to more components');
  }
  
  // Tailwind recommendations
  if (tailwindResults.totalBreakpointUsage < 10) {
    recommendations.push('Utilize more Tailwind responsive utilities');
  }
  
  if (!tailwindResults.hasTailwindConfig) {
    recommendations.push('Add Tailwind configuration for custom breakpoints');
  }
  
  // General recommendations
  recommendations.push('Test components across all viewport sizes');
  recommendations.push('Implement mobile-first design approach');
  recommendations.push('Ensure touch targets are at least 44px');
  recommendations.push('Optimize images for different screen densities');
  
  console.log('🔧 Priority Recommendations:');
  recommendations.forEach((rec, index) => {
    console.log(`  ${index + 1}. ${rec}`);
  });
  
  return recommendations;
}

// Generate viewport testing checklist
function generateViewportTestingChecklist() {
  console.log('\n📋 Viewport Testing Checklist');
  console.log('=============================');
  
  const testCategories = [
    {
      name: 'Layout & Spacing',
      tests: [
        'Components maintain proper spacing',
        'Text doesn\'t overflow containers',
        'Images scale appropriately',
        'Grid layouts adapt correctly'
      ]
    },
    {
      name: 'Navigation',
      tests: [
        'Navigation menus are accessible',
        'Hamburger menu works on mobile',
        'Breadcrumbs remain visible',
        'Search functionality adapts'
      ]
    },
    {
      name: 'Interactive Elements',
      tests: [
        'Buttons are properly sized for touch',
        'Form inputs are usable',
        'Dropdowns work correctly',
        'Modal dialogs scale appropriately'
      ]
    },
    {
      name: 'Content Display',
      tests: [
        'Typography scales correctly',
        'Lists and tables adapt',
        'Cards and panels reflow',
        'Content hierarchy is maintained'
      ]
    },
    {
      name: 'Performance',
      tests: [
        'Load times are acceptable',
        'Smooth scrolling performance',
        'Animation frame rates',
        'Memory usage optimization'
      ]
    }
  ];
  
  Object.entries(viewports).forEach(([key, viewport]) => {
    console.log(`\n📱 ${viewport.name} (${viewport.width}x${viewport.height}) - ${viewport.priority} Priority:`);
    console.log(`   ${viewport.description}`);
    
    testCategories.forEach(category => {
      console.log(`   ${category.name}:`);
      category.tests.forEach(test => {
        console.log(`     • ${test}`);
      });
    });
  });
  
  return {
    viewports,
    testCategories
  };
}

// Calculate responsive design score
function calculateResponsiveScore(cssResults, componentResults, tailwindResults) {
  console.log('\n📊 Responsive Design Score');
  console.log('==========================');
  
  // Weight different aspects
  const weights = {
    css: 0.3,
    components: 0.4,
    tailwind: 0.3
  };
  
  // Calculate individual scores
  const cssScore = Math.min(100, (cssResults.totalFeatures / 10) * 100);
  const componentScore = componentResults.responsiveScore;
  const tailwindScore = Math.min(100, (tailwindResults.totalBreakpointUsage / 20) * 100);
  
  // Calculate weighted overall score
  const overallScore = (
    cssScore * weights.css +
    componentScore * weights.components +
    tailwindScore * weights.tailwind
  ).toFixed(1);
  
  console.log(`CSS Features Score: ${cssScore.toFixed(1)}%`);
  console.log(`Component Responsiveness: ${componentScore}%`);
  console.log(`Tailwind Utilization: ${tailwindScore.toFixed(1)}%`);
  console.log(`\n🎯 Overall Responsive Score: ${overallScore}%`);
  
  let grade = 'F';
  if (overallScore >= 90) grade = 'A';
  else if (overallScore >= 80) grade = 'B';
  else if (overallScore >= 70) grade = 'C';
  else if (overallScore >= 60) grade = 'D';
  
  console.log(`📝 Grade: ${grade}`);
  
  return {
    cssScore,
    componentScore,
    tailwindScore,
    overallScore: parseFloat(overallScore),
    grade
  };
}

// Main responsive design test function
function runResponsiveDesignTest() {
  const cssResults = checkResponsiveCSS();
  const componentResults = analyzeComponentResponsiveness();
  const tailwindResults = checkTailwindResponsiveUtilities();
  
  const score = calculateResponsiveScore(cssResults, componentResults, tailwindResults);
  const recommendations = generateResponsiveRecommendations(cssResults, componentResults, tailwindResults);
  const testingChecklist = generateViewportTestingChecklist();
  
  return {
    cssResults,
    componentResults,
    tailwindResults,
    score,
    recommendations,
    testingChecklist
  };
}

// Run the responsive design test
const testResults = runResponsiveDesignTest();

// Export results for use in QA report
export default testResults;