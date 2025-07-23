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
    <div className="p-8 h-full flex flex-col">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Terminal</h1>
          <p className="text-gray-600 mt-1">Integrated command-line interface</p>
        </div>

        {/* Terminal Controls */}
        <div className="flex items-center space-x-2">
          <button className="icon-btn">
            <Copy className="w-4 h-4" />
          </button>
          <button className="icon-btn">
            <Download className="w-4 h-4" />
          </button>
          <button className="icon-btn" onClick={() => setIsFullscreen(!isFullscreen)}>
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Terminal Window */}
      <div
        className={`flex-1 bg-gray-900 rounded-xl shadow-lg overflow-hidden ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}
      >
        {/* Terminal Header */}
        <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <TerminalIcon className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300 font-mono">taskmaster-ui</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        </div>

        {/* Terminal Content */}
        <div
          ref={terminalRef}
          className="p-4 h-[calc(100%-3rem)] overflow-y-auto font-mono text-sm"
        >
          {commandHistory.map((entry, index) => (
            <div key={index} className="mb-3">
              {/* Command */}
              <div className="flex items-center space-x-2">
                <span className="text-green-400">➜</span>
                <span className="text-blue-400">~/workspace/taskmaster-ui</span>
                <span className="text-gray-300">{entry.command}</span>
              </div>

              {/* Output */}
              {entry.output.length > 0 && (
                <div className={`ml-6 mt-1 ${getOutputColor(entry.type)}`}>
                  {entry.output.map((line, lineIndex) => (
                    <div key={lineIndex}>{line}</div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Current Input */}
          <div className="flex items-center space-x-2">
            <span className="text-green-400">➜</span>
            <span className="text-blue-400">~/workspace/taskmaster-ui</span>
            <input
              ref={inputRef}
              type="text"
              value={currentCommand}
              onChange={(e) => setCurrentCommand(e.target.value)}
              onKeyDown={handleCommand}
              className="flex-1 bg-transparent text-gray-300 outline-none font-mono"
              placeholder="Type 'help' for available commands..."
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Terminal
