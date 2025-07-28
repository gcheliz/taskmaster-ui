# Intelligent Auto-Implementation Workflow

This workflow implements tasks automatically with context awareness and quality checks.

## Usage

```bash
# Auto-implement next available task
/tm:workflows:auto-implement-tasks

# Auto-implement specific task
/tm:workflows:auto-implement-tasks --task-id=1.2 --tag=ui-modernization

# Auto-implement with specific strategy
/tm:workflows:auto-implement-tasks --strategy=feature|bug-fix|refactor

# Dry run mode (analyze without implementing)
/tm:workflows:auto-implement-tasks --dry-run
```

## Implementation Process

### Phase 1: Pre-Implementation Analysis

1. **Task Selection & Analysis**
   - Get next available task or specified task
   - Analyze task complexity and dependencies
   - Check if prerequisites are met
   - Estimate implementation time

2. **Context Gathering**
   - Scan related code files
   - Identify existing patterns
   - Check test coverage
   - Review similar completed tasks

3. **Risk Assessment**
   - Identify potential breaking changes
   - Check dependency impacts
   - Assess test requirements
   - Plan rollback strategy

### Phase 2: Implementation Strategy

Based on task type, apply appropriate strategy:

#### Feature Implementation
```
1. Design component/module structure
2. Create necessary files and directories
3. Implement core functionality
4. Add error handling and validation
5. Write comprehensive tests
6. Integrate with existing system
7. Update documentation
```

#### Bug Fix Implementation
```
1. Reproduce the issue
2. Add failing test case
3. Identify root cause
4. Implement minimal fix
5. Verify test passes
6. Check for regressions
7. Document the fix
```

#### Refactoring Implementation
```
1. Analyze current structure
2. Plan incremental changes
3. Ensure test coverage exists
4. Refactor in small steps
5. Run tests after each change
6. Update documentation
7. Clean up old code
```

### Phase 3: Progressive Implementation

```typescript
interface ImplementationStep {
  step: number;
  total: number;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  details?: string;
}

// Example progress tracking
const steps: ImplementationStep[] = [
  { step: 1, total: 5, description: "Setting up component structure", status: "completed" },
  { step: 2, total: 5, description: "Implementing core logic", status: "completed" },
  { step: 3, total: 5, description: "Adding error handling", status: "in-progress", details: "Adding try-catch blocks..." },
  { step: 4, total: 5, description: "Writing tests", status: "pending" },
  { step: 5, total: 5, description: "Integration testing", status: "pending" }
];
```

### Phase 4: Quality Assurance

Automated checks after each major step:

1. **Code Quality**
   - Run ESLint: `pnpm lint`
   - Type checking: `pnpm type-check`
   - Format code: `pnpm format`

2. **Test Execution**
   - Unit tests: `pnpm test`
   - Integration tests: `pnpm test:integration`
   - Coverage check: `pnpm test:coverage`

3. **Build Verification**
   - Development build: `pnpm build`
   - Production build: `pnpm build:prod`

### Phase 5: Smart Recovery

If implementation fails:

1. **Diagnostic Steps**
   - Capture error details
   - Analyze failure context
   - Check related systems

2. **Recovery Options**
   - Attempt automatic fix
   - Rollback to last working state
   - Suggest manual intervention
   - Create diagnostic report

### Phase 6: Post-Implementation

1. **Task Completion**
   - Update task status to 'done'
   - Update parent task if all subtasks complete
   - Commit changes with proper message

2. **Documentation**
   - Update relevant docs
   - Add implementation notes
   - Create PR description

3. **Follow-up Actions**
   - Suggest related tasks
   - Update task dependencies
   - Log lessons learned

## Implementation Script

```bash
#!/bin/bash
# Auto-implementation script skeleton

# Configuration
TASK_ID="${1:-}"
TAG="${2:-}"
STRATEGY="${3:-auto}"
DRY_RUN="${4:-false}"

# Functions
analyze_task() {
  echo "📋 Analyzing task..."
  task-master show "$TASK_ID" --tag="$TAG"
}

check_prerequisites() {
  echo "🔍 Checking prerequisites..."
  # Check dependencies, environment, etc.
}

implement_feature() {
  echo "🚀 Implementing feature..."
  # Feature implementation logic
}

implement_bugfix() {
  echo "🐛 Implementing bug fix..."
  # Bug fix implementation logic
}

implement_refactor() {
  echo "🔧 Implementing refactor..."
  # Refactoring implementation logic
}

run_quality_checks() {
  echo "✅ Running quality checks..."
  pnpm lint
  pnpm test
  pnpm type-check
}

update_task_status() {
  echo "📝 Updating task status..."
  task-master set-status --id="$TASK_ID" --status="done" --tag="$TAG"
}

# Main workflow
main() {
  analyze_task
  check_prerequisites
  
  case $STRATEGY in
    feature)
      implement_feature
      ;;
    bug-fix)
      implement_bugfix
      ;;
    refactor)
      implement_refactor
      ;;
    auto)
      # Auto-detect based on task analysis
      ;;
  esac
  
  run_quality_checks
  update_task_status
}

# Execute if not dry run
if [ "$DRY_RUN" = "false" ]; then
  main
else
  echo "🔍 Dry run mode - analysis only"
  analyze_task
fi
```

## Example Workflow Execution

```bash
# 1. Get next task
$ task-master next --tag=ui-modernization
Next task: 6.2 - Create reusable button component

# 2. Run auto-implementation
$ /tm:workflows:auto-implement-tasks --task-id=6.2 --tag=ui-modernization

📋 Analyzing task 6.2...
  Title: Create reusable button component
  Priority: High
  Dependencies: None
  Strategy: Feature implementation

🔍 Checking prerequisites...
  ✓ All dependencies satisfied
  ✓ Test framework available
  ✓ Component directory exists

🚀 Starting implementation...
  Step 1/5: Creating component structure... ✓
  Step 2/5: Implementing Button component... ✓
  Step 3/5: Adding prop types and variants... ✓
  Step 4/5: Writing unit tests... ✓
  Step 5/5: Updating component exports... ✓

✅ Running quality checks...
  Linting: ✓ No errors
  Tests: ✓ 12 passed
  Types: ✓ No errors

📝 Task completed successfully!
  Updated task 6.2 status to 'done'
  Committed changes: "[6.2] Create reusable button component"

💡 Suggested next steps:
  - Task 6.3: Implement button documentation
  - Task 6.4: Add button to component library
```

## Configuration

Create `.taskmaster/auto-implement.config.json`:

```json
{
  "strategies": {
    "feature": {
      "testFirst": true,
      "documentationRequired": true,
      "coverageThreshold": 80
    },
    "bug-fix": {
      "requiresReproduction": true,
      "minimalChanges": true,
      "regressionTests": true
    },
    "refactor": {
      "preserveBehavior": true,
      "incrementalChanges": true,
      "performanceCheck": true
    }
  },
  "quality": {
    "lintOnSave": true,
    "formatOnSave": true,
    "testBeforeCommit": true
  },
  "recovery": {
    "maxRetries": 3,
    "rollbackOnFailure": true,
    "createDiagnostics": true
  }
}
```

## Advanced Features

### Pattern Learning
The system learns from completed tasks:
- Successful implementation patterns
- Common error resolutions
- Optimal file structures
- Test strategies that work

### Intelligent Code Generation
- Uses existing patterns in codebase
- Follows team conventions
- Generates idiomatic code
- Maintains consistency

### Adaptive Strategies
- Adjusts based on task complexity
- Learns from failures
- Optimizes for success rate
- Improves over time

## Troubleshooting

### Common Issues

1. **Task not found**
   ```bash
   Error: Task 6.2 not found in tag 'ui-modernization'
   Solution: Verify task ID and tag with 'task-master list --tag=ui-modernization'
   ```

2. **Test failures**
   ```bash
   Error: Tests failed after implementation
   Solution: Review generated tests, check for environment issues
   ```

3. **Merge conflicts**
   ```bash
   Error: Cannot auto-merge changes
   Solution: Manual resolution required, check git status
   ```

### Debug Mode

Enable verbose logging:
```bash
/tm:workflows:auto-implement-tasks --debug --task-id=6.2
```

This provides detailed information about:
- Decision making process
- Code analysis results
- Implementation steps
- Error diagnostics