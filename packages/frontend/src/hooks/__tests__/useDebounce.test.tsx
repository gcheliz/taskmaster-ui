import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '../useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500))
    
    expect(result.current).toBe('initial')
  })

  it('debounces value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 }
      }
    )

    expect(result.current).toBe('initial')

    // Change value
    rerender({ value: 'updated', delay: 500 })
    
    // Value should not update immediately
    expect(result.current).toBe('initial')

    // Fast forward time
    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Now value should be updated
    expect(result.current).toBe('updated')
  })

  it('cancels previous timeout on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 }
      }
    )

    // First update
    rerender({ value: 'update1', delay: 500 })
    
    act(() => {
      vi.advanceTimersByTime(300)
    })
    
    // Value should still be initial
    expect(result.current).toBe('initial')

    // Second update before timeout
    rerender({ value: 'update2', delay: 500 })
    
    act(() => {
      vi.advanceTimersByTime(300)
    })
    
    // Value should still be initial (first timeout cancelled)
    expect(result.current).toBe('initial')

    act(() => {
      vi.advanceTimersByTime(200)
    })

    // Now only the second update should be applied
    expect(result.current).toBe('update2')
  })

  it('handles different delay values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 1000 }
      }
    )

    rerender({ value: 'updated', delay: 1000 })

    act(() => {
      vi.advanceTimersByTime(500)
    })
    
    // Should not update yet
    expect(result.current).toBe('initial')

    act(() => {
      vi.advanceTimersByTime(500)
    })
    
    // Now should update
    expect(result.current).toBe('updated')
  })

  it('updates immediately when delay is 0', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 0 }
      }
    )

    rerender({ value: 'updated', delay: 0 })

    act(() => {
      vi.runAllTimers()
    })

    expect(result.current).toBe('updated')
  })

  it('handles null and undefined values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: null as string | null, delay: 500 }
      }
    )

    expect(result.current).toBe(null)

    rerender({ value: undefined as string | undefined, delay: 500 })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current).toBe(undefined)
  })

  it('cleans up timeout on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
    
    const { unmount, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 }
      }
    )

    rerender({ value: 'updated', delay: 500 })

    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()
    
    clearTimeoutSpy.mockRestore()
  })

  it('handles complex objects', () => {
    const initialObj = { foo: 'bar', count: 1 }
    const updatedObj = { foo: 'baz', count: 2 }
    
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: initialObj, delay: 500 }
      }
    )

    expect(result.current).toEqual(initialObj)

    rerender({ value: updatedObj, delay: 500 })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current).toEqual(updatedObj)
  })

  it('handles arrays', () => {
    const initialArray = [1, 2, 3]
    const updatedArray = [4, 5, 6]
    
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: initialArray, delay: 500 }
      }
    )

    expect(result.current).toEqual(initialArray)

    rerender({ value: updatedArray, delay: 500 })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current).toEqual(updatedArray)
  })

  it('preserves reference equality for unchanged values', () => {
    const value = { foo: 'bar' }
    
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value, delay: 500 }
      }
    )

    const initialResult = result.current

    // Rerender with same value
    rerender({ value, delay: 500 })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Reference should be the same
    expect(result.current).toBe(initialResult)
  })
})