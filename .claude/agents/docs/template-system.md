# Template System and Project Pattern Compliance

## Overview

The Claude Agent Template System ensures all generated code follows project conventions, passes validation, and maintains consistency across the codebase. It uses Handlebars templates with custom helpers and a comprehensive validation system.

## Key Features

### 1. Template Engine

- **Handlebars-based**: Flexible templating with custom helpers
- **Project-aware**: Automatically applies project conventions
- **Validation**: Built-in TypeScript, ESLint, and Prettier validation
- **Caching**: Template compilation caching for performance

### 2. Custom Helpers

```handlebars
{{camelCase 'my-variable'}}
→ myVariable
{{pascalCase 'my-class'}}
→ MyClass
{{kebabCase 'MyComponent'}}
→ my-component
{{upperSnakeCase 'myConstant'}}
→ MY_CONSTANT
{{tsType 'string'}}
→ string
{{zodSchema fields}}
→ z.object({ ... })
{{organizeImports imports}}
→ Properly ordered imports
```

### 3. Project Pattern Enforcement

#### TypeScript Configuration

- Strict mode enforced
- Target: ES2022
- Module: ESNext
- No explicit `any` types
- Explicit function return types

#### ESLint Rules

- Extends `@taskmaster/eslint-config`
- No console.log (except warn/error)
- Consistent naming conventions
- Import order validation

#### Import Organization

```typescript
// 1. Node modules
import fs from 'fs';
import path from 'path';

// 2. External packages
import { z } from 'zod';
import express from 'express';

// 3. Internal modules
import { logger } from '@/utils/logger';

// 4. Parent imports
import { BaseService } from '../base';

// 5. Sibling imports
import { helper } from './helper';
```

### 4. Template Customization

Projects can override default patterns via `.claude/template-customizations.json`:

```json
{
  "taskmaster-ui": {
    "projectName": "taskmaster-ui",
    "overrides": {
      "imports": {
        "order": [
          "node",
          "external",
          "@taskmaster",
          "internal",
          "parent",
          "sibling"
        ]
      },
      "naming": {
        "components": "PascalCase",
        "services": "PascalCase",
        "controllers": "PascalCase"
      },
      "validation": {
        "library": "zod",
        "strictMode": true
      },
      "testing": {
        "framework": "vitest",
        "coverage": 80
      }
    }
  }
}
```

## Usage Examples

### Basic Template Generation

```typescript
const result = await templateEngine.generate({
  name: 'controller',
  templatePath: 'templates/backend/controller.hbs',
  outputPath: 'src/controllers/UserController.ts',
  variables: {
    resourceName: 'user',
    methods: [
      /* ... */
    ],
  },
  validationRules: {
    typescript: true,
    eslint: true,
    prettier: true,
  },
});
```

### With Custom Overrides

```typescript
const customization =
  await templateCustomization.loadCustomizations('taskmaster-ui');
const vars = templateCustomization.applyCustomizations(
  templateVars,
  customization
);

const result = await templateEngine.generate({
  // ... config
  overrides: {
    imports: ['logger from "./utils/logger"'],
    customSections: {
      CUSTOM_MIDDLEWARE: 'rateLimiter(),',
    },
  },
});
```

## Available Templates

### Backend Templates

1. **controller.hbs**: Express controllers with error handling
2. **service.hbs**: Business logic services with Prisma integration
3. **routes.hbs**: Express route definitions with middleware
4. **validation.hbs**: Zod validation schemas
5. **migration.hbs**: Database migration SQL files
6. **seed.hbs**: Seed data generation scripts

### Frontend Templates (coming soon)

1. **component.hbs**: React components with TypeScript
2. **hook.hbs**: Custom React hooks
3. **context.hbs**: React Context providers
4. **story.hbs**: Storybook stories

## Validation Process

1. **Pre-generation**: Validate input parameters
2. **Template compilation**: Ensure template syntax is valid
3. **Post-generation**:
   - TypeScript compilation check
   - ESLint rule validation
   - Prettier formatting
   - Custom pattern validation

## Error Handling

The template system provides detailed error messages:

```typescript
{
  valid: false,
  errors: [
    "TypeScript errors: Property 'userId' does not exist",
    "Component naming violation: userController should be PascalCase",
    "Found explicit 'any' type usage"
  ],
  warnings: [
    "Import order violation: node imports should come before external",
    "Found console.log statements"
  ]
}
```

## Best Practices

1. **Always validate**: Enable all validation rules for production code
2. **Use project customizations**: Load project-specific overrides
3. **Test templates**: Write tests for custom templates
4. **Cache templates**: Reuse template engine instance
5. **Handle errors**: Check validation results before saving files

## Extending the System

### Adding Custom Templates

1. Create template file in `.claude/agents/templates/`
2. Register in template customization
3. Add corresponding generator method
4. Write tests for the template

### Adding Custom Helpers

```typescript
this.handlebars.registerHelper('myHelper', (value: any) => {
  // Custom transformation
  return transformedValue;
});
```

### Adding Validation Rules

```typescript
private validateCustomRule(code: string, errors: string[]): void {
  // Custom validation logic
  if (condition) {
    errors.push('Custom rule violation');
  }
}
```

## Performance Considerations

- Templates are cached after first compilation
- Validation runs in parallel where possible
- Prettier formatting is applied during save
- File system operations are batched

## Troubleshooting

### Common Issues

1. **Template not found**: Check path relative to template directory
2. **Validation fails**: Review error messages and fix code patterns
3. **Import order wrong**: Update customization file with correct order
4. **Prettier fails**: Ensure code is syntactically valid

### Debug Mode

```typescript
// Enable debug logging
process.env.TEMPLATE_DEBUG = 'true';
```

## Future Enhancements

1. **Hot reload**: Watch templates for changes
2. **VSCode integration**: IntelliSense for template variables
3. **Migration tools**: Automated code migration to new patterns
4. **Analytics**: Track most used templates and patterns
