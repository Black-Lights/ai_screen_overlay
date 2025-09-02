/// <reference path="../../types/global.d.ts" />
import React, { useState, useEffect, useRef } from 'react';
import ChatInterface from './ChatInterface';
import ChatHistory from './ChatHistory';
import LLMSelector from './LLMSelector';
import { Chat, Message, AppSettings } from '@/shared/types';
import { BackgroundDetectionService, BackgroundInfo } from '../services/backgroundDetection';

interface OverlayProps {
  currentChat: Chat | null;
  chats: Chat[];
  messages: Message[];
  settings: AppSettings;
  showMoveToNewChatOption: boolean;
  onCreateChat: (title?: string) => Promise<Chat>;
  onSwitchChat: (chat: Chat) => void;
  onDeleteChat: (chatId: number) => void;
  onUpdateChatTitle: (chatId: number, newTitle: string) => void;
  onMoveToNewChat: () => void;
  onSendMessage: (text: string, imagePath?: string) => void;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onImageRemoved: () => void;
}

const Overlay: React.FC<OverlayProps> = ({
  currentChat,
  chats,
  messages,
  settings,
  showMoveToNewChatOption,
  onCreateChat,
  onSwitchChat,
  onDeleteChat,
  onUpdateChatTitle,
  onMoveToNewChat,
  onSendMessage,
  onUpdateSettings,
  onImageRemoved,
}) => {
  const [position, setPosition] = useState(settings.overlayPosition);
  const [size, setSize] = useState(settings.overlaySize);
  const [showSettings, setShowSettings] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [showLLMSelector, setShowLLMSelector] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showZoomControls, setShowZoomControls] = useState(false);
  
  // Refs for click-outside detection
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const zoomControlsRef = useRef<HTMLDivElement>(null);
  
  const [apiStatus, setApiStatus] = useState<{
    openai: 'ready' | 'invalid' | 'error' | 'not-configured';
    claude: 'ready' | 'invalid' | 'error' | 'not-configured';
    deepseek: 'ready' | 'invalid' | 'error' | 'not-configured';
  }>({
    openai: 'not-configured',
    claude: 'not-configured',
    deepseek: 'not-configured',
  });
  const [isCheckingApiStatus, setIsCheckingApiStatus] = useState(false);
  const [backgroundInfo, setBackgroundInfo] = useState<BackgroundInfo | null>(null);
  const [currentThemeStyles, setCurrentThemeStyles] = useState<any>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Initialize background detection service
  const backgroundDetection = new BackgroundDetectionService();

  useEffect(() => {
    setPosition(settings.overlayPosition);
    setSize(settings.overlaySize);
    
    // Ensure the overlay matches the current window size initially
    if (overlayRef.current) {
      const rect = overlayRef.current.getBoundingClientRect();
      setSize({ width: rect.width || 500, height: rect.height || 700 });
    }
  }, [settings.overlayPosition, settings.overlaySize]);

  // Cancel drag operations when settings panel opens
  useEffect(() => {
    if (showSettings) {
      // No dragging to cancel since we removed title bar
    }
  }, [showSettings]);

  // Background detection and theme application
  useEffect(() => {
    const updateTheme = async () => {
      if (settings.adaptiveOpacity) {
        const bgInfo = await backgroundDetection.detectBackground();
        setBackgroundInfo(bgInfo);
      }
      
      const theme = settings.theme || 'glassmorphism';
      const themeStyles = backgroundDetection.getThemeStyles(theme, backgroundInfo || undefined);
      setCurrentThemeStyles(themeStyles);
    };

    updateTheme();
  }, [settings.theme, settings.adaptiveOpacity, backgroundInfo?.brightness]);

  // Check API status only initially (not when settings change)
  useEffect(() => {
    checkApiStatus();
  }, []);

  // Remove automatic API status checking when settings change
  // Users can manually refresh API status if needed

  // Click-outside detection for chat history and zoom controls
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Check if click is outside chat history
      if (showChatHistory && chatHistoryRef.current && !chatHistoryRef.current.contains(target)) {
        // Don't close if clicking on the chat history button in the LLM provider bar
        const isHistoryButton = (event.target as HTMLElement)?.closest('[title="Chat History"]');
        if (!isHistoryButton) {
          setShowChatHistory(false);
        }
      }
      
      // Check if click is outside zoom controls
      if (showZoomControls && zoomControlsRef.current && !zoomControlsRef.current.contains(target)) {
        // Don't close if clicking on the zoom button in the LLM provider bar
        const isZoomButton = (event.target as HTMLElement)?.closest('[title="Zoom Controls"]');
        if (!isZoomButton) {
          setShowZoomControls(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showChatHistory, showZoomControls]);

  const checkApiStatus = async () => {
    setIsCheckingApiStatus(true);
    try {
      const status = await window.electronAPI.getApiKeysStatus();
      setApiStatus(status);
    } catch (error) {
      console.error('Failed to check API status:', error);
    } finally {
      setIsCheckingApiStatus(false);
    }
  };

  const handleApiKeyChange = async (provider: string, value: string) => {
    const keyField = `${provider}ApiKey` as keyof AppSettings;
    onUpdateSettings({ [keyField]: value });
    
    // Save to .env file
    try {
      await window.electronAPI.saveApiKey(provider, value);
    } catch (error) {
      console.error('Failed to save API key:', error);
    }
  };

  const getStatusColor = (provider: string): string => {
    const status = apiStatus[provider as keyof typeof apiStatus];
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

  const getStatusText = (provider: string): string => {
    const status = apiStatus[provider as keyof typeof apiStatus];
    switch (status) {
      case 'ready':
        return 'Ready';
      case 'invalid':
        return 'Invalid';
      case 'error':
        return 'Error';
      case 'not-configured':
        return 'Not configured';
      default:
        return 'Unknown';
    }
  };

  const handleCreateChat = async (title?: string) => {
    const newChat = await onCreateChat(title);
    setShowChatHistory(false); // Auto-close chat history
    return newChat;
  };

  const handleSwitchChat = (chat: Chat) => {
    onSwitchChat(chat);
    setShowChatHistory(false); // Auto-close chat history
  };

  const handleSettingsChange = (newSettings: Partial<AppSettings>) => {
    onUpdateSettings(newSettings);
  };

  const handleMinimize = async () => {
    await window.electronAPI.minimizeWindow();
  };

  const handleClose = async () => {
    await window.electronAPI.closeWindow();
  };

  return (
    <div
      ref={overlayRef}
      className={`glass-panel animate-fade-in select-none flex flex-col overflow-hidden h-full w-full theme-${settings.theme || 'glassmorphism'}`}
      style={{
        background: currentThemeStyles?.background || 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
        backdropFilter: currentThemeStyles?.backdropFilter || 'blur(20px)',
        border: currentThemeStyles?.border || '1px solid rgba(255, 255, 255, 0.1)',
        color: currentThemeStyles?.textColor || 'white',
      }}
    >
      {/* Content Area */}
      <div className="overlay-content flex-1 min-h-0">
        {/* LLM Selector - Collapsible */}
        <div className="overlay-section border-b border-white/10">
          {!showLLMSelector ? (
            // Collapsed view - show provider name with chat/settings buttons
            <div className="p-3 bg-black/20 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div 
                  className="flex items-center space-x-2 cursor-pointer flex-1"
                  onClick={() => setShowLLMSelector(true)}
                >
                  <span className="text-sm font-medium text-white/90">
                    LLM Provider
                  </span>
                  <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded">
                    {settings.selectedProvider === 'openai' ? 'OpenAI' : 
                     settings.selectedProvider === 'claude' ? 'Anthropic' : 'DeepSeek'}
                  </span>
                  <div className="text-white/40 hover:text-white/60 transition-colors p-1">
                    <svg className="w-4 h-4 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* New Chat Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateChat();
                    }}
                    className="p-1.5 rounded hover:bg-white/20 transition-colors text-white/60 hover:text-white"
                    title="New Chat"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {/* Zoom Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowZoomControls(!showZoomControls);
                    }}
                    className={`p-1.5 rounded hover:bg-white/20 transition-colors ${showZoomControls ? 'text-white bg-white/10' : 'text-white/60 hover:text-white'}`}
                    title="Zoom Controls"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {/* Chat History Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowChatHistory(!showChatHistory);
                    }}
                    className="p-1.5 rounded hover:bg-white/20 transition-colors text-white/60 hover:text-white"
                    title="Chat History"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {/* Settings Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSettings(!showSettings);
                    }}
                    className="p-1.5 rounded hover:bg-white/20 transition-colors text-white/60 hover:text-white"
                    title="Settings"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Expanded view - full LLM selector with close button
            <div className="bg-black/20 backdrop-blur-sm">
              <div className="p-3 border-b border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-white/90">LLM Provider</span>
                  <button 
                    className="text-white/40 hover:text-white/60 transition-colors bg-white/10 backdrop-blur-sm p-1 rounded"
                    onClick={() => setShowLLMSelector(false)}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              <LLMSelector
                selectedProvider={settings.selectedProvider}
                settings={settings}
                apiStatus={apiStatus}
                isCheckingStatus={isCheckingApiStatus}
                onProviderChange={(provider) => {
                  onUpdateSettings({ selectedProvider: provider });
                  // Don't auto-collapse, let user select model first
                }}
                onSettingsChange={handleSettingsChange}
                onModelChange={(model) => {
                  // Auto-collapse after model selection
                  setShowLLMSelector(false);
                }}
                onRefreshStatus={checkApiStatus}
              />
            </div>
          )}
        </div>

        {/* Chat Interface */}
        <div className="overlay-main flex-1 min-h-0">
          <ChatInterface
            currentChat={currentChat}
            messages={messages}
            showMoveToNewChatOption={showMoveToNewChatOption}
            onSendMessage={onSendMessage}
            onMoveToNewChat={onMoveToNewChat}
            provider={settings.selectedProvider}
            showZoomControls={showZoomControls}
            zoomControlsRef={zoomControlsRef}
            onImageRemoved={onImageRemoved}
          />
        </div>

        {/* Chat History Sidebar */}
        {showChatHistory && (
          <div 
            ref={chatHistoryRef}
            className="absolute right-0 top-0 h-full glass-panel animate-slide-up z-50"
            style={{ width: Math.min(320, size.width * 0.8) }}
          >
            <ChatHistory
              chats={chats}
              currentChat={currentChat}
              onCreateChat={handleCreateChat}
              onSwitchChat={handleSwitchChat}
              onDeleteChat={onDeleteChat}
              onUpdateChatTitle={onUpdateChatTitle}
              onClose={() => setShowChatHistory(false)}
            />
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div className="absolute inset-0 glass-panel animate-fade-in z-40">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white" style={{textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)'}}>Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-medium text-white" style={{textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)'}}>API Keys</h3>
                    <button
                      onClick={() => setShowHelpModal(true)}
                      className="text-white/60 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                      title="Help with API setup"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
                      </svg>
                    </button>
                  </div>
                  <button
                    onClick={checkApiStatus}
                    disabled={isCheckingApiStatus}
                    className="text-xs text-white/70 hover:text-white transition-colors px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isCheckingApiStatus ? 'Checking...' : 'Test Keys'}
                  </button>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-white text-sm font-medium" style={{textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)'}}>
                      OpenAI API Key
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full bg-current ${getStatusColor('openai')}`}></div>
                      <span className={`text-xs ${getStatusColor('openai')}`}>
                        {getStatusText('openai')}
                      </span>
                    </div>
                  </div>
                  <input
                    type="password"
                    className="glass-input w-full"
                    value={settings.openaiApiKey || ''}
                    onChange={(e) => handleApiKeyChange('openai', e.target.value)}
                    placeholder="Enter your OpenAI API key"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-white text-sm font-medium" style={{textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)'}}>
                      Claude API Key
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full bg-current ${getStatusColor('claude')}`}></div>
                      <span className={`text-xs ${getStatusColor('claude')}`}>
                        {getStatusText('claude')}
                      </span>
                    </div>
                  </div>
                  <input
                    type="password"
                    className="glass-input w-full"
                    value={settings.claudeApiKey || ''}
                    onChange={(e) => handleApiKeyChange('claude', e.target.value)}
                    placeholder="Enter your Claude API key"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-white text-sm font-medium" style={{textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)'}}>
                      DeepSeek API Key
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full bg-current ${getStatusColor('deepseek')}`}></div>
                      <span className={`text-xs ${getStatusColor('deepseek')}`}>
                        {getStatusText('deepseek')}
                      </span>
                    </div>
                  </div>
                  <input
                    type="password"
                    className="glass-input w-full"
                    value={settings.deepseekApiKey || ''}
                    onChange={(e) => handleApiKeyChange('deepseek', e.target.value)}
                    placeholder="Enter your DeepSeek API key"
                  />
                </div>

                {/* Appearance Section */}
                <div className="mt-6 pt-4 border-t border-white/20">
                  <h3 className={`text-lg font-medium mb-4 ${currentThemeStyles?.textColor || 'text-white'}`} style={{textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)'}}>Appearance</h3>
                  
                  {/* Theme Selection */}
                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-2 ${currentThemeStyles?.textColor || 'text-white'}`} style={{textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)'}}>
                      Theme
                    </label>
                    <select
                      value={settings.theme || 'glassmorphism'}
                      onChange={(e) => handleSettingsChange({ theme: e.target.value as 'glassmorphism' | 'dark' | 'light' })}
                      className="theme-input w-full p-3 rounded border focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/10 border-white/20 text-white"
                    >
                      <option value="glassmorphism" className="bg-gray-800 text-white">Glassmorphism (Default)</option>
                      <option value="dark" className="bg-gray-800 text-white">Dark</option>
                      <option value="light" className="bg-gray-800 text-white">Light</option>
                    </select>
                  </div>

                  {/* Adaptive Opacity */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className={`block text-sm font-medium ${currentThemeStyles?.textColor || 'text-white'}`} style={{textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)'}}>
                          Adaptive Opacity
                        </label>
                        <p className={`text-xs mt-1 ${currentThemeStyles?.secondaryText || 'text-white/60'}`}>
                          Automatically adjust opacity based on background
                        </p>
                      </div>
                      <button
                        onClick={() => handleSettingsChange({ adaptiveOpacity: !settings.adaptiveOpacity })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          settings.adaptiveOpacity ? 'bg-blue-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.adaptiveOpacity ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/20">
                <p className="text-white/70 text-sm">
                  Use <kbd className="px-2 py-1 bg-white/20 rounded">Ctrl+Shift+S</kbd> for screen capture
                </p>
                <p className="text-white/70 text-sm mt-2">
                  Use <kbd className="px-2 py-1 bg-white/20 rounded">Ctrl+Shift+A</kbd> to toggle overlay
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">API Setup Guide</h2>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-white/60 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            
            <div className="space-y-6 text-white text-sm">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-300">Getting Started</h3>
                <p className="mb-3">To use AI Screen Overlay, you need API keys from AI providers. Your keys are stored securely on your device and never shared.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-300">Get Your API Keys</h3>
                
                <div className="space-y-4">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <h4 className="font-semibold mb-2 text-white">OpenAI (GPT-4, GPT-3.5)</h4>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Visit: <a href="#" className="text-gray-300 hover:text-white underline" onClick={() => window.electronAPI?.openExternal('https://platform.openai.com/api-keys')}>platform.openai.com/api-keys</a></li>
                      <li>Sign up or log in to your account</li>
                      <li>Click "Create new secret key"</li>
                      <li>Copy the key (starts with "sk-")</li>
                      <li><strong>Important:</strong> Add billing info to use the API</li>
                    </ol>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <h4 className="font-semibold mb-2 text-white">Anthropic Claude</h4>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Visit: <a href="#" className="text-gray-300 hover:text-white underline" onClick={() => window.electronAPI?.openExternal('https://console.anthropic.com/')}>console.anthropic.com</a></li>
                      <li>Sign up or log in to your account</li>
                      <li>Go to "API Keys" section</li>
                      <li>Click "Create Key"</li>
                      <li>Copy the key (starts with "sk-ant-")</li>
                    </ol>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <h4 className="font-semibold mb-2 text-white">DeepSeek</h4>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Visit: <a href="#" className="text-gray-300 hover:text-white underline" onClick={() => window.electronAPI?.openExternal('https://platform.deepseek.com/')}>platform.deepseek.com</a></li>
                      <li>Sign up or log in to your account</li>
                      <li>Go to API section</li>
                      <li>Generate new API key</li>
                      <li>Copy the key</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-300">Usage Tips</h3>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>API Costs:</strong> You pay providers directly. Monitor usage on their dashboards.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Security:</strong> Keys are stored locally and encrypted. Never shared online.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Testing:</strong> Use the "Test Keys" button to verify your API keys work.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Models:</strong> Different providers offer different AI models. Try them all!</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-300">Using the App</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-white/10 rounded text-center leading-6">1</span>
                    <span>Add your API keys above</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-white/10 rounded text-center leading-6">2</span>
                    <span>Press <kbd className="px-2 py-1 bg-white/20 rounded">Ctrl+Shift+S</kbd> to capture screen</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-white/10 rounded text-center leading-6">3</span>
                    <span>Press <kbd className="px-2 py-1 bg-white/20 rounded">Ctrl+Shift+A</kbd> to toggle overlay</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-white/10 rounded text-center leading-6">4</span>
                    <span>Ask questions about your screenshots</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-white/10 rounded text-center leading-6">5</span>
                    <span>Switch between AI models anytime</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></span>
                  <div>
                    <p className="font-semibold text-gray-200 mb-1">First Time Setup</p>
                    <p className="text-xs">You only need to set up API keys once. The app will remember them securely. You can always change them later in Settings.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Overlay;
