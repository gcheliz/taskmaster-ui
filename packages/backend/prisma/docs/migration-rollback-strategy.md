# Prisma Migration Rollback and Reset Strategy

## Overview

This document outlines the strategies for rolling back migrations, resetting the database, and handling migration issues in the TaskMaster UI backend using Prisma.

## Database Reset Commands

### Complete Database Reset with Fresh Data

```bash
# Reset database and apply all migrations with seeding
pnpm db:reset

# Alternative explicit commands
pnpm prisma migrate reset --force
pnpm db:seed
```

### Development Environment Reset

```bash
# Reset development database
pnpm prisma migrate reset --force

# Generate fresh Prisma client
pnpm prisma generate

# Seed with sample data
pnpm db:seed
```

## Migration Rollback Strategies

### Strategy 1: Manual Rollback (Recommended for Production)

Since Prisma doesn't support automatic rollbacks, manual intervention is required:

1. **Identify the target migration**:
   ```bash
   pnpm prisma migrate status
   ```

2. **Create a new migration to undo changes**:
   ```bash
   pnpm prisma migrate dev --name rollback_feature_name
   ```

3. **Write the inverse SQL manually** in the new migration file

### Strategy 2: Development Rollback with Reset

For development environments where data loss is acceptable:

```bash
# 1. Remove the problematic migration folder
rm -rf prisma/migrations/[timestamp_migration_name]

# 2. Reset the database completely
pnpm prisma migrate reset --force

# 3. Regenerate and apply all remaining migrations
pnpm prisma migrate dev
```

## Backup and Recovery

### Pre-Migration Backup

Before applying migrations in production:

```bash
# Create database backup
pg_dump -h localhost -U taskmaster -d taskmaster_prod > backup_pre_migration.sql

# Or use the backup script
./scripts/backup.sh
```

### Recovery from Backup

```bash
# Stop the application
docker-compose stop backend

# Restore from backup
psql -h localhost -U taskmaster -d taskmaster_prod < backup_pre_migration.sql

# Restart application
docker-compose start backend
```

## Migration Troubleshooting

### Schema Drift Issues

If Prisma detects schema drift:

```bash
# Option 1: Reset and regenerate (development only)
pnpm prisma migrate reset --force
pnpm prisma migrate dev --name fix_schema_drift

# Option 2: Resolve manually (production)
pnpm prisma db pull  # Pull current database state
pnpm prisma migrate resolve --applied [migration_id]  # Mark as applied
```

### Failed Migration Recovery

```bash
# 1. Check migration status
pnpm prisma migrate status

# 2. Mark failed migration as rolled back
pnpm prisma migrate resolve --rolled-back [migration_id]

# 3. Fix the migration SQL and reapply
pnpm prisma migrate dev
```

## Environment-Specific Strategies

### Development Environment

- Use `pnpm db:reset` freely for clean states
- Test migrations with sample data using seeding scripts
- Use `--force` flag to skip confirmations

### Staging Environment

- Always backup before migrations
- Test rollback procedures
- Validate data integrity after migrations

### Production Environment

- **Never use** `pnpm prisma migrate reset`
- Always create manual backup before migrations
- Use `pnpm prisma migrate deploy` for applying migrations
- Have a rollback plan ready before applying changes

## Data Seeding and Reset Scripts

### Available Scripts

```bash
# Seed database with sample data
pnpm db:seed

# Reset database and seed
pnpm db:reset

# Just apply migrations (no seeding)
pnpm prisma migrate dev

# Deploy migrations (production)
pnpm prisma migrate deploy
```

### Seeding Strategy

The seeding script (`prisma/seed.ts`) handles:
- Foreign key dependency order
- Sample data creation for all models
- Data cleanup before seeding
- Error handling and logging

## Best Practices

### Before Migration

1. **Backup the database**
2. **Test migration in staging**
3. **Review migration SQL**
4. **Plan rollback strategy**

### During Migration

1. **Monitor application logs**
2. **Verify data integrity**
3. **Check application functionality**

### After Migration

1. **Validate migration success**
2. **Update Prisma client if needed**
3. **Test critical application paths**
4. **Keep backup for recovery window**

## Emergency Procedures

### Complete System Recovery

```bash
# 1. Stop all services
docker-compose down

# 2. Restore database from backup
# [Follow backup recovery steps above]

# 3. Reset Prisma migration state
pnpm prisma migrate resolve --applied [last_good_migration_id]

# 4. Restart services
docker-compose up -d
```

### Data Loss Prevention

- Always backup before migrations
- Use transaction-wrapped migrations
- Test migrations on data copies
- Monitor migration progress
- Have communication plan for issues

## Migration File Management

### Safe Migration Practices

- Never edit applied migration files
- Use descriptive migration names
- Include both UP and DOWN logic in documentation
- Test migrations with realistic data volumes

### Version Control

- Commit migrations immediately after creation
- Include migration testing in CI/CD
- Tag releases with migration states
- Document breaking changes