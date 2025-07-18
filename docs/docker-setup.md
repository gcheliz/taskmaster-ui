# TaskMaster UI - Docker Setup Guide

## Overview

TaskMaster UI provides comprehensive Docker containerization with development and production configurations. The setup includes automatic database migrations, reverse proxy routing, performance optimizations, and complete inter-service networking.

## Architecture

```mermaid
graph TB
    subgraph "Docker Network"
        N[Nginx Reverse Proxy<br/>:80] --> F[Frontend Container<br/>React + Vite]
        N --> B[Backend Container<br/>Node.js + Express]
        B --> D[PostgreSQL Database<br/>:5432]
        B --> R[Redis Cache<br/>:6379]
    end
    
    U[User] --> N
    
    subgraph "Development Access"
        U --> |Dev Mode| F2[Frontend :5173]
        U --> |Dev Mode| B2[Backend :3001]
        U --> |Dev Mode| PS[Prisma Studio :5555]
    end
```

## Prerequisites

- Docker 20.10+
- Docker Compose 2.28+ (for watch functionality)
- Git

## Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/gcheliz/taskmaster-ui.git
cd taskmaster-ui

# Install dependencies (optional, for local development)
pnpm install
```

### 2. Start Development Environment

```bash
# Start all services with development settings
pnpm run docker:dev

# Or use Docker Compose directly
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# For background operation
pnpm run docker:up
```

### 3. Access Services

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | React application |
| Backend API | http://localhost:3001 | REST API endpoints |
| Prisma Studio | http://localhost:5555 | Database management |
| PostgreSQL | localhost:5432 | Database (internal) |

## Development Workflow

### Hot Reloading & File Watching

The Docker setup provides comprehensive hot-reloading:

```bash
# Start with file watching enabled
pnpm run docker:dev

# Monitor logs
pnpm run docker:logs

# Watch specific service
pnpm run docker:logs:backend
pnpm run docker:logs:frontend
```

**What gets watched:**
- **Backend**: TypeScript files (`src/`), Prisma schema
- **Frontend**: React components (`src/`), public assets
- **Database Schema**: Automatic Prisma client regeneration

### Making Code Changes

1. **Backend Changes**: Edit files in `packages/backend/src/`
   - Nodemon automatically restarts the server
   - TypeScript compilation happens on-the-fly
   - Database changes trigger Prisma client regeneration

2. **Frontend Changes**: Edit files in `packages/frontend/src/`
   - Vite provides instant hot module replacement
   - Browser automatically refreshes

3. **Database Schema Changes**: Edit `packages/backend/prisma/schema.prisma`
   - Prisma client regenerates automatically
   - Run migrations: `pnpm run docker:exec backend pnpm db:migrate`

## Docker Commands

### Service Management

```bash
# Start all services
pnpm run docker:up

# Start with development overrides
pnpm run docker:dev

# Stop all services
pnpm run docker:down

# Rebuild and start
pnpm run docker:dev:build

# View logs
pnpm run docker:logs
pnpm run docker:logs:backend
pnpm run docker:logs:frontend
```

### Database Operations

```bash
# Access Prisma Studio
open http://localhost:5555

# Run migrations
docker-compose exec backend pnpm db:migrate

# Seed database
docker-compose exec backend pnpm db:seed

# Reset database
docker-compose exec backend pnpm db:reset

# Access PostgreSQL directly
docker-compose exec postgres psql -U taskmaster -d taskmaster_dev
```

### Cleanup & Reset

```bash
# Stop and remove containers, networks, volumes
pnpm run docker:clean

# Full reset (clean + rebuild)
pnpm run docker:reset
```

## Docker Compose Services

### PostgreSQL Database

```yaml
postgres:
  image: postgres:15-alpine
  environment:
    POSTGRES_DB: taskmaster_dev
    POSTGRES_USER: taskmaster
    POSTGRES_PASSWORD: password
  ports:
    - "5432:5432"
  volumes:
    - postgres_data:/var/lib/postgresql/data
```

### Backend API

```yaml
backend:
  build:
    context: .
    dockerfile: packages/backend/Dockerfile
    target: development
  environment:
    - DATABASE_URL=postgresql://taskmaster:password@postgres:5432/taskmaster_dev
  ports:
    - "3001:3001"  # API server
    - "5555:5555"  # Prisma Studio
  volumes:
    - ./packages/backend/src:/app/packages/backend/src:ro
    - ./packages/backend/prisma:/app/packages/backend/prisma:ro
```

### Frontend Web App

```yaml
frontend:
  build:
    context: .
    dockerfile: packages/frontend/Dockerfile
    target: development
  environment:
    - VITE_API_URL=http://localhost:3001
  ports:
    - "5173:5173"
  volumes:
    - ./packages/frontend/src:/app/packages/frontend/src:ro
    - ./packages/frontend/public:/app/packages/frontend/public:ro
```

## Docker Compose Watch (Advanced)

Docker Compose v2.28+ includes native file watching:

```bash
# Enable watch mode (experimental)
docker-compose watch

# Or use the pnpm script
pnpm run docker:watch
```

Watch configuration in `docker-compose.yml`:

```yaml
services:
  backend:
    develop:
      watch:
        - action: sync
          path: ./packages/backend/src
          target: /app/packages/backend/src
        - action: rebuild
          path: ./packages/backend/package.json
  
  frontend:
    develop:
      watch:
        - action: sync
          path: ./packages/frontend/src
          target: /app/packages/frontend/src
        - action: rebuild
          path: ./packages/frontend/vite.config.ts
```

## Environment Variables

### Backend Environment

```bash
# Database
DATABASE_URL=postgresql://taskmaster:password@postgres:5432/taskmaster_dev

# Application
NODE_ENV=development
PORT=3001
PRISMA_STUDIO_PORT=5555
```

### Frontend Environment

```bash
# API Configuration
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001

# Development
VITE_NODE_ENV=development
```

## Production Deployment

### Production Secrets Management

TaskMaster UI uses Docker Secrets for secure production deployment:

```bash
# Setup production secrets
./scripts/setup-secrets.sh

# Validate secrets before deployment
./scripts/setup-secrets.sh validate
```

#### Required Secrets

The following secrets must be configured:

| Secret | File | Purpose |
|--------|------|---------|
| `db_password` | `secrets/db_password.txt` | PostgreSQL database password |
| `jwt_secret` | `secrets/jwt_secret.txt` | JWT token signing secret |
| `encryption_key` | `secrets/encryption_key.txt` | Application encryption key |
| `github_token` | `secrets/github_token.txt` | GitHub API integration |
| `slack_bot_token` | `secrets/slack_bot_token.txt` | Slack notifications |
| `anthropic_api_key` | `secrets/anthropic_api_key.txt` | AI service integration |
| `grafana_password` | `secrets/grafana_password.txt` | Grafana admin password |

#### Security Requirements

- Secrets are mounted as read-only files in containers
- File permissions are restricted (600/700)
- Never commit actual secrets to version control
- Use different secrets for each environment

### Building Production Images

```bash
# Setup secrets first
./scripts/setup-secrets.sh

# Build production images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Start with production configuration
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

### Production Environment Variables

Production uses Docker Secrets instead of environment variables:

```bash
# Backend configuration (docker-compose.prod.yml)
NODE_ENV=production
DOCKER_SECRETS=true
SECRETS_PROVIDER=file

# Secrets are loaded from /run/secrets/ in containers
# No need to set secret values in environment variables
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**:
   ```bash
   # Check what's using ports
   lsof -i :3001 -i :5173 -i :5432
   
   # Stop conflicting services
   docker-compose down
   ```

2. **Database Connection Issues**:
   ```bash
   # Check PostgreSQL status
   docker-compose ps postgres
   
   # View PostgreSQL logs
   docker-compose logs postgres
   
   # Reset database
   docker-compose down -v
   docker-compose up postgres
   ```

3. **Build Issues**:
   ```bash
   # Clean Docker cache
   docker system prune -a
   
   # Rebuild without cache
   docker-compose build --no-cache
   ```

4. **Volume Permission Issues**:
   ```bash
   # Check volume mounts
   docker-compose config
   
   # Recreate volumes
   docker-compose down -v
   docker-compose up
   ```

### Performance Optimization

1. **Improve Build Speed**:
   ```dockerfile
   # Use Docker layer caching
   # Copy package.json before source code
   COPY package.json ./
   RUN pnpm install
   COPY . .
   ```

2. **Optimize Volume Mounts**:
   ```bash
   # Use named volumes for node_modules
   volumes:
     - backend_node_modules:/app/packages/backend/node_modules
   ```

3. **Enable BuildKit**:
   ```bash
   export DOCKER_BUILDKIT=1
   export COMPOSE_DOCKER_CLI_BUILD=1
   ```

## Development Profiles

### Standard Development

```bash
# Full development environment
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Debug Mode

```bash
# Include pgAdmin for database debugging
docker-compose --profile debug up
```

### Production Testing

```bash
# Test production build locally
docker-compose --profile production up
```

## Health Checks

All services include health checks:

```bash
# Check service health
docker-compose ps

# Service-specific health check
curl http://localhost:3001/health
curl http://localhost:5173/health
```

## Backup & Restore

### Database Backup

```bash
# Create backup
docker-compose exec postgres pg_dump -U taskmaster taskmaster_dev > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U taskmaster taskmaster_dev < backup.sql
```

### Volume Backup

```bash
# Backup volumes
docker run --rm -v taskmaster-ui_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# Restore volumes
docker run --rm -v taskmaster-ui_postgres_data:/data -v $(pwd):/backup alpine sh -c "cd /data && tar xzf /backup/postgres_backup.tar.gz"
```

## Integration with Existing Development

The Docker setup is designed to complement, not replace, your existing development workflow:

1. **Use Docker for services**: Database, full-stack testing
2. **Use local for development**: IDE integration, debugging
3. **Hybrid approach**: Run database in Docker, apps locally

```bash
# Start only database
docker-compose up -d postgres

# Run apps locally
pnpm dev
```

This setup provides a robust, scalable development environment that closely mirrors production while maintaining the flexibility needed for rapid development.