// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'

export default tseslint.config([
  {
    ignores: [
      'dist/**',
      'storybook-static/**', 
      'node_modules/**',
      '**/*.min.js',
      '**/*.bundle.js',
      '.vite/**',
      'coverage/**',
      'src/__tests__.disabled/**',
      'src/stories/**'
    ]
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    plugins: {
      'react': react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-control-regex': 'warn',
      // Deprecate React.FC usage
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSTypeReference[typeName.name="FC"], TSTypeReference[typeName.left.name="React"][typeName.right.name="FC"]',
          message: 'Avoid using React.FC. Use explicit typing for props instead.'
        },
        {
          selector: 'TSTypeReference[typeName.name="FunctionComponent"], TSTypeReference[typeName.left.name="React"][typeName.right.name="FunctionComponent"]',
          message: 'Avoid using React.FunctionComponent. Use explicit typing for props instead.'
        }
      ],
      // Additional React best practices
      'react/function-component-definition': ['error', {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function'
      }],
      'react/jsx-no-useless-fragment': 'error',
      'react/self-closing-comp': 'error',
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  ...storybook.configs["flat/recommended"] || []
]);
