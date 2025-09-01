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
}

interface AppSettings {
  openaiApiKey?: string;
  claudeApiKey?: string;
  deepseekApiKey?: string;
  selectedProvider: string;
  overlayPosition: {
    x: number;
    y: number;
  };
  overlaySize: {
    width: number;
    height: number;
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
  
  // Settings
  getSettings: () => Promise<AppSettings>;
  saveSettings: (settings: Partial<AppSettings>) => Promise<void>;
  
  // AI operations
  sendAIMessage: (params: {
    text: string;
    imagePath?: string;
    provider: string;
    apiKey: string;
    chatId?: number;
    modelId?: string;
  }) => Promise<{content: string, provider: string, model: string}>;
  
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
  
  // Screen capture events
  onScreenCaptureComplete: (callback: (data: ScreenCapture) => void) => void;
  onScreenCaptureError: (callback: (error: string) => void) => void;

  // Selection events (for screen capture overlay)
  selectionComplete: (selection: any) => void;
  selectionCancel: () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};