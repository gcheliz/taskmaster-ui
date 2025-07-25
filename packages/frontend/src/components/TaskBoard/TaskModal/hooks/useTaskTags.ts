import { useState, useCallback, useMemo } from 'react'

export interface UseTaskTagsOptions {
  initialTags?: string[]
  maxTags?: number
  availableTags?: string[]
  allowCustomTags?: boolean
}

export interface UseTaskTagsReturn {
  tags: string[]
  suggestedTags: string[]
  addTag: (tag: string) => boolean
  removeTag: (tag: string) => void
  toggleTag: (tag: string) => void
  setTags: (tags: string[]) => void
  validateTag: (tag: string) => string | undefined
  canAddTag: (tag: string) => boolean
}

/**
 * Hook for managing task tags
 * Handles tag addition, removal, validation, and suggestions
 */
export function useTaskTags({
  initialTags = [],
  maxTags = 10,
  availableTags = [],
  allowCustomTags = true,
}: UseTaskTagsOptions = {}): UseTaskTagsReturn {
  const [tags, setTags] = useState<string[]>(initialTags)

  // Generate tag suggestions based on available tags and current input
  const suggestedTags = useMemo(() => {
    return availableTags.filter((tag) => !tags.includes(tag))
  }, [availableTags, tags])

  const validateTag = useCallback(
    (tag: string): string | undefined => {
      const trimmedTag = tag.trim()

      if (!trimmedTag) {
        return 'Tag cannot be empty'
      }

      if (trimmedTag.length < 2) {
        return 'Tag must be at least 2 characters'
      }

      if (trimmedTag.length > 30) {
        return 'Tag must be less than 30 characters'
      }

      if (!/^[a-zA-Z0-9-_]+$/.test(trimmedTag)) {
        return 'Tag can only contain letters, numbers, hyphens, and underscores'
      }

      if (tags.includes(trimmedTag)) {
        return 'Tag already exists'
      }

      if (tags.length >= maxTags) {
        return `Maximum ${maxTags} tags allowed`
      }

      if (!allowCustomTags && !availableTags.includes(trimmedTag)) {
        return 'Custom tags are not allowed'
      }

      return undefined
    },
    [tags, maxTags, allowCustomTags, availableTags]
  )

  const canAddTag = useCallback(
    (tag: string): boolean => {
      return validateTag(tag) === undefined
    },
    [validateTag]
  )

  const addTag = useCallback(
    (tag: string): boolean => {
      const trimmedTag = tag.trim()
      const error = validateTag(trimmedTag)

      if (error) {
        return false
      }

      setTags((prev) => [...prev, trimmedTag])
      return true
    },
    [validateTag]
  )

  const removeTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }, [])

  const toggleTag = useCallback(
    (tag: string) => {
      if (tags.includes(tag)) {
        removeTag(tag)
      } else {
        addTag(tag)
      }
    },
    [tags, addTag, removeTag]
  )

  const handleSetTags = useCallback(
    (newTags: string[]) => {
      // Validate all tags before setting
      const validTags = newTags
        .map((tag) => tag.trim())
        .filter((tag) => tag && validateTag(tag) === undefined)
        .slice(0, maxTags)

      setTags(validTags)
    },
    [validateTag, maxTags]
  )

  return {
    tags,
    suggestedTags,
    addTag,
    removeTag,
    toggleTag,
    setTags: handleSetTags,
    validateTag,
    canAddTag,
  }
}