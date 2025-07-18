# Operational Runbook - TaskMaster UI

This runbook provides operational procedures for maintaining TaskMaster UI in production environments.

## 📋 Overview

### System Architecture
- **Frontend**: React application served via Nginx
- **Backend**: Node.js API with Express
- **Database**: PostgreSQL with SSL encryption
- **Infrastructure**: Docker containers with Docker Secrets
- **Monitoring**: Health checks and logging

### Key Services
| Service | Container | Port | Health Check |
|---------|-----------|------|--------------|
| Frontend | taskmaster-frontend | 5173 | `curl http://localhost:5173` |
| Backend | taskmaster-backend | 3001 | `curl http://localhost:3001/health` |
| Database | taskmaster-postgres | 5432 | `pg_isready -U taskmaster` |
| Nginx | taskmaster-nginx | 80/443 | `curl http://localhost/health` |

## 🚀 Deployment Procedures

### Production Deployment

#### 1. Pre-Deployment Checklist
- [ ] Backup current database
- [ ] Verify SSL certificates are valid
- [ ] Validate all secrets are properly configured
- [ ] Check Docker images are built and tested
- [ ] Review deployment manifest changes

#### 2. Deployment Steps
```bash
# 1. Generate SSL certificates (if needed)
./scripts/generate-ssl-certs.sh

# 2. Setup production secrets
./scripts/setup-secrets.sh

# 3. Validate secrets configuration
./scripts/setup-secrets.sh validate

# 4. Build production images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# 5. Start production services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 6. Verify deployment
curl http://localhost/health
```

#### 3. Post-Deployment Verification
```bash
# Check all services are running
docker-compose ps

# Verify database connectivity
docker-compose exec backend pnpm db:status

# Check SSL certificate status
echo | openssl s_client -connect localhost:443 -servername localhost 2>/dev/null | openssl x509 -noout -dates

# Monitor logs for errors
docker-compose logs -f --tail=100
```

### Rollback Procedure

#### Emergency Rollback
```bash
# 1. Stop current deployment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down

# 2. Switch to previous version
docker tag taskmaster-ui:previous taskmaster-ui:latest

# 3. Restart services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 4. Verify rollback
curl http://localhost/health
```

## 🔧 Maintenance Procedures

### Daily Operations

#### Health Checks
```bash
# System health check
curl http://localhost/health

# Database health check
docker-compose exec postgres pg_isready -U taskmaster

# Backend health check
curl http://localhost:3001/health/database
curl http://localhost:3001/health/secrets

# Check container status
docker-compose ps
```

#### Log Review
```bash
# Application logs
docker-compose logs backend --tail=100

# Database logs
docker-compose logs postgres --tail=100

# Nginx logs
docker-compose logs nginx --tail=100

# System logs
journalctl -u docker --since "1 hour ago"
```

### Weekly Operations

#### Certificate Monitoring
```bash
# Check certificate expiration
./scripts/generate-ssl-certs.sh --check-expiry

# Verify certificate chain
openssl verify -CAfile ssl-certs/ca-cert.pem ssl-certs/server-cert.pem
```

#### Database Maintenance
```bash
# Database backup
docker-compose exec postgres pg_dump -U taskmaster taskmaster_prod > backup-$(date +%Y%m%d).sql

# Vacuum database
docker-compose exec postgres psql -U taskmaster -d taskmaster_prod -c "VACUUM ANALYZE;"

# Check database size
docker-compose exec postgres psql -U taskmaster -d taskmaster_prod -c "SELECT pg_size_pretty(pg_database_size('taskmaster_prod'));"
```

### Monthly Operations

#### Security Updates
```bash
# Update base images
docker-compose pull

# Rebuild with security patches
docker-compose build --no-cache

# Update Node.js dependencies
pnpm update

# Security audit
pnpm audit --fix
```

#### Certificate Rotation
```bash
# Generate new certificates
./scripts/generate-ssl-certs.sh

# Update secrets
./scripts/setup-secrets.sh

# Restart services to load new certificates
docker-compose restart
```

## 📊 Monitoring & Alerting

### Key Metrics

#### Application Metrics
- **Response time**: API endpoint response times
- **Error rate**: HTTP 4xx/5xx error percentage
- **Throughput**: Requests per second
- **Database connections**: Active connection count

#### System Metrics
- **CPU usage**: Container CPU utilization
- **Memory usage**: Container memory consumption
- **Disk usage**: Database and log disk space
- **Network I/O**: Network traffic patterns

### Health Check Endpoints

#### Backend Health Checks
```bash
# Overall health
curl http://localhost:3001/health
# Response: {"status":"healthy","timestamp":"..."}

# Database health
curl http://localhost:3001/health/database
# Response: {"status":"healthy","database":"connected"}

# Secrets health
curl http://localhost:3001/health/secrets
# Response: {"status":"healthy","secrets":"configured"}
```

#### Monitoring Commands
```bash
# Check container resource usage
docker stats

# Monitor application logs
docker-compose logs -f backend | grep -i error

# Database connection monitoring
docker-compose exec postgres psql -U taskmaster -d taskmaster_prod -c "SELECT * FROM pg_stat_activity WHERE state = 'active';"
```

### Alert Conditions

#### Critical Alerts
- **Service down**: Any container stops running
- **Database connection failure**: Cannot connect to PostgreSQL
- **SSL certificate expiry**: Certificate expires within 30 days
- **High error rate**: >5% error rate for 5 minutes

#### Warning Alerts
- **High response time**: >2s average response time
- **High memory usage**: >80% container memory usage
- **High disk usage**: >80% disk space usage
- **Failed health checks**: Health check failures

## 🔒 Security Operations

### Access Management

#### Production Access
- **SSH access**: Limited to authorized personnel only
- **Database access**: Through application or emergency procedures
- **Container access**: Using `docker exec` for troubleshooting
- **Secrets access**: File-based secrets with restricted permissions

#### Emergency Access
```bash
# Emergency database access
docker-compose exec postgres psql -U taskmaster -d taskmaster_prod

# Emergency container access
docker-compose exec backend bash

# View secrets (emergency only)
docker-compose exec backend ls -la /run/secrets/
```

### Security Monitoring

#### Log Analysis
```bash
# Authentication failures
docker-compose logs backend | grep -i "authentication failed"

# Unusual access patterns
docker-compose logs nginx | grep -E "(404|403|500)"

# Security events
docker-compose logs backend | grep -i "security"
```

#### Intrusion Detection
```bash
# Monitor failed login attempts
docker-compose logs backend | grep -i "failed login" | tail -20

# Check for unusual API calls
docker-compose logs nginx | awk '{print $7}' | sort | uniq -c | sort -nr
```

## 🚨 Incident Response

### Incident Classification

#### P1 - Critical (Response: <15 minutes)
- Complete service outage
- Data breach or security incident
- Database corruption or data loss

#### P2 - High (Response: <1 hour)
- Partial service outage
- Performance degradation >50%
- Authentication service failure

#### P3 - Medium (Response: <4 hours)
- Minor feature issues
- Non-critical performance issues
- Non-urgent security updates

### Response Procedures

#### P1 Incident Response
```bash
# 1. Assess the situation
docker-compose ps
curl http://localhost/health

# 2. Check logs for errors
docker-compose logs --tail=100 | grep -i error

# 3. Immediate mitigation
# - Restart failed services
# - Switch to backup systems
# - Implement emergency fixes

# 4. Communication
# - Notify stakeholders
# - Update status page
# - Document incident timeline
```

#### Common Issues & Solutions

| Issue | Symptoms | Solution |
|-------|----------|----------|
| Database connection failure | 500 errors, connection timeouts | Restart database container, check SSL certificates |
| High memory usage | Slow response, container restarts | Restart services, check for memory leaks |
| SSL certificate issues | HTTPS errors, certificate warnings | Regenerate certificates, update secrets |
| Disk space full | Write failures, application errors | Clean up logs, increase disk space |

### Recovery Procedures

#### Database Recovery
```bash
# Restore from backup
docker-compose exec postgres dropdb -U taskmaster taskmaster_prod
docker-compose exec postgres createdb -U taskmaster taskmaster_prod
docker-compose exec -T postgres psql -U taskmaster taskmaster_prod < backup-latest.sql
```

#### Container Recovery
```bash
# Restart specific service
docker-compose restart backend

# Rebuild and restart
docker-compose build backend
docker-compose up -d backend

# Full system restart
docker-compose down
docker-compose up -d
```

## 📈 Performance Optimization

### Database Optimization

#### Query Performance
```sql
-- Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Check database size
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

#### Index Optimization
```sql
-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### Application Performance

#### Container Resources
```bash
# Monitor container performance
docker stats --no-stream

# Check container limits
docker inspect taskmaster-backend | grep -A 10 "Resources"

# Optimize container resources
# Edit docker-compose.prod.yml resource limits
```

## 🧹 Cleanup Procedures

### Regular Cleanup

#### Docker Cleanup
```bash
# Remove unused containers
docker container prune -f

# Remove unused images
docker image prune -f

# Remove unused volumes
docker volume prune -f

# Remove unused networks
docker network prune -f
```

#### Log Cleanup
```bash
# Rotate application logs
docker-compose logs --tail=1000 backend > logs/backend-$(date +%Y%m%d).log
docker-compose logs --tail=1000 nginx > logs/nginx-$(date +%Y%m%d).log

# Clean old log files
find logs/ -name "*.log" -mtime +30 -delete
```

#### Database Cleanup
```bash
# Clean old audit logs
docker-compose exec postgres psql -U taskmaster -d taskmaster_prod -c "DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days';"

# Vacuum database
docker-compose exec postgres psql -U taskmaster -d taskmaster_prod -c "VACUUM ANALYZE;"
```

## 📞 Emergency Contacts

### On-Call Contacts
- **Primary On-Call**: +1-555-0123
- **Secondary On-Call**: +1-555-0124
- **Database DBA**: +1-555-0125
- **Security Team**: +1-555-0126

### Escalation Matrix
1. **Level 1**: Operations Team
2. **Level 2**: Engineering Team
3. **Level 3**: Architecture Team
4. **Level 4**: Management Team

### Communication Channels
- **Slack**: #taskmaster-ops
- **Email**: ops@taskmaster.com
- **Status Page**: https://status.taskmaster.com
- **Incident Management**: https://incidents.taskmaster.com

---

This operational runbook should be reviewed and updated regularly to reflect system changes and lessons learned from incidents.