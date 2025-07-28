#!/usr/bin/env ts-node

/**
 * Example: State Management Agent Demo
 * 
 * Demonstrates generating TanStack Query hooks, Context providers,
 * and WebSocket managers for state management
 */

import { stateManagementAgent } from '../frontend-agents/state-management-agent';

async function demonstrateStateManagement() {
  console.log('🔄 State Management Agent Demo\n');

  try {
    // Example 1: Generate a query hook for fetching data
    console.log('1️⃣ Generating Users query hook...');
    await stateManagementAgent.generateQueryHook({
      name: 'Users',
      endpoint: '/api/users',
      method: 'GET',
      returnType: 'User[]',
      description: 'Fetch all users with caching',
      caching: {
        staleTime: 60000, // 1 minute
        cacheTime: 300000, // 5 minutes
        refetchOnWindowFocus: false,
      },
    });

    console.log('✅ Generated useUsers hook with:');
    console.log('   - TanStack Query integration');
    console.log('   - 1 minute stale time');
    console.log('   - 5 minute cache time');
    console.log('   - Disabled refetch on window focus');
    console.log('\n---\n');

    // Example 2: Generate a mutation hook with optimistic updates
    console.log('2️⃣ Generating CreateTask mutation hook...');
    await stateManagementAgent.generateQueryHook({
      name: 'CreateTask',
      endpoint: '/api/tasks',
      method: 'POST',
      body: [
        { name: 'title', type: 'string', required: true, description: 'Task title' },
        { name: 'description', type: 'string', required: false, description: 'Task description' },
        { name: 'priority', type: "'low' | 'medium' | 'high'", required: false },
        { name: 'assigneeId', type: 'string', required: false },
      ],
      returnType: 'Task',
      description: 'Create a new task with optimistic updates',
      optimisticUpdate: true,
      invalidates: ['Tasks', 'UserTasks'],
    });

    console.log('✅ Generated useCreateTask mutation with:');
    console.log('   - POST request handling');
    console.log('   - Optimistic updates');
    console.log('   - Type-safe input validation');
    console.log('   - Auto-invalidation of Tasks and UserTasks queries');
    console.log('\n---\n');

    // Example 3: Generate a parameterized query hook
    console.log('3️⃣ Generating TaskById query hook...');
    await stateManagementAgent.generateQueryHook({
      name: 'TaskById',
      endpoint: '/api/tasks/:id',
      method: 'GET',
      params: [
        { name: 'id', type: 'string', required: true, description: 'Task ID' },
      ],
      returnType: 'Task',
      description: 'Fetch a single task by ID',
      caching: {
        staleTime: 30000,
        refetchInterval: 60000,
      },
    });

    console.log('✅ Generated useTaskById hook with:');
    console.log('   - Parameterized query');
    console.log('   - Dynamic query key');
    console.log('   - Auto-refetch every minute');
    console.log('\n---\n');

    // Example 4: Generate an Auth context provider
    console.log('4️⃣ Generating Auth context provider...');
    await stateManagementAgent.generateContextProvider({
      name: 'Auth',
      state: [
        { name: 'user', type: 'User | null', defaultValue: 'null', description: 'Current user' },
        { name: 'isAuthenticated', type: 'boolean', defaultValue: 'false', description: 'Auth status' },
        { name: 'token', type: 'string | null', defaultValue: 'null', description: 'Auth token' },
        { name: 'permissions', type: 'string[]', defaultValue: '[]', description: 'User permissions' },
      ],
      actions: [
        'login: async (credentials: LoginCredentials) => Promise<void>',
        'logout: () => void',
        'refreshToken: async () => Promise<void>',
      ],
      persistence: 'localStorage',
      description: 'Global authentication state management',
    });

    console.log('✅ Generated AuthContext with:');
    console.log('   - User, token, and permissions state');
    console.log('   - Login/logout actions');
    console.log('   - localStorage persistence');
    console.log('   - useAuth hook for easy access');
    console.log('\n---\n');

    // Example 5: Generate a Theme context without persistence
    console.log('5️⃣ Generating Theme context provider...');
    await stateManagementAgent.generateContextProvider({
      name: 'Theme',
      state: [
        { name: 'mode', type: "'light' | 'dark'", defaultValue: "'light'", description: 'Theme mode' },
        { name: 'primaryColor', type: 'string', defaultValue: "'blue-600'", description: 'Primary color' },
        { name: 'fontSize', type: "'sm' | 'base' | 'lg'", defaultValue: "'base'", description: 'Font size' },
      ],
      description: 'Application theme configuration',
    });

    console.log('✅ Generated ThemeContext with:');
    console.log('   - Theme mode (light/dark)');
    console.log('   - Customizable colors');
    console.log('   - No persistence (session only)');
    console.log('\n---\n');

    // Example 6: Generate WebSocket manager for real-time updates
    console.log('6️⃣ Generating Chat WebSocket manager...');
    await stateManagementAgent.generateWebSocketManager({
      name: 'Chat',
      url: 'ws://localhost:3001/chat',
      events: [
        { 
          name: 'message', 
          handler: '// Add message to chat history',
          description: 'New chat message received' 
        },
        { 
          name: 'userJoined', 
          handler: '// Update online users list',
          description: 'User joined the chat' 
        },
        { 
          name: 'userLeft', 
          handler: '// Remove from online users',
          description: 'User left the chat' 
        },
        { 
          name: 'typing', 
          handler: '// Show typing indicator',
          description: 'User is typing' 
        },
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

    console.log('✅ Generated ChatWebSocket with:');
    console.log('   - Auto-reconnection with exponential backoff');
    console.log('   - Heartbeat for connection health');
    console.log('   - Event-specific hooks (useChat*)');
    console.log('   - Type-safe message handling');
    console.log('\n---\n');

    // Example 7: Generate a complex mutation with file upload
    console.log('7️⃣ Generating UploadAvatar mutation...');
    await stateManagementAgent.generateQueryHook({
      name: 'UploadAvatar',
      endpoint: '/api/users/avatar',
      method: 'POST',
      body: [
        { name: 'file', type: 'File', required: true, description: 'Avatar image file' },
        { name: 'userId', type: 'string', required: true, description: 'User ID' },
      ],
      returnType: 'AvatarResponse',
      description: 'Upload user avatar with progress tracking',
      invalidates: ['UserProfile', 'Users'],
    });

    console.log('✅ Generated useUploadAvatar mutation with:');
    console.log('   - File upload support');
    console.log('   - Progress tracking capability');
    console.log('   - Profile invalidation');
    console.log('\n---\n');

    // Summary
    console.log('🎉 State Management demo complete!\n');
    console.log('📊 Summary of features demonstrated:');
    console.log('✅ TanStack Query Integration:');
    console.log('   - Query hooks with caching strategies');
    console.log('   - Mutations with optimistic updates');
    console.log('   - Parameterized queries');
    console.log('   - Automatic cache invalidation');
    console.log('   - Refetch intervals and controls');
    
    console.log('\n✅ Context Providers:');
    console.log('   - Global state management');
    console.log('   - Type-safe state and actions');
    console.log('   - Optional persistence');
    console.log('   - Custom hooks for easy access');
    console.log('   - Reducer-based state updates');
    
    console.log('\n✅ WebSocket Management:');
    console.log('   - Auto-reconnection with backoff');
    console.log('   - Event-based architecture');
    console.log('   - Heartbeat for health checks');
    console.log('   - Type-safe event handlers');
    console.log('   - React hooks integration');

    console.log('\n💡 Performance Optimizations:');
    console.log('   - Strategic cache invalidation');
    console.log('   - Optimistic updates for instant UI');
    console.log('   - Selective re-rendering');
    console.log('   - Query deduplication');
    console.log('   - Background refetching');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the demo
demonstrateStateManagement();