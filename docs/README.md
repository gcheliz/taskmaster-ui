# TaskMaster UI Documentation

Welcome to the TaskMaster UI documentation. This guide provides comprehensive information about the project architecture, development, and deployment.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm run dev

# Run tests
pnpm test

# Build for production
pnpm build
```

## Documentation Structure

- **[Architecture Overview](./architecture.md)** - System design and technical architecture
- **[Development Guide](./development.md)** - Setup, workflow, and best practices
- **[API Reference](./api-reference.md)** - Backend API endpoints and usage
- **[Component Library](./components.md)** - Frontend components and design system
- **[Deployment Guide](./deployment.md)** - Production deployment and configuration

## Project Overview

TaskMaster UI is a modern project task management application with repository integration. Built with:

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS
- **Backend**: Node.js, Express, Prisma, PostgreSQL
- **Infrastructure**: Docker, GitHub Actions, GCP-ready

## Key Features

- 📋 Advanced task management with Kanban boards
- 🔄 Real-time repository synchronization
- 👥 Team collaboration tools
- 📊 Analytics and reporting
- 🎨 Modern, accessible UI with dark mode
- 🔒 Enterprise-grade security

## Repository Structure

```
taskmaster-ui/
├── packages/
│   ├── frontend/         # React application
│   └── backend/          # Node.js API server
├── docs/                 # Project documentation
├── .github/              # GitHub Actions workflows
├── docker/               # Docker configurations
└── e2e/                  # End-to-end tests
```

## Getting Help

- Check the [Troubleshooting Guide](./troubleshooting.md)
- Review [Common Issues](./common-issues.md)
- Submit issues on [GitHub](https://github.com/your-org/taskmaster-ui)

## Contributing

Please read our [Contributing Guidelines](../CONTRIBUTING.md) before submitting PRs.