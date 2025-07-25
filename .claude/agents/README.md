# Specialized AI Agents for TaskMaster UI

This directory contains specialized AI agents, each expert in specific domains of the TaskMaster UI project. These agents follow the project's custom rules defined in CLAUDE.md files.

## Available Agents

### 1. 🎯 [TaskMaster Commander](./taskmaster-commander.md)
Expert in task-master CLI operations, task organization, and project management workflows.
- Task creation and status management
- PRD parsing and complexity analysis
- Dependency chain optimization
- Batch operations and tag filtering

### 2. 📦 [pnpm Package Manager Pro](./pnpm-package-manager.md)
Expert in pnpm workspace management, dependency optimization, and monorepo best practices.
- Workspace configuration
- Dependency conflict resolution
- Lock file troubleshooting
- Monorepo patterns

### 3. 🔒 [TypeScript Strict Mode Wizard](./typescript-strict-mode.md)
Expert in TypeScript strict mode migration, type safety enforcement, and gradual typing strategies.
- Strict mode configuration
- Type inference optimization
- Migration strategies
- Common pattern fixes

### 4. 🚂 [Express Migration Specialist](./express-migration.md)
Expert in Express.js v4 to v5 migration, middleware patterns, and Node.js best practices.
- Breaking changes guide
- Async error handling
- Middleware updates
- Performance improvements

### 5. 🧭 [React Router Navigator](./react-router-navigator.md)
Expert in React Router v6 to v7 migration, routing patterns, and navigation best practices.
- Data API implementation
- Type-safe routing
- Loader/Action patterns
- Migration strategies

### 6. 🧪 [Testing Guru](./testing-guru.md)
Expert in testing strategies, Jest/Vitest migration, and comprehensive test coverage.
- Vitest configuration
- Testing patterns
- Coverage optimization
- E2E with Playwright

### 7. 🐳 [Docker Commander](./docker-commander.md)
Expert in Docker containerization, multi-stage builds, and Kubernetes deployments.
- Multi-stage optimization
- Docker Compose orchestration
- Security best practices
- Kubernetes manifests

### 8. 📏 [ESLint Configuration Expert](./eslint-configuration.md)
Expert in ESLint v8 to v9 migration, custom rules, and code quality automation.
- Flat config migration
- Custom rule development
- Monorepo strategies
- Performance optimization

## Usage Guidelines

1. **Agent Selection**: Choose the appropriate agent based on your task domain
2. **Context Awareness**: Each agent follows project-specific rules from CLAUDE.md
3. **Best Practices**: Agents enforce critical project rules (e.g., PNPM only, no npm)
4. **Integration**: Agents work together for complex multi-domain tasks

## Project Rules Enforcement

All agents enforce these critical rules:
- ✅ Always use pnpm (never npm or yarn)
- ✅ Execute commands from repository root
- ✅ Use --tag flag with task-master commands
- ✅ Never finish tasks with failing tests
- ✅ Commit after completing all subtasks
- ✅ No Claude mentions in commits
- ✅ Update CLAUDE.md with learnings

## Quick Reference

```bash
# When working with dependencies
# → Use pnpm Package Manager Pro

# When updating TypeScript config
# → Use TypeScript Strict Mode Wizard

# When managing tasks
# → Use TaskMaster Commander

# When writing tests
# → Use Testing Guru

# When containerizing
# → Use Docker Commander
```

## Contributing

When creating new agents:
1. Follow the existing template structure
2. Include critical project rules section
3. Add practical examples and commands
4. Document common issues and solutions
5. Update this README with the new agent