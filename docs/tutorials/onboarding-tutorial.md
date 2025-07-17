# TaskMaster UI Onboarding Tutorial

Welcome to TaskMaster UI! This step-by-step tutorial will guide you through your first experience with the application, from initial setup to managing your first project.

## What You'll Learn

By the end of this tutorial, you'll be able to:
- Connect your first Git repository to TaskMaster UI
- Create and configure a new project
- Navigate the task board interface
- Create, edit, and manage tasks
- Use the integrated terminal for development
- Customize your workspace preferences

## Prerequisites

Before starting, ensure you have:
- A Git repository on your local machine
- Basic familiarity with Git and version control
- A modern web browser (Chrome, Firefox, Safari, or Edge)

## Tutorial Overview

This tutorial is divided into 6 main sections:
1. **First Launch** - Initial application setup
2. **Repository Connection** - Adding your first repository
3. **Project Creation** - Setting up your first project
4. **Task Board Basics** - Understanding the task management interface
5. **Creating Your First Task** - Hands-on task creation
6. **Workspace Customization** - Personalizing your experience

---

## Section 1: First Launch

### Step 1.1: Access TaskMaster UI

1. Open your web browser
2. Navigate to the TaskMaster UI application URL
3. You should see the TaskMaster UI welcome screen

**What you'll see:**
- Clean, modern interface with a header and sidebar
- Welcome message or empty state
- "Add Repository" button or similar call-to-action

**If you see errors:**
- Refresh the page
- Check your internet connection
- Verify the application URL is correct

### Step 1.2: Understand the Interface

Take a moment to familiarize yourself with the layout:

**Header Section:**
- Application title/logo
- Theme toggle (sun/moon icon for light/dark mode)
- User preferences or settings

**Sidebar:**
- Repository list (currently empty)
- Navigation options
- "Add Repository" button

**Main Content Area:**
- Currently shows welcome message or getting started guide
- This is where your task boards will appear

**Pro Tip:** 💡 Try clicking the theme toggle to switch between light and dark mode!

---

## Section 2: Repository Connection

### Step 2.1: Prepare Your Repository

Before connecting, ensure you have a Git repository ready:

1. **Option A - Use an existing project:**
   - Navigate to one of your existing Git repositories
   - Note the full path (e.g., `/Users/yourname/projects/my-app`)

2. **Option B - Create a test repository:**
   ```bash
   mkdir ~/taskmaster-tutorial
   cd ~/taskmaster-tutorial
   git init
   echo "# TaskMaster Tutorial" > README.md
   git add README.md
   git commit -m "Initial commit"
   ```

**Important:** The repository path must be absolute (starting with `/` on Unix/Linux/macOS or `C:\` on Windows).

### Step 2.2: Connect Your Repository

1. **Click "Add Repository"** in the sidebar
   - A form will appear for repository connection

2. **Enter Repository Path:**
   - Type the full path to your Git repository
   - Example: `/Users/yourname/projects/my-app`
   - ⚠️ Do not use relative paths like `./my-app`

3. **Submit the Form:**
   - Click "Connect" or "Add" button
   - Wait for validation to complete

**What happens next:**
- TaskMaster validates the path exists
- Checks if it's a valid Git repository
- Verifies read/write permissions
- Adds the repository to your sidebar

### Step 2.3: Verify Repository Connection

**Success indicators:**
- Repository appears in the sidebar with its folder name
- Green status indicator or checkmark
- No error messages displayed

**If connection fails:**
- Check the path is correct and absolute
- Verify the directory contains a `.git` folder
- Ensure you have read/write permissions
- Try using the full absolute path

**Repository Details:**
Click on your repository name in the sidebar to see:
- Repository path
- Connection status
- Available projects (currently none)

---

## Section 3: Project Creation

### Step 3.1: Understanding Projects

In TaskMaster UI:
- **Repository** = Your Git repository containing code
- **Project** = A task management workspace within that repository
- You can have multiple projects per repository

### Step 3.2: Create Your First Project

1. **With your repository selected** in the sidebar:
   - Look for "Create Project" button
   - This may be in the main content area or within the repository section

2. **Click "Create Project":**
   - A project creation form will appear
   - This opens as a modal dialog or inline form

3. **Fill Project Details:**
   - **Project Name:** Choose a descriptive name (e.g., "Website Redesign")
   - **Description:** Optional - brief project description
   - Use only letters, numbers, spaces, hyphens, and underscores

**Naming Guidelines:**
- ✅ Good: "Website Redesign", "Mobile App v2", "Bug Fixes"
- ❌ Avoid: Special characters like @, #, %, etc.

### Step 3.3: Project Initialization

1. **Click "Create"** to initialize the project

2. **TaskMaster will:**
   - Create a `.taskmaster` directory in your repository
   - Set up project configuration files
   - Initialize the task management structure
   - Create default task columns (To Do, In Progress, Done)

3. **Wait for completion:**
   - You'll see a loading indicator
   - Success message when complete
   - Project appears in your repository's project list

### Step 3.4: Access Your Project

1. **Navigate to your project:**
   - Click on the project name in the sidebar
   - Or click "Open Project" if available

2. **You should now see:**
   - The task board interface
   - Column headers (To Do, In Progress, Done)
   - Empty columns ready for tasks
   - Project name in the header

**Congratulations!** 🎉 You've successfully created your first project!

---

## Section 4: Task Board Basics

### Step 4.1: Understanding the Task Board

The task board uses a **Kanban-style layout** with columns representing different task states:

**Column Structure:**
- **To Do:** New tasks waiting to be started
- **In Progress:** Tasks currently being worked on
- **Done:** Completed tasks

**Task Board Elements:**
- **Column Headers:** Show column name and task count
- **Task Cards:** Individual tasks displayed as cards
- **Add Task Buttons:** Usually "+" icons in each column

### Step 4.2: Task Board Navigation

**Mouse Interaction:**
- **Click tasks** to view details
- **Drag tasks** between columns to change status
- **Hover** for additional options or information

**Keyboard Navigation:**
- **Tab:** Move between interactive elements
- **Arrow keys:** Navigate within task lists
- **Enter:** Open selected task
- **Escape:** Close modals or cancel actions

### Step 4.3: Board Features

Look for these features on your task board:

**Filtering and Search:**
- Search box for finding specific tasks
- Filter buttons for task types or assignees
- View options (compact, detailed, list view)

**Board Controls:**
- Refresh button to update data
- Settings or preferences
- Export or sharing options

**Visual Indicators:**
- Task priority colors
- Due date warnings
- Assignment indicators
- Progress indicators

---

## Section 5: Creating Your First Task

### Step 5.1: Add a New Task

1. **Find the "Add Task" button:**
   - Usually a "+" icon in one of the columns
   - May be labeled "Add Task" or "New Task"
   - Typically in the "To Do" column

2. **Click to open task creation:**
   - Form appears as modal or inline editor
   - Cursor should focus on the task title field

### Step 5.2: Fill Task Information

**Required Fields:**
- **Task Title:** Brief, descriptive name
  - Example: "Set up navigation menu"
  - Keep it actionable and specific

**Optional Fields (if available):**
- **Description:** Detailed task information
- **Priority:** High, Medium, Low
- **Due Date:** Target completion date
- **Assignee:** Who will work on this task
- **Labels/Tags:** For categorization

**Example Task:**
```
Title: Create login page
Description: Design and implement user login functionality
Priority: High
Due Date: End of week
```

### Step 5.3: Save Your Task

1. **Click "Create" or "Save"** to add the task

2. **Verify task creation:**
   - Task card appears in the selected column
   - Contains the title you entered
   - Shows any additional information you provided

3. **If creation fails:**
   - Check for required field errors
   - Ensure title isn't empty
   - Try again with simplified information

### Step 5.4: Edit Your Task

1. **Click on your task card** to open details

2. **Edit capabilities:**
   - Modify title, description, or other fields
   - Change priority or due date
   - Add notes or comments

3. **Save changes** and verify updates appear

### Step 5.5: Move Your Task

**Using Drag and Drop:**
1. Click and hold your task card
2. Drag to the "In Progress" column
3. Release to drop
4. Verify the task moved successfully

**Alternative Methods:**
- Click task and change status in details view
- Use status dropdown if available
- Right-click for context menu options

**Congratulations!** 🎉 You've created and managed your first task!

---

## Section 6: Workspace Customization

### Step 6.1: Theme Preferences

**Switch Themes:**
1. Click the theme toggle in the header (sun/moon icon)
2. Choose between light and dark mode
3. Your preference is automatically saved

**Theme Benefits:**
- **Light mode:** Better for well-lit environments
- **Dark mode:** Reduces eye strain in low light
- **System mode:** Follows your OS preference

### Step 6.2: Board Customization

**View Options:**
- **Compact view:** More tasks visible at once
- **Detailed view:** Full task information shown
- **List view:** Traditional task list format

**Column Configuration:**
- Some versions allow custom column names
- Adjust column widths by dragging borders
- Hide/show columns based on your workflow

### Step 6.3: Accessibility Features

**Keyboard Navigation:**
- All features accessible via keyboard
- Tab through interactive elements
- Use arrow keys within lists

**Screen Reader Support:**
- All elements have proper labels
- Status changes are announced
- Navigation landmarks are defined

**High Contrast:**
- Automatically detected and supported
- Enhanced color contrast ratios
- Clear visual indicators

### Step 6.4: Performance Tips

**For Better Performance:**
- Use filters to reduce visible tasks
- Archive completed tasks regularly
- Keep projects focused and manageable
- Refresh if the interface becomes slow

---

## Quick Reference Guide

### Essential Keyboard Shortcuts

| Action | Shortcut | Description |
|--------|----------|-------------|
| Toggle Theme | `Ctrl/Cmd + Shift + T` | Switch light/dark mode |
| Search | `Ctrl/Cmd + K` | Open search |
| Skip Navigation | `Tab` | Accessibility navigation |
| Close Modal | `Escape` | Close dialogs |

### Common Tasks

| Task | Steps |
|------|-------|
| **Add Repository** | Sidebar → Add Repository → Enter path → Connect |
| **Create Project** | Select Repository → Create Project → Enter name → Create |
| **Add Task** | Task Board → + Button → Enter title → Create |
| **Move Task** | Drag task card to different column |
| **Edit Task** | Click task card → Modify details → Save |

### Troubleshooting

| Problem | Solution |
|---------|----------|
| Repository won't connect | Check path is absolute and contains .git folder |
| Project creation fails | Verify repository write permissions |
| Tasks not saving | Check network connection and try again |
| Interface slow | Use filters, archive old tasks, refresh page |

---

## Next Steps

Now that you've completed the onboarding tutorial, you're ready to:

### Immediate Actions
1. **Create more tasks** for your current project
2. **Experiment with task organization** using drag and drop
3. **Try different view modes** and find your preference
4. **Explore filtering options** as you add more tasks

### Advanced Features
1. **Terminal Integration** - Use embedded terminal for development
2. **Multiple Projects** - Create additional projects in your repository
3. **Repository Management** - Connect multiple repositories
4. **Collaboration** - Share projects with team members (if supported)

### Learning Resources
- [Repository Management Guide](../user-guide/repository-management.md)
- [Task Board Usage](../user-guide/task-board.md)
- [Terminal Integration](../user-guide/terminal-integration.md)
- [Security Features](../user-guide/security.md)

### Getting Help

If you need assistance:
- Check the [Troubleshooting Guide](../user-guide/troubleshooting.md)
- Review [Frequently Asked Questions](../user-guide/faq.md)
- Consult the [API Documentation](../api/) for technical details

---

## Tutorial Summary

**What You've Accomplished:**
✅ Connected your first Git repository  
✅ Created and configured a project  
✅ Learned task board navigation  
✅ Created and managed your first task  
✅ Customized your workspace  
✅ Learned essential keyboard shortcuts  

**You're now ready to:**
- Manage complex projects with multiple tasks
- Organize development workflows efficiently
- Collaborate with team members
- Leverage TaskMaster UI for your development projects

**Welcome to TaskMaster UI!** 🚀

We hope this tutorial has given you a solid foundation for using TaskMaster UI effectively. The application is designed to grow with your needs, from simple task tracking to complex project management.

Happy task managing! 🎯