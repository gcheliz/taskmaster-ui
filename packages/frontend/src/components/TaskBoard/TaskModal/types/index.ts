export type TaskModalMode = 'create' | 'edit' | 'view'

export interface ValidationErrors {
  title?: string
  description?: string
  priority?: string
  status?: string
  dueDate?: string
}