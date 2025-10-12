import React, { useState, useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CommandLogger, CommandLog } from '../../commands/CommandLogger';
import { dispatchWithLogging } from '../../commands/DispatchWrapper';
import { NLParser, NLParseResult } from '../../commands/NaturalLanguageParser';
import { LLMIntegrationInstance, LLMConfig } from '../../commands/LLMIntegration';
import { Trash2, Download, Filter, Clock, User, Code, Terminal, Play, Sparkles, MessageSquare, Lightbulb, Send, Loader2, Check, AlertCircle, Settings as SettingsIcon, Brain, X } from 'lucide-react';
import './CommandConsole.css';

interface CommandConsoleProps {
  isVisible: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  commands?: string[];
  result?: any;
  status?: 'success' | 'error' | 'info';
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
  
  // Natural Language mode state
  const [isNLMode, setIsNLMode] = useState(true); // Default to NL mode
  const [nlSuggestion, setNlSuggestion] = useState<string>('');
  const [lastAddedItemId, setLastAddedItemId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [smartSuggestions, setSmartSuggestions] = useState<string[]>([
    "Add a video",
    "Add an image",
    "Clear console"
  ]);

  // LLM Settings state
  const [showLLMSettings, setShowLLMSettings] = useState(false);
  const [llmConfig, setLlmConfig] = useState<LLMConfig>(LLMIntegrationInstance.getConfig());

  // View toggle state
  const [viewMode, setViewMode] = useState<'chat' | 'commands'>('chat'); // Default to chat view
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);

  const logger = CommandLogger.getInstance();

  // Convert logs to chat messages
  const convertLogsToChatMessages = (logs: CommandLog[]): ChatMessage[] => {
    const messages: ChatMessage[] = [];
    
    logs.forEach((log) => {
      // Only show NL_INPUT, CLI commands, and their results in chat view
      if (log.action === 'NL_INPUT' || log.source === 'cli') {
        // User message (the input)
        if (log.payload?.input) {
          messages.push({
            id: `${log.id}-user`,
            role: 'user',
            content: log.payload.input,
            timestamp: log.timestamp,
          });
        }

        // Assistant message (the result/explanation)
        const isSuccess = log.result?.success !== false;
        const explanation = log.payload?.explanation || '';
        const commands = log.payload?.commands || [];
        
        let assistantContent = '';
        if (isSuccess) {
          if (explanation) {
            assistantContent = explanation;
          } else if (commands.length > 0) {
            // Generate detailed, contextual responses based on commands
            const commandDescriptions = commands.map(cmd => {
              const parts = cmd.split(' ');
              const command = parts[0];
              const args = parts.slice(1);
              
              switch (command) {
                case 'add-video':
                  const videoSrc = args[0] || 'sample video';
                  const duration = args[1] ? ` (${parseInt(args[1])/1000}s)` : '';
                  return `Added video "${videoSrc}"${duration} to your timeline`;
                  
                case 'add-image':
                  const imageSrc = args[0] || 'sample image';
                  return `Added image "${imageSrc}" to your timeline`;
                  
                case 'set-volume':
                  const volume = args[1] ? `${args[1]}%` : 'adjusted';
                  return `Set volume to ${volume}`;
                  
                case 'set-opacity':
                  const opacity = args[1] ? `${args[1]}%` : 'adjusted';
                  return `Set opacity to ${opacity}`;
                  
                case 'move':
                  const x = args[1] || '0';
                  const y = args[2] || '0';
                  return `Moved element to position (${x}, ${y})`;
                  
                case 'clear':
                  return 'Cleared the command console';
                  
                case 'help':
                  return 'Displayed available commands';
                  
                default:
                  return `Executed ${command} command`;
              }
            });
            
            // Create a more natural response
            if (commands.length === 1) {
              assistantContent = commandDescriptions[0] + '.';
            } else if (commands.length === 2) {
              assistantContent = commandDescriptions.join(' and ') + '.';
            } else {
              const lastCommand = commandDescriptions.pop();
              assistantContent = commandDescriptions.join(', ') + ', and ' + lastCommand + '.';
            }
          } else {
            assistantContent = 'Task completed successfully.';
          }
        } else {
          const errorMsg = log.result?.error || 'Command failed';
          assistantContent = `I encountered an error: ${errorMsg}. Please try again or check your input.`;
        }

        messages.push({
          id: `${log.id}-assistant`,
          role: 'assistant',
          content: assistantContent,
          timestamp: log.timestamp,
          commands: commands,
          result: log.result,
          status: isSuccess ? 'success' : 'error',
        });
      } else if (log.action === 'NL_SUGGESTION') {
        // System message for suggestions
        messages.push({
          id: log.id,
          role: 'system',
          content: log.result?.suggestion || '',
          timestamp: log.timestamp,
          status: 'info',
        });
      }
    });

    return messages;
  };

  useEffect(() => {
    // Subscribe to log updates
    const unsubscribe = logger.subscribe((newLogs) => {
      setLogs(newLogs);
      setStats(logger.getStats());

      // Convert logs to chat messages
      const chatMsgs = convertLogsToChatMessages(newLogs);
      setChatMessages(chatMsgs);

      // Auto-scroll to bottom when new messages arrive (only in chat view)
      if (viewMode === 'chat' && chatMsgs.length > 0) {
        setTimeout(() => {
          chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }

      // Track last added item for context
      if (newLogs.length > 0) {
        const lastLog = newLogs[newLogs.length - 1];
        if (lastLog.action.includes('ADD_')) {
          const itemId = lastLog.payload?.id;
          if (itemId) {
            setLastAddedItemId(itemId);
          }
        }
      }

      // Update smart suggestions based on recent actions
      const recentActions = newLogs.slice(-5).map(log => log.action);
      const suggestions = NLParser.getSmartSuggestions(recentActions);
      setSmartSuggestions(suggestions);
    });

    // Initial load
    const initialLogs = logger.getLogs();
    setLogs(initialLogs);
    setStats(logger.getStats());
    setChatMessages(convertLogsToChatMessages(initialLogs));

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

  // Natural Language execution
  const executeNaturalLanguage = async (input: string) => {
    setIsProcessing(true);
    setNlSuggestion('');

    try {
      // Parse natural language (now async with LLM fallback)
      const parseResult: NLParseResult = await NLParser.parseWithContextAsync(input, lastAddedItemId);
      
      if (parseResult.needsContext) {
        // Show suggestion
        logger.log('NL_SUGGESTION', { input, usedLLM: parseResult.usedLLM }, { 
          suggestion: parseResult.contextQuestion 
        }, 'cli', parseResult.usedLLM ? 'LLM_Parser' : 'NL_Parser');
        setNlSuggestion(parseResult.contextQuestion || '');
        setIsProcessing(false);
        return;
      }

      // Execute each generated command
      parseResult.commands.forEach(cmd => {
        executeCLICommand(cmd);
      });

      // Log the natural language input with explanation
      logger.log('NL_INPUT', { 
        input, 
        commands: parseResult.commands,
        explanation: parseResult.explanation,
        usedLLM: parseResult.usedLLM
      }, {
        success: true,
        commandsExecuted: parseResult.commands.length,
        method: parseResult.usedLLM ? 'LLM' : 'Pattern'
      }, 'cli', parseResult.usedLLM ? 'LLM_Interface' : 'NL_Interface');

      setNlSuggestion('');
    } catch (error) {
      logger.log('NL_ERROR', { input }, {
        error: error instanceof Error ? error.message : String(error)
      }, 'cli', 'NL_Interface');
      setNlSuggestion('Sorry, I encountered an error processing that request.');
    } finally {
      setIsProcessing(false);
    }
  };

          const handleCommandSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            if (!commandInput.trim() || isProcessing) return;

            // Add to history
            setCommandHistory(prev => [...prev, commandInput]);
            setHistoryIndex(-1);

            // Execute based on mode
            if (isNLMode) {
              executeNaturalLanguage(commandInput);
            } else {
              executeCLICommand(commandInput);
            }
            
            setCommandInput('');
            
            // Auto-scroll to bottom after submitting (for chat view)
            if (viewMode === 'chat') {
              setTimeout(() => {
                chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }
          };

  const handleSuggestionClick = (suggestion: string) => {
    setCommandInput(suggestion);
    inputRef.current?.focus();
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
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            <span className="font-medium text-sm">Console</span>
          </div>
          {/* View Toggle */}
          <div className="flex gap-1 border border-zinc-700 rounded p-0.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('chat')}
              className={`h-6 px-2 text-xs ${
                viewMode === 'chat' 
                  ? 'bg-purple-600 text-white hover:bg-purple-700' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              Chat
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('commands')}
              className={`h-6 px-2 text-xs ${
                viewMode === 'commands' 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Terminal className="h-3 w-3 mr-1" />
              Commands
            </Button>
          </div>
          <Badge variant="secondary" className="text-xs">{logs.length}</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ×
        </Button>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {/* Commands View Content */}
        {viewMode === 'commands' && (
          <div className="p-4 space-y-4">
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
          </div>
        )}


        {/* CLI Command Input - Only show in Commands View */}
        {viewMode === 'commands' && (
          <div className="border-t border-border/80 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {isNLMode ? (
                  <>
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    <span className="text-sm font-medium text-purple-400">AI Assistant</span>
                    <Badge variant="secondary" className="bg-purple-900/50 text-purple-300 text-xs">Natural Language</Badge>
                  </>
                ) : (
                  <>
                    <Terminal className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-medium text-blue-400">CLI Commands</span>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant={isNLMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setIsNLMode(true)}
                  className={isNLMode ? 'bg-purple-600 hover:bg-purple-700 h-7 text-xs' : 'h-7 text-xs'}
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Natural
                </Button>
                <Button
                  variant={!isNLMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setIsNLMode(false)}
                  className={!isNLMode ? 'bg-blue-600 hover:bg-blue-700 h-7 text-xs' : 'h-7 text-xs'}
                >
                  <Code className="h-3 w-3 mr-1" />
                  CLI
                </Button>
                {isNLMode && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowLLMSettings(!showLLMSettings)}
                    className="h-7 text-xs"
                    title="LLM Settings"
                  >
                    <Brain className="h-3 w-3 mr-1" />
                    {LLMIntegrationInstance.isEnabled() && (
                      <span className="ml-1 w-1.5 h-1.5 bg-green-400 rounded-full" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* CLI Input for Commands View */}
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
                  placeholder={
                    isNLMode
                      ? "Tell me what you want to do...&#10;e.g., 'Add a video and make it 50% transparent'"
                      : "Type command (e.g., add-video, help)...&#10;Use Shift+Enter for new lines, Enter to execute"
                  }
                  disabled={isProcessing}
                  className={`flex-1 text-sm p-2 border rounded resize-y text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 ${
                    isNLMode 
                      ? 'font-sans border-purple-600 bg-purple-950/30 focus:ring-purple-500 focus:border-purple-500' 
                      : 'font-mono border-gray-600 bg-gray-800 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  rows={3}
                  style={{ 
                    minHeight: '60px',
                    maxHeight: '120px',
                    resize: 'vertical'
                  }}
                />
                <Button 
                  type="submit" 
                  size="sm" 
                  disabled={isProcessing || !commandInput.trim()}
                  className={`self-start ${
                    isNLMode 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isProcessing ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : isNLMode ? (
                    <Send className="h-3 w-3" />
                  ) : (
                    <Play className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <div className="text-xs text-gray-500">
                {isNLMode ? (
                  <>💬 Talk naturally! Press Enter to send, Shift+Enter for new line. Use ↑/↓ for history.</>
                ) : (
                  <>Use ↑/↓ arrows for command history. Type 'help' for available commands. Shift+Enter for new lines.</>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Chat View or Commands View */}
        {viewMode === 'chat' ? (
          /* Chat View - Like ChatGPT/Intercom */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Chat Messages - Natural order (oldest to newest) */}
            <div className="flex-1 overflow-y-auto bg-zinc-950/50">
              <div className="p-4 space-y-4">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-16">
                    <Sparkles className="h-16 w-16 mx-auto mb-6 text-purple-400 opacity-50" />
                    <h3 className="text-lg font-medium text-gray-300 mb-2">Start a conversation</h3>
                    <p className="text-gray-500 text-sm">Type naturally to control your video editor</p>
                    <p className="text-gray-600 text-xs mt-2">Try: "Add a video" or "Make it 50% transparent"</p>
                  </div>
                ) : (
                  chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-purple-600 text-white'
                            : message.role === 'system'
                            ? 'bg-yellow-900/20 border border-yellow-700/30 text-yellow-200'
                            : message.status === 'error'
                            ? 'bg-red-900/20 border border-red-700/30 text-red-200'
                            : 'bg-zinc-800/80 text-gray-100'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
                          {message.commands && message.commands.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-white/10">
                              <p className="text-xs opacity-70 mb-2 font-medium">Executed commands:</p>
                              <div className="space-y-1">
                                {message.commands.map((cmd, idx) => (
                                  <code key={idx} className="block text-xs font-mono bg-black/20 px-2 py-1 rounded text-gray-300">
                                    {cmd}
                                  </code>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="text-xs opacity-50 mt-2 text-right">
                          {formatTimestamp(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {/* Scroll anchor for auto-scroll */}
                <div ref={chatMessagesEndRef} />
              </div>
            </div>

            {/* Sticky Chat Input Section - Like Intercom */}
            <div className="border-t border-zinc-700 bg-zinc-900 p-4 flex-shrink-0">
              {/* LLM Settings - Only show when needed */}
              {showLLMSettings && (
                <div className="mb-4 p-3 bg-zinc-800/50 border border-zinc-700 rounded">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-purple-400" />
                      <span className="text-sm font-medium text-purple-300">LLM Settings</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowLLMSettings(false)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="space-y-3 text-xs">
                    {/* Enable/Disable */}
                    <div className="flex items-center justify-between">
                      <label className="text-gray-300">Enable LLM Fallback</label>
                      <input
                        type="checkbox"
                        checked={llmConfig.enabled}
                        onChange={(e) => {
                          const newConfig = { ...llmConfig, enabled: e.target.checked };
                          setLlmConfig(newConfig);
                          LLMIntegrationInstance.setConfig(newConfig);
                        }}
                        className="rounded"
                      />
                    </div>

                    {llmConfig.enabled && (
                      <>
                        {/* Provider Selection */}
                        <div>
                          <label className="text-gray-300 block mb-1">Provider</label>
                          <select
                            value={llmConfig.provider}
                            onChange={(e) => {
                              const newConfig = { ...llmConfig, provider: e.target.value as any };
                              setLlmConfig(newConfig);
                              LLMIntegrationInstance.setConfig(newConfig);
                            }}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-gray-200"
                          >
                            <option value="none">None</option>
                            <option value="openai">OpenAI</option>
                            <option value="claude">Claude (Anthropic)</option>
                            <option value="local">Local LLM</option>
                          </select>
                        </div>

                        {llmConfig.provider !== 'none' && (
                          <>
                            {/* API Key */}
                            <div>
                              <label className="text-gray-300 block mb-1">API Key</label>
                              <input
                                type="password"
                                value={llmConfig.apiKey || ''}
                                onChange={(e) => {
                                  const newConfig = { ...llmConfig, apiKey: e.target.value };
                                  setLlmConfig(newConfig);
                                  LLMIntegrationInstance.setConfig(newConfig);
                                }}
                                placeholder="sk-..."
                                className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-gray-200 placeholder-gray-600"
                              />
                            </div>

                            {/* Model */}
                            {llmConfig.provider === 'openai' && (
                              <div>
                                <label className="text-gray-300 block mb-1">Model</label>
                                <input
                                  type="text"
                                  value={llmConfig.model || 'gpt-4o-mini'}
                                  onChange={(e) => {
                                    const newConfig = { ...llmConfig, model: e.target.value };
                                    setLlmConfig(newConfig);
                                    LLMIntegrationInstance.setConfig(newConfig);
                                  }}
                                  placeholder="gpt-4o-mini"
                                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-gray-200 placeholder-gray-600"
                                />
                              </div>
                            )}

                            {llmConfig.provider === 'claude' && (
                              <div>
                                <label className="text-gray-300 block mb-1">Model</label>
                                <input
                                  type="text"
                                  value={llmConfig.model || 'claude-3-haiku-20240307'}
                                  onChange={(e) => {
                                    const newConfig = { ...llmConfig, model: e.target.value };
                                    setLlmConfig(newConfig);
                                    LLMIntegrationInstance.setConfig(newConfig);
                                  }}
                                  placeholder="claude-3-haiku-20240307"
                                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-gray-200 placeholder-gray-600"
                                />
                              </div>
                            )}

                            {llmConfig.provider === 'local' && (
                              <div>
                                <label className="text-gray-300 block mb-1">Endpoint URL</label>
                                <input
                                  type="text"
                                  value={llmConfig.endpoint || ''}
                                  onChange={(e) => {
                                    const newConfig = { ...llmConfig, endpoint: e.target.value };
                                    setLlmConfig(newConfig);
                                    LLMIntegrationInstance.setConfig(newConfig);
                                  }}
                                  placeholder="http://localhost:8000/api/generate"
                                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-gray-200 placeholder-gray-600"
                                />
                              </div>
                            )}
                          </>
                        )}

                        {LLMIntegrationInstance.isEnabled() && (
                          <div className="flex items-center gap-2 pt-2 text-green-400">
                            <Check className="h-3 w-3" />
                            <span>LLM fallback is active</span>
                          </div>
                        )}
                      </>
                    )}

                    <div className="pt-2 border-t border-zinc-700 text-gray-500">
                      <p>💡 LLM fallback activates only when pattern matching fails</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Smart Suggestions - Show only 1 with modal for others */}
              {smartSuggestions.length > 0 && !showLLMSettings && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-3 w-3 text-yellow-400" />
                    <span className="text-xs text-gray-400">Quick suggestions:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSuggestionClick(smartSuggestions[0])}
                      className="text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-gray-300 rounded-full transition-colors border border-zinc-700"
                      type="button"
                    >
                      {smartSuggestions[0]}
                    </button>
                    {smartSuggestions.length > 1 && (
                      <button
                        onClick={() => setShowSuggestionsModal(true)}
                        className="text-xs px-2 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-gray-400 rounded-full transition-colors border border-zinc-700"
                        type="button"
                      >
                        +{smartSuggestions.length - 1} more
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* NL Suggestion/Help */}
              {nlSuggestion && (
                <div className="mb-3 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded text-sm text-yellow-300 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium mb-1">Suggestion:</div>
                    <div className="whitespace-pre-line text-xs">{nlSuggestion}</div>
                  </div>
                </div>
              )}

              {/* Chat Input */}
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
                    placeholder="Type your message..."
                    disabled={isProcessing}
                    className="flex-1 text-sm p-3 border border-zinc-600 rounded-lg resize-none text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-zinc-800"
                    rows={1}
                    style={{ 
                      minHeight: '44px',
                      maxHeight: '120px',
                      resize: 'none'
                    }}
                  />
                  <Button 
                    type="submit" 
                    size="sm" 
                    disabled={isProcessing || !commandInput.trim()}
                    className="self-end bg-purple-600 hover:bg-purple-700 h-11 px-4"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="text-xs text-gray-500 flex items-center justify-between">
                  <span>Press Enter to send, Shift+Enter for new line</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowLLMSettings(!showLLMSettings)}
                      className="h-6 text-xs text-gray-400 hover:text-gray-200"
                      title="LLM Settings"
                    >
                      <Brain className="h-3 w-3 mr-1" />
                      {LLMIntegrationInstance.isEnabled() && (
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </div>

            {/* Suggestions Modal */}
            {showSuggestionsModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 max-w-md w-full mx-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-200">Quick Suggestions</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSuggestionsModal(false)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {smartSuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          handleSuggestionClick(suggestion);
                          setShowSuggestionsModal(false);
                        }}
                        className="w-full text-left px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-gray-300 rounded-lg transition-colors border border-zinc-700"
                        type="button"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Commands View - Technical Log View */
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
        )}
      </div>
    </div>
  );
};
