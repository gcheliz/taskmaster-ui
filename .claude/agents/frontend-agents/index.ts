/**
 * Frontend Development Agents
 * 
 * Collection of agents for React component development,
 * state management, and frontend tooling
 */

export { ComponentDevelopmentAgent, componentDevelopmentAgent } from './component-development-core';
export type { ComponentGenerationOptions, ComponentProp, AccessibilityOptions } from './component-development-core';

// Tailwind CSS Integration
export { TailwindIntegration, tailwindIntegration } from './tailwind-integration';
export type { DesignTokens, TailwindStyleOptions } from './tailwind-integration';

// Storybook Story Generator
export { StorybookGenerator, storybookGenerator } from './storybook-generator';
export type { StoryGenerationOptions, StoryVariant, ArgTypeConfig } from './storybook-generator';

// State Management Agent
export { StateManagementAgent, stateManagementAgent } from './state-management-agent';
export type { 
  QueryHookOptions, 
  QueryParam, 
  CachingOptions,
  ContextProviderOptions,
  StateField,
  WebSocketOptions,
  WebSocketEvent
} from './state-management-agent';

// Accessibility Compliance
export { AccessibilityCompliance, accessibilityCompliance } from './accessibility-compliance';
export type { 
  AccessibilityEnhancements,
  AriaAttributes,
  KeyboardSupport,
  FocusManagement,
  SemanticHTML,
  ScreenReaderSupport,
  ColorContrastValidation
} from './accessibility-compliance';

/**
 * Frontend agent command handlers
 */
export const frontendCommands = {
  '/component': 'Generate a new React component following atomic design',
  '/hook': 'Generate a custom React hook',
  '/query': 'Generate TanStack Query hooks for API integration',
  '/context': 'Generate React Context provider for state management',
  '/websocket': 'Generate WebSocket connection manager',
  '/story': 'Generate Storybook story for a component',
} as const;

/**
 * Initialize all frontend agents
 */
export function initializeFrontendAgents(projectRoot: string): void {
  console.log('🎨 Initializing Frontend Development Agents...');
  console.log('✅ Component Development Agent ready');
  console.log('✅ State Management Agent ready');
  console.log('📚 Available commands:', Object.keys(frontendCommands).join(', '));
}