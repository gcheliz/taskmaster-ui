#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Cross-browser compatibility test for TaskMaster UI
console.log('🌐 TaskMaster UI Cross-Browser Compatibility Test');
console.log('================================================');

// Browser support matrix
const supportedBrowsers = {
  chrome: {
    name: 'Chrome',
    minVersion: '88',
    features: ['CSS Grid', 'Flexbox', 'CSS Custom Properties', 'ES6 Modules']
  },
  firefox: {
    name: 'Firefox',
    minVersion: '85',
    features: ['CSS Grid', 'Flexbox', 'CSS Custom Properties', 'ES6 Modules']
  },
  safari: {
    name: 'Safari',
    minVersion: '14',
    features: ['CSS Grid', 'Flexbox', 'CSS Custom Properties', 'ES6 Modules']
  },
  edge: {
    name: 'Microsoft Edge',
    minVersion: '88',
    features: ['CSS Grid', 'Flexbox', 'CSS Custom Properties', 'ES6 Modules']
  }
};

// CSS feature compatibility check
function checkCSSFeatures() {
  console.log('\n🎨 CSS Features Compatibility Check');
  console.log('=====================================');
  
  const cssPath = path.join(__dirname, '../src/styles/base.css');
  const indexCssPath = path.join(__dirname, '../src/index.css');
  
  const cssFeatures = [
    {
      name: 'CSS Custom Properties (CSS Variables)',
      pattern: /var\(--[\w-]+\)/g,
      supported: ['Chrome 49+', 'Firefox 31+', 'Safari 9.1+', 'Edge 15+'],
      fallback: 'hardcoded values'
    },
    {
      name: 'CSS Grid',
      pattern: /display:\s*grid|grid-template|grid-gap|gap:/g,
      supported: ['Chrome 57+', 'Firefox 52+', 'Safari 10.1+', 'Edge 16+'],
      fallback: 'flexbox layout'
    },
    {
      name: 'Flexbox',
      pattern: /display:\s*flex|flex-direction|justify-content|align-items/g,
      supported: ['Chrome 21+', 'Firefox 28+', 'Safari 9+', 'Edge 12+'],
      fallback: 'float layout'
    },
    {
      name: 'CSS Transforms',
      pattern: /transform:|translateX|translateY|scale|rotate/g,
      supported: ['Chrome 36+', 'Firefox 16+', 'Safari 9+', 'Edge 12+'],
      fallback: 'position properties'
    },
    {
      name: 'CSS Transitions',
      pattern: /transition:|transition-property|transition-duration/g,
      supported: ['Chrome 26+', 'Firefox 16+', 'Safari 9+', 'Edge 12+'],
      fallback: 'instant state changes'
    },
    {
      name: 'CSS Box Shadow',
      pattern: /box-shadow:/g,
      supported: ['Chrome 10+', 'Firefox 4+', 'Safari 5.1+', 'Edge 12+'],
      fallback: 'border styling'
    },
    {
      name: 'CSS Border Radius',
      pattern: /border-radius:/g,
      supported: ['Chrome 5+', 'Firefox 4+', 'Safari 5+', 'Edge 12+'],
      fallback: 'square corners'
    },
    {
      name: 'CSS Focus Visible',
      pattern: /focus-visible/g,
      supported: ['Chrome 86+', 'Firefox 85+', 'Safari 15.4+', 'Edge 86+'],
      fallback: ':focus pseudo-class'
    },
    {
      name: 'CSS Logical Properties',
      pattern: /margin-inline|padding-inline|border-inline|inset-inline/g,
      supported: ['Chrome 87+', 'Firefox 66+', 'Safari 14.1+', 'Edge 87+'],
      fallback: 'physical properties'
    },
    {
      name: 'CSS Container Queries',
      pattern: /@container/g,
      supported: ['Chrome 105+', 'Firefox 110+', 'Safari 16+', 'Edge 105+'],
      fallback: 'media queries'
    }
  ];
  
  const cssFiles = [
    { path: cssPath, name: 'base.css' },
    { path: indexCssPath, name: 'index.css' }
  ];
  
  let totalFeatures = 0;
  let modernFeatures = 0;
  
  cssFiles.forEach(({ path: filePath, name }) => {
    if (fs.existsSync(filePath)) {
      const cssContent = fs.readFileSync(filePath, 'utf8');
      
      console.log(`\n📄 Analyzing ${name}:`);
      
      cssFeatures.forEach(feature => {
        const matches = cssContent.match(feature.pattern);
        if (matches) {
          totalFeatures++;
          console.log(`  ✅ ${feature.name}: ${matches.length} uses`);
          console.log(`    📱 Supported: ${feature.supported.join(', ')}`);
          
          // Check if it's a modern feature (released in the last 3 years)
          const isModern = feature.supported.some(browser => {
            const version = parseInt(browser.match(/\d+/)[0]);
            return (browser.includes('Chrome') && version >= 85) ||
                   (browser.includes('Firefox') && version >= 85) ||
                   (browser.includes('Safari') && version >= 14) ||
                   (browser.includes('Edge') && version >= 85);
          });
          
          if (isModern) {
            modernFeatures++;
            console.log(`    ⚠️ Modern feature - ensure fallback: ${feature.fallback}`);
          }
        }
      });
    }
  });
  
  console.log(`\n📊 CSS Features Summary:`);
  console.log(`  Total features used: ${totalFeatures}`);
  console.log(`  Modern features: ${modernFeatures}`);
  console.log(`  Legacy compatibility: ${((totalFeatures - modernFeatures) / totalFeatures * 100).toFixed(1)}%`);
  
  return {
    totalFeatures,
    modernFeatures,
    legacyCompatibility: ((totalFeatures - modernFeatures) / totalFeatures * 100).toFixed(1)
  };
}

// JavaScript feature compatibility check
function checkJavaScriptFeatures() {
  console.log('\n🚀 JavaScript Features Compatibility Check');
  console.log('==========================================');
  
  const jsFeatures = [
    {
      name: 'ES6 Modules (import/export)',
      pattern: /import\s+.*from|export\s+(default\s+)?/g,
      supported: ['Chrome 61+', 'Firefox 60+', 'Safari 10.1+', 'Edge 16+'],
      fallback: 'CommonJS or bundler'
    },
    {
      name: 'Arrow Functions',
      pattern: /=>\s*[{(]|=>\s*\w/g,
      supported: ['Chrome 45+', 'Firefox 22+', 'Safari 10+', 'Edge 12+'],
      fallback: 'function expressions'
    },
    {
      name: 'Async/Await',
      pattern: /async\s+function|await\s+/g,
      supported: ['Chrome 55+', 'Firefox 52+', 'Safari 10.1+', 'Edge 14+'],
      fallback: 'Promises'
    },
    {
      name: 'Destructuring',
      pattern: /const\s*{\s*\w+.*}|const\s*\[\s*\w+.*\]/g,
      supported: ['Chrome 49+', 'Firefox 41+', 'Safari 8+', 'Edge 14+'],
      fallback: 'property access'
    },
    {
      name: 'Template Literals',
      pattern: /`.*\${.*}.*`/g,
      supported: ['Chrome 41+', 'Firefox 34+', 'Safari 9+', 'Edge 12+'],
      fallback: 'string concatenation'
    },
    {
      name: 'Spread Operator',
      pattern: /\.\.\.\w+/g,
      supported: ['Chrome 46+', 'Firefox 16+', 'Safari 8+', 'Edge 12+'],
      fallback: 'Array.concat() or Object.assign()'
    },
    {
      name: 'Optional Chaining',
      pattern: /\?\./g,
      supported: ['Chrome 80+', 'Firefox 72+', 'Safari 13.1+', 'Edge 80+'],
      fallback: '&& operator checks'
    },
    {
      name: 'Nullish Coalescing',
      pattern: /\?\?/g,
      supported: ['Chrome 80+', 'Firefox 72+', 'Safari 13.1+', 'Edge 80+'],
      fallback: '|| operator'
    }
  ];
  
  const componentPaths = [
    '../src/components/ui/atoms',
    '../src/components/ui/molecules'
  ];
  
  let totalJsFeatures = 0;
  let modernJsFeatures = 0;
  
  componentPaths.forEach(componentPath => {
    const fullPath = path.join(__dirname, componentPath);
    
    if (fs.existsSync(fullPath)) {
      const files = fs.readdirSync(fullPath).filter(file => file.endsWith('.tsx'));
      
      files.forEach(file => {
        const filePath = path.join(fullPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        jsFeatures.forEach(feature => {
          const matches = content.match(feature.pattern);
          if (matches) {
            totalJsFeatures++;
            
            // Check if it's a modern feature
            const isModern = feature.supported.some(browser => {
              const versionMatch = browser.match(/\d+/);
              if (!versionMatch) return false;
              const version = parseInt(versionMatch[0]);
              return (browser.includes('Chrome') && version >= 70) ||
                     (browser.includes('Firefox') && version >= 70) ||
                     (browser.includes('Safari') && version >= 13) ||
                     (browser.includes('Edge') && version >= 70);
            });
            
            if (isModern) {
              modernJsFeatures++;
            }
          }
        });
      });
    }
  });
  
  console.log(`\n📊 JavaScript Features Summary:`);
  jsFeatures.forEach(feature => {
    console.log(`  ${feature.name}:`);
    console.log(`    📱 Supported: ${feature.supported.join(', ')}`);
    console.log(`    🔄 Fallback: ${feature.fallback}`);
  });
  
  console.log(`\n📈 JavaScript Compatibility:`);
  console.log(`  Total modern features: ${modernJsFeatures}`);
  console.log(`  Legacy compatibility: ${((totalJsFeatures - modernJsFeatures) / totalJsFeatures * 100).toFixed(1)}%`);
  
  return {
    totalJsFeatures,
    modernJsFeatures,
    legacyCompatibility: ((totalJsFeatures - modernJsFeatures) / totalJsFeatures * 100).toFixed(1)
  };
}

// Package.json browser support check
function checkPackageSupport() {
  console.log('\n📦 Package.json Browser Support Configuration');
  console.log('=============================================');
  
  const packagePath = path.join(__dirname, '../package.json');
  
  if (fs.existsSync(packagePath)) {
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    console.log('🔍 Checking for browser support configuration...');
    
    // Check for browserslist
    if (packageContent.browserslist) {
      console.log('✅ Browserslist configuration found:');
      if (Array.isArray(packageContent.browserslist)) {
        packageContent.browserslist.forEach((config, index) => {
          console.log(`  ${index + 1}. ${config}`);
        });
      } else {
        Object.entries(packageContent.browserslist).forEach(([env, config]) => {
          console.log(`  ${env}: ${Array.isArray(config) ? config.join(', ') : config}`);
        });
      }
    } else {
      console.log('⚠️ No browserslist configuration found');
      console.log('💡 Consider adding browserslist for better browser support definition');
    }
    
    // Check for TypeScript target
    const tsConfigPath = path.join(__dirname, '../tsconfig.json');
    if (fs.existsSync(tsConfigPath)) {
      const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
      if (tsConfig.compilerOptions && tsConfig.compilerOptions.target) {
        console.log(`✅ TypeScript target: ${tsConfig.compilerOptions.target}`);
      }
    }
    
    // Check for Vite configuration
    const viteConfigPath = path.join(__dirname, '../vite.config.ts');
    if (fs.existsSync(viteConfigPath)) {
      console.log('✅ Vite configuration found for build optimization');
    }
  }
  
  return {
    hasPackageConfig: fs.existsSync(packagePath),
    hasBrowserslist: fs.existsSync(packagePath) && JSON.parse(fs.readFileSync(packagePath, 'utf8')).browserslist
  };
}

// Generate browser compatibility report
function generateCompatibilityReport(cssResults, jsResults, packageResults) {
  console.log('\n📊 Cross-Browser Compatibility Report');
  console.log('=====================================');
  
  const compatibilityScore = (
    (parseFloat(cssResults.legacyCompatibility) + 
     parseFloat(jsResults.legacyCompatibility)) / 2
  ).toFixed(1);
  
  console.log(`🎯 Overall Compatibility Score: ${compatibilityScore}%`);
  
  let grade = 'F';
  if (compatibilityScore >= 90) grade = 'A';
  else if (compatibilityScore >= 80) grade = 'B';
  else if (compatibilityScore >= 70) grade = 'C';
  else if (compatibilityScore >= 60) grade = 'D';
  
  console.log(`📝 Grade: ${grade}`);
  
  // Browser support recommendations
  console.log('\n🎯 Browser Support Matrix:');
  Object.entries(supportedBrowsers).forEach(([key, browser]) => {
    console.log(`  ${browser.name} ${browser.minVersion}+:`);
    browser.features.forEach(feature => {
      console.log(`    ✅ ${feature}`);
    });
  });
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  
  if (cssResults.modernFeatures > 0) {
    console.log('  • Test CSS fallbacks for older browsers');
    console.log('  • Consider using PostCSS autoprefixer for vendor prefixes');
  }
  
  if (jsResults.modernJsFeatures > 0) {
    console.log('  • Ensure Babel is configured for target browsers');
    console.log('  • Test with polyfills for older browser support');
  }
  
  if (!packageResults.hasBrowserslist) {
    console.log('  • Add browserslist configuration to package.json');
  }
  
  console.log('  • Conduct manual testing on target browsers');
  console.log('  • Consider using BrowserStack or similar for automated testing');
  console.log('  • Implement progressive enhancement for advanced features');
  
  return {
    compatibilityScore: parseFloat(compatibilityScore),
    grade,
    recommendations: [
      'Test CSS fallbacks for older browsers',
      'Configure Babel for target browsers',
      'Add browserslist configuration',
      'Conduct manual browser testing',
      'Implement progressive enhancement'
    ]
  };
}

// Main cross-browser test function
function runCrossBrowserTest() {
  const cssResults = checkCSSFeatures();
  const jsResults = checkJavaScriptFeatures();
  const packageResults = checkPackageSupport();
  
  const report = generateCompatibilityReport(cssResults, jsResults, packageResults);
  
  return {
    cssResults,
    jsResults,
    packageResults,
    report
  };
}

// Testing recommendations
function generateTestingRecommendations() {
  console.log('\n🧪 Manual Testing Recommendations');
  console.log('=================================');
  
  const testScenarios = [
    {
      browser: 'Chrome',
      version: '88+',
      focus: 'Modern CSS features, performance',
      priority: 'High'
    },
    {
      browser: 'Firefox',
      version: '85+',
      focus: 'CSS Grid, accessibility',
      priority: 'High'
    },
    {
      browser: 'Safari',
      version: '14+',
      focus: 'WebKit-specific issues, mobile',
      priority: 'High'
    },
    {
      browser: 'Edge',
      version: '88+',
      focus: 'Legacy compatibility, enterprise',
      priority: 'Medium'
    }
  ];
  
  console.log('🎯 Priority Testing Matrix:');
  testScenarios.forEach(scenario => {
    console.log(`  ${scenario.browser} ${scenario.version}:`);
    console.log(`    🔍 Focus: ${scenario.focus}`);
    console.log(`    ⚡ Priority: ${scenario.priority}`);
  });
  
  console.log('\n📱 Device Testing:');
  console.log('  • Desktop: 1920x1080, 1366x768');
  console.log('  • Tablet: 768x1024, 1024x768');
  console.log('  • Mobile: 375x667, 414x896');
  
  console.log('\n🧪 Test Cases:');
  console.log('  • Component rendering and layout');
  console.log('  • Interactive elements (buttons, forms)');
  console.log('  • Navigation and accessibility');
  console.log('  • Performance and loading times');
  console.log('  • Error handling and fallbacks');
  
  return testScenarios;
}

// Run the cross-browser test
const testResults = runCrossBrowserTest();
const testingRecommendations = generateTestingRecommendations();

// Export results for use in QA report
export default {
  ...testResults,
  testingRecommendations
};