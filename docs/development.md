# Development Guide

## Quick Start

### Prerequisites
- **Node.js** 18+ (LTS recommended)
- **pnpm** (preferred) or npm/yarn
- **Git** for version control

### Installation

```bash
# Install pnpm globally (one-time setup)
npm install -g pnpm

# Clone the repository
git clone https://github.com/gcheliz/taskmaster-ui.git
cd taskmaster-ui

# Install dependencies
pnpm install

# Start development servers
pnpm run dev
```

### Development URLs
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **API Health**: http://localhost:3001/api/health

## Project Structure

```
taskmaster-ui/
├── packages/
│   ├── backend/          # Node.js/Express API server
│   │   ├── src/
│   │   │   ├── controllers/    # Route handlers
│   │   │   ├── services/       # Business logic
│   │   │   ├── middleware/     # Express middleware
│   │   │   ├── routes/         # API routes
│   │   │   ├── types/          # TypeScript types
│   │   │   └── utils/          # Utility functions
│   │   ├── dist/              # Compiled JavaScript
│   │   └── package.json
│   │
│   └── frontend/         # React/TypeScript UI
│       ├── src/
│       │   ├── components/     # React components
│       │   ├── contexts/       # React contexts
│       │   ├── hooks/          # Custom hooks
│       │   ├── services/       # API clients
│       │   ├── types/          # TypeScript types
│       │   └── utils/          # Utility functions
│       ├── dist/              # Build output
│       └── package.json
│
├── .taskmaster/          # TaskMaster AI configuration
├── docs/                 # Documentation
├── pnpm-workspace.yaml   # Workspace configuration
├── .npmrc               # pnpm settings
└── package.json         # Root package configuration
```

## Development Commands

### Root Level Commands (Recommended)

```bash
# Development
pnpm run dev              # Start both frontend and backend
pnpm run dev:backend      # Start backend only
pnpm run dev:frontend     # Start frontend only

# Building
pnpm run build            # Build both packages
pnpm run build:backend    # Build backend only
pnpm run build:frontend   # Build frontend only

# Testing
pnpm run test             # Run all tests
pnpm run test:backend     # Run backend tests
pnpm run test:frontend    # Run frontend tests
pnpm run test:e2e         # Run end-to-end tests

# Code Quality
pnpm run lint             # Lint all packages
pnpm run format           # Format all packages

# Production
pnpm run start            # Start backend in production
```

## Package Management

### Performance Comparison

| Package Manager | Install Speed | Disk Usage | Monorepo Support |
|----------------|---------------|------------|------------------|
| **pnpm** ⭐    | 3x faster     | 70% less   | Excellent        |
| **bun**        | 10x faster    | Similar    | Good             |
| **yarn**       | 2x faster     | Similar    | Good             |
| **npm**        | Baseline      | Baseline   | Basic            |

### Adding Dependencies

```bash
# Add to specific package
pnpm add express --filter=backend
pnpm add react --filter=frontend

# Add dev dependencies
pnpm add -D @types/node --filter=backend
pnpm add -D @types/react --filter=frontend

# Add to root (for tooling)
pnpm add -D eslint -w
```

## Environment Configuration

### Backend Environment Variables

Create `.env` file in `packages/backend/`:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=sqlite://./database.db

# TaskMaster CLI
TASKMASTER_CLI_PATH=task-master

# API Keys (if needed)
API_KEY_SECRET=your-secret-key
```

### Frontend Environment Variables

Create `.env` file in `packages/frontend/`:

```env
# API Configuration
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001

# Development
VITE_DEV_MODE=true
```

## Testing

### Test Structure
```
packages/
├── backend/src/**/*.test.ts     # Backend unit tests
├── frontend/src/**/*.test.tsx   # Frontend unit tests
└── e2e/                        # End-to-end tests
```

### Running Tests

```bash
# All tests
pnpm run test

# Watch mode
pnpm run test:backend -- --watch
pnpm run test:frontend -- --watch

# Coverage reports
pnpm run test:backend -- --coverage
pnpm run test:frontend -- --coverage
```

## Debugging

### Backend Debugging

```bash
# Debug mode
DEBUG=* pnpm run dev:backend

# Specific debug namespace
DEBUG=taskmaster:* pnpm run dev:backend
```

### Frontend Debugging

```bash
# Vite debugging
pnpm run dev:frontend -- --debug

# Source maps are enabled by default in development
```

## Troubleshooting

### Common Issues

#### Installation Problems
```bash
# Clear cache and reinstall
pnpm store prune
rm -rf node_modules
pnpm install
```

#### Build Failures
```bash
# Check TypeScript errors
pnpm run build:backend
pnpm run build:frontend

# Clean build
rm -rf packages/*/dist
pnpm run build
```

#### Port Conflicts
```bash
# Check running processes
lsof -i :3001
lsof -i :5173

# Kill processes
kill -9 $(lsof -t -i:3001)
```

#### Database Issues
```bash
# Reset database
rm packages/backend/database.db
pnpm run dev:backend  # Will recreate
```

## Deployment

### Production Build

```bash
# Build for production
NODE_ENV=production pnpm run build

# Start production server
NODE_ENV=production pnpm run start
```

### Docker Support

```dockerfile
# Use the provided Dockerfile
docker build -t taskmaster-ui .
docker run -p 3001:3001 taskmaster-ui
```

## Security

### Development Security

- **Environment variables**: Never commit `.env` files
- **API keys**: Use environment variables
- **Dependencies**: Regular security audits

```bash
# Security audit
pnpm audit

# Fix vulnerabilities
pnpm audit --fix
```