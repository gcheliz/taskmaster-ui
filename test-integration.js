#!/usr/bin/env node

const http = require('http');

// Test the backend API endpoints
async function testBackend() {
  const tests = [
    {
      name: 'GET /api/projects',
      options: {
        hostname: 'localhost',
        port: 3001,
        path: '/api/projects',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    },
    {
      name: 'POST /api/projects',
      options: {
        hostname: 'localhost',
        port: 3001,
        path: '/api/projects',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      },
      data: JSON.stringify({
        repositoryId: 'test-repo-id',
        projectName: 'Test Project'
      })
    }
  ];

  for (const test of tests) {
    console.log(`\n🧪 Testing ${test.name}...`);
    
    try {
      const response = await makeRequest(test.options, test.data);
      console.log(`✅ Status: ${response.statusCode}`);
      console.log(`📄 Response: ${response.body.substring(0, 200)}${response.body.length > 200 ? '...' : ''}`);
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
}

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

// Run the tests
console.log('🚀 Testing TaskMaster UI Backend Integration...');
testBackend().then(() => {
  console.log('\n✨ Integration test completed!');
  process.exit(0);
}).catch((error) => {
  console.error('\n💥 Integration test failed:', error);
  process.exit(1);
});