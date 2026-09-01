import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  X,
  Sparkles,
  Volume2,
  VolumeX,
  Shield,
  HelpCircle,
  RefreshCw,
  User,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Language, AppView } from '../types';
import { translations, languagesList } from '../i18n/translations';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onNavigate: (view: AppView) => void;
  onOpenSOS: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestedAction?: {
    label: string;
    view?: AppView;
    isSOS?: boolean;
  };
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  language,
  onNavigate,
  onOpenSOS,
}) => {
  const t = translations[language];
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: `Namaste! I am Rakshak AI Legal & Police Assistant. I can assist you with Indian legal procedures (BNS, BNSS, Cyber Crime 1930, Zero FIR, Traffic rules, Bail rights) in ${
        languagesList.find((l) => l.code === language)?.name || 'your language'
      }. How can I assist you right now?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    'How do I file a Zero FIR if police refuse?',
    'What should I do immediately if money lost in UPI fraud?',
    'What are my rights if stopped for traffic check or breathalyzer?',
    'Can a woman be arrested after sunset or before sunrise?',
    'What is the procedure to report a missing phone or person?',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSpeakText = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }
    }
  };

  const handleSend = async (queryText?: string) => {
    const text = (queryText || inputQuery).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      // Build history
      const history = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          language,
          conversationHistory: history,
        }),
      });

      const data = await res.json();
      const aiReply = data.response || 'I am currently processing your legal query. Please try again.';

      // Determine smart suggested action
      let suggestedAction: ChatMessage['suggestedAction'] = undefined;
      const lower = text.toLowerCase();
      if (lower.includes('emergency') || lower.includes('danger') || lower.includes('sos') || lower.includes('threat')) {
        suggestedAction = { label: 'Trigger 112 SOS Emergency', isSOS: true };
      } else if (lower.includes('report') || lower.includes('file') || lower.includes('fir') || lower.includes('theft') || lower.includes('fraud')) {
        suggestedAction = { label: 'Report Incident & File e-FIR', view: 'report' };
      } else if (lower.includes('station') || lower.includes('sho') || lower.includes('thana') || lower.includes('nearest')) {
        suggestedAction = { label: 'Find Nearest Police Station', view: 'stations' };
      } else if (lower.includes('missing') || lower.includes('lost')) {
        suggestedAction = { label: 'Search Missing / Lost Records', view: 'missing' };
      } else if (lower.includes('traffic') || lower.includes('challan')) {
        suggestedAction = { label: 'Open Traffic & Challan Portal', view: 'traffic' };
      }

      const aiMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'ai',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedAction,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      console.error('AI chat error:', e);
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 2),
          sender: 'ai',
          text: 'Under Indian legal code (BNS/BNSS), you have the right to free registration of your complaint (Zero FIR) and access to immediate legal aid via National Helpline 112 or 15100.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-hidden">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-purple-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 border-b border-purple-800/40 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  Rakshak AI Legal & Citizen Assistant
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-700">
                  Multilingual AI
                </span>
              </div>
              <p className="text-xs text-purple-200/70">
                Grounded in BNS, BNSS, Cyber Crime 1930 & Citizen Rights
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Message Scrollable View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 space-y-2 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none shadow-md'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* AI Speech Readout Button */}
                {msg.sender === 'ai' && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
                    <span>{msg.timestamp}</span>
                    <button
                      onClick={() => handleSpeakText(msg.text)}
                      className="hover:text-purple-300 flex items-center gap-1 text-[11px]"
                      title="Read aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Listen</span>
                    </button>
                  </div>
                )}

                {/* Suggested Action Pill */}
                {msg.suggestedAction && (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        onClose();
                        if (msg.suggestedAction?.isSOS) {
                          onOpenSOS();
                        } else if (msg.suggestedAction?.view) {
                          onNavigate(msg.suggestedAction.view);
                        }
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-purple-900/60 hover:bg-purple-800 border border-purple-500/50 text-purple-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>{msg.suggestedAction.label}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center text-xs text-purple-300">
              <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <span className="bg-slate-950 p-3 rounded-2xl border border-slate-800 animate-pulse">
                Analyzing legal provisions under Bharatiya Nyaya Sanhita...
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Chips */}
        <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/60 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-slate-500 font-bold shrink-0">Common Inquiries:</span>
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750 border border-slate-700 whitespace-nowrap transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything about legal rights, police procedures, FIR filing, or emergency..."
              className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              id="send-ai-message-btn"
              className="p-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
