#!/usr/bin/env node

/**
 * Environment Validation Script
 * 
 * This script validates the environment configuration without starting the application.
 * Useful for CI/CD pipelines and deployment verification.
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// Change to the backend directory
process.chdir(path.join(__dirname, '..'));

// Compile TypeScript if needed
try {
  if (!fs.existsSync('dist/config/environment.js')) {
    console.log('Building TypeScript files...');
    execSync('pnpm run build', { stdio: 'inherit' });
  }
} catch (error) {
  console.error('Failed to build TypeScript:', error.message);
  process.exit(1);
}

// Load environment configuration
try {
  const { env, validateProductionSecrets, logConfiguration } = require('../dist/config/environment');
  
  console.log('✅ Environment validation successful!');
  console.log('');
  
  // Log safe configuration
  logConfiguration();
  
  // Validate production secrets if in production
  if (env.NODE_ENV === 'production') {
    console.log('');
    console.log('🔒 Validating production secrets...');
    validateProductionSecrets();
  }
  
  // Check SSL configuration
  if (env.DATABASE_SSL === 'true') {
    console.log('');
    console.log('🔐 SSL Configuration:');
    
    const sslChecks = [
      { name: 'SSL_CERT_PATH', path: env.SSL_CERT_PATH },
      { name: 'SSL_KEY_PATH', path: env.SSL_KEY_PATH },
      { name: 'SSL_CA_PATH', path: env.SSL_CA_PATH }
    ];
    
    sslChecks.forEach(check => {
      if (check.path) {
        try {
          if (fs.existsSync(check.path)) {
            console.log(`  ✅ ${check.name}: ${check.path}`);
          } else {
            console.log(`  ❌ ${check.name}: File not found - ${check.path}`);
          }
        } catch (error) {
          console.log(`  ⚠️  ${check.name}: Cannot access - ${check.path}`);
        }
      } else {
        console.log(`  ⚠️  ${check.name}: Not configured`);
      }
    });
  }
  
  // Database connection test
  console.log('');
  console.log('🗄️  Database Configuration:');
  console.log(`  URL: ${env.DATABASE_URL.replace(/\/\/.*@/, '//***:***@')}`);
  console.log(`  SSL: ${env.DATABASE_SSL === 'true' ? 'Enabled' : 'Disabled'}`);
  console.log(`  Pool Size: ${env.CONNECTION_POOL_SIZE}`);
  console.log(`  Query Timeout: ${env.QUERY_TIMEOUT}ms`);
  
  // Performance settings
  console.log('');
  console.log('⚡ Performance Settings:');
  console.log(`  Query Analysis: ${env.ENABLE_QUERY_ANALYSIS === 'true' ? 'Enabled' : 'Disabled'}`);
  console.log(`  Log Level: ${env.LOG_LEVEL}`);
  
  // External services
  console.log('');
  console.log('🔌 External Services:');
  const services = [
    { name: 'GitHub', enabled: !!env.GITHUB_TOKEN },
    { name: 'Slack', enabled: !!env.SLACK_BOT_TOKEN },
    { name: 'Anthropic', enabled: !!env.ANTHROPIC_API_KEY },
    { name: 'Redis', enabled: !!env.REDIS_URL },
    { name: 'Datadog', enabled: !!env.DATADOG_API_KEY }
  ];
  
  services.forEach(service => {
    console.log(`  ${service.enabled ? '✅' : '⚪'} ${service.name}`);
  });
  
  console.log('');
  console.log('🎉 Environment validation completed successfully!');
  
} catch (error) {
  console.error('❌ Environment validation failed:');
  console.error(error.message);
  
  if (error.issues) {
    console.error('\nDetailed errors:');
    error.issues.forEach(issue => {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    });
  }
  
  console.error('\nPlease check your .env file and ensure all required variables are set.');
  process.exit(1);
}