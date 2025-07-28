# /db-seed

Generate seed data scripts for development and testing environments.

## Usage

```
/db-seed --model="Task" --count=50 --fields='{"title":{"type":"faker","options":"lorem.sentence"},"status":{"type":"random","options":{"values":["pending","in-progress","done"]}}}'
```

## Parameters

- `model` (required): Prisma model name to seed
- `count` (optional): Number of records to create (default: 10)
- `fields` (optional): Field generation configuration

## Field Configuration Types

### 1. Static value

```json
{ "field": "value" }
```

### 2. Faker data

```json
{ "field": { "type": "faker", "options": "internet.email" } }
```

### 3. Sequential data

```json
{ "field": { "type": "sequence", "options": { "prefix": "USER-" } } }
```

### 4. Random selection

```json
{ "field": { "type": "random", "options": { "values": ["A", "B", "C"] } } }
```

## Examples

### User seed data

```
/db-seed --model="User" --count=100 --fields='{
  "email": {"type": "faker", "options": "internet.email"},
  "name": {"type": "faker", "options": "person.fullName"},
  "role": {"type": "random", "options": {"values": ["admin", "user", "moderator"]}}
}'
```

### Task seed data with relations

```
/db-seed --model="Task" --count=50 --fields='{
  "title": {"type": "faker", "options": "lorem.sentence"},
  "description": {"type": "faker", "options": "lorem.paragraph"},
  "priority": {"type": "random", "options": {"values": ["low", "medium", "high"]}},
  "status": {"type": "random", "options": {"values": ["pending", "in-progress", "done"]}}
}'
```

### Product catalog

```
/db-seed --model="Product" --count=200 --fields='{
  "sku": {"type": "sequence", "options": {"prefix": "PROD-"}},
  "name": {"type": "faker", "options": "commerce.productName"},
  "price": {"type": "faker", "options": "commerce.price"},
  "category": {"type": "faker", "options": "commerce.department"}
}'
```

## Generated Files

Creates: `packages/backend/prisma/seed-[model].ts`

## Running Seeds

After generation:

```bash
cd packages/backend
pnpm prisma db seed
```
