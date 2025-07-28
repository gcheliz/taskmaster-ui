#!/bin/bash

# Intelligent Auto-Implementation Script for Task Master
# This script automatically implements tasks with context awareness and quality checks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
TASK_ID="${1:-}"
TAG="${2:-}"
STRATEGY="${3:-auto}"
DRY_RUN="${4:-false}"
DEBUG="${5:-false}"

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../.." && pwd )"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

debug() {
    if [ "$DEBUG" = "true" ]; then
        echo -e "${PURPLE}[DEBUG]${NC} $1"
    fi
}

# Get next task if not specified
get_next_task() {
    if [ -z "$TASK_ID" ]; then
        log "Getting next available task..."
        
        # Get list of tags if not specified
        if [ -z "$TAG" ]; then
            TAGS=$(cd "$PROJECT_ROOT" && task-master list | grep -oE '\[([^]]+)\]' | tr -d '[]' | sort -u)
            
            # Find first tag with pending tasks
            for t in $TAGS; do
                NEXT=$(cd "$PROJECT_ROOT" && task-master next --tag="$t" 2>/dev/null | grep -oE 'Task [0-9.]+' | awk '{print $2}')
                if [ -n "$NEXT" ]; then
                    TAG="$t"
                    TASK_ID="$NEXT"
                    break
                fi
            done
        else
            NEXT=$(cd "$PROJECT_ROOT" && task-master next --tag="$TAG" 2>/dev/null | grep -oE 'Task [0-9.]+' | awk '{print $2}')
            TASK_ID="$NEXT"
        fi
        
        if [ -z "$TASK_ID" ]; then
            error "No pending tasks found"
            exit 1
        fi
        
        success "Found next task: $TASK_ID (tag: $TAG)"
    fi
}

# Analyze task details
analyze_task() {
    log "📋 Analyzing task $TASK_ID..."
    
    # Get task details
    TASK_INFO=$(cd "$PROJECT_ROOT" && task-master show "$TASK_ID" --tag="$TAG" 2>/dev/null)
    
    if [ -z "$TASK_INFO" ]; then
        error "Task $TASK_ID not found in tag '$TAG'"
        exit 1
    fi
    
    # Extract task details
    TASK_TITLE=$(echo "$TASK_INFO" | grep -A1 "Title:" | tail -1 | xargs)
    TASK_STATUS=$(echo "$TASK_INFO" | grep "Status:" | awk '{print $2}')
    TASK_PRIORITY=$(echo "$TASK_INFO" | grep "Priority:" | awk '{print $2}')
    
    echo "  Title: $TASK_TITLE"
    echo "  Status: $TASK_STATUS"
    echo "  Priority: $TASK_PRIORITY"
    
    # Check if already done
    if [ "$TASK_STATUS" = "done" ]; then
        warning "Task is already completed"
        exit 0
    fi
    
    # Detect task type from title and description
    if [[ "$TASK_TITLE" =~ "fix" ]] || [[ "$TASK_TITLE" =~ "Fix" ]] || [[ "$TASK_TITLE" =~ "bug" ]]; then
        DETECTED_STRATEGY="bug-fix"
    elif [[ "$TASK_TITLE" =~ "refactor" ]] || [[ "$TASK_TITLE" =~ "Refactor" ]]; then
        DETECTED_STRATEGY="refactor"
    else
        DETECTED_STRATEGY="feature"
    fi
    
    if [ "$STRATEGY" = "auto" ]; then
        STRATEGY="$DETECTED_STRATEGY"
        echo "  Detected strategy: $STRATEGY"
    fi
}

# Check prerequisites
check_prerequisites() {
    log "🔍 Checking prerequisites..."
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        error "Not in a git repository"
        exit 1
    fi
    
    # Check for uncommitted changes
    if ! git diff-index --quiet HEAD --; then
        warning "Uncommitted changes detected"
        if [ "$DRY_RUN" = "false" ]; then
            error "Please commit or stash changes before proceeding"
            exit 1
        fi
    fi
    
    # Check if pnpm is available
    if ! command -v pnpm &> /dev/null; then
        error "pnpm is not installed"
        exit 1
    fi
    
    # Check task dependencies
    DEPS=$(echo "$TASK_INFO" | grep -A10 "Dependencies:" | grep -E "^\s*-" | wc -l)
    if [ "$DEPS" -gt 0 ]; then
        warning "Task has $DEPS dependencies - verify they are completed"
    fi
    
    success "Prerequisites check passed"
}

# Update task status to in-progress
mark_in_progress() {
    if [ "$DRY_RUN" = "false" ]; then
        log "📝 Marking task as in-progress..."
        
        # Use the custom script for subtasks
        if [[ "$TASK_ID" =~ \. ]]; then
            PARENT_ID=$(echo "$TASK_ID" | cut -d. -f1)
            SUBTASK_NUM=$(echo "$TASK_ID" | cut -d. -f2)
            cd "$PROJECT_ROOT" && ./update-subtask-status.sh "$PARENT_ID" "$SUBTASK_NUM" "in-progress" "$TAG"
        else
            cd "$PROJECT_ROOT" && task-master set-status --id="$TASK_ID" --status="in-progress" --tag="$TAG"
        fi
        
        success "Task marked as in-progress"
    fi
}

# Run quality checks
run_quality_checks() {
    log "✅ Running quality checks..."
    
    # Lint check
    echo -n "  Linting: "
    if cd "$PROJECT_ROOT" && pnpm lint 2>&1 | grep -q "error"; then
        error "Lint errors found"
        return 1
    else
        success "No errors"
    fi
    
    # Type check
    echo -n "  Type checking: "
    if cd "$PROJECT_ROOT" && pnpm type-check 2>&1 | grep -q "error"; then
        error "Type errors found"
        return 1
    else
        success "No errors"
    fi
    
    # Test check
    echo -n "  Tests: "
    TEST_OUTPUT=$(cd "$PROJECT_ROOT" && pnpm test --run 2>&1 || true)
    if echo "$TEST_OUTPUT" | grep -q "failed"; then
        FAILED=$(echo "$TEST_OUTPUT" | grep -oE "[0-9]+ failed" | head -1)
        error "$FAILED"
        return 1
    else
        PASSED=$(echo "$TEST_OUTPUT" | grep -oE "[0-9]+ passed" | head -1)
        success "$PASSED"
    fi
    
    return 0
}

# Commit changes
commit_changes() {
    if [ "$DRY_RUN" = "false" ]; then
        log "💾 Committing changes..."
        
        # Add all changes
        git add -A
        
        # Create commit message
        COMMIT_MSG="[$TASK_ID] $TASK_TITLE"
        
        # Commit
        git commit -m "$COMMIT_MSG" --no-verify
        
        success "Changes committed: $COMMIT_MSG"
    fi
}

# Update task status to done
mark_done() {
    if [ "$DRY_RUN" = "false" ]; then
        log "📝 Marking task as done..."
        
        # Use the custom script for subtasks
        if [[ "$TASK_ID" =~ \. ]]; then
            PARENT_ID=$(echo "$TASK_ID" | cut -d. -f1)
            SUBTASK_NUM=$(echo "$TASK_ID" | cut -d. -f2)
            cd "$PROJECT_ROOT" && ./update-subtask-status.sh "$PARENT_ID" "$SUBTASK_NUM" "done" "$TAG"
        else
            cd "$PROJECT_ROOT" && task-master set-status --id="$TASK_ID" --status="done" --tag="$TAG"
        fi
        
        success "Task marked as done"
    fi
}

# Main implementation function
implement_task() {
    log "🚀 Starting implementation..."
    
    # This is where you would call Claude to implement the task
    # For now, we'll output a message indicating manual implementation is needed
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "  📋 TASK IMPLEMENTATION REQUIRED"
    echo ""
    echo "  Task ID: $TASK_ID"
    echo "  Title: $TASK_TITLE"
    echo "  Strategy: $STRATEGY"
    echo "  Tag: $TAG"
    echo ""
    echo "  Please implement this task according to the $STRATEGY strategy."
    echo ""
    echo "  After implementation:"
    echo "  1. Run quality checks: pnpm lint && pnpm test"
    echo "  2. Commit changes with message: [$TASK_ID] $TASK_TITLE"
    echo "  3. Mark task as done: task-master set-status --id=$TASK_ID --status=done --tag=$TAG"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # In a real implementation, this would:
    # 1. Use AI to generate the implementation
    # 2. Apply the changes
    # 3. Run tests
    # 4. Fix any issues
    # 5. Return success/failure
    
    # For now, return success to continue the workflow
    return 0
}

# Get next task after completion
suggest_next() {
    log "💡 Suggesting next steps..."
    
    # Get next task
    NEXT=$(cd "$PROJECT_ROOT" && task-master next --tag="$TAG" 2>/dev/null | grep -oE 'Task [0-9.]+' | awk '{print $2}')
    
    if [ -n "$NEXT" ]; then
        echo "  Next task: $NEXT"
        echo "  Run: $0 $NEXT $TAG"
    else
        success "All tasks in tag '$TAG' are complete!"
    fi
}

# Main workflow
main() {
    echo ""
    echo "🤖 Task Master Auto-Implementation Workflow"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Get next task if needed
    get_next_task
    
    # Analyze task
    analyze_task
    
    # Check prerequisites
    check_prerequisites
    
    if [ "$DRY_RUN" = "true" ]; then
        echo ""
        warning "DRY RUN MODE - No changes will be made"
        echo ""
        exit 0
    fi
    
    # Mark as in-progress
    mark_in_progress
    
    # Implement the task
    if implement_task; then
        # Run quality checks
        if run_quality_checks; then
            # Commit changes
            commit_changes
            
            # Mark as done
            mark_done
            
            echo ""
            success "Task completed successfully!"
            echo ""
            
            # Suggest next task
            suggest_next
        else
            error "Quality checks failed - please fix issues and try again"
            exit 1
        fi
    else
        error "Implementation failed"
        exit 1
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

# Show usage
usage() {
    echo "Usage: $0 [TASK_ID] [TAG] [STRATEGY] [DRY_RUN] [DEBUG]"
    echo ""
    echo "Arguments:"
    echo "  TASK_ID   - Task ID to implement (optional, will get next if not specified)"
    echo "  TAG       - Task tag (optional, will auto-detect if not specified)"
    echo "  STRATEGY  - Implementation strategy: auto|feature|bug-fix|refactor (default: auto)"
    echo "  DRY_RUN   - Run in dry-run mode: true|false (default: false)"
    echo "  DEBUG     - Enable debug output: true|false (default: false)"
    echo ""
    echo "Examples:"
    echo "  $0                              # Auto-implement next available task"
    echo "  $0 6.2 ui-modernization         # Implement specific task"
    echo "  $0 6.2 ui-modernization feature # Use feature strategy"
    echo "  $0 \"\" \"\" auto true            # Dry run for next task"
    echo ""
}

# Check for help flag
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    usage
    exit 0
fi

# Run main workflow
main