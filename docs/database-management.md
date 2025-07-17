# TaskMaster UI - Database Management Guide

## Overview

TaskMaster UI provides comprehensive database management scripts for maintaining consistent development environments. The system supports PostgreSQL with Prisma ORM and includes automated reset, seeding, and verification functionality.

## Quick Reference

### Essential Commands

```bash
# Reset database completely
pnpm db:reset

# Check database status
pnpm db:status

# Verify database integrity
pnpm db:verify

# Test database connection
pnpm db:test
```

### Alternative Reset Options

```bash
# Quick reset (legacy method)
pnpm db:reset:quick

# Reset without seeding
pnpm db:reset:no-seed

# Force reset (skip connection test)
pnpm db:reset:force
```

## Database Management Scripts

### Primary Reset Script (`db:reset`)

The enhanced `db:reset` command provides comprehensive database management:

```bash
pnpm db:reset [options]
```

**Options:**
- `--skip-seed` - Skip seeding after migration
- `--skip-verification` - Skip database verification
- `--force` - Skip initial connection test

**Process:**
1. 🔍 Test database connection
2. 🗑️ Drop existing database
3. 📋 Apply all migrations
4. 🔧 Generate Prisma client
5. 🌱 Seed with sample data
6. ✅ Verify database state

### Database Status (`db:status`)

Check current database configuration and record counts:

```bash
pnpm db:status
```

**Output:**
```
📊 Database Status
==============================
✅ Database connection successful
Configuration:
   Host: localhost:5432
   Database: taskmaster_dev
   User: taskmaster

Record Counts:
   Projects: 3
   Tasks: 10
   Repositories: 2
   Commits: 5
```

### Database Verification (`db:verify`)

Verify database integrity after operations:

```bash
pnpm db:verify
```

**Checks:**
- Table existence and structure
- Data consistency
- Relationship integrity
- Minimum data requirements

### Connection Testing (`db:test`)

Test database connectivity:

```bash
pnpm db:test
```

**Uses:**
- Troubleshoot connection issues
- Verify credentials
- Check PostgreSQL availability

## Seeding System

### Enhanced Seeding Options

```bash
# Standard seeding
pnpm db:seed

# Minimal sample data
pnpm db:seed:minimal

# Verbose output with details
pnpm db:seed:verbose
```

### Seeding Command Line Options

```bash
# Show help
pnpm db:seed --help

# Create minimal data set
pnpm db:seed --minimal

# Skip cleaning existing data
pnpm db:seed --skip-clean

# Show detailed progress
pnpm db:seed --verbose
```

### Sample Data Structure

The seeding system creates:

**Standard Mode:**
- 3 Projects (TaskMaster UI, Mobile Backend, E-commerce)
- 2 Repositories per project
- 10 Tasks with various statuses and priorities
- 5 Commits with realistic timestamps

**Minimal Mode:**
- 1 Project (TaskMaster UI Sample)
- 1 Repository
- 3 Tasks (essential examples)
- 2 Commits (basic history)

### Seeding Summary Example

```
📊 Seeding Summary:
   Projects: 3
   Repositories: 2
   Tasks: 10
   Commits: 5

📋 Task Status Breakdown:
   Pending: 6
   In Progress: 1
   Completed: 3
```

## Migration Management

### Standard Migration Commands

```bash
# Create and apply new migration
pnpm db:migrate

# Apply migrations in production
pnpm db:migrate:deploy

# Reset with new migration (interactive)
pnpm db:migrate:reset
```

### Migration Best Practices

1. **Development Environment:**
   ```bash
   # Make schema changes
   # Then create migration
   pnpm db:migrate
   ```

2. **Production Deployment:**
   ```bash
   # Apply existing migrations
   pnpm db:migrate:deploy
   ```

3. **Schema Development:**
   ```bash
   # Quick iteration without migration
   pnpm db:push
   ```

## Prisma Client Management

### Client Generation

```bash
# Generate Prisma client
pnpm db:generate

# Auto-watch schema changes
pnpm db:watch
```

### Schema Operations

```bash
# Push schema changes (development)
pnpm db:push

# Pull schema from database
pnpm db:pull

# Launch Prisma Studio
pnpm db:studio
```

## Development Workflows

### Starting Fresh Development

```bash
# Complete setup for new developers
pnpm install
pnpm db:reset
pnpm dev
```

### Daily Development

```bash
# Check current state
pnpm db:status

# Reset when needed
pnpm db:reset --skip-verification

# Make schema changes
# Then apply
pnpm db:migrate
```

### Testing Environment Setup

```bash
# Minimal data for testing
pnpm db:reset
pnpm db:seed:minimal

# Verify test environment
pnpm db:verify
```

### Production-like Testing

```bash
# Full dataset
pnpm db:reset
pnpm db:seed:verbose

# Check data completeness
pnpm db:status
```

## Docker Integration

### With Docker PostgreSQL

```bash
# Start PostgreSQL container
docker-compose up -d postgres

# Then use database commands
pnpm db:reset
```

### Full Docker Development

```bash
# Complete containerized setup
pnpm run docker:dev

# Database operations work the same
pnpm db:status
```

### Database Reset in Docker

```bash
# Reset from host machine
pnpm db:reset

# Or inside container
docker-compose exec backend pnpm db:reset
```

## Troubleshooting

### Common Issues

1. **Connection Failed**
   ```bash
   # Check PostgreSQL status
   docker-compose ps postgres
   
   # Verify environment variables
   echo $DATABASE_URL
   
   # Test connection
   pnpm db:test
   ```

2. **Migration Errors**
   ```bash
   # Check migration status
   npx prisma migrate status
   
   # Reset and retry
   pnpm db:reset:force
   ```

3. **Seeding Failures**
   ```bash
   # Check for schema drift
   npx prisma migrate diff
   
   # Regenerate client
   pnpm db:generate
   
   # Try minimal seeding
   pnpm db:seed:minimal
   ```

4. **Performance Issues**
   ```bash
   # Check database size
   pnpm db:status
   
   # Clean reset
   pnpm db:reset
   ```

### Error Messages and Solutions

| Error | Solution |
|-------|----------|
| `Connection refused` | Start PostgreSQL: `docker-compose up -d postgres` |
| `Database does not exist` | Run full reset: `pnpm db:reset` |
| `Migration failed` | Check schema conflicts, then reset |
| `Prisma client out of sync` | Regenerate: `pnpm db:generate` |
| `Seed data conflicts` | Clean reset: `pnpm db:reset --force` |

### Debug Mode

```bash
# Verbose operations
pnpm db:reset --skip-verification
pnpm db:seed:verbose
pnpm db:status

# Check logs
docker-compose logs postgres
```

## Environment Variables

### Required Configuration

```bash
# Backend .env
DATABASE_URL="postgresql://taskmaster:password@localhost:5432/taskmaster_dev"
NODE_ENV=development
```

### Docker Configuration

```bash
# Docker Compose PostgreSQL
POSTGRES_DB=taskmaster_dev
POSTGRES_USER=taskmaster
POSTGRES_PASSWORD=password
```

### Testing Environments

```bash
# Test database
DATABASE_URL="postgresql://taskmaster:password@localhost:5432/taskmaster_test"

# CI/CD
DATABASE_URL="postgresql://user:pass@ci-postgres:5432/test_db"
```

## Advanced Usage

### Custom Seeding

Create custom seed scripts in `prisma/` directory:

```typescript
// prisma/custom-seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function customSeed() {
  // Your custom seeding logic
}

customSeed()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

### Backup and Restore

```bash
# Create backup
docker-compose exec postgres pg_dump -U taskmaster taskmaster_dev > backup.sql

# Restore backup
pnpm db:reset --skip-seed
docker-compose exec -T postgres psql -U taskmaster taskmaster_dev < backup.sql
```

### Schema Validation

```bash
# Validate current schema
npx prisma validate

# Check for drift
npx prisma migrate diff

# Introspect existing database
npx prisma db pull
```

## Performance Considerations

### Development Performance

- Use `--skip-verification` for faster resets
- Use `--minimal` seeding during rapid development
- Use `db:push` instead of migrations for schema iteration

### Resource Usage

- Database reset: ~10-15 seconds
- Minimal seeding: ~2-3 seconds
- Full seeding: ~5-8 seconds
- Verification: ~1-2 seconds

### Optimization Tips

1. **Skip unnecessary steps:**
   ```bash
   pnpm db:reset --skip-verification --skip-seed
   ```

2. **Use minimal data:**
   ```bash
   pnpm db:seed:minimal
   ```

3. **Cache Prisma client:**
   ```bash
   # Client is cached after first generation
   pnpm db:generate
   ```

## Integration with Development Tools

### VS Code Integration

- Prisma extension provides syntax highlighting
- Database connections via PostgreSQL extension
- Prisma Studio integration

### IDE Database Tools

```bash
# Launch Prisma Studio
pnpm db:studio
# Opens http://localhost:5555
```

### CI/CD Integration

```yaml
# GitHub Actions example
- name: Setup Database
  run: |
    pnpm db:reset --force
    pnpm db:verify
```

This comprehensive database management system ensures consistent, reliable development environments while providing flexible options for different use cases and team workflows.