import { AppSettings, Chat, Message } from '@/shared/types';

export class StorageService {
  // This service interfaces with the main process through IPC
  // All database operations are handled in the main process

  async getSettings(): Promise<AppSettings> {
    return window.electronAPI.getSettings();
  }

  async saveSettings(settings: Partial<AppSettings>): Promise<void> {
    return window.electronAPI.saveSettings(settings);
  }

  async createChat(title: string): Promise<Chat> {
    return window.electronAPI.createChat(title);
  }

  async getChats(): Promise<Chat[]> {
    return window.electronAPI.getChats();
  }

  async getChat(id: number): Promise<Chat> {
    return window.electronAPI.getChat(id);
  }

  async updateChatTitle(id: number, title: string): Promise<void> {
    return window.electronAPI.updateChatTitle(id, title);
  }

  async deleteChat(id: number): Promise<void> {
    return window.electronAPI.deleteChat(id);
  }

  async saveMessage(message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
    return window.electronAPI.saveMessage(message);
  }

  async getChatMessages(chatId: number): Promise<Message[]> {
    return window.electronAPI.getChatMessages(chatId);
  }

  async deleteMessage(id: number): Promise<void> {
    return window.electronAPI.deleteMessage(id);
  }

  async sendAIMessage(params: {
    text: string;
    imagePath?: string;
    provider: string;
    apiKey: string;
    chatId?: number;
    modelId?: string;
  }): Promise<{content: string, provider: string, model: string}> {
    return window.electronAPI.sendAIMessage(params);
  }

  // Window control methods
  async minimizeWindow(): Promise<void> {
    return window.electronAPI.minimizeWindow();
  }

  async closeWindow(): Promise<void> {
    return window.electronAPI.closeWindow();
  }

  async toggleWindow(): Promise<void> {
    return window.electronAPI.toggleWindow();
  }
}

// Export a default instance
export default new StorageService();
