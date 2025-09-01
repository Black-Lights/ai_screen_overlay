import React from 'react';
import { AppSettings } from '@/shared/types';

interface LLMSelectorProps {
  selectedProvider: string;
  settings: AppSettings;
  onProviderChange: (provider: string) => void;
  onSettingsChange: (settings: Partial<AppSettings>) => void;
}

const LLMSelector: React.FC<LLMSelectorProps> = ({
  selectedProvider,
  settings,
  onProviderChange,
  onSettingsChange,
}) => {
  const providers = [
    { id: 'openai', name: 'OpenAI GPT-4V', color: 'text-green-400' },
    { id: 'claude', name: 'Claude 3.5 Sonnet', color: 'text-orange-400' },
    { id: 'deepseek', name: 'DeepSeek', color: 'text-purple-400' },
  ];

  const getProviderStatus = (providerId: string) => {
    switch (providerId) {
      case 'openai':
        return !!settings.openaiApiKey;
      case 'claude':
        return !!settings.claudeApiKey;
      case 'deepseek':
        return !!settings.deepseekApiKey;
      default:
        return false;
    }
  };

  const handleProviderSelect = (providerId: string) => {
    if (getProviderStatus(providerId)) {
      onProviderChange(providerId);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-white text-sm font-medium">AI Provider</label>
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${getProviderStatus(selectedProvider) ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span className="text-xs text-white/70">
            {getProviderStatus(selectedProvider) ? 'Connected' : 'No API Key'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {providers.map((provider) => {
          const isConfigured = getProviderStatus(provider.id);
          const isSelected = selectedProvider === provider.id;
          
          return (
            <button
              key={provider.id}
              onClick={() => handleProviderSelect(provider.id)}
              disabled={!isConfigured}
              className={`
                p-3 rounded-lg border transition-all duration-200 text-left
                ${isSelected && isConfigured
                  ? 'bg-white/20 border-blue-400 backdrop-blur-md'
                  : 'bg-white/10 border-white/20 hover:bg-white/15'
                }
                ${!isConfigured ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className={`font-medium ${provider.color}`}>
                    {provider.name}
                  </div>
                  <div className="text-xs text-white/60 mt-1">
                    {isConfigured ? 'Ready' : 'API key required'}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {isConfigured && (
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  )}
                  {isSelected && isConfigured && (
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {!getProviderStatus(selectedProvider) && (
        <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-yellow-400 text-sm font-medium">API Key Required</p>
              <p className="text-yellow-400/80 text-xs mt-1">
                Configure your {selectedProvider.toUpperCase()} API key in settings to use this provider.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick feature indicators */}
      <div className="flex items-center justify-center space-x-4 pt-2 border-t border-white/10">
        <div className="flex items-center space-x-1">
          <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          <span className="text-xs text-white/60">Vision</span>
        </div>
        <div className="flex items-center space-x-1">
          <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs text-white/60">Real-time</span>
        </div>
        <div className="flex items-center space-x-1">
          <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
          </svg>
          <span className="text-xs text-white/60">Analysis</span>
        </div>
      </div>
    </div>
  );
};

export default LLMSelector;
