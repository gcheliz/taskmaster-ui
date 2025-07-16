import React from 'react';
import { Terminal } from './Terminal';
import { useTerminal } from '../../hooks/useTerminal';

export interface TerminalContainerProps {
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
  /** Callback when terminal is closed */
  onClose?: () => void;
  /** Additional CSS class */
  className?: string;
  /** Whether to show notifications */
  showNotifications?: boolean;
  /** Whether to auto-create session */
  autoCreate?: boolean;
  /** Whether to auto-connect WebSocket */
  autoConnect?: boolean;
}

/**
 * TerminalContainer Component
 * 
 * Complete terminal implementation with integrated session management,
 * WebSocket communication, and xterm.js rendering.
 */
export const TerminalContainer: React.FC<TerminalContainerProps> = ({
  workingDirectory,
  repositoryPath,
  mode = 'embedded',
  showHeader = true,
  showStatusBar = true,
  title = 'Terminal',
  theme = 'dark',
  initialSize = { cols: 80, rows: 24 },
  onClose,
  className = '',
  showNotifications = true,
  autoCreate = true,
  autoConnect = true
}) => {
  const {
    session,
    websocket,
    isLoading,
    error,
    currentDirectory,
    executeCommand,
    sendInput,
    closeSession,
    resizeTerminal,
    setTerminal
  } = useTerminal({
    workingDirectory,
    repositoryPath,
    autoCreate,
    autoConnect,
    showNotifications
  });

  const handleTerminalReady = (terminalInstance: any) => {
    setTerminal(terminalInstance);
  };

  const handleClose = async () => {
    await closeSession();
    onClose?.();
  };

  const handleCommand = async (command: string) => {
    try {
      await executeCommand(command);
    } catch (error) {
      console.error('Failed to execute command:', error);
    }
  };

  const handleData = (data: string) => {
    if (websocket && session) {
      // Send data to WebSocket
      sendInput(data);
    }
  };

  const handleResize = (cols: number, rows: number) => {
    resizeTerminal(cols, rows);
  };


  return (
    <Terminal
      sessionId={session?.id}
      workingDirectory={currentDirectory}
      repositoryPath={repositoryPath}
      mode={mode}
      showHeader={showHeader}
      showStatusBar={showStatusBar}
      title={title}
      theme={theme}
      initialSize={initialSize}
      onReady={handleTerminalReady}
      onClose={handleClose}
      onCommand={handleCommand}
      onData={handleData}
      onResize={handleResize}
      websocket={websocket || undefined}
      className={className}
      isLoading={isLoading}
      error={error}
      enableWebLinks={true}
      enableClipboard={true}
    />
  );
};

export default TerminalContainer;