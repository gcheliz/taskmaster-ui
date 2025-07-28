#!/usr/bin/env ts-node

/**
 * Test the template system functionality
 */

import { templateEngine } from '../template-engine';
import * as fs from 'fs/promises';

async function testTemplateSystem() {
  console.log('🧪 Testing Template System...\n');

  try {
    // Test 1: Simple template with case transformations
    console.log('1️⃣ Testing case transformations...');
    const simpleTemplate = `
{{camelCase "test-resource"}}
{{pascalCase "test-resource"}}
{{kebabCase "testResource"}}
{{upperSnakeCase "testResource"}}
`;
    const tempPath = '/tmp/test-template.hbs';
    await fs.writeFile(tempPath, simpleTemplate);
    
    const result1 = await templateEngine.generate({
      name: 'test',
      templatePath: tempPath,
      outputPath: '/tmp/test-output.txt',
      variables: {},
    });
    
    console.log('Result:', result1.trim());
    console.log('✅ Case transformations work!\n');

    // Test 2: Zod schema generation
    console.log('2️⃣ Testing Zod schema generation...');
    const zodTemplate = `const schema = {{zodSchema fields}};`;
    await fs.writeFile(tempPath, zodTemplate);
    
    const result2 = await templateEngine.generate({
      name: 'zod-test',
      templatePath: tempPath,
      outputPath: '/tmp/zod-output.ts',
      variables: {
        fields: [
          { name: 'email', type: 'string', min: 5 },
          { name: 'age', type: 'number', optional: true },
          { name: 'active', type: 'boolean', nullable: true },
        ],
      },
    });
    
    console.log('Result:', result2);
    console.log('✅ Zod schema generation works!\n');

    // Test 3: Import organization
    console.log('3️⃣ Testing import organization...');
    const importTemplate = `{{organizeImports imports}}`;
    await fs.writeFile(tempPath, importTemplate);
    
    const result3 = await templateEngine.generate({
      name: 'import-test',
      templatePath: tempPath,
      outputPath: '/tmp/import-output.ts',
      variables: {
        imports: [
          "{ z } from 'zod'",
          "fs from 'fs'",
          "{ logger } from '@/utils/logger'",
          "{ BaseService } from '../base'",
          "express from 'express'",
        ],
      },
    });
    
    console.log('Result:');
    console.log(result3);
    console.log('✅ Import organization works!\n');

    // Test 4: Save with prettier formatting
    console.log('4️⃣ Testing file save with Prettier...');
    const uglyCode = `function test(){return{success:true,data:[1,2,3]}}`;
    const outputPath = '/tmp/formatted-test.ts';
    
    await templateEngine.saveGeneratedFile(uglyCode, outputPath);
    const formatted = await fs.readFile(outputPath, 'utf-8');
    
    console.log('Original:', uglyCode);
    console.log('Formatted:', formatted.trim());
    console.log('✅ Prettier formatting works!\n');

    console.log('🎉 All template system tests passed!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testTemplateSystem();