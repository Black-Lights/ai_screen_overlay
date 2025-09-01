import { Chat, Message, AppSettings, ScreenCapture } from '../shared/types';

declare global {
  interface Window {
    electronAPI: {
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
      }) => Promise<string>;
      
      // Window operations
      minimizeWindow: () => Promise<void>;
      closeWindow: () => Promise<void>;
      moveWindow: (x: number, y: number) => Promise<void>;
      resizeWindow: (width: number, height: number) => Promise<void>;
      toggleWindow: () => Promise<void>;
      
      // Screen capture events
      onScreenCaptureComplete: (callback: (data: ScreenCapture) => void) => void;
      onScreenCaptureError: (callback: (error: string) => void) => void;
    };
  }
}

export {};
