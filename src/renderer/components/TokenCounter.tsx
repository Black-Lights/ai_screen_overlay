import React, { useState, useEffect } from 'react';
import { Chat, Message } from '@/shared/types';
import { estimateChatTokens, estimateCost } from '@/shared/token-optimizer';

interface TokenCounterProps {
  currentChat: Chat | null;
  messages: Message[]; // Add messages prop to track changes
  provider: string;
  model: string;
  showCost?: boolean;
  className?: string;
}

const TokenCounter: React.FC<TokenCounterProps> = ({
  currentChat,
  messages,
  provider,
  model,
  showCost = false,
  className = ''
}) => {
  const [tokenStats, setTokenStats] = useState<{
    totalTokens: number;
    messageCount: number;
    estimatedCost: number;
    costBreakdown?: {
      inputCost: number;
      estimatedOutputCost: number;
      totalCost: number;
    };
    modelBreakdown?: Array<{
      messageId: number;
      provider: string;
      model: string;
      tokens: number;
      cost: number;
      role: 'user' | 'assistant';
    }>;
  } | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentChat?.id) {
      loadTokenStats();
    }
  }, [currentChat?.id, messages.length]); // Add messages.length as dependency

  const loadTokenStats = async () => {
    if (!currentChat?.id) return;
    
    setIsLoading(true);
    try {
      const stats = await window.electronAPI.estimateChatTokens(currentChat.id);
      setTokenStats(stats);
    } catch (error) {
      console.error('Failed to load token stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentChat || isLoading) {
    return (
      <div className={`text-xs text-white/60 ${className}`}>
        {isLoading ? 'Loading...' : '0 tokens'}
      </div>
    );
  }

  if (!tokenStats) {
    return (
      <div className={`text-xs text-white/60 ${className}`}>
        0 tokens
      </div>
    );
  }

  const getTokenColor = (tokens: number): string => {
    if (tokens > 15000) return 'text-red-400';
    if (tokens > 8000) return 'text-yellow-400';
    if (tokens > 3000) return 'text-blue-400';
    return 'text-green-400';
  };

  const getTooltipContent = (): string => {
    if (!tokenStats) return '';
    
    let tooltip = `${tokenStats.messageCount} messages`;
    tooltip += `\n${tokenStats.totalTokens.toLocaleString()} total tokens in this chat`;
    tooltip += `\n\n📊 NEXT MESSAGE COST ESTIMATE:`;
    tooltip += `\nSending a message now will include ALL ${tokenStats.totalTokens.toLocaleString()} tokens as context`;
    
    if (tokenStats.costBreakdown) {
      tooltip += `\nInput cost (for context): $${tokenStats.costBreakdown.inputCost.toFixed(4)}`;
      tooltip += `\nEstimated output cost: $${tokenStats.costBreakdown.estimatedOutputCost.toFixed(4)}`;
      tooltip += `\nTotal estimated cost: $${tokenStats.costBreakdown.totalCost.toFixed(4)}`;
    }
    
    // Show model breakdown if there are multiple models used
    if (tokenStats.modelBreakdown) {
      const modelSummary = tokenStats.modelBreakdown.reduce((acc, item) => {
        const key = `${item.provider}/${item.model}`;
        if (!acc[key]) {
          acc[key] = { count: 0, cost: 0 };
        }
        acc[key].count++;
        acc[key].cost += item.cost;
        return acc;
      }, {} as Record<string, { count: number; cost: number }>);
      
      const modelCount = Object.keys(modelSummary).length;
      if (modelCount > 1) {
        tooltip += `\n\nModels used:`;
        Object.entries(modelSummary).forEach(([model, data]) => {
          tooltip += `\n• ${model}: ${data.count} msgs ($${data.cost.toFixed(4)})`;
        });
      }
    }
    
    return tooltip;
  };

    return (
    <div 
      className={`text-xs ${getTokenColor(tokenStats.totalTokens)} ${className}`} 
      title={getTooltipContent()}
    >
      <span className="flex items-center space-x-1">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span>{tokenStats.totalTokens.toLocaleString()} tokens</span>
        {tokenStats.modelBreakdown && Object.keys(tokenStats.modelBreakdown.reduce((acc, item) => {
          acc[`${item.provider}/${item.model}`] = true;
          return acc;
        }, {} as Record<string, boolean>)).length > 1 && (
          <span title="Multiple models used">
            <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.894A1 1 0 0018 16V3z" clipRule="evenodd"/>
            </svg>
          </span>
        )}
        {showCost && tokenStats.estimatedCost > 0 && (
          <span className="text-green-400 font-medium flex items-center" title="Estimated cost if you send a message now (includes all tokens as context)">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415.044 3.124 3.124 0 004.242 0 1 1 0 001.415-.044 5.124 5.124 0 01-6.072 0z" clipRule="evenodd"/>
            </svg>
            ~${tokenStats.estimatedCost.toFixed(4)}
          </span>
        )}
      </span>
    </div>
  );
};

export default TokenCounter;
