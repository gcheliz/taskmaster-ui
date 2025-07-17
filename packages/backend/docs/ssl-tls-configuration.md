# SSL/TLS Configuration Guide

This document provides comprehensive guidance for configuring SSL/TLS encryption for TaskMaster UI database connections and ensuring secure communication in production environments.

## Overview

The TaskMaster UI backend supports robust SSL/TLS configuration with:
- **Automatic SSL validation** and enforcement
- **Certificate file validation** and security checks
- **Production-ready SSL configuration** with proper error handling
- **Certificate expiration monitoring** and alerts
- **Health check endpoints** for SSL status monitoring

## Quick Start

### Development Environment (SSL Disabled)

```bash
# .env.development
NODE_ENV=development
DATABASE_SSL=false
DATABASE_URL="postgresql://user:pass@localhost:5432/db"
```

### Production Environment (SSL Enabled)

```bash
# .env.production
NODE_ENV=production
DATABASE_SSL=true
DATABASE_URL="postgresql://user:pass@prod-db:5432/db"

# SSL Certificate Files
SSL_CERT_PATH=/path/to/client-cert.pem
SSL_KEY_PATH=/path/to/client-key.pem
SSL_CA_PATH=/path/to/ca-cert.pem
```

## SSL Certificate Configuration

### Certificate File Requirements

1. **CA Certificate (SSL_CA_PATH)**
   - Root certificate authority certificate
   - Used to verify the server's identity
   - Format: PEM-encoded X.509 certificate

2. **Client Certificate (SSL_CERT_PATH)**
   - Client authentication certificate
   - Used for mutual TLS authentication
   - Format: PEM-encoded X.509 certificate

3. **Client Private Key (SSL_KEY_PATH)**
   - Private key for client certificate
   - Must be kept secure with restricted permissions
   - Format: PEM-encoded private key

### Certificate File Security

```bash
# Set proper permissions for certificate files
chmod 644 /path/to/client-cert.pem
chmod 644 /path/to/ca-cert.pem
chmod 600 /path/to/client-key.pem  # Restrict private key access

# Verify file ownership
chown app:app /path/to/cert/files/*
```

## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_SSL` | No | Enable SSL/TLS | `true` or `false` |
| `SSL_CERT_PATH` | Production | Client certificate path | `/certs/client.crt` |
| `SSL_KEY_PATH` | Production | Client private key path | `/certs/client.key` |
| `SSL_CA_PATH` | Production | CA certificate path | `/certs/ca.crt` |

## SSL Validation and Enforcement

### Automatic Validation

The system automatically validates SSL configuration on startup:

```typescript
// SSL validation is enforced automatically
const { validateSSLConfiguration } = require('./config/ssl-validator');
const validation = validateSSLConfiguration();

if (!validation.valid) {
  // Application will exit in production
  process.exit(1);
}
```

### Validation Checks

- **Certificate file existence** and readability
- **Certificate format validation** (PEM format)
- **Private key security** (proper file permissions)
- **Production SSL requirements** enforcement
- **Certificate expiration monitoring**

## Testing SSL Configuration

### Command Line Testing

```bash
# Test SSL configuration
pnpm run ssl:test

# Validate environment setup
pnpm run env:validate

# Test database connection
pnpm run db:test
```

### Health Check Endpoints

```bash
# Check SSL status
curl http://localhost:3001/health/ssl

# Check system health (includes SSL)
curl http://localhost:3001/health/system
```

## Docker Configuration

### Docker Compose

```yaml
version: '3.8'
services:
  backend:
    image: taskmaster-backend
    environment:
      - NODE_ENV=production
      - DATABASE_SSL=true
      - SSL_CERT_PATH=/certs/client.crt
      - SSL_KEY_PATH=/certs/client.key
      - SSL_CA_PATH=/certs/ca.crt
    volumes:
      - ./certs:/certs:ro
    secrets:
      - db_cert
      - db_key
      - db_ca

secrets:
  db_cert:
    file: ./certs/client.crt
  db_key:
    file: ./certs/client.key
  db_ca:
    file: ./certs/ca.crt
```

### Dockerfile

```dockerfile
FROM node:18-alpine

# Create certificate directory
RUN mkdir -p /app/certs && chmod 755 /app/certs

# Copy application
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

# Build application
RUN npm run build

# Set up certificate permissions
RUN chown -R node:node /app/certs

USER node
EXPOSE 3001

CMD ["npm", "start"]
```

## Kubernetes Configuration

### ConfigMap for Certificates

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: ssl-certs
  namespace: taskmaster
data:
  ca.crt: |
    -----BEGIN CERTIFICATE-----
    # Your CA certificate content
    -----END CERTIFICATE-----
```

### Secret for Private Keys

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: ssl-keys
  namespace: taskmaster
type: Opaque
data:
  client.key: # Base64 encoded private key
  client.crt: # Base64 encoded client certificate
```

### Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: taskmaster-backend
  namespace: taskmaster
spec:
  replicas: 3
  selector:
    matchLabels:
      app: taskmaster-backend
  template:
    metadata:
      labels:
        app: taskmaster-backend
    spec:
      containers:
      - name: backend
        image: taskmaster-backend:latest
        env:
        - name: DATABASE_SSL
          value: "true"
        - name: SSL_CERT_PATH
          value: "/certs/client.crt"
        - name: SSL_KEY_PATH
          value: "/certs/client.key"
        - name: SSL_CA_PATH
          value: "/certs/ca.crt"
        volumeMounts:
        - name: ssl-certs
          mountPath: /certs
          readOnly: true
        livenessProbe:
          httpGet:
            path: /health/ssl
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
      volumes:
      - name: ssl-certs
        projected:
          sources:
          - configMap:
              name: ssl-certs
          - secret:
              name: ssl-keys
```

## Database-Specific Configuration

### PostgreSQL SSL Configuration

```bash
# PostgreSQL server configuration (postgresql.conf)
ssl = on
ssl_cert_file = '/path/to/server.crt'
ssl_key_file = '/path/to/server.key'
ssl_ca_file = '/path/to/ca.crt'
ssl_ciphers = 'HIGH:MEDIUM:+3DES:!aNULL'
ssl_prefer_server_ciphers = on
ssl_protocols = 'TLSv1.2,TLSv1.3'
```

### Connection String Parameters

```bash
# SSL connection parameters
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require&sslcert=client.crt&sslkey=client.key&sslrootcert=ca.crt"
```

## Certificate Management

### Certificate Generation

```bash
# Generate CA private key
openssl genrsa -out ca.key 4096

# Generate CA certificate
openssl req -new -x509 -days 365 -key ca.key -out ca.crt

# Generate client private key
openssl genrsa -out client.key 4096

# Generate client certificate signing request
openssl req -new -key client.key -out client.csr

# Sign client certificate with CA
openssl x509 -req -in client.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out client.crt -days 365
```

### Certificate Renewal

```bash
# Check certificate expiration
openssl x509 -in client.crt -text -noout | grep "Not After"

# Automated renewal script
#!/bin/bash
CERT_PATH="/path/to/client.crt"
DAYS_UNTIL_EXPIRY=$(openssl x509 -in "$CERT_PATH" -checkend $((30*24*60*60)) -noout && echo "30+" || echo "less than 30")

if [ "$DAYS_UNTIL_EXPIRY" = "less than 30" ]; then
    echo "Certificate expires in less than 30 days, renewing..."
    # Add renewal logic here
fi
```

## Monitoring and Alerting

### Health Check Integration

```javascript
// Monitor SSL health
const sslHealth = await fetch('/health/ssl');
const status = await sslHealth.json();

if (status.certificate.expiring) {
  // Alert: Certificate expiring soon
  console.warn('SSL certificate expires in', status.certificate.daysUntilExpiration, 'days');
}
```

### Prometheus Metrics

```yaml
# SSL metrics configuration
ssl_certificate_expiry_days{service="taskmaster-backend"} 45
ssl_validation_errors_total{service="taskmaster-backend"} 0
ssl_connection_attempts_total{service="taskmaster-backend"} 1234
ssl_connection_failures_total{service="taskmaster-backend"} 5
```

## Security Best Practices

### Certificate Security

1. **Use strong key sizes** (minimum 2048-bit RSA or 256-bit ECDSA)
2. **Implement certificate pinning** for additional security
3. **Regular certificate rotation** (every 90 days recommended)
4. **Secure certificate storage** with proper access controls
5. **Monitor certificate expiration** and automate renewals

### SSL Configuration

1. **Disable weak SSL/TLS versions** (use TLS 1.2+ only)
2. **Use strong cipher suites** and disable weak ciphers
3. **Enable certificate verification** in production
4. **Implement OCSP stapling** for revocation checking
5. **Use Perfect Forward Secrecy** (PFS) cipher suites

## Troubleshooting

### Common Issues

1. **Certificate file not found**
   ```bash
   # Check file paths and permissions
   ls -la /path/to/cert/files/
   ```

2. **Permission denied accessing private key**
   ```bash
   # Fix private key permissions
   chmod 600 /path/to/client.key
   ```

3. **Certificate verification failed**
   ```bash
   # Verify certificate chain
   openssl verify -CAfile ca.crt client.crt
   ```

4. **SSL connection timeout**
   ```bash
   # Test SSL connectivity
   openssl s_client -connect hostname:5432 -cert client.crt -key client.key
   ```

### Debug Commands

```bash
# Test SSL configuration
pnpm run ssl:test

# Check certificate details
openssl x509 -in client.crt -text -noout

# Verify certificate chain
openssl verify -CAfile ca.crt client.crt

# Test database SSL connection
psql "sslmode=require sslcert=client.crt sslkey=client.key sslrootcert=ca.crt host=hostname dbname=db user=user"
```

## Migration Guide

### From Non-SSL to SSL

1. **Obtain SSL certificates** from your certificate authority
2. **Configure certificate paths** in environment variables
3. **Update database connection** to use SSL mode
4. **Test SSL connectivity** before production deployment
5. **Monitor SSL health** after deployment

### Certificate Renewal Process

1. **Generate new certificates** before expiration
2. **Update certificate files** without downtime
3. **Restart application** to load new certificates
4. **Verify SSL connectivity** after renewal
5. **Update monitoring** to track new expiration dates

## Support

For SSL/TLS configuration issues:
1. Check SSL validation logs
2. Verify certificate file permissions
3. Test SSL connectivity manually
4. Review security requirements
5. Consult database SSL documentation