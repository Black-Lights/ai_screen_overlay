import React, { useState, useEffect, useRef } from 'react';
import ChatInterface from './ChatInterface';
import ChatHistory from './ChatHistory';
import LLMSelector from './LLMSelector';
import { Chat, Message, AppSettings } from '@/shared/types';

interface OverlayProps {
  currentChat: Chat | null;
  chats: Chat[];
  messages: Message[];
  settings: AppSettings;
  onCreateChat: (title?: string) => Promise<Chat>;
  onSwitchChat: (chat: Chat) => void;
  onDeleteChat: (chatId: number) => void;
  onSendMessage: (text: string, imagePath?: string) => void;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
}

const Overlay: React.FC<OverlayProps> = ({
  currentChat,
  chats,
  messages,
  settings,
  onCreateChat,
  onSwitchChat,
  onDeleteChat,
  onSendMessage,
  onUpdateSettings,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [position, setPosition] = useState(settings.overlayPosition);
  const [size, setSize] = useState(settings.overlaySize);
  const [showSettings, setShowSettings] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const titleBarRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPosition(settings.overlayPosition);
    setSize(settings.overlaySize);
  }, [settings.overlayPosition, settings.overlaySize]);

  const handleMouseDown = (e: React.MouseEvent) => {
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
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Get screen dimensions
      const screenWidth = window.screen.width;
      const screenHeight = window.screen.height;
      const overlayWidth = size.width;
      const overlayHeight = size.height;
      
      // Constrain position to keep overlay visible
      const constrainedPosition = {
        x: Math.max(0, Math.min(screenWidth - overlayWidth, newX)),
        y: Math.max(0, Math.min(screenHeight - overlayHeight, newY)),
      };
      
      setPosition(constrainedPosition);
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      const newWidth = Math.max(280, Math.min(1000, resizeStart.width + deltaX));
      const newHeight = Math.max(300, Math.min(1400, resizeStart.height + deltaY));
      
      setSize({ width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      onUpdateSettings({ overlayPosition: position });
    } else if (isResizing) {
      setIsResizing(false);
      onUpdateSettings({ overlaySize: size });
    }
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, resizeStart, position, size]);

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
      className={`fixed glass-panel animate-fade-in select-none flex flex-col overflow-hidden ${
        isDragging ? 'is-dragging' : ''
      } ${isResizing ? 'is-resizing' : ''}`}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
        minWidth: '280px',
        minHeight: '300px',
        maxWidth: '1000px',
        maxHeight: '1400px',
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
            <span className="text-white font-medium text-sm">
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
          <div className="window-controls">
            <button
              onClick={handleMinimize}
              className="window-control-btn btn-minimize"
              title="Minimize"
            />
            <button
              onClick={handleClose}
              className="window-control-btn btn-close"
              title="Close"
            />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="overlay-content flex-1 min-h-0">
        {/* LLM Selector */}
        <div className="overlay-section p-3 border-b border-white/10">
          <LLMSelector
            selectedProvider={settings.selectedProvider}
            settings={settings}
            onProviderChange={(provider) => onUpdateSettings({ selectedProvider: provider })}
            onSettingsChange={handleSettingsChange}
          />
        </div>

        {/* Chat Interface */}
        <div className="overlay-main flex-1 min-h-0">
          <ChatInterface
            currentChat={currentChat}
            messages={messages}
            onSendMessage={onSendMessage}
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
              onClose={() => setShowChatHistory(false)}
            />
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div className="absolute inset-0 glass-panel animate-fade-in z-40">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Settings</h2>
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
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    OpenAI API Key
                  </label>
                  <input
                    type="password"
                    className="glass-input w-full"
                    value={settings.openaiApiKey || ''}
                    onChange={(e) => onUpdateSettings({ openaiApiKey: e.target.value })}
                    placeholder="Enter your OpenAI API key"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Claude API Key
                  </label>
                  <input
                    type="password"
                    className="glass-input w-full"
                    value={settings.claudeApiKey || ''}
                    onChange={(e) => onUpdateSettings({ claudeApiKey: e.target.value })}
                    placeholder="Enter your Claude API key"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    DeepSeek API Key
                  </label>
                  <input
                    type="password"
                    className="glass-input w-full"
                    value={settings.deepseekApiKey || ''}
                    onChange={(e) => onUpdateSettings({ deepseekApiKey: e.target.value })}
                    placeholder="Enter your DeepSeek API key"
                  />
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
