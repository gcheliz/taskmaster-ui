# Task Creation API Endpoint Design

## Endpoint: POST /api/tasks

### Purpose
Create a new task in the TaskMaster system with validation, dependency checking, and optional AI-powered field generation.

### Request Schema

```typescript
interface CreateTaskRequest {
  // Required Fields
  repositoryPath: string;      // Absolute path to the repository
  title: string;               // Task title (3-100 characters)
  description: string;         // Task description (10-500 characters)
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Optional Fields
  status?: 'pending' | 'in-progress' | 'done' | 'blocked' | 'deferred';  // Default: 'pending'
  assignedTo?: string;         // Username or email of assignee
  dueDate?: string;           // ISO 8601 date string
  estimatedHours?: number;    // Estimated hours (0-999)
  tags?: string[];            // Array of tags (max 10, alphanumeric + hyphens)
  dependencies?: number[];    // Array of task IDs this task depends on
  
  // Extended Fields
  details?: string;           // Additional implementation details
  testStrategy?: string;      // Testing approach for the task
  parentTaskId?: number;      // If creating a subtask
  position?: number;          // Position in task list/board
  
  // AI Enhancement Options
  aiEnhancement?: {
    generateDetails?: boolean;        // Auto-generate details from title/description
    generateTestStrategy?: boolean;   // Auto-generate test strategy
    suggestDependencies?: boolean;    // Suggest related tasks as dependencies
    estimateComplexity?: boolean;     // Estimate task complexity
  };
  
  // Options
  options?: {
    validateDependencies?: boolean;   // Check for circular dependencies (default: true)
    notifyAssignee?: boolean;        // Send notification to assignee (default: true)
    createInKanban?: boolean;        // Add to kanban board (default: true)
  };
}
```

### Response Schema

```typescript
interface CreateTaskResponse {
  success: boolean;
  data: {
    task: Task;                      // The created task object
    metadata: {
      createdAt: string;             // ISO 8601 timestamp
      createdBy: string;             // User who created the task
      projectTag: string;            // Project tag/context
      taskNumber: string;            // Generated task number (e.g., "1.2.3")
    };
    aiEnhancements?: {
      generatedDetails?: string;      // AI-generated details
      generatedTestStrategy?: string; // AI-generated test strategy
      suggestedDependencies?: number[]; // AI-suggested dependencies
      estimatedComplexity?: number;   // AI-estimated complexity (1-10)
    };
    warnings?: string[];             // Non-fatal warnings
  };
  links: {
    self: string;                    // Link to the created task
    parent?: string;                 // Link to parent task (if subtask)
    dependencies?: string[];         // Links to dependency tasks
    kanban?: string;                // Link to kanban board view
  };
}
```

### Error Response Schema

```typescript
interface TaskCreationError {
  success: false;
  error: {
    code: string;                    // Error code for programmatic handling
    message: string;                 // Human-readable error message
    details?: {
      field?: string;                // Field that caused the error
      value?: any;                   // The invalid value
      suggestion?: string;           // Suggested fix
    }[];
  };
  timestamp: string;
  requestId: string;
}
```

### Error Codes

- `VALIDATION_ERROR` - Input validation failed
- `DUPLICATE_TITLE` - Task with same title already exists
- `CIRCULAR_DEPENDENCY` - Would create circular dependency
- `INVALID_DEPENDENCY` - Referenced dependency task not found
- `REPOSITORY_NOT_FOUND` - Repository path doesn't exist
- `TASKMASTER_NOT_INITIALIZED` - TaskMaster not initialized in repository
- `PERMISSION_DENIED` - User lacks permission to create tasks
- `QUOTA_EXCEEDED` - Task limit reached for project
- `AI_SERVICE_ERROR` - AI enhancement failed (non-fatal)

### Validation Rules

1. **Title Validation**
   - Required field
   - Length: 3-100 characters
   - Must not be duplicate within same project/tag

2. **Description Validation**
   - Required field
   - Length: 10-500 characters

3. **Priority Validation**
   - Must be one of: low, medium, high, urgent
   - Required field

4. **Status Validation**
   - If provided, must be valid status
   - Default: 'pending'

5. **Due Date Validation**
   - If provided, must be valid ISO 8601 date
   - Cannot be in the past (unless explicitly allowed)

6. **Dependencies Validation**
   - All referenced task IDs must exist
   - Cannot create circular dependencies
   - Cannot depend on completed tasks (optional rule)

7. **Tags Validation**
   - Maximum 10 tags
   - Each tag: 2-30 characters
   - Alphanumeric characters, hyphens, and underscores only

8. **Estimated Hours Validation**
   - If provided, must be positive number
   - Maximum: 999 hours

### Example Requests

#### Basic Task Creation
```json
POST /api/tasks
{
  "repositoryPath": "/Users/john/projects/taskmaster-ui",
  "title": "Add user authentication",
  "description": "Implement JWT-based authentication for the application",
  "priority": "high"
}
```

#### Task with Dependencies and AI Enhancement
```json
POST /api/tasks
{
  "repositoryPath": "/Users/john/projects/taskmaster-ui",
  "title": "Add password reset functionality",
  "description": "Allow users to reset their passwords via email",
  "priority": "medium",
  "dependencies": [15, 16],
  "tags": ["auth", "security"],
  "aiEnhancement": {
    "generateDetails": true,
    "generateTestStrategy": true,
    "estimateComplexity": true
  }
}
```

#### Creating a Subtask
```json
POST /api/tasks
{
  "repositoryPath": "/Users/john/projects/taskmaster-ui",
  "parentTaskId": 10,
  "title": "Design password reset email template",
  "description": "Create HTML email template for password reset with branding",
  "priority": "medium",
  "estimatedHours": 2
}
```

### Implementation Notes

1. **Transaction Safety**: Task creation should be atomic - either fully succeed or fully rollback
2. **ID Generation**: Use auto-incrementing IDs within project scope
3. **Task Numbering**: Generate hierarchical task numbers (e.g., "1.2.3" for subtasks)
4. **Webhook Support**: Trigger webhooks on task creation for integrations
5. **Audit Trail**: Log task creation with user, timestamp, and IP
6. **Real-time Updates**: Emit WebSocket events for live dashboards
7. **Cache Invalidation**: Clear relevant caches after creation
8. **Rate Limiting**: Limit task creation to prevent spam (e.g., 100 tasks/hour/user)