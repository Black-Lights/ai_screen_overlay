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
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [position, setPosition] = useState(settings.overlayPosition);
  const [size, setSize] = useState(settings.overlaySize);
  const [showSettings, setShowSettings] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [showLLMSelector, setShowLLMSelector] = useState(false);
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
  const titleBarRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);

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

  // Cancel drag/resize operations when settings panel opens
  useEffect(() => {
    if (showSettings) {
      setIsDragging(false);
      setIsResizing(false);
      setResizeDirection(null);
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

  // API status checking
  useEffect(() => {
    if (showSettings) {
      checkApiStatus();
    }
  }, [settings.openaiApiKey, settings.claudeApiKey, settings.deepseekApiKey, showSettings]);

  // Check API status initially and when settings change
  useEffect(() => {
    checkApiStatus();
  }, []);

  // Check API status when settings change
  useEffect(() => {
    if (showSettings) {
      checkApiStatus();
    }
  }, [settings.openaiApiKey, settings.claudeApiKey, settings.deepseekApiKey, showSettings]);

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

  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't handle drag/resize when settings panel is open
    if (showSettings) {
      return;
    }
    
    if (titleBarRef.current?.contains(e.target as Node)) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    } else if (resizeHandleRef.current?.contains(e.target as Node)) {
      setIsResizing(true);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: size.width,
        height: size.height,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    // Don't handle drag/resize when settings panel is open
    if (showSettings) {
      return;
    }
    
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Move the actual Electron window instead of CSS positioning
      // @ts-ignore - TypeScript doesn't recognize new electronAPI methods yet
      window.electronAPI.moveWindow(newX, newY);
      setPosition({ x: newX, y: newY });
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      const newWidth = Math.max(280, Math.min(1000, resizeStart.width + deltaX));
      const newHeight = Math.max(300, Math.min(1400, resizeStart.height + deltaY));
      
      // Resize the actual Electron window
      // @ts-ignore - TypeScript doesn't recognize new electronAPI methods yet
      window.electronAPI.resizeWindow(newWidth, newHeight);
      setSize({ width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    // Don't handle drag/resize when settings panel is open
    if (showSettings) {
      return;
    }
    
    if (isDragging) {
      setIsDragging(false);
      onUpdateSettings({ overlayPosition: position });
    } else if (isResizing) {
      setIsResizing(false);
      setResizeDirection(null);
      onUpdateSettings({ overlaySize: size });
    }
  };

  useEffect(() => {
    // Don't add global mouse event listeners when settings panel is open
    if ((isDragging || isResizing) && !showSettings) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, resizeStart, position, size, showSettings]);

  const handleMinimize = async () => {
    await window.electronAPI.minimizeWindow();
  };

  const handleClose = async () => {
    await window.electronAPI.closeWindow();
  };

  const handleSettingsChange = (newSettings: Partial<AppSettings>) => {
    onUpdateSettings(newSettings);
  };

  return (
    <div
      ref={overlayRef}
      className={`glass-panel animate-fade-in select-none flex flex-col overflow-hidden h-full w-full ${
        isDragging ? 'is-dragging' : ''
      } ${isResizing ? 'is-resizing' : ''} theme-${settings.theme || 'glassmorphism'}`}
      style={{
        background: currentThemeStyles?.background || 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
        backdropFilter: currentThemeStyles?.backdropFilter || 'blur(20px)',
        border: currentThemeStyles?.border || '1px solid rgba(255, 255, 255, 0.1)',
        color: currentThemeStyles?.textColor || 'white',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Title Bar */}
      <div
        ref={titleBarRef}
        className="title-bar cursor-move"
      >
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-white font-medium text-sm" style={{textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)'}}>
              AI Screen Overlay
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Chat History Button */}
          <button
            onClick={() => setShowChatHistory(!showChatHistory)}
            className="p-1.5 rounded hover:bg-white/20 transition-colors text-white/80 hover:text-white"
            title="Chat History"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 rounded hover:bg-white/20 transition-colors text-white/80 hover:text-white"
            title="Settings"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Window Controls */}
          <div className="window-controls flex items-center space-x-2">
            <button
              onClick={handleMinimize}
              className="w-4 h-4 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-all duration-200 hover:scale-110 flex items-center justify-center group"
              title="Minimize"
            >
              <div className="w-2 h-0.5 bg-yellow-900 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
            <button
              onClick={handleClose}
              className="w-4 h-4 rounded-full bg-red-500 hover:bg-red-600 transition-all duration-200 hover:scale-110 flex items-center justify-center group"
              title="Close"
            >
              <svg className="w-2.5 h-2.5 text-red-900 opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="overlay-content flex-1 min-h-0">
        {/* LLM Selector - Collapsible */}
        <div className="overlay-section border-b border-white/10">
          {!showLLMSelector ? (
            // Collapsed view - just show provider name and click to expand
            <div 
              className="p-3 cursor-pointer hover:bg-white/5 transition-colors bg-black/20 backdrop-blur-sm"
              onClick={() => setShowLLMSelector(true)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-white/90">
                    LLM Provider
                  </span>
                  <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded">
                    {settings.selectedProvider === 'openai' ? 'OpenAI' : 
                     settings.selectedProvider === 'claude' ? 'Anthropic' : 'DeepSeek'}
                  </span>
                </div>
                <button className="text-white/40 hover:text-white/60 transition-colors bg-white/10 backdrop-blur-sm p-1 rounded">
                  <svg className="w-4 h-4 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
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
          />
        </div>

        {/* Chat History Sidebar */}
        {showChatHistory && (
          <div className="absolute right-0 top-0 h-full glass-panel animate-slide-up z-50"
               style={{ width: Math.min(320, size.width * 0.8) }}>
            <ChatHistory
              chats={chats}
              currentChat={currentChat}
              onCreateChat={onCreateChat}
              onSwitchChat={onSwitchChat}
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

              {/* API Keys Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white" style={{textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)'}}>API Keys</h3>
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

      {/* Resize Handle */}
      <div
        ref={resizeHandleRef}
        className="resize-handle"
        title="Drag to resize"
      ></div>
    </div>
  );
};

export default Overlay;
