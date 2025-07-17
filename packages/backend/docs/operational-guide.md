# TaskMaster UI Backend - Operational Guide

This guide provides comprehensive operational procedures for deploying, monitoring, and maintaining the TaskMaster UI backend in production environments.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Environment Setup](#environment-setup)
3. [Deployment Procedures](#deployment-procedures)
4. [Monitoring and Health Checks](#monitoring-and-health-checks)
5. [Security Operations](#security-operations)
6. [Troubleshooting](#troubleshooting)
7. [Maintenance Procedures](#maintenance-procedures)

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- SSL certificates (for production)
- Environment-specific configuration

### Installation
```bash
# Clone repository
git clone <repository-url>
cd taskmaster-ui/packages/backend

# Install dependencies
pnpm install

# Generate Prisma client
pnpm run db:generate

# Run environment validation
pnpm run env:validate

# Start application
pnpm run dev  # Development
pnpm run start  # Production
```

### Health Check
```bash
# Verify application health
curl http://localhost:3001/health/system

# Expected response:
{
  "status": "OK",
  "components": {
    "database": "OK",
    "secrets": "OK",
    "ssl": "OK"
  }
}
```

## Environment Setup

### Configuration Files

#### Development Environment
```bash
# .env.development
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://taskmaster:password@localhost:5432/taskmaster_dev"
DATABASE_SSL=false
LOG_LEVEL=debug
ENABLE_QUERY_ANALYSIS=true
```

#### Production Environment
```bash
# .env.production
NODE_ENV=production
PORT=3001
DATABASE_URL="postgresql://user:pass@prod-db:5432/taskmaster"
DATABASE_SSL=true
LOG_LEVEL=warn
ENABLE_QUERY_ANALYSIS=false

# SSL Configuration
SSL_CERT_PATH=/certs/client.crt
SSL_KEY_PATH=/certs/client.key
SSL_CA_PATH=/certs/ca.crt

# Secrets Management
SECRETS_PROVIDER=aws
SECRETS_TIMEOUT=5000
SECRETS_CACHE_TTL=300000

# Required Production Secrets
JWT_SECRET=minimum-32-character-secret
ENCRYPTION_KEY=minimum-32-character-key
```

### Environment Validation
```bash
# Validate current environment
pnpm run env:validate

# Test secrets management
pnpm run secrets:test

# Test SSL configuration
pnpm run ssl:test
```

## Deployment Procedures

### Docker Deployment

#### Dockerfile
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runtime
WORKDIR /app
RUN addgroup -g 1001 -S nodejs
RUN adduser -S taskmaster -u 1001
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
USER taskmaster
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: .
    environment:
      - NODE_ENV=production
      - DATABASE_SSL=true
    volumes:
      - ./certs:/certs:ro
    ports:
      - "3001:3001"
    depends_on:
      - postgres
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:14
    environment:
      - POSTGRES_DB=taskmaster
      - POSTGRES_USER=taskmaster
      - POSTGRES_PASSWORD=secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./certs:/certs:ro
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### Kubernetes Deployment

#### ConfigMap
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: taskmaster-backend-config
  namespace: taskmaster
data:
  NODE_ENV: "production"
  DATABASE_SSL: "true"
  LOG_LEVEL: "warn"
  SECRETS_PROVIDER: "k8s"
```

#### Deployment
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
        ports:
        - containerPort: 3001
        envFrom:
        - configMapRef:
            name: taskmaster-backend-config
        - secretRef:
            name: taskmaster-backend-secrets
        volumeMounts:
        - name: ssl-certs
          mountPath: /certs
          readOnly: true
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/system
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            cpu: 100m
            memory: 256Mi
          limits:
            cpu: 500m
            memory: 512Mi
      volumes:
      - name: ssl-certs
        secret:
          secretName: taskmaster-ssl-certs
```

#### Service
```yaml
apiVersion: v1
kind: Service
metadata:
  name: taskmaster-backend-service
  namespace: taskmaster
spec:
  selector:
    app: taskmaster-backend
  ports:
  - port: 3001
    targetPort: 3001
  type: LoadBalancer
```

### Deployment Checklist

#### Pre-Deployment
- [ ] Environment configuration validated
- [ ] SSL certificates updated and valid
- [ ] Secrets properly configured
- [ ] Database migrations ready
- [ ] Health checks passing
- [ ] Security validation complete

#### Deployment
- [ ] Application built successfully
- [ ] Container images pushed
- [ ] Configuration applied
- [ ] Secrets updated
- [ ] SSL certificates mounted
- [ ] Application started

#### Post-Deployment
- [ ] Health checks passing
- [ ] Database connectivity verified
- [ ] SSL/TLS connections working
- [ ] Security validation passing
- [ ] Monitoring and alerting active
- [ ] Performance metrics normal

## Monitoring and Health Checks

### Health Endpoints

#### System Health
```bash
# Overall system health
curl http://localhost:3001/health/system

# Response includes all components
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "taskmaster-ui-backend",
  "components": {
    "database": "OK",
    "secrets": "OK",
    "ssl": "OK"
  }
}
```

#### Component-Specific Health
```bash
# Database health
curl http://localhost:3001/health

# Secrets manager health
curl http://localhost:3001/health/secrets

# SSL configuration health
curl http://localhost:3001/health/ssl
```

### Metrics and Monitoring

#### Prometheus Metrics
```yaml
# Application metrics
http_requests_total{method="GET",status="200"} 1234
http_request_duration_seconds{method="GET",quantile="0.95"} 0.1
database_connections_active{pool="default"} 5
database_query_duration_seconds{quantile="0.95"} 0.05

# Security metrics
ssl_certificate_expiry_days{service="taskmaster"} 45
secrets_access_total{provider="env"} 100
secrets_cache_hits_total{provider="env"} 95
```

#### Grafana Dashboard
```json
{
  "dashboard": {
    "title": "TaskMaster Backend",
    "panels": [
      {
        "title": "Application Health",
        "targets": [
          {
            "expr": "up{job=\"taskmaster-backend\"}",
            "legendFormat": "Application Status"
          }
        ]
      },
      {
        "title": "Database Performance",
        "targets": [
          {
            "expr": "rate(database_query_duration_seconds_sum[5m])",
            "legendFormat": "Query Duration"
          }
        ]
      },
      {
        "title": "SSL Certificate Status",
        "targets": [
          {
            "expr": "ssl_certificate_expiry_days",
            "legendFormat": "Days Until Expiry"
          }
        ]
      }
    ]
  }
}
```

### Alerting Configuration

#### Alert Rules
```yaml
groups:
- name: taskmaster-backend
  rules:
  - alert: ApplicationDown
    expr: up{job="taskmaster-backend"} == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "TaskMaster backend is down"
      
  - alert: DatabaseConnectionFailure
    expr: database_connections_active == 0
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: "Database connection failure"
      
  - alert: SSLCertificateExpiring
    expr: ssl_certificate_expiry_days < 30
    for: 1h
    labels:
      severity: warning
    annotations:
      summary: "SSL certificate expiring in {{$value}} days"
```

## Security Operations

### Certificate Management

#### Certificate Renewal
```bash
# Check certificate expiration
pnpm run ssl:test

# Renew certificates (example)
openssl req -new -key client.key -out client.csr
openssl x509 -req -in client.csr -CA ca.crt -CAkey ca.key -out client.crt -days 365

# Update Kubernetes secrets
kubectl create secret generic taskmaster-ssl-certs \
  --from-file=client.crt \
  --from-file=client.key \
  --from-file=ca.crt \
  --dry-run=client -o yaml | kubectl apply -f -

# Restart pods to load new certificates
kubectl rollout restart deployment/taskmaster-backend
```

#### Secrets Rotation
```bash
# Rotate JWT secret
aws secretsmanager rotate-secret --secret-id taskmaster/JWT_SECRET

# Update application configuration
kubectl patch deployment taskmaster-backend -p \
  '{"spec":{"template":{"metadata":{"labels":{"restart":"'$(date +%s)'"}}}}}'

# Verify new secrets are loaded
curl http://localhost:3001/health/secrets
```

### Security Monitoring

#### Security Health Checks
```bash
# Daily security validation
pnpm run env:validate
pnpm run secrets:test
pnpm run ssl:test

# Security audit report
curl http://localhost:3001/health/system | jq .
```

#### Incident Response
1. **Detection**: Monitor security health endpoints
2. **Assessment**: Run security validation scripts
3. **Response**: Follow security incident playbook
4. **Recovery**: Restore secure configuration
5. **Post-incident**: Update security measures

## Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check environment configuration
pnpm run env:validate

# Common issues:
- Missing environment variables
- Invalid database connection
- SSL configuration errors
- Missing secrets
```

#### Database Connection Issues
```bash
# Test database connectivity
pnpm run db:test

# Check SSL configuration
pnpm run ssl:test

# Common issues:
- Database server unreachable
- Invalid credentials
- SSL certificate problems
- Network connectivity issues
```

#### SSL/TLS Problems
```bash
# Validate SSL configuration
pnpm run ssl:test

# Common issues:
- Certificate file not found
- Invalid certificate format
- Incorrect file permissions
- Certificate expired
```

### Debug Commands

#### Environment Debugging
```bash
# Check environment variables
env | grep -E "(NODE_ENV|DATABASE|SSL|SECRETS)"

# Validate configuration
pnpm run env:validate

# Test database connection
pnpm run db:status
```

#### Application Debugging
```bash
# Check application logs
docker logs taskmaster-backend

# Kubernetes logs
kubectl logs deployment/taskmaster-backend -f

# Health check details
curl -v http://localhost:3001/health/system
```

#### Security Debugging
```bash
# Test SSL connectivity
openssl s_client -connect hostname:5432 -cert client.crt -key client.key

# Verify certificate chain
openssl verify -CAfile ca.crt client.crt

# Check secrets access
pnpm run secrets:test
```

## Maintenance Procedures

### Regular Maintenance

#### Daily Tasks
- [ ] Check application health
- [ ] Review error logs
- [ ] Monitor performance metrics
- [ ] Verify security status

#### Weekly Tasks
- [ ] Review security alerts
- [ ] Check certificate expiration
- [ ] Update dependencies
- [ ] Performance optimization

#### Monthly Tasks
- [ ] Security audit
- [ ] Certificate renewal planning
- [ ] Configuration review
- [ ] Disaster recovery testing

### Backup Procedures

#### Configuration Backup
```bash
# Backup environment configuration
cp .env.production .env.production.backup.$(date +%Y%m%d)

# Backup Kubernetes configuration
kubectl get configmap taskmaster-backend-config -o yaml > config-backup.yaml
kubectl get secret taskmaster-backend-secrets -o yaml > secrets-backup.yaml
```

#### Certificate Backup
```bash
# Backup SSL certificates
tar -czf certificates-backup-$(date +%Y%m%d).tar.gz /path/to/certs/

# Backup Kubernetes secrets
kubectl get secret taskmaster-ssl-certs -o yaml > ssl-certs-backup.yaml
```

### Disaster Recovery

#### Recovery Procedures
1. **Assess damage** and determine recovery scope
2. **Restore configuration** from backups
3. **Restore certificates** and secrets
4. **Redeploy application** with validated configuration
5. **Verify functionality** and security
6. **Monitor** for stability

#### Recovery Testing
```bash
# Test configuration restore
pnpm run env:validate

# Test secrets recovery
pnpm run secrets:test

# Test SSL configuration
pnpm run ssl:test

# Test application functionality
curl http://localhost:3001/health/system
```

## Performance Optimization

### Database Performance
```bash
# Enable query analysis
export ENABLE_QUERY_ANALYSIS=true

# Run performance tests
pnpm run performance:test

# Monitor slow queries
pnpm run performance:test:verbose
```

### Application Performance
```bash
# Monitor memory usage
docker stats taskmaster-backend

# Check connection pool usage
curl http://localhost:3001/health/system | jq .components.database
```

## Contact Information

### Support Channels
- **Operations Team**: Monitor dashboards and alerts
- **Security Team**: Handle security incidents
- **Development Team**: Address application issues
- **Infrastructure Team**: Manage deployment infrastructure

### Emergency Procedures
1. **Critical Issues**: Follow incident response playbook
2. **Security Incidents**: Contact security team immediately
3. **Infrastructure Problems**: Escalate to infrastructure team
4. **Application Bugs**: Create high-priority development ticket

---

*This operational guide should be updated regularly to reflect changes in deployment procedures, security requirements, and operational best practices.*