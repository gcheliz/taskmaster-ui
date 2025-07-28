import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { SearchField } from '../../components/ui/molecules/SearchField'
import { Button } from '../../components/ui/atoms/Button'

const meta: Meta<typeof SearchField> = {
  title: 'Molecules/SearchField',
  component: SearchField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A versatile search input molecule that combines Input and Button atoms with advanced search functionality. Features controlled/uncontrolled state management, keyboard navigation, clear functionality, and optional search button. Built with atomic design principles for consistent styling and behavior.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'compact'],
      description: 'Visual style variant of the search field',
    },
    inputSize: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size of the input field',
    },
    showClearButton: {
      control: { type: 'boolean' },
      description: 'Whether to show the clear button when input has value',
    },
    showSearchButton: {
      control: { type: 'boolean' },
      description: 'Whether to show the search button',
    },
    isLoading: {
      control: { type: 'boolean' },
      description: 'Loading state for search operations',
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text for the input',
    },
    onSearch: {
      action: 'searched',
      description: 'Callback fired when search is triggered',
    },
    onClear: {
      action: 'cleared',
      description: 'Callback fired when clear button is clicked',
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-lg w-full">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Search...',
    showClearButton: true,
    showSearchButton: false,
    inputSize: 'md',
  },
}

export const WithSearchButton: Story = {
  args: {
    placeholder: 'Search projects...',
    showClearButton: true,
    showSearchButton: true,
    inputSize: 'md',
  },
}

export const Compact: Story = {
  args: {
    variant: 'compact',
    placeholder: 'Quick search',
    showClearButton: true,
    showSearchButton: false,
    inputSize: 'sm',
  },
}

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-6 w-full max-w-2xl">
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">Small Size</label>
        <SearchField inputSize="sm" placeholder="Small search field..." showClearButton={true} />
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Medium Size (Default)
        </label>
        <SearchField inputSize="md" placeholder="Medium search field..." showClearButton={true} />
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">Large Size</label>
        <SearchField inputSize="lg" placeholder="Large search field..." showClearButton={true} />
      </div>
    </div>
  ),
}

export const WithAndWithoutClearButton: Story = {
  render: () => (
    <div className="space-y-6 w-full max-w-2xl">
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          With Clear Button (Default)
        </label>
        <SearchField
          placeholder="Search with clear button..."
          showClearButton={true}
          defaultValue="Sample text"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Without Clear Button
        </label>
        <SearchField
          placeholder="Search without clear button..."
          showClearButton={false}
          defaultValue="Sample text"
        />
      </div>
    </div>
  ),
}

export const SearchButtonVariations: Story = {
  render: () => (
    <div className="space-y-6 w-full max-w-2xl">
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">Input Only</label>
        <SearchField placeholder="Search without button..." showSearchButton={false} />
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          With Search Button
        </label>
        <SearchField placeholder="Search with button..." showSearchButton={true} />
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">Loading State</label>
        <SearchField placeholder="Searching..." showSearchButton={true} isLoading={true} />
      </div>
    </div>
  ),
}

export const ControlledExample: Story = {
  render: () => {
    const [searchValue, setSearchValue] = useState('')
    const [searchHistory, setSearchHistory] = useState<string[]>([])

    const handleSearch = (value: string) => {
      if (value.trim()) {
        setSearchHistory((prev) => [value, ...prev.slice(0, 4)])
      }
    }

    const handleClear = () => {
      setSearchValue('')
    }

    return (
      <div className="w-full max-w-2xl space-y-6">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Controlled Search Field
          </label>
          <SearchField
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onSearch={handleSearch}
            onClear={handleClear}
            placeholder="Type to search..."
            showSearchButton={true}
          />

          <p className="text-xs text-secondary-500 mt-1">Current value: "{searchValue}"</p>
        </div>

        {searchHistory.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-secondary-700 mb-2">Search History</h4>
            <div className="space-y-1">
              {searchHistory.map((term, index) => (
                <div
                  key={index}
                  className="text-sm text-secondary-600 bg-secondary-50 rounded px-2 py-1 cursor-pointer hover:bg-secondary-100"
                  onClick={() => setSearchValue(term)}
                >
                  {term}
                </div>
              ))}
            </div>
            <Button size="sm" variant="ghost" onClick={() => setSearchHistory([])} className="mt-2">
              Clear History
            </Button>
          </div>
        )}
      </div>
    )
  },
}

export const KeyboardNavigation: Story = {
  render: () => {
    const [results, setResults] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const handleSearch = async (value: string) => {
      if (!value.trim()) {
        setResults([])
        return
      }

      setIsLoading(true)
      // Simulate API call
      setTimeout(() => {
        const mockResults = [
          `${value} - Task Management`,
          `${value} - Project Planning`,
          `${value} - Team Collaboration`,
          `${value} - Time Tracking`,
          `${value} - Reporting`,
        ].filter((result) => result.toLowerCase().includes(value.toLowerCase()))
        setResults(mockResults)
        setIsLoading(false)
      }, 800)
    }

    return (
      <div className="w-full max-w-2xl">
        <div className="mb-4">
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Keyboard Navigation Demo
          </label>
          <p className="text-xs text-secondary-500 mb-3">
            Press Enter to search, Escape to clear focus, Tab to navigate
          </p>

          <SearchField
            placeholder="Search features (press Enter to search)..."
            onSearch={handleSearch}
            showSearchButton={true}
            isLoading={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.currentTarget.blur()
              }
            }}
          />
        </div>

        {isLoading && <div className="text-sm text-secondary-500 animate-pulse">Searching...</div>}

        {results.length > 0 && !isLoading && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-secondary-700 mb-2">
              Search Results ({results.length})
            </h4>
            <div className="space-y-1">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="text-sm text-secondary-600 bg-secondary-50 rounded px-3 py-2 hover:bg-secondary-100 cursor-pointer"
                >
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  },
}

export const RealWorldExamples: Story = {
  render: () => (
    <div className="space-y-8 w-full max-w-3xl">
      <div>
        <h3 className="font-semibold mb-4">Project Search</h3>
        <SearchField
          placeholder="Search projects by name, description, or tags..."
          showSearchButton={true}
          inputSize="lg"
          onSearch={(value) => console.log('Searching projects:', value)}
        />
      </div>

      <div>
        <h3 className="font-semibold mb-4">Task Filtering</h3>
        <div className="flex gap-3">
          <div className="flex-1">
            <SearchField
              placeholder="Filter tasks..."
              showClearButton={true}
              showSearchButton={false}
              inputSize="md"
              onSearch={(value) => console.log('Filtering tasks:', value)}
            />
          </div>
          <Button variant="outline" size="md">
            Advanced Filters
          </Button>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4">Quick Command Search</h3>
        <SearchField
          variant="compact"
          placeholder="Type a command or press / to search..."
          showClearButton={true}
          showSearchButton={false}
          inputSize="sm"
          onSearch={(value) => console.log('Command search:', value)}
          className="max-w-sm"
        />
      </div>

      <div>
        <h3 className="font-semibold mb-4">Global Search</h3>
        <div className="relative">
          <SearchField
            placeholder="Search across all projects, tasks, and files..."
            showSearchButton={true}
            inputSize="lg"
            isLoading={false}
            onSearch={(value) => console.log('Global search:', value)}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-secondary-400">
            Ctrl+K
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4">User Search</h3>
        <SearchField
          placeholder="Search users by name or email..."
          showClearButton={true}
          showSearchButton={false}
          inputSize="md"
          onSearch={(value) => console.log('User search:', value)}
        />
      </div>

      <div>
        <h3 className="font-semibold mb-4">Documentation Search</h3>
        <SearchField
          placeholder="Search documentation..."
          showSearchButton={true}
          inputSize="md"
          onSearch={(value) => console.log('Documentation search:', value)}
          className="max-w-md"
        />
      </div>
    </div>
  ),
}

export const AccessibilityExample: Story = {
  render: () => (
    <div className="space-y-6 w-full max-w-2xl">
      <div>
        <h3 className="font-semibold mb-3">Screen Reader Support</h3>
        <p className="text-sm text-secondary-600 mb-4">
          Search fields include proper ARIA labels and live regions for accessibility.
        </p>

        <SearchField
          placeholder="Accessible search with screen reader support..."
          showSearchButton={true}
          aria-label="Search for projects and tasks"
          aria-describedby="search-help"
          onSearch={(value) => console.log('Accessible search:', value)}
        />
        <div id="search-help" className="text-xs text-secondary-500 mt-1">
          Use this field to search across all your projects and tasks. Press Enter or click the
          search button to start searching.
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Keyboard Shortcuts</h3>
        <div className="space-y-3">
          <SearchField
            placeholder="Press Ctrl+/ to focus this field..."
            showClearButton={true}
            onFocus={() => console.log('Search field focused')}
            onKeyDown={(e) => {
              if (e.ctrlKey && e.key === '/') {
                e.preventDefault()
                e.currentTarget.focus()
              }
            }}
          />

          <div className="text-xs text-secondary-500 space-y-1">
            <div>
              • <kbd className="px-1 py-0.5 bg-secondary-100 rounded text-xs">Enter</kbd> - Search
            </div>
            <div>
              • <kbd className="px-1 py-0.5 bg-secondary-100 rounded text-xs">Escape</kbd> - Clear
              focus
            </div>
            <div>
              • <kbd className="px-1 py-0.5 bg-secondary-100 rounded text-xs">Tab</kbd> - Navigate
              to search button
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">High Contrast Mode</h3>
        <SearchField
          placeholder="High contrast accessible search..."
          showSearchButton={true}
          className="ring-2 ring-secondary-900 focus-within:ring-primary-600"
          onSearch={(value) => console.log('High contrast search:', value)}
        />
        <p className="text-xs text-secondary-600 mt-2">
          Enhanced visual contrast for better visibility and accessibility compliance.
        </p>
      </div>
    </div>
  ),
}
