import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Chat, Message, AppSettings } from '@/shared/types';
import { AVAILABLE_MODELS } from '@/shared/models';
import { ImageCanvas } from './ImageCanvas';
import TokenCounter from './TokenCounter';

// Helper function to extract text content from React children
const extractTextFromChildren = (children: any): string => {
  if (typeof children === 'string') {
    return children;
  }
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join('');
  }
  if (children && typeof children === 'object' && children.props) {
    return extractTextFromChildren(children.props.children);
  }
  return '';
};

interface ChatInterfaceProps {
  currentChat: Chat | null;
  messages: Message[];
  showMoveToNewChatOption: boolean;
  onSendMessage: (text: string, imagePath?: string) => void;
  onMoveToNewChat: () => void;
  provider: string;
  showZoomControls: boolean;
  zoomControlsRef: React.RefObject<HTMLDivElement>;
  onImageRemoved: () => void;
  settings: AppSettings;
}

// Utility function to calculate total cost from messages
const calculateTotalCostFromMessages = (messages: Message[]): number => {
  return messages.reduce((total, msg) => total + (msg.actualCost || 0), 0);
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  currentChat,
  messages,
  showMoveToNewChatOption,
  onSendMessage,
  onMoveToNewChat,
  provider,
  showZoomControls,
  zoomControlsRef,
  onImageRemoved,
  settings,
}) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionMessage, setCompressionMessage] = useState<{
    text: string;
    type: 'success' | 'info' | 'error';
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Listen for paste events
    const handlePaste = async (e: ClipboardEvent) => {
      // Only handle paste if textarea is focused or if no specific element is focused
      const activeElement = document.activeElement;
      if (activeElement !== textareaRef.current && activeElement !== document.body) {
        return;
      }

      const clipboardItems = e.clipboardData?.items;
      if (!clipboardItems) return;

      for (let i = 0; i < clipboardItems.length; i++) {
        const item = clipboardItems[i];
        if (item.type.startsWith('image/')) {
          e.preventDefault(); // Prevent default paste behavior
          const blob = item.getAsFile();
          if (blob) {
            try {
              const arrayBuffer = await blob.arrayBuffer();
              const uint8Array = new Uint8Array(arrayBuffer);
              const extension = item.type.split('/')[1] || 'png';
              const filename = `clipboard-${Date.now()}.${extension}`;
              const savedPath = await window.electronAPI.saveUploadedImage(uint8Array, filename);
              setCurrentImage(savedPath);
            } catch (error) {
              console.error('Failed to paste image:', error);
            }
          }
          return;
        }
      }
    };

    window.electronAPI?.onScreenCaptureComplete(handleScreenCapture);
    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, []);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const maxHeight = 200; // Max height in pixels
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [inputText]);

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
    onImageRemoved?.(); // Notify parent that image was removed
  };

  const editImage = () => {
    if (currentImage) {
      console.log('Opening image editor for:', currentImage);
      setShowImageEditor(true);
    }
  };

  const handleSaveEditedImage = (editedImagePath: string) => {
    console.log('Image edited and saved:', editedImagePath);
    setCurrentImage(editedImagePath);
    setShowImageEditor(false);
  };

  const handleCloseImageEditor = () => {
    setShowImageEditor(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size too large. Please select an image smaller than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      if (arrayBuffer) {
        try {
          // Save the uploaded image using IPC
          const uint8Array = new Uint8Array(arrayBuffer);
          const savedPath = await window.electronAPI.saveUploadedImage(uint8Array, file.name);
          setCurrentImage(savedPath);
        } catch (error) {
          console.error('Failed to save uploaded image:', error);
          alert('Failed to upload image');
        }
      }
    };
    reader.readAsArrayBuffer(file);

    // Reset the input
    event.target.value = '';
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith('image/')) {
            const blob = await clipboardItem.getType(type);
            const arrayBuffer = await blob.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            
            // Generate filename with current timestamp
            const extension = type.split('/')[1] || 'png';
            const filename = `clipboard-${Date.now()}.${extension}`;
            
            const savedPath = await window.electronAPI.saveUploadedImage(uint8Array, filename);
            setCurrentImage(savedPath);
            return;
          }
        }
      }
      
      alert('No image found in clipboard');
    } catch (error) {
      console.error('Failed to paste from clipboard:', error);
      alert('Failed to paste image from clipboard');
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const copyToClipboard = async (text: string, messageId: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleCompressChatHistory = async () => {
    if (!currentChat?.id) return;
    
    setIsCompressing(true);
    setCompressionMessage(null);
    
    try {
      const result = await window.electronAPI.compressChatHistory(currentChat.id);
      
      if (result.success) {
        setCompressionMessage({
          text: `Chat history compressed! Deleted ${result.deletedCount} old messages, saved ~${result.savedTokens} tokens.`,
          type: 'success'
        });
        // Refresh the chat to show updated messages
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setCompressionMessage({
          text: result.reason || 'No compression needed',
          type: 'info'
        });
      }
    } catch (error) {
      console.error('Failed to compress chat history:', error);
      setCompressionMessage({
        text: 'Failed to compress chat history',
        type: 'error'
      });
    } finally {
      setIsCompressing(false);
      setTimeout(() => setCompressionMessage(null), 5000);
    }
  };

  const preprocessMathContent = (content: string) => {
    // Convert LaTeX delimiters to markdown math format that remark-math can handle
    return content
      // Convert display math \[ ... \] to $$ ... $$
      .replace(/\\\[([\s\S]*?)\\\]/g, (match, formula) => {
        return `$$${formula}$$`;
      })
      // Convert inline math \( ... \) to $ ... $
      .replace(/\\\((.*?)\\\)/g, (match, formula) => {
        return `$${formula}$`;
      });
  };

  const formatMessage = (content: string) => {
    // Preprocess to convert LaTeX delimiters
    const processedContent = preprocessMathContent(content);
    
    return (
      <div className="markdown-content">
        <ReactMarkdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || '');
              
              if (!inline) {
                const codeContent = String(children).replace(/\n$/, '');
                const codeId = `code-${Math.random().toString(36).substr(2, 9)}`;
                
                const handleCopyCode = async () => {
                  await navigator.clipboard.writeText(codeContent);
                  setCopiedCodeId(codeId);
                  setTimeout(() => setCopiedCodeId(null), 2000);
                };
                
                if (match) {
                  // Code block with language - use syntax highlighter
                  return (
                    <div className="relative group">
                      <button
                        onClick={handleCopyCode}
                        className={`absolute top-2 right-2 p-1.5 rounded transition-all duration-200 z-30 ${
                          copiedCodeId === codeId 
                            ? 'opacity-100 bg-green-500/95 text-white shadow-lg' 
                            : 'opacity-0 group-hover:opacity-100 bg-white/15 hover:bg-white/25'
                        }`}
                        title="Copy code"
                      >
                        {copiedCodeId === codeId ? (
                          <span className="text-xs text-white font-semibold whitespace-nowrap px-2 py-1">Copied!</span>
                        ) : (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                      <SyntaxHighlighter
                        style={oneDark as any}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {codeContent}
                      </SyntaxHighlighter>
                    </div>
                  );
                } else {
                  // Code block without language (command blocks) - use plain pre
                  return (
                    <div className="relative group">
                      <button
                        onClick={handleCopyCode}
                        className={`absolute top-2 right-2 p-1.5 rounded transition-all duration-200 z-30 ${
                          copiedCodeId === codeId 
                            ? 'opacity-100 bg-green-500/95 text-white shadow-lg' 
                            : 'opacity-0 group-hover:opacity-100 bg-white/15 hover:bg-white/25'
                        }`}
                        title="Copy command"
                      >
                        {copiedCodeId === codeId ? (
                          <span className="text-xs text-white font-semibold whitespace-nowrap px-2 py-1">Copied!</span>
                        ) : (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                      <pre className="bg-black/50 p-3 rounded overflow-x-auto text-sm font-mono whitespace-pre-wrap" {...props}>
                        <code>{children}</code>
                      </pre>
                    </div>
                  );
                }
              }
              
              return (
                <code className={`${className} bg-black/50 px-1 py-0.5 rounded text-sm font-mono`} {...props}>
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
            pre: ({ children, ...props }: any) => {
              // Handle pre blocks that aren't wrapped by code component (command blocks)
              const textContent = extractTextFromChildren(children);
              const preId = `pre-${Math.random().toString(36).substr(2, 9)}`;
              
              const handleCopyPre = async () => {
                await navigator.clipboard.writeText(textContent);
                setCopiedCodeId(preId);
                setTimeout(() => setCopiedCodeId(null), 2000);
              };
              
              return (
                <div className="relative group">
                  <button
                    onClick={handleCopyPre}
                    className={`absolute top-2 right-2 p-1.5 rounded transition-all duration-200 z-30 ${
                      copiedCodeId === preId 
                        ? 'opacity-100 bg-green-500/95 text-white shadow-lg' 
                        : 'opacity-0 group-hover:opacity-100 bg-white/15 hover:bg-white/25'
                    }`}
                    title="Copy command"
                  >
                    {copiedCodeId === preId ? (
                      <span className="text-xs text-white font-semibold whitespace-nowrap px-2 py-1">Copied!</span>
                    ) : (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                  <pre className="bg-black/50 p-3 rounded overflow-x-auto text-sm font-mono" {...props}>
                    {children}
                  </pre>
                </div>
              );
            },
          }}
        >
          {processedContent}
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
      {/* Chat Info Bar with Token Counter */}
      {currentChat && (
        <div className="flex justify-between items-center p-2 border-b border-white/10 bg-black/20">
          <div className="flex items-center space-x-4">
            {settings.tokenOptimization?.showTokenCounter && (
              <TokenCounter 
                currentChat={currentChat}
                messages={messages}
                provider={provider}
                model={settings.selectedModels?.[provider] || 'default'}
                showCost={settings.tokenOptimization?.showCostEstimator || false}
                className="flex-shrink-0"
              />
            )}
            {settings.tokenOptimization?.showCostEstimator && (
              (() => {
                // Calculate dynamic total cost from messages
                const dynamicTotalCost = calculateTotalCostFromMessages(messages);
                const displayCost = dynamicTotalCost || currentChat?.totalCost || 0;
                
                return displayCost > 0 ? (
                  <div className="text-xs text-blue-400 flex items-center space-x-1 flex-shrink-0" title={`Total cost spent on this chat so far (${messages.filter(m => m.actualCost && m.actualCost > 0).length} paid messages)`}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"/>
                    </svg>
                    <span>Spent: ${displayCost.toFixed(4)}</span>
                  </div>
                ) : null;
              })()
            )}
            {messages.length > 5 && (
              <button
                onClick={handleCompressChatHistory}
                disabled={isCompressing}
                className="text-xs px-2 py-1 rounded hover:bg-white/20 transition-colors text-white/60 hover:text-white disabled:opacity-50 flex items-center space-x-1"
                title="Manually compress chat history by summarizing old messages to save tokens and costs for future messages"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                </svg>
                <span>{isCompressing ? 'Compressing...' : 'Compress'}</span>
              </button>
            )}
          </div>
          
          {compressionMessage && (
            <div className={`text-xs px-2 py-1 rounded max-w-xs flex items-center space-x-1 ${
              compressionMessage.type === 'success' ? 'text-green-300 bg-green-500/20' :
              compressionMessage.type === 'error' ? 'text-red-300 bg-red-500/20' :
              'text-blue-300 bg-blue-500/20'
            }`}>
              {compressionMessage.type === 'success' && (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              )}
              {compressionMessage.type === 'error' && (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
              )}
              {compressionMessage.type === 'info' && (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
              )}
              <span>{compressionMessage.text}</span>
            </div>
          )}
        </div>
      )}

      {/* Collapsible Zoom Controls */}
      {showZoomControls && (
        <div ref={zoomControlsRef} className="flex justify-end items-center p-2 border-b border-white/10 bg-black/20">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-white/60">Zoom:</span>
            <button
              onClick={() => setZoomLevel(Math.max(0.8, zoomLevel - 0.1))}
              className="p-1 rounded hover:bg-white/20 transition-colors text-white/60 hover:text-white"
              title="Zoom Out"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
            <span className="text-xs text-white/70 min-w-[3rem] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(Math.min(1.5, zoomLevel + 0.1))}
              className="p-1 rounded hover:bg-white/20 transition-colors text-white/60 hover:text-white"
              title="Zoom In"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="text-xs px-2 py-1 rounded hover:bg-white/20 transition-colors text-white/60 hover:text-white"
              title="Reset Zoom"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div 
        className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4"
        style={{ 
          fontSize: `${zoomLevel}rem`,
          transform: `scale(${Math.max(1, zoomLevel)})`,
          transformOrigin: 'top left',
          width: zoomLevel > 1 ? `${100 / zoomLevel}%` : '100%'
        }}
      >
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
                  onClick={() => copyToClipboard(message.content, message.id)}
                  className={`absolute top-2 right-2 transition-opacity p-1 rounded bg-white/20 hover:bg-white/30 ${
                    copiedMessageId === message.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                  title="Copy message"
                >
                  {copiedMessageId === message.id ? (
                    <span className="text-xs text-green-400 font-medium whitespace-nowrap">Copied!</span>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                      <path d="M6 3a2 2 0 00-2 2v6h2V5h8v6h2V5a2 2 0 00-2-2H6zM4 9a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2v-6a2 2 0 00-2-2H4z" />
                    </svg>
                  )}
                </button>

                {/* Show image if present */}
                {message.imagePath && (
                  <div className="mb-3">
                    <img
                      src={`file://${message.imagePath}`}
                      alt="Captured screen"
                      className="max-w-full h-auto rounded border cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ maxHeight: '120px', maxWidth: '200px' }}
                      title="Click to view full size"
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
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-yellow-200">
                Screenshot added to current chat
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onMoveToNewChat}
                className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
              >
                Move to New Chat
              </button>
              <button
                onClick={() => onImageRemoved?.()}
                className="p-1 text-yellow-300 hover:text-white transition-colors"
                title="Close"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
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
              onClick={editImage}
              className="absolute -top-2 -right-10 w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center text-xs transition-colors"
              title="Edit image"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
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
              className="chat-input resize-y"
              disabled={isLoading}
              style={{ minHeight: '50px', maxHeight: '200px' }}
            />
          </div>

          {/* File upload and clipboard buttons */}
          <div className="flex flex-col space-y-1">
            <button
              type="button"
              onClick={openFileDialog}
              className="glass-button p-2"
              title="Upload image from file"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="glass-button p-2"
              title="Paste image from clipboard"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
            </button>
          </div>
          
          <button
            type="submit"
            disabled={(!inputText.trim() && !currentImage) || isLoading || !currentChat}
            className="glass-button disabled:opacity-50 disabled:cursor-not-allowed self-end"
            title={currentImage && !inputText.trim() ? "Send screenshot" : "Send message"}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        <div className="mt-2 text-xs text-white/50 text-center">
          Press Shift+Enter for new line • Enter to send • Ctrl+V to paste images • Images can be sent without text
        </div>
      </div>

      {/* Image Editor Modal */}
      {showImageEditor && currentImage && (
        <ImageCanvas
          imagePath={currentImage}
          onSave={handleSaveEditedImage}
          onClose={handleCloseImageEditor}
        />
      )}
    </div>
  );
};

export default ChatInterface;
