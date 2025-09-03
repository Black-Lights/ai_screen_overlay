import { ipcMain, BrowserWindow, shell, app } from 'electron';
import { getDatabase } from './database';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

// Version constant - update this when releasing new versions
const APP_VERSION = '1.1.0';

// AI Service implementation for main process
class MainAIService {
  async sendMessage(provider: string, params: {
    text: string;
    image?: string;
    apiKey: string;
    chatHistory?: any[];
    modelId?: string;
  }): Promise<{content: string, provider: string, model: string}> {
    console.log(`🔀 sendMessage called with provider: ${provider}, text: ${params.text.substring(0, 50)}...`);
    const imageData = params.image;
    
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
      const messageText = params.text.trim() || "What do you see in this image?";
      messages.push({
        role: 'user',
        content: params.image ? [
          { type: 'text', text: messageText },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/png;base64,${params.image}`,
              detail: 'high'
            }
          }
        ] : messageText
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
      const messageText = params.text.trim() || "What do you see in this image?";
      const content: any[] = [{ type: 'text', text: messageText }];
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
      const messageText = params.text.trim() || "What do you see in this image?";
      if (params.image) {
        // For now, disable image support for DeepSeek to avoid format errors
        messages.push({
          role: 'user',
          content: messageText + " [Note: Image was provided but DeepSeek vision API format needs verification]"
        });
      } else {
        messages.push({
          role: 'user',
          content: messageText
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
    } else if (error.response?.status === 429 || error.response?.data?.error?.type === 'rate_limit_error') {
      keyStatus.status = 'error';
      keyStatus.message = 'Rate limit exceeded, try again later';
    } else if (error.response?.data?.error?.type === 'overloaded_error') {
      keyStatus.status = 'error';
      keyStatus.message = 'Claude servers are overloaded, try again later';
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

  ipcMain.handle('update-message', async (_event: any, id: number, updates: { content?: string; imagePath?: string }) => {
    return db.updateMessage(id, updates);
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
        chatHistory = db.getOptimizedChatMessages(chatId);
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

  // Enhanced AI message sending with optimization tracking
  ipcMain.handle('send-ai-message-with-tracking', async (_event: any, params: {
    text: string;
    imagePath?: string;
    provider: string;
    apiKey: string;
    chatId?: number;
    modelId?: string;
    optimizationMethod?: string;
  }) => {
    const { text, imagePath, provider, apiKey, chatId, modelId } = params;
    
    console.log(`🔑 send-ai-message-with-tracking called with provider: ${provider}`);
    
    try {
      const db = getDatabase();
      const settings = db.getSettings();
      let imageData = '';
      
      if (imagePath && fs.existsSync(imagePath)) {
        const imageBuffer = fs.readFileSync(imagePath);
        imageData = imageBuffer.toString('base64');
      }

      let chatHistory: any[] = [];
      let optimizationUsed = 'full-history';
      let actualInputTokens = 0;
      
      if (chatId) {
        const messages = db.getChatMessages(chatId);
        const { 
          applyRollingWindow, 
          applySmartSummary, 
          applyRollingWithSummary,
          estimateMessageTokens
        } = require('../shared/token-optimizer');
        
        // Get optimization strategy from settings
        const tokenOptimization = settings.tokenOptimization || {
          strategy: 'full-history',
          rollingWindowSize: 15,
          summaryThreshold: 5000
        };
        
        // Apply optimization based on strategy
        switch (tokenOptimization.strategy) {
          case 'rolling-window':
            const rollingResult = applyRollingWindow(messages, tokenOptimization.rollingWindowSize);
            chatHistory = rollingResult.messages;
            optimizationUsed = 'rolling-window';
            break;
          case 'smart-summary':
            const summaryResult = applySmartSummary(messages, tokenOptimization.summaryThreshold);
            chatHistory = summaryResult.messages;
            optimizationUsed = 'smart-summary';
            break;
          case 'rolling-with-summary':
            const hybridResult = applyRollingWithSummary(messages, tokenOptimization.rollingWindowSize, tokenOptimization.summaryThreshold);
            chatHistory = hybridResult.messages;
            optimizationUsed = 'rolling-with-summary';
            break;
          default:
            chatHistory = messages;
            optimizationUsed = 'full-history';
        }
        
        // Calculate actual input tokens that will be sent
        actualInputTokens = chatHistory.reduce((total, msg) => total + estimateMessageTokens(msg), 0);
        
        // Add current message tokens
        actualInputTokens += estimateMessageTokens({ content: text });
      }

      const aiService = new MainAIService();
      const response = await aiService.sendMessage(provider, {
        text,
        image: imageData,
        apiKey,
        chatHistory,
        modelId
      });

      // Calculate actual costs
      const { estimateCost } = require('../shared/token-optimizer');
      const model = modelId || 'gpt-4o';
      const inputCost = estimateCost(actualInputTokens, provider, model, 'input');
      
      // Estimate output tokens and cost (rough estimate based on response length)
      const estimatedOutputTokens = Math.ceil(response.content.length / 4);
      const outputCost = estimateCost(estimatedOutputTokens, provider, model, 'output');
      
      return {
        ...response,
        optimizationUsed,
        actualInputTokens,
        inputCost,
        outputCost,
        totalCost: inputCost + outputCost
      };
    } catch (error: any) {
      console.error('Enhanced AI message sending failed:', error);
      throw error;
    }
  });

  // Token optimization operations
  ipcMain.handle('estimate-chat-tokens', async (_event: any, chatId: number) => {
    const db = getDatabase();
    const messages = db.getChatMessages(chatId);
    
    try {
      const { estimateChatTokens, estimateAccurateChatCost } = require('../shared/token-optimizer');
      const settings = db.getSettings();
      
      const totalTokens = estimateChatTokens(messages);
      const fallbackProvider = settings.selectedProvider || 'openai';
      const fallbackModel = settings.selectedModels?.[fallbackProvider] || 'gpt-4o';
      
      // Use accurate cost calculation that considers each message's actual model
      const accurateCostBreakdown = estimateAccurateChatCost(messages, fallbackProvider, fallbackModel);
      
      return {
        totalTokens,
        messageCount: messages.length,
        estimatedCost: accurateCostBreakdown.totalCost,
        costBreakdown: {
          inputCost: accurateCostBreakdown.inputCost,
          estimatedOutputCost: accurateCostBreakdown.estimatedOutputCost,
          totalCost: accurateCostBreakdown.totalCost
        },
        modelBreakdown: accurateCostBreakdown.breakdown
      };
    } catch (error) {
      console.error('Failed to estimate tokens:', error);
      return {
        totalTokens: 0,
        messageCount: messages.length,
        estimatedCost: 0,
        costBreakdown: { inputCost: 0, estimatedOutputCost: 0, totalCost: 0 },
        modelBreakdown: []
      };
    }
  });

  ipcMain.handle('get-optimization-preview', async (_event: any, chatId: number) => {
    const db = getDatabase();
    const messages = db.getChatMessages(chatId);
    const settings = db.getSettings();
    
    try {
      const { 
        applyRollingWindow, 
        applySmartSummary, 
        applyRollingWithSummary,
        estimateAccurateChatCost
      } = require('../shared/token-optimizer');
      
      const { strategy, rollingWindowSize, summaryThreshold } = settings.tokenOptimization;
      const fallbackProvider = settings.selectedProvider || 'openai';
      const fallbackModel = settings.selectedModels?.[fallbackProvider] || 'gpt-4o';
      
      let result;
      switch (strategy) {
        case 'rolling-window':
          result = applyRollingWindow(messages, rollingWindowSize);
          break;
        case 'smart-summary':
          result = applySmartSummary(messages, summaryThreshold);
          break;
        case 'rolling-with-summary':
          result = applyRollingWithSummary(messages, rollingWindowSize, summaryThreshold);
          break;
        default:
          result = { 
            messages, 
            originalTokens: messages.reduce((acc, msg) => acc + Math.ceil(msg.content.length / 4), 0), 
            optimizedTokens: messages.reduce((acc, msg) => acc + Math.ceil(msg.content.length / 4), 0), 
            savedTokens: 0, 
            strategy: 'full-history' 
          };
      }
      
      // Use accurate cost calculations that consider each message's actual model
      const originalCostBreakdown = estimateAccurateChatCost(messages, fallbackProvider, fallbackModel);
      const optimizedCostBreakdown = estimateAccurateChatCost(result.messages, fallbackProvider, fallbackModel);
      
      return {
        ...result,
        originalCost: originalCostBreakdown.totalCost,
        optimizedCost: optimizedCostBreakdown.totalCost,
        savedCost: originalCostBreakdown.totalCost - optimizedCostBreakdown.totalCost,
        costBreakdown: {
          original: originalCostBreakdown,
          optimized: optimizedCostBreakdown
        }
      };
    } catch (error) {
      console.error('Failed to get optimization preview:', error);
      return {
        messages,
        originalTokens: 0,
        optimizedTokens: 0,
        savedTokens: 0,
        strategy: 'error',
        originalCost: 0,
        optimizedCost: 0,
        savedCost: 0,
        costBreakdown: {
          original: { inputCost: 0, estimatedOutputCost: 0, totalCost: 0, breakdown: [] },
          optimized: { inputCost: 0, estimatedOutputCost: 0, totalCost: 0, breakdown: [] }
        }
      };
    }
  });

  ipcMain.handle('compress-chat-history', async (_event: any, chatId: number) => {
    const db = getDatabase();
    const messages = db.getChatMessages(chatId);
    const settings = db.getSettings();
    
    try {
      const { applySmartSummary } = require('../shared/token-optimizer');
      const result = applySmartSummary(messages, settings.tokenOptimization.summaryThreshold);
      
      if (result.checkpoint) {
        // Save the summary message to database
        const summaryMessage = db.saveMessage({
          chatId: chatId,
          role: result.checkpoint.role,
          content: result.checkpoint.content,
          provider: result.checkpoint.provider,
          model: result.checkpoint.model
        });
        
        // Delete the old messages that were summarized
        const messagesToDelete = messages.slice(0, -Math.max(5, Math.floor(messages.length * 0.3)));
        messagesToDelete.forEach(msg => db.deleteMessage(msg.id));
        
        return {
          success: true,
          summaryMessage,
          deletedCount: messagesToDelete.length,
          savedTokens: result.savedTokens
        };
      }
      
      return {
        success: false,
        reason: 'No compression needed'
      };
    } catch (error) {
      console.error('Failed to compress chat history:', error);
      return {
        success: false,
        reason: 'Compression failed'
      };
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
    try {
      console.log(`💾 Saving API key for provider: ${provider}`);
      
      const db = getDatabase();
      const currentSettings = db.getSettings();
      
      // Create the updated settings object
      const updatedSettings = { ...currentSettings };
      
      switch (provider.toLowerCase()) {
        case 'openai':
          updatedSettings.openaiApiKey = key;
          break;
        case 'claude':
          updatedSettings.claudeApiKey = key;
          break;
        case 'deepseek':
          updatedSettings.deepseekApiKey = key;
          break;
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }
      
      // Save to database
      db.saveSettings(updatedSettings);
      console.log(`✅ API key saved to database for ${provider}`);
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to save API key for ${provider}:`, error);
      throw error;
    }
  });

  // External link operations
  ipcMain.handle('open-external', async (_event: any, url: string) => {
    await shell.openExternal(url);
  });

  // Get app version
  ipcMain.handle('get-app-version', async () => {
    // In development: read from project root
    // In production: read from app root (same directory as the executable)
    const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
    
    try {
      let packageJsonPath: string;
      if (isDev) {
        // Development: go up from dist/main/main/ to project root
        packageJsonPath = path.join(__dirname, '..', '..', '..', 'package.json');
      } else {
        // Production: try multiple locations
        const possiblePaths = [
          path.join(process.resourcesPath, 'package.json'),
          path.join(process.resourcesPath, 'app', 'package.json'),
          path.join(__dirname, '..', '..', '..', 'package.json'),
          path.join(app.getAppPath(), 'package.json')
        ];
        
        packageJsonPath = possiblePaths.find(p => {
          try {
            return fs.existsSync(p);
          } catch {
            return false;
          }
        }) || possiblePaths[0];
      }
      
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      return packageJson.version || APP_VERSION;
    } catch (error) {
      console.error('Failed to read package.json:', error);
      console.log('Tried paths:', isDev ? 'development mode' : 'production paths');
      return APP_VERSION; // use hardcoded version constant
    }
  });

  // Save uploaded image
  ipcMain.handle('save-uploaded-image', async (_event: any, buffer: Uint8Array, filename: string) => {
    try {
      console.log('📁 Saving uploaded image:', filename);
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(__dirname, '..', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Generate unique filename to avoid conflicts
      const timestamp = Date.now();
      const ext = path.extname(filename);
      const nameWithoutExt = path.basename(filename, ext);
      const uniqueFilename = `${nameWithoutExt}_${timestamp}${ext}`;
      const filePath = path.join(uploadsDir, uniqueFilename);
      
      // Convert Uint8Array to Buffer and save
      const nodeBuffer = Buffer.from(buffer);
      fs.writeFileSync(filePath, nodeBuffer);
      
      console.log('✅ Uploaded image saved successfully:', filePath);
      return filePath;
    } catch (error) {
      console.error('❌ Failed to save uploaded image:', error);
      throw error;
    }
  });

  // Save edited image
  ipcMain.handle('save-edited-image', async (_event: any, filePath: string, buffer: Uint8Array) => {
    try {
      console.log('💾 Saving edited image:', filePath);
      // Convert Uint8Array to Buffer for fs.writeFileSync
      const nodeBuffer = Buffer.from(buffer);
      fs.writeFileSync(filePath, nodeBuffer);
      console.log('✅ Edited image saved successfully');
      return { success: true, path: filePath };
    } catch (error) {
      console.error('❌ Failed to save edited image:', error);
      throw error;
    }
  });

  console.log('✅ setupIpcHandlers() completed successfully');
} catch (error) {
  console.error('❌ setupIpcHandlers() failed:', error);
  throw error;
}
}
