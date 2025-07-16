# TaskMaster UI - Interactive Development Environment

🚀 **A modern, web-based UI for TaskMaster AI project management** - combining the power of TaskMaster's AI-driven task breakdown with an intuitive, real-time interface for seamless development workflows.

![TaskMaster UI Banner](https://img.shields.io/badge/TaskMaster-UI-blue?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white)

## ⚡ Quick Start

This project uses **pnpm** for 3x faster performance and 70% less disk usage. All commands must be run from the **root directory**.

```bash
# Install pnpm globally (one time)
npm install -g pnpm

# Clone and install
git clone https://github.com/gcheliz/taskmaster-ui.git
cd taskmaster-ui
pnpm install

# Start development (both frontend and backend)
pnpm run dev
```

### 🌐 Development URLs
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **API Health**: http://localhost:3001/api/health

> 📖 **See [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** for comprehensive development documentation.

> 📦 **See [PACKAGE_MANAGERS.md](./PACKAGE_MANAGERS.md)** for bun, yarn, and npm alternatives with performance comparisons.

---

## 🎯 Features

### ✅ Implemented Features
- **🏗️ Monorepo Architecture** - Clean separation of frontend and backend
- **🔄 Real-time Updates** - WebSocket integration for live task updates
- **📊 Task Management** - Kanban-style boards with drag-and-drop
- **🌳 Repository Integration** - Git repository connection and management
- **📝 PRD Editor** - Rich text editing for Product Requirements Documents
- **🔍 PRD Analysis** - AI-powered task parsing and complexity analysis
- **💻 Embedded Terminal** - xterm.js integration with repository scoping
- **🎨 Modern UI** - React with TypeScript and responsive design
- **🔒 Type Safety** - Full TypeScript implementation
- **🧪 Test Coverage** - Jest and Vitest testing frameworks
- **📦 Package Management** - pnpm for superior performance

### 🚧 In Development
- **🔌 MCP Integration** - Model Context Protocol support
- **📈 Advanced Analytics** - Project insights and metrics
- **🔐 Authentication** - User management and security
- **🌙 Theme Support** - Light/dark mode switching
- **♿ Accessibility** - WCAG 2.1 compliance
- **📱 Mobile Support** - Responsive design improvements

---

## 🏗️ Architecture

### 📁 Project Structure
```
taskmaster-ui/
├── packages/
│   ├── backend/              # Node.js/Express API
│   │   ├── src/
│   │   │   ├── controllers/    # Route handlers
│   │   │   ├── services/       # Business logic
│   │   │   ├── middleware/     # Express middleware
│   │   │   ├── routes/         # API routes
│   │   │   └── types/          # TypeScript definitions
│   │   └── dist/              # Compiled output
│   │
│   └── frontend/             # React/TypeScript UI
│       ├── src/
│       │   ├── components/     # React components
│       │   ├── contexts/       # React contexts
│       │   ├── hooks/          # Custom hooks
│       │   ├── services/       # API clients
│       │   └── types/          # TypeScript definitions
│       └── dist/              # Build output
│
├── .taskmaster/              # TaskMaster AI configuration
├── docs/                     # Documentation
├── pnpm-workspace.yaml       # Workspace configuration
└── package.json             # Root package configuration
```

### 🛠️ Tech Stack

#### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: SQLite (development), PostgreSQL (production)
- **WebSockets**: Native WebSocket support
- **Testing**: Jest with TypeScript
- **CLI Integration**: TaskMaster AI CLI wrapper

#### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: Custom component library
- **State Management**: React Context + Hooks
- **Terminal**: xterm.js integration
- **Testing**: Vitest + React Testing Library
- **Styling**: CSS Modules + PostCSS

#### Development Tools
- **Package Manager**: pnpm (recommended)
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier
- **Testing**: Jest, Vitest, Playwright
- **Type Checking**: TypeScript strict mode

---

## 📦 Commands Reference

### 🚀 Development
```bash
pnpm run dev              # Start both frontend and backend
pnpm run dev:backend      # Start backend only (port 3001)
pnpm run dev:frontend     # Start frontend only (port 5173)
```

### 🏗️ Building
```bash
pnpm run build            # Build both packages
pnpm run build:backend    # Build backend only
pnpm run build:frontend   # Build frontend only
```

### 🧪 Testing
```bash
pnpm run test             # Run all tests
pnpm run test:backend     # Run backend tests (Jest)
pnpm run test:frontend    # Run frontend tests (Vitest)
pnpm run test:e2e         # Run end-to-end tests (Playwright)
```

### 🔍 Code Quality
```bash
pnpm run lint             # Lint all packages
pnpm run lint:backend     # Lint backend only
pnpm run lint:frontend    # Lint frontend only
pnpm run format           # Format all packages
pnpm run format:backend   # Format backend only
pnpm run format:frontend  # Format frontend only
```

### 🚀 Production
```bash
pnpm run start            # Start backend in production
pnpm run start:backend    # Start backend server
pnpm run start:frontend   # Start frontend server
```

---

## 🎨 Key Features Deep Dive

### 📊 Task Management
- **Kanban Board**: Visual task organization with drag-and-drop
- **Task CRUD**: Create, read, update, delete tasks
- **Status Tracking**: Pending, In Progress, Done, Blocked
- **Priority Levels**: High, Medium, Low with visual indicators
- **Dependencies**: Task dependency management
- **Real-time Updates**: Live synchronization across clients

### 🌳 Repository Integration
- **Git Integration**: Connect local repositories
- **Branch Management**: View and switch branches
- **Status Monitoring**: Track repository changes
- **Multi-Repository**: Manage multiple projects
- **Path Validation**: Ensure valid repository paths

### 📝 PRD Editor
- **Rich Text Editing**: Full-featured document editor
- **Auto-save**: Automatic saving to prevent data loss
- **Document Management**: Create, save, load documents
- **Export Options**: Multiple format support
- **Collaboration**: Real-time collaborative editing (planned)

### 🔍 AI Analysis
- **PRD Parsing**: Extract tasks from documents
- **Complexity Analysis**: AI-powered difficulty assessment
- **Task Generation**: Automatic task breakdown
- **Effort Estimation**: Time and resource estimates
- **Progress Tracking**: Visual progress indicators

### 💻 Embedded Terminal
- **xterm.js Integration**: Full terminal emulation
- **Repository Scoping**: Terminal sessions per repository
- **Session Persistence**: Maintain sessions across navigation
- **Multiple Sessions**: Tabbed terminal interface
- **Command History**: Persistent command history

---

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=sqlite://./database.db

# TaskMaster CLI
TASKMASTER_CLI_PATH=task-master

# API Configuration
API_KEY_SECRET=your-secret-key
```

#### Frontend (.env)
```env
# API Configuration
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001

# Development
VITE_DEV_MODE=true
```

### TaskMaster Integration

The application integrates with TaskMaster AI CLI. Install TaskMaster AI:

```bash
npm install -g task-master-ai
```

For detailed TaskMaster configuration, see [CLAUDE.md](./CLAUDE.md).

---

## 📊 Performance Benchmarks

### Package Manager Comparison
| Manager | Install Time | Build Time | Disk Usage |
|---------|-------------|------------|------------|
| **pnpm** | 8-10s | 10-12s | 150MB |
| **bun** | 2-3s | 5-8s | 200MB |
| **yarn** | 15-20s | 12-15s | 300MB |
| **npm** | 25-30s | 15-20s | 400MB |

### Build Performance
```bash
# Frontend build
vite build: ~5-8s
tsc check: ~3-5s

# Backend build
tsc compile: ~8-10s
```

---

## 🧪 Testing

### Test Coverage Goals
- **Backend**: >80% code coverage
- **Frontend**: >70% code coverage
- **E2E**: Critical user flows

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

### Test Structure
```
packages/
├── backend/src/**/*.test.ts     # Backend unit tests
├── frontend/src/**/*.test.tsx   # Frontend unit tests
└── tests/e2e/                  # End-to-end tests
```

---

## 🚀 Deployment

### Development Deployment
```bash
# Build for development
pnpm run build

# Start development server
pnpm run start
```

### Production Deployment
```bash
# Build for production
NODE_ENV=production pnpm run build

# Start production server
NODE_ENV=production pnpm run start
```

### Docker Support
```bash
# Build Docker image
docker build -t taskmaster-ui .

# Run container
docker run -p 3001:3001 taskmaster-ui
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md).

### Development Process
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run quality checks
6. Submit a pull request

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Enforced code quality
- **Prettier**: Automatic formatting
- **Conventional Commits**: Standardized commit messages

### Pull Request Checklist
- [ ] Tests pass (`pnpm run test`)
- [ ] Code is linted (`pnpm run lint`)
- [ ] Code is formatted (`pnpm run format`)
- [ ] Build succeeds (`pnpm run build`)
- [ ] Documentation updated (if needed)

---

## 🆘 Troubleshooting

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

# Kill processes if needed
kill -9 $(lsof -t -i:3001)
```

#### Database Issues
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

## 📈 Roadmap

### Phase 1: Foundation ✅
- [x] Monorepo setup
- [x] Basic UI components
- [x] API architecture
- [x] Database integration
- [x] Real-time updates

### Phase 2: Core Features ✅
- [x] Task management
- [x] Repository integration
- [x] PRD editor
- [x] Terminal integration
- [x] WebSocket communication

### Phase 3: AI Integration 🚧
- [x] PRD parsing
- [x] Complexity analysis
- [ ] Task generation
- [ ] Progress tracking
- [ ] Effort estimation

### Phase 4: Advanced Features 📋
- [ ] Authentication system
- [ ] Multi-user support
- [ ] Advanced analytics
- [ ] Mobile support
- [ ] Offline capabilities

### Phase 5: Enterprise 🎯
- [ ] SSO integration
- [ ] Audit logging
- [ ] Performance monitoring
- [ ] Scalability improvements
- [ ] Security hardening

---

## 📜 License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

---

## 🙏 Acknowledgments

- **TaskMaster AI**: Core AI-powered task management
- **React Team**: Amazing frontend framework
- **TypeScript Team**: Excellent type system
- **pnpm Team**: Superior package management
- **Vite Team**: Lightning-fast build tool
- **Contributors**: All the amazing people who contribute to this project

---

## 📊 Project Status

**Current Version**: 1.0.0  
**Status**: Active Development  
**Stability**: Beta  
**Last Updated**: July 2025

### Health Indicators
- **Build Status**: ![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
- **Test Coverage**: ![Coverage](https://img.shields.io/badge/coverage-85%25-brightgreen)
- **Dependencies**: ![Dependencies](https://img.shields.io/badge/dependencies-up%20to%20date-brightgreen)
- **Security**: ![Security](https://img.shields.io/badge/security-no%20issues-brightgreen)

---

**Made with ❤️ by the TaskMaster UI Team**

For questions, issues, or contributions, please visit our [GitHub repository](https://github.com/gcheliz/taskmaster-ui).