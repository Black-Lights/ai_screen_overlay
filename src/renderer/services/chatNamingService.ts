import { Message, AppSettings } from '@/shared/types';

/**
 * Generate a concise and descriptive title for a chat based on its initial messages
 */
export const generateChatTitle = async (messages: Message[], settings: AppSettings): Promise<string> => {
  // Only use the first few messages to generate a title
  const relevantMessages = messages.slice(0, 3);
  
  if (relevantMessages.length === 0) {
    return 'New Chat';
  }

  // Extract user messages for context
  const userMessages = relevantMessages.filter(msg => msg.role === 'user');
  
  if (userMessages.length === 0) {
    return 'New Chat';
  }

  // Get the first user message as the main context
  const firstUserMessage = userMessages[0].content;
  
  // Create a prompt to generate a short, descriptive title
  const titlePrompt = `Generate a concise, descriptive title (4-8 words max) for a chat that starts with this message: "${firstUserMessage.slice(0, 200)}${firstUserMessage.length > 200 ? '...' : ''}"

The title should:
- Be clear and specific
- Capture the main topic or question
- Be suitable as a chat title in a conversation list
- Not include quotes or special characters
- Be under 50 characters

Respond with ONLY the title, nothing else.`;

  try {
    // Get API key for the selected provider
    let apiKey = '';
    switch (settings.selectedProvider) {
      case 'openai':
        apiKey = settings.openaiApiKey;
        break;
      case 'claude':
        apiKey = settings.claudeApiKey;
        break;
      case 'deepseek':
        apiKey = settings.deepseekApiKey;
        break;
      default:
        throw new Error('No valid provider selected');
    }

    if (!apiKey) {
      throw new Error('No API key available for selected provider');
    }

    // Use a simple model for title generation
    const selectedModel = settings.selectedModels?.[settings.selectedProvider];
    
    // Use the sendAIMessage API to generate a title
    const response = await window.electronAPI.sendAIMessage({
      text: titlePrompt,
      provider: settings.selectedProvider,
      apiKey,
      modelId: selectedModel
    });
    
    // Clean up the response and ensure it's reasonable
    let title = response.content.trim();
    
    // Remove quotes if present
    title = title.replace(/^["']|["']$/g, '');
    
    // Limit length and clean up
    if (title.length > 50) {
      title = title.slice(0, 47) + '...';
    }
    
    // Fallback if the response is empty or too short
    if (!title || title.length < 3) {
      return generateFallbackTitle(firstUserMessage);
    }
    
    return title;
    
  } catch (error) {
    console.error('Failed to generate AI title:', error);
    return generateFallbackTitle(firstUserMessage);
  }
};

/**
 * Generate a fallback title based on the first user message
 */
const generateFallbackTitle = (firstMessage: string): string => {
  // Extract keywords from the first message
  const words = firstMessage
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2)
    .slice(0, 4);
  
  if (words.length === 0) {
    return 'New Chat';
  }
  
  // Create a title from keywords
  const title = words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return title.length > 50 ? title.slice(0, 47) + '...' : title;
};

/**
 * Check if a chat should be auto-named (has messages but still has default title)
 */
export const shouldAutoName = (chat: { title: string }, messages: Message[]): boolean => {
  const defaultTitlePattern = /^(Chat \d+|New Chat|Screen Capture Chat \d+)$/;
  return defaultTitlePattern.test(chat.title) && messages.length >= 2; // At least user message + AI response
};
