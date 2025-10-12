// Natural Language Parser for Director Video Editor
// Converts natural language input into CLI commands

import { LLMIntegrationInstance } from './LLMIntegration';

export interface ParsedIntent {
  action: string;
  params: Record<string, any>;
  confidence: number;
}

export interface NLParseResult {
  intents: ParsedIntent[];
  commands: string[];
  rawInput: string;
  needsContext?: boolean;
  contextQuestion?: string;
  explanation?: string;
  usedLLM?: boolean; // Track if LLM was used
}

export class NaturalLanguageParser {
  private static instance: NaturalLanguageParser;

  // Pattern-based intent recognition
  private patterns = [
    // Video commands
    {
      pattern: /add (?:a )?video(?:\s+(?:of|with|called|named))?\s*([^\s,]+)?(?:\s+(?:for|lasting|duration|of))?\s*(\d+)?(?:\s*(?:seconds?|secs?|ms|milliseconds?))?/i,
      action: 'add-video',
      extract: (match: RegExpMatchArray) => {
        let duration = 5000; // default 5 seconds
        if (match[2]) {
          const value = parseInt(match[2]);
          // Check if unit was specified
          if (match[0].toLowerCase().includes('ms') || match[0].toLowerCase().includes('millisecond')) {
            duration = value;
          } else {
            duration = value * 1000; // convert seconds to ms
          }
        }
        return {
          src: match[1] || 'sample-video.mp4',
          duration
        };
      }
    },
    
    // Image commands
    {
      pattern: /add (?:an? )?image(?:\s+(?:of|with|called|named))?\s*([^\s,]+)?/i,
      action: 'add-image',
      extract: (match: RegExpMatchArray) => ({
        src: match[1] || 'sample-image.jpg'
      })
    },

    // Volume commands
    {
      pattern: /(?:set|change|make|adjust)\s+(?:the\s+)?volume(?:\s+(?:to|at|level))?\s+(\d+)%?/i,
      action: 'set-volume',
      extract: (match: RegExpMatchArray) => ({
        volume: parseInt(match[1]),
        needsItemId: true
      })
    },
    {
      pattern: /(?:increase|raise|turn up)\s+(?:the\s+)?volume(?:\s+(?:by|to))?\s+(\d+)?%?/i,
      action: 'set-volume',
      extract: (match: RegExpMatchArray) => ({
        volume: match[1] ? parseInt(match[1]) : 100,
        needsItemId: true
      })
    },
    {
      pattern: /(?:decrease|lower|reduce|turn down)\s+(?:the\s+)?volume(?:\s+(?:by|to))?\s+(\d+)?%?/i,
      action: 'set-volume',
      extract: (match: RegExpMatchArray) => ({
        volume: match[1] ? parseInt(match[1]) : 0,
        needsItemId: true
      })
    },
    {
      pattern: /mute(?:\s+(?:the|it))?/i,
      action: 'set-volume',
      extract: () => ({
        volume: 0,
        needsItemId: true
      })
    },

    // Opacity commands
    {
      pattern: /(?:set|change|make|adjust)\s+(?:the\s+)?opacity(?:\s+(?:to|at|level))?\s+(\d+)%?/i,
      action: 'set-opacity',
      extract: (match: RegExpMatchArray) => ({
        opacity: parseInt(match[1]),
        needsItemId: true
      })
    },
    {
      pattern: /(?:make|set)(?:\s+it)?\s+(\d+)%?\s+transparent/i,
      action: 'set-opacity',
      extract: (match: RegExpMatchArray) => ({
        opacity: 100 - parseInt(match[1]),
        needsItemId: true
      })
    },
    {
      pattern: /(?:make|set)(?:\s+it)?\s+(?:fully?\s+)?transparent/i,
      action: 'set-opacity',
      extract: () => ({
        opacity: 0,
        needsItemId: true
      })
    },
    {
      pattern: /(?:make|set)(?:\s+it)?\s+(?:fully?\s+)?opaque/i,
      action: 'set-opacity',
      extract: () => ({
        opacity: 100,
        needsItemId: true
      })
    },
    {
      pattern: /fade(?:\s+it)?(?:\s+out)?/i,
      action: 'set-opacity',
      extract: () => ({
        opacity: 50,
        needsItemId: true
      })
    },

    // Position/Move commands
    {
      pattern: /move(?:\s+(?:it|to|the item))?\s+(?:to\s+)?(?:position\s+)?(?:\()?(\d+)[\s,]+(\d+)(?:\))?/i,
      action: 'move',
      extract: (match: RegExpMatchArray) => ({
        x: parseInt(match[1]),
        y: parseInt(match[2]),
        needsItemId: true
      })
    },
    {
      pattern: /move(?:\s+it)?\s+(?:to\s+)?(?:the\s+)?center/i,
      action: 'move',
      extract: () => ({
        x: 540,  // center of 1080 width
        y: 960,  // center of 1920 height
        needsItemId: true
      })
    },

    // Utility commands
    {
      pattern: /clear(?:\s+(?:the\s+)?(?:console|logs|history))?/i,
      action: 'clear',
      extract: () => ({})
    },
    {
      pattern: /(?:show\s+)?help/i,
      action: 'help',
      extract: () => ({})
    },
    {
      pattern: /(?:what\s+can\s+(?:you|i)\s+do|commands)/i,
      action: 'help',
      extract: () => ({})
    }
  ];

  private constructor() {}

  static getInstance(): NaturalLanguageParser {
    if (!NaturalLanguageParser.instance) {
      NaturalLanguageParser.instance = new NaturalLanguageParser();
    }
    return NaturalLanguageParser.instance;
  }

  parse(input: string): NLParseResult {
    const intents: ParsedIntent[] = [];
    const commands: string[] = [];
    let matchedPattern = false;

    // Try pattern matching
    for (const { pattern, action, extract } of this.patterns) {
      const match = input.match(pattern);
      if (match) {
        const params = extract(match);
        intents.push({
          action,
          params,
          confidence: 0.85
        });

        // Generate CLI command
        const command = this.generateCommand(action, params);
        if (command) {
          commands.push(command);
        }

        matchedPattern = true;
        break; // Only match first pattern to avoid duplicates
      }
    }

    // Handle compound sentences (e.g., "add video and make it transparent")
    if (input.includes(' and ')) {
      const parts = input.split(' and ');
      if (parts.length === 2) {
        const firstResult = this.parse(parts[0]);
        const secondResult = this.parse(parts[1]);
        
        if (firstResult.commands.length > 0 && secondResult.commands.length > 0) {
          return {
            intents: [...firstResult.intents, ...secondResult.intents],
            commands: [...firstResult.commands, ...secondResult.commands],
            rawInput: input,
            explanation: `I'll ${this.explainCommands(firstResult.commands)} and then ${this.explainCommands(secondResult.commands)}`
          };
        }
      }
    }

    // If no patterns matched, return helpful suggestion
    if (!matchedPattern) {
      return {
        intents: [],
        commands: [],
        rawInput: input,
        needsContext: true,
        contextQuestion: this.getSuggestion(input)
      };
    }

    return {
      intents,
      commands,
      rawInput: input,
      explanation: this.explainCommands(commands)
    };
  }

  private getSuggestion(input: string): string {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('video')) {
      return "Try: 'add a video' or 'add a video for 10 seconds'";
    }
    if (lowerInput.includes('image') || lowerInput.includes('photo') || lowerInput.includes('picture')) {
      return "Try: 'add an image' or 'add an image sunset.jpg'";
    }
    if (lowerInput.includes('volume') || lowerInput.includes('sound') || lowerInput.includes('audio')) {
      return "Try: 'set volume to 75' or 'mute'";
    }
    if (lowerInput.includes('opacity') || lowerInput.includes('transparent') || lowerInput.includes('fade')) {
      return "Try: 'make it 50% transparent' or 'fade it out'";
    }
    if (lowerInput.includes('move') || lowerInput.includes('position')) {
      return "Try: 'move to 100 200' or 'move to center'";
    }
    
    return "I'm not sure what you mean. Try:\n• 'add a video'\n• 'set volume to 75'\n• 'make it 50% transparent'\n• 'move to center'\n• Type 'help' to see all commands";
  }

  private explainCommands(commands: string[]): string {
    if (commands.length === 0) return '';
    if (commands.length === 1) {
      const cmd = commands[0];
      if (cmd.startsWith('add-video')) return 'add a video';
      if (cmd.startsWith('add-image')) return 'add an image';
      if (cmd.startsWith('set-volume')) return 'adjust the volume';
      if (cmd.startsWith('set-opacity')) return 'change the opacity';
      if (cmd.startsWith('move')) return 'move the item';
      if (cmd === 'clear') return 'clear the console';
      if (cmd === 'help') return 'show help';
    }
    return `execute ${commands.length} commands`;
  }

  private generateCommand(action: string, params: any): string | null {
    switch (action) {
      case 'add-video':
        return `add-video ${params.src}${params.duration ? ' ' + params.duration : ''}`;
      case 'add-image':
        return `add-image ${params.src}`;
      case 'set-volume':
        if (params.needsItemId) {
          return `set-volume <last-item> ${params.volume}`;
        }
        return null;
      case 'set-opacity':
        if (params.needsItemId) {
          return `set-opacity <last-item> ${params.opacity}`;
        }
        return null;
      case 'move':
        if (params.needsItemId) {
          return `move <last-item> ${params.x} ${params.y}`;
        }
        return null;
      case 'clear':
        return 'clear';
      case 'help':
        return 'help';
      default:
        return null;
    }
  }

  // Enhanced parse with context awareness
  parseWithContext(input: string, lastItemId?: string): NLParseResult {
    const result = this.parse(input);

    // Replace <last-item> placeholder with actual ID
    if (lastItemId) {
      result.commands = result.commands.map(cmd =>
        cmd.replace('<last-item>', lastItemId)
      );
    } else if (result.commands.some(cmd => cmd.includes('<last-item>'))) {
      // If we need an item ID but don't have one
      return {
        ...result,
        needsContext: true,
        contextQuestion: "I need to know which item to modify. Please add an item first, or specify the item ID."
      };
    }

    return result;
  }

  // Async parse with LLM fallback
  async parseWithContextAsync(input: string, lastItemId?: string): Promise<NLParseResult> {
    // First try pattern matching
    const patternResult = this.parseWithContext(input, lastItemId);
    
    // If pattern matching succeeded, return immediately
    if (patternResult.commands.length > 0) {
      return { ...patternResult, usedLLM: false };
    }

    // If pattern matching failed and LLM is enabled, try LLM
    if (LLMIntegrationInstance.isEnabled()) {
      try {
        const llmResult = await LLMIntegrationInstance.parseWithLLM(
          input,
          LLMIntegrationInstance.getAvailableCommands()
        );
        
        // Replace <last-item> placeholder with actual ID
        if (lastItemId) {
          llmResult.commands = llmResult.commands.map(cmd =>
            cmd.replace('<last-item>', lastItemId)
          );
        }
        
        return { ...llmResult, usedLLM: true };
      } catch (error) {
        console.error('LLM fallback failed:', error);
        // Return pattern result with LLM error note
        return {
          ...patternResult,
          usedLLM: false,
          contextQuestion: patternResult.contextQuestion + '\n\n(LLM fallback also failed)'
        };
      }
    }

    // Return pattern result if LLM not enabled
    return { ...patternResult, usedLLM: false };
  }

  // Get contextual suggestions based on recent actions
  getSmartSuggestions(recentActions: string[]): string[] {
    const suggestions: string[] = [];

    if (recentActions.some(a => a.includes('ADD_VIDEO') || a.includes('ADD_IMAGE'))) {
      suggestions.push("Set volume to 75");
      suggestions.push("Make it 50% transparent");
      suggestions.push("Move to center");
    } else {
      suggestions.push("Add a video");
      suggestions.push("Add an image");
    }

    suggestions.push("Clear console");

    return suggestions.slice(0, 3);
  }
}

export const NLParser = NaturalLanguageParser.getInstance();

