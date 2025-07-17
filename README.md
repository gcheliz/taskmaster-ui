# TaskMaster UI

🚀 **A modern, web-based UI for TaskMaster AI project management** - combining the power of TaskMaster's AI-driven task breakdown with an intuitive, real-time interface for seamless development workflows.

![TaskMaster UI Banner](https://img.shields.io/badge/TaskMaster-UI-blue?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white)

## ⚡ Quick Start

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

## 📚 Documentation

- **[Development Guide](./docs/development.md)** - Setup, commands, and development workflow
- **[Architecture](./docs/architecture.md)** - System design and technical overview
- **[Project Status](./docs/project-status.md)** - Current progress and roadmap
- **[User Guide](./docs/user-guide/README.md)** - End-user documentation
- **[Contributing](./CONTRIBUTING.md)** - How to contribute to the project

## 🎯 Key Features

### ✅ Core Functionality
- **📊 Task Management** - Kanban-style boards with drag-and-drop
- **🌳 Repository Integration** - Git repository connection and management
- **🔄 Real-time Updates** - WebSocket integration for live synchronization
- **💻 Embedded Terminal** - xterm.js integration with repository scoping
- **📝 PRD Editor** - Rich text editing for Product Requirements Documents
- **🔍 AI Analysis** - TaskMaster CLI integration for task parsing

### 🎨 User Experience
- **🏗️ Modern Architecture** - React + TypeScript with monorepo structure
- **🌙 Theme Support** - Light/dark mode switching
- **📱 Responsive Design** - Works on desktop, tablet, and mobile
- **⚡ Performance** - Optimized with pnpm and modern tooling

## 🚀 Quick Commands

```bash
# Development
pnpm run dev              # Start both frontend and backend
pnpm run dev:backend      # Start backend only
pnpm run dev:frontend     # Start frontend only

# Building
pnpm run build            # Build both packages
pnpm run test             # Run all tests
pnpm run lint             # Lint all packages
pnpm run format           # Format all packages
```

## 🛠️ Tech Stack

**Frontend**: React 18 + TypeScript + Vite  
**Backend**: Node.js + Express + TypeScript  
**Database**: SQLite (dev) / PostgreSQL (prod)  
**Real-time**: WebSockets  
**Testing**: Jest + Vitest + Playwright  
**Package Manager**: pnpm

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](./CONTRIBUTING.md) for details on:

- Development setup and workflow
- Code style and quality standards  
- Pull request process
- Issue reporting

## 📊 Project Status

**Current Version**: 1.0.0  
**Status**: Production Ready  
**Build**: ✅ Passing  
**Tests**: ✅ 85%+ Coverage  
**Security**: ✅ No Known Issues

See [Project Status](./docs/project-status.md) for detailed progress and roadmap.

## 🆘 Need Help?

- **Issues**: [GitHub Issues](https://github.com/gcheliz/taskmaster-ui/issues)
- **Discussions**: [GitHub Discussions](https://github.com/gcheliz/taskmaster-ui/discussions)  
- **Documentation**: Check the `docs/` directory
- **Development Guide**: [docs/development.md](./docs/development.md)
- **Design System**: [docs/design-system.md](./docs/design-system.md) - Tailwind CSS implementation and design tokens

## 📜 License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

---

**Made with ❤️ by the TaskMaster UI Team**
<!-- TASKMASTER_EXPORT_START -->
> 🎯 **Taskmaster Export** - 2025-07-16 23:49:55 UTC
> 📋 Export: with subtasks • Status filter: none
> 🔗 Powered by [Task Master](https://task-master.dev?utm_source=github-readme&utm_medium=readme-export&utm_campaign=taskmaster-ui&utm_content=task-export-link)

| Project Dashboard |  |
| :-                |:-|
| Task Progress     | ████████████████░░░░ 80% |
| Done | 16 |
| In Progress | 1 |
| Pending | 3 |
| Deferred | 0 |
| Cancelled | 0 |
|-|-|
| Subtask Progress | █████████████████░░░ 83% |
| Completed | 83 |
| In Progress | 1 |
| Pending | 16 |


| ID | Title | Status | Priority | Dependencies | Complexity |
| :- | :-    | :-     | :-       | :-           | :-         |
| 1 | Project Foundation and Environment Setup | ✓&nbsp;done | high | None | ● 8 |
| 1.1 | Initialize Monorepo Workspace | ✓&nbsp;done | -            | None | N/A |
| 1.2 | Scaffold Backend Node.js/Express Application | ✓&nbsp;done | -            | 1 | N/A |
| 1.3 | Scaffold Frontend React/TypeScript Application | ✓&nbsp;done | -            | 1 | N/A |
| 1.4 | Configure Shared ESLint and Prettier Rules | ✓&nbsp;done | -            | 2, 3 | N/A |
| 1.5 | Configure Jest Testing Framework | ✓&nbsp;done | -            | 2, 3 | N/A |
| 2 | Backend API and Database Services | ✓&nbsp;done | high | 1 | ● 7 |
| 2.1 | Initialize Node.js/Express Server Structure | ✓&nbsp;done | -            | None | N/A |
| 2.2 | Implement API Health Check Endpoint | ✓&nbsp;done | -            | 1 | N/A |
| 2.3 | Integrate SQLite and Create Database Connection Service | ✓&nbsp;done | -            | 1 | N/A |
| 2.4 | Define and Apply Initial Database Schema | ✓&nbsp;done | -            | 3 | N/A |
| 2.5 | Set Up WebSocket Server | ✓&nbsp;done | -            | 1 | N/A |
| 3 | Core UI Layout and Component Shells | ✓&nbsp;done | high | 1 | ● 4 |
| 3.1 | Implement Main Application Layout Grid | ✓&nbsp;done | -            | None | N/A |
| 3.2 | Develop Static Header Component | ✓&nbsp;done | -            | 1 | N/A |
| 3.3 | Develop Static Sidebar Component | ✓&nbsp;done | -            | 1 | N/A |
| 3.4 | Develop Static Footer Component | ✓&nbsp;done | -            | 1 | N/A |
| 3.5 | Create Placeholder Feature Component Shells | ✓&nbsp;done | -            | 3 | N/A |
| 4 | Repository Connection and Management UI | ✓&nbsp;done | high | 2, 3 | ● 6 |
| 4.1 | Create Backend Endpoint for Repository Path Validation | ✓&nbsp;done | -            | None | N/A |
| 4.2 | Implement 'Add Repository' UI Component | ✓&nbsp;done | -            | None | N/A |
| 4.3 | Develop Frontend Logic for Repository Connection and State Management | ✓&nbsp;done | -            | 1, 2 | N/A |
| 4.4 | Create 'Connected Repositories' List View Component | ✓&nbsp;done | -            | 3 | N/A |
| 4.5 | Integrate Components and Implement User Feedback | ✓&nbsp;done | -            | 3, 4 | N/A |
| 5 | Repository and Branch Information Display | ✓&nbsp;done | high | 4 | ● 7 |
| 5.1 | Backend: Implement Git Data Retrieval Service | ✓&nbsp;done | -            | None | N/A |
| 5.2 | Backend: Create API Endpoint for Repository Details | ✓&nbsp;done | -            | 1 | N/A |
| 5.3 | Frontend: Build Repository Metadata UI Component | ✓&nbsp;done | -            | None | N/A |
| 5.4 | Frontend: Build Branch List UI Component | ✓&nbsp;done | -            | None | N/A |
| 5.5 | Frontend: Integrate UI with Backend API | ✓&nbsp;done | -            | 2, 3, 4 | N/A |
| 6 | Task-Master CLI Wrapper Service | ✓&nbsp;done | high | 2 | ● 8 |
| 6.1 | Core Command Execution Module | ✓&nbsp;done | -            | None | N/A |
| 6.2 | Task-Master CLI Service Abstraction | ✓&nbsp;done | -            | 1 | N/A |
| 6.3 | Backend API Endpoint for CLI Execution | ✓&nbsp;done | -            | 2 | N/A |
| 6.4 | Structured Output Parsing Logic | ✓&nbsp;done | -            | 2 | N/A |
| 6.5 | Implement Robust Error Handling and Logging | ✓&nbsp;done | -            | 3, 4 | N/A |
| 7 | Project Creation and Initialization Flow | ✓&nbsp;done | medium | 5, 6 | ● 5 |
| 7.1 | Design and Implement Project Creation UI | ✓&nbsp;done | -            | None | N/A |
| 7.2 | Develop Backend API Endpoint for Project Initialization | ✓&nbsp;done | -            | None | N/A |
| 7.3 | Implement Backend Logic to Execute 'task-master init' | ✓&nbsp;done | -            | 2 | N/A |
| 7.4 | Connect Frontend UI to Backend for Project Creation | ✓&nbsp;done | -            | 1, 2 | N/A |
| 7.5 | Create E2E Test for the Full Project Creation Flow | ✓&nbsp;done | -            | 3, 4 | N/A |
| 8 | Basic Task Board UI and Data Loading | ✓&nbsp;done | high | 7 | ● 6 |
| 8.1 | Define Task Data Model and Sample `tasks.json` | ✓&nbsp;done | -            | None | N/A |
| 8.2 | Develop Static Task Board and Column UI Components | ✓&nbsp;done | -            | None | N/A |
| 8.3 | Design and Implement the Task Card Component | ✓&nbsp;done | -            | 1 | N/A |
| 8.4 | Implement Data Service to Read `tasks.json` | ✓&nbsp;done | -            | 1 | N/A |
| 8.5 | Populate Board with Tasks from `tasks.json` | ✓&nbsp;done | -            | 2, 3, 4 | N/A |
| 9 | Real-time Synchronization via File Watcher | ✓&nbsp;done | high | 8 | ● 7 |
| 9.1 | Implement Backend File Watcher Service for tasks.json | ✓&nbsp;done | -            | None | N/A |
| 9.2 | Integrate File Watcher with WebSocket Server | ✓&nbsp;done | -            | 1 | N/A |
| 9.3 | Implement Frontend WebSocket Client and Message Listener | ✓&nbsp;done | -            | None | N/A |
| 9.4 | Update Frontend State to Refresh Task Board | ✓&nbsp;done | -            | 3 | N/A |
| 9.5 | Add Debouncing and Perform E2E Verification | ✓&nbsp;done | -            | 2, 4 | N/A |
| 10 | PRD Rich Text Editor | ✓&nbsp;done | medium | 3 | ● 5 |
| 10.1 | Research and Select Rich Text Editor Library | ✓&nbsp;done | -            | None | N/A |
| 10.2 | Integrate Selected Editor into a UI Component | ✓&nbsp;done | -            | 1 | N/A |
| 10.3 | Implement Core Formatting Toolbar and Features | ✓&nbsp;done | -            | 2 | N/A |
| 10.4 | Implement Auto-Save to Local Storage | ✓&nbsp;done | -            | 2 | N/A |
| 10.5 | Implement File System Save/Load via Backend API | ✓&nbsp;done | -            | 2 | N/A |
| 11 | PRD Parsing and Complexity Analysis Integration | ✓&nbsp;done | medium | 6, 10 | ● 6 |
| 11.1 | Create Backend API Endpoint for PRD Analysis | ✓&nbsp;done | -            | None | N/A |
| 11.2 | Integrate Command-Line Tools into Backend Service | ✓&nbsp;done | -            | 1 | N/A |
| 11.3 | Implement Frontend Trigger in PRD Editor | ✓&nbsp;done | -            | 1 | N/A |
| 11.4 | Develop UI Component for Analysis Results | ✓&nbsp;done | -            | None | N/A |
| 11.5 | Integrate Backend Data with Frontend Results UI | ✓&nbsp;done | -            | 3, 4 | N/A |
| 12 | Interactive Task Board (Drag-and-Drop) | ✓&nbsp;done | medium | 9 | ● 7 |
| 12.1 | Integrate Drag-and-Drop Library | ✓&nbsp;done | -            | None | N/A |
| 12.2 | Implement Draggable Task Items | ✓&nbsp;done | -            | 1 | N/A |
| 12.3 | Implement Droppable Status Columns | ✓&nbsp;done | -            | 1 | N/A |
| 12.4 | Handle Frontend Drop Logic and UI State Update | ✓&nbsp;done | -            | 2, 3 | N/A |
| 12.5 | Persist Task Status Change via Backend API | ✓&nbsp;done | -            | 4 | N/A |
| 13 | Task Creation, Editing, and Details Modal | ✓&nbsp;done | medium | 12 | ● 6 |
| 13.1 | Build Task Modal UI Shell | ✓&nbsp;done | -            | None | N/A |
| 13.2 | Implement 'Create New Task' Functionality | ✓&nbsp;done | -            | 1 | N/A |
| 13.3 | Implement 'View and Edit Existing Task' Functionality | ✓&nbsp;done | -            | 1 | N/A |
| 13.4 | Implement 'Delete Task' Functionality | ✓&nbsp;done | -            | 3 | N/A |
| 13.5 | Implement Task Dependency Management in Modal | ✓&nbsp;done | -            | 3 | N/A |
| 14 | Embedded Terminal Integration | ✓&nbsp;done | medium | 3 | ● 8 |
| 14.1 | Backend: Implement Pseudo-Terminal (pty) Service | ✓&nbsp;done | -            | None | N/A |
| 14.2 | Frontend: Integrate and Render Xterm.js Component | ✓&nbsp;done | -            | None | N/A |
| 14.3 | Establish Frontend-Backend WebSocket Communication | ✓&nbsp;done | -            | 1, 2 | N/A |
| 14.4 | Scope Terminal Session to Selected Repository Directory | ✓&nbsp;done | -            | 3 | N/A |
| 14.5 | Implement Terminal Session Persistence | ✓&nbsp;done | -            | 4 | N/A |
| 15 | One-Click Command Execution from UI | ○&nbsp;pending | low | 5, 14 | ● 4 |
| 15.1 | Create Backend API Endpoint for Command Execution | ○&nbsp;pending | -            | None | N/A |
| 15.2 | Implement UI Components for Command Actions | ○&nbsp;pending | -            | None | N/A |
| 15.3 | Integrate UI Actions with Backend API | ○&nbsp;pending | -            | 1, 2 | N/A |
| 15.4 | Stream and Display Command Output in Embedded Terminal | ○&nbsp;pending | -            | 1, 3 | N/A |
| 15.5 | Implement Context-Aware Command Availability | ○&nbsp;pending | -            | 2 | N/A |
| 16 | Project Dashboard and Reporting View | ✓&nbsp;done | low | 13 | ● 7 |
| 16.1 | Backend API Endpoint for Dashboard Data Aggregation | ✓&nbsp;done | -            | None | N/A |
| 16.2 | Dashboard View Shell and Data Fetching Logic | ✓&nbsp;done | -            | 1 | N/A |
| 16.3 | Implement Task Completion Chart Widget | ✓&nbsp;done | -            | 2 | N/A |
| 16.4 | Implement Progress Visualization Widget | ✓&nbsp;done | -            | 2 | N/A |
| 16.5 | Implement Recent Activity Feed Widget | ✓&nbsp;done | -            | 2 | N/A |
| 17 | Task Filtering and Sorting | ✓&nbsp;done | low | 13 | ● 4 |
| 17.1 | Design and Implement Filter/Sort UI Controls | ✓&nbsp;done | -            | None | N/A |
| 17.2 | Develop Backend API for Task Filtering and Sorting | ✓&nbsp;done | -            | None | N/A |
| 17.3 | Implement Frontend State Management for Filter/Sort Options | ✓&nbsp;done | -            | 1 | N/A |
| 17.4 | Integrate Frontend Controls with Backend API | ✓&nbsp;done | -            | 2, 3 | N/A |
| 17.5 | Apply Filtering and Sorting to the Task Board View | ✓&nbsp;done | -            | 4 | N/A |
| 18 | UI/UX Polish, Theming, and Accessibility | ►&nbsp;in-progress | low | 16 | ● 8 |
| 18.1 | Establish Design Tokens and Standardize UI Components | ✓&nbsp;done | -            | None | N/A |
| 18.2 | Implement Light & Dark Theme Functionality | ✓&nbsp;done | -            | 1 | N/A |
| 18.3 | Application-Wide UI/UX Consistency Review | ✓&nbsp;done | -            | 1 | N/A |
| 18.4 | Ensure Full Keyboard Navigability and Color Contrast Compliance | ►&nbsp;in-progress | -            | 2, 3 | N/A |
| 18.5 | Implement Semantic HTML and ARIA for Screen Reader Support | ○&nbsp;pending | -            | 4 | N/A |
| 19 | Security Hardening and Input Validation | ○&nbsp;pending | high | 18 | ● 9 |
| 19.1 | Implement Input Validation and Sanitization Middleware | ○&nbsp;pending | -            | None | N/A |
| 19.2 | Secure Application and Server Configuration | ○&nbsp;pending | -            | None | N/A |
| 19.3 | Sandbox File System and Git Command Execution | ○&nbsp;pending | -            | 1 | N/A |
| 19.4 | Establish Secure Storage for Secrets and Configuration | ○&nbsp;pending | -            | None | N/A |
| 19.5 | Perform Dependency Vulnerability Scan and Remediation | ○&nbsp;pending | -            | 1, 2, 3, 4 | N/A |
| 20 | End-to-End Testing and Documentation | ○&nbsp;pending | medium | 19 | ● 7 |
| 20.1 | Setup Cypress and Documentation Environment | ○&nbsp;pending | -            | None | N/A |
| 20.2 | E2E Test for Repository Management Workflow | ○&nbsp;pending | -            | 1 | N/A |
| 20.3 | E2E Test for Task and Dashboard Workflows | ○&nbsp;pending | -            | 1 | N/A |
| 20.4 | Draft Core Feature User Documentation | ○&nbsp;pending | -            | 1 | N/A |
| 20.5 | Create New User Onboarding Tutorial | ○&nbsp;pending | -            | 4 | N/A |

> 📋 **End of Taskmaster Export** - Tasks are synced from your project using the `sync-readme` command.
<!-- TASKMASTER_EXPORT_END -->
