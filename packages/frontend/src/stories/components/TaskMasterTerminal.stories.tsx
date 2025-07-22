import type { Meta, StoryObj } from '@storybook/react';
import { TaskMasterTerminal } from '../../components/Terminal/TaskMasterTerminal';
import '../../components/Terminal/TaskMasterTerminal.css';

const meta = {
  title: 'Components/Terminal/TaskMasterTerminal',
  component: TaskMasterTerminal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# TaskMaster Terminal

A specialized terminal component designed for TaskMaster CLI integration. Features:

- **Command Recognition**: Highlights TaskMaster commands and syntax
- **Smart Autocomplete**: Tab completion for TaskMaster commands and parameters
- **Command History**: Navigate previous commands with arrow keys
- **Project Integration**: Automatic project tag injection for TaskMaster commands
- **Real-time Suggestions**: Context-aware command and parameter suggestions

## TaskMaster Commands Supported

- \`task-master init\` - Initialize TaskMaster in current directory
- \`task-master list\` - List all tasks with status
- \`task-master next\` - Get next available task
- \`task-master show <id>\` - View detailed task information
- \`task-master set-status\` - Update task status
- \`task-master add-task\` - Add new task with AI assistance
- \`task-master expand\` - Break tasks into subtasks
- And many more...

## Usage

\`\`\`tsx
<TaskMasterTerminal
  projectTag="my-project"
  workingDirectory="/path/to/project"
  enableTaskMasterSuggestions={true}
  enableCommandHistory={true}
  theme="dark"
/>
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    mode: {
      control: 'select',
      options: ['embedded', 'popup', 'fullscreen'],
      description: 'Terminal display mode',
    },
    theme: {
      control: 'select',
      options: ['dark', 'light'],
      description: 'Terminal color theme',
    },
    showHeader: {
      control: 'boolean',
      description: 'Show terminal header with controls',
    },
    showStatusBar: {
      control: 'boolean',
      description: 'Show terminal status bar',
    },
    enableTaskMasterSuggestions: {
      control: 'boolean',
      description: 'Enable TaskMaster command suggestions',
    },
    enableCommandHistory: {
      control: 'boolean',
      description: 'Enable command history navigation',
    },
    projectTag: {
      control: 'text',
      description: 'Project tag for TaskMaster CLI commands',
    },
    workingDirectory: {
      control: 'text',
      description: 'Working directory path',
    },
    repositoryPath: {
      control: 'text',
      description: 'Repository path if scoped to a repository',
    },
    title: {
      control: 'text',
      description: 'Terminal title',
    },
    maxHistoryEntries: {
      control: 'number',
      description: 'Maximum number of command history entries',
    },
  },
  decorators: [
    Story => (
      <div
        style={{
          width: '100%',
          height: '600px',
          background: 'var(--color-background, #f8fafc)',
          padding: '20px',
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TaskMasterTerminal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    mode: 'embedded',
    theme: 'dark',
    showHeader: true,
    showStatusBar: true,
    enableTaskMasterSuggestions: true,
    enableCommandHistory: true,
    title: 'TaskMaster Terminal',
    projectTag: 'taskmaster-ui',
    workingDirectory: '/Users/dev/projects/taskmaster-ui',
    repositoryPath: '/Users/dev/projects/taskmaster-ui',
    maxHistoryEntries: 100,
  },
  parameters: {
    docs: {
      description: {
        story: `
### Default TaskMaster Terminal

The default configuration with all features enabled. This terminal is ready for TaskMaster CLI integration with:

- Dark theme for reduced eye strain during development
- Command suggestions and autocomplete enabled
- Command history navigation with arrow keys
- Project tag automatically added to TaskMaster commands
- Full header and status bar for session information

**Try typing:** Start typing \`task-master\` to see autocomplete suggestions.
        `,
      },
    },
  },
};

export const LightTheme: Story = {
  args: {
    ...Default.args,
    theme: 'light',
  },
  parameters: {
    backgrounds: { default: 'light' },
    docs: {
      description: {
        story: `
### Light Theme

TaskMaster Terminal with light theme for better visibility in bright environments.
All functionality remains the same with adjusted colors for optimal contrast.
        `,
      },
    },
  },
};

export const Fullscreen: Story = {
  args: {
    ...Default.args,
    mode: 'fullscreen',
    title: 'TaskMaster Terminal - Fullscreen',
  },
  parameters: {
    docs: {
      description: {
        story: `
### Fullscreen Mode

Fullscreen terminal mode for intensive CLI work. Perfect for:
- Long development sessions
- Complex TaskMaster command sequences
- Multi-step task management workflows
        `,
      },
    },
  },
  decorators: [
    Story => (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          background: 'var(--color-background, #1a1a1a)',
          overflow: 'hidden',
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export const WithoutSuggestions: Story = {
  args: {
    ...Default.args,
    enableTaskMasterSuggestions: false,
    title: 'TaskMaster Terminal - Basic',
  },
  parameters: {
    docs: {
      description: {
        story: `
### Basic Terminal without Suggestions

TaskMaster Terminal with autocomplete and suggestions disabled for a more
traditional terminal experience while maintaining TaskMaster integration.
        `,
      },
    },
  },
};

export const MinimalTerminal: Story = {
  args: {
    ...Default.args,
    showHeader: false,
    showStatusBar: false,
    enableTaskMasterSuggestions: false,
    enableCommandHistory: false,
    title: 'Minimal Terminal',
    theme: 'dark',
  },
  parameters: {
    docs: {
      description: {
        story: `
### Minimal Configuration

Stripped down terminal with minimal UI elements. Suitable for embedding
in constrained spaces while maintaining core TaskMaster CLI functionality.
        `,
      },
    },
  },
};

export const ProjectScoped: Story = {
  args: {
    ...Default.args,
    projectTag: 'my-awesome-project',
    workingDirectory: '/workspace/my-awesome-project',
    repositoryPath: '/workspace/my-awesome-project',
    title: 'Project Terminal',
  },
  parameters: {
    docs: {
      description: {
        story: `
### Project-Scoped Terminal

Terminal automatically configured for a specific project. The \`projectTag\`
is automatically appended to TaskMaster commands, making project-specific
task management seamless.

**Example:** \`task-master list\` becomes \`task-master list --tag=my-awesome-project\`
        `,
      },
    },
  },
};

export const CompactMode: Story = {
  args: {
    ...Default.args,
    initialSize: { cols: 60, rows: 16 },
    maxHistoryEntries: 25,
    title: 'Compact Terminal',
  },
  parameters: {
    docs: {
      description: {
        story: `
### Compact Mode

Smaller terminal size suitable for sidebars or secondary panels.
Reduced history size and dimensions while maintaining full functionality.
        `,
      },
    },
  },
  decorators: [
    Story => (
      <div
        style={{
          width: '600px',
          height: '400px',
          background: 'var(--color-background, #f8fafc)',
          padding: '20px',
          margin: '0 auto',
        }}
      >
        <Story />
      </div>
    ),
  ],
};

// Mock service integration for Storybook
export const WithMockService: Story = {
  args: {
    ...Default.args,
  },
  parameters: {
    docs: {
      description: {
        story: `
### With Mock Service

Terminal with mock backend service for demonstration and testing purposes.
Shows how the terminal integrates with TaskMaster CLI backend services.
        `,
      },
    },
  },
  render: args => {
    // In a real implementation, this would connect to a mock service
    return <TaskMasterTerminal {...args} />;
  },
};

// Interactive demo story
export const InteractiveDemo: Story = {
  args: {
    ...Default.args,
    title: 'TaskMaster Terminal - Interactive Demo',
  },
  parameters: {
    docs: {
      description: {
        story: `
### Interactive Demo

Try these TaskMaster commands to see the terminal in action:

1. Type \`task-master\` and press Tab for autocomplete
2. Try \`task-master list --tag=demo\`
3. Use arrow keys to navigate command history
4. Type partial commands to see suggestions

**Note:** This is a demo environment. Actual command execution may be simulated.
        `,
      },
    },
  },
};
