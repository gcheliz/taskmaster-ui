# TaskMaster UI - Development Workflow Guide

## Quick Start

### Prerequisites
- Node.js 20+ and pnpm
- PostgreSQL 14+ (for backend database)
- Docker and Docker Compose (recommended for containerized development)

### Initial Setup

#### Option 1: Docker Development (Recommended)

```bash
# Start full containerized development environment
pnpm run docker:dev

# Services will be available at:
# - Frontend: http://localhost:5173
# - Backend API: http://localhost:3001  
# - Prisma Studio: http://localhost:5555
```

#### Option 2: Local Development with Docker Database

```bash
# Install dependencies
pnpm install

# Start PostgreSQL (Docker)
docker-compose up -d postgres

# Initialize database
pnpm db:migrate
pnpm db:seed

# Start development servers
pnpm dev
```

#### Option 3: Fully Local Development

```bash
# Install dependencies
pnpm install

# Start local PostgreSQL service
# (Configure DATABASE_URL in .env)

# Initialize database
pnpm db:migrate
pnpm db:seed

# Start development servers
pnpm dev
```

## Development Commands

### Primary Development Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start both frontend and backend in development mode |
| `pnpm dev:watch` | Start with enhanced file watching (includes Prisma schema) |
| `pnpm dev:backend` | Start only backend development server |
| `pnpm dev:frontend` | Start only frontend development server |

### Docker Development Scripts

| Command | Description |
|---------|-------------|
| `pnpm run docker:dev` | Start full Docker development environment |
| `pnpm run docker:dev:build` | Build and start Docker development environment |
| `pnpm run docker:up` | Start Docker services in background |
| `pnpm run docker:down` | Stop Docker services |
| `pnpm run docker:logs` | View logs from all services |
| `pnpm run docker:logs:backend` | View backend service logs |
| `pnpm run docker:logs:frontend` | View frontend service logs |
| `pnpm run docker:watch` | Enable Docker Compose watch mode |
| `pnpm run docker:clean` | Clean Docker containers and volumes |
| `pnpm run docker:reset` | Full Docker environment reset |

### Database Management

| Command | Description |
|---------|-------------|
| `pnpm db:studio` | Launch Prisma Studio (database GUI) |
| `pnpm db:migrate` | Create and apply new migration |
| `pnpm db:migrate:deploy` | Apply migrations in production |
| `pnpm db:seed` | Seed database with sample data |
| `pnpm db:reset` | Reset database and reseed |
| `pnpm db:generate` | Regenerate Prisma client |
| `pnpm db:push` | Push schema changes without migrations |
| `pnpm db:pull` | Pull schema from database |

### Testing & Quality

| Command | Description |
|---------|-------------|
| `pnpm test` | Run all tests (backend + frontend) |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:e2e` | Run end-to-end tests |
| `pnpm test:e2e:ui` | Run E2E tests with UI |
| `pnpm lint` | Run linting on all packages |
| `pnpm lint:fix` | Fix linting issues automatically |
| `pnpm format` | Format code with Prettier |
| `pnpm format:check` | Check code formatting |

### Build & Production

| Command | Description |
|---------|-------------|
| `pnpm build` | Build both frontend and backend |
| `pnpm start` | Start production backend server |
| `pnpm clean` | Clean build artifacts |

## Development Workflow Features

### 🔥 Hot Reloading

The development setup includes comprehensive hot-reloading:

- **Backend**: Nodemon watches TypeScript files and restarts automatically
- **Frontend**: Vite provides instant hot module replacement
- **Prisma Schema**: Automatic client regeneration on schema changes
- **Database**: Live updates with Prisma Studio

### 📁 File Watching

Nodemon is configured to watch:
- `src/**/*.ts` - All TypeScript source files
- `prisma/schema.prisma` - Database schema changes
- Ignores: test files, node_modules, dist, generated files

### 🔄 Automatic Prisma Regeneration

When `schema.prisma` changes:
1. Nodemon detects the change
2. Prisma client is automatically regenerated
3. Backend server restarts with new types
4. TypeScript compilation picks up new types

### 🎯 Enhanced Development Experience

#### Real-time Feedback
```bash
# Start with enhanced watching
pnpm dev:watch

# This runs:
# - Backend with Prisma schema watching
# - Frontend with HMR
# - Automatic client regeneration
```

#### Database Exploration
```bash
# Launch Prisma Studio
pnpm db:studio
# Opens http://localhost:5555
```

#### Continuous Testing
```bash
# Run tests in watch mode
pnpm test:watch
```

## Development Environment Variables

### Backend (.env)
```bash
# Database
DATABASE_URL="postgresql://taskmaster:password@localhost:5432/taskmaster_dev"

# Application
NODE_ENV=development
PORT=3001

# Prisma Studio
PRISMA_STUDIO_PORT=5555
```

### Frontend (.env.local)
```bash
# API Configuration
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001

# Development
VITE_NODE_ENV=development
```

## Common Development Tasks

### Adding a New Feature

1. **Database Changes**:
   ```bash
   # Modify prisma/schema.prisma
   pnpm db:migrate
   # Creates migration and regenerates client
   ```

2. **Backend Development**:
   - Add/modify services in `packages/backend/src/services/`
   - Update controllers in `packages/backend/src/controllers/`
   - Hot-reload handles TypeScript compilation

3. **Frontend Development**:
   - Add components in `packages/frontend/src/components/`
   - Update pages in `packages/frontend/src/pages/`
   - Vite provides instant feedback

4. **Testing**:
   ```bash
   # Run tests continuously
   pnpm test:watch
   
   # Run E2E tests
   pnpm test:e2e
   ```

### Database Schema Updates

1. **Modify Schema**:
   ```bash
   # Edit prisma/schema.prisma
   # Save file - auto-regeneration triggers
   ```

2. **Create Migration**:
   ```bash
   pnpm db:migrate
   # Creates migration and applies it
   ```

3. **Update Seed Data**:
   ```bash
   # Edit prisma/seed.ts if needed
   pnpm db:reset
   ```

### Debugging

#### Backend Debugging
- Console logs appear in terminal where `pnpm dev` is running
- Use VS Code debugger with Node.js configuration
- Prisma query logs enabled in development

#### Frontend Debugging
- Use browser DevTools
- React DevTools extension recommended
- Error overlay in browser for build errors

#### Database Debugging
- Use Prisma Studio: `pnpm db:studio`
- Direct PostgreSQL access via psql or GUI tools
- Query logs in backend console

## Performance Tips

### Development Performance

1. **Use Specific Scripts**: Run only what you need
   ```bash
   # Instead of full dev
   pnpm dev:backend  # Only backend
   pnpm dev:frontend # Only frontend
   ```

2. **Skip Type Checking**: For faster builds
   ```bash
   # Backend builds with type checking
   # Use --no-check for faster iteration if needed
   ```

3. **Database Optimization**:
   ```bash
   # Use db:push for schema iteration (faster than migrations)
   pnpm db:push
   
   # Reset only when needed
   pnpm db:reset
   ```

### Resource Usage

- Frontend dev server: ~200MB RAM
- Backend dev server: ~150MB RAM  
- PostgreSQL: ~50MB RAM
- Prisma Studio: ~100MB RAM

## Troubleshooting

### Common Issues

1. **Port Conflicts**:
   - Frontend: 5173 (Vite default)
   - Backend: 3001
   - Prisma Studio: 5555
   - PostgreSQL: 5432

2. **Database Connection**:
   ```bash
   # Check PostgreSQL is running
   docker-compose ps postgres
   
   # Restart if needed
   docker-compose restart postgres
   ```

3. **Prisma Issues**:
   ```bash
   # Regenerate client
   pnpm db:generate
   
   # Reset if corrupted
   pnpm db:reset
   ```

4. **Node Modules**:
   ```bash
   # Clean install
   pnpm clean
   rm -rf node_modules
   pnpm install
   ```

### Getting Help

- Check console output for error messages
- Use `--verbose` flag for detailed logging
- Consult Prisma documentation for database issues
- Check network tab in browser for API issues

## IDE Configuration

### VS Code Recommended Extensions

- Prisma
- TypeScript Hero  
- ESLint
- Prettier
- Thunder Client (API testing)

### Recommended Settings

```json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

This workflow provides a comprehensive development experience with automatic reloading, type safety, and efficient database management.