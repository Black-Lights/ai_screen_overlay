import { contextBridge, ipcRenderer } from 'electron';
import { AppSettings, Chat, Message, ScreenCapture } from '../shared/types';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Environment variables access
  getApiKeys: () => ({
    openai: process.env.OPENAI_API_KEY || '',
    claude: process.env.CLAUDE_API_KEY || '',
    deepseek: process.env.DEEPSEEK_API_KEY || ''
  }),

  // Chat operations
  createChat: (title: string): Promise<Chat> => 
    ipcRenderer.invoke('create-chat', title),
  
  getChats: (): Promise<Chat[]> => 
    ipcRenderer.invoke('get-chats'),
  
  getChat: (id: number): Promise<Chat> => 
    ipcRenderer.invoke('get-chat', id),
  
  updateChatTitle: (id: number, title: string): Promise<void> => 
    ipcRenderer.invoke('update-chat-title', id, title),
  
  deleteChat: (id: number): Promise<void> => 
    ipcRenderer.invoke('delete-chat', id),

  // Message operations
  saveMessage: (message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> => 
    ipcRenderer.invoke('save-message', message),
  
  updateMessage: (id: number, updates: { content?: string; imagePath?: string }): Promise<Message | null> => 
    ipcRenderer.invoke('update-message', id, updates),
  
  getChatMessages: (chatId: number): Promise<Message[]> => 
    ipcRenderer.invoke('get-chat-messages', chatId),
  
  deleteMessage: (id: number): Promise<void> => 
    ipcRenderer.invoke('delete-message', id),

  // Settings operations
  getSettings: (): Promise<AppSettings> => 
    ipcRenderer.invoke('get-settings'),

  saveSettings: (settings: Partial<AppSettings>): Promise<void> => 
    ipcRenderer.invoke('save-settings', settings),
  
  // Token optimization operations
  estimateChatTokens: (chatId: number) => 
    ipcRenderer.invoke('estimate-chat-tokens', chatId),
    
  getOptimizationPreview: (chatId: number) =>
    ipcRenderer.invoke('get-optimization-preview', chatId),
    
  compressChatHistory: (chatId: number) =>
    ipcRenderer.invoke('compress-chat-history', chatId),
    
  // AI operations
  sendAIMessage: (params: {
    text: string;
    imagePath?: string;
    provider: string;
    apiKey: string;
    chatId?: number;
    modelId?: string;
  }): Promise<string> => 
    ipcRenderer.invoke('send-ai-message', params),
    
  sendAIMessageWithTracking: (params: {
    text: string;
    imagePath?: string;
    provider: string;
    apiKey: string;
    chatId: number;
    modelId?: string;
  }): Promise<{
    content: string;
    provider: string;
    model: string;
    optimizationUsed: string;
    actualInputTokens: number;
    inputCost: number;
    outputCost: number;
    totalCost: number;
  }> => 
    ipcRenderer.invoke('send-ai-message-with-tracking', params),

  // API Key management
  getApiKeysStatus: (): Promise<{
    openai: 'ready' | 'invalid' | 'error' | 'not-configured';
    claude: 'ready' | 'invalid' | 'error' | 'not-configured';
    deepseek: 'ready' | 'invalid' | 'error' | 'not-configured';
  }> => 
    ipcRenderer.invoke('get-api-keys-status'),

  saveApiKey: (provider: string, apiKey: string): Promise<void> => 
    ipcRenderer.invoke('save-api-key', provider, apiKey),

  // Window operations
  minimizeWindow: (): Promise<void> => 
    ipcRenderer.invoke('minimize-window'),
  
  closeWindow: (): Promise<void> => 
    ipcRenderer.invoke('close-window'),
  
  moveWindow: (x: number, y: number): Promise<void> => 
    ipcRenderer.invoke('move-window', x, y),

  // Image editing operations
  saveEditedImage: (filePath: string, buffer: Uint8Array): Promise<{ success: boolean; path: string }> =>
    ipcRenderer.invoke('save-edited-image', filePath, buffer),
  
  saveUploadedImage: (buffer: Uint8Array, filename: string): Promise<string> =>
    ipcRenderer.invoke('save-uploaded-image', buffer, filename),
  
  resizeWindow: (width: number, height: number): Promise<void> => 
    ipcRenderer.invoke('resize-window', width, height),
  
  toggleWindow: (): Promise<void> => 
    ipcRenderer.invoke('toggle-window'),

  // Screen capture events
  onScreenCaptureComplete: (callback: (data: ScreenCapture) => void) => {
    ipcRenderer.on('screen-capture-complete', (event, data) => callback(data));
  },

  onScreenCaptureError: (callback: (error: string) => void) => {
    ipcRenderer.on('screen-capture-error', (event, error) => callback(error));
  },

  // External link operations
  openExternal: (url: string): Promise<void> => 
    ipcRenderer.invoke('open-external', url),

  // Get app version
  getAppVersion: (): Promise<string> =>
    ipcRenderer.invoke('get-app-version'),

  // Selection events (for screen capture overlay)
  selectionComplete: (selection: any) => {
    ipcRenderer.send('selection-complete', selection);
  },

  selectionCancel: () => {
    ipcRenderer.send('selection-cancel');
  }
});
