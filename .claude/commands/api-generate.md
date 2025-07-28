# /api-generate

Generate a new API endpoint with full stack implementation including route, controller, service, and validation.

## Usage

```
/api-generate --endpoint="/users" --method="POST" --description="Create a new user" --auth=true --model="User"
```

## Parameters

- `endpoint` (required): The API endpoint path (e.g., `/users`, `/tasks/:id`)
- `method` (required): HTTP method (GET, POST, PUT, PATCH, DELETE)
- `description` (required): Description of what the endpoint does
- `auth` (optional): Whether authentication is required (default: true)
- `model` (optional): Prisma model name for database operations
- `validation` (optional): JSON object defining request validation

## Examples

### Basic endpoint without database

```
/api-generate --endpoint="/health" --method="GET" --description="Health check endpoint" --auth=false
```

### CRUD endpoint with Prisma

```
/api-generate --endpoint="/tasks" --method="POST" --description="Create a new task" --model="Task" --validation='{"body":{"title":"z.string()","description":"z.string().optional()"}}'
```

### Complex validation

```
/api-generate --endpoint="/users/:id/profile" --method="PATCH" --description="Update user profile" --validation='{"params":{"id":"z.string().cuid()"},"body":{"name":"z.string().min(2)","email":"z.string().email()"}}'
```

## Generated Files

The command will create:

- `packages/backend/src/controllers/[resource]Controller.ts`
- `packages/backend/src/services/[resource]Service.ts`
- `packages/backend/src/routes/[resource]Routes.ts`
- `packages/backend/src/types/validation/[resource]Validation.ts` (if validation provided)

## Integration

The generated endpoint will automatically:

- Follow existing project patterns
- Use PNPM workspace structure
- Include proper error handling
- Generate TypeScript types
- Add route registration
