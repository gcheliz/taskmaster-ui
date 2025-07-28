# /init - Initialize Claude AI Agents

This command initializes the Claude AI agent system for the TaskMaster UI project.

## Usage

```
/init [options]
```

## Options

- `--reset` - Reset all agent configurations to defaults
- `--validate` - Run validation checks only
- `--verbose` - Show detailed initialization steps

## What it does

1. **Validates Environment**
   - Checks PNPM installation
   - Verifies workspace structure
   - Validates Node.js version

2. **Sets Up Agents**
   - Loads agent registry
   - Initializes agent templates
   - Configures agent permissions

3. **Configures Workflows**
   - Loads workflow templates
   - Sets up execution engine
   - Configures parallel execution

4. **Integrates with Project**
   - Connects to TaskMaster
   - Sets up Git hooks
   - Configures test frameworks

## Example

```bash
# Basic initialization
/init

# Reset and reinitialize
/init --reset

# Validate only
/init --validate
```

## Post-initialization

After initialization, you can:

- Use `/api-endpoint` to create new API endpoints
- Use `/component` to generate React components
- Use `/feature` to start a feature workflow
- Use `/review` to run code reviews

## Troubleshooting

If initialization fails:

1. Check `.claude/logs/init.log` for errors
2. Ensure all dependencies are installed with `pnpm install`
3. Verify `.env` file contains required API keys
4. Run `/init --validate` to check configuration
