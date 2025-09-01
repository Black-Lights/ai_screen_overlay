import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Chat, Message } from '@/shared/types';
import { AVAILABLE_MODELS } from '@/shared/models';

interface ChatInterfaceProps {
  currentChat: Chat | null;
  messages: Message[];
  showMoveToNewChatOption: boolean;
  onSendMessage: (text: string, imagePath?: string) => void;
  onMoveToNewChat: () => void;
  provider: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  currentChat,
  messages,
  showMoveToNewChatOption,
  onSendMessage,
  onMoveToNewChat,
  provider,
}) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Listen for screen capture events
    const handleScreenCapture = (data: any) => {
      if (data.imagePath) {
        setCurrentImage(data.imagePath);
      }
    };

    window.electronAPI?.onScreenCaptureComplete(handleScreenCapture);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputText.trim() && !currentImage) return;
    if (!currentChat) return;

    setIsLoading(true);
    
    try {
      await onSendMessage(inputText.trim(), currentImage || undefined);
      setInputText('');
      setCurrentImage(null);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const removeImage = () => {
    setCurrentImage(null);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const formatMessage = (content: string) => {
    return (
      <div className="markdown-content">
        <ReactMarkdown
          components={{
            code({ node, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || '');
              return match ? (
                <SyntaxHighlighter
                  style={oneDark as any}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={`${className} bg-black/50 px-1 py-0.5 rounded text-sm`} {...props}>
                  {children}
                </code>
              );
            },
            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
            li: ({ children }) => <li className="mb-1">{children}</li>,
            h1: ({ children }) => <h1 className="text-xl font-bold mb-2">{children}</h1>,
            h2: ({ children }) => <h2 className="text-lg font-bold mb-2">{children}</h2>,
            h3: ({ children }) => <h3 className="text-base font-bold mb-1">{children}</h3>,
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-white/30 pl-3 italic mb-2">
                {children}
              </blockquote>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'openai':
        return 'text-green-400';
      case 'claude':
        return 'text-orange-400';
      case 'deepseek':
        return 'text-purple-400';
      default:
        return 'text-blue-400';
    }
  };

  const getModelDisplayName = (provider: string, model: string) => {
    if (!model || !provider) return '';
    
    const providerModels = AVAILABLE_MODELS[provider as keyof typeof AVAILABLE_MODELS];
    if (!providerModels) return model;
    
    const modelInfo = providerModels.find(m => m.id === model);
    return modelInfo ? modelInfo.name : model;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white/90" style={{textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)'}}>
              <div className="text-4xl mb-4">💬</div>
              <p className="text-lg font-medium mb-2">Start a conversation</p>
              <p className="text-sm">
                Press <kbd className="px-2 py-1 bg-black/50 rounded border border-white/30">Ctrl+Shift+S</kbd> to capture your screen
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 rounded-lg animate-slide-up break-words relative group ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-black/80 text-white backdrop-blur-sm border border-white/20'
                }`}
              >
                {/* Copy button */}
                <button
                  onClick={() => copyToClipboard(message.content)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded bg-white/20 hover:bg-white/30"
                  title="Copy message"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v6h2V5h8v6h2V5a2 2 0 00-2-2H6zM4 9a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2v-6a2 2 0 00-2-2H4z" />
                  </svg>
                </button>

                {/* Show image if present */}
                {message.imagePath && (
                  <div className="mb-3">
                    <img
                      src={`file://${message.imagePath}`}
                      alt="Captured screen"
                      className="max-w-full h-auto rounded border"
                      style={{ maxHeight: '200px' }}
                    />
                  </div>
                )}
                
                <div className="text-sm select-text">
                  {formatMessage(message.content)}
                </div>

                {/* Show provider and model for AI messages */}
                {message.role === 'assistant' && message.provider && (
                  <div className="mt-3 pt-2 border-t border-white/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-medium ${getProviderColor(message.provider)}`}>
                          {message.provider.toUpperCase()}
                        </span>
                        {message.model && (
                          <>
                            <span className="text-white/60 text-xs">•</span>
                            <span className="text-xs text-white/80">
                              {getModelDisplayName(message.provider, message.model)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-xs opacity-60 mt-2">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/90 text-gray-800 backdrop-blur-sm px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-600">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Move to New Chat Option */}
      {showMoveToNewChatOption && (
        <div className="px-4 py-3 border-t border-b border-white/10 bg-yellow-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-yellow-200">
                Screenshot added to current chat
              </span>
            </div>
            <button
              onClick={onMoveToNewChat}
              className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
            >
              Move to New Chat
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-white/10">
        {/* Current image preview */}
        {currentImage && (
          <div className="mb-3 relative inline-block">
            <img
              src={`file://${currentImage}`}
              alt="Captured screen"
              className="max-w-32 h-auto rounded border border-white/20"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition-colors"
              title="Remove image"
            >
              ×
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex space-x-2">
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={currentImage ? "Ask about your screenshot..." : "Type a message..."}
              className="chat-input"
              rows={2}
              disabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            disabled={(!inputText.trim() && !currentImage) || isLoading || !currentChat}
            className="glass-button disabled:opacity-50 disabled:cursor-not-allowed self-end"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>

        <div className="mt-2 text-xs text-white/50 text-center">
          Press Shift+Enter for new line • Enter to send
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
