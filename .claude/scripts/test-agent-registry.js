#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

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

function loadJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

function validateAgentSchema(agent, agentId) {
  const required = ['name', 'description', 'category', 'capabilities', 'triggers'];
  const missing = required.filter(field => !(field in agent));
  
  if (missing.length > 0) {
    return { valid: false, errors: [`Missing fields: ${missing.join(', ')}`] };
  }
  
  const errors = [];
  
  // Validate capabilities
  if (!Array.isArray(agent.capabilities) || agent.capabilities.length === 0) {
    errors.push('Capabilities must be a non-empty array');
  }
  
  // Validate triggers
  if (typeof agent.triggers !== 'object') {
    errors.push('Triggers must be an object');
  }
  
  // Validate dependencies
  if ('dependencies' in agent && !Array.isArray(agent.dependencies)) {
    errors.push('Dependencies must be an array');
  }
  
  return { valid: errors.length === 0, errors };
}

function validateAgentImplementation(agentId, registry) {
  const agent = registry.agents[agentId];
  if (!agent) return { exists: false };
  
  const implPath = path.join(
    process.cwd(),
    '.claude/agents',
    `${agent.category}-agents`,
    `${agentId}.json`
  );
  
  const exists = fs.existsSync(implPath);
  let implementation = null;
  let schemaValid = false;
  
  if (exists) {
    implementation = loadJSON(implPath);
    if (implementation) {
      schemaValid = !!(
        implementation.name &&
        implementation.version &&
        implementation.interface &&
        implementation.capabilities
      );
    }
  }
  
  return { exists, implementation, schemaValid, path: implPath };
}

function main() {
  console.log('🔍 Testing Agent Registry...\n');
  
  // Load registry
  const registryPath = path.join(process.cwd(), '.claude/agents/registry.json');
  const registry = loadJSON(registryPath);
  
  if (!registry) {
    log('❌ Failed to load agent registry', 'red');
    process.exit(1);
  }
  
  log('Registry loaded successfully', 'green');
  log(`Version: ${registry.version}`, 'blue');
  log(`Total agents: ${Object.keys(registry.agents).length}\n`, 'blue');
  
  // Validate categories
  log('Categories:', 'yellow');
  const categories = Object.keys(registry.categories);
  categories.forEach(cat => {
    const agentCount = Object.values(registry.agents)
      .filter(a => a.category === cat).length;
    log(`  ${cat}: ${agentCount} agents - ${registry.categories[cat].description}`, 'green');
  });
  
  console.log();
  
  // Validate each agent
  log('Agent Validation:', 'yellow');
  let allValid = true;
  
  for (const [agentId, agent] of Object.entries(registry.agents)) {
    const validation = validateAgentSchema(agent, agentId);
    const implementation = validateAgentImplementation(agentId, registry);
    
    if (validation.valid) {
      log(`  ✅ ${agentId}`, 'green');
      log(`     - ${agent.description}`, 'green');
      log(`     - Category: ${agent.category}`, 'green');
      log(`     - Capabilities: ${agent.capabilities.length}`, 'green');
      
      if (implementation.exists && implementation.schemaValid) {
        log(`     - Implementation: ✅ Valid`, 'green');
      } else if (implementation.exists) {
        log(`     - Implementation: ⚠️  Invalid schema`, 'yellow');
        allValid = false;
      } else {
        log(`     - Implementation: ⏳ Not implemented`, 'yellow');
      }
    } else {
      log(`  ❌ ${agentId}`, 'red');
      validation.errors.forEach(err => {
        log(`     - ${err}`, 'red');
      });
      allValid = false;
    }
    
    console.log();
  }
  
  // Check dependencies
  log('Dependency Check:', 'yellow');
  let depErrors = 0;
  
  for (const [agentId, agent] of Object.entries(registry.agents)) {
    if (agent.dependencies && agent.dependencies.length > 0) {
      for (const dep of agent.dependencies) {
        if (dep !== '*' && !registry.agents[dep]) {
          log(`  ❌ ${agentId} depends on unknown agent: ${dep}`, 'red');
          depErrors++;
        }
      }
    }
  }
  
  if (depErrors === 0) {
    log('  ✅ All dependencies are valid', 'green');
  }
  
  console.log();
  
  // Load and validate templates
  log('Template Validation:', 'yellow');
  const agentTemplate = loadJSON(path.join(process.cwd(), '.claude/agents/agent-template.json'));
  const workflowTemplate = loadJSON(path.join(process.cwd(), '.claude/agents/workflow-template.json'));
  
  if (agentTemplate && agentTemplate.$schema) {
    log('  ✅ Agent template schema is valid', 'green');
  } else {
    log('  ❌ Agent template schema is invalid', 'red');
    allValid = false;
  }
  
  if (workflowTemplate && workflowTemplate.$schema) {
    log('  ✅ Workflow template schema is valid', 'green');
  } else {
    log('  ❌ Workflow template schema is invalid', 'red');
    allValid = false;
  }
  
  console.log();
  
  // Summary
  if (allValid && depErrors === 0) {
    log('✅ Agent registry is valid and ready!', 'green');
    
    // Show available commands
    console.log();
    log('Available Commands:', 'blue');
    const commands = new Set();
    Object.values(registry.agents).forEach(agent => {
      if (agent.triggers && agent.triggers.commands) {
        agent.triggers.commands.forEach(cmd => commands.add(cmd));
      }
    });
    
    Array.from(commands).sort().forEach(cmd => {
      log(`  ${cmd}`, 'green');
    });
    
    process.exit(0);
  } else {
    log('❌ Agent registry has issues that need to be fixed', 'red');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}