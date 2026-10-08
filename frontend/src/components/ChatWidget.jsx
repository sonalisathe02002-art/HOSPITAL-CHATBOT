import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  AlertTriangle, 
  Maximize2, 
  Calendar, 
  PhoneCall, 
  Clock, 
  Building2,
  Stethoscope,
  ChevronRight
} from 'lucide-react';
import { chatAPI } from '../api/client';
import { useNavigate } from 'react-router-dom';

const ChatWidget = ({ onOpenBooking }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      content: (
        "👋 **Welcome to AuraCare Health Virtual Concierge!**\n\n" +
        "I am your 24/7 institutional assistant. How can I help you today?\n" +
        "• Book, reschedule, or inquire about appointments\n" +
        "• Learn about our specialist doctors and departments\n" +
        "• Check hospital visiting hours, parking, and insurance"
      ),
      suggested_actions: [
        "Book an appointment",
        "Visiting hours & location",
        "Our specialist doctors",
        "Accepted insurance plans"
      ],
      is_fallback: true
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    // Check if the user clicked quick booking action
    if (text.toLowerCase() === 'book an appointment' || text.toLowerCase() === 'book an appointment now') {
      if (onOpenBooking) {
        onOpenBooking();
        return;
      }
    }

    // Add user message to UI
    const newMsgList = [...messages, { sender: 'user', content: text }];
    setMessages(newMsgList);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await chatAPI.sendQuery({
        message: text,
        session_id: sessionId
      });

      setSessionId(res.data.session_id);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          content: res.data.response,
          suggested_actions: res.data.suggested_actions,
          is_fallback: res.data.is_fallback,
          disclaimer: res.data.disclaimer
        }
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          content: "I apologize, but our concierge service is momentarily updating. Please feel free to call our 24/7 general desk at +1 (555) 019-2834 or visit our departments directory.",
          suggested_actions: ["Visiting hours", "Call general desk", "Book an appointment"]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Simple Markdown text formatter for AI responses
  const renderFormattedContent = (content) => {
    if (!content) return null;
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Bold formatting
      let formattedLine = line;
      
      if (line.startsWith('• ') || line.startsWith('- ')) {
        const itemText = line.substring(2);
        return (
          <li key={idx} className="ml-4 list-disc text-xs my-0.5 leading-relaxed">
            <span dangerouslySetInnerHTML={{ 
              __html: itemText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
            }} />
          </li>
        );
      }
      
      if (line.startsWith('🚨') || line.startsWith('⚠️')) {
        return (
          <div key={idx} className="p-2.5 my-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            <span dangerouslySetInnerHTML={{ 
              __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
            }} />
          </div>
        );
      }

      return (
        <p key={idx} className="text-xs my-1 leading-relaxed">
          <span dangerouslySetInnerHTML={{ 
            __html: formattedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
          }} />
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 group flex items-center gap-3 p-2 pr-4 rounded-full bg-slate-900 text-white shadow-2xl border border-teal-500/40 hover:border-teal-400 hover:scale-105 transition-all active:scale-95 glow-teal"
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center text-white shadow-md relative">
            <Bot className="w-6 h-6 stroke-[2.2]" />
            <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full animate-pulse" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold text-white flex items-center gap-1">
              Ask Aura AI <Sparkles className="w-3 h-3 text-teal-400" />
            </p>
            <p className="text-[10px] text-teal-400 font-medium">24/7 Virtual Concierge</p>
          </div>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] h-[600px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-950 via-sky-950 to-teal-950 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center text-white shadow-md">
                <Bot className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm tracking-tight text-white font-heading">
                    Aura AI Concierge
                  </h3>
                  <span className="px-1.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[9px] font-bold border border-teal-500/40">
                    Live
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  AuraCare Health Virtual Specialist
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-300">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/chat');
                }}
                title="Full Page Mode"
                className="p-1.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Medical Notice Bar */}
          <div className="bg-amber-50/90 border-b border-amber-200/60 px-4 py-2 flex items-center gap-2 text-[10px] text-amber-900 leading-snug">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>
              <strong>Notice:</strong> For life-threatening emergencies, call 911 immediately. Aura AI provides institutional guidance and scheduling only.
            </span>
          </div>

          {/* Message Thread */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/60">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div className="flex items-end gap-2 max-w-[88%]">
                  {msg.sender === 'assistant' && (
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center shrink-0 mb-1 shadow-xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`p-3.5 rounded-2xl shadow-xs ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-teal-600 to-sky-600 text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                    }`}
                  >
                    {renderFormattedContent(msg.content)}
                  </div>
                </div>

                {/* Suggested Action Chips */}
                {msg.sender === 'assistant' && msg.suggested_actions?.length > 0 && (
                  <div className="mt-2.5 ml-9 flex flex-wrap gap-1.5">
                    {msg.suggested_actions.map((action, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => handleSendMessage(action)}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200 hover:border-teal-400 shadow-2xs transition-all flex items-center gap-1 active:scale-95"
                      >
                        {action === 'Book an appointment' ? (
                          <Calendar className="w-3 h-3 text-teal-600" />
                        ) : (
                          <ChevronRight className="w-3 h-3 text-slate-400" />
                        )}
                        {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs ml-9">
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] ml-1">Aura is consulting hospital records...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Buttons Ribbon */}
          <div className="px-3 py-1.5 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-[11px]">
            <span className="text-slate-400 font-bold uppercase text-[9px] shrink-0">Quick:</span>
            <button
              onClick={() => {
                if (onOpenBooking) onOpenBooking();
                else handleSendMessage("How do I book an appointment?");
              }}
              className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 font-bold hover:bg-teal-100 shrink-0 flex items-center gap-1"
            >
              <Calendar className="w-3 h-3" /> Book Appointment
            </button>
            <button
              onClick={() => handleSendMessage("What are the visiting hours?")}
              className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 shrink-0 flex items-center gap-1"
            >
              <Clock className="w-3 h-3" /> Visiting Hours
            </button>
            <button
              onClick={() => handleSendMessage("List of doctors and departments")}
              className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 shrink-0 flex items-center gap-1"
            >
              <Stethoscope className="w-3 h-3" /> Doctors
            </button>
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about doctors, appointments, parking..."
                className="flex-1 bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none py-1.5"
              />
              <button
                disabled={!inputMessage.trim() || loading}
                onClick={() => handleSendMessage()}
                className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed shadow-xs transition-transform active:scale-95 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[9px] text-center text-slate-400 mt-1.5">
              Powered by AuraCare Health AI & Knowledge System
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
