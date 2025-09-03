/**
 * Token estimation and optimization utilities
 * This provides rough token estimation without requiring external libraries
 * 
 * PRICING DISCLAIMER:
 * - All pricing rates are as of September 3, 2025
 * - Actual rates may vary and change over time
 * - There may be differences between our calculated costs and actual provider billing
 * - This is for estimation purposes only - always verify with provider's official pricing
 * - Rates can be easily updated in the PRICING_CONFIG below
 */

import { Message } from './types';

// ========================================
// CONFIGURABLE PRICING (Updated: Sept 3, 2025)
// ========================================
// To update pricing: modify the values below
// All prices are per 1K tokens unless otherwise specified
export const PRICING_CONFIG = {
  lastUpdated: '2025-09-03',
  disclaimer: 'Rates are estimates and may differ from actual provider billing',
  
  openai: {
    // Standard Models
    'gpt-4o': { input: 0.0025, output: 0.01 },
    'gpt-4o-2024-08-06': { input: 0.0025, output: 0.01 },
    'gpt-4o-2024-05-13': { input: 0.005, output: 0.015 },
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
    'gpt-4o-mini-2024-07-18': { input: 0.00015, output: 0.0006 },
    'o1-preview': { input: 0.015, output: 0.06 },
    'o1-preview-2024-09-12': { input: 0.015, output: 0.06 },
    'o1-mini': { input: 0.003, output: 0.012 },
    'o1-mini-2024-09-12': { input: 0.003, output: 0.012 },
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-4-turbo-2024-04-09': { input: 0.01, output: 0.03 },
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-4-32k': { input: 0.06, output: 0.12 },
    'gpt-4-0125-preview': { input: 0.01, output: 0.03 },
    'gpt-4-1106-preview': { input: 0.01, output: 0.03 },
    'gpt-4-vision-preview': { input: 0.01, output: 0.03 },
    'gpt-3.5-turbo-0125': { input: 0.0005, output: 0.0015 },
    'gpt-3.5-turbo-instruct': { input: 0.0015, output: 0.002 },
    'gpt-3.5-turbo-1106': { input: 0.001, output: 0.002 },
    'gpt-3.5-turbo-16k': { input: 0.003, output: 0.004 },
    
    // Batch Processing (50% discount)
    batch: {
      'gpt-4o': { input: 0.00125, output: 0.005 },
      'gpt-4o-mini': { input: 0.000075, output: 0.0003 },
      'gpt-4-turbo': { input: 0.005, output: 0.015 },
      'gpt-3.5-turbo': { input: 0.00025, output: 0.00075 }
    },
    
    // Flex Tier (varied rates)
    flex: {
      'gpt-4o': { input: 0.005, output: 0.02 },
      'gpt-4o-mini': { input: 0.0003, output: 0.0012 }
    },
    
    // Priority Tier (higher rates for guaranteed capacity)
    priority: {
      'gpt-4o': { input: 0.0075, output: 0.03 },
      'gpt-4o-mini': { input: 0.00045, output: 0.0018 }
    }
  },
  
  claude: {
    'claude-3-5-sonnet-20241022': { input: 0.003, output: 0.015 },
    'claude-3-5-sonnet-20240620': { input: 0.003, output: 0.015 },
    'claude-3-5-haiku-20241022': { input: 0.001, output: 0.005 },
    'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
    'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
    'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 }
  },
  
  deepseek: {
    'deepseek-chat': { input: 0.00014, output: 0.00028 },
    'deepseek-coder': { input: 0.00014, output: 0.00028 }
  }
};

// Helper function to get pricing with fallback
export function getModelPricing(provider: string, model: string, tier?: string) {
  const providerPricing = PRICING_CONFIG[provider.toLowerCase() as keyof typeof PRICING_CONFIG];
  
  if (!providerPricing || typeof providerPricing === 'string') {
    // Default fallback pricing
    return { input: 0.001, output: 0.002 };
  }
  
  // Check tier-specific pricing for OpenAI
  if (provider.toLowerCase() === 'openai' && tier && tier !== 'standard') {
    const tierPricing = (providerPricing as any)[tier];
    if (tierPricing && tierPricing[model]) {
      return tierPricing[model];
    }
  }
  
  // Standard model pricing
  return (providerPricing as any)[model] || { input: 0.001, output: 0.002 };
}

// Rough token estimation (1 token ≈ 4 characters for English text)
// This is an approximation - actual token count varies by model and content
export function estimateTokens(text: string): number {
  if (!text) return 0;
  
  // Basic estimation: ~4 characters per token
  // Add extra tokens for formatting, markdown, etc.
  const baseTokens = Math.ceil(text.length / 4);
  
  // Add tokens for markdown formatting
  const markdownTokens = (text.match(/```|`|\*\*|\*|#|---|>\s/g) || []).length * 2;
  
  // Add tokens for special characters and punctuation
  const specialTokens = (text.match(/[{}()[\]<>@#$%^&*+=|\\:;"',?!]/g) || []).length * 0.5;
  
  return Math.ceil(baseTokens + markdownTokens + specialTokens);
}

// Estimate tokens for a complete message including role and metadata
export function estimateMessageTokens(message: Message): number {
  let total = 0;
  
  // Role tokens (system prompt equivalent)
  total += 10; // Base overhead per message
  
  // Content tokens
  total += estimateTokens(message.content);
  
  // Image tokens (if present) - rough estimate
  if (message.imagePath) {
    total += 85; // Base image token cost (varies by model)
  }
  
  return total;
}

// Estimate total tokens for message array
export function estimateChatTokens(messages: Message[]): number {
  return messages.reduce((total, message) => total + estimateMessageTokens(message), 0);
}

// Token optimization strategies
export interface OptimizationResult {
  messages: Message[];
  originalTokens: number;
  optimizedTokens: number;
  savedTokens: number;
  strategy: string;
  checkpoint?: Message; // Summary message if created
}

// Rolling window optimization
export function applyRollingWindow(messages: Message[], windowSize: number): OptimizationResult {
  const originalTokens = estimateChatTokens(messages);
  
  if (messages.length <= windowSize) {
    return {
      messages,
      originalTokens,
      optimizedTokens: originalTokens,
      savedTokens: 0,
      strategy: 'rolling-window'
    };
  }
  
  const optimizedMessages = messages.slice(-windowSize);
  const optimizedTokens = estimateChatTokens(optimizedMessages);
  
  return {
    messages: optimizedMessages,
    originalTokens,
    optimizedTokens,
    savedTokens: originalTokens - optimizedTokens,
    strategy: 'rolling-window'
  };
}

// Smart summary optimization
export function applySmartSummary(messages: Message[], threshold: number): OptimizationResult {
  const originalTokens = estimateChatTokens(messages);
  
  if (originalTokens <= threshold) {
    return {
      messages,
      originalTokens,
      optimizedTokens: originalTokens,
      savedTokens: 0,
      strategy: 'smart-summary'
    };
  }
  
  // Keep recent messages (30% or minimum 5 messages)
  const keepCount = Math.max(5, Math.floor(messages.length * 0.3));
  const recentMessages = messages.slice(-keepCount);
  const messagesToSummarize = messages.slice(0, -keepCount);
  
  if (messagesToSummarize.length === 0) {
    return {
      messages,
      originalTokens,
      optimizedTokens: originalTokens,
      savedTokens: 0,
      strategy: 'smart-summary'
    };
  }
  
  // Create summary message
  const summaryContent = createMessageSummary(messagesToSummarize);
  const summaryMessage: Message = {
    id: Date.now(), // Temporary ID
    chatId: messages[0]?.chatId || 0,
    role: 'assistant',
    content: `**Chat Summary** (${messagesToSummarize.length} messages)\n\n${summaryContent}`,
    timestamp: new Date().toISOString(),
    provider: 'system',
    model: 'summary'
  };
  
  const optimizedMessages = [summaryMessage, ...recentMessages];
  const optimizedTokens = estimateChatTokens(optimizedMessages);
  
  return {
    messages: optimizedMessages,
    originalTokens,
    optimizedTokens,
    savedTokens: originalTokens - optimizedTokens,
    strategy: 'smart-summary',
    checkpoint: summaryMessage
  };
}

// Rolling window with summary (hybrid approach)
export function applyRollingWithSummary(
  messages: Message[], 
  windowSize: number, 
  summaryThreshold: number
): OptimizationResult {
  const originalTokens = estimateChatTokens(messages);
  
  // First apply rolling window
  const rollingResult = applyRollingWindow(messages, windowSize);
  
  // If still over threshold, apply summary to the windowed messages
  if (rollingResult.optimizedTokens > summaryThreshold) {
    return applySmartSummary(rollingResult.messages, summaryThreshold);
  }
  
  return {
    ...rollingResult,
    strategy: 'rolling-with-summary'
  };
}

// Create a concise summary of messages
function createMessageSummary(messages: Message[]): string {
  const userMessages = messages.filter(m => m.role === 'user');
  const assistantMessages = messages.filter(m => m.role === 'assistant');
  
  const topics: string[] = [];
  const decisions: string[] = [];
  const questions: string[] = [];
  
  // Analyze user messages for topics and questions
  userMessages.forEach(msg => {
    const content = msg.content.toLowerCase();
    
    // Extract questions
    if (content.includes('?') || content.match(/^(how|what|why|when|where|can|could|would|should)/)) {
      questions.push(msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : ''));
    }
    
    // Extract key topics (simple keyword extraction)
    const keywords = extractKeywords(msg.content);
    topics.push(...keywords);
  });
  
  // Analyze assistant messages for solutions/decisions
  assistantMessages.forEach(msg => {
    const content = msg.content.toLowerCase();
    
    if (content.includes('solution') || content.includes('recommend') || 
        content.includes('suggest') || content.includes('should')) {
      const sentences = msg.content.split(/[.!?]+/);
      const keySentences = sentences
        .filter(s => s.toLowerCase().match(/(solution|recommend|suggest|should|try|use|install|run|execute)/))
        .slice(0, 2);
      decisions.push(...keySentences.map(s => s.trim()));
    }
  });
  
  // Build summary
  let summary = '';
  
  if (topics.length > 0) {
    const uniqueTopics = [...new Set(topics)].slice(0, 5);
    summary += `**Topics discussed:** ${uniqueTopics.join(', ')}\n\n`;
  }
  
  if (questions.length > 0) {
    summary += `**Key questions:**\n${questions.slice(0, 3).map(q => `• ${q}`).join('\n')}\n\n`;
  }
  
  if (decisions.length > 0) {
    summary += `**Solutions/Recommendations:**\n${decisions.slice(0, 3).map(d => `• ${d}`).join('\n')}\n\n`;
  }
  
  summary += `*This summary covers ${messages.length} messages from the conversation history.*`;
  
  return summary || 'General discussion and problem-solving conversation.';
}

// Simple keyword extraction
function extractKeywords(text: string): string[] {
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 
    'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 
    'below', 'between', 'among', 'around', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may',
    'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it',
    'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their'
  ]);
  
  return text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word))
    .slice(0, 10);
}

// Cost estimation with configurable pricing
export function estimateCost(tokens: number, provider: string, model: string, tokenType: 'input' | 'output' = 'input', tier?: string): number {
  if (tokens <= 0) return 0;
  
  // Get pricing from the configurable structure
  const pricing = getModelPricing(provider, model, tier);
  const rate = pricing[tokenType];
  
  // Convert tokens to cost (pricing is per 1K tokens)
  const cost = (tokens / 1000) * rate;
  
  return parseFloat(cost.toFixed(6)); // Round to 6 decimal places for precision
}

// Detect pricing tier (stub for now - can be enhanced later)
function detectPricingTier(): string {
  // Default to standard tier for now
  // In the future, this could check user settings or API tier
  return 'standard';
}

// Enhanced cost estimation for chat conversations with mixed models
export function estimateAccurateChatCost(messages: Message[], fallbackProvider: string = 'openai', fallbackModel: string = 'gpt-4o'): { 
  inputCost: number; 
  estimatedOutputCost: number; 
  totalCost: number; 
  breakdown: Array<{
    messageId: number;
    provider: string;
    model: string;
    tokens: number;
    cost: number;
    role: 'user' | 'assistant';
  }>;
} {
  let totalInputCost = 0;
  let totalOutputCost = 0;
  const breakdown: Array<{
    messageId: number;
    provider: string;
    model: string;
    tokens: number;
    cost: number;
    role: 'user' | 'assistant';
  }> = [];

  for (const message of messages) {
    // Use message's actual provider/model, or fall back to defaults
    const provider = message.provider?.toLowerCase() || fallbackProvider;
    const model = message.model || fallbackModel;
    const tokens = estimateMessageTokens(message);
    
    // Determine if this is input or output based on role
    const isOutput = message.role === 'assistant';
    const cost = estimateCost(tokens, provider, model, isOutput ? 'output' : 'input');
    
    if (isOutput) {
      totalOutputCost += cost;
    } else {
      totalInputCost += cost;
    }
    
    breakdown.push({
      messageId: message.id,
      provider: provider,
      model: model,
      tokens: tokens,
      cost: cost,
      role: message.role
    });
  }
  
  return {
    inputCost: totalInputCost,
    estimatedOutputCost: totalOutputCost,
    totalCost: totalInputCost + totalOutputCost,
    breakdown
  };
}

// Enhanced cost estimation for chat conversations (input + estimated output)
export function estimateChatCost(messages: Message[], provider: string, model: string): { inputCost: number; estimatedOutputCost: number; totalCost: number } {
  const inputTokens = estimateChatTokens(messages);
  
  // Estimate output tokens as 20% of input (conservative estimate)
  const estimatedOutputTokens = Math.ceil(inputTokens * 0.2);
  
  const inputCost = estimateCost(inputTokens, provider, model, 'input');
  const estimatedOutputCost = estimateCost(estimatedOutputTokens, provider, model, 'output');
  
  return {
    inputCost,
    estimatedOutputCost,
    totalCost: inputCost + estimatedOutputCost
  };
}
