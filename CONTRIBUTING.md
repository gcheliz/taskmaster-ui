# Contributing to TaskMaster UI

Thank you for your interest in contributing to TaskMaster UI! This guide will help you get started with contributing to our project.

## 🎯 Ways to Contribute

- **🐛 Bug Reports**: Found a bug? Report it!
- **✨ Feature Requests**: Have an idea? We'd love to hear it!
- **💻 Code Contributions**: Submit pull requests for bug fixes or new features
- **📚 Documentation**: Help improve our documentation
- **🧪 Testing**: Add tests or improve existing ones
- **🎨 Design**: Contribute to UI/UX improvements
- **💬 Community**: Help others in discussions and issues

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (LTS recommended)
- pnpm (preferred package manager)
- Git for version control
- Basic knowledge of TypeScript, React, and Node.js

### Development Setup

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   git clone https://github.com/YOUR_USERNAME/taskmaster-ui.git
   cd taskmaster-ui
   ```

2. **Install dependencies**
   ```bash
   npm install -g pnpm
   pnpm install
   ```

3. **Start development environment**
   ```bash
   pnpm run dev
   ```

4. **Verify setup**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001
   - Health check: http://localhost:3001/api/health

## 📝 Development Process

### 1. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-number-description
```

### 2. Make Your Changes
- Follow the existing code style
- Add tests for new functionality
- Update documentation if needed
- Keep commits focused and atomic

### 3. Test Your Changes
```bash
# Run all tests
pnpm run test

# Run specific tests
pnpm run test:backend
pnpm run test:frontend

# Run linting
pnpm run lint

# Run formatting
pnpm run format
```

### 4. Commit Your Changes
We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format: type(scope): description
git commit -m "feat(api): add PRD analysis endpoint"
git commit -m "fix(ui): resolve layout issue in task board"
git commit -m "docs(readme): update installation guide"
git commit -m "test(backend): add service tests"
```

**Commit Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### 5. Push and Create Pull Request
```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

## 🧪 Testing Guidelines

### Backend Testing
- **Location**: `packages/backend/src/**/*.test.ts`
- **Framework**: Jest
- **Coverage**: Aim for >80%

```bash
# Run backend tests
pnpm run test:backend

# Run with coverage
pnpm run test:backend -- --coverage

# Run specific test file
pnpm run test:backend -- src/services/api.test.ts
```

### Frontend Testing
- **Location**: `packages/frontend/src/**/*.test.tsx`
- **Framework**: Vitest + React Testing Library
- **Coverage**: Aim for >70%

```bash
# Run frontend tests
pnpm run test:frontend

# Run with coverage
pnpm run test:frontend -- --coverage

# Run in watch mode
pnpm run test:frontend -- --watch
```

### E2E Testing
- **Location**: `tests/e2e/`
- **Framework**: Playwright
- **Focus**: Critical user workflows

```bash
# Run E2E tests
pnpm run test:e2e

# Run with UI
pnpm run test:e2e:ui

# Run in debug mode
pnpm run test:e2e:debug
```

## 🎨 Code Style Guidelines

### TypeScript
- Use strict mode
- Define proper types for all functions and variables
- Avoid `any` type unless absolutely necessary
- Use interfaces for object types
- Use enums for constants

### React
- Use functional components with hooks
- Follow React best practices
- Use TypeScript for props and state
- Keep components focused and reusable
- Use proper error boundaries

### Backend
- Follow RESTful API conventions
- Use proper error handling
- Validate input data
- Use TypeScript for type safety
- Follow Express.js best practices

### General
- Use meaningful variable and function names
- Keep functions small and focused
- Add comments for complex logic
- Follow the existing code patterns
- Use ESLint and Prettier for consistency

## 📁 Project Structure

```
taskmaster-ui/
├── packages/
│   ├── backend/              # Node.js/Express API
│   │   ├── src/
│   │   │   ├── controllers/    # Route handlers
│   │   │   ├── services/       # Business logic
│   │   │   ├── middleware/     # Express middleware
│   │   │   ├── routes/         # API routes
│   │   │   ├── types/          # TypeScript types
│   │   │   └── utils/          # Utility functions
│   │   └── dist/              # Compiled output
│   │
│   └── frontend/             # React/TypeScript UI
│       ├── src/
│       │   ├── components/     # React components
│       │   ├── contexts/       # React contexts
│       │   ├── hooks/          # Custom hooks
│       │   ├── services/       # API clients
│       │   ├── types/          # TypeScript types
│       │   └── utils/          # Utility functions
│       └── dist/              # Build output
│
├── .taskmaster/              # TaskMaster configuration
├── docs/                     # Documentation
├── tests/                    # E2E tests
└── package.json             # Root configuration
```

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment Information**
   - Operating system
   - Node.js version
   - pnpm version
   - Browser (for frontend issues)

2. **Steps to Reproduce**
   ```markdown
   1. Go to '...'
   2. Click on '...'
   3. See error
   ```

3. **Expected Behavior**
   - What you expected to happen

4. **Actual Behavior**
   - What actually happened

5. **Screenshots/Logs**
   - Include relevant screenshots or error logs

6. **Additional Context**
   - Any other relevant information

## ✨ Feature Requests

When requesting features:

1. **Problem Description**
   - What problem does this solve?
   - Who would benefit from this feature?

2. **Proposed Solution**
   - Describe your proposed solution
   - How should it work?

3. **Alternatives Considered**
   - What other solutions did you consider?

4. **Additional Context**
   - Screenshots, mockups, or examples

## 📋 Pull Request Guidelines

### Before Submitting
- [ ] Tests pass (`pnpm run test`)
- [ ] Code is linted (`pnpm run lint`)
- [ ] Code is formatted (`pnpm run format`)
- [ ] Build succeeds (`pnpm run build`)
- [ ] Documentation updated (if needed)
- [ ] Commit messages follow conventions

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests pass
- [ ] Documentation updated
```

## 🔄 Review Process

1. **Automated Checks**
   - All tests must pass
   - Code must be properly formatted
   - Build must succeed

2. **Code Review**
   - At least one maintainer review required
   - Address feedback constructively
   - Update PR based on comments

3. **Merge**
   - Squash merge for features
   - Rebase merge for bug fixes
   - Update changelog if needed

## 🛡️ Security

### Security Requirements

All contributions must follow security best practices:

#### Code Security
- **No hardcoded secrets**: Use environment variables or secrets management
- **Input validation**: Validate all user inputs on both client and server
- **SQL injection prevention**: Use parameterized queries and ORM
- **XSS prevention**: Sanitize output and use CSP headers
- **Authentication**: Implement proper JWT token handling
- **Authorization**: Check permissions on every request

#### Development Security
```bash
# Security checks before submitting
pnpm audit --fix                    # Fix dependency vulnerabilities
pnpm run security:check              # Run security linting
pnpm run test:security               # Run security tests

# SSL/TLS development
./scripts/generate-ssl-certs.sh      # Generate development certificates
./scripts/setup-secrets.sh           # Setup development secrets
```

#### Security Testing
- **Unit tests**: Test security validations
- **Integration tests**: Test authentication flows
- **Security headers**: Verify CSP and security headers
- **SSL/TLS**: Test certificate configuration

#### Common Security Patterns
```typescript
// Input validation with Zod
const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// SQL injection prevention
const user = await prisma.user.findUnique({
  where: { email: validatedEmail },
});

// XSS prevention
const sanitizedInput = DOMPurify.sanitize(userInput);
```

### Security Vulnerability Disclosure

If you discover a security vulnerability:

1. **Do NOT** create a public issue
2. Email security concerns to: security@taskmaster-ui.com
3. Include detailed information about the vulnerability
4. Wait for a response before disclosing publicly
5. Follow responsible disclosure practices

## 📚 Documentation

### Code Documentation
- Use JSDoc for functions and classes
- Document complex algorithms
- Include examples for public APIs
- Keep documentation up to date

### README and Guides
- Update README.md for new features
- Add examples and usage instructions
- Keep installation guides current
- Update troubleshooting sections

## 🏆 Recognition

Contributors are recognized in:
- GitHub contributors page
- Release notes
- Project README
- Special thanks in documentation

## 🤝 Code of Conduct

We follow the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/):

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Collaborate effectively
- Maintain professionalism

## 📞 Getting Help

Need help contributing?

- **GitHub Discussions**: https://github.com/gcheliz/taskmaster-ui/discussions
- **Issues**: https://github.com/gcheliz/taskmaster-ui/issues
- **Documentation**: Check the `docs/` directory
- **Development Guide**: See [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)

## 🎉 First Time Contributors

New to open source? Here are some good first issues:

- Look for issues labeled `good first issue`
- Check issues labeled `help wanted`
- Improve documentation
- Add tests
- Fix typos

## 📊 Project Statistics

- **Languages**: TypeScript, JavaScript, CSS
- **Frontend**: React, Vite, React Testing Library
- **Backend**: Node.js, Express, Jest
- **Database**: SQLite (dev), PostgreSQL (prod)
- **Testing**: Jest, Vitest, Playwright
- **Package Manager**: pnpm

## 🔧 Development Tools

Recommended tools for development:

- **IDE**: VS Code with TypeScript extensions
- **Database**: SQLite Browser for development
- **API Testing**: Postman or Thunder Client
- **Git**: GitHub Desktop or command line
- **Terminal**: iTerm2 (macOS) or Windows Terminal

## 📈 Roadmap

Check our [project roadmap](./README.md#roadmap) to see:
- Current priorities
- Upcoming features
- Long-term goals
- Areas needing help

## 🙏 Thank You

Thank you for contributing to TaskMaster UI! Your contributions help make this project better for everyone.

---

**Happy Contributing! 🎉**

For questions about contributing, please open an issue or discussion on GitHub.