#!/usr/bin/env node

/**
 * Secrets Manager Integration Test
 * 
 * This script tests the secrets manager functionality with different providers
 */

import { SecretsManager, getSecretsManager, validateSecrets } from '../src/config/secrets-manager';

async function testProvider(providerName: string, manager: SecretsManager) {
  console.log(`\n🔍 Testing ${providerName} provider...`);
  
  try {
    // Test availability
    const isAvailable = await manager.isProviderAvailable();
    console.log(`  ✅ Provider available: ${isAvailable}`);
    
    if (!isAvailable) {
      console.log(`  ⚠️  ${providerName} provider is not available, skipping tests`);
      return;
    }
    
    // Test listing secrets
    try {
      const secrets = await manager.listSecrets();
      console.log(`  ✅ Listed ${secrets.length} secrets`);
    } catch (error) {
      console.log(`  ❌ Failed to list secrets: ${error}`);
    }
    
    // Test getting a specific secret
    const testSecrets = ['JWT_SECRET', 'DATABASE_URL', 'ENCRYPTION_KEY'];
    
    for (const secretName of testSecrets) {
      try {
        const secret = await manager.getSecret(secretName);
        console.log(`  ✅ Retrieved ${secretName}: ${secret.substring(0, 8)}...`);
      } catch (error) {
        console.log(`  ⚠️  ${secretName} not found: ${error}`);
      }
    }
    
    // Test getting secret with metadata
    try {
      const secretWithMetadata = await manager.getSecretWithMetadata('JWT_SECRET');
      console.log(`  ✅ Retrieved metadata for JWT_SECRET:`);
      console.log(`    Source: ${secretWithMetadata.source}`);
      console.log(`    Last updated: ${secretWithMetadata.lastUpdated}`);
      console.log(`    Version: ${secretWithMetadata.version || 'N/A'}`);
    } catch (error) {
      console.log(`  ⚠️  Failed to get metadata: ${error}`);
    }
    
    // Test cache functionality
    const cacheStats = manager.getCacheStats();
    console.log(`  ✅ Cache stats: ${cacheStats.size} entries`);
    
  } catch (error) {
    console.log(`  ❌ Provider test failed: ${error}`);
  }
}

async function testEnvironmentProvider() {
  console.log('🔐 Testing Environment Provider\n');
  
  try {
    const manager = getSecretsManager();
    await testProvider('ENVIRONMENT', manager);
  } catch (error) {
    console.log(`❌ Failed to test environment provider: ${error}`);
  }
}

async function testProviderStatus() {
  console.log('\n📊 Provider Status Check\n');
  
  try {
    const manager = getSecretsManager();
    const statusMap = await manager.getProviderStatus();
    
    console.log('Provider availability:');
    for (const [provider, status] of statusMap) {
      console.log(`  ${status ? '✅' : '❌'} ${provider.toUpperCase()}: ${status ? 'Available' : 'Unavailable'}`);
    }
  } catch (error) {
    console.log(`❌ Status check failed: ${error}`);
  }
}

async function testSecretValidation() {
  console.log('\n🔍 Secret Validation Test\n');
  
  try {
    await validateSecrets();
    console.log('✅ All required secrets are available');
  } catch (error) {
    console.log(`❌ Secret validation failed: ${error}`);
  }
}

async function testProviderSwitching() {
  console.log('\n🔄 Provider Switching Test\n');
  
  try {
    const manager = getSecretsManager();
    const statusMap = await manager.getProviderStatus();
    
    console.log('Current provider support:');
    for (const [providerName, isAvailable] of statusMap) {
      console.log(`  ${isAvailable ? '✅' : '❌'} ${providerName.toUpperCase()}: ${isAvailable ? 'Available' : 'Not Available'}`);
    }
    
    console.log('\n⚠️  Provider switching is not implemented in the simplified version');
    console.log('   For production use, install cloud provider dependencies and use the full secrets manager');
    
  } catch (error) {
    console.log(`❌ Provider switching test failed: ${error}`);
  }
}

async function testPerformance() {
  console.log('\n⚡ Performance Test\n');
  
  try {
    const manager = getSecretsManager();
    const testSecret = 'JWT_SECRET';
    
    // Test cache performance
    console.log('Testing cache performance...');
    const start = Date.now();
    
    // First call (should fetch from provider)
    await manager.getSecret(testSecret);
    const firstCallTime = Date.now() - start;
    
    // Second call (should use cache)
    const cacheStart = Date.now();
    await manager.getSecret(testSecret);
    const cacheCallTime = Date.now() - cacheStart;
    
    console.log(`  ✅ First call: ${firstCallTime}ms`);
    console.log(`  ✅ Cache call: ${cacheCallTime}ms`);
    console.log(`  ✅ Cache speedup: ${(firstCallTime / cacheCallTime).toFixed(2)}x`);
    
    // Test multiple concurrent calls
    console.log('Testing concurrent calls...');
    const concurrentStart = Date.now();
    
    await Promise.all([
      manager.getSecret(testSecret),
      manager.getSecret(testSecret),
      manager.getSecret(testSecret),
      manager.getSecret(testSecret),
      manager.getSecret(testSecret),
    ]);
    
    const concurrentTime = Date.now() - concurrentStart;
    console.log(`  ✅ 5 concurrent calls: ${concurrentTime}ms`);
    
  } catch (error) {
    console.log(`❌ Performance test failed: ${error}`);
  }
}

async function main() {
  console.log('🚀 Starting Secrets Manager Integration Tests\n');
  
  try {
    await testProviderStatus();
    await testEnvironmentProvider();
    await testSecretValidation();
    await testProviderSwitching();
    await testPerformance();
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  main().catch(console.error);
}