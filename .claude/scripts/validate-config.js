#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function validateJSON(filePath, schemaCheck = {}) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(content);
    
    // Basic schema validation
    for (const [key, type] of Object.entries(schemaCheck)) {
      if (!(key in parsed)) {
        throw new Error(`Missing required field: ${key}`);
      }
      if (typeof parsed[key] !== type && type !== 'any') {
        throw new Error(`Field ${key} should be of type ${type}`);
      }
    }
    
    return { valid: true, data: parsed };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

function validateDirectoryStructure() {
  const requiredDirs = [
    '.claude',
    '.claude/commands',
    '.claude/agents',
    '.claude/workflows',
    '.claude/scripts'
  ];
  
  const results = [];
  
  for (const dir of requiredDirs) {
    const fullPath = path.join(process.cwd(), dir);
    const exists = fs.existsSync(fullPath);
    results.push({
      path: dir,
      exists,
      status: exists ? 'pass' : 'fail'
    });
  }
  
  return results;
}

function validateSettings() {
  const settingsPath = path.join(process.cwd(), '.claude/settings.json');
  return validateJSON(settingsPath, {
    tools: 'object',
    agents: 'object',
    workflows: 'object',
    environment: 'object',
    commands: 'object',
    integration: 'object'
  });
}

function validateMCPConfig() {
  const mcpPath = path.join(process.cwd(), '.mcp.json');
  return validateJSON(mcpPath, {
    mcpServers: 'object',
    clients: 'object',
    settings: 'object'
  });
}

function validateCommands() {
  const commandsDir = path.join(process.cwd(), '.claude/commands');
  const results = [];
  
  try {
    const files = fs.readdirSync(commandsDir);
    const mdFiles = files.filter(f => f.endsWith('.md'));
    
    for (const file of mdFiles) {
      const content = fs.readFileSync(path.join(commandsDir, file), 'utf8');
      const hasUsage = content.includes('## Usage');
      const hasDescription = content.includes('#');
      
      results.push({
        file,
        valid: hasUsage && hasDescription,
        checks: { hasUsage, hasDescription }
      });
    }
  } catch (error) {
    return { error: error.message };
  }
  
  return results;
}

function main() {
  console.log('🔍 Validating Claude Configuration...\n');
  
  // Check directory structure
  log('Directory Structure:', 'yellow');
  const dirs = validateDirectoryStructure();
  let allDirsValid = true;
  
  for (const dir of dirs) {
    if (dir.exists) {
      log(`  ✅ ${dir.path}`, 'green');
    } else {
      log(`  ❌ ${dir.path} - Missing`, 'red');
      allDirsValid = false;
    }
  }
  
  console.log();
  
  // Check settings.json
  log('Settings Configuration:', 'yellow');
  const settings = validateSettings();
  if (settings.valid) {
    log('  ✅ .claude/settings.json - Valid JSON', 'green');
    log(`     - ${Object.keys(settings.data.agents.enabledAgents || []).length} agents enabled`, 'green');
    log(`     - Package manager: ${settings.data.environment.packageManager}`, 'green');
  } else {
    log(`  ❌ .claude/settings.json - ${settings.error}`, 'red');
  }
  
  console.log();
  
  // Check .mcp.json
  log('MCP Configuration:', 'yellow');
  const mcp = validateMCPConfig();
  if (mcp.valid) {
    log('  ✅ .mcp.json - Valid JSON', 'green');
    const serverCount = Object.keys(mcp.data.mcpServers || {}).length;
    log(`     - ${serverCount} server(s) configured`, 'green');
  } else {
    log(`  ❌ .mcp.json - ${mcp.error}`, 'red');
  }
  
  console.log();
  
  // Check commands
  log('Commands:', 'yellow');
  const commands = validateCommands();
  if (!commands.error) {
    const validCommands = commands.filter(c => c.valid).length;
    log(`  ✅ ${validCommands}/${commands.length} valid command files`, 'green');
    
    for (const cmd of commands) {
      if (!cmd.valid) {
        log(`     ⚠️  ${cmd.file} - Missing required sections`, 'yellow');
      }
    }
  } else {
    log(`  ❌ Error reading commands: ${commands.error}`, 'red');
  }
  
  console.log();
  
  // Summary
  const allValid = allDirsValid && settings.valid && mcp.valid && !commands.error;
  
  if (allValid) {
    log('✅ All validations passed! Claude configuration is ready.', 'green');
    process.exit(0);
  } else {
    log('❌ Some validations failed. Please fix the issues above.', 'red');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}