import React, { useState, useEffect } from 'react';
import { AppSettings } from '@/shared/types';

interface ApiStatus {
  openai: 'ready' | 'invalid' | 'error' | 'not-configured';
  claude: 'ready' | 'invalid' | 'error' | 'not-configured';
  deepseek: 'ready' | 'invalid' | 'error' | 'not-configured';
}

interface ApiKeyManagerProps {
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    openai: 'not-configured',
    claude: 'not-configured',
    deepseek: 'not-configured',
  });
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [showKeys, setShowKeys] = useState({
    openai: false,
    claude: false,
    deepseek: false,
  });

  const providers = [
    { id: 'openai', name: 'OpenAI', keyField: 'openaiApiKey' as keyof AppSettings },
    { id: 'claude', name: 'Claude', keyField: 'claudeApiKey' as keyof AppSettings },
    { id: 'deepseek', name: 'DeepSeek', keyField: 'deepseekApiKey' as keyof AppSettings },
  ];

  // Check API status on component mount and when settings change
  useEffect(() => {
    checkApiStatus();
  }, [settings.openaiApiKey, settings.claudeApiKey, settings.deepseekApiKey]);

  const checkApiStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const status = await window.electronAPI.getApiKeysStatus();
      setApiStatus(status);
    } catch (error) {
      console.error('Failed to check API status:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const getStatusColor = (providerId: string): string => {
    const status = apiStatus[providerId as keyof ApiStatus];
    switch (status) {
      case 'ready':
        return 'text-green-400';
      case 'invalid':
        return 'text-red-400';
      case 'error':
        return 'text-yellow-400';
      case 'not-configured':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusText = (providerId: string): string => {
    const status = apiStatus[providerId as keyof ApiStatus];
    switch (status) {
      case 'ready':
        return 'Ready';
      case 'invalid':
        return 'Invalid key';
      case 'error':
        return 'Server error';
      case 'not-configured':
        return 'Not configured';
      default:
        return 'Unknown';
    }
  };

  const getStatusIcon = (providerId: string): JSX.Element => {
    const status = apiStatus[providerId as keyof ApiStatus];
    const baseClass = "w-4 h-4";
    
    switch (status) {
      case 'ready':
        return (
          <svg className={`${baseClass} text-green-400`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'invalid':
        return (
          <svg className={`${baseClass} text-red-400`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className={`${baseClass} text-yellow-400`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className={`${baseClass} text-gray-400`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const handleApiKeyChange = async (provider: string, apiKey: string) => {
    // Update local settings
    const keyField = providers.find(p => p.id === provider)?.keyField;
    if (keyField) {
      onUpdateSettings({ [keyField]: apiKey });
    }

    // Save to .env file
    try {
      await window.electronAPI.saveApiKey(provider, apiKey);
    } catch (error) {
      console.error('Failed to save API key:', error);
    }
  };

  const toggleShowKey = (provider: string) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider as keyof typeof prev] }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white">API Keys</h3>
        <button
          onClick={checkApiStatus}
          disabled={isCheckingStatus}
          className="text-xs text-white/70 hover:text-white transition-colors px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 flex items-center space-x-2"
          title="Refresh all API statuses"
        >
          {isCheckingStatus ? (
            <>
              <div className="animate-spin w-3 h-3 border border-white/30 border-t-white rounded-full"></div>
              <span>Checking...</span>
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              <span>Refresh</span>
            </>
          )}
        </button>
      </div>

      {providers.map((provider) => {
        const currentKey = settings[provider.keyField] as string || '';
        const isVisible = showKeys[provider.id as keyof typeof showKeys];
        
        return (
          <div key={provider.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <h4 className="text-white font-medium">{provider.name} API Key</h4>
                {getStatusIcon(provider.id)}
                <span className={`text-sm ${getStatusColor(provider.id)}`}>
                  {getStatusText(provider.id)}
                </span>
              </div>
              
              <button
                onClick={() => toggleShowKey(provider.id)}
                className="text-white/60 hover:text-white transition-colors p-1"
                title={isVisible ? 'Hide API key' : 'Show API key'}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d={isVisible 
                    ? "M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                    : "M10 12a2 2 0 100-4 2 2 0 000 4z"
                  } clipRule="evenodd" />
                  {!isVisible && <path d="M10 3C5.522 3 1.732 5.943.458 10c1.274 4.057 5.064 7 9.542 7s8.268-2.943 9.542-7C18.268 5.943 14.478 3 10 3z" />}
                </svg>
              </button>
            </div>
            
            <div className="relative">
              <input
                type={isVisible ? 'text' : 'password'}
                className="glass-input w-full pr-10"
                value={currentKey}
                onChange={(e) => handleApiKeyChange(provider.id, e.target.value)}
                placeholder={`Enter your ${provider.name} API key`}
              />
            </div>
            
            {currentKey && apiStatus[provider.id as keyof ApiStatus] !== 'ready' && (
              <div className="mt-2 text-xs text-yellow-400">
                {apiStatus[provider.id as keyof ApiStatus] === 'invalid' && 'This API key appears to be invalid. Please check and try again.'}
                {apiStatus[provider.id as keyof ApiStatus] === 'error' && 'Unable to connect to the API server. Please check your connection.'}
                {apiStatus[provider.id as keyof ApiStatus] === 'not-configured' && 'Click refresh to test this API key.'}
              </div>
            )}
          </div>
        );
      })}
      
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="flex items-start space-x-2">
          <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-blue-400 text-sm font-medium">API Key Security</p>
            <p className="text-blue-400/80 text-xs mt-1">
              Your API keys are stored securely in the .env file and never sent anywhere except to their respective AI providers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyManager;
