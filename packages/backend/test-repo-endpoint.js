// Simple test script for repository validation endpoint
const http = require('http');

const testData = JSON.stringify({
  repositoryPath: '/Users/gonzalo/workspace/taskmaster-ui',
  validateGit: true,
  validateTaskMaster: true
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/repositories/validate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(testData)
  }
};

console.log('Testing repository validation endpoint...');
console.log('Request:', testData);

const req = http.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('\nResponse:', JSON.stringify(response, null, 2));
    } catch (error) {
      console.log('\nRaw Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error.message);
});

req.write(testData);
req.end();