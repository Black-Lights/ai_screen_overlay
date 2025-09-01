import axios from 'axios';

interface AIMessage {
  text: string;
  image?: string;
  apiKey: string;
}

export class AIService {
  async sendMessage(provider: string, message: AIMessage): Promise<string> {
    switch (provider.toLowerCase()) {
      case 'openai':
        return this.sendToOpenAI(message);
      case 'claude':
        return this.sendToClaude(message);
      case 'deepseek':
        return this.sendToDeepSeek(message);
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }

  private async sendToOpenAI(message: AIMessage): Promise<string> {
    try {
      const messages: any[] = [{
        role: 'user',
        content: message.image ? [
          { type: 'text', text: message.text },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/png;base64,${message.image}`,
              detail: 'high'
            }
          }
        ] : message.text
      }];

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: message.image ? 'gpt-4-vision-preview' : 'gpt-4',
          messages,
          max_tokens: 1000,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${message.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0]?.message?.content || 'No response from OpenAI';
    } catch (error: any) {
      console.error('OpenAI API Error:', error);
      if (error.response?.status === 401) {
        throw new Error('Invalid OpenAI API key');
      } else if (error.response?.status === 429) {
        throw new Error('OpenAI API rate limit exceeded');
      }
      throw new Error('Failed to communicate with OpenAI');
    }
  }

  private async sendToClaude(message: AIMessage): Promise<string> {
    try {
      const content: any[] = [{ type: 'text', text: message.text }];
      
      if (message.image) {
        content.unshift({
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/png',
            data: message.image
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
            'x-api-key': message.apiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          }
        }
      );

      return response.data.content[0]?.text || 'No response from Claude';
    } catch (error: any) {
      console.error('Claude API Error:', error);
      if (error.response?.status === 401) {
        throw new Error('Invalid Claude API key');
      } else if (error.response?.status === 429) {
        throw new Error('Claude API rate limit exceeded');
      }
      throw new Error('Failed to communicate with Claude');
    }
  }

  private async sendToDeepSeek(message: AIMessage): Promise<string> {
    try {
      // DeepSeek uses OpenAI-compatible API
      const messages: any[] = [{
        role: 'user',
        content: message.image ? [
          { type: 'text', text: message.text },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/png;base64,${message.image}`
            }
          }
        ] : message.text
      }];

      const response = await axios.post(
        'https://api.deepseek.com/v1/chat/completions',
        {
          model: message.image ? 'deepseek-vl-chat' : 'deepseek-chat',
          messages,
          max_tokens: 1000,
          temperature: 0.7,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${message.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0]?.message?.content || 'No response from DeepSeek';
    } catch (error: any) {
      console.error('DeepSeek API Error:', error);
      if (error.response?.status === 401) {
        throw new Error('Invalid DeepSeek API key');
      } else if (error.response?.status === 429) {
        throw new Error('DeepSeek API rate limit exceeded');
      }
      throw new Error('Failed to communicate with DeepSeek');
    }
  }
}

// Export a default instance
export default new AIService();
