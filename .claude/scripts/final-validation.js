#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  const exists = fs.existsSync(path.join(process.cwd(), filePath));
  if (exists) {
    log(`✅ ${description}`, 'green');
  } else {
    log(`❌ ${description} - Missing`, 'red');
  }
  return exists;
}

function checkJSON(filePath, description) {
  try {
    const content = fs.readFileSync(path.join(process.cwd(), filePath), 'utf8');
    JSON.parse(content);
    log(`✅ ${description} - Valid JSON`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} - Invalid JSON`, 'red');
    return false;
  }
}

function main() {
  console.log('🔍 Final Claude Configuration Validation\n');
  
  let allPassed = true;
  
  // Core Configuration Files
  log('Core Configuration:', 'yellow');
  allPassed &= checkJSON('.claude/settings.json', 'Claude settings');
  allPassed &= checkJSON('.mcp.json', 'MCP configuration');
  allPassed &= checkFile('.claude/commands/init.md', 'Init command');
  
  console.log();
  
  // Agent Configuration
  log('Agent System:', 'yellow');
  allPassed &= checkJSON('.claude/agents/registry.json', 'Agent registry');
  allPassed &= checkJSON('.claude/agents/agent-template.json', 'Agent template');
  allPassed &= checkJSON('.claude/agents/workflow-template.json', 'Workflow template');
  allPassed &= checkJSON('.claude/agents/backend-agents/api-development.json', 'API Development agent');
  allPassed &= checkJSON('.claude/agents/frontend-agents/component-development.json', 'Component Development agent');
  
  console.log();
  
  // Workflow Configuration
  log('Workflow System:', 'yellow');
  const workflows = [
    'feature-development.yaml',
    'bug-fix.yaml',
    'refactoring.yaml',
    'pre-commit-validation.yaml',
    'deployment.yaml'
  ];
  
  workflows.forEach(w => {
    allPassed &= checkFile(`.claude/workflows/${w}`, `${w.replace('.yaml', '')} workflow`);
  });
  
  console.log();
  
  // Environment Configuration
  log('Environment Configuration:', 'yellow');
  allPassed &= checkJSON('.claude/environments/development.json', 'Development environment');
  allPassed &= checkJSON('.claude/environments/staging.json', 'Staging environment');
  allPassed &= checkJSON('.claude/environments/production.json', 'Production environment');
  
  console.log();
  
  // Scripts and Tools
  log('Scripts and Tools:', 'yellow');
  allPassed &= checkFile('.claude/scripts/validate-config.js', 'Config validator');
  allPassed &= checkFile('.claude/scripts/test-agent-registry.js', 'Registry tester');
  allPassed &= checkFile('.claude/scripts/validate-workflows.js', 'Workflow validator');
  allPassed &= checkFile('.claude/scripts/init-environment.js', 'Environment initializer');
  
  console.log();
  
  // Directory Structure
  log('Directory Structure:', 'yellow');
  const dirs = [
    '.claude/commands',
    '.claude/agents/backend-agents',
    '.claude/agents/frontend-agents',
    '.claude/workflows',
    '.claude/environments',
    '.claude/scripts',
    '.claude/tmp',
    '.claude/logs',
    '.claude/state'
  ];
  
  dirs.forEach(dir => {
    allPassed &= checkFile(dir, dir);
  });
  
  console.log();
  
  // Run validation scripts
  log('Running Validation Scripts:', 'yellow');
  
  try {
    execSync('node .claude/scripts/validate-config.js', { stdio: 'pipe' });
    log('✅ Configuration validation passed', 'green');
  } catch (error) {
    log('❌ Configuration validation failed', 'red');
    allPassed = false;
  }
  
  try {
    execSync('node .claude/scripts/test-agent-registry.js', { stdio: 'pipe' });
    log('✅ Agent registry validation passed', 'green');
  } catch (error) {
    log('❌ Agent registry validation failed', 'red');
    allPassed = false;
  }
  
  try {
    execSync('node .claude/scripts/validate-workflows.js', { stdio: 'pipe' });
    log('✅ Workflow validation passed', 'green');
  } catch (error) {
    log('❌ Workflow validation failed', 'red');
    allPassed = false;
  }
  
  console.log();
  
  // Summary
  if (allPassed) {
    log('✅ All validations passed!', 'green');
    log('\nClaude AI configuration is complete and ready to use!', 'green');
    
    console.log();
    log('Available Commands:', 'blue');
    log('  /init - Initialize agents', 'green');
    log('  /api-endpoint - Create API endpoint', 'green');
    log('  /component - Generate React component', 'green');
    log('  /feature - Start feature workflow', 'green');
    log('  /bugfix - Fix a bug', 'green');
    log('  /refactor - Refactor code', 'green');
    log('  /deploy - Deploy to environment', 'green');
    log('  /review - Run code review', 'green');
    log('  /docs - Generate documentation', 'green');
    
    process.exit(0);
  } else {
    log('❌ Some validations failed', 'red');
    log('Please check the errors above and fix them', 'yellow');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}