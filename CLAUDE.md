# Task Master AI - Claude Code Integration Guide

## Essential Commands

### Core Workflow Commands

```bash
# Project Setup
task-master init                                    # Initialize Task Master in current project
task-master parse-prd .taskmaster/docs/prd.txt      # Generate tasks from PRD document
task-master models --setup                        # Configure AI models interactively

# Daily Development Workflow
task-master list                                   # Show all tasks with status
task-master next                                   # Get next available task to work on
task-master show <id>                             # View detailed task information (e.g., task-master show 1.2)
task-master set-status --id=<id> --status=done    # Mark task complete

# Task Management
task-master add-task --prompt="description" --research --append    # Add new task with AI assistance
task-master expand --id=<id> --research --force              # Break task into subtasks
task-master update-task --id=<id> --prompt="changes"         # Update specific task
task-master update --from=<id> --prompt="changes"            # Update multiple tasks from ID onwards
task-master update-subtask --id=<id> --prompt="notes"        # Add implementation notes to subtask

# Analysis & Planning
task-master analyze-complexity --research          # Analyze task complexity
task-master complexity-report                      # View complexity analysis
task-master expand --all --research               # Expand all eligible tasks

# Dependencies & Organization
task-master add-dependency --id=<id> --depends-on=<id>       # Add task dependency
task-master move --from=<id> --to=<id>                       # Reorganize task hierarchy
task-master validate-dependencies                            # Check for dependency issues
task-master generate                                         # Update task markdown files (usually auto-called)
```

## Key Files & Project Structure

### Core Files

- `.taskmaster/tasks/tasks.json` - Main task data file (auto-managed)
- `.taskmaster/config.json` - AI model configuration (use `task-master models` to modify)
- `.taskmaster/docs/prd.txt` - Product Requirements Document for parsing
- `.taskmaster/tasks/*.txt` - Individual task files (auto-generated from tasks.json)
- `.env` - API keys for CLI usage

### Claude Code Integration Files

- `CLAUDE.md` - Auto-loaded context for Claude Code (this file)
- `.claude/settings.json` - Claude Code tool allowlist and preferences
- `.claude/commands/` - Custom slash commands for repeated workflows
- `.mcp.json` - MCP server configuration (project-specific)

### Directory Structure

```
project/
├── .taskmaster/
│   ├── tasks/              # Task files directory
│   │   ├── tasks.json      # Main task database
│   │   ├── task-1.md      # Individual task files
│   │   └── task-2.md
│   ├── docs/              # Documentation directory
│   │   ├── prd.txt        # Product requirements
│   ├── reports/           # Analysis reports directory
│   │   └── task-complexity-report.json
│   ├── templates/         # Template files
│   │   └── example_prd.txt  # Example PRD template
│   └── config.json        # AI models & settings
├── .claude/
│   ├── settings.json      # Claude Code configuration
│   └── commands/         # Custom slash commands
├── .env                  # API keys
├── .mcp.json            # MCP configuration
└── CLAUDE.md            # This file - auto-loaded by Claude Code
```

## Workflow Memories and Critical Guidelines

### Task Status Management Guidelines

- **CRITICAL**: Always check task status before starting work and after completing work
- **IMPORTANT**: Use `task-master list` and `task-master show <id>` to verify current task status
- **IMPORTANT**: Update task status immediately after completion with `task-master set-status --id=<id> --status=done`
- **IMPORTANT**: When all subtasks are done, mark the parent task as done
- **CRITICAL**: Regularly sync task status to avoid working on already completed tasks

### Critical Development Guidelines

- **CRITICAL**: Never finish a task or subtask if the complete tests and checks passing successful (Allow warnings).
- **CRITICAL** This project uses PNPM exclusively. NEVER use npm commands. Always use pnpm commands instead:
  - Use `pnpm install` instead of `npm install`
  - Use `pnpm add` instead of `npm add`
  - Use `pnpm run` instead of `npm run`
  - Use `pnpm exec` instead of `npx`
  - All package management must be done through pnpm to avoid dependency conflicts and warnings
- **CRITICAL** Perform the subtask expansion always in batches, try generating 5 in parallel.
- **CRITICAL** When you finish a subtask, execute the complete checks and tests and if there are any error fix it and
  NEVER continue to the next task if the tests are showing errors. Doesn't matter if the error is not related with the
  task changes. Commit the changes after the tests and checks does not return any error and continue to the next task.

### Command Execution Memories

- **IMPORTANT** Always update the project CLAUDE.md file when you execute a wrong command and then find the right one to
  execute for always keeping into the CLAUDE.md file the right environment command execution
- **LEARNED** Task status can become outdated in TaskMaster. Always verify current status before starting work

### Critical Execution Rules

- **IMPORTANT** NEVER FINISH A TASK OR SUBTASK IF IT'S ANY TEST OR CHECK ARE FAILING. THE CONDITION TO TAKE THE NEXT
  TASK IT'S "NO ERRORS"

### Test Execution Guidelines

- **CRITICAL** Always run tests with `pnpm test` (not `pnpm test:watch`) to prevent CPU overload
- **IMPORTANT** Vitest is configured with resource limits: max 2 threads, 30s timeout, no watch mode by default
- **LEARNED** If Vitest processes hang and consume 100% CPU, kill them with: `ps aux | grep vitest` then
  `kill -9 [PIDs]`
- **IMPORTANT** Test scripts now use `--run` flag by default to ensure tests exit after completion
- **IMPORTANT** Use `pnpm test:watch` only when actively developing and remember to stop it with Ctrl+C when done
