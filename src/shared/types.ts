export interface Message {
  id: number;
  chatId: number;
  role: 'user' | 'assistant';
  content: string;
  imagePath?: string;
  provider?: string;
  model?: string;
  timestamp: string;
  optimizationMethod?: string; // Track which optimization was used when sending
  actualInputTokens?: number; // Actual tokens sent to API
  actualCost?: number; // Actual cost of this message
}

export interface Chat {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  totalCost?: number; // Total cost spent on this chat
  messageCount?: number; // Total messages in chat
}

export interface AIProvider {
  name: string;
  id: 'openai' | 'claude' | 'deepseek';
  sendMessage(image: string, text: string, apiKey: string): Promise<string>;
}

export interface ScreenCapture {
  imagePath: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface AppSettings {
  openaiApiKey?: string;
  claudeApiKey?: string;
  deepseekApiKey?: string;
  selectedProvider: string;
  selectedModel?: string;
  selectedModels?: {
    openai?: string;
    claude?: string;
    deepseek?: string;
  };
  theme?: 'glassmorphism' | 'dark' | 'light';
  adaptiveOpacity?: boolean;
  overlayPosition: {
    x: number;
    y: number;
  };
  overlaySize: {
    width: number;
    height: number;
  };
  // Token optimization settings
  tokenOptimization: {
    strategy: 'full-history' | 'rolling-window' | 'smart-summary' | 'rolling-with-summary';
    rollingWindowSize: number; // Number of messages to keep
    summaryThreshold: number; // Token count threshold for summarization
    showTokenCounter: boolean;
    showCostEstimator: boolean;
    autoSuggestOptimization: boolean;
  };
}

export interface SelectionArea {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface IPCEvents {
  'screen-capture-start': () => void;
  'screen-capture-complete': (data: ScreenCapture) => void;
  'screen-capture-cancel': () => void;
  'save-message': (message: Omit<Message, 'id' | 'timestamp'>) => Promise<Message>;
  'get-chat-history': (chatId: number) => Promise<Message[]>;
  'create-chat': (title: string) => Promise<Chat>;
  'get-chats': () => Promise<Chat[]>;
  'delete-chat': (chatId: number) => Promise<void>;
  'save-settings': (settings: Partial<AppSettings>) => Promise<void>;
  'get-settings': () => Promise<AppSettings>;
  'send-ai-message': (params: {
    text: string;
    imagePath?: string;
    provider: string;
    apiKey: string;
  }) => Promise<string>;
}
