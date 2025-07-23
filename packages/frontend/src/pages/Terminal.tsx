import React, { useState, useRef, useEffect } from 'react'
import {
  Terminal as TerminalIcon,
  Copy,
  Download,
  Maximize2,
  Minimize2,
  X,
  ChevronRight,
} from 'lucide-react'

interface CommandHistory {
  command: string
  output: string[]
  timestamp: Date
  type: 'command' | 'success' | 'error' | 'info'
}

const Terminal: React.FC = () => {
  const [commandHistory, setCommandHistory] = useState<CommandHistory[]>([
    {
      command: 'cd /Users/gonzalo/workspace/taskmaster-ui',
      output: [],
      timestamp: new Date(),
      type: 'command',
    },
    {
      command: 'pnpm run dev',
      output: [
        '✓ Frontend started on http://localhost:5173',
        '✓ Backend started on http://localhost:3001',
        '✓ Database connected successfully',
      ],
      timestamp: new Date(),
      type: 'success',
    },
    {
      command: 'task-master list',
      output: ['📋 Active Tasks (7)', '✅ Completed Tasks (15)', '🔄 In Progress (2)'],
      timestamp: new Date(),
      type: 'info',
    },
  ])
  const [currentCommand, setCurrentCommand] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Focus input when terminal is clicked
    if (terminalRef.current && inputRef.current) {
      terminalRef.current.addEventListener('click', () => {
        inputRef.current?.focus()
      })
    }
  }, [])

  const handleCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentCommand.trim()) {
      // Simulate command execution
      const newCommand: CommandHistory = {
        command: currentCommand,
        output: getCommandOutput(currentCommand),
        timestamp: new Date(),
        type: 'command',
      }
      setCommandHistory([...commandHistory, newCommand])
      setCurrentCommand('')

      // Scroll to bottom
      setTimeout(() => {
        if (terminalRef.current) {
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight
        }
      }, 0)
    }
  }

  const getCommandOutput = (command: string): string[] => {
    // Simulate different command outputs
    if (command === 'help') {
      return [
        'Available commands:',
        '  task-master list     - List all tasks',
        '  task-master next     - Get next task',
        '  git status          - Check Git status',
        '  pnpm run test       - Run tests',
        '  clear               - Clear terminal',
      ]
    } else if (command === 'clear') {
      setCommandHistory([])
      return []
    } else if (command.startsWith('task-master')) {
      return ['✓ Command executed successfully']
    } else {
      return [`bash: ${command}: command not found`]
    }
  }

  const getOutputColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      case 'info':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col">
      {/* Page Header - Mobile responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6 lg:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Terminal</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Integrated command-line interface</p>
        </div>

        {/* Terminal Controls - Mobile optimized */}
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors min-w-touch min-h-touch flex items-center justify-center">
            <Copy className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors min-w-touch min-h-touch hidden sm:flex items-center justify-center">
            <Download className="w-4 h-4" />
          </button>
          <button 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors min-w-touch min-h-touch flex items-center justify-center"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Terminal Window - Mobile responsive */}
      <div
        className={`flex-1 bg-gray-900 rounded-lg sm:rounded-xl shadow-lg overflow-hidden ${isFullscreen ? 'fixed inset-2 sm:inset-4 z-50' : ''}`}
      >
        {/* Terminal Header - Mobile sizes */}
        <div className="bg-gray-800 px-3 sm:px-4 py-2 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <TerminalIcon className="w-4 h-4 text-gray-400" />
            <span className="text-xs sm:text-sm text-gray-300 font-mono">taskmaster-ui</span>
          </div>
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
          </div>
        </div>

        {/* Terminal Content - Mobile optimized */}
        <div
          ref={terminalRef}
          className="p-3 sm:p-4 h-[calc(100%-2.5rem)] sm:h-[calc(100%-3rem)] overflow-y-auto font-mono text-xs sm:text-sm"
        >
          {commandHistory.map((entry, index) => (
            <div key={index} className="mb-3">
              {/* Command - Mobile responsive */}
              <div className="flex items-start sm:items-center space-x-2 flex-wrap">
                <span className="text-green-400 flex-shrink-0">➜</span>
                <span className="text-blue-400 hidden sm:inline">~/workspace/taskmaster-ui</span>
                <span className="text-blue-400 sm:hidden">~</span>
                <span className="text-gray-300 break-all">{entry.command}</span>
              </div>

              {/* Output - Mobile text wrap */}
              {entry.output.length > 0 && (
                <div className={`ml-4 sm:ml-6 mt-1 ${getOutputColor(entry.type)}`}>
                  {entry.output.map((line, lineIndex) => (
                    <div key={lineIndex} className="break-words">{line}</div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Current Input - Mobile optimized */}
          <div className="flex items-start sm:items-center space-x-2 flex-wrap">
            <span className="text-green-400 flex-shrink-0">➜</span>
            <span className="text-blue-400 hidden sm:inline">~/workspace/taskmaster-ui</span>
            <span className="text-blue-400 sm:hidden">~</span>
            <input
              ref={inputRef}
              type="text"
              value={currentCommand}
              onChange={(e) => setCurrentCommand(e.target.value)}
              onKeyDown={handleCommand}
              className="flex-1 bg-transparent text-gray-300 outline-none font-mono min-w-0"
              placeholder="Type 'help'..."
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Terminal
