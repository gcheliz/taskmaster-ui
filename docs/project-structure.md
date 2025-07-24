# TaskMaster UI - Recommended Project Structure

## Proposed Directory Structure

```
taskmaster-ui/
├── .github/                    # GitHub specific files
│   ├── workflows/             # CI/CD workflows
│   ├── ISSUE_TEMPLATE/        # Issue templates
│   └── PULL_REQUEST_TEMPLATE.md
│
├── .taskmaster/               # TaskMaster specific files
│   ├── config.json           # Configuration
│   ├── tasks/                # Task files
│   │   └── tasks.json
│   ├── docs/                 # TaskMaster-specific documentation
│   │   ├── prd.txt
│   │   └── *.txt            # Task import files
│   └── templates/            # Templates
│
├── docs/                      # Project documentation
│   ├── api/                  # API documentation
│   ├── architecture/         # Architecture diagrams and docs
│   ├── deployment/           # Deployment guides
│   ├── development/          # Development guides
│   │   ├── frontend/        # Frontend specific guides
│   │   └── backend/         # Backend specific guides
│   ├── ui-mockups/          # UI mockups and designs
│   └── user-guides/         # End-user documentation
│
├── packages/
│   ├── frontend/
│   │   ├── public/          # Static assets only
│   │   │   ├── favicon.ico
│   │   │   └── index.html
│   │   ├── src/
│   │   │   ├── assets/      # Images, fonts, etc.
│   │   │   ├── components/  # React components
│   │   │   ├── contexts/    # React contexts
│   │   │   ├── hooks/       # Custom hooks
│   │   │   ├── pages/       # Page components
│   │   │   ├── routes/      # Routing configuration
│   │   │   ├── services/    # API services
│   │   │   ├── stores/      # State management (future)
│   │   │   ├── styles/      # Global styles
│   │   │   ├── types/       # TypeScript types
│   │   │   └── utils/       # Utility functions
│   │   ├── tests/           # All frontend tests
│   │   │   ├── unit/
│   │   │   ├── integration/
│   │   │   └── e2e/
│   │   └── docs/            # Frontend-specific docs
│   │
│   └── backend/
│       ├── src/
│       │   ├── config/      # Configuration files
│       │   ├── controllers/ # Route controllers
│       │   ├── middleware/  # Express middleware
│       │   ├── models/      # Data models
│       │   ├── routes/      # API routes
│       │   ├── services/    # Business logic
│       │   ├── types/       # TypeScript types
│       │   └── utils/       # Utility functions
│       ├── tests/           # All backend tests
│       │   ├── unit/
│       │   ├── integration/
│       │   └── e2e/
│       ├── prisma/          # Database schema
│       └── docs/            # Backend-specific docs
│
├── scripts/                   # Project-wide scripts
│   ├── dev/                  # Development scripts
│   ├── build/                # Build scripts
│   ├── deploy/               # Deployment scripts
│   └── utils/                # Utility scripts
│
├── .claude/                   # Claude-specific config
│   ├── commands/             # Custom commands
│   └── settings.json
│
├── .vscode/                   # VS Code settings
├── docker/                    # Docker configurations
│   ├── frontend/
│   └── backend/
│
├── .env.example              # Environment variables example
├── .gitignore
├── CLAUDE.md                 # Claude AI instructions
├── README.md                 # Project overview
├── CONTRIBUTING.md           # Contribution guidelines
├── docker-compose.yml
├── package.json              # Root package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── tsconfig.json             # Root TypeScript config
```

## Key Changes from Current Structure

### 1. **Documentation Consolidation**
- All project docs moved to `/docs/` with clear subdirectories
- Package-specific docs in `/packages/*/docs/`
- TaskMaster docs stay in `.taskmaster/docs/`

### 2. **Test Organization**
- All tests moved to `tests/` directory within each package
- Clear separation of unit, integration, and e2e tests
- No test files in src directories

### 3. **Script Organization**
- Root `/scripts/` for project-wide scripts
- Categorized by purpose (dev, build, deploy)
- Package-specific scripts removed in favor of npm scripts

### 4. **Clean Public Directory**
- Frontend public directory only contains production assets
- Mockups moved to `/docs/ui-mockups/`
- No test files in public

### 5. **Future-Ready Structure**
- `/stores/` directory ready for state management
- Clear separation of concerns
- Scalable architecture

## Migration Steps

1. Create new directory structure
2. Move documentation files
3. Consolidate test files
4. Clean up debug/temporary files
5. Reorganize scripts
6. Update import paths
7. Update CI/CD configurations
8. Update documentation references