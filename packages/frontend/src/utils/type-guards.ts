// Type guard utility functions for runtime type checking

import type {
  User,
  Task,
  Repository,
  TaskStatus,
  TaskPriority,
  UserRole,
  NotificationType,
} from '../types/common'

// Basic type guards
export const isString = (value: unknown): value is string => {
  return typeof value === 'string'
}

export const isNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value)
}

export const isBoolean = (value: unknown): value is boolean => {
  return typeof value === 'boolean'
}

export const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export const isArray = <T = unknown>(value: unknown): value is T[] => {
  return Array.isArray(value)
}

export const isFunction = <T extends (...args: any[]) => any>(value: unknown): value is T => {
  return typeof value === 'function'
}

export const isNull = (value: unknown): value is null => {
  return value === null
}

export const isUndefined = (value: unknown): value is undefined => {
  return value === undefined
}

export const isNullOrUndefined = (value: unknown): value is null | undefined => {
  return value === null || value === undefined
}

// Entity type guards
export const isUser = (value: unknown): value is User => {
  if (!isObject(value)) return false

  const user = value as Record<string, unknown>
  return (
    isString(user.id) &&
    isString(user.name) &&
    isString(user.email) &&
    isUserRole(user.role) &&
    isBoolean(user.isActive)
  )
}

export const isTask = (value: unknown): value is Task => {
  if (!isObject(value)) return false

  const task = value as Record<string, unknown>
  return (
    isString(task.id) &&
    isString(task.title) &&
    isString(task.description) &&
    isTaskStatus(task.status) &&
    isTaskPriority(task.priority) &&
    isString(task.projectId) &&
    isArray<string>(task.tags)
  )
}

export const isRepository = (value: unknown): value is Repository => {
  if (!isObject(value)) return false

  const repo = value as Record<string, unknown>
  return (
    isString(repo.id) &&
    isString(repo.name) &&
    isString(repo.path) &&
    isString(repo.branch) &&
    isString(repo.status)
  )
}

// Enum type guards
export const isTaskStatus = (value: unknown): value is TaskStatus => {
  return (
    isString(value) && ['pending', 'in-progress', 'done', 'blocked', 'deferred'].includes(value)
  )
}

export const isTaskPriority = (value: unknown): value is TaskPriority => {
  return isString(value) && ['low', 'medium', 'high'].includes(value)
}

export const isUserRole = (value: unknown): value is UserRole => {
  return isString(value) && ['developer', 'team_lead', 'manager'].includes(value)
}

export const isNotificationType = (value: unknown): value is NotificationType => {
  return isString(value) && ['info', 'success', 'warning', 'error'].includes(value)
}

// Array type guards
export const isArrayOf = <T>(
  value: unknown,
  itemGuard: (item: unknown) => item is T
): value is T[] => {
  return isArray(value) && value.every(itemGuard)
}

export const isStringArray = (value: unknown): value is string[] => {
  return isArrayOf(value, isString)
}

export const isNumberArray = (value: unknown): value is number[] => {
  return isArrayOf(value, isNumber)
}

// Utility type guard creators
export const createEnumGuard = <T extends string>(validValues: readonly T[]) => {
  return (value: unknown): value is T => {
    return isString(value) && validValues.includes(value as T)
  }
}

export const createObjectGuard = <T extends Record<string, unknown>>(schema: {
  [K in keyof T]: (value: unknown) => value is T[K]
}) => {
  return (value: unknown): value is T => {
    if (!isObject(value)) return false

    for (const [key, guard] of Object.entries(schema)) {
      if (!guard((value as Record<string, unknown>)[key])) {
        return false
      }
    }

    return true
  }
}

// Assertion functions
export function assertDefined<T>(
  value: T | null | undefined,
  message?: string
): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message || 'Value is null or undefined')
  }
}

export function assertString(value: unknown, message?: string): asserts value is string {
  if (!isString(value)) {
    throw new Error(message || 'Value is not a string')
  }
}

export function assertNumber(value: unknown, message?: string): asserts value is number {
  if (!isNumber(value)) {
    throw new Error(message || 'Value is not a number')
  }
}

export function assertArray<T = unknown>(value: unknown, message?: string): asserts value is T[] {
  if (!isArray(value)) {
    throw new Error(message || 'Value is not an array')
  }
}
