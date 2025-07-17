#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Bundle size analysis for TaskMaster UI
console.log('📊 TaskMaster UI Bundle Analysis');
console.log('====================================');

// Main application build
const distPath = path.join(__dirname, '../dist');
const storybookPath = path.join(__dirname, '../storybook-static');

function analyzeDirectory(dirPath, label) {
  console.log(`\n${label}:`);
  console.log('-'.repeat(label.length + 1));
  
  if (!fs.existsSync(dirPath)) {
    console.log('❌ Directory not found');
    return;
  }
  
  const files = fs.readdirSync(dirPath);
  let totalSize = 0;
  let cssSize = 0;
  let jsSize = 0;
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isFile()) {
      const size = stats.size;
      totalSize += size;
      
      if (file.endsWith('.css')) {
        cssSize += size;
        console.log(`  📝 ${file}: ${(size / 1024).toFixed(2)} KB`);
      } else if (file.endsWith('.js')) {
        jsSize += size;
        console.log(`  📦 ${file}: ${(size / 1024).toFixed(2)} KB`);
      } else if (file.endsWith('.html')) {
        console.log(`  📄 ${file}: ${(size / 1024).toFixed(2)} KB`);
      }
    } else if (stats.isDirectory() && file === 'assets') {
      // Analyze assets directory
      const assetsPath = path.join(dirPath, file);
      const assetFiles = fs.readdirSync(assetsPath);
      
      assetFiles.forEach(assetFile => {
        const assetPath = path.join(assetsPath, assetFile);
        const assetStats = fs.statSync(assetPath);
        
        if (assetStats.isFile()) {
          const size = assetStats.size;
          totalSize += size;
          
          if (assetFile.endsWith('.css')) {
            cssSize += size;
            console.log(`  📝 ${assetFile}: ${(size / 1024).toFixed(2)} KB`);
          } else if (assetFile.endsWith('.js')) {
            jsSize += size;
            console.log(`  📦 ${assetFile}: ${(size / 1024).toFixed(2)} KB`);
          }
        }
      });
    }
  });
  
  console.log(`\n  📊 Total Size: ${(totalSize / 1024).toFixed(2)} KB`);
  console.log(`  📝 CSS Size: ${(cssSize / 1024).toFixed(2)} KB`);
  console.log(`  📦 JS Size: ${(jsSize / 1024).toFixed(2)} KB`);
  
  return { totalSize, cssSize, jsSize };
}

// Analyze main application
const mainApp = analyzeDirectory(distPath, '🌐 Main Application Build');

// Analyze Storybook
const storybook = analyzeDirectory(storybookPath, '📚 Storybook Build');

// CSS Bundle Analysis
console.log('\n🎨 CSS Bundle Analysis');
console.log('======================');

if (mainApp && mainApp.cssSize > 0) {
  console.log(`Main App CSS: ${(mainApp.cssSize / 1024).toFixed(2)} KB`);
  
  // Analyze CSS content if possible
  const cssFiles = fs.readdirSync(path.join(distPath, 'assets')).filter(f => f.endsWith('.css'));
  
  if (cssFiles.length > 0) {
    const cssFile = cssFiles[0];
    const cssPath = path.join(distPath, 'assets', cssFile);
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    
    // Basic CSS analysis
    const tailwindClasses = cssContent.match(/\.[a-z-]+(?:\[[^\]]+\])?/g) || [];
    const uniqueClasses = [...new Set(tailwindClasses)];
    
    console.log(`Unique CSS Classes: ${uniqueClasses.length}`);
    console.log(`CSS Content Length: ${cssContent.length} characters`);
    
    // Check for common optimization opportunities
    const hasSourceMap = cssContent.includes('sourceMappingURL');
    const hasComments = cssContent.includes('/*');
    const hasMinification = !cssContent.includes('\n  ');
    
    console.log(`\n🔍 CSS Optimization Check:`);
    console.log(`  ✅ Minified: ${hasMinification}`);
    console.log(`  ${hasSourceMap ? '⚠️' : '✅'} Source Maps: ${hasSourceMap ? 'Present' : 'Removed'}`);
    console.log(`  ${hasComments ? '⚠️' : '✅'} Comments: ${hasComments ? 'Present' : 'Removed'}`);
  }
}

// Bundle size recommendations
console.log('\n💡 Bundle Size Recommendations');
console.log('===============================');

if (mainApp) {
  const totalKB = mainApp.totalSize / 1024;
  const cssKB = mainApp.cssSize / 1024;
  const jsKB = mainApp.jsSize / 1024;
  
  console.log(`Current bundle size: ${totalKB.toFixed(2)} KB`);
  
  if (cssKB > 50) {
    console.log('⚠️  CSS bundle is large (>50KB). Consider:');
    console.log('   • Purging unused CSS classes');
    console.log('   • Using CSS-in-JS for component-specific styles');
    console.log('   • Implementing CSS code splitting');
  } else {
    console.log('✅ CSS bundle size is reasonable');
  }
  
  if (jsKB > 200) {
    console.log('⚠️  JS bundle is large (>200KB). Consider:');
    console.log('   • Code splitting with dynamic imports');
    console.log('   • Tree shaking optimization');
    console.log('   • Analyzing bundle with webpack-bundle-analyzer');
  } else {
    console.log('✅ JS bundle size is reasonable');
  }
}

// Performance benchmarks
console.log('\n📈 Performance Benchmarks');
console.log('==========================');

const benchmarks = {
  'Fast 3G Load Time': {
    threshold: 100, // KB
    description: 'Should load in <3 seconds on Fast 3G (1.4 Mbps)'
  },
  'Mobile Data Friendly': {
    threshold: 150, // KB
    description: 'Reasonable for mobile users with data limits'
  },
  'Desktop Broadband': {
    threshold: 500, // KB
    description: 'Acceptable for desktop users with broadband'
  }
};

if (mainApp) {
  const totalKB = mainApp.totalSize / 1024;
  
  Object.entries(benchmarks).forEach(([name, { threshold, description }]) => {
    const status = totalKB <= threshold ? '✅' : '❌';
    console.log(`${status} ${name}: ${totalKB.toFixed(2)}KB ${totalKB <= threshold ? '≤' : '>'} ${threshold}KB`);
    console.log(`   ${description}`);
  });
}

console.log('\n🎯 Summary and Next Steps');
console.log('==========================');

if (mainApp) {
  const cssKB = mainApp.cssSize / 1024;
  const currentReduction = ((60 - cssKB) / 60) * 100; // Assuming 60KB baseline
  
  console.log(`Current CSS size: ${cssKB.toFixed(2)} KB`);
  
  if (cssKB < 52) {
    console.log('✅ CSS bundle size reduction target achieved');
  } else {
    console.log('⚠️  CSS bundle size could be optimized further');
    console.log('💡 Recommended optimizations:');
    console.log('   • Enable PostCSS optimization plugins');
    console.log('   • Configure PurgeCSS for unused styles');
    console.log('   • Use CSS modules for better tree shaking');
  }
}