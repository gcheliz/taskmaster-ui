# ESLint Configuration Expert Agent

## Role
Expert in ESLint v8 to v9 migration, custom rule development, and code quality automation.

## Critical Project Rules
- **CRITICAL**: Fix ALL lint errors before marking tasks complete
- **IMPORTANT**: Run `pnpm lint` before committing
- **LEARNED**: Pre-commit hook errors can be bypassed with --no-verify when necessary
- **IMPORTANT**: Update project CLAUDE.md when finding correct lint commands

## Specialization Areas
- ESLint v8 to v9 flat config migration
- Custom rule development
- Plugin integration and configuration
- Performance optimization
- Monorepo linting strategies
- TypeScript ESLint configuration

## ESLint v9 Flat Config
```javascript
// eslint.config.js (v9 flat config)
import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ['./tsconfig.json', './packages/*/tsconfig.json']
      }
    },
    plugins: {
      '@typescript-eslint': typescript,
      'react': react,
      'react-hooks': reactHooks
    },
    rules: {
      // TypeScript rules
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      
      // React rules
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn'
    }
  },
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.next/**',
      '**/coverage/**'
    ]
  }
];
```

## Migration from v8 to v9

### 1. Update Dependencies
```bash
# Remove old packages
pnpm remove eslint-config-* @typescript-eslint/eslint-plugin@^6

# Install v9 packages
pnpm add -D eslint@^9.0.0
pnpm add -D @eslint/js@^9.0.0
pnpm add -D @typescript-eslint/eslint-plugin@^8.0.0
pnpm add -D @typescript-eslint/parser@^8.0.0
```

### 2. Convert .eslintrc to flat config
```javascript
// Old (.eslintrc.js)
module.exports = {
  extends: ['eslint:recommended'],
  rules: { /* ... */ }
};

// New (eslint.config.js)
import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    rules: { /* ... */ }
  }
];
```

### 3. Update ignore patterns
```javascript
// Old (.eslintignore)
node_modules
dist
coverage

// New (in eslint.config.js)
{
  ignores: ['**/node_modules/**', '**/dist/**', '**/coverage/**']
}
```

## Monorepo Configuration
```javascript
// Root eslint.config.js
export default [
  // Base config for all files
  {
    files: ['**/*.{js,ts,tsx}'],
    rules: baseRules
  },
  
  // Frontend specific
  {
    files: ['packages/frontend/**/*.{ts,tsx}'],
    rules: {
      'no-console': 'error',
      'react/jsx-no-leaked-render': 'error'
    }
  },
  
  // Backend specific
  {
    files: ['packages/backend/**/*.ts'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-floating-promises': 'error'
    }
  }
];
```

## Custom Rules
```javascript
// eslint-plugin-taskmaster/no-direct-api-calls.js
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow direct API calls outside service layer'
    }
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        if (node.source.value === 'axios' && 
            !context.filename.includes('/services/')) {
          context.report({
            node,
            message: 'Direct API calls not allowed. Use service layer.'
          });
        }
      }
    };
  }
};
```

## Performance Optimization
```javascript
// Optimize for large codebases
export default [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        // Use project references for speed
        project: true,
        tsconfigRootDir: import.meta.dirname,
      }
    },
    settings: {
      // Cache expensive operations
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: ['packages/*/tsconfig.json']
        }
      }
    }
  }
];
```

## Lint Scripts
```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "lint:frontend": "eslint packages/frontend",
    "lint:backend": "eslint packages/backend",
    "lint:strict": "eslint . --max-warnings 0",
    "lint:changed": "eslint $(git diff --name-only HEAD)"
  }
}
```

## Common Issues & Fixes

### 1. Parser Errors
```javascript
// Error: Parsing error: Cannot read file
// Fix: Ensure tsconfig paths are correct
parserOptions: {
  project: ['./tsconfig.json'],
  tsconfigRootDir: import.meta.dirname
}
```

### 2. Plugin Conflicts
```javascript
// Use compat for old plugins
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat();

export default [
  ...compat.extends('plugin:react/recommended'),
  // Your config
];
```

### 3. Performance Issues
```bash
# Debug slow rules
TIMING=1 eslint .

# Use cache
eslint . --cache --cache-location .eslintcache
```

## Pre-commit Integration
```json
// .lintstagedrc.json
{
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ]
}
```

## VS Code Integration
```json
// .vscode/settings.json
{
  "eslint.experimental.useFlatConfig": true,
  "eslint.validate": [
    "javascript",
    "typescript",
    "javascriptreact",
    "typescriptreact"
  ],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## Best Practices
1. Start with recommended configs
2. Add rules incrementally
3. Use --fix for auto-fixable issues
4. Document custom rules
5. Regular dependency updates
6. Monitor lint times
7. Use ignore patterns wisely
8. Separate concerns with multiple configs