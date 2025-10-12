import React, { useState, useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CommandLogger, CommandLog } from '../../commands/CommandLogger';
import { dispatchWithLogging } from '../../commands/DispatchWrapper';
import { Trash2, Download, Filter, Clock, User, Code, Terminal, Play } from 'lucide-react';
import './CommandConsole.css';

interface CommandConsoleProps {
  isVisible: boolean;
  onClose: () => void;
}

export const CommandConsole: React.FC<CommandConsoleProps> = ({ isVisible, onClose }) => {
  const [logs, setLogs] = useState<CommandLog[]>([]);
  const [filter, setFilter] = useState<'all' | 'ui' | 'api' | 'cli'>('all');
  const [actionFilter, setActionFilter] = useState<string>('');
  const [stats, setStats] = useState<any>(null);
  const [commandInput, setCommandInput] = useState<string>('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const logger = CommandLogger.getInstance();

  useEffect(() => {
    // Subscribe to log updates
    const unsubscribe = logger.subscribe((newLogs) => {
      setLogs(newLogs);
      setStats(logger.getStats());
    });

    // Initial load
    setLogs(logger.getLogs());
    setStats(logger.getStats());

    return unsubscribe;
  }, [logger]);

  const filteredLogs = logs.filter(log => {
    if (filter !== 'all' && log.source !== filter) return false;
    if (actionFilter && !log.action.toLowerCase().includes(actionFilter.toLowerCase())) return false;
    return true;
  });

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'ui': return 'bg-blue-900/50 text-blue-300 border border-blue-700';
      case 'api': return 'bg-green-900/50 text-green-300 border border-green-700';
      case 'cli': return 'bg-purple-900/50 text-purple-300 border border-purple-700';
      default: return 'bg-gray-800 text-gray-300 border border-gray-600';
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('ADD')) return 'text-green-400';
    if (action.includes('EDIT') || action.includes('UPDATE')) return 'text-blue-400';
    if (action.includes('DELETE')) return 'text-red-400';
    if (action.includes('HELP')) return 'text-cyan-400';
    if (action.includes('ERROR')) return 'text-red-500';
    return 'text-gray-300';
  };

  const handleClearLogs = () => {
    logger.clearLogs();
  };

  const handleExportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `command-logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // CLI Command parsing and execution
  const parseCommand = (input: string) => {
    const parts = input.trim().split(' ');
    const command = parts[0];
    const args = parts.slice(1);

    return { command, args };
  };

  const executeCLICommand = (input: string) => {
    const { command, args } = parseCommand(input);
    
    try {
      switch (command.toLowerCase()) {
        case 'add-video':
          const videoSrc = args[0] || 'sample-video.mp4';
          const videoDuration = parseInt(args[1]) || 5000;
          dispatchWithLogging('ADD_VIDEO', {
            id: `video-${Date.now()}`,
            src: videoSrc,
            duration: videoDuration,
            metadata: { previewUrl: 'thumb.jpg' }
          }, {
            resourceId: 'main',
            scaleMode: 'fit'
          }, 'cli', 'CLI');
          break;

        case 'add-image':
          const imageSrc = args[0] || 'sample-image.jpg';
          dispatchWithLogging('ADD_IMAGE', {
            id: `image-${Date.now()}`,
            details: { src: imageSrc },
            metadata: { previewUrl: 'thumb.jpg' }
          }, {
            resourceId: 'image',
            scaleMode: 'fit'
          }, 'cli', 'CLI');
          break;

        case 'set-volume':
          const itemId = args[0];
          const volume = parseInt(args[1]);
          if (!itemId || isNaN(volume)) {
            throw new Error('Usage: set-volume <item-id> <volume-0-100>');
          }
          dispatchWithLogging('EDIT_OBJECT', {
            [itemId]: {
              details: { volume: volume / 100 }
            }
          }, undefined, 'cli', 'CLI');
          break;

        case 'set-opacity':
          const opacityItemId = args[0];
          const opacity = parseInt(args[1]);
          if (!opacityItemId || isNaN(opacity)) {
            throw new Error('Usage: set-opacity <item-id> <opacity-0-100>');
          }
          dispatchWithLogging('EDIT_OBJECT', {
            [opacityItemId]: {
              details: { opacity: opacity / 100 }
            }
          }, undefined, 'cli', 'CLI');
          break;

        case 'move':
          const moveItemId = args[0];
          const x = parseInt(args[1]);
          const y = parseInt(args[2]);
          if (!moveItemId || isNaN(x) || isNaN(y)) {
            throw new Error('Usage: move <item-id> <x> <y>');
          }
          dispatchWithLogging('EDIT_OBJECT', {
            [moveItemId]: {
              details: { x, y }
            }
          }, undefined, 'cli', 'CLI');
          break;

        case 'clear':
          logger.clearLogs();
          break;

        case 'help':
          // Log help information
          logger.log('HELP', {
            commands: [
              'add-video [src] [duration] - Add a video',
              'add-image [src] - Add an image',
              'set-volume <item-id> <volume> - Set volume (0-100)',
              'set-opacity <item-id> <opacity> - Set opacity (0-100)',
              'move <item-id> <x> <y> - Move item to position',
              'clear - Clear command logs',
              'help - Show this help'
            ]
          }, { success: true }, 'cli', 'CLI');
          break;

        default:
          throw new Error(`Unknown command: ${command}. Type 'help' for available commands.`);
      }
    } catch (error) {
      logger.log('CLI_ERROR', {
        command: input,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, { success: false }, 'cli', 'CLI');
    }
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    // Add to history
    setCommandHistory(prev => [...prev, commandInput]);
    setHistoryIndex(-1);

    // Execute command
    executeCLICommand(commandInput);
    setCommandInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCommandInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCommandInput('');
        } else {
          setHistoryIndex(newIndex);
          setCommandInput(commandHistory[newIndex]);
        }
      }
    }
  };

  if (!isVisible) return null;

  return (
    <div className="flex flex-col bg-zinc-900">
      <div className="flex flex-row items-center justify-between p-4 border-b border-border/80">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4" />
          <span className="font-medium text-sm">Command Console</span>
          <Badge variant="secondary">{logs.length}</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ×
        </Button>
      </div>

      <div className="flex flex-col space-y-4 p-4">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-blue-900/30 border border-blue-800/50 p-2 rounded">
              <div className="font-medium text-blue-300">UI Actions</div>
              <div className="text-blue-400 font-semibold">{stats.logsBySource.ui || 0}</div>
            </div>
            <div className="bg-green-900/30 border border-green-800/50 p-2 rounded">
              <div className="font-medium text-green-300">API Actions</div>
              <div className="text-green-400 font-semibold">{stats.logsBySource.api || 0}</div>
            </div>
            <div className="bg-purple-900/30 border border-purple-800/50 p-2 rounded">
              <div className="font-medium text-purple-300">CLI Actions</div>
              <div className="text-purple-400 font-semibold">{stats.logsBySource.cli || 0}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2">
          <div className="flex gap-1">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'ui' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('ui')}
            >
              UI
            </Button>
            <Button
              variant={filter === 'api' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('api')}
            >
              API
            </Button>
            <Button
              variant={filter === 'cli' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('cli')}
            >
              CLI
            </Button>
          </div>
          
          <input
            type="text"
            placeholder="Filter by action..."
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="flex-1 px-2 py-1 text-sm border border-gray-600 rounded bg-gray-800 text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleClearLogs}>
            <Trash2 className="h-3 w-3 mr-1" />
            Clear
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportLogs}>
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
        </div>

        {/* CLI Command Input */}
        <div className="border-t border-border/80 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Terminal className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">CLI Commands</span>
          </div>
          <form onSubmit={handleCommandSubmit} className="space-y-2">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleCommandSubmit(e);
                  } else {
                    handleKeyDown(e);
                  }
                }}
                placeholder="Type command (e.g., add-video, help)...&#10;Use Shift+Enter for new lines, Enter to execute"
                className="flex-1 text-sm font-mono p-2 border border-gray-600 rounded resize-y bg-gray-800 text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                style={{ 
                  minHeight: '60px',
                  maxHeight: '120px',
                  resize: 'vertical'
                }}
              />
              <Button type="submit" size="sm" variant="outline" className="self-start">
                <Play className="h-3 w-3" />
              </Button>
            </div>
            <div className="text-xs text-gray-500">
              Use ↑/↓ arrows for command history. Type 'help' for available commands. Shift+Enter for new lines.
            </div>
          </form>
        </div>

        {/* Logs */}
        <div className="border rounded bg-zinc-950/50">
          <div className="p-2 space-y-1">
              {filteredLogs.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  No commands logged yet
                </div>
              ) : (
                filteredLogs.slice().reverse().map((log) => (
                  <div
                    key={log.id}
                    className="p-2 border border-gray-700 rounded hover:bg-gray-800 transition-colors bg-gray-900/50"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-sm ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                        <Badge className={`text-xs ${getSourceColor(log.source)}`}>
                          {log.source}
                        </Badge>
                        {log.component && (
                          <Badge variant="outline" className="text-xs">
                            {log.component}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {formatTimestamp(log.timestamp)}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-400">
                      <div className="font-medium text-gray-300">Payload:</div>
                      <pre className="mt-1 p-2 bg-gray-950 border border-gray-800 rounded text-xs overflow-x-auto max-h-32 overflow-y-auto text-gray-300 font-mono">
                        {JSON.stringify(log.payload, null, 2)}
                      </pre>
                    </div>
                    
                    {log.result && (
                      <div className="text-xs text-gray-400 mt-1">
                        <div className="font-medium text-gray-300">Result:</div>
                        <pre className="mt-1 p-2 bg-gray-950 border border-gray-800 rounded text-xs overflow-x-auto max-h-32 overflow-y-auto text-gray-300 font-mono">
                          {JSON.stringify(log.result, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))
              )}
          </div>
        </div>
      </div>
    </div>
  );
};
