# Task Form Hooks

This directory contains reusable React hooks for managing task forms. These hooks follow the single responsibility principle and can be composed together for complex form behaviors.

## Available Hooks

### useTaskForm
Main hook that orchestrates form state, validation, and submission. Good for simple forms or as a starting point.

```typescript
const {
  formData,
  validationErrors,
  isLoading,
  updateField,
  handleSubmit
} = useTaskForm({
  initialData: task,
  onSubmit: async (data) => {
    await saveTask(data)
  }
})
```

### useFormField
Manages individual field state with validation and touched state.

```typescript
const titleField = useFormField({
  initialValue: '',
  validate: (value) => {
    if (!value.trim()) return 'Title is required'
    if (value.length < 3) return 'Title too short'
    return undefined
  },
  debounceMs: 300 // Debounce validation
})

// In your component
<input
  value={titleField.value}
  onChange={(e) => titleField.setValue(e.target.value)}
  onBlur={() => titleField.setTouched(true)}
/>
{titleField.error && titleField.touched && (
  <span className="error">{titleField.error}</span>
)}
```

### useTaskValidation
Provides validation logic that can be reused across different forms.

```typescript
const { validateField, validateForm } = useTaskValidation({
  titleMinLength: 5,
  titleMaxLength: 100,
  requirePriority: true
})

// Validate single field
const error = validateField('title', formData.title)

// Validate entire form
const errors = validateForm(formData)
```

### useTaskSubmit
Handles form submission with loading states and error handling.

```typescript
const {
  isSubmitting,
  submitError,
  submit
} = useTaskSubmit(
  async (data) => {
    await api.createTask(data)
  },
  () => console.log('Success!'),
  (error) => console.error('Failed:', error)
)

// In your form
<form onSubmit={(e) => {
  e.preventDefault()
  submit(formData, {
    validateBeforeSubmit: () => validateForm(formData)
  })
}}>
```

### useTaskDependencies
Manages task dependencies with cycle detection.

```typescript
const {
  dependencies,
  availableForDependency,
  toggleDependency,
  hasCyclicDependency
} = useTaskDependencies({
  availableTasks: allTasks,
  currentTaskId: task?.id
})

// In your component
{availableForDependency.map(task => (
  <label key={task.id}>
    <input
      type="checkbox"
      checked={dependencies.includes(task.id)}
      onChange={() => toggleDependency(task.id)}
      disabled={hasCyclicDependency(task.id)}
    />
    {task.title}
  </label>
))}
```

### useTaskTags
Manages tags with validation and suggestions.

```typescript
const {
  tags,
  suggestedTags,
  addTag,
  removeTag,
  validateTag
} = useTaskTags({
  maxTags: 5,
  availableTags: ['bug', 'feature', 'urgent'],
  allowCustomTags: true
})

// Add tag from input
const handleAddTag = (input: string) => {
  const error = validateTag(input)
  if (error) {
    showError(error)
  } else {
    addTag(input)
  }
}
```

## Composing Hooks Together

For complex forms, you can compose multiple hooks:

```typescript
function TaskFormExample() {
  // Field-level state
  const titleField = useFormField({ 
    initialValue: task?.title || '',
    validate: (v) => !v.trim() ? 'Required' : undefined
  })
  
  const descriptionField = useFormField({
    initialValue: task?.description || '',
    validate: (v) => !v.trim() ? 'Required' : undefined
  })

  // Dependencies management
  const deps = useTaskDependencies({
    availableTasks,
    currentTaskId: task?.id
  })

  // Tags management  
  const tags = useTaskTags({
    initialTags: task?.tags || [],
    maxTags: 5
  })

  // Form submission
  const { submit, isSubmitting } = useTaskSubmit(
    async (data) => {
      await api.saveTask(data)
    }
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all fields
    const titleValid = titleField.validate()
    const descValid = descriptionField.validate()
    
    if (titleValid && descValid) {
      await submit({
        title: titleField.value,
        description: descriptionField.value,
        dependencies: deps.dependencies,
        tags: tags.tags
      })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields using the hooks */}
    </form>
  )
}
```

## Best Practices

1. **Use individual hooks for complex forms** - Instead of one large form state, use multiple focused hooks
2. **Validate on blur** - Set touched state on blur to show errors at the right time
3. **Debounce expensive validations** - Use the debounceMs option for async validations
4. **Handle loading states** - Always show loading indicators during submission
5. **Compose hooks** - Combine multiple hooks for complex behaviors
6. **Type your data** - Use TypeScript interfaces for form data