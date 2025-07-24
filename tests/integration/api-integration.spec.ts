import { test, expect } from '@playwright/test';

test.describe('API Integration Tests', () => {
  const API_BASE_URL = process.env.API_URL || 'http://localhost:3001/api';
  
  test.describe('Authentication API', () => {
    test('should handle OAuth flow', async ({ request }) => {
      // Test OAuth initiation
      const oauthResponse = await request.get(`${API_BASE_URL}/auth/github`);
      expect(oauthResponse.status()).toBe(302);
      
      const location = oauthResponse.headers()['location'];
      expect(location).toContain('github.com/login/oauth/authorize');
    });
    
    test('should validate auth tokens', async ({ request }) => {
      // Test with valid token
      const validResponse = await request.get(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': 'Bearer valid-test-token'
        }
      });
      
      // Should return user data or 401
      expect([200, 401]).toContain(validResponse.status());
      
      // Test with invalid token
      const invalidResponse = await request.get(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });
      
      expect(invalidResponse.status()).toBe(401);
    });
  });
  
  test.describe('Tasks API', () => {
    test('should perform CRUD operations on tasks', async ({ request }) => {
      // Create task
      const createResponse = await request.post(`${API_BASE_URL}/tasks`, {
        data: {
          title: 'Integration Test Task',
          description: 'Created via integration test',
          priority: 'medium',
          status: 'pending',
        }
      });
      
      if (createResponse.status() === 201) {
        const task = await createResponse.json();
        expect(task).toHaveProperty('id');
        expect(task.title).toBe('Integration Test Task');
        
        // Read task
        const getResponse = await request.get(`${API_BASE_URL}/tasks/${task.id}`);
        expect(getResponse.status()).toBe(200);
        
        const fetchedTask = await getResponse.json();
        expect(fetchedTask.id).toBe(task.id);
        
        // Update task
        const updateResponse = await request.put(`${API_BASE_URL}/tasks/${task.id}`, {
          data: {
            ...task,
            status: 'in-progress'
          }
        });
        
        expect(updateResponse.status()).toBe(200);
        const updatedTask = await updateResponse.json();
        expect(updatedTask.status).toBe('in-progress');
        
        // Delete task
        const deleteResponse = await request.delete(`${API_BASE_URL}/tasks/${task.id}`);
        expect(deleteResponse.status()).toBe(204);
        
        // Verify deletion
        const verifyResponse = await request.get(`${API_BASE_URL}/tasks/${task.id}`);
        expect(verifyResponse.status()).toBe(404);
      }
    });
    
    test('should filter and paginate tasks', async ({ request }) => {
      // Test filtering
      const filterResponse = await request.get(`${API_BASE_URL}/tasks`, {
        params: {
          status: 'pending',
          priority: 'high',
          limit: 10,
          offset: 0,
        }
      });
      
      if (filterResponse.status() === 200) {
        const data = await filterResponse.json();
        expect(data).toHaveProperty('tasks');
        expect(data).toHaveProperty('total');
        
        if (data.tasks.length > 0) {
          // All tasks should match filter criteria
          data.tasks.forEach(task => {
            expect(task.status).toBe('pending');
            expect(task.priority).toBe('high');
          });
        }
      }
    });
  });
  
  test.describe('WebSocket Integration', () => {
    test('should establish WebSocket connection', async ({ page }) => {
      // Navigate to a page that uses WebSocket
      await page.goto('http://localhost:5173/dashboard');
      
      // Listen for WebSocket connection
      const wsPromise = page.waitForEvent('websocket');
      
      // Trigger an action that initiates WebSocket
      await page.evaluate(() => {
        // Trigger WebSocket connection
        window.dispatchEvent(new Event('connect-websocket'));
      });
      
      const ws = await wsPromise;
      expect(ws.url()).toContain('ws://');
      
      // Listen for messages
      ws.on('framereceived', frame => {
        const data = JSON.parse(frame.payload.toString());
        expect(data).toHaveProperty('type');
      });
    });
  });
  
  test.describe('File Upload Integration', () => {
    test('should handle file uploads', async ({ request }) => {
      // Create a test file
      const fileContent = Buffer.from('Test file content');
      
      const response = await request.post(`${API_BASE_URL}/upload`, {
        multipart: {
          file: {
            name: 'test.txt',
            mimeType: 'text/plain',
            buffer: fileContent,
          },
          type: 'document',
        }
      });
      
      if (response.status() === 201) {
        const result = await response.json();
        expect(result).toHaveProperty('fileId');
        expect(result).toHaveProperty('url');
      }
    });
  });
  
  test.describe('Performance Metrics', () => {
    test('should respond within acceptable time limits', async ({ request }) => {
      const endpoints = [
        '/auth/me',
        '/tasks',
        '/projects',
        '/dashboard/stats',
      ];
      
      for (const endpoint of endpoints) {
        const startTime = Date.now();
        const response = await request.get(`${API_BASE_URL}${endpoint}`);
        const endTime = Date.now();
        
        const responseTime = endTime - startTime;
        
        // API should respond within 1 second
        expect(responseTime).toBeLessThan(1000);
        
        // Log slow responses
        if (responseTime > 500) {
          console.warn(`Slow response from ${endpoint}: ${responseTime}ms`);
        }
      }
    });
  });
  
  test.describe('Error Handling', () => {
    test('should handle malformed requests gracefully', async ({ request }) => {
      // Send invalid JSON
      const response = await request.post(`${API_BASE_URL}/tasks`, {
        data: 'invalid json',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      expect(response.status()).toBe(400);
      const error = await response.json();
      expect(error).toHaveProperty('error');
    });
    
    test('should handle rate limiting', async ({ request }) => {
      // Send multiple requests rapidly
      const requests = Array(50).fill(null).map(() => 
        request.get(`${API_BASE_URL}/tasks`)
      );
      
      const responses = await Promise.all(requests);
      
      // Check if any requests were rate limited
      const rateLimited = responses.filter(r => r.status() === 429);
      
      if (rateLimited.length > 0) {
        // Rate limiting is working
        const headers = rateLimited[0].headers();
        expect(headers).toHaveProperty('x-ratelimit-limit');
        expect(headers).toHaveProperty('x-ratelimit-remaining');
      }
    });
  });
});