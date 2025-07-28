import { DatabaseManagementAgent, SchemaUpdateInput, MigrationInput, SeedDataInput } from '../database-management-core';
import { promises as fs } from 'fs';
import path from 'path';

jest.mock('child_process', () => ({
  exec: jest.fn((cmd, callback) => {
    // Mock successful responses
    if (cmd.includes('prisma migrate dev')) {
      callback(null, { stdout: 'Created migration: 20240101000000_test_migration' });
    } else if (cmd.includes('prisma migrate deploy')) {
      callback(null, { stdout: 'All migrations have been successfully applied' });
    } else if (cmd.includes('prisma format')) {
      callback(null, { stdout: 'Formatted schema' });
    }
  }),
}));

describe('DatabaseManagementAgent', () => {
  let agent: DatabaseManagementAgent;
  const mockWorkspacePath = '/tmp/test-workspace';

  beforeEach(() => {
    agent = new DatabaseManagementAgent(mockWorkspacePath);
  });

  describe('updateSchema', () => {
    it('should generate correct model definition for create action', async () => {
      const input: SchemaUpdateInput = {
        model: 'Task',
        action: 'create',
        fields: [
          {
            name: 'title',
            type: 'String',
            modifiers: ['@db.VarChar(255)'],
          },
          {
            name: 'description',
            type: 'String?',
          },
          {
            name: 'userId',
            type: 'String',
            relation: {
              model: 'User',
              fields: ['userId'],
              references: ['id'],
            },
          },
        ],
        indexes: [
          { fields: ['userId'] },
          { fields: ['title'], type: 'unique' },
        ],
      };

      const modelDef = (agent as any).generateModelDefinition(input);

      expect(modelDef).toContain('model Task {');
      expect(modelDef).toContain('title String @db.VarChar(255)');
      expect(modelDef).toContain('description String?');
      expect(modelDef).toContain('userId String');
      expect(modelDef).toContain('user User @relation(fields: [userId], references: [id])');
      expect(modelDef).toContain('@@index([userId])');
      expect(modelDef).toContain('@@unique([title])');
      expect(modelDef).toContain('@@map("tasks")');
    });

    it('should handle model deletion', async () => {
      const mockSchema = `
model User {
  id String @id
}

model Task {
  id String @id
}
`;

      const result = await (agent as any).deleteModelFromSchema(mockSchema, 'Task');
      
      expect(result).toContain('model User');
      expect(result).not.toContain('model Task');
    });
  });

  describe('generateSeedData', () => {
    it('should generate seed script with faker data', async () => {
      const input: SeedDataInput = {
        model: 'User',
        count: 5,
        fields: {
          email: {
            type: 'faker',
            options: 'internet.email',
          },
          name: {
            type: 'faker',
            options: 'person.fullName',
          },
          role: {
            type: 'random',
            options: {
              values: ['admin', 'user', 'moderator'],
            },
          },
        },
      };

      const script = (agent as any).generateSeedScript(input);

      expect(script).toContain('import { faker }');
      expect(script).toContain('seedUser(count: number = 5)');
      expect(script).toContain('email: faker.internet.email()');
      expect(script).toContain('name: faker.person.fullName()');
      expect(script).toContain("role: ['admin', 'user', 'moderator'][Math.floor(Math.random()");
    });

    it('should generate seed script with sequence data', async () => {
      const input: SeedDataInput = {
        model: 'Product',
        count: 10,
        fields: {
          sku: {
            type: 'sequence',
            options: {
              prefix: 'PROD-',
            },
          },
          price: '99.99',
        },
      };

      const script = (agent as any).generateSeedScript(input);

      expect(script).toContain('sku: `PROD-${i + 1}`');
      expect(script).toContain("price: '99.99'");
    });
  });

  describe('analyzeQueries', () => {
    it('should suggest indexes for foreign keys', async () => {
      const mockSchema = `
model Task {
  id String @id
  userId String
  projectId String
  
  user User @relation(fields: [userId], references: [id])
  project Project @relation(fields: [projectId], references: [id])
}
`;

      jest.spyOn(fs, 'readFile').mockResolvedValue(mockSchema);

      const result = await agent.analyzeQueries('Task');

      expect(result.success).toBe(true);
      expect(result.files).toContain('Add index on foreign key field: @@index([userId])');
      expect(result.files).toContain('Add index on foreign key field: @@index([projectId])');
    });

    it('should suggest unique constraints for common fields', async () => {
      const mockSchema = `
model User {
  id String @id
  email String
  username String
}
`;

      jest.spyOn(fs, 'readFile').mockResolvedValue(mockSchema);

      const result = await agent.analyzeQueries('User');

      expect(result.success).toBe(true);
      expect(result.files).toContain('Consider adding @unique constraint to email field');
      expect(result.files).toContain('Consider adding @unique constraint to username field');
    });
  });

  describe('validateMigration', () => {
    it('should detect dangerous operations', async () => {
      const dangerousMigration = `
-- DropTable
DROP TABLE "users";

-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "description";
ALTER TABLE "projects" ADD COLUMN "status" TEXT NOT NULL;
`;

      jest.spyOn(fs, 'readFile').mockResolvedValue(dangerousMigration);

      const result = await agent.validateMigration('/path/to/migration.sql');

      expect(result.success).toBe(false);
      expect(result.files).toContain('Migration contains DROP TABLE - data will be lost');
      expect(result.files).toContain('Migration contains DROP COLUMN - data will be lost');
      expect(result.files).toContain('Migration adds NOT NULL constraint - ensure existing data is compatible');
    });

    it('should pass safe migrations', async () => {
      const safeMigration = `
-- CreateTable
CREATE TABLE "tasks" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tasks_title_idx" ON "tasks"("title");
`;

      jest.spyOn(fs, 'readFile').mockResolvedValue(safeMigration);

      const result = await agent.validateMigration('/path/to/migration.sql');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Migration is safe');
    });
  });
});