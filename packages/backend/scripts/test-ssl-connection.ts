#!/usr/bin/env node

/**
 * SSL/TLS Database Connection Test
 * 
 * This script tests SSL/TLS database connections and validates certificate configuration
 */

import { validateSSLConfiguration, testSSLConnection, getSSLCertificateInfo, checkSSLCertificateExpiration } from '../src/config/ssl-validator';
import { env } from '../src/config/environment';

async function testSSLValidation() {
  console.log('🔒 SSL/TLS Configuration Validation\n');
  
  const validation = validateSSLConfiguration();
  
  console.log('Configuration Status:');
  console.log(`  SSL Enabled: ${validation.configuration.enabled ? '✅ Yes' : '❌ No'}`);
  console.log(`  Environment: ${env.NODE_ENV}`);
  console.log(`  Database SSL: ${env.DATABASE_SSL}`);
  
  if (validation.errors.length > 0) {
    console.log('\n❌ Validation Errors:');
    validation.errors.forEach(error => {
      console.log(`  - ${error}`);
    });
  }
  
  if (validation.warnings.length > 0) {
    console.log('\n⚠️  Validation Warnings:');
    validation.warnings.forEach(warning => {
      console.log(`  - ${warning}`);
    });
  }
  
  if (validation.valid) {
    console.log('\n✅ SSL configuration is valid');
  } else {
    console.log('\n❌ SSL configuration has errors');
  }
  
  return validation;
}

async function testDatabaseConnection() {
  console.log('\n🗄️  Database Connection Test\n');
  
  if (env.DATABASE_SSL !== 'true') {
    console.log('⚠️  SSL is disabled, skipping SSL connection test');
    return;
  }
  
  console.log('Testing SSL connection to database...');
  const result = await testSSLConnection();
  
  if (result.success) {
    console.log('✅ SSL connection successful');
  } else {
    console.log(`❌ SSL connection failed: ${result.error}`);
  }
  
  return result;
}

async function showCertificateInfo() {
  console.log('\n📋 Certificate Information\n');
  
  const certInfo = getSSLCertificateInfo();
  
  if (!certInfo.enabled) {
    console.log('⚠️  SSL is disabled, no certificate information available');
    return;
  }
  
  console.log('Certificate Files:');
  console.log(`  CA: ${certInfo.files.ca}`);
  console.log(`  Certificate: ${certInfo.files.cert}`);
  console.log(`  Key: ${certInfo.files.key}`);
  
  if (certInfo.certificate) {
    console.log('\nCertificate Details:');
    if (certInfo.certificate.error) {
      console.log(`  Error: ${certInfo.certificate.error}`);
    } else {
      console.log(`  Subject: ${certInfo.certificate.subject}`);
      console.log(`  Issuer: ${certInfo.certificate.issuer}`);
      console.log(`  Valid From: ${certInfo.certificate.validFrom}`);
      console.log(`  Valid To: ${certInfo.certificate.validTo}`);
      console.log(`  Fingerprint: ${certInfo.certificate.fingerprint}`);
    }
  }
  
  return certInfo;
}

async function checkCertificateExpiration() {
  console.log('\n⏰ Certificate Expiration Check\n');
  
  const expirationInfo = checkSSLCertificateExpiration();
  
  if (expirationInfo.error) {
    console.log(`❌ Error checking expiration: ${expirationInfo.error}`);
    return;
  }
  
  if (expirationInfo.daysUntilExpiration !== undefined) {
    console.log(`Days until expiration: ${expirationInfo.daysUntilExpiration}`);
    
    if (expirationInfo.expiring) {
      console.log('⚠️  Certificate is expiring soon! Please renew.');
    } else {
      console.log('✅ Certificate is valid');
    }
  } else {
    console.log('ℹ️  No certificate expiration information available');
  }
  
  return expirationInfo;
}

async function testPrismaIntegration() {
  console.log('\n🔧 Prisma Integration Test\n');
  
  try {
    const { getDatabaseConfig } = await import('../src/config/environment');
    const config = getDatabaseConfig();
    
    console.log('Prisma Configuration:');
    console.log(`  URL: ${config.url.replace(/\/\/.*@/, '//***:***@')}`);
    console.log(`  SSL Config: ${config.ssl ? 'Present' : 'Not configured'}`);
    
    if (config.ssl) {
      console.log('  SSL Details:');
      console.log(`    Reject Unauthorized: ${config.ssl.rejectUnauthorized}`);
      console.log(`    CA Certificate: ${config.ssl.ca ? 'Present' : 'Not provided'}`);
      console.log(`    Client Certificate: ${config.ssl.cert ? 'Present' : 'Not provided'}`);
      console.log(`    Client Key: ${config.ssl.key ? 'Present' : 'Not provided'}`);
    }
    
    console.log('\n✅ Prisma SSL configuration loaded successfully');
    
    return config;
  } catch (error) {
    console.log(`❌ Failed to load Prisma configuration: ${error.message}`);
    return null;
  }
}

async function generateSSLReport() {
  console.log('\n📊 SSL/TLS Security Report\n');
  
  const validation = validateSSLConfiguration();
  const certInfo = getSSLCertificateInfo();
  const expirationInfo = checkSSLCertificateExpiration();
  
  const report = {
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    ssl: {
      enabled: validation.configuration.enabled,
      valid: validation.valid,
      errors: validation.errors,
      warnings: validation.warnings,
    },
    certificate: certInfo,
    expiration: expirationInfo,
    recommendations: [] as string[],
  };
  
  // Generate recommendations
  if (env.NODE_ENV === 'production' && !validation.configuration.enabled) {
    report.recommendations.push('Enable SSL/TLS for production database connections');
  }
  
  if (validation.configuration.enabled && !validation.configuration.rejectUnauthorized) {
    report.recommendations.push('Enable certificate verification for enhanced security');
  }
  
  if (validation.configuration.enabled && !certInfo.files.ca) {
    report.recommendations.push('Provide CA certificate for server verification');
  }
  
  if (expirationInfo.expiring) {
    report.recommendations.push('Renew SSL certificate before expiration');
  }
  
  console.log('Security Report Generated:');
  console.log(JSON.stringify(report, null, 2));
  
  return report;
}

async function main() {
  console.log('🚀 Starting SSL/TLS Database Connection Tests\n');
  
  try {
    await testSSLValidation();
    await testDatabaseConnection();
    await showCertificateInfo();
    await checkCertificateExpiration();
    await testPrismaIntegration();
    await generateSSLReport();
    
    console.log('\n🎉 SSL/TLS tests completed successfully!');
    
  } catch (error) {
    console.error('❌ SSL/TLS test failed:', error);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  main().catch(console.error);
}