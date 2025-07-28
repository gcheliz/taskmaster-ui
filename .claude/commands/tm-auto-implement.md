# Auto-Implementation Command for Claude

This command enables Claude to automatically implement tasks with full context awareness.

## Usage in Claude

```
/tm:workflows:auto-implement-tasks
```

## What Claude Will Do

### 1. Task Analysis Phase
- Get the next pending task or use the specified task ID
- Analyze task requirements and complexity
- Check dependencies and prerequisites
- Determine the best implementation strategy

### 2. Context Gathering Phase
- Search for related code patterns
- Analyze similar completed tasks
- Review test coverage requirements
- Identify potential risks

### 3. Implementation Phase

Based on task type:

**For Feature Tasks:**
1. Research existing patterns in codebase
2. Design component/module architecture
3. Create necessary files
4. Implement core functionality
5. Add comprehensive error handling
6. Write unit and integration tests
7. Update documentation

**For Bug Fix Tasks:**
1. Reproduce the issue
2. Add failing test case
3. Debug to find root cause
4. Implement minimal fix
5. Verify test passes
6. Check for regressions
7. Document the fix

**For Refactoring Tasks:**
1. Analyze current implementation
2. Ensure test coverage exists
3. Plan incremental changes
4. Refactor step by step
5. Verify tests still pass
6. Clean up old code
7. Update documentation

### 4. Quality Assurance Phase
- Run ESLint checks
- Execute all tests
- Verify type safety
- Check build process
- Validate functionality

### 5. Task Completion Phase
- Update task status to 'done'
- Commit changes with proper message format: `[task-id] Task description`
- Update parent task if all subtasks complete
- Suggest next task

## Example Implementation Flow

When you run `/tm:workflows:auto-implement-tasks`, Claude will:

```
🤖 Starting Auto-Implementation Workflow
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Getting next task...
   Found: Task 6.2 - Create reusable button component
   Tag: ui-modernization
   Priority: High
   
🔍 Analyzing task requirements...
   Type: Feature implementation
   Complexity: Medium
   Dependencies: None
   
📂 Scanning codebase for patterns...
   Found 5 similar component implementations
   Identified testing patterns
   Located style conventions
   
🚀 Starting implementation...

Step 1/6: Creating component structure
   ✓ Created src/components/ui/Button/Button.tsx
   ✓ Created src/components/ui/Button/Button.test.tsx
   ✓ Created src/components/ui/Button/index.ts
   
Step 2/6: Implementing Button component
   ✓ Added TypeScript interfaces
   ✓ Implemented base component
   ✓ Added variant support
   ✓ Added size options
   
Step 3/6: Adding accessibility features
   ✓ Added ARIA attributes
   ✓ Implemented keyboard navigation
   ✓ Added focus management
   
Step 4/6: Writing tests
   ✓ Unit tests: 15 passing
   ✓ Accessibility tests: 3 passing
   ✓ Integration tests: 2 passing
   
Step 5/6: Running quality checks
   ✓ ESLint: No errors
   ✓ TypeScript: No errors
   ✓ Tests: All passing
   ✓ Build: Success
   
Step 6/6: Finalizing task
   ✓ Updated exports
   ✓ Added to component index
   ✓ Generated documentation
   
📝 Committing changes...
   ✓ Committed: [6.2] Create reusable button component
   
✅ Task completed successfully!

💡 Next suggested task: 6.3 - Implement button documentation
   Run: /tm:workflows:auto-implement-tasks
```

## Implementation Guidelines

### Code Quality Standards
- Follow existing code patterns
- Maintain consistent naming conventions
- Add comprehensive JSDoc comments
- Include proper TypeScript types
- Ensure accessibility compliance

### Testing Requirements
- Minimum 80% code coverage
- Include unit tests for all functions
- Add integration tests for features
- Test error scenarios
- Verify accessibility

### Documentation Standards
- Update component documentation
- Add usage examples
- Document props and methods
- Include migration guides if needed

## Configuration

The workflow respects settings in `CLAUDE.md`:

```markdown
## Auto-Implementation Rules
- Always run tests before marking task complete
- Use pnpm (never npm)
- Follow existing code patterns
- Commit with format: [task-id] Description
- Update task status progressively
```

## Advanced Features

### Smart Pattern Recognition
Claude will:
- Learn from existing code patterns
- Use team's preferred libraries
- Match coding style automatically
- Suggest improvements based on best practices

### Progressive Implementation
- Implements in small, testable chunks
- Validates each step before proceeding
- Can rollback if issues occur
- Provides detailed progress updates

### Context Awareness
- Understands project structure
- Knows about dependencies
- Aware of testing requirements
- Considers performance implications

## Troubleshooting

### If Implementation Fails

Claude will:
1. Diagnose the issue
2. Attempt automatic recovery
3. Rollback if necessary
4. Provide detailed error report
5. Suggest manual fixes

### Common Issues

**Test Failures**
- Claude will analyze failing tests
- Attempt to fix implementation
- Add missing test cases
- Ensure all tests pass

**Lint Errors**
- Auto-fix formatting issues
- Resolve type errors
- Update imports
- Clean up unused code

**Build Errors**
- Check dependencies
- Fix import paths
- Resolve type conflicts
- Verify build configuration

## Command Variations

```bash
# Auto-implement with specific task
/tm:workflows:auto-implement-tasks --task-id=6.2 --tag=ui-modernization

# Dry run (analyze only)
/tm:workflows:auto-implement-tasks --dry-run

# Force specific strategy
/tm:workflows:auto-implement-tasks --strategy=bug-fix

# Skip tests (not recommended)
/tm:workflows:auto-implement-tasks --skip-tests

# Verbose mode
/tm:workflows:auto-implement-tasks --verbose
```

## Integration with Task Master

The workflow integrates seamlessly with task-master CLI:
- Reads task details from `.taskmaster/tasks/tasks.json`
- Updates task status in real-time
- Handles subtasks correctly
- Maintains task relationships
- Updates progress metrics

## Best Practices

1. **Always verify prerequisites** before starting
2. **Implement incrementally** with validation
3. **Write tests first** when possible
4. **Document as you go** for clarity
5. **Commit frequently** with clear messages
6. **Review changes** before marking complete

This workflow enables efficient, high-quality task implementation with minimal manual intervention.