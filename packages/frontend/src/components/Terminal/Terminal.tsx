import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal as XTerminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';
import './Terminal.css';

export interface TerminalProps {
  /** Terminal session ID */
  sessionId?: string;
  /** Working directory for the terminal */
  workingDirectory?: string;
  /** Repository path if terminal is scoped to a repository */
  repositoryPath?: string;
  /** Terminal display mode */
  mode?: 'embedded' | 'popup' | 'fullscreen';
  /** Whether to show the terminal header */
  showHeader?: boolean;
  /** Whether to show the status bar */
  showStatusBar?: boolean;
  /** Terminal title */
  title?: string;
  /** Terminal theme */
  theme?: 'dark' | 'light';
  /** Initial size */
  initialSize?: { cols: number; rows: number };
  /** Callback when terminal is ready */
  onReady?: (terminal: XTerminal) => void;
  /** Callback when terminal is closed */
  onClose?: () => void;
  /** Callback when command is executed */
  onCommand?: (command: string) => void;
  /** Callback when terminal data is received */
  onData?: (data: string) => void;
  /** Callback when terminal size changes */
  onResize?: (cols: number, rows: number) => void;
  /** WebSocket connection for terminal communication */
  websocket?: WebSocket;
  /** Additional CSS class */
  className?: string;
  /** Whether the terminal is loading */
  isLoading?: boolean;
  /** Error message to display */
  error?: string | null;
  /** Whether to enable web links */
  enableWebLinks?: boolean;
  /** Whether to enable clipboard */
  enableClipboard?: boolean;
}

export const Terminal: React.FC<TerminalProps> = ({
  sessionId,
  workingDirectory = process.cwd(),
  repositoryPath,
  mode = 'embedded',
  showHeader = true,
  showStatusBar = true,
  title = 'Terminal',
  theme = 'dark',
  initialSize = { cols: 80, rows: 24 },
  onReady,
  onClose,
  onData,
  onResize,
  websocket,
  className = '',
  isLoading = false,
  error = null,
  enableWebLinks = true,
  enableClipboard = true
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const webLinksAddonRef = useRef<WebLinksAddon | null>(null);
  
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [currentDirectory] = useState(workingDirectory);
  const [isProcessRunning, setIsProcessRunning] = useState(false);
  
  // Initialize terminal
  useEffect(() => {
    if (!terminalRef.current || isLoading || error) {
      return;
    }

    // Create terminal instance
    const terminal = new XTerminal({
      cols: initialSize.cols,
      rows: initialSize.rows,
      theme: {
        background: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        foreground: theme === 'dark' ? '#ffffff' : '#000000',
        cursor: theme === 'dark' ? '#ffffff' : '#000000',
        cursorAccent: theme === 'dark' ? '#000000' : '#ffffff',
        selectionBackground: theme === 'dark' ? '#ffffff33' : '#00000033',
        selectionForeground: theme === 'dark' ? '#ffffff' : '#000000',
      },
      fontFamily: 'Courier New, monospace',
      fontSize: 14,
      fontWeight: 'normal',
      lineHeight: 1.2,
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 1000,
      tabStopWidth: 4,
      convertEol: true,
      allowProposedApi: true,
      allowTransparency: false,
      scrollOnUserInput: true,
      macOptionIsMeta: true,
      rightClickSelectsWord: true,
      screenReaderMode: false,
      windowsMode: false,
      fastScrollModifier: 'shift',
      fastScrollSensitivity: 5,
      scrollSensitivity: 1,
      minimumContrastRatio: 1,
      disableStdin: false,
      logLevel: 'info',
      overviewRulerWidth: 0,
      windowOptions: {},
      rescaleOverlappingGlyphs: true,
      ignoreBracketedPasteMode: false,
      drawBoldTextInBrightColors: true,
      altClickMovesCursor: true,
      customGlyphs: true,
      smoothScrollDuration: 0
    });

    // Create and load addons
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    fitAddonRef.current = fitAddon;

    if (enableWebLinks) {
      const webLinksAddon = new WebLinksAddon();
      terminal.loadAddon(webLinksAddon);
      webLinksAddonRef.current = webLinksAddon;
    }

    // Open terminal
    terminal.open(terminalRef.current);
    
    // Fit terminal to container
    fitAddon.fit();

    // Store terminal reference
    xtermRef.current = terminal;

    // Terminal event handlers
    terminal.onData((data) => {
      onData?.(data);
      
      // Handle special key combinations
      if (data === '\r') {
        // Enter key - might be executing a command
        setIsProcessRunning(true);
      } else if (data === '\x03') {
        // Ctrl+C - interrupt
        setIsProcessRunning(false);
      }
    });

    terminal.onResize((size) => {
      onResize?.(size.cols, size.rows);
    });

    terminal.onTitleChange((title) => {
      // Update terminal title if changed by shell
      document.title = title;
    });

    terminal.onBell(() => {
      // Flash the terminal container briefly
      if (terminalRef.current) {
        terminalRef.current.style.backgroundColor = '#ffffff';
        setTimeout(() => {
          if (terminalRef.current) {
            terminalRef.current.style.backgroundColor = '';
          }
        }, 100);
      }
    });

    // Write initial prompt
    terminal.writeln(`\\x1b[1;32m${title}\\x1b[0m`);
    terminal.writeln(`Working directory: ${currentDirectory}`);
    if (repositoryPath) {
      terminal.writeln(`Repository: ${repositoryPath}`);
    }
    terminal.writeln('');

    // Call onReady callback
    onReady?.(terminal);

    // Cleanup
    return () => {
      terminal.dispose();
      xtermRef.current = null;
      fitAddonRef.current = null;
      webLinksAddonRef.current = null;
    };
  }, [
    isLoading,
    error,
    theme,
    initialSize,
    enableWebLinks,
    enableClipboard,
    currentDirectory,
    repositoryPath,
    title,
    onReady,
    onData,
    onResize
  ]);

  // Handle WebSocket connection
  useEffect(() => {
    if (!websocket || !xtermRef.current) {
      return;
    }

    const terminal = xtermRef.current;
    
    setConnectionStatus('connecting');

    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case 'output':
            if (message.data.type === 'stdout') {
              terminal.write(message.data.data);
            } else if (message.data.type === 'stderr') {
              terminal.write(`\\x1b[31m${message.data.data}\\x1b[0m`);
            } else if (message.data.type === 'exit') {
              terminal.write(`\\x1b[33m${message.data.data}\\x1b[0m`);
              setIsProcessRunning(false);
            }
            break;
            
          case 'session-created':
            setConnectionStatus('connected');
            break;
            
          case 'session-closed':
            setConnectionStatus('disconnected');
            break;
            
          case 'error':
            terminal.write(`\\x1b[31mError: ${message.data.message}\\x1b[0m\\r\\n`);
            setIsProcessRunning(false);
            break;
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    const handleOpen = () => {
      setConnectionStatus('connected');
    };

    const handleClose = () => {
      setConnectionStatus('disconnected');
    };

    const handleError = () => {
      setConnectionStatus('disconnected');
    };

    websocket.addEventListener('message', handleMessage);
    websocket.addEventListener('open', handleOpen);
    websocket.addEventListener('close', handleClose);
    websocket.addEventListener('error', handleError);

    return () => {
      websocket.removeEventListener('message', handleMessage);
      websocket.removeEventListener('open', handleOpen);
      websocket.removeEventListener('close', handleClose);
      websocket.removeEventListener('error', handleError);
    };
  }, [websocket]);

  // Handle terminal resize
  const handleResize = useCallback(() => {
    if (fitAddonRef.current) {
      fitAddonRef.current.fit();
    }
  }, []);

  // Handle window resize
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Terminal actions
  const clearTerminal = useCallback(() => {
    if (xtermRef.current) {
      xtermRef.current.clear();
    }
  }, []);

  const killProcess = useCallback(() => {
    if (websocket && sessionId) {
      websocket.send(JSON.stringify({
        type: 'kill',
        sessionId
      }));
    }
    setIsProcessRunning(false);
  }, [websocket, sessionId]);

  const closeTerminal = useCallback(() => {
    if (websocket && sessionId) {
      websocket.send(JSON.stringify({
        type: 'close-session',
        sessionId
      }));
    }
    onClose?.();
  }, [websocket, sessionId, onClose]);


  // Render loading state
  if (isLoading) {
    return (
      <div className={`terminal-container terminal-container--${mode} ${className}`}>
        {showHeader && (
          <div className="terminal-header">
            <h3 className="terminal-title">{title}</h3>
          </div>
        )}
        <div className="terminal-loading">
          <div>Loading terminal...</div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={`terminal-container terminal-container--${mode} ${className}`}>
        {showHeader && (
          <div className="terminal-header">
            <h3 className="terminal-title">{title}</h3>
          </div>
        )}
        <div className="terminal-error">
          <div className="terminal-error-message">{error}</div>
          <button 
            className="terminal-error-retry"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`terminal-container terminal-container--${mode} terminal-container--${theme} ${className}`}>
      {showHeader && (
        <div className="terminal-header">
          <div className="terminal-title-section">
            <h3 className="terminal-title">{title}</h3>
            <div className="terminal-session-info">
              {sessionId && (
                <span className="terminal-session-badge">{sessionId.slice(0, 8)}</span>
              )}
              <span className="terminal-working-directory" title={currentDirectory}>
                {currentDirectory}
              </span>
            </div>
          </div>
          <div className="terminal-controls">
            <button 
              className="terminal-button terminal-button--clear"
              onClick={clearTerminal}
              title="Clear terminal"
            >
              Clear
            </button>
            {isProcessRunning && (
              <button 
                className="terminal-button terminal-button--kill"
                onClick={killProcess}
                title="Kill running process"
              >
                Kill
              </button>
            )}
            <button 
              className="terminal-button terminal-button--close"
              onClick={closeTerminal}
              title="Close terminal"
            >
              Close
            </button>
          </div>
        </div>
      )}
      
      <div className="terminal-content">
        <div ref={terminalRef} className="terminal-xterm" />
      </div>
      
      {showStatusBar && (
        <div className="terminal-status-bar">
          <div className="terminal-status-left">
            <div className="terminal-connection-status">
              <div className={`terminal-connection-indicator terminal-connection-indicator--${connectionStatus}`} />
              <span>{connectionStatus}</span>
            </div>
            {sessionId && (
              <span>Session: {sessionId.slice(0, 8)}</span>
            )}
          </div>
          <div className="terminal-status-right">
            <span>
              {xtermRef.current ? `${xtermRef.current.cols}x${xtermRef.current.rows}` : `${initialSize.cols}x${initialSize.rows}`}
            </span>
            {repositoryPath && (
              <span title={repositoryPath}>
                {repositoryPath.split('/').pop()}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Terminal;