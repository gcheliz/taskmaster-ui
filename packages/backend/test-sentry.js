const Sentry = require('@sentry/node');

console.log('Sentry exports:');
console.log('- expressErrorHandler:', typeof Sentry.expressErrorHandler);
console.log('- setupExpressErrorHandler:', typeof Sentry.setupExpressErrorHandler);
console.log('- errorHandler:', typeof Sentry.errorHandler);

// Try to use it
if (typeof Sentry.expressErrorHandler === 'function') {
  console.log('\nexpressErrorHandler exists, trying to call it...');
  try {
    const handler = Sentry.expressErrorHandler();
    console.log('Success! Handler type:', typeof handler);
  } catch (e) {
    console.log('Error calling expressErrorHandler:', e.message);
  }
}