import { generateId } from '@designcombo/timeline';

export interface CommandLog {
  id: string;
  timestamp: number;
  action: string;
  payload: any;
  result: any;
  source: 'ui' | 'api' | 'cli';
  component?: string; // Which component triggered the action
}

export class CommandLogger {
  private static instance: CommandLogger;
  private logs: CommandLog[] = [];
  private maxLogs: number = 1000; // Limit to prevent memory issues
  private listeners: ((logs: CommandLog[]) => void)[] = [];

  static getInstance(): CommandLogger {
    if (!CommandLogger.instance) {
      CommandLogger.instance = new CommandLogger();
    }
    return CommandLogger.instance;
  }

  log(action: string, payload: any, result: any, source: 'ui' | 'api' | 'cli' = 'ui', component?: string) {
    const log: CommandLog = {
      id: generateId(),
      timestamp: Date.now(),
      action,
      payload,
      result,
      source,
      component
    };

    this.logs.push(log);

    // Limit logs to prevent memory issues
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Notify listeners
    this.notifyListeners();

    // Also log to console for debugging
    console.log(`[CommandLogger] ${action}:`, { payload, result, source, component });
  }

  getLogs(): CommandLog[] {
    return [...this.logs];
  }

  getRecentLogs(count: number = 50): CommandLog[] {
    return this.logs.slice(-count);
  }

  clearLogs(): void {
    this.logs = [];
    this.notifyListeners();
  }

  // Subscribe to log updates
  subscribe(listener: (logs: CommandLog[]) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener([...this.logs]);
      } catch (error) {
        console.error('Error in command logger listener:', error);
      }
    });
  }

  // Get logs by action type
  getLogsByAction(action: string): CommandLog[] {
    return this.logs.filter(log => log.action === action);
  }

  // Get logs by source
  getLogsBySource(source: 'ui' | 'api' | 'cli'): CommandLog[] {
    return this.logs.filter(log => log.source === source);
  }

  // Get logs by component
  getLogsByComponent(component: string): CommandLog[] {
    return this.logs.filter(log => log.component === component);
  }

  // Get statistics
  getStats(): {
    totalLogs: number;
    logsByAction: Record<string, number>;
    logsBySource: Record<string, number>;
    logsByComponent: Record<string, number>;
  } {
    const stats = {
      totalLogs: this.logs.length,
      logsByAction: {} as Record<string, number>,
      logsBySource: {} as Record<string, number>,
      logsByComponent: {} as Record<string, number>
    };

    this.logs.forEach(log => {
      // Count by action
      stats.logsByAction[log.action] = (stats.logsByAction[log.action] || 0) + 1;
      
      // Count by source
      stats.logsBySource[log.source] = (stats.logsBySource[log.source] || 0) + 1;
      
      // Count by component
      if (log.component) {
        stats.logsByComponent[log.component] = (stats.logsByComponent[log.component] || 0) + 1;
      }
    });

    return stats;
  }
}
