import React, { useState } from 'react';
import { Chat } from '@/shared/types';

interface ChatHistoryProps {
  chats: Chat[];
  currentChat: Chat | null;
  onCreateChat: (title?: string) => Promise<Chat>;
  onSwitchChat: (chat: Chat) => void;
  onDeleteChat: (chatId: number) => void;
  onUpdateChatTitle: (chatId: number, newTitle: string) => void;
  onClose: () => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({
  chats,
  currentChat,
  onCreateChat,
  onSwitchChat,
  onDeleteChat,
  onUpdateChatTitle,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingChatId, setEditingChatId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateChat = async () => {
    setIsCreating(true);
    try {
      await onCreateChat();
    } catch (error) {
      console.error('Failed to create chat:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else {
      return 'Just now';
    }
  };

  const handleStartEdit = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };

  const handleSaveEdit = (chatId: number) => {
    if (editTitle.trim()) {
      onUpdateChatTitle(chatId, editTitle.trim());
    }
    setEditingChatId(null);
    setEditTitle('');
  };

  const handleCancelEdit = () => {
    setEditingChatId(null);
    setEditTitle('');
  };

  const handleKeyPress = (e: React.KeyboardEvent, chatId: number) => {
    if (e.key === 'Enter') {
      handleSaveEdit(chatId);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div className="h-full flex flex-col bg-black/20 backdrop-blur-lg border-l border-white/20">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold">Chat History</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search chats..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {/* New Chat Button */}
        <button
          onClick={handleCreateChat}
          disabled={isCreating}
          className="w-full mt-3 p-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
        >
          {isCreating ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span>New Chat</span>
            </>
          )}
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filteredChats.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-white/40 text-4xl mb-4">💬</div>
            <p className="text-white/60 text-sm">
              {searchTerm ? 'No matching chats' : 'No chats yet'}
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`
                  group relative p-3 rounded-lg cursor-pointer transition-all duration-200
                  ${currentChat?.id === chat.id
                    ? 'bg-blue-500/20 border border-blue-400/30'
                    : 'hover:bg-white/10'
                  }
                `}
                onClick={() => onSwitchChat(chat)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {editingChatId === chat.id ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, chat.id)}
                        onBlur={() => handleSaveEdit(chat.id)}
                        className="w-full px-2 py-1 text-sm text-white bg-white/10 border border-white/20 rounded focus:outline-none focus:border-blue-400"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div>
                        <h3 className="text-white font-medium text-sm truncate">
                          {chat.title}
                        </h3>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-white/50 text-xs">
                            {formatDate(chat.updatedAt)}
                          </p>
                          {/* Debug: Show cost info even if zero */}
                          <div className="flex items-center space-x-2 text-xs">
                            {chat.totalCost !== undefined ? (
                              <div className="flex items-center text-green-400" title={`Total spent: $${chat.totalCost.toFixed(4)}`}>
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                                </svg>
                                ${chat.totalCost.toFixed(4)}
                              </div>
                            ) : (
                              <span className="text-white/30 text-xs" title="No cost tracking data">
                                No cost data
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-1">
                    {/* Edit Button */}
                    {editingChatId !== chat.id && (
                      <button
                        onClick={(e) => handleStartEdit(chat, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-white/40 hover:text-blue-400 transition-all duration-200"
                        title="Rename chat"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                    )}

                    {/* Save/Cancel Buttons for Edit Mode */}
                    {editingChatId === chat.id && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveEdit(chat.id);
                          }}
                          className="p-1 text-white/60 hover:text-green-400 transition-all duration-200"
                          title="Save"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelEdit();
                          }}
                          className="p-1 text-white/60 hover:text-red-400 transition-all duration-200"
                          title="Cancel"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </>
                    )}

                    {/* Delete Button */}
                    {editingChatId !== chat.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChat(chat.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-white/40 hover:text-red-400 transition-all duration-200"
                        title="Delete chat"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Active indicator */}
                {currentChat?.id === chat.id && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-400 rounded-r"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="text-center">
          <p className="text-white/40 text-xs">
            {chats.length} chat{chats.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;
