#!/usr/bin/env node

/**
 * Setup script for Code Review Git hooks
 */

const path = require('path');
const { gitHooksIntegration } = require('../git-hooks');

async function main() {
  console.log('🔧 Setting up Code Review Git hooks...\n');

  const projectRoot = process.cwd();
  
  // Parse command line options
  const args = process.argv.slice(2);
  const options = {};
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--lightweight':
        options.lightweight = true;
        break;
      case '--analyzers':
        options.analyzers = args[++i].split(',');
        break;
      case '--max-files':
        options.maxFiles = parseInt(args[++i], 10);
        break;
      case '--timeout':
        options.timeoutMs = parseInt(args[++i], 10);
        break;
      case '--help':
        showHelp();
        return;
    }
  }

  try {
    await gitHooksIntegration.setupGitIntegration(projectRoot, options);
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
Code Review Git Hooks Setup

Usage: node setup-hooks.js [options]

Options:
  --lightweight       Enable lightweight mode (faster, less thorough)
  --analyzers <list>  Comma-separated list of analyzers to run
                      (default: eslint,typescript,security)
  --max-files <n>     Maximum files to review in pre-commit (default: 20)
  --timeout <ms>      Timeout for pre-commit review (default: 10000)
  --help              Show this help message

Examples:
  node setup-hooks.js
  node setup-hooks.js --lightweight --max-files 10
  node setup-hooks.js --analyzers eslint,security
`);
}

main().catch(console.error);