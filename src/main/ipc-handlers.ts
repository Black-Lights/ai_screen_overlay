import { ipcMain, BrowserWindow } from 'electron';
import { getDatabase } from './database';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

// AI Service implementation for main process
class MainAIService {
  async sendMessage(provider: string, params: {
    text: string;
    image?: string;
    apiKey: string;
    chatHistory?: any[];
    modelId?: string;
  }): Promise<{content: string, provider: string, model: string}> {
    console.log(`🔀 sendMessage called - Provider: ${provider}, Model: ${params.modelId}, Text: "${params.text.substring(0, 50)}..."`);
    
    switch (provider.toLowerCase()) {
      case 'openai':
        console.log(`🟢 Routing to OpenAI with model: ${params.modelId || 'gpt-4o'}`);
        const openaiResponse = await this.sendToOpenAI(params);
        const openaiResult = {
          content: openaiResponse,
          provider: 'OpenAI',
          model: this.getModelDisplayName('openai', params.modelId || 'gpt-4o')
        };
        console.log(`✅ OpenAI result - Provider: ${openaiResult.provider}, Model: ${openaiResult.model}, Content preview: "${openaiResult.content.substring(0, 50)}..."`);
        return openaiResult;
        
      case 'claude':
        console.log(`🟠 Routing to Claude with model: ${params.modelId || 'claude-3-7-sonnet-20250219'}`);
        const claudeResponse = await this.sendToClaude(params);
        const claudeResult = {
          content: claudeResponse,
          provider: 'Claude',
          model: this.getModelDisplayName('claude', params.modelId || 'claude-3-7-sonnet-20250219')
        };
        console.log(`✅ Claude result - Provider: ${claudeResult.provider}, Model: ${claudeResult.model}, Content preview: "${claudeResult.content.substring(0, 50)}..."`);
        return claudeResult;
        
      case 'deepseek':
        console.log(`🟣 Routing to DeepSeek with model: ${params.modelId || 'deepseek-chat'}`);
        const deepseekResponse = await this.sendToDeepSeek(params);
        const deepseekResult = {
          content: deepseekResponse,
          provider: 'DeepSeek',
          model: this.getModelDisplayName('deepseek', params.modelId || 'deepseek-chat')
        };
        console.log(`✅ DeepSeek result - Provider: ${deepseekResult.provider}, Model: ${deepseekResult.model}, Content preview: "${deepseekResult.content.substring(0, 50)}..."`);
        return deepseekResult;
        
      default:
        console.error(`❌ Unsupported AI provider: ${provider}`);
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }

  private getModelDisplayName(provider: string, modelId: string): string {
    // Map API model IDs to display names
    const modelMap: { [key: string]: { [key: string]: string } } = {
      openai: {
        'gpt-4o': 'GPT-4o',
        'gpt-4o-mini': 'GPT-4o Mini',
        'gpt-4-turbo': 'GPT-4 Turbo'
      },
      claude: {
        'claude-3-7-sonnet-20250219': 'Claude Sonnet 3.7',
        'claude-sonnet-4-20250514': 'Claude Sonnet 4',
        'claude-opus-4-1-20250805': 'Claude Opus 4.1',
        'claude-opus-4-20250514': 'Claude Opus 4',
        'claude-3-5-haiku-20241022': 'Claude Haiku 3.5'
      },
      deepseek: {
        'deepseek-chat': 'DeepSeek Chat',
        'deepseek-reasoner': 'DeepSeek Reasoner'
      }
    };

    return modelMap[provider]?.[modelId] || modelId;
  }

  private async sendToOpenAI(params: { text: string; image?: string; apiKey: string; chatHistory?: any[]; modelId?: string }): Promise<string> {
    try {
      console.log(`🤖 OpenAI request - Model: ${params.modelId || 'gpt-4o'}, Text preview: "${params.text.substring(0, 50)}..."`);
      
      const messages: any[] = [];
      
      // Add system message to clarify identity
      messages.push({
        role: 'system',
        content: 'You are GPT-4, ChatGPT, or another OpenAI language model. You were created by OpenAI, NOT by Anthropic. You are NOT Claude. When asked who you are, always respond that you are an AI assistant made by OpenAI. Never claim to be Claude or any other AI assistant from another company. This is very important - you must identify yourself correctly as an OpenAI model.'
      });
      
      // Add chat history context
      if (params.chatHistory && params.chatHistory.length > 0) {
        params.chatHistory.forEach(msg => {
          if (msg.role === 'user') {
            const content: any[] = [{ type: 'text', text: msg.content }];
            if (msg.imagePath && fs.existsSync(msg.imagePath)) {
              const imageBuffer = fs.readFileSync(msg.imagePath);
              const imageBase64 = imageBuffer.toString('base64');
              content.push({ type: 'image_url', image_url: { url: `data:image/png;base64,${imageBase64}` } });
            }
            messages.push({
              role: 'user',
              content: content.length === 1 ? content[0].text : content
            });
          } else if (msg.role === 'assistant') {
            messages.push({
              role: 'assistant',
              content: msg.content
            });
          }
        });
      }
      
      // Add current message
      messages.push({
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
      });

      // Determine if we're using an o1 model (which uses different parameters)
      const isO1Model = params.modelId?.includes('o1');
      const requestBody: any = {
        model: params.modelId || (params.image ? 'gpt-4o' : 'gpt-4o'),
        messages
      };

      // o1 models use max_completion_tokens instead of max_tokens and don't support temperature
      if (isO1Model) {
        requestBody.max_completion_tokens = 1000;
      } else {
        requestBody.max_tokens = 1000;
        requestBody.temperature = 0.7;
      }

      console.log(`🔍 OpenAI Request Body:`, JSON.stringify(requestBody, null, 2));
      console.log(`🌐 Making request to: https://api.openai.com/v1/chat/completions`);
      console.log(`🔑 Using API key: ${params.apiKey.substring(0, 15)}...`);

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${params.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`🔍 OpenAI Full Response:`, JSON.stringify(response.data, null, 2));

      const aiResponse = response.data.choices[0]?.message?.content || 'No response from OpenAI';
      console.log(`🤖 OpenAI response preview: "${aiResponse.substring(0, 100)}..."`);
      return aiResponse;
    } catch (error: any) {
      console.error('OpenAI API Error:', error);
      throw new Error(error.response?.data?.error?.message || 'Failed to communicate with OpenAI');
    }
  }

  private async sendToClaude(params: { text: string; image?: string; apiKey: string; chatHistory?: any[]; modelId?: string }): Promise<string> {
    try {
      console.log(`🤖 Claude request - Model: ${params.modelId || 'claude-3-7-sonnet-20250219'}, Text preview: "${params.text.substring(0, 50)}..."`);
      
      const messages: any[] = [];
      
      // Add chat history context
      if (params.chatHistory && params.chatHistory.length > 0) {
        params.chatHistory.forEach(msg => {
          if (msg.role === 'user') {
            const content: any[] = [{ type: 'text', text: msg.content }];
            if (msg.imagePath && fs.existsSync(msg.imagePath)) {
              const imageBuffer = fs.readFileSync(msg.imagePath);
              const imageBase64 = imageBuffer.toString('base64');
              content.unshift({
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/png',
                  data: imageBase64
                }
              });
            }
            messages.push({ role: 'user', content });
          } else if (msg.role === 'assistant') {
            messages.push({
              role: 'assistant',
              content: [{ type: 'text', text: msg.content }]
            });
          }
        });
      }
      
      // Add current message
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
      messages.push({ role: 'user', content });

      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: params.modelId || 'claude-3-7-sonnet-20250219',
          max_tokens: 1000,
          messages,
          system: 'You are Claude, an AI assistant made by Anthropic. Please identify yourself correctly as Claude when asked.'
        },
        {
          headers: {
            'x-api-key': params.apiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          }
        }
      );

      const aiResponse = response.data.content[0]?.text || 'No response from Claude';
      console.log(`🤖 Claude response preview: "${aiResponse.substring(0, 100)}..."`);
      return aiResponse;
    } catch (error: any) {
      console.error('Claude API Error:', error);
      throw new Error(error.response?.data?.error?.message || 'Failed to communicate with Claude');
    }
  }

  private async sendToDeepSeek(params: { text: string; image?: string; apiKey: string; chatHistory?: any[]; modelId?: string }): Promise<string> {
    try {
      console.log(`🤖 DeepSeek request - Model: ${params.modelId || 'deepseek-chat'}, Text preview: "${params.text.substring(0, 50)}..."`);
      
      const messages: any[] = [];
      
      // Add system message to clarify identity
      messages.push({
        role: 'system',
        content: 'You are DeepSeek, an AI assistant made by DeepSeek AI. You are NOT Claude or ChatGPT. Please respond as DeepSeek and identify yourself correctly.'
      });
      
      // Add chat history context
      if (params.chatHistory && params.chatHistory.length > 0) {
        params.chatHistory.forEach(msg => {
          if (msg.role === 'user') {
            // For DeepSeek, use simple text format for history
            messages.push({
              role: 'user',
              content: msg.content
            });
          } else if (msg.role === 'assistant') {
            messages.push({
              role: 'assistant',
              content: msg.content
            });
          }
        });
      }
      
      // Add current message - DeepSeek uses different format for vision
      if (params.image) {
        // For now, disable image support for DeepSeek to avoid format errors
        messages.push({
          role: 'user',
          content: params.text + " [Note: Image was provided but DeepSeek vision API format needs verification]"
        });
      } else {
        messages.push({
          role: 'user',
          content: params.text
        });
      }

      const response = await axios.post(
        'https://api.deepseek.com/v1/chat/completions',
        {
          model: params.modelId || 'deepseek-chat', // Use text model for now until vision format is resolved
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

      const aiResponse = response.data.choices[0]?.message?.content || 'No response from DeepSeek';
      console.log(`🤖 DeepSeek response preview: "${aiResponse.substring(0, 100)}..."`);
      return aiResponse;
    } catch (error: any) {
      console.error('DeepSeek API Error:', error);
      throw new Error(error.response?.data?.error?.message || 'Failed to communicate with DeepSeek');
    }
  }
}

const aiService = new MainAIService();

// API Key Testing Functions
async function testOpenAIKey(keyStatus: any) {
  if (!keyStatus.key) {
    keyStatus.status = 'not_configured';
    keyStatus.message = 'API key not configured';
    return;
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1
      },
      {
        headers: {
          'Authorization': `Bearer ${keyStatus.key}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    
    keyStatus.status = 'ready';
    keyStatus.message = 'API key working';
  } catch (error: any) {
    if (error.response?.status === 401) {
      keyStatus.status = 'invalid';
      keyStatus.message = 'Invalid API key';
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      keyStatus.status = 'server_down';
      keyStatus.message = 'Cannot reach OpenAI servers';
    } else {
      keyStatus.status = 'error';
      keyStatus.message = error.response?.data?.error?.message || 'Unknown error';
    }
  }
}

async function testClaudeKey(keyStatus: any) {
  if (!keyStatus.key) {
    keyStatus.status = 'not_configured';
    keyStatus.message = 'API key not configured';
    return;
  }

  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 1,
        messages: [{ 
          role: 'user', 
          content: 'test'
        }]
      },
      {
        headers: {
          'x-api-key': keyStatus.key,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        timeout: 10000
      }
    );
    
    keyStatus.status = 'ready';
    keyStatus.message = 'API key working';
  } catch (error: any) {
    console.error('Claude API Test Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      keyStatus.status = 'invalid';
      keyStatus.message = 'Invalid API key';
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      keyStatus.status = 'server_down';
      keyStatus.message = 'Cannot reach Claude servers';
    } else {
      keyStatus.status = 'error';
      keyStatus.message = error.response?.data?.error?.message || 'Unknown error';
    }
  }
}

async function testDeepSeekKey(keyStatus: any) {
  if (!keyStatus.key) {
    keyStatus.status = 'not_configured';
    keyStatus.message = 'API key not configured';
    return;
  }

  try {
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1
      },
      {
        headers: {
          'Authorization': `Bearer ${keyStatus.key}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    
    keyStatus.status = 'ready';
    keyStatus.message = 'API key working';
  } catch (error: any) {
    if (error.response?.status === 401) {
      keyStatus.status = 'invalid';
      keyStatus.message = 'Invalid API key';
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      keyStatus.status = 'server_down';
      keyStatus.message = 'Cannot reach DeepSeek servers';
    } else {
      keyStatus.status = 'error';
      keyStatus.message = error.response?.data?.error?.message || 'Unknown error';
    }
  }
}

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
    chatId?: number;
    modelId?: string;
  }) => {
    const { text, imagePath, provider, apiKey, chatId, modelId } = params;
    
    console.log(`🔑 send-ai-message called with provider: ${provider}, apiKey starts with: ${apiKey.substring(0, 10)}...`);
    
    try {
      let imageData = '';
      if (imagePath && fs.existsSync(imagePath)) {
        const imageBuffer = fs.readFileSync(imagePath);
        imageData = imageBuffer.toString('base64');
      }

      // Get chat history if chatId is provided
      let chatHistory: any[] = [];
      if (chatId) {
        const db = getDatabase();
        chatHistory = db.getChatMessages(chatId);
      }

      const response = await aiService.sendMessage(provider, {
        text,
        image: imageData,
        apiKey,
        chatHistory,
        modelId
      });

      return response; // Now returns {content, provider, model}
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

  ipcMain.handle('move-window', async (event: any, x: number, y: number) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      window.setPosition(x, y);
    }
  });

  ipcMain.handle('resize-window', async (event: any, width: number, height: number) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      window.setSize(width, height);
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

  // API Key Management
  ipcMain.handle('get-api-keys-status', async () => {
    const db = getDatabase();
    const settings = db.getSettings();
    
    const keyStatus = {
      openai: { key: '', status: 'not_configured', message: '' },
      claude: { key: '', status: 'not_configured', message: '' },
      deepseek: { key: '', status: 'not_configured', message: '' }
    };

    // Read current keys from database first, then fallback to .env
    if (settings.openaiApiKey && settings.openaiApiKey !== 'your_openai_api_key_here') {
      keyStatus.openai.key = settings.openaiApiKey;
    }
    if (settings.claudeApiKey && settings.claudeApiKey !== 'your_claude_api_key_here') {
      keyStatus.claude.key = settings.claudeApiKey;
    }
    if (settings.deepseekApiKey && settings.deepseekApiKey !== 'your_deepseek_api_key_here') {
      keyStatus.deepseek.key = settings.deepseekApiKey;
    }

    console.log('🔍 API Key Status Check:');
    console.log('OpenAI key exists:', !!keyStatus.openai.key);
    console.log('Claude key exists:', !!keyStatus.claude.key);
    console.log('DeepSeek key exists:', !!keyStatus.deepseek.key);

    // Test each API key
    await Promise.all([
      testOpenAIKey(keyStatus.openai),
      testClaudeKey(keyStatus.claude),
      testDeepSeekKey(keyStatus.deepseek)
    ]);

    // Map internal status format to expected format
    const mapStatus = (status: string): 'ready' | 'invalid' | 'error' | 'not-configured' => {
      switch (status) {
        case 'ready': return 'ready';
        case 'invalid': return 'invalid';
        case 'server_down': 
        case 'error': return 'error';
        case 'not_configured':
        default: return 'not-configured';
      }
    };

    return {
      openai: mapStatus(keyStatus.openai.status),
      claude: mapStatus(keyStatus.claude.status),
      deepseek: mapStatus(keyStatus.deepseek.status)
    };
  });

  ipcMain.handle('save-api-key', async (_event: any, { provider, key }: { provider: string, key: string }) => {
    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';

    // Read existing .env file
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    const envVarName = `${provider.toUpperCase()}_API_KEY`;
    const regex = new RegExp(`^${envVarName}=.*$`, 'm');
    
    if (regex.test(envContent)) {
      // Replace existing key
      envContent = envContent.replace(regex, `${envVarName}=${key}`);
    } else {
      // Add new key
      envContent += `\n${envVarName}=${key}`;
    }

    // Write back to .env file
    fs.writeFileSync(envPath, envContent);
    
    // Update process.env
    process.env[envVarName] = key;

    return true;
  });

  console.log('✅ setupIpcHandlers() completed successfully');
} catch (error) {
  console.error('❌ setupIpcHandlers() failed:', error);
  throw error;
}
}
