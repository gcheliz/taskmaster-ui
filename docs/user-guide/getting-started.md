# Getting Started with TaskMaster UI

This guide will help you get up and running with TaskMaster UI quickly and efficiently.

## Prerequisites

Before using TaskMaster UI, ensure you have:

### Required
- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Internet connection for initial setup
- Git repositories you want to manage

### For Development
- Node.js 18 or higher
- pnpm package manager
- TaskMaster CLI (for backend functionality)

## First Time Setup

### 1. Access the Application

Open your web browser and navigate to the TaskMaster UI application. You should see the main dashboard.

### 2. Understanding the Interface

The TaskMaster UI consists of several key areas:

- **Header**: Navigation and theme controls
- **Sidebar**: Repository and project navigation
- **Main Content**: Task boards, project details, or settings
- **Terminal** (optional): Integrated command execution

### 3. Connect Your First Repository

1. Click the **"Add Repository"** button in the sidebar
2. Enter the **full path** to your Git repository
3. Click **"Connect"** to add the repository

```
Example repository path:
/Users/username/projects/my-awesome-project
```

**Security Note**: Only local repositories are supported. The path must be accessible to the backend server.

### 4. Create Your First Project

1. Select your connected repository from the sidebar
2. Click **"Create Project"** 
3. Enter a project name (letters, numbers, spaces, hyphens, and underscores only)
4. Click **"Create"** to initialize the project

The system will:
- Create a `.taskmaster` directory in your repository
- Initialize the TaskMaster configuration
- Set up the initial task structure

## Navigation Basics

### Keyboard Shortcuts

| Action | Shortcut | Description |
|--------|----------|-------------|
| Toggle Theme | `Ctrl/Cmd + Shift + T` | Switch between light/dark mode |
| Focus Search | `Ctrl/Cmd + K` | Jump to search functionality |
| Skip to Content | `Tab` | Skip navigation (accessibility) |
| Open Terminal | `Ctrl/Cmd + ` ` | Open integrated terminal |

### Screen Reader Support

TaskMaster UI is fully accessible with screen readers:
- All interactive elements have proper ARIA labels
- Navigation landmarks are clearly defined
- Live regions announce dynamic updates
- High contrast mode is supported

## Common Tasks

### Adding Multiple Repositories

You can connect multiple Git repositories:

1. Use the **"Add Repository"** button for each repository
2. Each repository appears as a separate section in the sidebar
3. Switch between repositories by clicking their names

### Managing Projects

Within each repository, you can:

- **Create multiple projects** for different features or workflows
- **Switch between projects** using the project selector
- **View project status** and progress indicators

### Using the Task Board

The task board provides visual project management:

- **Columns represent task states**: To Do, In Progress, Done, etc.
- **Drag and drop tasks** between columns to update status
- **Click tasks** to view details and make updates
- **Filter and sort** tasks using the controls

## Theme and Customization

### Theme Selection

TaskMaster UI supports both light and dark themes:

1. Click the **theme toggle** in the header
2. The selection is automatically saved
3. The theme applies immediately across the application

### Accessibility Settings

For enhanced accessibility:

- **High contrast mode** is automatically detected
- **Reduced motion** preferences are respected  
- **Keyboard navigation** is fully supported
- **Screen reader announcements** provide context

## Troubleshooting Common Issues

### Repository Not Connecting

**Problem**: "Invalid repository path" error

**Solutions**:
- Verify the path exists and is a Git repository
- Check that the backend server has read access to the path
- Ensure the path uses forward slashes on all platforms

### Project Creation Fails

**Problem**: Project creation shows an error

**Solutions**:
- Check that the repository has write permissions
- Verify the project name follows naming conventions
- Ensure TaskMaster CLI is properly installed

### Interface Not Loading

**Problem**: Blank page or loading errors

**Solutions**:
- Refresh the browser page
- Check browser console for JavaScript errors
- Verify network connectivity
- Try a different browser

### Performance Issues

**Problem**: Slow response or timeouts

**Solutions**:
- Check if large repositories are causing delays
- Verify system resources (CPU, memory)
- Consider reducing the number of open projects

## Next Steps

Now that you're set up:

1. **Explore Repository Management**: Learn advanced repository features
2. **Master Task Boards**: Discover task organization and workflow management  
3. **Try Terminal Integration**: Use the embedded terminal for development
4. **Review Security Features**: Understand data protection and privacy

## Getting Help

If you need assistance:

- Check the [Troubleshooting Guide](./troubleshooting.md)
- Review specific feature documentation
- Consult the [API Reference](../api/) for technical details
- See [Examples and Tutorials](../tutorials/) for step-by-step guides