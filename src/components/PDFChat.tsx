import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader, FileText, Copy, Download, Bookmark, Share2, ThumbsUp, ThumbsDown, RotateCcw, MessageSquare } from 'lucide-react';
import { PDFChatManager, ChatMessage } from '../utils/pdfChat';

interface MessageFeedback {
  messageId: number;
  helpful: boolean;
}

interface PDFChatProps {
  pdfContent: string;
  pageMap: Map<number, string>;
  onError?: (error: string) => void;
  settings?: {
    responseLength: 'concise' | 'balanced' | 'detailed';
    tone: 'technical' | 'simple';
    format: 'structured' | 'conversational';
    includePageRefs: boolean;
  };
}

const PDFChat: React.FC<PDFChatProps> = ({ pdfContent, pageMap, onError, settings }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<MessageFeedback[]>([]);
  const [savedMessages, setSavedMessages] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatManager, setChatManager] = useState<PDFChatManager | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);

  useEffect(() => {
    if (pdfContent && pageMap) {
      try {
        const manager = new PDFChatManager(pdfContent, pageMap);
        setChatManager(manager);
      } catch (error) {
        console.error('Failed to initialize chat manager:', error);
        if (onError) {
          onError('Failed to initialize chat system');
        }
      }
    }
  }, [pdfContent, pageMap, onError]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!chatManager) {
      if (onError) onError('Chat system is not initialized');
      return;
    }

    if (!input.trim()) {
      if (onError) onError('Please enter a message');
      return;
    }

    const userInput = input.trim();
    setInput('');
    setIsProcessing(true);

    try {
      const response = await chatManager.sendMessage(userInput, { settings });
      setMessages(chatManager.getConversationHistory());
      scrollToBottom();
    } catch (error) {
      console.error('Chat error:', error);
      if (onError) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Failed to process message';
        onError(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMessageFeedback = (messageId: number, isHelpful: boolean) => {
    setFeedback(prev => [...prev, { messageId, helpful: isHelpful }]);
  };

  const toggleSaveMessage = (messageId: number) => {
    setSavedMessages(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const copyMessage = async (messageId: number, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const downloadConversation = () => {
    const text = messages
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'conversation.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearConversation = () => {
    if (window.confirm('Are you sure you want to clear the conversation?')) {
      setMessages([]);
      chatManager?.clearHistory();
    }
  };

  const formatMessage = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\[Page (\d+)\]/g, '<span class="text-indigo-600 dark:text-indigo-400">[Page $1]</span>');
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="flex items-center">
          <MessageSquare className="w-5 h-5 text-indigo-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Chat</h3>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={downloadConversation}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            title="Download conversation"
          >
            <Download size={18} />
          </button>
          <button
            onClick={clearConversation}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            title="Clear conversation"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div
        id="chat-container"
        className="flex-grow overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <FileText size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">Start a conversation</p>
            <p className="text-sm">Type a message to begin</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`group flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                } relative`}
              >
                <div 
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                />
                {/* Message Actions */}
                <div className="absolute -right-12 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col space-y-2">
                  <button
                    onClick={() => copyMessage(index, message.content)}
                    className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    title={copiedMessageId === index ? 'Copied!' : 'Copy message'}
                  >
                    <Copy size={14} className={copiedMessageId === index ? 'text-green-500' : ''} />
                  </button>
                  <button
                    onClick={() => toggleSaveMessage(index)}
                    className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    title={savedMessages.includes(index) ? 'Unsave message' : 'Save message'}
                  >
                    <Bookmark 
                      size={14} 
                      className={savedMessages.includes(index) ? 'text-yellow-500' : ''} 
                      fill={savedMessages.includes(index) ? 'currentColor' : 'none'}
                    />
                  </button>
                  <button
                    onClick={() => handleMessageFeedback(index, true)}
                    className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    title="Mark as helpful"
                  >
                    <ThumbsUp 
                      size={14} 
                      className={feedback.some(f => f.messageId === index && f.helpful) ? 'text-green-500' : ''} 
                    />
                  </button>
                  <button
                    onClick={() => handleMessageFeedback(index, false)}
                    className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    title="Mark as not helpful"
                  >
                    <ThumbsDown 
                      size={14} 
                      className={feedback.some(f => f.messageId === index && !f.helpful) ? 'text-red-500' : ''} 
                    />
                  </button>
                </div>
                {settings?.includePageRefs && message.metadata?.pageReferences && message.metadata.pageReferences.length > 0 && (
                  <div className="mt-2 text-sm opacity-75">
                    Referenced pages: {message.metadata.pageReferences.join(', ')}
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {showSuggestions && suggestedQuestions.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Suggested Questions
            </span>
            <button
              onClick={() => setShowSuggestions(false)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => {
                  setInput(question);
                  inputRef.current?.focus();
                }}
                className="px-3 py-1 text-sm bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-800/50 transition-colors duration-200"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-4">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            disabled={isProcessing}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={isProcessing || !input.trim()}
            className={`px-4 py-2 rounded-lg flex items-center justify-center transition-colors duration-200 ${
              isProcessing || !input.trim()
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isProcessing ? <Loader className="animate-spin" /> : <Send />}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PDFChat;