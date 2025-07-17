# Environment Configuration Guide

This document provides comprehensive guidance on configuring the TaskMaster UI backend application for different environments.

## Overview

The application uses a robust environment configuration system with:
- **Zod schema validation** for type safety and validation
- **SSL/TLS support** for secure database connections
- **Production secrets validation** to ensure security
- **Environment-specific templates** for easy setup

## Quick Start

### Development Setup

1. Copy the development template:
   ```bash
   cp .env.development .env
   ```

2. Update the database URL if needed:
   ```bash
   DATABASE_URL="postgresql://taskmaster:taskmaster_dev_password@localhost:5432/taskmaster_dev?schema=public"
   ```

3. Start the application:
   ```bash
   pnpm run dev
   ```

### Production Setup

1. Copy the production template:
   ```bash
   cp .env.production .env
   ```

2. **CRITICAL**: Update all required production variables:
   - `DATABASE_URL` with production database connection
   - `JWT_SECRET` (minimum 32 characters)
   - `ENCRYPTION_KEY` (minimum 32 characters)
   - SSL certificate paths if using SSL

3. Deploy the application:
   ```bash
   pnpm run build
   pnpm run start
   ```

## Environment Variables Reference

### Application Settings

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Application environment |
| `PORT` | No | `3001` | Server port |

### Database Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | **Yes** | - | PostgreSQL connection string |
| `DATABASE_SSL` | No | `false` | Enable SSL/TLS for database |
| `SSL_CERT_PATH` | No | - | Client certificate path |
| `SSL_KEY_PATH` | No | - | Client private key path |
| `SSL_CA_PATH` | No | - | CA certificate path |

### Security Settings

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_SECRET` | Production | Auto-generated | JWT signing secret (≥32 chars) |
| `ENCRYPTION_KEY` | Production | Auto-generated | Data encryption key (≥32 chars) |

### Performance Settings

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ENABLE_QUERY_ANALYSIS` | No | `false` | Enable query performance analysis |
| `QUERY_TIMEOUT` | No | `30000` | Query timeout in milliseconds |
| `CONNECTION_POOL_SIZE` | No | `10` | Database connection pool size |

### External Services

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GITHUB_TOKEN` | No | - | GitHub API token |
| `SLACK_BOT_TOKEN` | No | - | Slack bot token |
| `ANTHROPIC_API_KEY` | No | - | Anthropic API key |
| `REDIS_URL` | No | - | Redis connection string |

### Monitoring & Logging

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATADOG_API_KEY` | No | - | Datadog API key |
| `DATADOG_APP_KEY` | No | - | Datadog application key |
| `LOG_LEVEL` | No | `info` | Logging level (error, warn, info, debug) |

## SSL/TLS Configuration

### Development (Local)
SSL is typically disabled for local development:
```bash
DATABASE_SSL=false
```

### Production
SSL should always be enabled in production:
```bash
DATABASE_SSL=true
SSL_CERT_PATH=/path/to/client-cert.pem
SSL_KEY_PATH=/path/to/client-key.pem
SSL_CA_PATH=/path/to/ca-cert.pem
```

## Security Best Practices

### Secret Management
- **Never commit secrets** to version control
- Use environment variables or secret management systems
- Rotate secrets regularly
- Use minimum 32-character secrets in production

### Database Security
- Always use SSL in production
- Use strong, unique passwords
- Implement connection pooling limits
- Enable query analysis for monitoring

### Application Security
- Configure CORS origins appropriately
- Use security headers (automatically applied)
- Implement rate limiting (recommended)
- Monitor for security events

## Environment Validation

The application automatically validates environment variables on startup:

```typescript
// Example validation errors
❌ Environment validation failed:
  - JWT_SECRET: String must contain at least 32 character(s)
  - DATABASE_URL: Required
```

### Production Validation
Additional validation ensures production readiness:
- Required secrets are present
- Secret strength requirements are met
- SSL configuration is valid

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check `DATABASE_URL` format
   - Verify database is running
   - Check network connectivity
   - Validate SSL certificates if using SSL

2. **Environment Validation Failed**
   - Ensure all required variables are set
   - Check variable formats and lengths
   - Verify enum values are correct

3. **SSL/TLS Issues**
   - Verify certificate files exist and are readable
   - Check certificate validity dates
   - Ensure proper certificate chain

### Debug Mode
Enable debug logging for detailed troubleshooting:
```bash
LOG_LEVEL=debug
ENABLE_QUERY_ANALYSIS=true
```

## Configuration Examples

### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/taskmaster
      - DATABASE_SSL=true
      - JWT_SECRET=${JWT_SECRET}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
```

### Kubernetes
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: backend-config
data:
  NODE_ENV: production
  DATABASE_SSL: "true"
  LOG_LEVEL: warn
---
apiVersion: v1
kind: Secret
metadata:
  name: backend-secrets
type: Opaque
data:
  DATABASE_URL: <base64-encoded-url>
  JWT_SECRET: <base64-encoded-secret>
  ENCRYPTION_KEY: <base64-encoded-key>
```

## Migration Guide

### From Existing Setup
1. Install dependencies: `pnpm add zod`
2. Replace existing configuration with new environment system
3. Update database service initialization
4. Test in development environment
5. Update production deployment with new environment variables

### Backup Current Configuration
Before migrating, backup your current `.env` file:
```bash
cp .env .env.backup
```

## Support

For issues with environment configuration:
1. Check the troubleshooting section
2. Review application logs
3. Verify environment variable formats
4. Test database connectivity separately