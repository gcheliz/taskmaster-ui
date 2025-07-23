import React, { useState, useRef, useEffect } from 'react'
import {
  Terminal as TerminalIcon,
  Copy,
  Download,
  Maximize2,
  Minimize2,
  X,
  ChevronRight,
  Activity,
  GitBranch,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowUpRight,
  Trash2,
  FileText,
  Settings,
  Plus
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { PageHeader } from '../components/Layout'

interface CommandHistory {
  command: string
  output: string[]
  timestamp: Date
  type: 'command' | 'success' | 'error' | 'info'
  executionTime?: number
}

interface TerminalSession {
  id: string
  name: string
  path: string
  isActive: boolean
  commands: number
  lastActivity: Date
}

const Terminal: React.FC = () => {
  const [sessions, setSessions] = useState<TerminalSession[]>([
    {
      id: '1',
      name: 'taskmaster-ui',
      path: '/Users/gonzalo/workspace/taskmaster-ui',
      isActive: true,
      commands: 23,
      lastActivity: new Date()
    },
    {
      id: '2',
      name: 'backend-api',
      path: '/Users/gonzalo/workspace/taskmaster-backend',
      isActive: false,
      commands: 15,
      lastActivity: new Date(Date.now() - 3600000)
    }
  ])

  const [activeSessionId, setActiveSessionId] = useState('1')

  const [commandHistory, setCommandHistory] = useState<CommandHistory[]>([
    {
      command: 'cd /Users/gonzalo/workspace/taskmaster-ui',
      output: [],
      timestamp: new Date(Date.now() - 1800000),
      type: 'command',
      executionTime: 12
    },
    {
      command: 'pnpm run dev',
      output: [
        '> taskmaster-ui@1.0.0 dev /Users/gonzalo/workspace/taskmaster-ui',
        '> concurrently "pnpm --filter=backend dev" "pnpm --filter=frontend dev"',
        '',
        '[0] > backend@1.0.0 dev /Users/gonzalo/workspace/taskmaster-ui/packages/backend',
        '[0] > nodemon',
        '[1] > frontend@0.0.0 dev /Users/gonzalo/workspace/taskmaster-ui/packages/frontend',
        '[1] > vite',
        '',
        '[0] ✓ Server running on http://localhost:3001',
        '[1] ✓ VITE ready in 547ms',
        '[1] ✓ Local: http://localhost:5173',
      ],
      timestamp: new Date(Date.now() - 1200000),
      type: 'success',
      executionTime: 2340
    },
    {
      command: 'task-master list',
      output: [
        '📋 Task Master - Current Tasks',
        '',
        'High Priority (3):',
        '  ⚡ #73.2 - Keyboard Navigation Implementation',
        '  ⚡ #73.3 - Screen Reader Support and ARIA Labels',
        '  ⚡ #73.4 - Focus Management and Skip Links',
        '',
        'In Progress (1):',
        '  🔄 #68 - Repository Management View Enhancement',
        '',
        'Completed Today (5):',
        '  ✅ Applied beautiful light theme to all pages',
        '  ✅ Fixed infinite re-render loop in TaskBoard',
        '  ✅ Added RepositoryProvider to App',
        '',
        'Total: 15 tasks (67% complete)',
      ],
      timestamp: new Date(Date.now() - 600000),
      type: 'info',
      executionTime: 156
    },
    {
      command: 'git status',
      output: [
        'On branch master',
        'Your branch is up to date with \'origin/master\'.',
        '',
        'Changes not staged for commit:',
        '  (use "git add <file>..." to update what will be committed)',
        '  (use "git restore <file>..." to discard changes in working directory)',
        '',
        '\tmodified:   packages/frontend/src/App.tsx',
        '\tmodified:   packages/frontend/src/pages/Repositories.tsx',
        '\tmodified:   packages/frontend/src/pages/Settings.tsx',
        '\tmodified:   packages/frontend/src/pages/TaskBoard.tsx',
        '\tmodified:   packages/frontend/src/pages/Tasks.tsx',
        '',
        'no changes added to commit (use "git add" and/or "git commit -a")',
      ],
      timestamp: new Date(Date.now() - 300000),
      type: 'command',
      executionTime: 45
    }
  ])
  const [currentCommand, setCurrentCommand] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [commandHistoryIndex, setCommandHistoryIndex] = useState(-1)
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
      const startTime = Date.now()
      
      // Simulate command execution
      const newCommand: CommandHistory = {
        command: currentCommand,
        output: getCommandOutput(currentCommand),
        timestamp: new Date(),
        type: currentCommand.includes('error') ? 'error' : 'command',
        executionTime: Math.floor(Math.random() * 500) + 50
      }
      setCommandHistory([...commandHistory, newCommand])
      setCurrentCommand('')
      setCommandHistoryIndex(-1)

      // Update session stats
      setSessions(sessions.map(s => 
        s.id === activeSessionId 
          ? { ...s, commands: s.commands + 1, lastActivity: new Date() }
          : s
      ))

      // Scroll to bottom
      setTimeout(() => {
        if (terminalRef.current) {
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight
        }
      }, 0)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const commands = commandHistory.filter(h => h.command).map(h => h.command)
      if (commands.length > 0 && commandHistoryIndex < commands.length - 1) {
        const newIndex = commandHistoryIndex + 1
        setCommandHistoryIndex(newIndex)
        setCurrentCommand(commands[commands.length - 1 - newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (commandHistoryIndex > 0) {
        const commands = commandHistory.filter(h => h.command).map(h => h.command)
        const newIndex = commandHistoryIndex - 1
        setCommandHistoryIndex(newIndex)
        setCurrentCommand(commands[commands.length - 1 - newIndex])
      } else {
        setCommandHistoryIndex(-1)
        setCurrentCommand('')
      }
    }
  }

  const getCommandOutput = (command: string): string[] => {
    // Enhanced command simulation
    if (command === 'help') {
      return [
        'TaskMaster Terminal - Available Commands:',
        '',
        'Task Management:',
        '  task-master list              - List all tasks',
        '  task-master next              - Get next task to work on',
        '  task-master show <id>         - Show task details',
        '  task-master set-status <id>   - Update task status',
        '',
        'Git Commands:',
        '  git status                    - Check repository status',
        '  git add .                     - Stage all changes',
        '  git commit -m "message"       - Commit changes',
        '  git push                      - Push to remote',
        '',
        'Project Commands:',
        '  pnpm install                  - Install dependencies',
        '  pnpm run dev                  - Start development server',
        '  pnpm run build                - Build for production',
        '  pnpm run test                 - Run tests',
        '',
        'System Commands:',
        '  clear                         - Clear terminal',
        '  ls                           - List files',
        '  pwd                          - Print working directory',
      ]
    } else if (command === 'clear') {
      setCommandHistory([])
      return []
    } else if (command === 'pwd') {
      return [sessions.find(s => s.id === activeSessionId)?.path || '/Users/gonzalo/workspace']
    } else if (command === 'ls') {
      return [
        'README.md     package.json     packages/     docs/',
        'tsconfig.json pnpm-lock.yaml   .git/        .taskmaster/'
      ]
    } else if (command.startsWith('task-master')) {
      return ['✓ Command executed successfully']
    } else if (command.includes('pnpm')) {
      return ['⚡ Running pnpm command...', '✓ Done in 2.3s']
    } else if (command.includes('git')) {
      return ['✓ Git command executed']
    } else {
      return [`bash: ${command}: command not found`]
    }
  }

  const getOutputColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-400'
      case 'error':
        return 'text-red-400'
      case 'info':
        return 'text-blue-400'
      default:
        return 'text-gray-300'
    }
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatExecutionTime = (ms?: number) => {
    if (!ms) return ''
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  return (
    <>
      <PageHeader 
        title="Terminal" 
        subtitle={`${sessions.length} sessions • ${commandHistory.length} commands`}
        actions={
          <Button 
            className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
            onClick={() => {
              const newId = String(sessions.length + 1)
              setSessions([...sessions, {
                id: newId,
                name: `Session ${sessions.length + 1}`,
                path: '/Users/gonzalo/workspace',
                isActive: false,
                commands: 0,
                lastActivity: new Date()
              }])
            }}
          >
            <Plus className="h-4 w-4" />
            New Session
          </Button>
        }
      />
      <div className="bg-white p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto flex flex-col space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-200 transform hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{sessions.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <TerminalIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-blue-600 font-medium">{sessions.filter(s => s.isActive).length}</span>
              <span className="text-gray-500 ml-1">currently active</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-green-200 transition-all duration-200 transform hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Commands Run</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {commandHistory.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center text-sm">
              <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">+12</span>
              <span className="text-gray-500 ml-1">today</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-amber-200 transition-all duration-200 transform hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">94%</p>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-amber-600 font-medium">2 errors</span>
              <span className="text-gray-500 ml-1">in last hour</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-purple-200 transition-all duration-200 transform hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Execution</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">235ms</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-purple-600 font-medium">Fast</span>
              <span className="text-gray-500 ml-1">performance</span>
            </div>
          </div>
        </div>

        {/* Session Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 p-2 flex items-center gap-2 overflow-x-auto">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => setActiveSessionId(session.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap
                ${activeSessionId === session.id 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                  : 'hover:bg-gray-50 text-gray-700'
                }
              `}
            >
              <TerminalIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{session.name}</span>
              <span className="text-xs text-gray-500">({session.commands})</span>
              {activeSessionId === session.id && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>

        {/* Terminal Window */}
        <div
          className={`
            flex-1 bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-800
            ${isFullscreen ? 'fixed inset-4 z-50' : ''}
          `}
        >
          {/* Terminal Header */}
          <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-600 cursor-pointer" />
                <div className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-600 cursor-pointer" />
                <div className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-600 cursor-pointer" />
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <GitBranch className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300 font-mono">
                  {sessions.find(s => s.id === activeSessionId)?.name || 'Terminal'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                title="Copy output"
              >
                <Copy className="w-4 h-4 text-gray-400" />
              </button>
              <button 
                className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                title="Export log"
              >
                <Download className="w-4 h-4 text-gray-400" />
              </button>
              <button 
                className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                title="Clear terminal"
                onClick={() => setCommandHistory([])}
              >
                <Trash2 className="w-4 h-4 text-gray-400" />
              </button>
              <button 
                className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? 
                  <Minimize2 className="w-4 h-4 text-gray-400" /> : 
                  <Maximize2 className="w-4 h-4 text-gray-400" />
                }
              </button>
            </div>
          </div>

          {/* Terminal Content */}
          <div
            ref={terminalRef}
            className="p-4 h-[calc(100%-3.5rem)] overflow-y-auto font-mono text-sm bg-gray-900"
            style={{ minHeight: '400px' }}
          >
            {commandHistory.map((entry, index) => (
              <div key={index} className="mb-4">
                {/* Timestamp and execution time */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-1">
                  <span>[{formatTimestamp(entry.timestamp)}]</span>
                  {entry.executionTime && (
                    <span className="text-green-400">
                      ✓ {formatExecutionTime(entry.executionTime)}
                    </span>
                  )}
                </div>

                {/* Command */}
                <div className="flex items-center space-x-2">
                  <span className="text-green-400">➜</span>
                  <span className="text-blue-400">
                    {sessions.find(s => s.id === activeSessionId)?.path.split('/').pop() || 'workspace'}
                  </span>
                  <span className="text-gray-300">{entry.command}</span>
                </div>

                {/* Output */}
                {entry.output.length > 0 && (
                  <div className={`ml-6 mt-2 ${getOutputColor(entry.type)}`}>
                    {entry.output.map((line, lineIndex) => (
                      <div key={lineIndex} className="leading-relaxed">{line}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Current Input */}
            <div className="flex items-center space-x-2">
              <span className="text-green-400">➜</span>
              <span className="text-blue-400">
                {sessions.find(s => s.id === activeSessionId)?.path.split('/').pop() || 'workspace'}
              </span>
              <input
                ref={inputRef}
                type="text"
                value={currentCommand}
                onChange={(e) => setCurrentCommand(e.target.value)}
                onKeyDown={handleCommand}
                className="flex-1 bg-transparent text-gray-300 outline-none font-mono"
                placeholder="Type 'help' for available commands..."
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />
            </div>
          </div>
        </div>

        {/* Quick Commands */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Commands</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { cmd: 'task-master next', icon: ChevronRight, color: 'blue' },
              { cmd: 'git status', icon: GitBranch, color: 'green' },
              { cmd: 'pnpm run dev', icon: Activity, color: 'amber' },
              { cmd: 'pnpm run test', icon: CheckCircle, color: 'purple' },
              { cmd: 'clear', icon: Trash2, color: 'gray' }
            ].map((quick) => (
              <button
                key={quick.cmd}
                onClick={() => {
                  setCurrentCommand(quick.cmd)
                  inputRef.current?.focus()
                }}
                className={`
                  inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-mono
                  bg-${quick.color}-50 text-${quick.color}-700 hover:bg-${quick.color}-100
                  transition-colors duration-200
                `}
              >
                <quick.icon className="w-3.5 h-3.5" />
                {quick.cmd}
              </button>
            ))}
          </div>
        </div>
        </div>
      </div>
    </>
  )
}

export default Terminal