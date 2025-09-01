export interface Message {
  id: number;
  chatId: number;
  role: 'user' | 'assistant';
  content: string;
  imagePath?: string;
  provider?: string;
  model?: string;
  timestamp: string;
}

export interface Chat {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
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
