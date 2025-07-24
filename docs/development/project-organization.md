# Project Organization Guide

## Directory Structure

This document explains the organization of the TaskMaster UI project after the cleanup and restructuring.

### Root Level

- **`.github/`** - GitHub-specific configurations (workflows, templates)
- **`.taskmaster/`** - TaskMaster tool configurations and task management
- **`.claude/`** - Claude AI assistant configurations
- **`.vscode/`** - VS Code editor settings
- **`docs/`** - Project-wide documentation
- **`packages/`** - Monorepo packages (frontend & backend)
- **`scripts/`** - Project-wide scripts organized by purpose
- **`docker/`** - Docker configurations for containers

### Documentation (`/docs/`)

```
docs/
├── api/                    # API documentation and specifications
├── architecture/           # System architecture and design docs
├── deployment/            # Deployment guides and configurations
├── development/           # Development guides
│   ├── frontend/         # Frontend-specific guides
│   └── backend/          # Backend-specific guides
├── ui-mockups/           # UI mockups and design files
└── user-guides/          # End-user documentation
```

### Scripts (`/scripts/`)

```
scripts/
├── dev/                   # Development scripts
│   ├── docker-test.sh    # Docker testing
│   ├── setup-secrets.sh  # Secret management setup
│   └── generate-ssl-certs.sh  # SSL certificate generation
├── build/                 # Build scripts
├── deploy/                # Deployment scripts
│   ├── migrate-and-start.sh  # Database migration
│   └── health-check.sh   # Health check utilities
└── utils/                 # Utility scripts
    └── backup.sh         # Backup utilities
```

### Frontend Package (`/packages/frontend/`)

```
packages/frontend/
├── public/               # Static assets only (no test files)
├── src/                  # Source code
│   ├── assets/          # Images, fonts, static files
│   ├── components/      # React components
│   ├── contexts/        # React contexts
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components
│   ├── routes/          # Routing configuration
│   ├── services/        # API services
│   ├── stores/          # State management (future)
│   ├── styles/          # Global styles
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── tests/               # All frontend tests
│   ├── unit/           # Unit tests
│   ├── integration/    # Integration tests
│   └── e2e/            # End-to-end tests
└── docs/               # Frontend-specific documentation
```

### Backend Package (`/packages/backend/`)

```
packages/backend/
├── src/                  # Source code
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── tests/               # All backend tests
│   ├── unit/           # Unit tests
│   ├── integration/    # Integration tests
│   └── e2e/            # End-to-end tests
├── prisma/              # Database schema and migrations
└── docs/               # Backend-specific documentation
```

## Key Changes Made

### 1. Documentation Consolidation
- Moved all mockup files from `public/` to `docs/ui-mockups/`
- Moved analysis reports to `.taskmaster/reports/`
- Created clear documentation hierarchy

### 2. Script Organization
- Categorized scripts by purpose (dev, build, deploy, utils)
- Removed duplicate and test scripts
- Centralized script management

### 3. Test Organization
- Created dedicated `tests/` directories
- Separated unit, integration, and e2e tests
- Removed disabled test directories

### 4. Cleanup Actions
- Removed debug files and test scripts
- Cleared log files
- Removed temporary test endpoints
- Cleaned public directory

## Best Practices

### Adding New Files

1. **Documentation**: Place in appropriate `/docs/` subdirectory
2. **Scripts**: Add to `/scripts/` with clear categorization
3. **Tests**: Place in `tests/` with proper test type
4. **Components**: Follow atomic design in `components/`

### File Naming Conventions

- **Components**: PascalCase (e.g., `TaskCard.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Tests**: Match source file with `.test.ts` extension
- **Documentation**: kebab-case (e.g., `api-guide.md`)

### Import Organization

1. External libraries
2. Internal packages
3. Components
4. Utilities
5. Types
6. Styles

### Testing Strategy

- **Unit Tests**: For utilities and pure functions
- **Integration Tests**: For API endpoints and services
- **E2E Tests**: For critical user workflows

## Maintenance

### Regular Cleanup Tasks

1. Clear log files monthly
2. Archive old reports quarterly
3. Review and update documentation
4. Remove unused dependencies

### Adding New Features

1. Create feature documentation in appropriate docs folder
2. Add tests before implementation
3. Update relevant documentation
4. Follow established patterns

## Migration Notes

After the restructuring:

1. Update import paths if needed
2. Update CI/CD configurations
3. Update deployment scripts
4. Inform team of new structure

## Quick Reference

| Content Type | Location |
|-------------|----------|
| API Docs | `/docs/api/` |
| UI Mockups | `/docs/ui-mockups/` |
| Dev Scripts | `/scripts/dev/` |
| Frontend Tests | `/packages/frontend/tests/` |
| Backend Tests | `/packages/backend/tests/` |
| Task Reports | `.taskmaster/reports/` |