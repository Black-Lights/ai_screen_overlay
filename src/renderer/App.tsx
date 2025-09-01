/// <reference path="../types/global.d.ts" />
import React, { useState, useEffect } from 'react';
import Overlay from './components/Overlay';
import { Chat, Message, AppSettings, ScreenCapture } from '@/shared/types';
import { generateChatTitle, shouldAutoName } from './services/chatNamingService';

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
  const [showMoveToNewChatOption, setShowMoveToNewChatOption] = useState(false);

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
    } else {
      console.log('📋 Using existing chat:', targetChat.title);
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
    
    // Set flag to show move to new chat option (only if current chat has other messages)
    if (messages.length > 0) {
      console.log('🔄 Setting move to new chat option');
      setShowMoveToNewChatOption(true);
    }
    
    console.log('✅ Screen capture handled successfully');
  };

  const moveToNewChat = async () => {
    if (!currentChat) return;
    
    // Get the last image message (screenshot)
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage?.imagePath) return;
    
    try {
      // Create a new screen capture chat
      const newChat = await createNewChat('Screen Capture Chat');
      
      // Move the screenshot message to the new chat
      await window.electronAPI.saveMessage({
        chatId: newChat.id,
        role: 'user',
        content: lastMessage.content,
        imagePath: lastMessage.imagePath
      });
      
      // Remove the image message from current chat by deleting and reloading messages
      // Note: We'll need to implement a delete message function if needed
      
      // Switch to the new chat
      setCurrentChat(newChat);
      const newChatMessages = await window.electronAPI.getChatMessages(newChat.id);
      setMessages(newChatMessages);
      
      // Reload chats to show the new one in the list
      const updatedChats = await window.electronAPI.getChats();
      setChats(updatedChats);
      
      // Hide the move option
      setShowMoveToNewChatOption(false);
      
      console.log('✅ Moved screenshot to new chat:', newChat.title);
    } catch (error) {
      console.error('❌ Failed to move to new chat:', error);
    }
  };

  const createNewChat = async (title?: string): Promise<Chat> => {
    let chatTitle = title;
    if (!chatTitle) {
      // Generate next chat number
      const chatNumbers = chats
        .map(chat => {
          const match = chat.title.match(/^Chat (\d+)$/);
          return match ? parseInt(match[1]) : 0;
        })
        .filter(num => num > 0);
      
      const nextNumber = chatNumbers.length > 0 ? Math.max(...chatNumbers) + 1 : 1;
      chatTitle = `Chat ${nextNumber}`;
    } else if (title && title.includes('Screen Capture Chat')) {
      // Generate next screen capture number
      const screenCaptureNumbers = chats
        .map(chat => {
          const match = chat.title.match(/^Screen Capture Chat (\d+)$/);
          return match ? parseInt(match[1]) : 0;
        })
        .filter(num => num > 0);
      
      const nextNumber = screenCaptureNumbers.length > 0 ? Math.max(...screenCaptureNumbers) + 1 : 1;
      chatTitle = `Screen Capture Chat ${nextNumber}`;
    }
    
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

  const updateChatTitle = async (chatId: number, newTitle: string) => {
    await window.electronAPI.updateChatTitle(chatId, newTitle);
    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, title: newTitle } 
        : chat
    ));
    
    // Update current chat if it's the one being renamed
    if (currentChat?.id === chatId) {
      setCurrentChat(prev => prev ? { ...prev, title: newTitle } : null);
    }
  };

  const sendMessage = async (text: string, imagePath?: string) => {
    if (!currentChat || !text.trim()) return;

    try {
      // Hide move to new chat option when user sends a message
      setShowMoveToNewChatOption(false);
      
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

      const updatedMessages = [...messages, userMessage, aiMessage];
      setMessages(updatedMessages);
      
      // Check if we should auto-generate a title for this chat
      if (shouldAutoName(currentChat, updatedMessages)) {
        try {
          console.log('🏷️ Auto-generating title for chat:', currentChat.title);
          const generatedTitle = await generateChatTitle(updatedMessages, settings);
          console.log('✨ Generated title:', generatedTitle);
          
          await updateChatTitle(currentChat.id, generatedTitle);
          console.log('✅ Chat title updated successfully');
        } catch (error) {
          console.error('❌ Failed to auto-generate chat title:', error);
        }
      }
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
      showMoveToNewChatOption={showMoveToNewChatOption}
      onCreateChat={createNewChat}
      onSwitchChat={switchChat}
      onDeleteChat={deleteChat}
      onUpdateChatTitle={updateChatTitle}
      onMoveToNewChat={moveToNewChat}
      onSendMessage={sendMessage}
      onUpdateSettings={updateSettings}
    />
  );
};

export default App;
