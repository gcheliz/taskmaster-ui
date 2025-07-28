import { StateManagementAgent } from '../frontend-agents/state-management-agent';
import * as fs from 'fs/promises';
import * as path from 'path';

// Mock the template engine
jest.mock('../template-engine', () => ({
  templateEngine: {
    saveGeneratedFile: jest.fn(async (content: string, filePath: string) => {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, content);
    }),
  },
}));

describe('StateManagementAgent', () => {
  const testDir = '/tmp/state-agent-test';
  let agent: StateManagementAgent;

  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
    agent = new StateManagementAgent(testDir);
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe('generateQueryHook', () => {
    it('should generate a query hook for GET requests', async () => {
      const result = await agent.generateQueryHook({
        name: 'Users',
        endpoint: '/api/users',
        method: 'GET',
        returnType: 'User[]',
        caching: {
          staleTime: 60000,
          refetchOnWindowFocus: false,
        },
      });

      expect(result.files).toHaveLength(2);
      
      const hookFile = result.files.find(f => f.endsWith('useUsers.ts'));
      const content = await fs.readFile(hookFile!, 'utf-8');
      
      expect(content).toContain('import { useQuery } from \'@tanstack/react-query\'');
      expect(content).toContain('queryKey: [\'Users\']');
      expect(content).toContain('staleTime: 60000');
      expect(content).toContain('refetchOnWindowFocus: false');
    });

    it('should generate a mutation hook for POST requests', async () => {
      const result = await agent.generateQueryHook({
        name: 'CreateUser',
        endpoint: '/api/users',
        method: 'POST',
        body: [
          { name: 'name', type: 'string', required: true },
          { name: 'email', type: 'string', required: true },
        ],
        optimisticUpdate: true,
        invalidates: ['Users'],
      });

      const hookFile = result.files.find(f => f.endsWith('useCreateUser.ts'));
      const content = await fs.readFile(hookFile!, 'utf-8');
      
      expect(content).toContain('import { useMutation, useQueryClient }');
      expect(content).toContain('interface CreateUserInput');
      expect(content).toContain('onMutate: async (newData)');
      expect(content).toContain('queryClient.invalidateQueries({ queryKey: [\'Users\'] })');
    });

    it('should generate query with parameters', async () => {
      const result = await agent.generateQueryHook({
        name: 'UserById',
        endpoint: '/api/users/:id',
        method: 'GET',
        params: [
          { name: 'id', type: 'string', required: true },
        ],
        returnType: 'User',
      });

      const hookFile = result.files.find(f => f.endsWith('useUserById.ts'));
      const content = await fs.readFile(hookFile!, 'utf-8');
      
      expect(content).toContain('interface UserByIdParams');
      expect(content).toContain('params: UserByIdParams');
      expect(content).toContain('queryKey: [\'UserById\', params]');
    });
  });

  describe('generateContextProvider', () => {
    it('should generate a context provider with state management', async () => {
      const result = await agent.generateContextProvider({
        name: 'Auth',
        state: [
          { name: 'user', type: 'User | null', defaultValue: 'null' },
          { name: 'isAuthenticated', type: 'boolean', defaultValue: 'false' },
          { name: 'token', type: 'string | null', defaultValue: 'null' },
        ],
        persistence: 'localStorage',
      });

      expect(result.files).toHaveLength(3); // Context, hook, and test
      
      const contextFile = result.files.find(f => f.endsWith('AuthContext.tsx'));
      const content = await fs.readFile(contextFile!, 'utf-8');
      
      expect(content).toContain('interface AuthState');
      expect(content).toContain('createContext<AuthContextType');
      expect(content).toContain('localStorage.getItem(\'Auth\')');
      expect(content).toContain('localStorage.setItem(\'Auth\'');
      expect(content).toContain('setUser: (value: User | null)');
      expect(content).toContain('setIsAuthenticated: (value: boolean)');
    });

    it('should generate context hook', async () => {
      const result = await agent.generateContextProvider({
        name: 'Theme',
        state: [
          { name: 'mode', type: "'light' | 'dark'", defaultValue: "'light'" },
          { name: 'primaryColor', type: 'string', defaultValue: "'blue'" },
        ],
      });

      const hookFile = result.files.find(f => f.endsWith('useTheme.ts'));
      const content = await fs.readFile(hookFile!, 'utf-8');
      
      expect(content).toContain('import { ThemeContext }');
      expect(content).toContain('useContext(ThemeContext)');
      expect(content).toContain('throw new Error(\'useTheme must be used within ThemeProvider\')');
    });
  });

  describe('generateWebSocketManager', () => {
    it('should generate WebSocket service with reconnection', async () => {
      const result = await agent.generateWebSocketManager({
        name: 'Chat',
        url: 'ws://localhost:3001/chat',
        events: [
          { name: 'message', handler: '// Handle message', description: 'New chat message' },
          { name: 'userJoined', handler: '// Handle user joined', description: 'User joined chat' },
          { name: 'userLeft', handler: '// Handle user left', description: 'User left chat' },
        ],
        reconnection: {
          maxAttempts: 5,
          delay: 5000,
          backoff: true,
        },
        heartbeat: {
          interval: 30000,
          message: 'ping',
        },
      });

      expect(result.files).toHaveLength(3); // Service, hook, and test
      
      const serviceFile = result.files.find(f => f.endsWith('ChatWebSocket.ts'));
      const content = await fs.readFile(serviceFile!, 'utf-8');
      
      expect(content).toContain('class ChatWebSocket extends EventEmitter');
      expect(content).toContain('ws://localhost:3001/chat');
      expect(content).toContain('case \'message\':');
      expect(content).toContain('case \'userJoined\':');
      expect(content).toContain('Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)');
      expect(content).toContain('setInterval(() => {');
      expect(content).toContain('this.send(\'ping\')');
    });

    it('should generate WebSocket hook with event handlers', async () => {
      const result = await agent.generateWebSocketManager({
        name: 'Notifications',
        url: 'ws://localhost:3001/notifications',
        events: [
          { name: 'notification', handler: '// Handle notification' },
          { name: 'alert', handler: '// Handle alert' },
        ],
      });

      const hookFile = result.files.find(f => f.endsWith('useNotificationsWebSocket.ts'));
      const content = await fs.readFile(hookFile!, 'utf-8');
      
      expect(content).toContain('interface UseNotificationsWebSocketReturn');
      expect(content).toContain('notificationsWebSocket.connect()');
      expect(content).toContain('export function useNotificationsnotification');
      expect(content).toContain('export function useNotificationsalert');
    });
  });

  describe('Performance optimizations', () => {
    it('should include query invalidation strategies', async () => {
      const result = await agent.generateQueryHook({
        name: 'Dashboard',
        endpoint: '/api/dashboard',
        method: 'GET',
        caching: {
          staleTime: 300000, // 5 minutes
          cacheTime: 600000, // 10 minutes
          refetchInterval: 60000, // 1 minute
        },
      });

      const content = await fs.readFile(result.files[0], 'utf-8');
      
      expect(content).toContain('staleTime: 300000');
      expect(content).toContain('cacheTime: 600000');
      expect(content).toContain('refetchInterval: 60000');
    });

    it('should generate optimistic updates for mutations', async () => {
      const result = await agent.generateQueryHook({
        name: 'UpdateTask',
        endpoint: '/api/tasks/:id',
        method: 'PUT',
        params: [{ name: 'id', type: 'string', required: true }],
        body: [{ name: 'status', type: 'string', required: true }],
        optimisticUpdate: true,
        invalidates: ['Tasks', 'TaskById'],
      });

      const content = await fs.readFile(result.files[0], 'utf-8');
      
      expect(content).toContain('onMutate: async (newData)');
      expect(content).toContain('cancelQueries');
      expect(content).toContain('getQueryData');
      expect(content).toContain('setQueryData');
      expect(content).toContain('onError: (err, newData, context)');
      expect(content).toContain('onSettled');
    });
  });
});