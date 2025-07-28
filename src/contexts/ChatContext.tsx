import { createContext, useContext, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, X, Send, Minimize2, RotateCcw } from 'lucide-react';
import { callChatbotAPI } from '@/api/apiUtils';
import { useAuth } from '@/hooks/useAuth';
import { FormattedMessage } from '@/components/FormattedMessage';
import '@/styles/chat.css';

type ChatMessage = {
  sender: 'user' | 'bot';
  content: string;
  timestamp: Date;
  id?: string; // Add unique ID for messages
};

interface ChatContextType {
  isChatOpen: boolean;
  toggleChat: () => void;
  isMinimized: boolean;
  toggleMinimize: () => void;
  clearChatHistory: () => void; // Add method to clear history
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};

// Helper functions for localStorage management
const CHAT_STORAGE_KEY = 'colkimi_chat_history';
const CHAT_STATE_KEY = 'colkimi_chat_state';

const saveChatToStorage = (messages: ChatMessage[], userId?: number) => {
  if (!userId) return;
  
  try {
    const chatData = {
      messages: messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString(), // Convert Date to string for storage
      })),
      lastUpdated: new Date().toISOString(),
      userId,
    };
    localStorage.setItem(`${CHAT_STORAGE_KEY}_${userId}`, JSON.stringify(chatData));
  } catch (error) {
    console.error('Failed to save chat history:', error);
  }
};

const loadChatFromStorage = (userId?: number): ChatMessage[] => {
  if (!userId) return getDefaultMessages();
  
  try {
    const stored = localStorage.getItem(`${CHAT_STORAGE_KEY}_${userId}`);
    if (!stored) return getDefaultMessages();
    
    const chatData = JSON.parse(stored);
    
    // Check if the stored data is recent (within 7 days)
    const lastUpdated = new Date(chatData.lastUpdated);
    const daysSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceUpdate > 7) {
      // Clear old chat history
      localStorage.removeItem(`${CHAT_STORAGE_KEY}_${userId}`);
      return getDefaultMessages();
    }
    
    // Convert timestamp strings back to Date objects
    return chatData.messages.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));
  } catch (error) {
    console.error('Failed to load chat history:', error);
    return getDefaultMessages();
  }
};

const saveChatState = (isOpen: boolean, isMinimized: boolean) => {
  try {
    localStorage.setItem(CHAT_STATE_KEY, JSON.stringify({ isOpen, isMinimized }));
  } catch (error) {
    console.error('Failed to save chat state:', error);
  }
};

const loadChatState = () => {
  try {
    const stored = localStorage.getItem(CHAT_STATE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load chat state:', error);
  }
  return { isOpen: false, isMinimized: false };
};

const getDefaultMessages = (): ChatMessage[] => [
  {
    id: 'welcome-message',
    sender: 'bot',
    content: `# Welcome to RideEasy! 🚗✨

Hello! I'm your virtual assistant. I'm here to help you with:

• **Booking rides** - [Book a Ride](/create)
• **Managing your account** - [Dashboard](/dashboard)  
• **Getting support** - [Help & Support](/help)
• **Payment issues** - [Payment Methods](/payment-methods)

## Quick Commands:
- Type "book ride" to start booking
- Type "my bookings" to see your rides
- Type "help" for more assistance

How can I help you today? 😊`,
    timestamp: new Date()
  }
];

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize chat state and history when component mounts or user changes
  useEffect(() => {
    if (user?.userId) {
      // Load chat history for the current user
      const savedMessages = loadChatFromStorage(user.userId);
      setChatMessages(savedMessages);
      
      // Load chat UI state
      const savedState = loadChatState();
      setIsChatOpen(savedState.isOpen);
      setIsMinimized(savedState.isMinimized);
      
      setIsInitialized(true);
    } else {
      // User not logged in, use default messages
      setChatMessages(getDefaultMessages());
      setIsChatOpen(false);
      setIsMinimized(false);
      setIsInitialized(true);
    }
  }, [user?.userId]);

  // Save chat history whenever messages change (but only after initialization)
  useEffect(() => {
    if (isInitialized && user?.userId && chatMessages.length > 0) {
      saveChatToStorage(chatMessages, user.userId);
    }
  }, [chatMessages, user?.userId, isInitialized]);

  // Save chat state whenever it changes
  useEffect(() => {
    if (isInitialized) {
      saveChatState(isChatOpen, isMinimized);
    }
  }, [isChatOpen, isMinimized, isInitialized]);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) {
      setUnreadCount(0);
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const clearChatHistory = () => {
    if (user?.userId) {
      localStorage.removeItem(`${CHAT_STORAGE_KEY}_${user.userId}`);
    }
    setChatMessages(getDefaultMessages());
    setUnreadCount(0);
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    if (isChatOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isChatOpen, isMinimized]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;

    if (!user?.userId) {
      alert('You must be logged in to chat with the assistant.');
      return;
    }

    const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const userMessage: ChatMessage = {
      id: messageId,
      sender: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const contextMessages = chatMessages
        .filter(msg => msg.content.trim() !== '')
        .slice(-10) // Only send last 10 messages for context to avoid token limits
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content,
          name: msg.sender === 'user' ? 'user' : 'bot'
        }));

      const response = await callChatbotAPI(user.userId, inputMessage, contextMessages);
      
      const botMessageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const botMessage: ChatMessage = {
        id: botMessageId,
        sender: 'bot',
        content: response?.response || response || "Sorry, I didn't receive a response.",
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, botMessage]);
      
      // Add unread count if chat is minimized or closed
      if (isMinimized || !isChatOpen) {
        setUnreadCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const errorMessage: ChatMessage = {
        id: errorMessageId,
        sender: 'bot',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Don't render until initialized to prevent flashing
  if (!isInitialized) {
    return <>{children}</>;
  }

  return (
    <ChatContext.Provider value={{ isChatOpen, toggleChat, isMinimized, toggleMinimize, clearChatHistory }}>
      {children}

      {/* Chat Interface */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`fixed bottom-20 right-4 w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border dark:border-slate-600 overflow-hidden z-[9998] ${
              isMinimized ? 'h-16' : 'h-[32rem]'
            }`}
            style={{ transition: 'height 0.3s ease' }}
          >
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <img 
                    src="/bot.png" 
                    alt="RideEasy" 
                    className="w-8 h-8 rounded-full mr-3 border-2 border-white/30" 
                  />
                  <div>
                    <h3 className="font-bold">RideEasy Assistant</h3>
                    <p className="text-xs opacity-80">
                      {chatMessages.length > 1 ? `${chatMessages.length - 1} messages` : 'Online • Ready to help'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {/* Clear Chat History Button */}
                  <button
                    onClick={clearChatHistory}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                    title="Clear chat history"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={toggleMinimize}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <Minimize2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={toggleChat}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Chat Content - Hidden when minimized */}
            {!isMinimized && (
              <>
                {/* Chat Messages */}
                <div className="h-80 overflow-y-auto p-4 bg-gray-50 dark:bg-slate-900">
                  {chatMessages.map((msg, idx) => (
                    <motion.div
                      key={msg.id || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.sender === 'bot' && (
                        <img 
                          src="/bot.png" 
                          alt="Bot" 
                          className="w-8 h-8 rounded-full mr-2 self-start mt-1 flex-shrink-0" 
                        />
                      )}
                      <div 
                        className={`rounded-2xl px-4 py-3 max-w-xs shadow-sm ${
                          msg.sender === 'user' 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                            : 'bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 border dark:border-slate-600'
                        }`}
                      >
                        <FormattedMessage 
                          content={msg.content} 
                          sender={msg.sender}
                          className="text-sm"
                        />
                        <div className={`text-xs mt-2 ${
                          msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {msg.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start mb-4">
                      <img src="/bot.png" alt="Bot" className="w-8 h-8 rounded-full mr-2 flex-shrink-0" />
                      <div className="bg-white dark:bg-slate-700 rounded-2xl px-4 py-2 border dark:border-slate-600">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-4 bg-white dark:bg-slate-800 border-t dark:border-slate-600">
                  {user?.userId ? (
                    <div className="flex space-x-2">
                      <Textarea
                        ref={inputRef}
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message..."
                        rows={2}
                        disabled={isLoading}
                        className="flex-1 border-gray-300 dark:border-slate-600 dark:bg-slate-700 rounded-xl resize-none"
                      />
                      <Button 
                        onClick={handleSendMessage} 
                        disabled={isLoading || !inputMessage.trim()}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl px-4"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Please log in to chat with our assistant
                      </p>
                      <Button 
                        onClick={() => window.location.href = '/login'}
                        className="bg-blue-600 hover:bg-blue-700"
                        size="sm"
                      >
                        Login
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleChat}
        className="fixed bottom-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-2xl z-[9999] transition-all duration-300"
      >
        <div className="relative">
          <MessageCircle className="w-6 h-6" />
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.div>
          )}
        </div>
      </motion.button>
    </ChatContext.Provider>
  );
}