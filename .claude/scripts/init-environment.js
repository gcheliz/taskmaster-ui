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

function checkCommand(command) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function checkPNPM() {
  if (!checkCommand('pnpm')) {
    log('❌ PNPM is not installed', 'red');
    log('   Please install PNPM: npm install -g pnpm', 'yellow');
    return false;
  }
  
  const version = execSync('pnpm --version', { encoding: 'utf8' }).trim();
  log(`✅ PNPM v${version} is installed`, 'green');
  return true;
}

function checkNodeVersion() {
  const nodeVersion = process.version;
  const major = parseInt(nodeVersion.split('.')[0].substring(1));
  
  if (major < 18) {
    log(`❌ Node.js ${nodeVersion} is too old (minimum: v18)`, 'red');
    return false;
  }
  
  log(`✅ Node.js ${nodeVersion}`, 'green');
  return true;
}

function checkWorkspaceStructure() {
  const requiredPaths = [
    'packages/backend',
    'packages/frontend',
    'package.json',
    'pnpm-workspace.yaml'
  ];
  
  let allExist = true;
  
  for (const p of requiredPaths) {
    const fullPath = path.join(process.cwd(), p);
    if (fs.existsSync(fullPath)) {
      log(`✅ ${p}`, 'green');
    } else {
      log(`❌ Missing: ${p}`, 'red');
      allExist = false;
    }
  }
  
  return allExist;
}

function loadEnvironmentConfig(env = 'development') {
  const envPath = path.join(process.cwd(), '.claude/environments', `${env}.json`);
  
  try {
    const config = JSON.parse(fs.readFileSync(envPath, 'utf8'));
    return config;
  } catch (error) {
    log(`❌ Could not load environment config: ${env}`, 'red');
    return null;
  }
}

function updateSettingsForEnvironment(env) {
  const settingsPath = path.join(process.cwd(), '.claude/settings.json');
  const envConfig = loadEnvironmentConfig(env);
  
  if (!envConfig) return false;
  
  try {
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    
    // Update resource limits
    if (envConfig.resourceLimits) {
      settings.tools.preferences.resourceLimits = {
        ...settings.tools.preferences.resourceLimits,
        ...envConfig.resourceLimits
      };
    }
    
    // Update environment settings
    settings.environment = {
      ...settings.environment,
      current: env,
      ...envConfig.paths
    };
    
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    log(`✅ Updated settings for ${env} environment`, 'green');
    return true;
  } catch (error) {
    log(`❌ Failed to update settings: ${error.message}`, 'red');
    return false;
  }
}

function createDirectories() {
  const dirs = [
    '.claude/tmp',
    '.claude/logs',
    '.claude/state'
  ];
  
  for (const dir of dirs) {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      log(`✅ Created ${dir}`, 'green');
    }
  }
}

function checkAPIKeys() {
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    log('⚠️  No .env file found', 'yellow');
    log('   Some agents may require API keys', 'yellow');
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredKeys = [
    'ANTHROPIC_API_KEY',
    'OPENAI_API_KEY',
    'DATABASE_URL'
  ];
  
  const missingKeys = requiredKeys.filter(key => !envContent.includes(key));
  
  if (missingKeys.length > 0) {
    log('⚠️  Missing API keys:', 'yellow');
    missingKeys.forEach(key => log(`   - ${key}`, 'yellow'));
  } else {
    log('✅ All required API keys are present', 'green');
  }
  
  return missingKeys.length === 0;
}

function initializeGitHooks() {
  const hooksDir = path.join(process.cwd(), '.git/hooks');
  
  if (!fs.existsSync(hooksDir)) {
    log('⚠️  Git hooks directory not found', 'yellow');
    return false;
  }
  
  // Create pre-commit hook
  const preCommitHook = `#!/bin/sh
# Claude AI pre-commit hook

# Run Claude validation workflow
node .claude/scripts/run-workflow.js pre-commit-validation --quick-mode

# Run standard pre-commit checks
pnpm run precommit
`;
  
  const preCommitPath = path.join(hooksDir, 'pre-commit');
  
  try {
    fs.writeFileSync(preCommitPath, preCommitHook);
    fs.chmodSync(preCommitPath, '755');
    log('✅ Git pre-commit hook installed', 'green');
    return true;
  } catch (error) {
    log(`❌ Failed to install git hook: ${error.message}`, 'red');
    return false;
  }
}

function main() {
  const args = process.argv.slice(2);
  const options = {
    reset: args.includes('--reset'),
    validate: args.includes('--validate'),
    verbose: args.includes('--verbose'),
    env: args.find(a => a.startsWith('--env='))?.split('=')[1] || 'development'
  };
  
  console.log('🚀 Initializing Claude AI Environment...\n');
  
  // Step 1: Validate environment
  log('Environment Checks:', 'yellow');
  const checks = {
    node: checkNodeVersion(),
    pnpm: checkPNPM(),
    workspace: checkWorkspaceStructure()
  };
  
  if (!Object.values(checks).every(v => v)) {
    log('\n❌ Environment validation failed', 'red');
    process.exit(1);
  }
  
  console.log();
  
  // Step 2: Load environment config
  log(`Loading ${options.env} environment...`, 'yellow');
  const envConfig = loadEnvironmentConfig(options.env);
  
  if (!envConfig) {
    process.exit(1);
  }
  
  log(`✅ Loaded ${envConfig.name} configuration`, 'green');
  
  console.log();
  
  // Step 3: Update settings
  log('Updating Configuration:', 'yellow');
  updateSettingsForEnvironment(options.env);
  createDirectories();
  
  console.log();
  
  // Step 4: Check API keys
  log('API Keys:', 'yellow');
  checkAPIKeys();
  
  console.log();
  
  // Step 5: Initialize Git hooks
  log('Git Integration:', 'yellow');
  initializeGitHooks();
  
  console.log();
  
  // Summary
  log('✅ Claude AI environment initialized successfully!', 'green');
  log(`   Environment: ${options.env}`, 'blue');
  log(`   Package Manager: ${envConfig.commands.packageManager}`, 'blue');
  log(`   Resource Limits: ${envConfig.resourceLimits.maxThreads} threads, ${envConfig.resourceLimits.maxMemory} memory`, 'blue');
  
  console.log();
  log('Next Steps:', 'yellow');
  log('1. Run "pnpm install" to install dependencies', 'green');
  log('2. Use /init command to initialize agents', 'green');
  log('3. Try /feature command to start a new feature', 'green');
  log('4. Check .claude/logs for detailed information', 'green');
}

if (require.main === module) {
  main();
}