# Optimistic Updates for Task Creation

## Overview

The TaskMaster UI implements optimistic updates for task creation to provide a smooth and responsive user experience. When a user creates a new task, the UI immediately updates to show the task without waiting for the server response, then reconciles with the actual server data once the request completes.

## Implementation Details

### 1. Optimistic Task Creation Hook

Located in: `packages/frontend/src/hooks/useOptimisticTaskCreation.ts`

This custom hook handles the optimistic update logic for task creation:

```typescript
const { isCreating, createError, createTaskOptimistically, clearCreateError } = useOptimisticTaskCreation({
  repositoryPath,
  onCreateSuccess: (task) => {
    // Handle successful creation
  },
  onCreateError: (error) => {
    // Handle creation errors
  },
  optimisticUpdates: true,
})
```

### 2. How It Works

#### Temporary ID Generation
- Optimistic tasks are assigned negative timestamps as IDs to ensure uniqueness
- Example: `-1704067200000` (negative timestamp)
- This prevents conflicts with real task IDs from the server

#### Data Flow
1. **User creates task** → Form submission
2. **Generate temporary task** → Assign negative ID and `_optimistic` flag
3. **Update UI immediately** → Add task to board with visual indicators
4. **Send request to server** → POST /api/tasks
5. **Server responds** → Either success or error
6. **Update UI with real data** → Replace temporary task or remove on error

#### Visual Indicators
- **Optimistic tasks** have:
  - Reduced opacity (70%)
  - Gradient background (blue-50 to white)
  - Pulse animation
  - "Saving..." spinner instead of edit button
  - Disabled interactions (no dragging/editing)

### 3. Error Handling

When task creation fails:
1. The optimistic task is removed from the UI
2. An error notification is displayed
3. The form remains open for retry
4. Form data is preserved

### 4. Success Handling

When task creation succeeds:
1. Temporary task is replaced with real task data
2. Success notification is displayed
3. Task gets real ID from server
4. Full interactions are enabled
5. Board refreshes to ensure consistency

## Code Structure

### Key Components

#### useOptimisticTaskCreation Hook
```typescript
export interface UseOptimisticTaskCreationReturn {
  isCreating: boolean
  createError: string | null
  createTaskOptimistically: (
    taskData: Partial<Task>,
    currentBoardData: TaskBoardData | null
  ) => Promise<{ boardData: TaskBoardData | null; task: Task | null }>
  clearCreateError: () => void
}
```

#### TaskBoardManager Integration
The `TaskBoardManager` component uses the hook to handle task creation:
```typescript
if (modalMode === 'create') {
  const { boardData, task } = await createTaskOptimistically(taskData, currentTaskBoardData)
  
  if (boardData) {
    // Apply optimistic update immediately
    setLocalTaskBoardData(boardData)
  }
}
```

#### TaskCard Visual Feedback
The `TaskCard` component detects optimistic tasks and displays appropriate UI:
```typescript
const isOptimistic = task.id < 0 || (task as any)._optimistic === true

// Apply visual styling
className={`... ${isOptimistic ? 'opacity-70 bg-gradient-to-r from-blue-50 to-white animate-pulse' : ''}`}

// Show saving indicator
{isOptimistic && (
  <div className="absolute right-2 top-2 flex items-center gap-1 text-xs text-blue-600">
    <svg className="animate-spin h-4 w-4">...</svg>
    <span className="font-medium">Saving...</span>
  </div>
)}
```

## Benefits

1. **Instant Feedback**: Users see their task immediately without waiting
2. **Smooth Experience**: No loading delays or UI freezing
3. **Error Recovery**: Graceful handling of failures with automatic cleanup
4. **Clear Communication**: Visual indicators show saving state
5. **Consistency**: Automatic reconciliation with server data

## Configuration

Optimistic updates can be disabled by setting `optimisticUpdates: false` in the hook options:

```typescript
const { createTaskOptimistically } = useOptimisticTaskCreation({
  repositoryPath,
  optimisticUpdates: false, // Disable optimistic updates
})
```

## Testing Considerations

### Unit Tests
- Test temporary ID generation
- Test optimistic board updates
- Test error rollback
- Test success replacement

### Integration Tests
- Test full creation flow with network delays
- Test error scenarios and rollback
- Test concurrent creations
- Test UI state consistency

### E2E Tests
- Verify visual indicators appear
- Test user interactions during saving
- Verify final state after server response
- Test network failure scenarios

## Future Enhancements

1. **Offline Support**: Queue tasks for creation when offline
2. **Conflict Resolution**: Handle concurrent edits by multiple users
3. **Retry Logic**: Automatic retry with exponential backoff
4. **Partial Updates**: Update only changed fields optimistically
5. **Undo/Redo**: Allow undoing optimistic changes before server confirms