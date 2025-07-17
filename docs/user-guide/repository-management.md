# Repository Management

TaskMaster UI allows you to connect and manage multiple Git repositories from a single interface. This guide covers all aspects of repository management.

## Overview

Repository management in TaskMaster UI provides:
- **Multiple Repository Support**: Connect and manage several repositories simultaneously
- **Real-time Synchronization**: Live updates when repository contents change
- **Secure Access**: Path validation and permission checking
- **Project Organization**: Multiple projects per repository

## Adding Repositories

### Basic Repository Connection

1. **Access the Add Repository Form**:
   - Click **"Add Repository"** in the sidebar
   - Or use the **"+"** button next to repositories

2. **Enter Repository Information**:
   - **Repository Path**: Full absolute path to your Git repository
   - Example: `/Users/username/projects/my-project`
   - Example: `/home/user/development/webapp`

3. **Validation and Connection**:
   - Path is validated for security and accessibility
   - Git repository structure is verified
   - Connection status is displayed

### Repository Path Requirements

**Valid Paths**:
- Must be absolute paths (start with `/` on Unix/Linux/macOS)
- Must point to a Git repository (contains `.git` directory)
- Must be accessible to the TaskMaster backend server
- Can contain spaces (properly handled)

**Invalid Paths**:
- Relative paths (`./project` or `../other-project`)
- Non-existent directories
- Directories without Git initialization
- Paths with security risks (parent directory traversal)

### Security Considerations

Repository paths undergo security validation:
- **Path Traversal Protection**: Prevents `../` attacks
- **Whitelist Validation**: Only approved path patterns
- **Permission Checking**: Verifies read/write access
- **Sandbox Enforcement**: Limits file system access scope

## Managing Connected Repositories

### Repository List

The sidebar displays all connected repositories:
- **Repository Name**: Derived from the directory name
- **Status Indicator**: Connection and sync status
- **Project Count**: Number of projects in each repository
- **Quick Actions**: Direct access to repository operations

### Repository Status Indicators

| Icon | Status | Description |
|------|--------|-------------|
| 🟢 | Connected | Repository is active and accessible |
| 🟡 | Syncing | Changes are being synchronized |
| 🔴 | Error | Connection or access issues |
| ⏸️ | Inactive | Repository temporarily disabled |

### Repository Operations

**View Repository Details**:
- Click on the repository name to expand
- View project list and repository statistics
- Access repository-specific settings

**Refresh Repository**:
- Use the refresh button to rescan for changes
- Useful after external Git operations
- Updates project and file listings

**Remove Repository**:
- Click the remove button (🗑️) next to repository name
- Confirms before disconnection
- Does not delete the actual repository from disk

## Project Management within Repositories

### Creating Projects

1. **Select Repository**: Click on the target repository
2. **Create Project**: Use "Create Project" button
3. **Project Configuration**:
   - **Name**: Descriptive project name
   - **Type**: Project template or workflow type
   - **Settings**: Initial configuration options

### Project Organization

**Project Structure**:
```
repository/
├── .git/
├── .taskmaster/
│   ├── config.json
│   └── tasks/
│       └── project-name/
│           └── tasks.json
├── project-files/
└── README.md
```

**Multiple Projects**:
- Each repository can contain multiple projects
- Projects are organized in separate directories
- Independent task management per project
- Shared repository-level configuration

## Repository Synchronization

### Automatic Synchronization

TaskMaster UI automatically synchronizes:
- **File System Changes**: New files, modifications, deletions
- **Git Operations**: Commits, branch changes, merges
- **Project Updates**: Task changes, status updates
- **Configuration Changes**: Settings and preferences

### Manual Synchronization

Force synchronization when needed:
1. **Repository Level**: Refresh button next to repository name
2. **Project Level**: Refresh within project view
3. **Global Refresh**: Application-wide synchronization

### Conflict Resolution

When conflicts occur:
- **Automatic Resolution**: Simple conflicts resolved automatically
- **User Notification**: Complex conflicts require user intervention
- **Backup Creation**: Original state preserved before resolution
- **Manual Override**: User can choose resolution strategy

## Advanced Features

### Repository Templates

Pre-configured repository setups:
- **Web Application**: Frontend/backend project structure
- **Library/Package**: Open source library template
- **Documentation**: Documentation-focused repository
- **Custom**: User-defined templates

### Repository Sharing

Collaborate on repositories:
- **Multi-user Access**: Multiple team members can connect
- **Real-time Updates**: Changes sync across all users
- **Permission Management**: Access control and restrictions
- **Activity Tracking**: User actions and change history

### Repository Analytics

Monitor repository health:
- **Commit Frequency**: Development activity metrics
- **Project Progress**: Task completion statistics
- **File Changes**: Modification patterns and hotspots
- **Team Activity**: Contributor involvement tracking

## Troubleshooting

### Common Repository Issues

**Repository Not Found**:
```
Error: Repository path does not exist
```
- Verify the path is correct and exists
- Check file system permissions
- Ensure path uses correct format for your OS

**Permission Denied**:
```
Error: Access denied to repository
```
- Verify read/write permissions on the directory
- Check that the backend server has appropriate access
- Consider file ownership and group permissions

**Invalid Git Repository**:
```
Error: Not a valid Git repository
```
- Initialize Git if needed: `git init`
- Verify `.git` directory exists
- Check repository integrity: `git status`

**Connection Timeout**:
```
Error: Repository connection timeout
```
- Check network connectivity
- Verify backend server is running
- Increase timeout settings if needed

### Performance Optimization

**Large Repositories**:
- Use `.taskmaster-ignore` file to exclude large directories
- Consider splitting into smaller projects
- Implement selective synchronization
- Monitor resource usage

**Network Issues**:
- Enable compression for remote repositories
- Implement caching strategies
- Use incremental synchronization
- Consider offline mode capabilities

## Best Practices

### Repository Organization

1. **Logical Grouping**: Group related projects in same repository
2. **Clear Naming**: Use descriptive repository and project names
3. **Documentation**: Maintain README files and project descriptions
4. **Consistent Structure**: Follow established patterns across repositories

### Security Practices

1. **Path Validation**: Always verify repository paths before connection
2. **Access Control**: Limit repository access to necessary users
3. **Regular Audits**: Review connected repositories periodically
4. **Backup Strategy**: Maintain backups of critical repositories

### Performance Guidelines

1. **Repository Size**: Keep repositories focused and manageable
2. **File Monitoring**: Use selective file watching for large repositories
3. **Cleanup**: Remove unused or inactive repositories
4. **Resource Monitoring**: Track memory and CPU usage

## Integration with Git

### Git Operations

TaskMaster UI integrates with Git:
- **Status Monitoring**: Track working directory status
- **Branch Awareness**: Display current branch information
- **Change Detection**: Monitor uncommitted changes
- **Conflict Alerts**: Notify about merge conflicts

### Git Workflow Integration

Support for common Git workflows:
- **Feature Branches**: Project-per-branch organization
- **Release Management**: Version-based project tracking
- **Collaboration**: Multi-developer repository support
- **CI/CD Integration**: Hook into build and deployment pipelines

## Next Steps

After mastering repository management:
1. **Learn Project Creation**: Set up projects within repositories
2. **Explore Task Management**: Use task boards and workflows
3. **Try Terminal Integration**: Execute Git commands directly
4. **Review Security Features**: Understand data protection measures