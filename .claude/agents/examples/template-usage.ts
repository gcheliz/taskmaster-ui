/**
 * Example: Using the Template System with Project Pattern Compliance
 * 
 * This example demonstrates how the template engine ensures all generated
 * code follows project conventions and passes validation.
 */

import { templateEngine } from '../template-engine';
import { templateCustomization } from '../template-customization';
import { APIDevelopmentAgent } from '../backend-agents/api-development-core';
import * as path from 'path';

// Example 1: Generate an API endpoint with full compliance
async function generateCompliantEndpoint() {
  console.log('🚀 Generating compliant API endpoint...');

  const agent = new APIDevelopmentAgent(process.cwd());
  
  // Generate a task management endpoint
  const result = await agent.generateEndpoint({
    endpoint: '/api/tasks/:id',
    method: 'PATCH',
    description: 'Update task status and metadata',
    authentication: true,
    validation: {
      params: {
        id: 'z.string().cuid()',
      },
      body: {
        status: 'z.enum(["pending", "in-progress", "completed", "blocked"])',
        assignee: 'z.string().optional()',
        priority: 'z.enum(["low", "medium", "high", "urgent"]).optional()',
        metadata: 'z.record(z.any()).optional()',
      },
    },
    modelName: 'Task',
  });

  console.log('✅ Generated files:', result.files);
  console.log('📋 Documentation:', result.documentation);
}

// Example 2: Use custom templates with project overrides
async function useCustomTemplate() {
  console.log('🎨 Using custom template with project overrides...');

  // Load project customizations
  const customizations = await templateCustomization.loadCustomizations('taskmaster-ui');
  
  if (!customizations) {
    // Generate example if not exists
    await templateCustomization.generateExampleCustomization();
    return;
  }

  // Generate a service with custom patterns
  const serviceVars = {
    resourceName: 'notification',
    usePrisma: true,
    model: 'Notification',
    methods: [
      {
        name: 'sendNotification',
        description: 'Send notification to user',
        params: true,
        interfaceName: 'SendNotificationInput',
        returnType: 'Notification',
        implementation: `
      // Validate recipient
      const user = await this.prisma.user.findUnique({
        where: { id: params.userId },
      });
      
      if (!user) {
        throw new AppError('User not found', 404);
      }
      
      // Create notification
      const notification = await this.prisma.notification.create({
        data: {
          userId: params.userId,
          title: params.title,
          message: params.message,
          type: params.type,
          priority: params.priority || 'medium',
        },
      });
      
      // Send via appropriate channel
      await this.sendViaChannel(notification, user);
      
      return notification;
        `,
      },
    ],
    helperMethods: [
      {
        name: 'sendViaChannel',
        params: 'notification: Notification, user: User',
        returnType: 'Promise<void>',
        implementation: `
    switch (notification.type) {
      case 'email':
        // Send email notification
        break;
      case 'push':
        // Send push notification
        break;
      case 'in-app':
        // Update in-app notification center
        break;
    }
        `,
      },
    ],
  };

  // Apply customizations
  const customizedVars = templateCustomization.applyCustomizations(serviceVars, customizations);

  // Generate with validation
  const result = await templateEngine.generate({
    name: 'notification-service',
    templatePath: path.join(__dirname, '../templates/backend/service.hbs'),
    outputPath: 'packages/backend/src/services/notificationService.ts',
    variables: customizedVars,
    validationRules: {
      typescript: true,
      eslint: true,
      prettier: true,
    },
  });

  // Validate against project rules
  const validation = await templateCustomization.validateTemplateOutput(
    result,
    'service',
    customizations
  );

  if (!validation.valid) {
    console.error('❌ Validation errors:', validation.errors);
  } else {
    console.log('✅ Generated service passes all project validations!');
  }
}

// Example 3: Generate database migration with compliance
async function generateCompliantMigration() {
  console.log('🗄️  Generating compliant database migration...');

  const migrationVars = {
    name: 'add-task-metadata',
    description: 'Add metadata fields to Task model',
    timestamp: new Date().toISOString(),
    alterTables: [
      {
        table: 'Task',
        addColumns: [
          {
            name: 'metadata',
            type: 'JSONB',
            notNull: false,
            defaultValue: "'{}'",
          },
          {
            name: 'tags',
            type: 'TEXT[]',
            notNull: false,
            defaultValue: "ARRAY[]::TEXT[]",
          },
        ],
      },
    ],
    createIndexes: [
      {
        name: 'idx_task_metadata_gin',
        table: 'Task',
        columns: 'metadata',
        unique: false,
      },
    ],
    rollback: `
-- Rollback: Remove metadata fields from Task
ALTER TABLE "Task" DROP COLUMN IF EXISTS "metadata";
ALTER TABLE "Task" DROP COLUMN IF EXISTS "tags";
DROP INDEX IF EXISTS "idx_task_metadata_gin";
    `,
  };

  const migrationContent = await templateEngine.generate({
    name: 'migration',
    templatePath: path.join(__dirname, '../templates/backend/migration.hbs'),
    outputPath: `packages/backend/prisma/migrations/${Date.now()}_add_task_metadata/migration.sql`,
    variables: migrationVars,
  });

  console.log('✅ Generated migration with rollback support');
}

// Example 4: Batch generation with validation
async function batchGenerateWithValidation() {
  console.log('📦 Batch generating multiple compliant files...');

  const files = [
    {
      type: 'controller',
      name: 'UserController',
      resource: 'user',
    },
    {
      type: 'service',
      name: 'UserService',
      resource: 'user',
    },
    {
      type: 'validation',
      name: 'UserValidation',
      resource: 'user',
    },
  ];

  const results = await Promise.all(
    files.map(async (file) => {
      const templatePath = path.join(__dirname, `../templates/backend/${file.type}.hbs`);
      const outputPath = `packages/backend/src/${file.type}s/${file.name}.ts`;

      try {
        const content = await templateEngine.generate({
          name: file.name,
          templatePath,
          outputPath,
          variables: {
            resourceName: file.resource,
            // Add type-specific variables
          },
          validationRules: {
            typescript: true,
            eslint: true,
          },
        });

        return {
          file: file.name,
          success: true,
          path: outputPath,
        };
      } catch (error) {
        return {
          file: file.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    })
  );

  // Summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`✅ Successfully generated: ${successful} files`);
  if (failed > 0) {
    console.log(`❌ Failed: ${failed} files`);
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.file}: ${r.error}`);
    });
  }
}

// Run examples
if (require.main === module) {
  (async () => {
    try {
      await generateCompliantEndpoint();
      console.log('\n---\n');
      
      await useCustomTemplate();
      console.log('\n---\n');
      
      await generateCompliantMigration();
      console.log('\n---\n');
      
      await batchGenerateWithValidation();
    } catch (error) {
      console.error('Example failed:', error);
    }
  })();
}