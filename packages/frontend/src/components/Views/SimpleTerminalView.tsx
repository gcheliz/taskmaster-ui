import React from 'react'

export const SimpleTerminalView: React.FC = () => {
  return (
    <div className="terminal-view">
      <div className="view-header">
        <h1>💻 Terminal</h1>
        <p>Embedded terminal for command execution</p>
      </div>

      <div className="view-content">
        <div className="terminal-container">
          <div className="terminal-header">
            <div className="terminal-controls">
              <div className="control-button close"></div>
              <div className="control-button minimize"></div>
              <div className="control-button maximize"></div>
            </div>
            <div className="terminal-title">TaskMaster Terminal</div>
          </div>

          <div className="terminal-content">
            <div className="terminal-line">
              <span className="prompt">$ </span>
              <span className="command">cd /Users/gonzalo/workspace/taskmaster-ui</span>
            </div>
            <div className="terminal-line">
              <span className="prompt">$ </span>
              <span className="command">pnpm run dev</span>
            </div>
            <div className="terminal-output">
              <div className="output-line">
                <span className="success">✓</span> Frontend started on http://localhost:5173
              </div>
              <div className="output-line">
                <span className="success">✓</span> Backend started on http://localhost:3001
              </div>
              <div className="output-line">
                <span className="success">✓</span> Database connected successfully
              </div>
            </div>
            <div className="terminal-line">
              <span className="prompt">$ </span>
              <span className="command">task-master list</span>
            </div>
            <div className="terminal-output">
              <div className="output-line">📋 Active Tasks (7)</div>
              <div className="output-line">✅ Completed Tasks (15)</div>
              <div className="output-line">🔄 In Progress (2)</div>
            </div>
            <div className="terminal-line current">
              <span className="prompt">$ </span>
              <span className="cursor">|</span>
            </div>
          </div>
        </div>

        <div className="terminal-info">
          <div className="info-card">
            <h3>Quick Commands</h3>
            <div className="command-list">
              <div className="command-item">
                <code>task-master list</code>
                <span>List all tasks</span>
              </div>
              <div className="command-item">
                <code>task-master next</code>
                <span>Get next task</span>
              </div>
              <div className="command-item">
                <code>git status</code>
                <span>Check Git status</span>
              </div>
              <div className="command-item">
                <code>pnpm run test</code>
                <span>Run tests</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SimpleTerminalView
