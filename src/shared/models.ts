export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  pricing: {
    input: string;
    output: string;
    context?: string;
  };
  capabilities: {
    vision: boolean;
    maxTokens: number;
  };
}

export interface ProviderModels {
  [provider: string]: ModelInfo[];
}

export const AVAILABLE_MODELS: ProviderModels = {
  openai: [
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      description: 'Most capable, multimodal flagship model',
      pricing: {
        input: '$2.50/1M',
        output: '$10.00/1M',
        context: '128k tokens'
      },
      capabilities: {
        vision: true,
        maxTokens: 4096
      }
    },
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      description: 'Affordable, intelligent small model',
      pricing: {
        input: '$0.15/1M',
        output: '$0.60/1M',
        context: '128k tokens'
      },
      capabilities: {
        vision: true,
        maxTokens: 4096
      }
    },
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      description: 'Previous generation flagship',
      pricing: {
        input: '$10.00/1M',
        output: '$30.00/1M',
        context: '128k tokens'
      },
      capabilities: {
        vision: true,
        maxTokens: 4096
      }
    }
  ],
  claude: [
    {
      id: 'claude-3-7-sonnet-20250219',
      name: 'Claude Sonnet 3.7',
      description: 'Latest, most capable model',
      pricing: {
        input: '$3.00/1M',
        output: '$15.00/1M',
        context: '200k tokens'
      },
      capabilities: {
        vision: true,
        maxTokens: 8192
      }
    },
    {
      id: 'claude-sonnet-4-20250514',
      name: 'Claude Sonnet 4',
      description: 'Advanced reasoning model',
      pricing: {
        input: '$3.00/1M',
        output: '$15.00/1M',
        context: '200k tokens'
      },
      capabilities: {
        vision: true,
        maxTokens: 8192
      }
    },
    {
      id: 'claude-opus-4-1-20250805',
      name: 'Claude Opus 4.1',
      description: 'Most powerful, highest quality',
      pricing: {
        input: '$15.00/1M',
        output: '$75.00/1M',
        context: '200k tokens'
      },
      capabilities: {
        vision: true,
        maxTokens: 8192
      }
    },
    {
      id: 'claude-opus-4-20250514',
      name: 'Claude Opus 4',
      description: 'High quality, creative model',
      pricing: {
        input: '$15.00/1M',
        output: '$75.00/1M',
        context: '200k tokens'
      },
      capabilities: {
        vision: true,
        maxTokens: 8192
      }
    },
    {
      id: 'claude-3-5-haiku-20241022',
      name: 'Claude Haiku 3.5',
      description: 'Fast, cost-effective model',
      pricing: {
        input: '$0.80/1M',
        output: '$4.00/1M',
        context: '200k tokens'
      },
      capabilities: {
        vision: true,
        maxTokens: 4096
      }
    }
  ],
  deepseek: [
    {
      id: 'deepseek-chat',
      name: 'DeepSeek Chat',
      description: 'General conversation, fast',
      pricing: {
        input: '$0.07/1M',
        output: '$1.68/1M',
        context: '128k tokens'
      },
      capabilities: {
        vision: false,
        maxTokens: 4096
      }
    },
    {
      id: 'deepseek-reasoner',
      name: 'DeepSeek Reasoner',
      description: 'Advanced reasoning, slower',
      pricing: {
        input: '$0.55/1M',
        output: '$2.19/1M',
        context: '128k tokens'
      },
      capabilities: {
        vision: false,
        maxTokens: 8192
      }
    }
  ]
};

export const DEFAULT_MODELS = {
  openai: 'gpt-4o-mini',
  claude: 'claude-3-7-sonnet-20250219',
  deepseek: 'deepseek-chat'
};
