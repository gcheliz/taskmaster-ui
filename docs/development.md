# Development Guide

## Prerequisites

- Node.js 20.x or higher
- pnpm 8.x or higher
- PostgreSQL 15.x (or Docker)
- Git

## Initial Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/your-org/taskmaster-ui.git
cd taskmaster-ui

# Install dependencies
pnpm install

# Copy environment files
cp .env.example .env
cp packages/backend/.env.example packages/backend/.env
cp packages/frontend/.env.example packages/frontend/.env
```

### 2. Database Setup

#### Using Docker (Recommended)
```bash
# Start PostgreSQL in Docker
docker-compose up -d postgres

# Run migrations
pnpm --filter=backend run db:migrate

# Seed database (optional)
pnpm --filter=backend run db:seed
```

#### Using Local PostgreSQL
```bash
# Create database
createdb taskmaster_dev

# Update DATABASE_URL in packages/backend/.env
# Run migrations
pnpm --filter=backend run db:migrate
```

### 3. Start Development Servers

```bash
# Start both frontend and backend
pnpm run dev

# Or start individually
pnpm --filter=frontend run dev  # Frontend: http://localhost:5173
pnpm --filter=backend run dev   # Backend: http://localhost:3001
```

## Development Workflow

### Code Structure

```
packages/
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Route pages
│   │   ├── hooks/         # Custom hooks
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API services
│   │   └── utils/         # Utilities
│   └── public/            # Static assets
│
└── backend/
    ├── src/
    │   ├── controllers/   # Route handlers
    │   ├── services/      # Business logic
    │   ├── middleware/    # Express middleware
    │   ├── models/        # Data models
    │   └── utils/         # Utilities
    └── prisma/            # Database schema
```

### Common Commands

```bash
# Frontend commands
pnpm --filter=frontend run dev        # Start dev server
pnpm --filter=frontend run build      # Build for production
pnpm --filter=frontend run test       # Run tests
pnpm --filter=frontend run lint       # Lint code
pnpm --filter=frontend run type-check # TypeScript check
pnpm --filter=frontend run storybook  # Start Storybook

# Backend commands
pnpm --filter=backend run dev         # Start dev server
pnpm --filter=backend run build       # Build for production
pnpm --filter=backend run test        # Run tests
pnpm --filter=backend run lint        # Lint code
pnpm --filter=backend run db:migrate  # Run migrations
pnpm --filter=backend run db:studio   # Open Prisma Studio

# Root commands
pnpm test                             # Run all tests
pnpm lint                             # Lint all code
pnpm format                           # Format code
pnpm type-check                       # Check TypeScript
```

## Coding Standards

### TypeScript Guidelines

```typescript
// Use explicit types for function parameters and returns
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0)
}

// Use interfaces for object shapes
interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

// Use enums for constants
enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST'
}

// Prefer const assertions for literals
const CONFIG = {
  API_URL: 'http://localhost:3001',
  TIMEOUT: 5000
} as const
```

### React Best Practices

```typescript
// Use functional components with TypeScript
interface ButtonProps {
  variant?: 'primary' | 'secondary'
  onClick?: () => void
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary',
  onClick,
  children 
}) => {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

// Use custom hooks for logic
export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchUser().then(setUser).finally(() => setLoading(false))
  }, [])
  
  return { user, loading }
}
```

### API Development

```typescript
// Use consistent error handling
export async function createTask(req: Request, res: Response) {
  try {
    const { title, description } = req.body
    
    // Validation
    if (!title) {
      return res.status(400).json({ 
        error: 'Title is required' 
      })
    }
    
    // Business logic
    const task = await taskService.create({
      title,
      description,
      userId: req.user.id
    })
    
    // Response
    res.status(201).json({ data: task })
  } catch (error) {
    logger.error('Error creating task', error)
    res.status(500).json({ 
      error: 'Internal server error' 
    })
  }
}
```

## Testing

### Frontend Testing

```typescript
// Component test example
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
  
  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Backend Testing

```typescript
// API test example
import request from 'supertest'
import { app } from '../app'

describe('POST /api/tasks', () => {
  it('creates a new task', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', 'Bearer token')
      .send({
        title: 'Test Task',
        description: 'Test Description'
      })
      
    expect(response.status).toBe(201)
    expect(response.body.data).toHaveProperty('id')
    expect(response.body.data.title).toBe('Test Task')
  })
})
```

## Environment Configuration

### Frontend Environment Variables

```bash
# .env file in packages/frontend/
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
VITE_ENABLE_MOCK_DATA=false
VITE_SENTRY_DSN=your-sentry-dsn
```

### Backend Environment Variables

```bash
# .env file in packages/backend/
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/taskmaster_dev

# Auth
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# External Services
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Redis
REDIS_URL=redis://localhost:6379

# Logging
LOG_LEVEL=debug
```

## Debugging

### Frontend Debugging

1. **React DevTools**: Install browser extension
2. **Redux DevTools**: For state debugging
3. **Network Tab**: Monitor API calls
4. **Console Logging**: Use structured logging

```typescript
// Debug component renders
useEffect(() => {
  console.log('[ComponentName] Rendered with props:', props)
})

// Debug API calls
try {
  console.log('[API] Fetching tasks...')
  const response = await api.getTasks()
  console.log('[API] Tasks fetched:', response)
} catch (error) {
  console.error('[API] Error fetching tasks:', error)
}
```

### Backend Debugging

1. **VS Code Debugger**: Launch configuration included
2. **Logger**: Use structured logging
3. **Prisma Studio**: Visual database browser

```typescript
// Use logger instead of console
import { logger } from '../utils/logger'

logger.info('Server started', { port: 3001 })
logger.error('Database error', { error, query })
logger.debug('Processing request', { userId, action })
```

## Git Workflow

### Branch Naming
- `feature/task-description`
- `bugfix/issue-description`
- `hotfix/critical-fix`
- `release/version-number`

### Commit Messages
```bash
# Format: type(scope): description

feat(tasks): add bulk task operations
fix(auth): resolve token refresh issue
docs(api): update endpoint documentation
test(frontend): add Button component tests
refactor(backend): optimize database queries
```

### Pull Request Process
1. Create feature branch
2. Make changes and commit
3. Push branch and open PR
4. Wait for CI checks
5. Request code review
6. Merge after approval

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port
lsof -i :5173  # Frontend
lsof -i :3001  # Backend

# Kill process
kill -9 <PID>
```

#### Database Connection Failed
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Restart PostgreSQL
docker-compose restart postgres

# Check connection string
echo $DATABASE_URL
```

#### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Clear build cache
rm -rf packages/*/dist packages/*/.next
```

#### TypeScript Errors
```bash
# Check for errors
pnpm type-check

# Generate types
pnpm --filter=backend run db:generate

# Restart TS server in VS Code
Cmd+Shift+P > "TypeScript: Restart TS Server"
```