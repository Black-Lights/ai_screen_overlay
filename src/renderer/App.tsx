/// <reference path="../types/global.d.ts" />
import React, { useState, useEffect, useRef } from 'react';
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

  // Refs to track current state in event listeners
  const currentChatRef = useRef<Chat | null>(null);
  const messagesRef = useRef<Message[]>([]);
  const chatsRef = useRef<Chat[]>([]);

  // Update refs when state changes
  useEffect(() => {
    currentChatRef.current = currentChat;
  }, [currentChat]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  useEffect(() => {
    console.log('📱 App useEffect triggered, initializing...');
    const initApp = async () => {
      await initializeApp();
      // Set up event listeners after app is initialized
      console.log('🔗 Setting up event listeners after app initialization...');
      setupEventListeners();
    };
    initApp();
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
    
    // Listen for screen capture events with bound handler
    const handleScreenCaptureEvent = (data: ScreenCapture) => {
      console.log('📸 Screen capture event received:', data);
      console.log('🔍 Current chat at event time:', currentChatRef.current ? `${currentChatRef.current.id}: ${currentChatRef.current.title}` : 'null');
      console.log('📊 Messages count at event time:', messagesRef.current.length);
      console.log('📦 Chats count at event time:', chatsRef.current.length);
      
      handleScreenCapture(data);
    };

    const handleScreenCaptureErrorEvent = (error: string) => {
      console.error('❌ Screen capture error received:', error);
    };

    // Register the event listeners
    if (window.electronAPI?.onScreenCaptureComplete) {
      window.electronAPI.onScreenCaptureComplete(handleScreenCaptureEvent);
      console.log('✅ onScreenCaptureComplete listener registered');
    } else {
      console.error('❌ onScreenCaptureComplete not available');
    }
    
    if (window.electronAPI?.onScreenCaptureError) {
      window.electronAPI.onScreenCaptureError(handleScreenCaptureErrorEvent);
      console.log('✅ onScreenCaptureError listener registered');
    } else {
      console.error('❌ onScreenCaptureError not available');
    }
    
    console.log('✅ Event listeners set up successfully');
  };

  const handleScreenCapture = async (captureData: ScreenCapture) => {
    console.log('🎯 Handling screen capture:', captureData);
    
    // Use refs to get current state (avoiding closure issues)
    const currentChatAtCapture = currentChatRef.current;
    const messagesAtCapture = messagesRef.current;
    const chatsAtCapture = chatsRef.current;
    
    console.log('📋 Current chat before capture:', currentChatAtCapture ? `${currentChatAtCapture.id}: ${currentChatAtCapture.title}` : 'No current chat');
    console.log('📄 Current messages count before capture:', messagesAtCapture.length);
    console.log('📦 Total chats count:', chatsAtCapture.length);
    
    let targetChat = currentChatAtCapture;
    if (!targetChat) {
      // Create a new chat if none exists
      console.log('💬 No current chat - creating new chat for screen capture');
      // Generate next screen capture number
      const screenCaptureNumbers = chatsAtCapture
        .map(chat => {
          const match = chat.title.match(/^Screen Capture Chat (\d+)$/);
          return match ? parseInt(match[1]) : 0;
        })
        .filter(num => num > 0);
      
      const nextNumber = screenCaptureNumbers.length > 0 ? Math.max(...screenCaptureNumbers) + 1 : 1;
      const chatTitle = `Screen Capture Chat ${nextNumber}`;
      
      targetChat = await window.electronAPI.createChat(chatTitle);
      const updatedChats = [targetChat, ...chatsAtCapture];
      setChats(updatedChats);
      setCurrentChat(targetChat);
      setMessages([]);
      
      // Update refs immediately
      currentChatRef.current = targetChat;
      messagesRef.current = [];
      chatsRef.current = updatedChats;
      
      console.log('✅ Created new screen capture chat:', chatTitle);
    } else {
      console.log('✅ Using existing current chat:', targetChat.title);
    }
    
    // Don't create any automatic message - just handle the image preview
    // The ChatInterface will show the image in the preview area via onScreenCaptureComplete
    console.log('📷 Screenshot captured, image will be shown in preview area');
    
    // Keep messages unchanged - no automatic message creation
    const updatedMessages = [...messagesAtCapture];
    setMessages(updatedMessages);
    messagesRef.current = updatedMessages;
    
    // Always show move to new chat option when there's a screenshot
    console.log('🔄 Screenshot captured, showing move to new chat option');
    setShowMoveToNewChatOption(true);
    
    console.log('✅ Screen capture handled successfully');
  };

  const moveToNewChat = async () => {
    if (!currentChat) return;
    
    try {
      console.log('🔄 Creating new chat for screenshot...');
      
      // Create a new screen capture chat
      const newChat = await createNewChat('Screen Capture Chat');
      console.log('✅ Created new screen capture chat:', newChat.title);
      
      // Switch to the new chat - the image will remain in the preview area
      setCurrentChat(newChat);
      const newChatMessages = await window.electronAPI.getChatMessages(newChat.id);
      setMessages(newChatMessages);
      
      // Update chats list to include the new chat
      const updatedChats = await window.electronAPI.getChats();
      setChats(updatedChats);
      
      // Hide the move option
      setShowMoveToNewChatOption(false);
      
      console.log('✅ Successfully created new chat for screenshot:', newChat.title);
    } catch (error) {
      console.error('❌ Failed to move to new chat:', error);
    }
  };

  const handleImageRemoved = () => {
    // Clear the move to new chat option when image is removed
    setShowMoveToNewChatOption(false);
    console.log('🗑️ Image removed, clearing move to new chat option');
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
    
    // Automatically switch to the new chat
    setCurrentChat(newChat);
    setMessages([]);
    
    console.log('✅ Created and switched to new chat:', chatTitle);
    return newChat;
  };

  const switchChat = async (chat: Chat) => {
    setCurrentChat(chat);
    const chatMessages = await window.electronAPI.getChatMessages(chat.id);
    setMessages(chatMessages);
    
    // Clear move to new chat option when switching chats
    setShowMoveToNewChatOption(false);
    
    console.log('✅ Switched to chat:', chat.title);
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
      
      // Create a new message as usual
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
      onImageRemoved={handleImageRemoved}
    />
  );
};

export default App;
