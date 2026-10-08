import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Bot, 
  Send, 
  Sparkles, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  Building2, 
  Stethoscope, 
  PhoneCall, 
  Plus, 
  MessageSquare,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { chatAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

const ChatPage = ({ onOpenBooking }) => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const { isAuthenticated, user } = useAuth();

  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      content: (
        "👋 **Welcome to AuraCare Health Virtual Concierge!**\n\n" +
        "I am your dedicated digital healthcare assistant. I can assist you with:\n" +
        "• **Booking, rescheduling, or checking appointments**\n" +
        "• **Information on medical departments and specialist doctors**\n" +
        "• **Hospital visiting hours, parking, and campus locations**\n" +
        "• **Accepted insurance providers and diagnostic services**\n\n" +
        "How may I assist you with your healthcare journey today?"
      ),
      suggested_actions: [
        "Book an appointment",
        "List of departments & doctors",
        "Visiting hours & location",
        "What insurance do you accept?",
        "24/7 Emergency & Ambulance services"
      ],
      is_fallback: true
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat sessions if authenticated
  useEffect(() => {
    const loadSessions = async () => {
      if (isAuthenticated) {
        try {
          const res = await chatAPI.getSessions();
          setSessions(res.data);
        } catch (err) {
          console.error("Error loading chat sessions:", err);
        }
      }
    };
    loadSessions();
  }, [isAuthenticated]);

  // If initial query from URL param, trigger it
  useEffect(() => {
    if (initialQuery) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    if (text.toLowerCase() === 'book an appointment' || text.toLowerCase() === 'book an appointment now') {
      if (onOpenBooking) {
        onOpenBooking();
        return;
      }
    }

    const newMsgs = [...messages, { sender: 'user', content: text }];
    setMessages(newMsgs);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await chatAPI.sendQuery({
        message: text,
        session_id: currentSessionId
      });

      setCurrentSessionId(res.data.session_id);
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

  const startNewSession = () => {
    setCurrentSessionId(null);
    setMessages([
      {
        sender: 'assistant',
        content: "New consultation thread started. How can I help you regarding AuraCare services, doctors, or appointments today?",
        suggested_actions: [
          "Book an appointment",
          "Visiting hours & location",
          "Our specialist doctors",
          "Accepted insurance plans"
        ]
      }
    ]);
  };

  const loadSessionHistory = async (sessId) => {
    try {
      setLoading(true);
      const res = await chatAPI.getSession(sessId);
      setCurrentSessionId(sessId);
      setMessages(res.data.messages);
    } catch (err) {
      console.error("Error loading session history:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderFormattedContent = (content) => {
    if (!content) return null;
    const lines = content.split('\n');
    return lines.map((line, idx) => {
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
          <div key={idx} className="p-3 my-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            <span dangerouslySetInnerHTML={{ 
              __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
            }} />
          </div>
        );
      }

      return (
        <p key={idx} className="text-xs sm:text-sm my-1 leading-relaxed">
          <span dangerouslySetInnerHTML={{ 
            __html: formattedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
          }} />
        </p>
      );
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in h-[calc(100vh-6rem)] flex flex-col">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-4 sm:p-5 flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-400 text-white flex items-center justify-center shadow-md">
            <Bot className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-slate-900 font-heading">
                AuraCare Virtual AI Concierge
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-bold border border-teal-200">
                Hospital AI Active
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Institutional intelligence regarding hospital doctors, schedules, locations, and appointment bookings.
            </p>
          </div>
        </div>

        <button
          onClick={startNewSession}
          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> New Conversation
        </button>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* Left Sessions Sidebar (Desktop) */}
        {isAuthenticated && sessions.length > 0 && (
          <div className="hidden md:block w-72 border-r border-slate-100 bg-slate-50/50 p-4 overflow-y-auto shrink-0 space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block px-2 mb-2">
              Previous Inquiries
            </span>
            {sessions.map((sess) => (
              <button
                key={sess.id}
                onClick={() => loadSessionHistory(sess.id)}
                className={`w-full p-2.5 rounded-xl text-left text-xs font-medium transition-all flex items-center gap-2.5 ${
                  currentSessionId === sess.id
                    ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{sess.title}</span>
              </button>
            ))}
          </div>
        )}

        {/* Right Chat Column */}
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          {/* Emergency Notice */}
          <div className="bg-amber-50/90 border-b border-amber-200/60 px-5 py-2.5 flex items-center gap-2 text-xs text-amber-900 leading-snug shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Emergency Notice:</strong> AuraCare AI provides institutional hospital guidance and scheduling only. 
              In case of severe medical emergencies, call 911 or visit our Level-1 Emergency Room immediately.
            </span>
          </div>

          {/* Messages Thread */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/30">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div className="flex items-end gap-3 max-w-[85%]">
                  {msg.sender === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center shrink-0 mb-1 shadow-2xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`p-4 rounded-3xl shadow-xs ${
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
                  <div className="mt-3 ml-11 flex flex-wrap gap-2">
                    {msg.suggested_actions.map((action, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => handleSendMessage(action)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-full bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200 hover:border-teal-400 shadow-2xs transition-all flex items-center gap-1 active:scale-95"
                      >
                        {action === 'Book an appointment' ? (
                          <Calendar className="w-3.5 h-3.5 text-teal-600" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs ml-11">
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1 font-medium">Aura is consulting hospital records...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Buttons Bar */}
          <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
            <span className="text-slate-400 font-bold uppercase text-[10px] shrink-0">Popular:</span>
            <button
              onClick={() => {
                if (onOpenBooking) onOpenBooking();
                else handleSendMessage("Book an appointment");
              }}
              className="px-3 py-1.5 rounded-xl bg-teal-50 text-teal-700 font-bold hover:bg-teal-100 shrink-0 flex items-center gap-1"
            >
              <Calendar className="w-3.5 h-3.5" /> Book Consultation
            </button>
            <button
              onClick={() => handleSendMessage("What are the visiting hours?")}
              className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 shrink-0 flex items-center gap-1"
            >
              <Clock className="w-3.5 h-3.5" /> Visiting Hours
            </button>
            <button
              onClick={() => handleSendMessage("Who is the cardiologist?")}
              className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 shrink-0 flex items-center gap-1"
            >
              <Stethoscope className="w-3.5 h-3.5" /> Cardiology Doctor
            </button>
            <button
              onClick={() => handleSendMessage("What health insurance do you take?")}
              className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 shrink-0 flex items-center gap-1"
            >
              Insurance Accepted
            </button>
          </div>

          {/* Input Form */}
          <div className="p-4 bg-white border-t border-slate-200 shrink-0">
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type your question (e.g. 'How do I book?', 'Where is neurology?', 'Doctor fees')..."
                className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none py-1"
              />
              <button
                disabled={!inputMessage.trim() || loading}
                onClick={() => handleSendMessage()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-transform active:scale-95 shrink-0"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[10px] text-center text-slate-400 mt-2">
              AuraCare Health Institutional AI System • Live Hospital Database Connected
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
