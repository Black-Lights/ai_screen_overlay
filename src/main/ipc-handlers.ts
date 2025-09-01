import { ipcMain, BrowserWindow } from 'electron';
import { getDatabase } from './database';
import axios from 'axios';
import * as fs from 'fs';

// AI Service implementation for main process
class MainAIService {
  async sendMessage(provider: string, params: {
    text: string;
    image?: string;
    apiKey: string;
  }): Promise<string> {
    switch (provider.toLowerCase()) {
      case 'openai':
        return this.sendToOpenAI(params);
      case 'claude':
        return this.sendToClaude(params);
      case 'deepseek':
        return this.sendToDeepSeek(params);
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }

  private async sendToOpenAI(params: { text: string; image?: string; apiKey: string }): Promise<string> {
    try {
      const messages: any[] = [{
        role: 'user',
        content: params.image ? [
          { type: 'text', text: params.text },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/png;base64,${params.image}`,
              detail: 'high'
            }
          }
        ] : params.text
      }];

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: params.image ? 'gpt-4o' : 'gpt-4o',
          messages,
          max_tokens: 1000,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${params.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0]?.message?.content || 'No response from OpenAI';
    } catch (error: any) {
      console.error('OpenAI API Error:', error);
      throw new Error(error.response?.data?.error?.message || 'Failed to communicate with OpenAI');
    }
  }

  private async sendToClaude(params: { text: string; image?: string; apiKey: string }): Promise<string> {
    try {
      const content: any[] = [{ type: 'text', text: params.text }];
      
      if (params.image) {
        content.unshift({
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/png',
            data: params.image
          }
        });
      }

      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content
          }]
        },
        {
          headers: {
            'x-api-key': params.apiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          }
        }
      );

      return response.data.content[0]?.text || 'No response from Claude';
    } catch (error: any) {
      console.error('Claude API Error:', error);
      throw new Error(error.response?.data?.error?.message || 'Failed to communicate with Claude');
    }
  }

  private async sendToDeepSeek(params: { text: string; image?: string; apiKey: string }): Promise<string> {
    try {
      const messages: any[] = [{
        role: 'user',
        content: params.image ? [
          { type: 'text', text: params.text },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/png;base64,${params.image}`
            }
          }
        ] : params.text
      }];

      const response = await axios.post(
        'https://api.deepseek.com/v1/chat/completions',
        {
          model: params.image ? 'deepseek-vl-chat' : 'deepseek-chat',
          messages,
          max_tokens: 1000,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${params.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0]?.message?.content || 'No response from DeepSeek';
    } catch (error: any) {
      console.error('DeepSeek API Error:', error);
      throw new Error(error.response?.data?.error?.message || 'Failed to communicate with DeepSeek');
    }
  }
}

const aiService = new MainAIService();

export function setupIpcHandlers(): void {
  console.log('🔄 setupIpcHandlers() called');
  
  try {
    console.log('🗄️ Getting database instance...');
    const db = getDatabase();
    console.log('✅ Database instance retrieved');

    console.log('💬 Setting up chat operation handlers...');
    // Chat operations
    ipcMain.handle('create-chat', async (_event: any, title: string) => {
      console.log('📝 create-chat called with title:', title);
      return db.createChat(title);
    });

  ipcMain.handle('get-chats', async () => {
    return db.getChats();
  });

  ipcMain.handle('get-chat', async (_event: any, id: number) => {
    return db.getChat(id);
  });

  ipcMain.handle('update-chat-title', async (_event: any, id: number, title: string) => {
    db.updateChatTitle(id, title);
  });

  ipcMain.handle('delete-chat', async (_event: any, id: number) => {
    db.deleteChat(id);
  });

  // Message operations
  ipcMain.handle('save-message', async (_event: any, message: any) => {
    return db.saveMessage(message);
  });

  ipcMain.handle('get-chat-messages', async (_event: any, chatId: number) => {
    return db.getChatMessages(chatId);
  });

  ipcMain.handle('delete-message', async (_event: any, id: number) => {
    db.deleteMessage(id);
  });

  // Settings operations
  ipcMain.handle('get-settings', async () => {
    return db.getSettings();
  });

  ipcMain.handle('save-settings', async (_event: any, settings: any) => {
    db.saveSettings(settings);
  });

  // AI operations
  ipcMain.handle('send-ai-message', async (_event: any, params: {
    text: string;
    imagePath?: string;
    provider: string;
    apiKey: string;
  }) => {
    const { text, imagePath, provider, apiKey } = params;
    
    try {
      let imageData = '';
      if (imagePath && fs.existsSync(imagePath)) {
        const imageBuffer = fs.readFileSync(imagePath);
        imageData = imageBuffer.toString('base64');
      }

      const response = await aiService.sendMessage(provider, {
        text,
        image: imageData,
        apiKey
      });

      return response;
    } catch (error: any) {
      console.error('AI message failed:', error);
      throw error;
    }
  });

  // Window operations
  ipcMain.handle('minimize-window', async (event: any) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      window.minimize();
    }
  });

  ipcMain.handle('close-window', async (event: any) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      window.hide();
    }
  });

  ipcMain.handle('toggle-window', async (event: any) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      if (window.isVisible()) {
        window.hide();
      } else {
        window.show();
        window.focus();
      }
    }
  });

  // Selection overlay events
  ipcMain.on('selection-complete', (event: any, selection: any) => {
    event.reply('selection-result', selection);
  });

  ipcMain.on('selection-cancel', (event: any) => {
    event.reply('selection-result', null);
  });

  console.log('✅ setupIpcHandlers() completed successfully');
} catch (error) {
  console.error('❌ setupIpcHandlers() failed:', error);
  throw error;
}
}
