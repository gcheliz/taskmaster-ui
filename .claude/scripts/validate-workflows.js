#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

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

function loadYAML(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return yaml.load(content);
  } catch (error) {
    return { error: error.message };
  }
}

function validateWorkflowSchema(workflow, filename) {
  const required = ['name', 'version', 'description', 'triggers', 'steps'];
  const errors = [];
  
  // Check required fields
  for (const field of required) {
    if (!(field in workflow)) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  // Validate version format
  if (workflow.version && !/^\d+\.\d+\.\d+$/.test(workflow.version)) {
    errors.push('Version must follow semantic versioning (x.y.z)');
  }
  
  // Validate triggers
  if (workflow.triggers && typeof workflow.triggers !== 'object') {
    errors.push('Triggers must be an object');
  }
  
  // Validate steps
  if (workflow.steps) {
    if (!Array.isArray(workflow.steps)) {
      errors.push('Steps must be an array');
    } else {
      workflow.steps.forEach((step, index) => {
        if (!step.id) errors.push(`Step ${index} missing required field: id`);
        if (!step.name) errors.push(`Step ${index} missing required field: name`);
        if (!step.agent) errors.push(`Step ${index} missing required field: agent`);
        
        // Validate dependencies
        if (step.dependsOn && !Array.isArray(step.dependsOn)) {
          errors.push(`Step ${step.id}: dependsOn must be an array`);
        }
      });
    }
  }
  
  return errors;
}

function validateStepReferences(workflow) {
  const errors = [];
  const stepIds = new Set(workflow.steps.map(s => s.id));
  
  workflow.steps.forEach(step => {
    // Check dependencies exist
    if (step.dependsOn) {
      step.dependsOn.forEach(dep => {
        if (!stepIds.has(dep)) {
          errors.push(`Step ${step.id}: depends on unknown step '${dep}'`);
        }
      });
    }
    
    // Check condition references
    if (step.condition) {
      const conditionStr = JSON.stringify(step.condition);
      const outputRefs = conditionStr.match(/\$\{outputs\.(\w+)\./g) || [];
      outputRefs.forEach(ref => {
        const stepId = ref.match(/outputs\.(\w+)\./)[1];
        if (!stepIds.has(stepId)) {
          errors.push(`Step ${step.id}: references unknown step '${stepId}' in condition`);
        }
      });
    }
  });
  
  return errors;
}

function validateAgentReferences(workflow, agents) {
  const errors = [];
  const validAgents = new Set(Object.keys(agents));
  
  workflow.steps.forEach(step => {
    let agentName = step.agent;
    
    // Handle dynamic agent references
    if (agentName.includes('${')) {
      // Check for parameter-based agent selection patterns
      if (agentName.includes('parameters.affectedArea') || 
          agentName.includes('backend') || 
          agentName.includes('frontend')) {
        // These are valid dynamic references
        return;
      }
      // Check if it references a valid agent pattern
      const validPatterns = ['-testing', '-development', '-review'];
      if (validPatterns.some(pattern => agentName.includes(pattern))) {
        return;
      }
    }
    
    if (!validAgents.has(agentName)) {
      // Don't report errors for dynamic agent references
      if (!agentName.includes('${')) {
        errors.push(`Step ${step.id}: references unknown agent '${agentName}'`);
      }
    }
  });
  
  return errors;
}

function main() {
  console.log('🔍 Validating Workflow Templates...\n');
  
  // Load agent registry for validation
  const registryPath = path.join(process.cwd(), '.claude/agents/registry.json');
  let agents = {};
  
  try {
    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    agents = registry.agents || {};
  } catch (error) {
    log('⚠️  Warning: Could not load agent registry for validation', 'yellow');
  }
  
  // Find all workflow YAML files
  const workflowDir = path.join(process.cwd(), '.claude/workflows');
  let workflowFiles = [];
  
  try {
    const files = fs.readdirSync(workflowDir);
    workflowFiles = files.filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
  } catch (error) {
    log('❌ Could not read workflows directory', 'red');
    process.exit(1);
  }
  
  if (workflowFiles.length === 0) {
    log('⚠️  No workflow files found', 'yellow');
    process.exit(0);
  }
  
  log(`Found ${workflowFiles.length} workflow files\n`, 'blue');
  
  let allValid = true;
  const validWorkflows = [];
  
  // Validate each workflow
  for (const file of workflowFiles) {
    const filePath = path.join(workflowDir, file);
    const workflow = loadYAML(filePath);
    
    if (workflow.error) {
      log(`❌ ${file}`, 'red');
      log(`   YAML Parse Error: ${workflow.error}`, 'red');
      allValid = false;
      continue;
    }
    
    // Schema validation
    const schemaErrors = validateWorkflowSchema(workflow, file);
    
    // Reference validation
    const refErrors = workflow.steps ? validateStepReferences(workflow) : [];
    const agentErrors = workflow.steps && Object.keys(agents).length > 0 
      ? validateAgentReferences(workflow, agents) : [];
    
    const allErrors = [...schemaErrors, ...refErrors, ...agentErrors];
    
    if (allErrors.length === 0) {
      log(`✅ ${file}`, 'green');
      log(`   - ${workflow.name} v${workflow.version}`, 'green');
      log(`   - ${workflow.steps ? workflow.steps.length : 0} steps`, 'green');
      
      const triggers = [];
      if (workflow.triggers) {
        if (workflow.triggers.commands) triggers.push(`commands: ${workflow.triggers.commands.length}`);
        if (workflow.triggers.events) triggers.push(`events: ${workflow.triggers.events.length}`);
        if (workflow.triggers.hooks) triggers.push(`hooks: ${workflow.triggers.hooks.length}`);
      }
      if (triggers.length > 0) {
        log(`   - Triggers: ${triggers.join(', ')}`, 'green');
      }
      
      validWorkflows.push({
        file,
        name: workflow.name,
        triggers: workflow.triggers
      });
    } else {
      log(`❌ ${file}`, 'red');
      allErrors.forEach(err => {
        log(`   - ${err}`, 'red');
      });
      allValid = false;
    }
    
    console.log();
  }
  
  // Summary
  if (allValid) {
    log('✅ All workflows are valid!\n', 'green');
    
    // Show available workflow commands
    const commands = new Set();
    validWorkflows.forEach(w => {
      if (w.triggers && w.triggers.commands) {
        w.triggers.commands.forEach(cmd => commands.add(cmd));
      }
    });
    
    if (commands.size > 0) {
      log('Available Workflow Commands:', 'blue');
      Array.from(commands).sort().forEach(cmd => {
        log(`  ${cmd}`, 'green');
      });
    }
    
    process.exit(0);
  } else {
    log('❌ Some workflows have validation errors', 'red');
    process.exit(1);
  }
}

// Check if js-yaml is available
try {
  require('js-yaml');
} catch (error) {
  // Simple YAML parser fallback
  global.yaml = {
    load: (content) => {
      // Very basic YAML parsing - just for validation
      const lines = content.split('\n');
      const result = {};
      let currentObj = result;
      let currentArray = null;
      
      lines.forEach(line => {
        if (line.trim() === '' || line.trim().startsWith('#')) return;
        
        const indent = line.search(/\S/);
        const trimmed = line.trim();
        
        if (trimmed.endsWith(':')) {
          const key = trimmed.slice(0, -1);
          currentObj[key] = {};
        } else if (trimmed.startsWith('- ')) {
          // Array item
          if (!currentArray) currentArray = [];
          currentArray.push(trimmed.slice(2));
        } else if (trimmed.includes(': ')) {
          const [key, ...valueParts] = trimmed.split(': ');
          currentObj[key] = valueParts.join(': ').replace(/^["']|["']$/g, '');
        }
      });
      
      return result;
    }
  };
}

if (require.main === module) {
  main();
}