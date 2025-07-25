# Task Creation Validation and Error Handling

## Overview

The TaskMaster UI implements comprehensive validation and error handling at multiple layers to ensure data integrity and provide excellent user experience. This document covers all validation rules and error handling mechanisms implemented in the task creation flow.

## Validation Layers

### 1. Frontend Client-Side Validation

Located in: `packages/frontend/src/components/TaskBoard/TaskModal/hooks/useTaskForm.ts`

#### Field Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| **Title** | Required | "Title is required" |
| | Min 3 characters | "Title must be at least 3 characters long" |
| | Max 100 characters | "Title must be less than 100 characters" |
| **Description** | Required | "Description is required" |
| | Min 10 characters | "Description must be at least 10 characters long" |
| | Max 500 characters | "Description must be less than 500 characters" |
| **Priority** | Required | "Priority is required" |
| | Must be: high/medium/low | Dropdown prevents invalid values |
| **Status** | Required | "Status is required" |
| | Must be valid status | Dropdown prevents invalid values |
| **Due Date** | Optional | - |
| | Cannot be in past | "Due date cannot be in the past" |
| **Estimated Hours** | Optional | - |
| | Must be numeric | Input type="number" prevents non-numeric |
| | Min 0 | Input min="0" prevents negative |
| **Tags** | Optional | - |
| | Comma-separated | Automatically parsed and trimmed |

#### Validation Timing
- **On Submit**: All fields validated before form submission
- **On Blur**: Individual fields can be validated when focus lost (future enhancement)
- **Real-time**: Validation errors cleared when user starts typing

### 2. Backend Request Validation

Located in: `packages/backend/src/routes/taskMasterRoutes.ts`

#### Request Schema Validation

```typescript
TaskCreateRequest = {
  repositoryPath: string (required),
  title: string (required, 3-100 chars),
  description: string (required, 10-500 chars),
  priority: enum['low', 'medium', 'high', 'urgent'] (required),
  status: enum['pending', 'in-progress', 'done', 'blocked', 'deferred'],
  assignedTo: string (optional, username/email),
  dueDate: string (optional, ISO 8601, future date),
  estimatedHours: number (optional, 0-999),
  tags: string[] (optional, max 10, pattern: ^[a-zA-Z0-9-_]+$),
  dependencies: number[] (optional),
  details: string (optional),
  testStrategy: string (optional)
}
```

#### Custom Validators

1. **Repository Path Security**
   - No directory traversal (.., ~)
   - Max length 500 characters
   - Must be absolute path

2. **Due Date Validation**
   - Must be valid ISO 8601 format
   - Cannot be in the past
   - Timezone handled properly

3. **Tags Validation**
   - Max 10 tags
   - Each tag must match pattern: `^[a-zA-Z0-9-_]+$`
   - No special characters except hyphen and underscore

### 3. Backend Business Logic Validation

Located in: `packages/backend/src/controllers/taskMasterController.ts`

#### Pre-Creation Checks

1. **Repository Initialization**
   - Verifies TaskMaster is initialized in repository
   - Returns 400 if not initialized

2. **Task ID Generation**
   - Fetches current tasks to determine next ID
   - Ensures unique task IDs

3. **Dependency Validation**
   - Checks all dependency IDs exist
   - Returns specific error listing invalid IDs

4. **Circular Dependency Prevention**
   - Prevents subtask from depending on parent
   - Returns 400 with CIRCULAR_DEPENDENCY error

## Error Handling Mechanisms

### Frontend Error Handling

#### 1. Form Validation Errors
```typescript
// In useTaskForm hook
const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

// Display in TaskForm component
{validationErrors.title && (
  <span className="text-sm text-red-600">{validationErrors.title}</span>
)}
```

#### 2. API Error Handling
```typescript
// In TaskBoardManager
try {
  const newTask = await taskService.createTask(taskData, repositoryPath)
  showSuccess(`Task "${newTask.title}" created successfully`)
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Failed to save task'
  showError(errorMessage)
  throw error // Re-throw to let modal handle error state
}
```

#### 3. Error Display Components
- **ErrorAlert**: Displays errors at top of modal
- **Field-level errors**: Shown below each input
- **Toast notifications**: For success/error feedback

### Backend Error Handling

#### 1. Validation Errors (400)
```typescript
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title must be at least 3 characters long",
    "details": {
      "field": "title",
      "value": "Hi"
    }
  }
}
```

#### 2. Business Logic Errors
```typescript
// Invalid dependencies
{
  "error": {
    "code": "INVALID_DEPENDENCY",
    "message": "Dependencies not found: 123, 456"
  }
}

// Circular dependency
{
  "error": {
    "code": "CIRCULAR_DEPENDENCY", 
    "message": "A subtask cannot depend on its parent task"
  }
}
```

#### 3. Server Errors (500)
```typescript
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred",
    "correlationId": "req_123456_abc"
  }
}
```

## Error Recovery

### Frontend Recovery
1. **Form State Preservation**: Form data retained on error
2. **Error Dismissal**: Users can dismiss error alerts
3. **Retry Capability**: Submit button re-enabled after error
4. **Field Correction**: Errors clear when user fixes input

### Backend Recovery
1. **Request Logging**: All requests logged with correlation IDs
2. **Detailed Errors**: Development mode includes stack traces
3. **Safe Error Messages**: Production mode hides sensitive details
4. **Rate Limiting**: Prevents abuse of error-inducing requests

## User Experience Features

### Loading States
- Submit button shows loading spinner
- Form fields disabled during submission
- Modal cannot be closed during save
- Prevents duplicate submissions

### Success Feedback
- Toast notification with task title
- Modal automatically closes
- Task list refreshes
- New task immediately visible

### Error Feedback
- Clear error messages
- Field highlighting with red borders
- Actionable error descriptions
- Preserved form data for retry

## Testing Validation

### Unit Tests
- Form validation logic
- Individual field validators
- Error message generation
- Validation rule enforcement

### Integration Tests
- Full form submission flow
- API error handling
- Success path validation
- Network error simulation

### E2E Tests
- Complete task creation
- Error recovery flows
- Form interaction
- Visual error display

## Best Practices Implemented

1. **Progressive Enhancement**: Client validates first, server validates always
2. **Clear Messaging**: User-friendly error messages
3. **Accessibility**: ARIA labels for error states
4. **Security**: Input sanitization and validation
5. **Performance**: Debounced validation for real-time feedback
6. **Consistency**: Same validation rules frontend and backend

## Future Enhancements

1. **Real-time Validation**: Validate fields as user types
2. **Async Validation**: Check title uniqueness before submit
3. **Smart Suggestions**: Help users fix validation errors
4. **Batch Validation**: Validate multiple tasks at once
5. **Custom Rules**: Project-specific validation rules