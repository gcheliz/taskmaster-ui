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
task-master add-task --prompt="description" --research        # Add new task with AI assistance
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

### Critical Development Guidelines

- **CRITICAL**: Never finish a task or subtask if the complete tests and checks passing successful (Allow warnings).
- **CRITICAL** This project uses PNPM exclusively. NEVER use npm commands. Always use pnpm commands instead:
  - Use `pnpm install` instead of `npm install`
  - Use `pnpm add` instead of `npm add`
  - Use `pnpm run` instead of `npm run`
  - Use `pnpm exec` instead of `npx`
  - All package management must be done through pnpm to avoid dependency conflicts and warnings
- **CRITICAL** Do not use the cd command to execute node commands. Place a common package.json into the root project folder to map all node actions into the multiple workspace project. Keep the monorepo workspace config execution through the main package.json file into the root folder.
- **CRITICAL** Perform the subtask expansion always in batches, try generating 5 in parallel.

### Documentation Guidelines

- **IMPORTANT** Do not generate documentation files at root project folder. Put always organized, merge files if it's necessary to have the minimum document files generated. Compact and concise focused for a tech team using class, architecture and use case/workflows diagrams and command line examples with it's outputs. It's importand have an always updated information for any code change.

### Path Resolution Guidelines

- **CRITICAL** When working in monorepo structures, always be aware of current working directory
- **IMPORTANT** Use `pwd` to check current directory before executing file operations
- **CRITICAL** Never reference paths like `packages/frontend/` when already inside the frontend directory
- **IMPORTANT** Use relative paths from current working directory (e.g., `dist/assets/` not `packages/frontend/dist/assets/`)
- **IMPORTANT** When debugging path issues, use absolute paths with `find` command to locate files
- **CRITICAL** Always verify file/directory existence with `ls` or `find` before trying to read/access them

## Web Interface Access and Verification Guidelines

### Local Development Server Access Limitations

**CRITICAL** Claude Code cannot directly access local web interfaces (localhost URLs) through WebFetch tool:
- **WebFetch Limitation**: The WebFetch tool does not support localhost URLs (http://localhost:*) 
- **Local Testing Required**: Use bash commands with `curl` to verify local services are running
- **Service Verification**: Use `lsof -i :<port>` to check if services are listening on expected ports

### Current Project Service Ports

- **Storybook**: Running on port 6006 (`pnpm run storybook`)
- **Frontend App**: Running on port 8080 (served via http-server)
- **Vite Dev Server**: Typically port 5173 (when using `pnpm run dev`)

### Verification Commands for Local Services

```bash
# Check running processes
ps aux | grep -E "(storybook|vite|node)" | grep -v grep

# Check specific ports
lsof -i :6006  # Storybook
lsof -i :8080  # Frontend static server
lsof -i :5173  # Vite dev server

# Test local access
curl -s http://localhost:6006 | head -20  # Storybook homepage
curl -s http://localhost:8080 | head -20  # Frontend app
```

### Alternative Verification Methods

- **Browser Testing**: Recommend user to manually check interfaces in browser
- **Screenshot Analysis**: Use Read tool to analyze user-provided screenshots
- **Source Code Analysis**: Review component source files directly
- **Build Output Verification**: Check built assets and generated files

### When Debugging UI Issues

1. **First**: Check if services are running with `ps aux` and `lsof`
2. **Second**: Use `curl` to verify HTTP responses
3. **Third**: Ask user to provide screenshots or URLs for analysis
4. **Fourth**: Analyze source code and built assets directly
5. **Last Resort**: Ask user to manually verify changes in browser

**IMPORTANT**: Always inform user when local web interface verification is needed, as Claude Code cannot directly access localhost URLs.

## Working Solution: Public Tunnel Access for Web Verification

### Root Cause Analysis
- **WebFetch Limitation**: Cannot access localhost URLs (http://localhost:*)
- **Solution**: Create public tunnels using localtunnel to expose local services
- **Verification**: Use WebFetch on public tunnel URLs to actually see and verify web interfaces

### Complete Web Access Solution

#### Step 1: Install Tunneling Tool
```bash
# Install localtunnel globally
npm install -g localtunnel
```

#### Step 2: Create Public Tunnels
```bash
# Create stable tunnels for both services
nohup lt --port 6006 --subdomain taskmaster-storybook > /tmp/storybook-tunnel.log 2>&1 &
nohup lt --port 8080 --subdomain taskmaster-frontend > /tmp/frontend-tunnel.log 2>&1 &

# Wait for tunnels to establish
sleep 5

# Get tunnel URLs
cat /tmp/storybook-tunnel.log
cat /tmp/frontend-tunnel.log
```

#### Step 3: Verify Access
```bash
# Test tunnel connectivity
curl -I https://taskmaster-storybook.loca.lt
curl -I https://taskmaster-frontend.loca.lt

# Check tunnel status
ps aux | grep "lt --port" | grep -v grep
```

#### Step 4: Use WebFetch for Verification
```bash
# Now Claude Code can access via WebFetch tool:
# WebFetch URL: https://taskmaster-storybook.loca.lt
# WebFetch URL: https://taskmaster-frontend.loca.lt
```

### Tunnel Management Commands

```bash
# Stop all tunnels
pkill -f "lt --port"

# Restart tunnels
nohup lt --port 6006 --subdomain taskmaster-storybook > /tmp/storybook-tunnel.log 2>&1 &
nohup lt --port 8080 --subdomain taskmaster-frontend > /tmp/frontend-tunnel.log 2>&1 &

# Check tunnel logs
tail -f /tmp/storybook-tunnel.log
tail -f /tmp/frontend-tunnel.log
```

### Known Issues and Solutions

#### Issue: WebFetch Returns Configuration Instead of Interface
- **Cause**: WebFetch may receive build config instead of rendered interface
- **Solution**: Try different paths or ask user for manual verification

#### Issue: Frontend Service Not Responding
- **Cause**: Service may not be properly configured for external access
- **Solution**: Verify service is running and accessible locally first

#### Issue: Tunnel Timeouts
- **Cause**: Localtunnel free tier has limitations
- **Solution**: Restart tunnels or use alternative tunneling services

### Alternative Tunneling Options

#### NgRok (Premium/Authenticated)
```bash
brew install ngrok
# Requires account setup at https://dashboard.ngrok.com/signup
ngrok authtoken <your-token>
ngrok http 6006
```

#### SSH Tunneling (If available)
```bash
# Forward local port to remote server
ssh -R 8080:localhost:6006 user@remote-server
```

### Web Verification Workflow

1. **Start Local Services**: Ensure Storybook and frontend are running
2. **Create Tunnels**: Use localtunnel to expose services publicly  
3. **Verify Connectivity**: Test with curl before using WebFetch
4. **Use WebFetch**: Access public URLs to examine interfaces
5. **Document Findings**: Record any visual issues or component problems
6. **Clean Up**: Stop tunnels when verification is complete

### Critical Success Factors

- **Always verify services are running locally first**
- **Test tunnel connectivity with curl before WebFetch**
- **Use stable subdomain names for consistent access**
- **Monitor tunnel logs for connection issues**
- **Document any WebFetch limitations encountered**

**BREAKTHROUGH**: This solution enables Claude Code to actually see and verify web interfaces, solving the critical limitation of localhost access.

## Working Solution: Public Tunnel Access for Web Verification

### Root Cause Analysis
- **WebFetch Limitation**: Cannot access localhost URLs (http://localhost:*)
- **Solution**: Create public tunnels using localtunnel to expose local services
- **Verification**: Use WebFetch on public tunnel URLs to actually see and verify web interfaces

### Complete Web Access Solution

#### Step 1: Install Tunneling Tool
```bash
# Install localtunnel globally
npm install -g localtunnel
```

#### Step 2: Create Public Tunnels
```bash
# Create stable tunnels for both services
nohup lt --port 6006 --subdomain taskmaster-storybook > /tmp/storybook-tunnel.log 2>&1 &
nohup lt --port 8080 --subdomain taskmaster-frontend > /tmp/frontend-tunnel.log 2>&1 &

# Wait for tunnels to establish
sleep 5

# Get tunnel URLs
cat /tmp/storybook-tunnel.log
cat /tmp/frontend-tunnel.log
```

#### Step 3: Verify Access
```bash
# Test tunnel connectivity
curl -I https://taskmaster-storybook.loca.lt
curl -I https://taskmaster-frontend.loca.lt

# Check tunnel status
ps aux | grep "lt --port" | grep -v grep
```

#### Step 4: Use WebFetch for Verification
```bash
# Now Claude Code can access via WebFetch tool:
# WebFetch URL: https://taskmaster-storybook.loca.lt
# WebFetch URL: https://taskmaster-frontend.loca.lt
```

### Tunnel Management Commands

```bash
# Stop all tunnels
pkill -f "lt --port"

# Restart tunnels
nohup lt --port 6006 --subdomain taskmaster-storybook > /tmp/storybook-tunnel.log 2>&1 &
nohup lt --port 8080 --subdomain taskmaster-frontend > /tmp/frontend-tunnel.log 2>&1 &

# Check tunnel logs
tail -f /tmp/storybook-tunnel.log
tail -f /tmp/frontend-tunnel.log
```

### Known Issues and Solutions

#### Issue: WebFetch Returns Configuration Instead of Interface
- **Cause**: WebFetch may receive build config instead of rendered interface
- **Solution**: Try different paths or ask user for manual verification

#### Issue: Frontend Service Not Responding
- **Cause**: Service may not be properly configured for external access
- **Solution**: Verify service is running and accessible locally first

#### Issue: Tunnel Timeouts
- **Cause**: Localtunnel free tier has limitations
- **Solution**: Restart tunnels or use alternative tunneling services

### Alternative Tunneling Options

#### NgRok (Premium/Authenticated)
```bash
brew install ngrok
# Requires account setup at https://dashboard.ngrok.com/signup
ngrok authtoken <your-token>
ngrok http 6006
```

#### SSH Tunneling (If available)
```bash
# Forward local port to remote server
ssh -R 8080:localhost:6006 user@remote-server
```

### Web Verification Workflow

1. **Start Local Services**: Ensure Storybook and frontend are running
2. **Create Tunnels**: Use localtunnel to expose services publicly  
3. **Verify Connectivity**: Test with curl before using WebFetch
4. **Use WebFetch**: Access public URLs to examine interfaces
5. **Document Findings**: Record any visual issues or component problems
6. **Clean Up**: Stop tunnels when verification is complete

### Critical Success Factors

- **Always verify services are running locally first**
- **Test tunnel connectivity with curl before WebFetch**
- **Use stable subdomain names for consistent access**
- **Monitor tunnel logs for connection issues**
- **Document any WebFetch limitations encountered**

**BREAKTHROUGH**: This solution enables Claude Code to actually see and verify web interfaces, solving the critical limitation of localhost access.

## Common Issues and Solutions

### HTML Parsing Error in Vite

**Issue**: Vite throws "Unable to parse HTML; parse5 error code" when index.html has malformed content or escaped characters
**Symptoms**: 
- Error: `eof-in-tag` or `invalid-first-character-of-tag-name`
- Frontend container shows as unhealthy
- Application fails to load

**Solution**:
1. Check index.html for unclosed tags or escaped characters (e.g., `<\!--` instead of `<\!--`)
2. Ensure all HTML tags are properly closed
3. Fix escaped backslashes in comments or DOCTYPE declarations
4. If using Docker, recreate the container after fixing:
   ```bash
   docker-compose stop frontend && docker-compose rm -f frontend && docker-compose up -d frontend
   ```

- always check if the stack it's running via the command pnpm run docker:dev before to realize any check to the application. Do not kill the docker compose process with the kill command, use the pnpm
commands destinated for that
