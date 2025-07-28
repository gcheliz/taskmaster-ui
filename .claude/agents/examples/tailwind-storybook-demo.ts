#!/usr/bin/env ts-node

/**
 * Example: Tailwind CSS and Storybook Integration
 * 
 * Demonstrates generating styled components with automatic
 * Storybook story generation
 */

import { componentDevelopmentAgent } from '../frontend-agents/component-development-core';

async function demonstrateTailwindStorybookIntegration() {
  console.log('🎨 Tailwind CSS & 📚 Storybook Integration Demo\n');

  try {
    // Example 1: Styled Button with variants
    console.log('1️⃣ Generating styled Button atom with variants...');
    await componentDevelopmentAgent.generateComponent({
      name: 'ActionButton',
      type: 'atom',
      description: 'Versatile action button with multiple variants and sizes',
      props: [
        { name: 'label', type: 'string', required: true, description: 'Button text' },
        { name: 'onClick', type: '() => void', required: true, description: 'Click handler' },
        { name: 'variant', type: "'primary' | 'secondary' | 'danger' | 'success' | 'ghost'", required: false, defaultValue: "'primary'" },
        { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", required: false, defaultValue: "'md'" },
        { name: 'loading', type: 'boolean', required: false, description: 'Show loading spinner' },
        { name: 'disabled', type: 'boolean', required: false, description: 'Disable button' },
        { name: 'fullWidth', type: 'boolean', required: false, description: 'Full width button' },
        { name: 'icon', type: 'React.ReactNode', required: false, description: 'Icon to display' },
      ],
      styling: {
        variant: 'primary',
        size: 'md',
        rounded: true,
      },
      accessibility: {
        ariaLabel: true,
        keyboard: true,
      },
      stories: [
        {
          name: 'WithIcon',
          args: { 
            label: 'Save Changes',
            icon: '<SaveIcon />',
          },
          description: 'Button with an icon',
        },
        {
          name: 'LoadingState',
          args: { 
            label: 'Processing...',
            loading: true,
            disabled: true,
          },
          description: 'Button in loading state',
        },
      ],
    });

    console.log('✅ Generated ActionButton with:');
    console.log('   - Tailwind styling (primary variant, medium size, rounded)');
    console.log('   - 5 variant stories (primary, secondary, danger, success, ghost)');
    console.log('   - 5 size stories (xs, sm, md, lg, xl)');
    console.log('   - Custom stories (WithIcon, LoadingState)');
    console.log('   - Full accessibility support');
    console.log('\n---\n');

    // Example 2: Styled Card with elevation
    console.log('2️⃣ Generating FeatureCard molecule with elevation...');
    await componentDevelopmentAgent.generateComponent({
      name: 'FeatureCard',
      type: 'molecule',
      description: 'Feature showcase card with icon and hover effects',
      props: [
        { name: 'title', type: 'string', required: true, description: 'Feature title' },
        { name: 'description', type: 'string', required: true, description: 'Feature description' },
        { name: 'icon', type: 'React.ReactNode', required: false, description: 'Feature icon' },
        { name: 'href', type: 'string', required: false, description: 'Link URL' },
        { name: 'highlighted', type: 'boolean', required: false, description: 'Highlight card' },
      ],
      children: true,
      styling: {
        elevation: 2,
        rounded: true,
      },
      accessibility: {
        role: 'article',
        ariaLabel: true,
      },
    });

    console.log('✅ Generated FeatureCard with:');
    console.log('   - Tailwind card styling (elevation shadow, rounded corners)');
    console.log('   - Dark mode support');
    console.log('   - Hover effects');
    console.log('   - Auto-generated Storybook stories');
    console.log('\n---\n');

    // Example 3: Form Input with validation states
    console.log('3️⃣ Generating FormInput atom with validation states...');
    await componentDevelopmentAgent.generateComponent({
      name: 'FormInput',
      type: 'atom',
      description: 'Form input with validation and error states',
      props: [
        { name: 'label', type: 'string', required: true, description: 'Input label' },
        { name: 'value', type: 'string', required: true, description: 'Input value' },
        { name: 'onChange', type: '(value: string) => void', required: true, description: 'Change handler' },
        { name: 'type', type: "'text' | 'email' | 'password' | 'number'", required: false, defaultValue: "'text'" },
        { name: 'placeholder', type: 'string', required: false, description: 'Placeholder text' },
        { name: 'error', type: 'string', required: false, description: 'Error message' },
        { name: 'disabled', type: 'boolean', required: false, description: 'Disable input' },
        { name: 'required', type: 'boolean', required: false, description: 'Required field' },
      ],
      styling: {
        size: 'md',
      },
      stories: [
        {
          name: 'WithError',
          args: {
            label: 'Email',
            value: 'invalid-email',
            error: 'Please enter a valid email address',
          },
          description: 'Input showing error state',
        },
        {
          name: 'Required',
          args: {
            label: 'Username',
            value: '',
            required: true,
            placeholder: 'Enter your username',
          },
          description: 'Required input field',
        },
      ],
    });

    console.log('✅ Generated FormInput with:');
    console.log('   - Tailwind input styling');
    console.log('   - Focus states and transitions');
    console.log('   - Error state styling');
    console.log('   - Storybook stories for all states');
    console.log('\n---\n');

    // Example 4: Layout Grid component
    console.log('4️⃣ Generating responsive GridLayout molecule...');
    await componentDevelopmentAgent.generateComponent({
      name: 'GridLayout',
      type: 'molecule',
      description: 'Responsive grid layout with configurable columns',
      props: [
        { name: 'cols', type: '{ sm?: number; md?: number; lg?: number }', required: true, description: 'Column configuration' },
        { name: 'gap', type: "'2' | '4' | '6' | '8'", required: false, defaultValue: "'4'" },
        { name: 'className', type: 'string', required: false, description: 'Additional classes' },
      ],
      children: true,
    });

    console.log('✅ Generated GridLayout with:');
    console.log('   - Responsive Tailwind grid classes');
    console.log('   - Breakpoint-specific column configuration');
    console.log('   - Gap spacing options');
    console.log('   - Storybook stories showing different layouts');
    console.log('\n---\n');

    // Summary
    console.log('🎉 Integration demo complete!\n');
    console.log('📊 Summary of features demonstrated:');
    console.log('✅ Tailwind CSS Integration:');
    console.log('   - Design tokens and utility classes');
    console.log('   - Variant-based styling');
    console.log('   - Responsive design');
    console.log('   - Dark mode support');
    console.log('   - Accessibility classes');
    
    console.log('\n✅ Storybook Integration:');
    console.log('   - Automatic story generation');
    console.log('   - Control inference from prop types');
    console.log('   - Variant stories for all options');
    console.log('   - Custom story definitions');
    console.log('   - Interactive playground story');
    console.log('   - Documentation and descriptions');

    console.log('\n💡 All components are production-ready with:');
    console.log('   - TypeScript types');
    console.log('   - Tailwind styling');
    console.log('   - Storybook stories');
    console.log('   - Unit tests');
    console.log('   - Accessibility features');
    console.log('   - Documentation');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the demo
demonstrateTailwindStorybookIntegration();