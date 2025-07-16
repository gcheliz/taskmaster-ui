# TaskMaster UI - Development Guide

## 🚀 Quick Start

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
- **API Documentation**: http://localhost:3001/api-docs (when implemented)

---

## 📁 Project Structure

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

---

## 🛠️ Development Commands

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
pnpm run lint:backend     # Lint backend only
pnpm run lint:frontend    # Lint frontend only
pnpm run format           # Format all packages
pnpm run format:backend   # Format backend only
pnpm run format:frontend  # Format frontend only

# Production
pnpm run start            # Start backend in production
pnpm run start:backend    # Start backend server
pnpm run start:frontend   # Start frontend server
```

### Package-Level Commands

```bash
# Backend (packages/backend/)
pnpm run dev        # Start development server
pnpm run build      # Compile TypeScript
pnpm run start      # Start production server
pnpm run test       # Run Jest tests
pnpm run lint       # Run ESLint
pnpm run format     # Run Prettier

# Frontend (packages/frontend/)
pnpm run dev        # Start Vite dev server
pnpm run build      # Build for production
pnpm run preview    # Preview production build
pnpm run test       # Run Vitest tests
pnpm run lint       # Run ESLint
pnpm run format     # Run Prettier
```

---

## 🔧 Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Start development
pnpm run dev

# Make changes to code
# Run tests frequently
pnpm run test

# Lint and format before committing
pnpm run lint
pnpm run format

# Commit changes
git add .
git commit -m "feat: add your feature description"
```

### 2. Code Quality Checks

```bash
# Full quality check
pnpm run lint && pnpm run format && pnpm run test

# Fix linting issues automatically
pnpm run lint:backend -- --fix
pnpm run lint:frontend -- --fix
```

### 3. Building and Testing

```bash
# Build both packages
pnpm run build

# Run all tests
pnpm run test

# Run E2E tests
pnpm run test:e2e
```

---

## 🧪 Testing

### Backend Testing
- **Framework**: Jest
- **Location**: `packages/backend/src/**/*.test.ts`
- **Commands**: `pnpm run test:backend`

### Frontend Testing
- **Framework**: Vitest + React Testing Library
- **Location**: `packages/frontend/src/**/*.test.tsx`
- **Commands**: `pnpm run test:frontend`

### E2E Testing
- **Framework**: Playwright
- **Location**: `tests/e2e/`
- **Commands**: `pnpm run test:e2e`

### Test Examples

```bash
# Run specific test file
pnpm run test:backend -- src/services/api.test.ts

# Run tests in watch mode
pnpm run test:frontend -- --watch

# Run tests with coverage
pnpm run test:backend -- --coverage
```

---

## 🌐 Environment Configuration

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

---

## 📊 Performance Optimization

### pnpm Benefits
- **3x faster** installs than npm
- **70% less disk space** usage
- **Strict dependency resolution**
- **Perfect monorepo support**

### Build Performance
```bash
# Parallel builds
pnpm run build --parallel

# Cache builds
pnpm run build --cache

# Production optimization
NODE_ENV=production pnpm run build
```

---

## 🔍 Debugging

### Backend Debugging

```bash
# Debug mode
DEBUG=* pnpm run dev:backend

# Specific debug namespace
DEBUG=taskmaster:* pnpm run dev:backend

# VS Code debugging
# Use the provided launch.json configuration
```

### Frontend Debugging

```bash
# React DevTools
# Install React DevTools browser extension

# Vite debugging
pnpm run dev:frontend -- --debug

# Source maps are enabled by default in development
```

### Common Issues

1. **Port conflicts**: Change ports in environment files
2. **Dependency issues**: Run `pnpm install` from root
3. **Build failures**: Check TypeScript errors with `pnpm run build`
4. **Test failures**: Run `pnpm run test` to see specific errors

---

## 📦 Package Management

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

### Workspace Dependencies

```bash
# Reference another workspace package
pnpm add @taskmaster/backend --filter=frontend
```

---

## 🚀 Deployment

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

---

## 🤝 Contributing

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Enforced code quality
- **Prettier**: Automatic formatting
- **Husky**: Pre-commit hooks

### Pull Request Process

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Run quality checks
5. Submit pull request

### Commit Convention

```bash
# Format: type(scope): description
feat(api): add PRD analysis endpoint
fix(ui): resolve layout issue
docs(readme): update installation guide
test(backend): add service tests
```

---

## 🆘 Troubleshooting

### Common Issues

#### 1. Installation Problems
```bash
# Clear cache and reinstall
pnpm store prune
rm -rf node_modules
pnpm install
```

#### 2. Build Failures
```bash
# Check TypeScript errors
pnpm run build:backend
pnpm run build:frontend

# Clean build
rm -rf packages/*/dist
pnpm run build
```

#### 3. Port Conflicts
```bash
# Check running processes
lsof -i :3001
lsof -i :5173

# Kill processes
kill -9 $(lsof -t -i:3001)
```

#### 4. Database Issues
```bash
# Reset database
rm packages/backend/database.db
pnpm run dev:backend  # Will recreate
```

### Getting Help

- **GitHub Issues**: https://github.com/gcheliz/taskmaster-ui/issues
- **Discussions**: https://github.com/gcheliz/taskmaster-ui/discussions
- **Documentation**: Check `docs/` directory

---

## 📈 Performance Monitoring

### Development Metrics

```bash
# Bundle analysis
pnpm run build:frontend -- --analyze

# Performance testing
pnpm run test:performance

# Memory usage
node --inspect packages/backend/dist/index.js
```

### Production Monitoring

- **Health checks**: `/api/health`
- **Metrics**: `/api/metrics`
- **Logs**: Check application logs

---

## 🔐 Security

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

### Production Security

- **HTTPS**: Always use HTTPS in production
- **Headers**: Security headers configured
- **Validation**: Input validation on all endpoints

---

## 📚 Additional Resources

- **TaskMaster AI**: https://github.com/taskmaster-ai/taskmaster
- **React Documentation**: https://react.dev
- **TypeScript Guide**: https://www.typescriptlang.org/docs
- **pnpm Documentation**: https://pnpm.io
- **Vite Guide**: https://vitejs.dev/guide

---

This development guide provides comprehensive information for working with the TaskMaster UI project. For specific questions or issues, please refer to the project's GitHub repository or create an issue.