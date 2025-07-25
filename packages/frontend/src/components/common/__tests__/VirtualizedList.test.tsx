import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VirtualizedList } from '../VirtualizedList'
import userEvent from '@testing-library/user-event'

describe('VirtualizedList', () => {
  const mockItems = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    name: `Item ${i}`
  }))

  const defaultProps = {
    items: mockItems,
    height: 400,
    itemHeight: 50,
    renderItem: (item: any) => (
      <div data-testid={`item-${item.id}`}>{item.name}</div>
    ),
    getItemKey: (index: number) => `item-${mockItems[index].id}`
  }

  describe('Rendering', () => {
    it('renders visible items only', () => {
      render(<VirtualizedList {...defaultProps} />)
      
      // With height 400 and itemHeight 50, should show ~8 items + overscan
      const visibleItems = screen.getAllByTestId(/^item-/)
      expect(visibleItems.length).toBeLessThan(20) // Much less than 100
      expect(visibleItems.length).toBeGreaterThan(5) // But more than just visible
    })

    it('renders with custom className', () => {
      const { container } = render(
        <VirtualizedList {...defaultProps} className="custom-class" />
      )
      
      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })

    it('applies gap between items', () => {
      const { container } = render(
        <VirtualizedList {...defaultProps} gap={10} />
      )
      
      const listContainer = container.querySelector('[style*="gap"]')
      expect(listContainer).toBeInTheDocument()
    })

    it('renders empty state when no items', () => {
      render(<VirtualizedList {...defaultProps} items={[]} />)
      
      const items = screen.queryAllByTestId(/^item-/)
      expect(items).toHaveLength(0)
    })
  })

  describe('Scrolling', () => {
    it('renders different items when scrolled', async () => {
      const { container } = render(<VirtualizedList {...defaultProps} />)
      
      // Check initial items
      expect(screen.getByText('Item 0')).toBeInTheDocument()
      expect(screen.queryByText('Item 50')).not.toBeInTheDocument()
      
      // Simulate scroll
      const scrollContainer = container.querySelector('[data-testid="virtualized-list"]')
      if (scrollContainer) {
        // Scroll to middle
        Object.defineProperty(scrollContainer, 'scrollTop', {
          writable: true,
          value: 2500 // 50 items * 50px height
        })
        scrollContainer.dispatchEvent(new Event('scroll'))
      }
      
      // Should now see middle items
      await vi.waitFor(() => {
        expect(screen.queryByText('Item 0')).not.toBeInTheDocument()
        expect(screen.getByText('Item 50')).toBeInTheDocument()
      })
    })

    it('maintains scroll position when items update', () => {
      const { rerender, container } = render(<VirtualizedList {...defaultProps} />)
      
      const scrollContainer = container.querySelector('[data-testid="virtualized-list"]')
      if (scrollContainer) {
        // Set scroll position
        Object.defineProperty(scrollContainer, 'scrollTop', {
          writable: true,
          value: 1000
        })
        scrollContainer.dispatchEvent(new Event('scroll'))
      }
      
      // Update items
      const newItems = mockItems.map(item => ({ ...item, name: `Updated ${item.name}` }))
      rerender(<VirtualizedList {...defaultProps} items={newItems} />)
      
      // Scroll position should be maintained
      expect(scrollContainer?.scrollTop).toBe(1000)
    })
  })

  describe('Performance', () => {
    it('uses overscan to prerender items', () => {
      render(<VirtualizedList {...defaultProps} overscan={3} />)
      
      // Should render visible items + overscan on both sides
      const visibleItems = screen.getAllByTestId(/^item-/)
      const expectedCount = Math.ceil(400 / 50) + (3 * 2) // visible + overscan top/bottom
      expect(visibleItems.length).toBeCloseTo(expectedCount, 2)
    })

    it('recalculates on resize', () => {
      const { container, rerender } = render(<VirtualizedList {...defaultProps} />)
      
      const initialItems = screen.getAllByTestId(/^item-/)
      const initialCount = initialItems.length
      
      // Change height
      rerender(<VirtualizedList {...defaultProps} height={200} />)
      
      const newItems = screen.getAllByTestId(/^item-/)
      expect(newItems.length).toBeLessThan(initialCount)
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      const { container } = render(<VirtualizedList {...defaultProps} />)
      
      const list = container.querySelector('[role="list"]')
      expect(list).toBeInTheDocument()
      expect(list).toHaveAttribute('aria-rowcount', '100')
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      const { container } = render(<VirtualizedList {...defaultProps} />)
      
      const scrollContainer = container.querySelector('[data-testid="virtualized-list"]')
      expect(scrollContainer).toHaveAttribute('tabIndex', '0')
      
      // Focus the list
      await user.click(scrollContainer!)
      expect(scrollContainer).toHaveFocus()
    })
  })

  describe('Edge Cases', () => {
    it('handles very tall items', () => {
      render(
        <VirtualizedList
          {...defaultProps}
          itemHeight={200}
          height={400}
        />
      )
      
      // Should show fewer items
      const visibleItems = screen.getAllByTestId(/^item-/)
      expect(visibleItems.length).toBeLessThan(10)
    })

    it('handles dynamic item heights gracefully', () => {
      const dynamicRenderItem = (item: any, index: number) => (
        <div
          data-testid={`item-${item.id}`}
          style={{ height: index % 2 === 0 ? 50 : 100 }}
        >
          {item.name}
        </div>
      )
      
      render(
        <VirtualizedList
          {...defaultProps}
          renderItem={dynamicRenderItem}
        />
      )
      
      // Should still render without errors
      expect(screen.getAllByTestId(/^item-/)).toBeTruthy()
    })

    it('handles rapid scroll events', async () => {
      const { container } = render(<VirtualizedList {...defaultProps} />)
      const scrollContainer = container.querySelector('[data-testid="virtualized-list"]')
      
      if (scrollContainer) {
        // Simulate rapid scrolling
        for (let i = 0; i < 10; i++) {
          Object.defineProperty(scrollContainer, 'scrollTop', {
            writable: true,
            value: i * 100
          })
          scrollContainer.dispatchEvent(new Event('scroll'))
        }
      }
      
      // Should handle without errors
      expect(screen.getAllByTestId(/^item-/)).toBeTruthy()
    })
  })
})