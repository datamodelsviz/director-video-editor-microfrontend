// LLM Integration for Natural Language Command Parsing
// Provides fallback when pattern matching fails

import { NLParseResult } from './NaturalLanguageParser';

export interface LLMConfig {
  enabled: boolean;
  provider: 'openai' | 'claude' | 'local' | 'none';
  apiKey?: string;
  model?: string;
  endpoint?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface LLMResponse {
  commands: string[];
  explanation: string;
  confidence: number;
  needsContext?: boolean;
  contextQuestion?: string;
}

export class LLMIntegration {
  private static instance: LLMIntegration;
  private config: LLMConfig = {
    enabled: false,
    provider: 'none',
    maxTokens: 150,
    temperature: 0.3
  };

  private constructor() {
    // Load config from localStorage if available
    this.loadConfig();
  }

  static getInstance(): LLMIntegration {
    if (!LLMIntegration.instance) {
      LLMIntegration.instance = new LLMIntegration();
    }
    return LLMIntegration.instance;
  }

  setConfig(config: Partial<LLMConfig>) {
    this.config = { ...this.config, ...config };
    this.saveConfig();
  }

  getConfig(): LLMConfig {
    return { ...this.config };
  }

  isEnabled(): boolean {
    return this.config.enabled && 
           this.config.provider !== 'none' && 
           !!this.config.apiKey;
  }

  private loadConfig() {
    try {
      const saved = localStorage.getItem('llm_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Don't save API key in localStorage for security
        this.config = { ...this.config, ...parsed, apiKey: undefined };
      }
    } catch (error) {
      console.warn('Failed to load LLM config:', error);
    }
  }

  private saveConfig() {
    try {
      // Don't save API key in localStorage for security
      const { apiKey, ...configToSave } = this.config;
      localStorage.setItem('llm_config', JSON.stringify(configToSave));
    } catch (error) {
      console.warn('Failed to save LLM config:', error);
    }
  }

  async parseWithLLM(input: string, availableCommands: string[]): Promise<NLParseResult> {
    if (!this.isEnabled()) {
      return {
        intents: [],
        commands: [],
        rawInput: input,
        needsContext: true,
        contextQuestion: "LLM integration is not enabled. Please configure it in settings or use pattern-based commands."
      };
    }

    try {
      const response = await this.callLLM(input, availableCommands);
      
      return {
        intents: [],
        commands: response.commands,
        rawInput: input,
        needsContext: response.needsContext,
        contextQuestion: response.contextQuestion,
        explanation: response.explanation
      };
    } catch (error) {
      console.error('LLM parsing failed:', error);
      return {
        intents: [],
        commands: [],
        rawInput: input,
        needsContext: true,
        contextQuestion: `LLM error: ${error instanceof Error ? error.message : 'Unknown error'}. Try rephrasing or use simpler commands.`
      };
    }
  }

  private async callLLM(input: string, availableCommands: string[]): Promise<LLMResponse> {
    switch (this.config.provider) {
      case 'openai':
        return this.callOpenAI(input, availableCommands);
      case 'claude':
        return this.callClaude(input, availableCommands);
      case 'local':
        return this.callLocal(input, availableCommands);
      default:
        throw new Error('No LLM provider configured');
    }
  }

  private buildPrompt(input: string, availableCommands: string[]): string {
    return `You are a video editor command parser. Convert natural language to CLI commands.

Available Commands:
${availableCommands.map(cmd => `  ${cmd}`).join('\n')}

Command Format Examples:
- add-video [filename] [duration_ms]
- add-image [filename]
- set-volume <item-id> <0-100>
- set-opacity <item-id> <0-100>
- move <item-id> <x> <y>
- clear
- help

Special Tokens:
- Use "<last-item>" when referring to the most recently added item

User Input: "${input}"

Respond ONLY with valid JSON in this exact format:
{
  "commands": ["command1", "command2"],
  "explanation": "Brief explanation of what you understood",
  "confidence": 0.8,
  "needsContext": false
}

If unclear, set needsContext=true and provide contextQuestion.
Keep commands simple and use available command format.`;
  }

  private async callOpenAI(input: string, availableCommands: string[]): Promise<LLMResponse> {
    if (!this.config.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a video editor command parser. Convert natural language to CLI commands. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: this.buildPrompt(input, availableCommands)
          }
        ],
        temperature: this.config.temperature || 0.3,
        max_tokens: this.config.maxTokens || 150,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      return JSON.parse(content);
    } catch (error) {
      throw new Error('Failed to parse LLM response as JSON');
    }
  }

  private async callClaude(input: string, availableCommands: string[]): Promise<LLMResponse> {
    if (!this.config.apiKey) {
      throw new Error('Claude API key not configured');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.config.model || 'claude-3-haiku-20240307',
        max_tokens: this.config.maxTokens || 150,
        temperature: this.config.temperature || 0.3,
        messages: [
          {
            role: 'user',
            content: this.buildPrompt(input, availableCommands)
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Claude API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.content[0].text;
    
    try {
      return JSON.parse(content);
    } catch (error) {
      throw new Error('Failed to parse LLM response as JSON');
    }
  }

  private async callLocal(input: string, availableCommands: string[]): Promise<LLMResponse> {
    if (!this.config.endpoint) {
      throw new Error('Local LLM endpoint not configured');
    }

    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: this.buildPrompt(input, availableCommands),
        max_tokens: this.config.maxTokens || 150,
        temperature: this.config.temperature || 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`Local LLM error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Try to parse response (format may vary by local LLM)
    try {
      if (typeof data === 'string') {
        return JSON.parse(data);
      }
      if (data.response) {
        return JSON.parse(data.response);
      }
      if (data.text) {
        return JSON.parse(data.text);
      }
      return data;
    } catch (error) {
      throw new Error('Failed to parse local LLM response');
    }
  }

  // Get list of supported commands for LLM context
  getAvailableCommands(): string[] {
    return [
      'add-video [filename] [duration_ms] - Add a video to timeline',
      'add-image [filename] - Add an image to timeline',
      'set-volume <item-id> <0-100> - Set audio volume',
      'set-opacity <item-id> <0-100> - Set item opacity',
      'move <item-id> <x> <y> - Move item to position',
      'clear - Clear console logs',
      'help - Show available commands'
    ];
  }
}

export const LLMIntegrationInstance = LLMIntegration.getInstance();

