#!/usr/bin/env ts-node

/**
 * Example: Using the Component Development Agent
 * 
 * This example demonstrates how to generate React components
 * following atomic design principles
 */

import { componentDevelopmentAgent } from '../frontend-agents/component-development-core';

async function demonstrateComponentGeneration() {
  console.log('🧩 Component Development Agent Demo\n');

  try {
    // Example 1: Generate a Button atom
    console.log('1️⃣ Generating Button atom...');
    const buttonResult = await componentDevelopmentAgent.generateComponent({
      name: 'ButtonPrimary',
      type: 'atom',
      description: 'Primary button component with loading state',
      props: [
        { name: 'label', type: 'string', required: true, description: 'Button text' },
        { name: 'onClick', type: '() => void', required: true, description: 'Click handler' },
        { name: 'loading', type: 'boolean', required: false, description: 'Loading state' },
        { name: 'disabled', type: 'boolean', required: false, description: 'Disabled state' },
        { name: 'size', type: "'small' | 'medium' | 'large'", required: false, defaultValue: "'medium'" },
      ],
      accessibility: {
        ariaLabel: true,
        keyboard: true,
      },
    });

    console.log('✅ Generated files:');
    buttonResult.files.forEach(file => console.log(`   - ${file}`));
    console.log('\n📝 Documentation:');
    console.log(buttonResult.documentation);
    console.log('\n---\n');

    // Example 2: Generate a Card molecule with children
    console.log('2️⃣ Generating Card molecule...');
    await componentDevelopmentAgent.generateComponent({
      name: 'Card',
      type: 'molecule',
      description: 'Flexible card component for content display',
      props: [
        { name: 'title', type: 'string', required: true, description: 'Card title' },
        { name: 'subtitle', type: 'string', required: false, description: 'Optional subtitle' },
        { name: 'elevation', type: 'number', required: false, defaultValue: '1' },
        { name: 'onClick', type: '() => void', required: false, description: 'Make card clickable' },
      ],
      children: true,
      accessibility: {
        role: 'article',
        ariaLabel: true,
      },
    });

    console.log('✅ Generated Card component with children support');
    console.log('\n---\n');

    // Example 3: Generate a UserProfile organism with hooks
    console.log('3️⃣ Generating UserProfile organism...');
    await componentDevelopmentAgent.generateComponent({
      name: 'UserProfile',
      type: 'organism',
      description: 'Complete user profile display with data fetching',
      props: [
        { name: 'userId', type: 'string', required: true, description: 'User ID to display' },
        { name: 'showActions', type: 'boolean', required: false, defaultValue: 'true' },
      ],
      hooks: ['User', 'Auth'],
      dependencies: ['@/services/userService', '@/utils/formatters'],
      accessibility: {
        ariaLabel: true,
        focusManagement: true,
      },
    });

    console.log('✅ Generated UserProfile with data hooks');
    console.log('\n---\n');

    // Example 4: Parse command-line style input
    console.log('4️⃣ Parsing command-line input...');
    const command = '/component SearchBar molecule --props "value:string:required,onChange:()=>void:required,placeholder:string" --children --aria';
    const parsed = componentDevelopmentAgent.parseCommand(command);
    
    if (parsed) {
      console.log('📋 Parsed command:');
      console.log(JSON.stringify(parsed, null, 2));
      
      // Generate from parsed command
      await componentDevelopmentAgent.generateComponent(parsed);
      console.log('\n✅ Generated SearchBar from command');
    }

    console.log('\n🎉 Component generation demo complete!');
    
    // Summary
    console.log('\n📊 Summary:');
    console.log('- Generated Button atom with accessibility');
    console.log('- Generated Card molecule with children');
    console.log('- Generated UserProfile organism with hooks');
    console.log('- Parsed and executed command-line input');
    console.log('\n💡 All components follow atomic design principles and include:');
    console.log('   - TypeScript types');
    console.log('   - CSS modules');
    console.log('   - Unit tests');
    console.log('   - Storybook stories');
    console.log('   - Accessibility features');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the demo
demonstrateComponentGeneration();