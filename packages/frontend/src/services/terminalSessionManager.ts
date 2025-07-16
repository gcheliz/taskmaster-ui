import { terminalService, type TerminalSession } from './terminalService';

export interface PersistedTerminalSession {
  id: string;
  repositoryPath: string;
  workingDirectory: string;
  title: string;
  createdAt: string;
  lastActivity: string;
  isActive: boolean;
  settings: {
    theme: 'dark' | 'light';
    fontSize: number;
    fontFamily: string;
    cols: number;
    rows: number;
  };
}

export interface TerminalSessionManager {
  /** Get all persisted sessions */
  getPersistedSessions(): PersistedTerminalSession[];
  /** Save a session to persistence */
  saveSession(session: PersistedTerminalSession): void;
  /** Remove a session from persistence */
  removeSession(sessionId: string): void;
  /** Update session activity */
  updateSessionActivity(sessionId: string): void;
  /** Update session settings */
  updateSessionSettings(sessionId: string, settings: Partial<PersistedTerminalSession['settings']>): void;
  /** Clear all persisted sessions */
  clearAllSessions(): void;
  /** Restore active sessions */
  restoreActiveSessions(): Promise<TerminalSession[]>;
  /** Clean up old sessions */
  cleanupOldSessions(maxAge: number): void;
}

export class LocalStorageTerminalSessionManager implements TerminalSessionManager {
  private readonly storageKey = 'taskmaster-terminal-sessions';
  private readonly maxSessions = 10;
  private readonly defaultSettings = {
    theme: 'dark' as const,
    fontSize: 14,
    fontFamily: 'Courier New, monospace',
    cols: 80,
    rows: 24
  };

  getPersistedSessions(): PersistedTerminalSession[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];
      
      const sessions: PersistedTerminalSession[] = JSON.parse(stored);
      return sessions.sort((a, b) => 
        new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
      );
    } catch (error) {
      console.error('Failed to load persisted sessions:', error);
      return [];
    }
  }

  saveSession(session: PersistedTerminalSession): void {
    try {
      const sessions = this.getPersistedSessions();
      const existingIndex = sessions.findIndex(s => s.id === session.id);
      
      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
      } else {
        sessions.unshift(session);
      }
      
      // Limit number of sessions
      if (sessions.length > this.maxSessions) {
        sessions.splice(this.maxSessions);
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  removeSession(sessionId: string): void {
    try {
      const sessions = this.getPersistedSessions();
      const filteredSessions = sessions.filter(s => s.id !== sessionId);
      localStorage.setItem(this.storageKey, JSON.stringify(filteredSessions));
    } catch (error) {
      console.error('Failed to remove session:', error);
    }
  }

  updateSessionActivity(sessionId: string): void {
    try {
      const sessions = this.getPersistedSessions();
      const session = sessions.find(s => s.id === sessionId);
      
      if (session) {
        session.lastActivity = new Date().toISOString();
        this.saveSession(session);
      }
    } catch (error) {
      console.error('Failed to update session activity:', error);
    }
  }

  updateSessionSettings(sessionId: string, settings: Partial<PersistedTerminalSession['settings']>): void {
    try {
      const sessions = this.getPersistedSessions();
      const session = sessions.find(s => s.id === sessionId);
      
      if (session) {
        session.settings = { ...session.settings, ...settings };
        this.saveSession(session);
      }
    } catch (error) {
      console.error('Failed to update session settings:', error);
    }
  }

  clearAllSessions(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Failed to clear sessions:', error);
    }
  }

  async restoreActiveSessions(): Promise<TerminalSession[]> {
    try {
      const persistedSessions = this.getPersistedSessions();
      const activeSessions = persistedSessions.filter(s => s.isActive);
      
      // Try to restore sessions on the backend
      const restoredSessions: TerminalSession[] = [];
      
      for (const persistedSession of activeSessions) {
        try {
          // Check if session still exists on backend
          const backendSession = await terminalService.getSession(persistedSession.id);
          restoredSessions.push(backendSession);
        } catch (error) {
          // Session doesn't exist on backend, create a new one
          try {
            const newSession = await terminalService.createSession({
              workingDirectory: persistedSession.workingDirectory,
              repositoryPath: persistedSession.repositoryPath
            });
            
            // Update persisted session with new ID
            const updatedSession: PersistedTerminalSession = {
              ...persistedSession,
              id: newSession.sessionId,
              lastActivity: new Date().toISOString()
            };
            
            this.saveSession(updatedSession);
            
            // Get the actual session details
            const actualSession = await terminalService.getSession(newSession.sessionId);
            restoredSessions.push(actualSession);
          } catch (createError) {
            console.error('Failed to restore session:', createError);
            // Mark session as inactive
            const inactiveSession: PersistedTerminalSession = {
              ...persistedSession,
              isActive: false,
              lastActivity: new Date().toISOString()
            };
            this.saveSession(inactiveSession);
          }
        }
      }
      
      return restoredSessions;
    } catch (error) {
      console.error('Failed to restore active sessions:', error);
      return [];
    }
  }

  cleanupOldSessions(maxAge: number = 7 * 24 * 60 * 60 * 1000): void {
    try {
      const sessions = this.getPersistedSessions();
      const now = Date.now();
      
      const recentSessions = sessions.filter(session => {
        const lastActivity = new Date(session.lastActivity).getTime();
        return (now - lastActivity) < maxAge;
      });
      
      localStorage.setItem(this.storageKey, JSON.stringify(recentSessions));
    } catch (error) {
      console.error('Failed to cleanup old sessions:', error);
    }
  }

  createPersistedSession(
    sessionId: string,
    repositoryPath: string,
    workingDirectory: string,
    title: string,
    settings?: Partial<PersistedTerminalSession['settings']>
  ): PersistedTerminalSession {
    const now = new Date().toISOString();
    
    return {
      id: sessionId,
      repositoryPath,
      workingDirectory,
      title,
      createdAt: now,
      lastActivity: now,
      isActive: true,
      settings: { ...this.defaultSettings, ...settings }
    };
  }

  getSessionSettings(sessionId: string): PersistedTerminalSession['settings'] | null {
    const sessions = this.getPersistedSessions();
    const session = sessions.find(s => s.id === sessionId);
    return session?.settings || null;
  }

  getRecentSessions(limit: number = 5): PersistedTerminalSession[] {
    const sessions = this.getPersistedSessions();
    return sessions.slice(0, limit);
  }

  getSessionsByRepository(repositoryPath: string): PersistedTerminalSession[] {
    const sessions = this.getPersistedSessions();
    return sessions.filter(s => s.repositoryPath === repositoryPath);
  }

  markSessionAsActive(sessionId: string): void {
    const sessions = this.getPersistedSessions();
    const session = sessions.find(s => s.id === sessionId);
    
    if (session) {
      session.isActive = true;
      session.lastActivity = new Date().toISOString();
      this.saveSession(session);
    }
  }

  markSessionAsInactive(sessionId: string): void {
    const sessions = this.getPersistedSessions();
    const session = sessions.find(s => s.id === sessionId);
    
    if (session) {
      session.isActive = false;
      session.lastActivity = new Date().toISOString();
      this.saveSession(session);
    }
  }

  getSessionStatistics(): {
    total: number;
    active: number;
    inactive: number;
    repositories: string[];
    oldestSession: string | null;
    newestSession: string | null;
  } {
    const sessions = this.getPersistedSessions();
    const repositories = [...new Set(sessions.map(s => s.repositoryPath))];
    
    return {
      total: sessions.length,
      active: sessions.filter(s => s.isActive).length,
      inactive: sessions.filter(s => !s.isActive).length,
      repositories,
      oldestSession: sessions.length > 0 ? sessions[sessions.length - 1].id : null,
      newestSession: sessions.length > 0 ? sessions[0].id : null
    };
  }
}

// Export singleton instance
export const terminalSessionManager = new LocalStorageTerminalSessionManager();