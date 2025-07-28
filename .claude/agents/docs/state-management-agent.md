# State Management Agent

## Overview

The State Management Agent generates comprehensive state management solutions for React applications, including TanStack Query hooks for API integration, React Context providers for global state, and WebSocket managers for real-time communication.

## Features

### 1. TanStack Query Hooks

Generate type-safe query and mutation hooks with:

- Automatic caching and invalidation
- Optimistic updates
- Error handling
- Loading states
- Background refetching
- Request deduplication

### 2. React Context Providers

Create global state management with:

- Reducer-based state updates
- Type-safe actions
- Optional persistence (localStorage/sessionStorage)
- Performance-optimized re-renders
- Custom hooks for easy access

### 3. WebSocket Management

Build real-time features with:

- Auto-reconnection with exponential backoff
- Event-based architecture
- Heartbeat for connection health
- React hooks integration
- Type-safe message handling

## Usage

### Generate a Query Hook (GET Request)

```typescript
await stateManagementAgent.generateQueryHook({
  name: 'Users',
  endpoint: '/api/users',
  method: 'GET',
  returnType: 'User[]',
  description: 'Fetch all users',
  caching: {
    staleTime: 60000, // 1 minute
    cacheTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  },
});
```

Generated hook usage:

```tsx
function UserList() {
  const { data: users, isLoading, error } = useUsers();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <ul>
      {users?.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### Generate a Mutation Hook (POST/PUT/DELETE)

```typescript
await stateManagementAgent.generateQueryHook({
  name: 'CreateUser',
  endpoint: '/api/users',
  method: 'POST',
  body: [
    { name: 'name', type: 'string', required: true },
    { name: 'email', type: 'string', required: true },
    { name: 'role', type: "'admin' | 'user'", required: false },
  ],
  returnType: 'User',
  optimisticUpdate: true,
  invalidates: ['Users'],
});
```

Generated hook usage:

```tsx
function CreateUserForm() {
  const createUser = useCreateUser();

  const handleSubmit = async (data: CreateUserInput) => {
    try {
      await createUser.mutateAsync(data);
      toast.success('User created successfully');
    } catch (error) {
      toast.error('Failed to create user');
    }
  };

  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>;
}
```

### Generate a Context Provider

```typescript
await stateManagementAgent.generateContextProvider({
  name: 'Auth',
  state: [
    { name: 'user', type: 'User | null', defaultValue: 'null' },
    { name: 'isAuthenticated', type: 'boolean', defaultValue: 'false' },
    { name: 'token', type: 'string | null', defaultValue: 'null' },
  ],
  actions: [
    'login: async (credentials: LoginCredentials) => Promise<void>',
    'logout: () => void',
  ],
  persistence: 'localStorage',
});
```

Generated context usage:

```tsx
// Wrap your app
function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}

// Use in components
function UserProfile() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) return <LoginForm />;

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Generate a WebSocket Manager

```typescript
await stateManagementAgent.generateWebSocketManager({
  name: 'Chat',
  url: 'ws://localhost:3001/chat',
  events: [
    { name: 'message', handler: '// Handle message' },
    { name: 'userJoined', handler: '// Handle join' },
    { name: 'typing', handler: '// Handle typing' },
  ],
  reconnection: {
    maxAttempts: 10,
    delay: 3000,
    backoff: true,
  },
  heartbeat: {
    interval: 30000,
    message: 'ping',
  },
});
```

Generated WebSocket usage:

```tsx
function ChatRoom() {
  const { isConnected, send } = useChatWebSocket();

  // Listen for messages
  useChatmessage(message => {
    console.log('New message:', message);
  });

  // Send a message
  const sendMessage = (text: string) => {
    send('message', { text, timestamp: Date.now() });
  };

  return (
    <div>
      <ConnectionStatus connected={isConnected} />
      {/* Chat UI */}
    </div>
  );
}
```

## Configuration Options

### CachingOptions

```typescript
interface CachingOptions {
  staleTime?: number; // Time before data is considered stale
  cacheTime?: number; // Time to keep data in cache
  refetchInterval?: number; // Auto-refetch interval
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
}
```

### ContextProviderOptions

```typescript
interface ContextProviderOptions {
  name: string;
  state: StateField[];
  actions?: string[];
  persistence?: 'localStorage' | 'sessionStorage' | null;
  description?: string;
}
```

### WebSocketOptions

```typescript
interface WebSocketOptions {
  name: string;
  url: string;
  events: WebSocketEvent[];
  reconnection?: {
    maxAttempts?: number;
    delay?: number;
    backoff?: boolean;
  };
  heartbeat?: {
    interval?: number;
    message?: string;
  };
}
```

## Performance Optimizations

### 1. Query Optimization

- **Stale-While-Revalidate**: Serve cached data while fetching fresh data
- **Query Deduplication**: Multiple components using same query share single request
- **Selective Invalidation**: Only invalidate affected queries after mutations
- **Background Refetching**: Keep data fresh without blocking UI

### 2. Context Optimization

- **Selective Updates**: Only re-render components using changed state
- **Memoized Actions**: Prevent unnecessary function recreations
- **Lazy Initial State**: Compute expensive initial state only once
- **Batch Updates**: Multiple state changes trigger single re-render

### 3. WebSocket Optimization

- **Connection Pooling**: Share single connection across components
- **Event Debouncing**: Prevent event flooding
- **Reconnection Backoff**: Avoid server overload during outages
- **Message Queuing**: Buffer messages during disconnection

## Best Practices

### 1. Query Keys

- Use consistent, hierarchical query keys
- Include all dependencies in query keys
- Use arrays for easy invalidation patterns

```typescript
// Good
['users'][('users', userId)][('users', { filters: { role: 'admin' } })];

// Bad
'users'`users-${userId}`;
```

### 2. Error Handling

- Always handle loading and error states
- Provide user-friendly error messages
- Implement retry logic for transient failures
- Log errors for debugging

### 3. Optimistic Updates

- Only use for non-critical updates
- Always handle rollback on failure
- Provide visual feedback during update
- Validate data before optimistic update

### 4. WebSocket Events

- Use typed event payloads
- Handle connection state in UI
- Implement message acknowledgments
- Queue critical messages during disconnection

## Command Examples

```bash
# Generate a paginated query hook
/query UserList --endpoint "/api/users" --params "page:number,limit:number" --cache "staleTime:60000"

# Generate auth context with persistence
/context Auth --state "user:User|null,token:string|null" --persist localStorage

# Generate real-time notifications
/websocket Notifications --url "ws://api.example.com/notifications" --events "alert,update"
```

## Integration with Backend

The generated hooks expect:

1. **API Client**: A configured axios/fetch instance at `@/services/apiClient`
2. **Type Definitions**: TypeScript types imported from `@/types`
3. **Error Format**: Consistent error response structure
4. **WebSocket Protocol**: JSON messages with `{ type, payload }` format

## Testing

Generated files include comprehensive tests:

1. **Query Hooks**: Mock API responses, test loading/error states
2. **Contexts**: Test state updates, persistence, and edge cases
3. **WebSockets**: Mock WebSocket API, test reconnection logic

## Troubleshooting

### Common Issues

1. **Query not refetching**
   - Check staleTime configuration
   - Verify query key dependencies
   - Ensure component is mounted

2. **Context not updating**
   - Verify provider wraps consumers
   - Check for accidental state mutations
   - Ensure actions dispatch correctly

3. **WebSocket not connecting**
   - Verify URL and protocol (ws/wss)
   - Check CORS configuration
   - Monitor browser console for errors

### Debug Mode

Enable query debugging:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: process.env.NODE_ENV === 'production' ? 3 : false,
    },
  },
  logger: {
    log: console.log,
    warn: console.warn,
    error: console.error,
  },
});
```
