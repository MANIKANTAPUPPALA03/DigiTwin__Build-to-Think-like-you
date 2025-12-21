import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Minimize2 } from 'lucide-react';
import { initialMessages, getRandomResponse, type Message } from '../data/messages';

interface FloatingAssistantProps {
  isDark: boolean;
}

const FloatingAssistant: React.FC<FloatingAssistantProps> = ({ isDark }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');

    // Mock bot response using centralized responses
    setTimeout(() => {
      const newBotMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getRandomResponse(),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newBotMessage]);
    }, 1000);
  };

  // Close chat on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('.assistant-container')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end assistant-container">
      {/* Chat Window */}
      {isOpen && (
        <div className={`mb-4 w-80 sm:w-96 rounded-2xl shadow-2xl flex flex-col transition-all overflow-hidden border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`} style={{ height: '500px' }}>
          {/* Header */}
          <div className={`p-4 bg-gradient-to-r ${isDark ? 'from-cyan-600 to-purple-600' : 'from-blue-600 to-cyan-600'} flex items-center justify-between shrink-0`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">DigiTwin Assistant</h3>
                <span className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                  </span>
                  <span className="text-xs text-blue-100 font-medium">Online</span>
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-blue-100 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Minimize2 size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    message.sender === 'user' 
                      ? `${isDark ? 'bg-purple-600' : 'bg-blue-600'} text-white rounded-tr-sm` 
                      : (isDark ? 'bg-slate-800 text-slate-200 rounded-tl-sm' : 'bg-white text-slate-700 shadow-sm rounded-tl-sm')
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className={`p-3 border-t ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
            <form 
              onSubmit={handleSendMessage}
              className={`flex items-center gap-2 p-1.5 rounded-xl border ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask anything..."
                className={`flex-1 px-3 py-1.5 bg-transparent border-none focus:outline-none text-sm ${isDark ? 'text-slate-200 placeholder-slate-500' : 'text-slate-700 placeholder-slate-400'}`}
              />
              <button 
                type="submit"
                disabled={!inputValue.trim()}
                className={`p-2 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                  isDark ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative flex items-center justify-center w-14 h-14 bg-gradient-to-br ${isDark ? 'from-cyan-600 to-purple-600' : 'from-blue-600 to-cyan-600'} text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 ${isDark ? 'focus:ring-purple-500/30' : 'focus:ring-blue-500/30'}`}
      >
        <span className={`absolute transition-all duration-300 ${isOpen ? 'rotate-90 opacity-0 scale-50' : 'rotate-0 opacity-100 scale-100'}`}>
          <MessageSquare size={24} fill="currentColor" className="text-white" />
        </span>
        <span className={`absolute transition-all duration-300 ${isOpen ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-50'}`}>
          <X size={24} />
        </span>
        
        {/* Notification Badge if closed */}
        {!isOpen && (
          <span className="absolute top-0 right-0 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white dark:border-slate-900"></span>
          </span>
        )}
      </button>
    </div>
  );
};

export default FloatingAssistant;
