export { APIDevelopmentAgent, GenerateEndpointInput, generateEndpointSchema } from './api-development-core';
export { APIDevelopmentCommands, handleAPICommand } from './api-development-commands';
export { DatabaseManagementAgent } from './database-management-core';
export { DatabaseManagementCommands, handleDatabaseCommand } from './database-management-commands';

// Agent metadata for registration
export const backendAgents = {
  'api-development': {
    name: 'API Development Agent',
    description: 'Handles API endpoint creation and modification with Express v5 and Prisma',
    commands: ['generate', 'update', 'document', 'validate'],
    filePatterns: ['**/routes/*.ts', '**/controllers/*.ts', '**/services/*.ts'],
  },
  'database-management': {
    name: 'Database Management Agent',
    description: 'Manages Prisma schema, migrations, and database operations',
    commands: ['schema', 'migrate', 'seed', 'optimize'],
    filePatterns: ['**/prisma/schema.prisma', '**/migrations/*.sql'],
  },
};