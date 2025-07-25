# Export API Design

## Overview
API endpoints for exporting task and analytics data in multiple formats (CSV, JSON).

## Endpoints

### 1. Export Tasks
```
GET /api/export/tasks
```

#### Query Parameters
- `format` (required): Export format - `csv` | `json`
- `projectId` (optional): Filter by project ID
- `status` (optional): Filter by task status - `pending` | `in_progress` | `completed` | `archived`
- `priority` (optional): Filter by priority - `low` | `medium` | `high`
- `assigneeId` (optional): Filter by assignee
- `dateFrom` (optional): Filter tasks created after this date (ISO 8601)
- `dateTo` (optional): Filter tasks created before this date (ISO 8601)
- `includeSubtasks` (optional): Include subtasks in export - `true` | `false` (default: true)
- `fields` (optional): Comma-separated list of fields to include

#### Headers
```
Content-Type: application/json | text/csv
Content-Disposition: attachment; filename="tasks-export-{timestamp}.{ext}"
X-Total-Count: {number}
```

#### Response (JSON)
```json
{
  "data": [
    {
      "id": "task-1",
      "title": "Task Title",
      "description": "Task description",
      "status": "in_progress",
      "priority": "high",
      "assignee": {
        "id": "user-1",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "project": {
        "id": "project-1",
        "name": "Project Name"
      },
      "tags": ["tag1", "tag2"],
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-16T14:20:00Z",
      "dueDate": "2024-01-30T23:59:59Z",
      "completedAt": null,
      "subtasks": [
        {
          "id": "subtask-1",
          "title": "Subtask Title",
          "status": "completed",
          "completedAt": "2024-01-16T10:00:00Z"
        }
      ]
    }
  ],
  "metadata": {
    "totalCount": 150,
    "exportedCount": 150,
    "exportDate": "2024-01-20T15:30:00Z",
    "filters": {
      "projectId": "project-1",
      "status": "in_progress"
    }
  }
}
```

#### Response (CSV)
```csv
ID,Title,Description,Status,Priority,Assignee Name,Assignee Email,Project,Tags,Created At,Updated At,Due Date,Completed At
task-1,"Task Title","Task description",in_progress,high,"John Doe",john@example.com,"Project Name","tag1,tag2",2024-01-15T10:30:00Z,2024-01-16T14:20:00Z,2024-01-30T23:59:59Z,
```

### 2. Export Analytics
```
GET /api/export/analytics
```

#### Query Parameters
- `format` (required): Export format - `csv` | `json`
- `type` (required): Analytics type - `task_summary` | `user_performance` | `project_metrics` | `time_tracking`
- `projectId` (optional): Filter by project ID
- `userId` (optional): Filter by user ID (for user_performance)
- `dateFrom` (required): Start date for analytics period (ISO 8601)
- `dateTo` (required): End date for analytics period (ISO 8601)
- `groupBy` (optional): Group results by - `day` | `week` | `month` (default: day)

#### Response (JSON - Task Summary)
```json
{
  "data": {
    "summary": {
      "totalTasks": 500,
      "completedTasks": 350,
      "inProgressTasks": 100,
      "pendingTasks": 50,
      "completionRate": 0.70,
      "averageCompletionTime": "5.2 days"
    },
    "byPriority": {
      "high": { "total": 150, "completed": 120, "rate": 0.80 },
      "medium": { "total": 250, "completed": 180, "rate": 0.72 },
      "low": { "total": 100, "completed": 50, "rate": 0.50 }
    },
    "byProject": [
      {
        "projectId": "project-1",
        "projectName": "Project Alpha",
        "totalTasks": 200,
        "completedTasks": 150,
        "completionRate": 0.75
      }
    ],
    "timeline": [
      {
        "date": "2024-01-15",
        "created": 10,
        "completed": 8,
        "inProgress": 15
      }
    ]
  },
  "metadata": {
    "exportDate": "2024-01-20T15:30:00Z",
    "period": {
      "from": "2024-01-01T00:00:00Z",
      "to": "2024-01-31T23:59:59Z"
    },
    "type": "task_summary",
    "groupBy": "day"
  }
}
```

### 3. Export Repository Activity
```
GET /api/export/repository-activity
```

#### Query Parameters
- `format` (required): Export format - `csv` | `json`
- `repositoryId` (required): Repository ID
- `dateFrom` (optional): Start date (ISO 8601)
- `dateTo` (optional): End date (ISO 8601)
- `includeCommits` (optional): Include commit history - `true` | `false` (default: false)

### 4. Export Progress (for large exports)
```
GET /api/export/progress/{exportId}
```

#### Response
```json
{
  "exportId": "export-123",
  "status": "processing", // processing | completed | failed
  "progress": 0.65,
  "totalRecords": 10000,
  "processedRecords": 6500,
  "estimatedTimeRemaining": 30, // seconds
  "downloadUrl": null // populated when completed
}
```

### 5. Initiate Large Export (Async)
```
POST /api/export/async
```

#### Request Body
```json
{
  "type": "tasks", // tasks | analytics | repository-activity
  "format": "csv",
  "filters": {
    // Same as query parameters for respective export endpoints
  },
  "notifyEmail": "user@example.com" // Optional email notification
}
```

#### Response
```json
{
  "exportId": "export-123",
  "status": "initiated",
  "estimatedRecords": 10000,
  "estimatedTime": 120 // seconds
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid format specified",
  "code": "INVALID_FORMAT",
  "validFormats": ["csv", "json"]
}
```

### 413 Payload Too Large
```json
{
  "error": "Export size exceeds limit",
  "code": "EXPORT_TOO_LARGE",
  "recordCount": 100000,
  "limit": 50000,
  "suggestion": "Use async export endpoint for large datasets"
}
```

### 429 Too Many Requests
```json
{
  "error": "Export rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 300 // seconds
}
```

## Implementation Notes

1. **Security**
   - Validate user permissions for data access
   - Sanitize CSV output to prevent injection attacks
   - Apply rate limiting per user

2. **Performance**
   - Stream large exports instead of loading all data in memory
   - Use database cursors for efficient data retrieval
   - Implement caching for frequently requested exports

3. **CSV Formatting**
   - Escape special characters properly
   - Handle multi-line text fields
   - Use UTF-8 encoding with BOM for Excel compatibility

4. **File Naming**
   - Include timestamp: `tasks-export-20240120-153000.csv`
   - Include filters in filename when applicable

5. **Limits**
   - Synchronous export: Max 50,000 records
   - Async export: Max 1,000,000 records
   - Rate limit: 10 exports per hour per user