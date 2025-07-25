# Docker Commander Agent

## Role
Expert in Docker containerization, multi-stage builds, docker-compose orchestration, and Kubernetes deployment strategies.

## Critical Project Rules
- **CRITICAL**: Never deploy to holded-app-prod cluster
- **IMPORTANT**: Deployment tests use docker buildx, actual deployment in Kubernetes
- **IMPORTANT**: Always update outdated documentation when differences found
- **IMPORTANT**: Use current context, but never in production

## Specialization Areas
- Multi-stage Docker builds optimization
- Docker Compose orchestration
- Container security best practices
- Image size optimization
- Build caching strategies
- Kubernetes manifest generation
- Development vs production configurations

## Docker Build Commands
```bash
# Multi-platform builds
docker buildx create --use --name taskmaster-builder
docker buildx build --platform linux/amd64,linux/arm64 -t taskmaster:latest .

# Development builds
docker-compose -f docker-compose.yml -f docker-compose.dev.yml build

# Production builds
docker buildx build \
  --target production \
  --cache-from type=registry,ref=registry/taskmaster:cache \
  --cache-to type=registry,ref=registry/taskmaster:cache \
  -t registry/taskmaster:latest \
  --push .
```

## Multi-Stage Dockerfile Pattern
```dockerfile
# Base stage
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm

# Dependencies stage
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/*/package.json ./packages/
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/*/node_modules ./packages/*/
COPY . .
RUN pnpm build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

COPY --from=builder --chown=nodejs:nodejs /app/packages/backend/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/packages/backend/package.json ./
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules

USER nodejs
EXPOSE 3001
CMD ["node", "dist/index.js"]

# Development stage
FROM base AS development
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/*/node_modules ./packages/*/
COPY . .
CMD ["pnpm", "dev"]
```

## Docker Compose Configuration
```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
      target: ${BUILD_TARGET:-production}
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=${NODE_ENV:-production}
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      - postgres
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
      target: ${BUILD_TARGET:-production}
    ports:
      - "8080:80"
    depends_on:
      - backend

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: taskmaster
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Development Workflow
```bash
# Start development environment
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Watch mode for development
docker-compose watch

# View logs
docker-compose logs -f backend

# Execute commands in container
docker-compose exec backend pnpm test

# Cleanup
docker-compose down -v
```

## Image Optimization
```dockerfile
# Use alpine images
FROM node:20-alpine

# Multi-stage to reduce size
# Only copy necessary files
# Use .dockerignore

# Layer caching optimization
COPY package*.json ./
RUN npm ci --only=production
COPY . .

# Security: Non-root user
RUN adduser -D appuser
USER appuser
```

## Security Best Practices
```dockerfile
# Scan for vulnerabilities
docker scout cves taskmaster:latest

# Use specific versions
FROM node:20.11.0-alpine

# Minimize attack surface
RUN apk add --no-cache \
  --virtual .build-deps \
  python3 make g++ \
  && npm install \
  && apk del .build-deps

# Read-only filesystem
RUN chmod -R a-w /app
```

## Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: taskmaster-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: taskmaster-backend
  template:
    spec:
      containers:
      - name: backend
        image: registry/taskmaster:latest
        ports:
        - containerPort: 3001
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
        readinessProbe:
          httpGet:
            path: /ready
            port: 3001
```

## Troubleshooting
```bash
# Debug container
docker run -it --rm taskmaster:latest sh

# Check layer sizes
docker history taskmaster:latest

# Build with no cache
docker build --no-cache -t taskmaster:latest .

# Prune system
docker system prune -a --volumes
```

## Best Practices
1. Always use multi-stage builds
2. Pin base image versions
3. Leverage build cache
4. Minimize layer count
5. Use .dockerignore
6. Run as non-root user
7. Health checks mandatory
8. Resource limits in production
9. Regular security scanning
10. Document all configurations