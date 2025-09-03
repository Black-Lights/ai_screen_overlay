// Global type declarations for Electron API
interface Chat {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface Message {
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

interface AppSettings {
  openaiApiKey?: string;
  claudeApiKey?: string;
  deepseekApiKey?: string;
  selectedProvider: string;
  selectedModels?: {
    openai?: string;
    claude?: string;
    deepseek?: string;
  };
  overlayPosition: {
    x: number;
    y: number;
  };
  overlaySize: {
    width: number;
    height: number;
  };
  tokenOptimization?: {
    strategy: 'full-history' | 'rolling-window' | 'smart-summary' | 'rolling-with-summary';
    rollingWindowSize: number;
    summaryThreshold: number;
    showTokenCounter: boolean;
    showCostEstimator: boolean;
    autoSuggestOptimization: boolean;
  };
}

interface ScreenCapture {
  imagePath: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ElectronAPI {
  // API Keys
  getApiKeys: () => { openai: string; claude: string; deepseek: string };
  
  // Chat operations
  createChat: (title: string) => Promise<Chat>;
  getChats: () => Promise<Chat[]>;
  getChat: (id: number) => Promise<Chat>;
  updateChatTitle: (id: number, title: string) => Promise<void>;
  deleteChat: (id: number) => Promise<void>;
  
  // Message operations
  saveMessage: (message: Omit<Message, 'id' | 'timestamp'>) => Promise<Message>;
  getChatMessages: (chatId: number) => Promise<Message[]>;
  deleteMessage: (id: number) => Promise<void>;
  
    // Settings operations
  getSettings: () => Promise<AppSettings>;
  saveSettings: (settings: Partial<AppSettings>) => Promise<void>;
  
  // Token optimization operations
  estimateChatTokens: (chatId: number) => Promise<{
    totalTokens: number;
    messageCount: number;
    estimatedCost: number;
  }>;
  getOptimizationPreview: (chatId: number) => Promise<any>;
  compressChatHistory: (chatId: number) => Promise<any>;
  
  // AI operations
  sendAIMessage: (params: {
    text: string;
    imagePath?: string;
    provider: string;
    apiKey: string;
    chatId?: number;
    modelId?: string;
  }) => Promise<{content: string, provider: string, model: string}>;
  
  sendAIMessageWithTracking: (params: {
    text: string;
    imagePath?: string;
    provider: string;
    apiKey: string;
    chatId?: number;
    modelId?: string;
    optimizationMethod?: string;
  }) => Promise<{
    content: string;
    provider: string;
    model: string;
    actualCost: number;
    optimizationUsed: string;
    actualInputTokens: number;
    totalCost: number;
  }>;
  
  // API Key management
  getApiKeysStatus: () => Promise<{
    openai: 'ready' | 'invalid' | 'error' | 'not-configured';
    claude: 'ready' | 'invalid' | 'error' | 'not-configured';
    deepseek: 'ready' | 'invalid' | 'error' | 'not-configured';
  }>;
  saveApiKey: (provider: string, apiKey: string) => Promise<void>;
  
  // Window operations
  minimizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  moveWindow: (x: number, y: number) => Promise<void>;
  resizeWindow: (width: number, height: number) => Promise<void>;
  toggleWindow: () => Promise<void>;
  
  // Image editing operations
  saveEditedImage: (filePath: string, buffer: Uint8Array) => Promise<{ success: boolean; path: string }>;
  saveUploadedImage: (buffer: Uint8Array, filename: string) => Promise<string>;
  
  // Screen capture events
  onScreenCaptureComplete: (callback: (data: ScreenCapture) => void) => void;
  onScreenCaptureError: (callback: (error: string) => void) => void;

  // External link operations
  openExternal: (url: string) => Promise<void>;

  // App information
  getAppVersion: () => Promise<string>;

  // Selection events (for screen capture overlay)
  selectionComplete: (selection: any) => void;
  selectionCancel: () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// Module declarations for asset imports
declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.jpg" {
  const value: string;
  export default value;
}

declare module "*.jpeg" {
  const value: string;
  export default value;
}

declare module "*.gif" {
  const value: string;
  export default value;
}

declare module "*.svg" {
  const value: string;
  export default value;
}

export {};