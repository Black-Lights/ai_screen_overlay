import React, { useState, useEffect } from 'react';
import { AppSettings } from '@/shared/types';

interface TokenOptimizationSettingsProps {
  settings: AppSettings;
  onSettingsChange: (settings: Partial<AppSettings>) => void;
  currentChatId?: number; // Add current chat ID
}

const TokenOptimizationSettings: React.FC<TokenOptimizationSettingsProps> = ({
  settings,
  onSettingsChange,
  currentChatId,
}) => {
  const [tokenStats, setTokenStats] = useState<{
    totalTokens: number;
    messageCount: number;
    estimatedCost: number;
  } | null>(null);

  const [optimizationPreview, setOptimizationPreview] = useState<any>(null);

  // Helper to get current optimization settings with defaults
    const getOptimizationSettings = (): NonNullable<AppSettings['tokenOptimization']> => {
    return settings.tokenOptimization || {
      strategy: 'rolling-with-summary' as const,
      rollingWindowSize: 15,
      summaryThreshold: 5000,
      showTokenCounter: true,
      showCostEstimator: false,
      autoSuggestOptimization: true
    };
  };

  const currentOptimization = getOptimizationSettings();

  const handleStrategyChange = (strategy: string) => {
    onSettingsChange({
      tokenOptimization: {
        ...currentOptimization,
        strategy: strategy as any
      }
    });
  };

  const handleRollingWindowSizeChange = (size: number) => {
    onSettingsChange({
      tokenOptimization: {
        ...currentOptimization,
        rollingWindowSize: size
      }
    });
  };

  const handleSummaryThresholdChange = (threshold: number) => {
    onSettingsChange({
      tokenOptimization: {
        ...currentOptimization,
        summaryThreshold: threshold
      }
    });
  };

  const handleToggle = (key: keyof NonNullable<typeof settings.tokenOptimization>) => {
    onSettingsChange({
      tokenOptimization: {
        ...currentOptimization,
        [key]: !currentOptimization[key]
      }
    });
  };

  const loadOptimizationPreview = async () => {
    if (!currentChatId) {
      setOptimizationPreview(null);
      return;
    }
    
    try {
      const result = await window.electronAPI.getOptimizationPreview(currentChatId);
      setOptimizationPreview(result);
    } catch (error) {
      console.error('Failed to load optimization preview:', error);
      setOptimizationPreview(null);
    }
  };

  useEffect(() => {
    loadOptimizationPreview();
  }, [currentOptimization.strategy, currentOptimization.rollingWindowSize, currentOptimization.summaryThreshold, currentChatId]);

  return (
    <div className="space-y-6">
      <div className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Token Optimization
        </h3>
        
        <div className="space-y-4">
          {/* Strategy Selection */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Optimization Strategy
            </label>
            <select
              value={currentOptimization.strategy}
              onChange={(e) => handleStrategyChange(e.target.value)}
              className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="full-history">Full History (No Optimization)</option>
              <option value="rolling-window">Rolling Window</option>
              <option value="smart-summary">Smart Summary</option>
              <option value="rolling-with-summary">Rolling Window + Summary (Recommended)</option>
            </select>
            <p className="text-xs text-white/60 mt-1">
              {currentOptimization.strategy === 'full-history' && 
                'Sends complete chat history with every message. Uses most tokens but preserves full context.'}
              {currentOptimization.strategy === 'rolling-window' && 
                'Keeps only the last N messages. Fast and simple, but loses older context.'}
              {currentOptimization.strategy === 'smart-summary' && 
                'Automatically summarizes old messages when token limit is reached. Preserves context efficiently.'}
              {currentOptimization.strategy === 'rolling-with-summary' && 
                'Uses rolling window first, then summarizes if still over limit. Best balance of speed and context preservation.'}
            </p>
          </div>

          {/* Rolling Window Size */}
          {(currentOptimization.strategy === 'rolling-window' || 
            currentOptimization.strategy === 'rolling-with-summary') && (
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Rolling Window Size: {currentOptimization.rollingWindowSize} messages
              </label>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={currentOptimization.rollingWindowSize}
                onChange={(e) => handleRollingWindowSizeChange(parseInt(e.target.value))}
                className="w-full h-2 bg-black/30 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-white/60 mt-1">
                <span>5 messages</span>
                <span>25 messages</span>
                <span>50 messages</span>
              </div>
            </div>
          )}

          {/* Summary Threshold */}
          {(currentOptimization.strategy === 'smart-summary' || 
            currentOptimization.strategy === 'rolling-with-summary') && (
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Summary Threshold: {currentOptimization.summaryThreshold.toLocaleString()} tokens
              </label>
              <input
                type="range"
                min="1000"
                max="15000"
                step="1000"
                value={currentOptimization.summaryThreshold}
                onChange={(e) => handleSummaryThresholdChange(parseInt(e.target.value))}
                className="w-full h-2 bg-black/30 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-white/60 mt-1">
                <span>1K</span>
                <span>8K</span>
                <span>15K</span>
              </div>
            </div>
          )}

          {/* UI Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-white/80">
                Show Token Counter in Chat
              </label>
              <button
                onClick={() => handleToggle('showTokenCounter')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  currentOptimization.showTokenCounter ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    currentOptimization.showTokenCounter ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-white/80">
                Show Cost Estimator
              </label>
              <button
                onClick={() => handleToggle('showCostEstimator')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  currentOptimization.showCostEstimator ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    currentOptimization.showCostEstimator ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-white/80">
                Auto-suggest Optimization
              </label>
              <button
                onClick={() => handleToggle('autoSuggestOptimization')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  currentOptimization.autoSuggestOptimization ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    currentOptimization.autoSuggestOptimization ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Optimization Preview */}
      {optimizationPreview && currentOptimization.strategy !== 'full-history' && (
        <div className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg p-6">
          <h4 className="text-md font-semibold text-white mb-3">Optimization Preview</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between text-white/80">
                <span>Original Tokens:</span>
                <span className="text-red-400">{optimizationPreview.originalTokens?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-white/80">
                <span>Optimized Tokens:</span>
                <span className="text-green-400">{optimizationPreview.optimizedTokens?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-white/80 font-medium">
                <span>Tokens Saved:</span>
                <span className="text-green-400">
                  {optimizationPreview.savedTokens?.toLocaleString()} 
                  ({Math.round((optimizationPreview.savedTokens / optimizationPreview.originalTokens) * 100)}%)
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-white/80">
                <span>Original Cost:</span>
                <span className="text-red-400">${optimizationPreview.originalCost?.toFixed(4)}</span>
              </div>
              <div className="flex justify-between text-white/80">
                <span>Optimized Cost:</span>
                <span className="text-green-400">${optimizationPreview.optimizedCost?.toFixed(4)}</span>
              </div>
              <div className="flex justify-between text-white/80 font-medium">
                <span>Cost Saved:</span>
                <span className="text-green-400">${optimizationPreview.savedCost?.toFixed(4)}</span>
              </div>
            </div>
          </div>

          {optimizationPreview.checkpoint && (
            <div className="mt-4 p-3 bg-blue-500/20 border border-blue-400/30 rounded-md">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-blue-300 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                </svg>
                <p className="text-xs text-blue-300">
                  This strategy will create summary checkpoints to preserve context while reducing tokens.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {currentOptimization.strategy === 'full-history' && (
        <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            <div>
              <p className="text-sm text-yellow-300 font-medium">Token Usage Warning</p>
              <p className="text-xs text-yellow-200 mt-1">
                Full history mode can lead to very high token usage and costs as your conversation grows. 
                Consider enabling optimization for better efficiency.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cost Estimation Disclaimer */}
      <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
          </svg>
          <div>
            <p className="text-sm text-blue-300 font-medium">Cost Estimation Disclaimer</p>
            <p className="text-xs text-blue-200 mt-1">
              • Pricing rates are as of September 3, 2025 and may change over time
            </p>
            <p className="text-xs text-blue-200">
              • Actual costs may differ from our estimates due to provider billing differences
            </p>
            <p className="text-xs text-blue-200">
              • These estimates are for reference only - always verify with official provider pricing
            </p>
            <p className="text-xs text-blue-200">
              • Rates can be easily updated by developers in the pricing configuration
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenOptimizationSettings;
