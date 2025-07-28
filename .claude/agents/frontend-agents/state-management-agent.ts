/**
 * State Management Agent
 * 
 * Generates TanStack Query hooks, React Context providers,
 * and WebSocket connection management
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { templateEngine } from '../template-engine';

export interface QueryHookOptions {
  name: string;
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  params?: QueryParam[];
  body?: QueryParam[];
  returnType?: string;
  caching?: CachingOptions;
  optimisticUpdate?: boolean;
  invalidates?: string[];
  description?: string;
}

export interface QueryParam {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
}

export interface CachingOptions {
  staleTime?: number;
  cacheTime?: number;
  refetchInterval?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
}

export interface ContextProviderOptions {
  name: string;
  state: StateField[];
  actions?: string[];
  persistence?: 'localStorage' | 'sessionStorage' | null;
  description?: string;
}

export interface StateField {
  name: string;
  type: string;
  defaultValue?: string;
  description?: string;
}

export interface WebSocketOptions {
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

export interface WebSocketEvent {
  name: string;
  handler: string;
  description?: string;
}

export class StateManagementAgent {
  private hooksPath: string;
  private contextsPath: string;
  private servicesPath: string;

  constructor(projectRoot: string) {
    this.hooksPath = path.join(projectRoot, 'packages/frontend/src/hooks');
    this.contextsPath = path.join(projectRoot, 'packages/frontend/src/contexts');
    this.servicesPath = path.join(projectRoot, 'packages/frontend/src/services');
  }

  /**
   * Generate a TanStack Query hook
   */
  async generateQueryHook(options: QueryHookOptions): Promise<{
    files: string[];
    documentation: string;
  }> {
    const files: string[] = [];
    
    // Ensure hooks directory exists
    await fs.mkdir(this.hooksPath, { recursive: true });

    // Generate query hook file
    const hookPath = path.join(this.hooksPath, `use${options.name}.ts`);
    const hookContent = await this.generateQueryHookContent(options);
    await templateEngine.saveGeneratedFile(hookContent, hookPath);
    files.push(hookPath);

    // Generate test file
    const testPath = path.join(this.hooksPath, `use${options.name}.test.ts`);
    const testContent = await this.generateQueryHookTest(options);
    await templateEngine.saveGeneratedFile(testContent, testPath);
    files.push(testPath);

    const documentation = this.generateQueryHookDocumentation(options);

    return { files, documentation };
  }

  /**
   * Generate a React Context provider
   */
  async generateContextProvider(options: ContextProviderOptions): Promise<{
    files: string[];
    documentation: string;
  }> {
    const files: string[] = [];
    
    // Ensure contexts directory exists
    await fs.mkdir(this.contextsPath, { recursive: true });

    // Generate context file
    const contextPath = path.join(this.contextsPath, `${options.name}Context.tsx`);
    const contextContent = await this.generateContextContent(options);
    await templateEngine.saveGeneratedFile(contextContent, contextPath);
    files.push(contextPath);

    // Generate context hook
    const hookPath = path.join(this.hooksPath, `use${options.name}.ts`);
    const hookContent = this.generateContextHook(options);
    await templateEngine.saveGeneratedFile(hookContent, hookPath);
    files.push(hookPath);

    // Generate test file
    const testPath = path.join(this.contextsPath, `${options.name}Context.test.tsx`);
    const testContent = await this.generateContextTest(options);
    await templateEngine.saveGeneratedFile(testContent, testPath);
    files.push(testPath);

    const documentation = this.generateContextDocumentation(options);

    return { files, documentation };
  }

  /**
   * Generate WebSocket connection manager
   */
  async generateWebSocketManager(options: WebSocketOptions): Promise<{
    files: string[];
    documentation: string;
  }> {
    const files: string[] = [];
    
    // Ensure services directory exists
    await fs.mkdir(this.servicesPath, { recursive: true });

    // Generate WebSocket service
    const servicePath = path.join(this.servicesPath, `${options.name}WebSocket.ts`);
    const serviceContent = await this.generateWebSocketService(options);
    await templateEngine.saveGeneratedFile(serviceContent, servicePath);
    files.push(servicePath);

    // Generate WebSocket hook
    const hookPath = path.join(this.hooksPath, `use${options.name}WebSocket.ts`);
    const hookContent = await this.generateWebSocketHook(options);
    await templateEngine.saveGeneratedFile(hookContent, hookPath);
    files.push(hookPath);

    // Generate test file
    const testPath = path.join(this.servicesPath, `${options.name}WebSocket.test.ts`);
    const testContent = await this.generateWebSocketTest(options);
    await templateEngine.saveGeneratedFile(testContent, testPath);
    files.push(testPath);

    const documentation = this.generateWebSocketDocumentation(options);

    return { files, documentation };
  }

  /**
   * Generate TanStack Query hook content
   */
  private async generateQueryHookContent(options: QueryHookOptions): Promise<string> {
    const isQuery = options.method === 'GET' || !options.method;
    const hookType = isQuery ? 'useQuery' : 'useMutation';
    const importType = isQuery ? 'useQuery' : 'useMutation, useQueryClient';

    return `import { ${importType} } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';
${options.returnType ? `import type { ${options.returnType} } from '@/types';` : ''}

${this.generateTypeDefinitions(options)}

/**
 * ${options.description || `${options.name} query hook`}
 */
export function use${options.name}(${this.generateHookParams(options)}) {
  ${!isQuery ? 'const queryClient = useQueryClient();' : ''}
  
  return ${hookType}${this.generateQueryConfig(options)};
}

${this.generateInvalidationHelpers(options)}
`;
  }

  /**
   * Generate type definitions for query hook
   */
  private generateTypeDefinitions(options: QueryHookOptions): string {
    const types: string[] = [];

    // Params type
    if (options.params?.length) {
      types.push(`export interface ${options.name}Params {
${options.params.map(p => `  ${p.name}${p.required ? '' : '?'}: ${p.type};${p.description ? ` // ${p.description}` : ''}`).join('\n')}
}`);
    }

    // Body type for mutations
    if (options.body?.length) {
      types.push(`export interface ${options.name}Input {
${options.body.map(p => `  ${p.name}${p.required ? '' : '?'}: ${p.type};${p.description ? ` // ${p.description}` : ''}`).join('\n')}
}`);
    }

    // Response type if not provided
    if (!options.returnType) {
      types.push(`export interface ${options.name}Response {
  data: any;
  message?: string;
}`);
    }

    return types.join('\n\n');
  }

  /**
   * Generate hook parameters
   */
  private generateHookParams(options: QueryHookOptions): string {
    const params: string[] = [];
    
    if (options.params?.length) {
      params.push(`params: ${options.name}Params`);
    }
    
    if (options.method === 'GET' || !options.method) {
      params.push('options?: QueryOptions');
    }

    return params.join(', ');
  }

  /**
   * Generate query configuration
   */
  private generateQueryConfig(options: QueryHookOptions): string {
    const isQuery = options.method === 'GET' || !options.method;

    if (isQuery) {
      return `({
    queryKey: ['${options.name}'${options.params?.length ? ', params' : ''}],
    queryFn: async () => {
      const response = await apiClient.${options.method?.toLowerCase() || 'get'}('${options.endpoint}'${options.params?.length ? ', { params }' : ''});
      return response.data;
    },
    ${this.generateCachingConfig(options.caching)}
    ...options,
  })`;
    } else {
      // Mutation
      return `({
    mutationFn: async (${options.body?.length ? `data: ${options.name}Input` : ''}) => {
      const response = await apiClient.${options.method?.toLowerCase()}('${options.endpoint}'${options.body?.length ? ', data' : ''});
      return response.data;
    },
    ${options.optimisticUpdate ? this.generateOptimisticUpdate(options) : ''}
    onSuccess: () => {
      ${options.invalidates?.map(key => `queryClient.invalidateQueries({ queryKey: ['${key}'] });`).join('\n      ') || ''}
    },
  })`;
    }
  }

  /**
   * Generate caching configuration
   */
  private generateCachingConfig(caching?: CachingOptions): string {
    if (!caching) return '';

    const configs: string[] = [];
    
    if (caching.staleTime) configs.push(`staleTime: ${caching.staleTime},`);
    if (caching.cacheTime) configs.push(`cacheTime: ${caching.cacheTime},`);
    if (caching.refetchInterval) configs.push(`refetchInterval: ${caching.refetchInterval},`);
    if (caching.refetchOnWindowFocus !== undefined) configs.push(`refetchOnWindowFocus: ${caching.refetchOnWindowFocus},`);
    if (caching.refetchOnMount !== undefined) configs.push(`refetchOnMount: ${caching.refetchOnMount},`);

    return configs.join('\n    ');
  }

  /**
   * Generate optimistic update logic
   */
  private generateOptimisticUpdate(options: QueryHookOptions): string {
    return `onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['${options.name}'] });
      const previousData = queryClient.getQueryData(['${options.name}']);
      
      queryClient.setQueryData(['${options.name}'], (old: any) => {
        // Optimistic update logic here
        return { ...old, ...newData };
      });
      
      return { previousData };
    },
    onError: (err, newData, context) => {
      queryClient.setQueryData(['${options.name}'], context?.previousData);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['${options.name}'] });
    },`;
  }

  /**
   * Generate invalidation helper functions
   */
  private generateInvalidationHelpers(options: QueryHookOptions): string {
    if (options.method === 'GET' || !options.method) {
      return `/**
 * Invalidate ${options.name} query
 */
export function invalidate${options.name}() {
  const queryClient = useQueryClient();
  return queryClient.invalidateQueries({ queryKey: ['${options.name}'] });
}`;
    }
    return '';
  }

  /**
   * Generate React Context content
   */
  private async generateContextContent(options: ContextProviderOptions): Promise<string> {
    return `import React, { createContext, useReducer, useEffect, ReactNode } from 'react';

${this.generateContextTypes(options)}

const ${options.name}Context = createContext<${options.name}ContextType | undefined>(undefined);

const initialState: ${options.name}State = {
${options.state.map(field => `  ${field.name}: ${field.defaultValue || 'null'},`).join('\n')}
};

function ${options.name.toLowerCase()}Reducer(state: ${options.name}State, action: ${options.name}Action): ${options.name}State {
  switch (action.type) {
${options.state.map(field => `    case 'SET_${field.name.toUpperCase()}':
      return { ...state, ${field.name}: action.payload };`).join('\n')}
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function ${options.name}Provider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(${options.name.toLowerCase()}Reducer, initialState${
    options.persistence ? `, () => {
    const stored = ${options.persistence}.getItem('${options.name}');
    return stored ? JSON.parse(stored) : initialState;
  }` : ''
  });

  ${options.persistence ? `useEffect(() => {
    ${options.persistence}.setItem('${options.name}', JSON.stringify(state));
  }, [state]);` : ''}

  const actions = {
${options.state.map(field => `    set${field.name.charAt(0).toUpperCase() + field.name.slice(1)}: (value: ${field.type}) => dispatch({ type: 'SET_${field.name.toUpperCase()}', payload: value }),`).join('\n')}
    reset: () => dispatch({ type: 'RESET' }),
    ${options.actions?.join(',\n    ') || ''}
  };

  const value = {
    ...state,
    ...actions,
  };

  return (
    <${options.name}Context.Provider value={value}>
      {children}
    </${options.name}Context.Provider>
  );
}

export { ${options.name}Context };
`;
  }

  /**
   * Generate context types
   */
  private generateContextTypes(options: ContextProviderOptions): string {
    return `interface ${options.name}State {
${options.state.map(field => `  ${field.name}: ${field.type};`).join('\n')}
}

type ${options.name}Action = 
${options.state.map(field => `  | { type: 'SET_${field.name.toUpperCase()}'; payload: ${field.type} }`).join('\n')}
  | { type: 'RESET' };

interface ${options.name}ContextType extends ${options.name}State {
${options.state.map(field => `  set${field.name.charAt(0).toUpperCase() + field.name.slice(1)}: (value: ${field.type}) => void;`).join('\n')}
  reset: () => void;
  ${options.actions?.map(action => `${action};`).join('\n  ') || ''}
}`;
  }

  /**
   * Generate context hook
   */
  private generateContextHook(options: ContextProviderOptions): string {
    return `import { useContext } from 'react';
import { ${options.name}Context } from '@/contexts/${options.name}Context';

export function use${options.name}() {
  const context = useContext(${options.name}Context);
  
  if (!context) {
    throw new Error('use${options.name} must be used within ${options.name}Provider');
  }
  
  return context;
}
`;
  }

  /**
   * Generate WebSocket service
   */
  private async generateWebSocketService(options: WebSocketOptions): Promise<string> {
    return `import { EventEmitter } from 'events';

export class ${options.name}WebSocket extends EventEmitter {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private reconnectTimer?: NodeJS.Timeout;
  private heartbeatTimer?: NodeJS.Timeout;
  private isConnecting = false;

  constructor(url: string = '${options.url}') {
    super();
    this.url = url;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.emit('connected');
      ${options.heartbeat ? this.generateHeartbeat(options.heartbeat) : ''}
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      this.isConnecting = false;
      this.emit('error', error);
    };

    this.ws.onclose = () => {
      this.isConnecting = false;
      this.emit('disconnected');
      this.clearHeartbeat();
      ${options.reconnection ? this.generateReconnection(options.reconnection) : ''}
    };
  }

  private handleMessage(data: any): void {
    const { type, payload } = data;
    
    switch (type) {
${options.events.map(event => `      case '${event.name}':
        ${event.handler}
        this.emit('${event.name}', payload);
        break;`).join('\n')}
      default:
        this.emit('message', data);
    }
  }

  send(type: string, payload?: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  disconnect(): void {
    this.clearReconnect();
    this.clearHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private clearReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
  }

  private clearHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }
  }
}

export const ${options.name.toLowerCase()}WebSocket = new ${options.name}WebSocket();
`;
  }

  /**
   * Generate heartbeat logic
   */
  private generateHeartbeat(heartbeat: { interval?: number; message?: string }): string {
    return `
      this.heartbeatTimer = setInterval(() => {
        this.send('${heartbeat.message || 'ping'}');
      }, ${heartbeat.interval || 30000});`;
  }

  /**
   * Generate reconnection logic
   */
  private generateReconnection(reconnection: { maxAttempts?: number; delay?: number; backoff?: boolean }): string {
    return `
      if (this.reconnectAttempts < ${reconnection.maxAttempts || 5}) {
        const delay = ${reconnection.backoff 
          ? `Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)` 
          : (reconnection.delay || 5000)};
        
        this.reconnectTimer = setTimeout(() => {
          this.reconnectAttempts++;
          this.connect();
        }, delay);
      }`;
  }

  /**
   * Generate WebSocket hook
   */
  private async generateWebSocketHook(options: WebSocketOptions): Promise<string> {
    return `import { useEffect, useCallback, useState } from 'react';
import { ${options.name.toLowerCase()}WebSocket } from '@/services/${options.name}WebSocket';

interface Use${options.name}WebSocketReturn {
  isConnected: boolean;
  send: (type: string, payload?: any) => void;
  connect: () => void;
  disconnect: () => void;
}

export function use${options.name}WebSocket(): Use${options.name}WebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    ${options.name.toLowerCase()}WebSocket.on('connected', handleConnect);
    ${options.name.toLowerCase()}WebSocket.on('disconnected', handleDisconnect);

    // Auto-connect on mount
    ${options.name.toLowerCase()}WebSocket.connect();

    return () => {
      ${options.name.toLowerCase()}WebSocket.off('connected', handleConnect);
      ${options.name.toLowerCase()}WebSocket.off('disconnected', handleDisconnect);
    };
  }, []);

  const send = useCallback((type: string, payload?: any) => {
    ${options.name.toLowerCase()}WebSocket.send(type, payload);
  }, []);

  const connect = useCallback(() => {
    ${options.name.toLowerCase()}WebSocket.connect();
  }, []);

  const disconnect = useCallback(() => {
    ${options.name.toLowerCase()}WebSocket.disconnect();
  }, []);

  return {
    isConnected,
    send,
    connect,
    disconnect,
  };
}

// Event-specific hooks
${options.events.map(event => `export function use${options.name}${event.name}(handler: (payload: any) => void) {
  useEffect(() => {
    ${options.name.toLowerCase()}WebSocket.on('${event.name}', handler);
    return () => {
      ${options.name.toLowerCase()}WebSocket.off('${event.name}', handler);
    };
  }, [handler]);
}`).join('\n\n')}
`;
  }

  /**
   * Generate test files
   */
  private async generateQueryHookTest(options: QueryHookOptions): Promise<string> {
    return `import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { use${options.name} } from './use${options.name}';
import { apiClient } from '@/services/apiClient';

jest.mock('@/services/apiClient');

describe('use${options.name}', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should fetch data successfully', async () => {
    const mockData = { id: 1, name: 'Test' };
    (apiClient.${options.method?.toLowerCase() || 'get'} as jest.Mock).mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => use${options.name}(${options.params?.length ? '{ id: 1 }' : ''}), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    
    expect(result.current.data).toEqual(mockData);
  });

  it('should handle errors', async () => {
    const mockError = new Error('API Error');
    (apiClient.${options.method?.toLowerCase() || 'get'} as jest.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() => use${options.name}(${options.params?.length ? '{ id: 1 }' : ''}), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    
    expect(result.current.error).toEqual(mockError);
  });
});
`;
  }

  private async generateContextTest(options: ContextProviderOptions): Promise<string> {
    return `import { renderHook, act } from '@testing-library/react';
import { ${options.name}Provider } from './${options.name}Context';
import { use${options.name} } from '@/hooks/use${options.name}';

describe('${options.name}Context', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <${options.name}Provider>{children}</${options.name}Provider>
  );

  it('should provide initial state', () => {
    const { result } = renderHook(() => use${options.name}(), { wrapper });

    ${options.state.map(field => `expect(result.current.${field.name}).toBe(${field.defaultValue || 'null'});`).join('\n    ')}
  });

  ${options.state.map(field => `it('should update ${field.name}', () => {
    const { result } = renderHook(() => use${options.name}(), { wrapper });

    act(() => {
      result.current.set${field.name.charAt(0).toUpperCase() + field.name.slice(1)}(${this.getTestValue(field.type)});
    });

    expect(result.current.${field.name}).toBe(${this.getTestValue(field.type)});
  });`).join('\n\n  ')}

  it('should reset state', () => {
    const { result } = renderHook(() => use${options.name}(), { wrapper });

    act(() => {
      ${options.state[0] ? `result.current.set${options.state[0].name.charAt(0).toUpperCase() + options.state[0].name.slice(1)}(${this.getTestValue(options.state[0].type)});` : ''}
      result.current.reset();
    });

    ${options.state.map(field => `expect(result.current.${field.name}).toBe(${field.defaultValue || 'null'});`).join('\n    ')}
  });
});
`;
  }

  private async generateWebSocketTest(options: WebSocketOptions): Promise<string> {
    return `import { ${options.name}WebSocket } from './${options.name}WebSocket';

// Mock WebSocket
class MockWebSocket {
  readyState = WebSocket.CONNECTING;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;

  constructor(public url: string) {
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      this.onopen?.(new Event('open'));
    }, 10);
  }

  send(data: string) {
    // Mock send
  }

  close() {
    this.readyState = WebSocket.CLOSED;
    this.onclose?.(new CloseEvent('close'));
  }
}

global.WebSocket = MockWebSocket as any;

describe('${options.name}WebSocket', () => {
  let ws: ${options.name}WebSocket;

  beforeEach(() => {
    ws = new ${options.name}WebSocket();
  });

  afterEach(() => {
    ws.disconnect();
  });

  it('should connect to WebSocket', (done) => {
    ws.on('connected', () => {
      expect(ws).toBeDefined();
      done();
    });

    ws.connect();
  });

  it('should handle reconnection', (done) => {
    let connectCount = 0;
    
    ws.on('connected', () => {
      connectCount++;
      if (connectCount === 2) {
        done();
      } else {
        // Simulate disconnect
        (ws as any).ws?.close();
      }
    });

    ws.connect();
  });

  ${options.events.map(event => `it('should handle ${event.name} event', (done) => {
    ws.on('${event.name}', (payload) => {
      expect(payload).toBeDefined();
      done();
    });

    ws.connect();
    
    setTimeout(() => {
      // Simulate incoming message
      const message = new MessageEvent('message', {
        data: JSON.stringify({ type: '${event.name}', payload: { test: true } })
      });
      (ws as any).ws?.onmessage?.(message);
    }, 20);
  });`).join('\n\n  ')}
});
`;
  }

  /**
   * Get test value for a type
   */
  private getTestValue(type: string): string {
    const typeMap: Record<string, string> = {
      'string': "'test'",
      'number': '42',
      'boolean': 'true',
      'string[]': "['test']",
      'number[]': '[1, 2, 3]',
    };
    return typeMap[type] || 'null';
  }

  /**
   * Generate documentation
   */
  private generateQueryHookDocumentation(options: QueryHookOptions): string {
    return `# ${options.name} Query Hook

## Description
${options.description || `Query hook for ${options.endpoint}`}

## Usage
\`\`\`tsx
import { use${options.name} } from '@/hooks/use${options.name}';

function MyComponent() {
  const { data, isLoading, error } = use${options.name}(${
    options.params?.length ? `{
    ${options.params.map(p => `${p.name}: ${this.getTestValue(p.type)}`).join(',\n    ')}
  }` : ''
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{JSON.stringify(data)}</div>;
}
\`\`\`

## Parameters
${options.params?.map(p => `- **${p.name}** (${p.type})${p.required ? ' - Required' : ''}: ${p.description || 'No description'}`).join('\n') || 'None'}

## Caching
${options.caching ? Object.entries(options.caching).map(([key, value]) => `- ${key}: ${value}`).join('\n') : 'Default TanStack Query caching'}

## Invalidation
${options.invalidates?.length ? `Invalidates: ${options.invalidates.join(', ')}` : 'No automatic invalidation'}
`;
  }

  private generateContextDocumentation(options: ContextProviderOptions): string {
    return `# ${options.name} Context

## Description
${options.description || `Global state management for ${options.name}`}

## Usage
\`\`\`tsx
// Wrap your app
import { ${options.name}Provider } from '@/contexts/${options.name}Context';

function App() {
  return (
    <${options.name}Provider>
      <YourApp />
    </${options.name}Provider>
  );
}

// Use in components
import { use${options.name} } from '@/hooks/use${options.name}';

function MyComponent() {
  const { ${options.state.map(s => s.name).join(', ')}, ${options.state.map(s => `set${s.name.charAt(0).toUpperCase() + s.name.slice(1)}`).join(', ')} } = use${options.name}();

  return (
    <div>
      ${options.state.map(s => `<p>${s.name}: {${s.name}}</p>`).join('\n      ')}
    </div>
  );
}
\`\`\`

## State
${options.state.map(s => `- **${s.name}** (${s.type}): ${s.description || 'No description'}`).join('\n')}

## Actions
${options.state.map(s => `- **set${s.name.charAt(0).toUpperCase() + s.name.slice(1)}**: Update ${s.name}`).join('\n')}
- **reset**: Reset to initial state

## Persistence
${options.persistence ? `State is persisted to ${options.persistence}` : 'No persistence'}
`;
  }

  private generateWebSocketDocumentation(options: WebSocketOptions): string {
    return `# ${options.name} WebSocket

## Description
WebSocket connection manager for real-time communication

## Usage
\`\`\`tsx
import { use${options.name}WebSocket } from '@/hooks/use${options.name}WebSocket';

function MyComponent() {
  const { isConnected, send } = use${options.name}WebSocket();

  const sendMessage = () => {
    send('message', { text: 'Hello' });
  };

  return (
    <div>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
\`\`\`

## Events
${options.events.map(e => `- **${e.name}**: ${e.description || 'No description'}`).join('\n')}

## Reconnection
${options.reconnection ? `- Max attempts: ${options.reconnection.maxAttempts || 5}
- Delay: ${options.reconnection.delay || 5000}ms
- Backoff: ${options.reconnection.backoff ? 'Enabled' : 'Disabled'}` : 'Automatic reconnection enabled'}

## Heartbeat
${options.heartbeat ? `- Interval: ${options.heartbeat.interval || 30000}ms
- Message: ${options.heartbeat.message || 'ping'}` : 'No heartbeat configured'}
`;
  }
}

// Export singleton instance
export const stateManagementAgent = new StateManagementAgent(process.cwd());