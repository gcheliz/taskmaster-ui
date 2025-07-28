# /db-migrate

Generate and manage database migrations for Prisma schema changes.

## Usage

```
/db-migrate --name="add-user-fields" --description="Add profile fields to User model"
```

## Parameters

- `name` (required): Migration name (alphanumeric with hyphens)
- `description` (required): Description of the migration
- `autoApply` (optional): Apply migration immediately in development (default: false)
- `environment` (optional): Target environment (development, staging, production) (default: development)

## Schema Update Workflow

1. First update the schema:

```
/db-schema --model="User" --action="update" --fields='[{"name":"bio","type":"String?"},{"name":"avatar","type":"String?"}]'
```

2. Then generate migration:

```
/db-migrate --name="add-user-bio-avatar" --description="Add bio and avatar fields to User"
```

## Examples

### Simple migration

```
/db-migrate --name="add-task-status" --description="Add status field to Task model"
```

### Auto-apply in development

```
/db-migrate --name="add-indexes" --description="Add performance indexes" --autoApply=true
```

### Migration validation

```
/db-validate --name="20240101000000_add_indexes"
```

## Migration Management

### Apply pending migrations

```
/db-apply --environment="development"
```

### Rollback (development only)

```
pnpm --filter=backend prisma migrate reset --skip-seed
```

## Safety Features

- Automatic validation for dangerous operations (DROP TABLE, DROP COLUMN)
- Migration conflicts detection
- Rollback command generation
- Environment-specific restrictions
