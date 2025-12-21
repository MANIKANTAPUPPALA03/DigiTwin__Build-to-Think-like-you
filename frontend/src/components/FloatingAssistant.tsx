import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const FloatingAssistant = ({ isDark }: { isDark: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your DigiTwin assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(inputValue),
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const getAIResponse = (input: string): string => {
    const lower = input.toLowerCase();

    if (lower.includes('hello') || lower.includes('hi')) {
      return "Hello! How can I assist you with your tasks and emails today?";
    }
    if (lower.includes('task') || lower.includes('todo')) {
      return "You can create tasks using the 'New Event' button in the Calendar. I'll help you organize them by priority!";
    }
    if (lower.includes('email')) {
      return "I can help you manage your emails. Sign in with Google to let me scan your inbox and create tasks automatically!";
    }
    if (lower.includes('schedule') || lower.includes('meeting')) {
      return "I can detect meetings in your emails and automatically schedule them. Just make sure you're signed in with Google OAuth!";
    }
    if (lower.includes('help')) {
      return "I can help you with:\n• Managing tasks and emails\n• Scheduling meetings\n• Organizing by priority\n• Tracking productivity\nWhat would you like to know more about?";
    }

    return "I understand you're asking about: " + input + ". I'm here to help you manage your tasks and emails efficiently. Could you be more specific?";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className={`p-4 rounded-full shadow-2xl transition-all hover:scale-110 ${isDark
              ? 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:brightness-110'
              : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:brightness-110'
            }`}
        >
          <MessageCircle className="text-white" size={28} />
        </button>
      ) : (
        <div className={`w-96 h-[600px] rounded-2xl shadow-2xl flex flex-col ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-200'
          }`}>
          {/* Header */}
          <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-slate-700 bg-gradient-to-r from-purple-600 to-cyan-600' : 'bg-gradient-to-r from-blue-600 to-cyan-600'
            }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white">DigiTwin AI</h3>
                <p className="text-xs text-white/80">Always here to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="text-white" size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${msg.isUser
                      ? isDark
                        ? 'bg-purple-600 text-white'
                        : 'bg-blue-600 text-white'
                      : isDark
                        ? 'bg-slate-800 text-slate-100'
                        : 'bg-slate-100 text-slate-900'
                    }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.isUser ? 'text-white/70' : isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className={`p-3 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'
                  }`}>
                  <div className="flex gap-1">
                    <div className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-slate-400' : 'bg-slate-600'
                      }`} style={{ animationDelay: '0ms' }} />
                    <div className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-slate-400' : 'bg-slate-600'
                      }`} style={{ animationDelay: '150ms' }} />
                    <div className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-slate-400' : 'bg-slate-600'
                      }`} style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={`p-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'
            }`}>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className={`flex-1 px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 ${isDark
                    ? 'bg-slate-800 border-slate-700 text-white focus:ring-purple-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-500'
                  }`}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className={`p-2 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isDark
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                  }`}
              >
                <Send className="text-white" size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingAssistant;
