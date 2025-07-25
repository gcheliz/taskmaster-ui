// Test file to verify type imports work correctly
import bcrypt from 'bcryptjs';
import { Queue } from 'bull';

// Test bcryptjs types
async function testBcrypt() {
  const hash = await bcrypt.hash('password', 10);
  const isValid = await bcrypt.compare('password', hash);
  console.log('bcryptjs types work:', typeof hash === 'string' && typeof isValid === 'boolean');
}

// Test bull types
function testBull() {
  const queue = new Queue('test-queue', {
    redis: { host: 'localhost', port: 6379 }
  });
  console.log('bull types work:', queue instanceof Queue);
}

console.log('Type imports successful!');