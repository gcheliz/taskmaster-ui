# Production Secrets Directory

This directory contains production secrets used by Docker Compose in production environments.

## ⚠️ SECURITY WARNING

**NEVER COMMIT ACTUAL SECRET FILES TO VERSION CONTROL**

This directory should only exist in production environments and contain real secrets.

## Required Secret Files

For production deployment, create the following files with your actual secrets:

### Database Secrets
- `db_password.txt` - PostgreSQL database password

### Application Security
- `jwt_secret.txt` - JWT signing secret (minimum 32 characters)
- `encryption_key.txt` - Application encryption key (minimum 32 characters)

### External Service API Keys
- `github_token.txt` - GitHub API token for integration
- `slack_bot_token.txt` - Slack bot token for notifications
- `anthropic_api_key.txt` - Anthropic API key for AI features

### Monitoring
- `grafana_password.txt` - Grafana admin password

## File Format

Each file should contain only the secret value without quotes or extra whitespace:

```bash
# Example (DO NOT USE THESE VALUES)
echo "your_actual_database_password" > db_password.txt
echo "your_jwt_secret_min_32_chars_here" > jwt_secret.txt
echo "your_encryption_key_min_32_chars" > encryption_key.txt
```

## File Permissions

Ensure proper file permissions for security:

```bash
chmod 600 secrets/*.txt
chown root:root secrets/*.txt
```

## Alternative: External Secrets Management

For enhanced security, consider using external secrets management:

### Docker Swarm Secrets
```bash
# Create secrets in Docker Swarm
echo "password" | docker secret create db_password -
```

### Cloud Provider Secrets
- AWS Secrets Manager
- Google Secret Manager  
- Azure Key Vault

### HashiCorp Vault
- Vault Agent for secret injection
- Vault CSI Provider for Kubernetes

## Environment-Specific Secrets

Different environments should use different secrets:

- **Development**: Use `.env` files with placeholder values
- **Staging**: Use staging-specific secrets
- **Production**: Use production secrets with maximum security

## Backup and Rotation

1. **Backup**: Store secrets securely in encrypted backup systems
2. **Rotation**: Rotate secrets regularly according to security policy
3. **Audit**: Log secret access and usage for security auditing