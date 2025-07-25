# TaskMaster UI Backend

A secure, production-ready backend API for the TaskMaster UI application with comprehensive security hardening, secrets management, and SSL/TLS encryption.

## Features

- **🔐 Security First**: Production-grade security with SSL/TLS encryption and secrets management
- **📊 Environment Management**: Comprehensive environment configuration with validation
- **🗄️ Database Security**: SSL/TLS encrypted database connections with certificate validation
- **🔑 Secrets Management**: Multi-provider secrets management (AWS, GCP, Kubernetes)
- **📈 Health Monitoring**: Comprehensive health checks and security monitoring
- **🐳 Container Ready**: Docker and Kubernetes deployment support
- **⚡ Performance**: Optimized database queries with analysis and monitoring
- **🛡️ Security Hardening**: Multiple layers of security protection

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- SSL certificates (for production)

### Installation
```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm run db:generate

# Validate environment
pnpm run env:validate

# Start development server
pnpm run dev
```

### Health Check
```bash
curl http://localhost:3001/health/system
```

## Framework

This backend uses **Express.js v5** (upgraded from v4). Key improvements include:
- Automatic promise rejection handling in middleware
- Better async/await support
- Improved TypeScript type definitions
- Native Brotli compression support

## Documentation

### Core Documentation
- **[Environment Configuration](docs/environment-configuration.md)** - Environment setup and validation
- **[Secrets Management](docs/secrets-deployment.md)** - Production secrets management
- **[SSL/TLS Configuration](docs/ssl-tls-configuration.md)** - Database encryption setup
- **[Security Hardening](docs/security-hardening-guide.md)** - Comprehensive security guide
- **[Operational Guide](docs/operational-guide.md)** - Deployment and operations

### API Documentation
- **Health Endpoints**: `/health`, `/health/system`, `/health/secrets`, `/health/ssl`
- **API Routes**: RESTful API for task management and project operations
- **WebSocket**: Real-time communication for terminal and task updates

## Security Features

### Environment Security
- **Validated Configuration**: Automatic environment validation with production requirements
- **Secure Defaults**: Security-first default configurations
- **Secret Isolation**: Secrets never stored in application code
- **Production Enforcement**: Mandatory security settings for production

### SSL/TLS Encryption
- **Database Encryption**: Mandatory SSL/TLS for production database connections
- **Certificate Validation**: Automatic SSL certificate validation and monitoring
- **Mutual TLS**: Support for client certificate authentication
- **Security Headers**: Comprehensive security headers for web protection

### Secrets Management
- **Multi-Provider Support**: AWS Secrets Manager, Google Cloud, Kubernetes
- **Automatic Rotation**: Support for secret rotation and renewal
- **Caching**: Secure caching with TTL for performance
- **Audit Trail**: Comprehensive logging of secret access

## Environment Setup

### Development
```bash
# Copy development template
cp .env.development .env

# Required variables
NODE_ENV=development
DATABASE_URL="postgresql://user:pass@localhost:5432/db"
DATABASE_SSL=false
```

### Production
```bash
# Copy production template
cp .env.production .env

# Required variables
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@prod-db:5432/db"
DATABASE_SSL=true
JWT_SECRET=minimum-32-character-secret
ENCRYPTION_KEY=minimum-32-character-key

# SSL certificates
SSL_CERT_PATH=/certs/client.crt
SSL_KEY_PATH=/certs/client.key
SSL_CA_PATH=/certs/ca.crt
```

## Available Scripts

### Development
```bash
pnpm run dev          # Start development server
pnpm run dev:watch    # Start with file watching
pnpm run build        # Build production bundle
pnpm run start        # Start production server
```

### Database
```bash
pnpm run db:generate  # Generate Prisma client
pnpm run db:migrate   # Run database migrations
pnpm run db:studio    # Open Prisma Studio
pnpm run db:reset     # Reset database
pnpm run db:seed      # Seed database with test data
```

### Testing & Validation
```bash
pnpm run test         # Run tests
pnpm run lint         # Run linting
pnpm run env:validate # Validate environment
pnpm run secrets:test # Test secrets management
pnpm run ssl:test     # Test SSL configuration
```

### Performance
```bash
pnpm run performance:test         # Performance testing
pnpm run performance:test:verbose # Detailed performance analysis
```

## Deployment

### Docker
```bash
# Build image
docker build -t taskmaster-backend .

# Run container
docker run -p 3001:3001 \
  -e NODE_ENV=production \
  -e DATABASE_SSL=true \
  -v /path/to/certs:/certs:ro \
  taskmaster-backend
```

### Kubernetes
```bash
# Apply configuration
kubectl apply -f k8s/

# Check deployment
kubectl get pods -l app=taskmaster-backend
kubectl logs deployment/taskmaster-backend
```

### Health Checks
```bash
# System health
curl http://localhost:3001/health/system

# Component health
curl http://localhost:3001/health/secrets
curl http://localhost:3001/health/ssl
```

## Monitoring

### Health Endpoints
- `GET /health` - Basic application health
- `GET /health/system` - Comprehensive system health
- `GET /health/secrets` - Secrets manager status
- `GET /health/ssl` - SSL/TLS configuration status

### Metrics
- **Application Metrics**: Request rate, response time, error rate
- **Database Metrics**: Connection pool, query performance
- **Security Metrics**: Certificate expiration, secret access patterns
- **Performance Metrics**: Memory usage, CPU utilization

### Alerting
```yaml
# Example alert rules
- alert: ApplicationDown
  expr: up{job="taskmaster-backend"} == 0
  
- alert: SSLCertificateExpiring
  expr: ssl_certificate_expiry_days < 30
  
- alert: DatabaseConnectionFailure
  expr: database_connections_active == 0
```

## Security

### Security Hardening
- **Environment Validation**: Automatic configuration validation
- **SSL/TLS Enforcement**: Mandatory encryption for production
- **Secrets Management**: Secure secret storage and access
- **Security Headers**: Comprehensive HTTP security headers
- **CORS Protection**: Secure cross-origin resource sharing

### Certificate Management
```bash
# Check certificate status
pnpm run ssl:test

# Certificate renewal
openssl req -new -key client.key -out client.csr
openssl x509 -req -in client.csr -CA ca.crt -CAkey ca.key -out client.crt
```

### Incident Response
1. **Detection**: Monitor security health endpoints
2. **Assessment**: Run security validation scripts
3. **Response**: Follow security incident playbook
4. **Recovery**: Restore secure configuration

## Performance

### Database Optimization
- **Connection Pooling**: Optimized database connections
- **Query Analysis**: Performance monitoring and optimization
- **Caching**: Intelligent caching strategies
- **Indexing**: Optimized database indexes

### Application Performance
- **Memory Management**: Efficient memory usage
- **CPU Optimization**: Optimized processing
- **Network Optimization**: Efficient network communication
- **Monitoring**: Comprehensive performance monitoring

## Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check environment
pnpm run env:validate

# Check database
pnpm run db:test

# Check SSL
pnpm run ssl:test
```

#### Database Connection Issues
```bash
# Test connectivity
pnpm run db:status

# Check SSL certificates
openssl verify -CAfile ca.crt client.crt
```

#### SSL/TLS Problems
```bash
# Validate SSL configuration
pnpm run ssl:test

# Test SSL connection
openssl s_client -connect hostname:5432 -cert client.crt -key client.key
```

### Debug Commands
```bash
# Environment debugging
env | grep -E "(NODE_ENV|DATABASE|SSL|SECRETS)"

# Application logs
docker logs taskmaster-backend
kubectl logs deployment/taskmaster-backend

# Health check details
curl -v http://localhost:3001/health/system
```

## Development

### Architecture
- **Express.js**: Web framework with security middleware
- **Prisma**: Database ORM with SSL support
- **TypeScript**: Type-safe development
- **Zod**: Runtime validation and type checking

### Security Architecture
- **Environment-based Configuration**: Secure configuration management
- **Multi-layer Security**: Defense in depth approach
- **Automated Validation**: Continuous security validation
- **Monitoring**: Real-time security monitoring

### Contributing
1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Run security validation
5. Submit pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

### Documentation
- **[Environment Configuration](docs/environment-configuration.md)**
- **[Secrets Management](docs/secrets-deployment.md)**
- **[SSL/TLS Configuration](docs/ssl-tls-configuration.md)**
- **[Security Hardening](docs/security-hardening-guide.md)**
- **[Operational Guide](docs/operational-guide.md)**

### Contact
- **Security Issues**: Follow security incident procedures
- **Operations**: Monitor dashboards and health endpoints
- **Development**: Create GitHub issues for bugs and features
- **Documentation**: Update guides for any changes

---

*For detailed operational procedures, security guidelines, and deployment instructions, please refer to the comprehensive documentation in the `docs/` directory.*