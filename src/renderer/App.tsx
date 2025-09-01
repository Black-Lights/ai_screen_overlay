/// <reference path="../types/global.d.ts" />
import React, { useState, useEffect } from 'react';
import Overlay from './components/Overlay';
import { Chat, Message, AppSettings, ScreenCapture } from '@/shared/types';

const App: React.FC = () => {
  console.log('🚀 App component starting...');
  
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    selectedProvider: 'openai',
    overlayPosition: { x: 100, y: 100 },
    overlaySize: { width: 400, height: 600 }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('📱 App useEffect triggered, initializing...');
    initializeApp();
    setupEventListeners();
  }, []);

  const initializeApp = async () => {
    console.log('🔧 initializeApp() called');
    try {
      console.log('⏳ Setting loading state...');
      setIsLoading(true);
      
      console.log('⚙️ Loading settings...');
      // Load settings
      const savedSettings = await window.electronAPI.getSettings();
      console.log('✅ Settings loaded:', savedSettings);
      setSettings(savedSettings);
      
      console.log('💬 Loading chats...');
      // Load chats
      const chatsData = await window.electronAPI.getChats();
      console.log('✅ Chats loaded:', chatsData.length, 'chats');
      setChats(chatsData);
      
      // If no chats exist, create a default one
      if (chatsData.length === 0) {
        console.log('📝 No chats exist, creating default chat...');
        const newChat = await window.electronAPI.createChat('New Chat');
        setChats([newChat]);
        setCurrentChat(newChat);
        console.log('✅ Default chat created:', newChat);
      } else {
        console.log('📂 Setting current chat to first chat');
        setCurrentChat(chatsData[0]);
        const messages = await window.electronAPI.getChatMessages(chatsData[0].id);
        setMessages(messages);
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupEventListeners = () => {
    console.log('🔗 Setting up event listeners in React app');
    // Listen for screen capture events
    window.electronAPI.onScreenCaptureComplete((data: ScreenCapture) => {
      console.log('📸 Screen capture complete event received:', data);
      handleScreenCapture(data);
    });

    window.electronAPI.onScreenCaptureError((error: string) => {
      console.error('❌ Screen capture error received:', error);
      // Could show a toast notification here
    });
    console.log('✅ Event listeners set up');
  };

  const handleScreenCapture = async (captureData: ScreenCapture) => {
    console.log('🎯 Handling screen capture:', captureData);
    
    let targetChat = currentChat;
    if (!targetChat) {
      // Create a new chat if none exists
      console.log('💬 Creating new chat for screen capture');
      targetChat = await createNewChat('Screen Capture Chat');
      setCurrentChat(targetChat);
    }
    
    console.log('📄 Current messages count:', messages.length);
    
    // Create a message with the captured image
    console.log('💬 Creating message with captured image...');
    const imageMessage = await window.electronAPI.saveMessage({
      chatId: targetChat.id,
      role: 'user',
      content: 'Screenshot captured',
      imagePath: captureData.imagePath
    });
    
    console.log('✅ Image message created:', imageMessage);
    
    // Update messages list
    setMessages(prev => [...prev, imageMessage]);
    
    console.log('✅ Screen capture handled successfully');
  };

  const createNewChat = async (title?: string): Promise<Chat> => {
    const chatTitle = title || `Chat ${chats.length + 1}`;
    const newChat = await window.electronAPI.createChat(chatTitle);
    setChats(prev => [newChat, ...prev]);
    setMessages([]);
    return newChat;
  };

  const switchChat = async (chat: Chat) => {
    setCurrentChat(chat);
    const chatMessages = await window.electronAPI.getChatMessages(chat.id);
    setMessages(chatMessages);
  };

  const deleteChat = async (chatId: number) => {
    await window.electronAPI.deleteChat(chatId);
    const updatedChats = chats.filter(chat => chat.id !== chatId);
    setChats(updatedChats);
    
    if (currentChat?.id === chatId) {
      if (updatedChats.length > 0) {
        switchChat(updatedChats[0]);
      } else {
        const newChat = await createNewChat();
        setCurrentChat(newChat);
      }
    }
  };

  const sendMessage = async (text: string, imagePath?: string) => {
    if (!currentChat || !text.trim()) return;

    try {
      // Save user message
      const userMessage = await window.electronAPI.saveMessage({
        chatId: currentChat.id,
        role: 'user',
        content: text,
        imagePath
      });
      
      setMessages(prev => [...prev, userMessage]);

      // Get API key for selected provider
      const apiKey = getApiKeyForProvider(settings.selectedProvider);
      console.log(`🔑 Frontend sending provider: ${settings.selectedProvider}, apiKey starts with: ${apiKey?.substring(0, 10)}...`);
      if (!apiKey) {
        throw new Error(`API key not configured for ${settings.selectedProvider}`);
      }

      // Send to AI
      const selectedModel = settings.selectedModels?.[settings.selectedProvider];
      const aiResponse = await window.electronAPI.sendAIMessage({
        text,
        imagePath,
        provider: settings.selectedProvider,
        apiKey,
        chatId: currentChat.id,
        modelId: selectedModel
      });

      // Save AI response with provider and model info
      const aiMessage = await window.electronAPI.saveMessage({
        chatId: currentChat.id,
        role: 'assistant',
        content: aiResponse.content, // Extract content from structured response
        provider: settings.selectedProvider,
        model: aiResponse.model // Extract model from structured response
      });

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Could show error message to user
    }
  };

  const getApiKeyForProvider = (provider: string): string | undefined => {
    console.log(`🔍 getApiKeyForProvider called for: ${provider}`);
    console.log(`📋 Available API keys in settings:`, {
      openai: settings.openaiApiKey?.substring(0, 10) + '...',
      claude: settings.claudeApiKey?.substring(0, 10) + '...',
      deepseek: settings.deepseekApiKey?.substring(0, 10) + '...'
    });
    
    switch (provider) {
      case 'openai':
        return settings.openaiApiKey;
      case 'claude':
        return settings.claudeApiKey;
      case 'deepseek':
        return settings.deepseekApiKey;
      default:
        return undefined;
    }
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    await window.electronAPI.saveSettings(newSettings);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <Overlay
      currentChat={currentChat}
      chats={chats}
      messages={messages}
      settings={settings}
      onCreateChat={createNewChat}
      onSwitchChat={switchChat}
      onDeleteChat={deleteChat}
      onSendMessage={sendMessage}
      onUpdateSettings={updateSettings}
    />
  );
};

export default App;
