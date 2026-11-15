import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { DocumentItem } from '../types';
import { 
  Bot, 
  Send, 
  FileText, 
  ShieldAlert, 
  Sparkles, 
  User as UserIcon,
  HelpCircle,
  AlertTriangle,
  RotateCcw,
  Languages
} from 'lucide-react';

interface ChatMessageUI {
  id?: number;
  sender: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export const ChatPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<number | undefined>(undefined);
  const [messages, setMessages] = useState<ChatMessageUI[]>([
    {
      sender: 'assistant',
      content: 'Hello! I am your MedEase AI Medical Document Assistant. I can help clarify prescription instructions, explain medical abbreviations (such as OD, BD, TDS, SOS), and break down complex clinical terminology from your uploaded records in English or Malayalam. How can I assist you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await api.get<DocumentItem[]>('/documents');
        setDocuments(res.data);
        if (res.data.length > 0) {
          setSelectedDocId(res.data[0].id);
        }
      } catch (err) {
        console.error('Failed to load documents for chat', err);
      }
    };
    fetchDocs();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isSending) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessageUI = { sender: 'user', content: textToSend, timestamp: time };
    setMessages((prev) => [...prev, userMsg]);
    if (!messageText) setInput('');
    setIsSending(true);

    try {
      const res = await api.post('/chat', {
        document_id: selectedDocId || null,
        content: textToSend,
        language: 'en',
      });
      const assistantMsg: ChatMessageUI = {
        sender: 'assistant',
        content: res.data.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          content: 'Sorry, I encountered an issue processing your request. Please check the document or try asking again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const sampleQuestions = [
    'What do abbreviations like BD, OD, and TDS mean?',
    'Explain the dosage and timing in this prescription',
    'TDS എന്നതിന്റെ അർത്ഥം എന്താണ്?',
    'What are the common precautions for my medicines?',
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Document Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#151515] p-5 rounded-3xl border border-[#262626] shadow-card-dark">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#202020] text-[#EF2929] flex items-center justify-center flex-shrink-0 shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">AI Medical Assistant</h1>
            <p className="text-xs text-neutral-400">Document-grounded clinical understanding & Q&A</p>
          </div>
        </div>

        {/* Document Selector */}
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-neutral-500 flex-shrink-0" />
          <select
            value={selectedDocId || ''}
            onChange={(e) => setSelectedDocId(e.target.value ? Number(e.target.value) : undefined)}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-[#2E2E2E] bg-[#202020] text-white focus:outline-none focus:border-[#EF2929] focus:ring-1 focus:ring-[#EF2929]"
          >
            <option value="" className="bg-[#202020] text-neutral-400">General Terminology (No Document)</option>
            {documents.map((doc) => (
              <option key={doc.id} value={doc.id} className="bg-[#202020] text-white">
                {doc.title || `Document #${doc.id}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clinical Disclaimer Notice */}
      <div className="p-3.5 rounded-2xl bg-[#1A1512] border border-amber-900/50 text-amber-200/90 text-xs flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Important Clinical Boundary:</strong> MedEase AI Assistant explains medical terminology and physician notes. It does NOT diagnose conditions, prescribe medications, or replace medical doctors. For emergencies, contact emergency services immediately.
        </p>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-[#151515] rounded-3xl border border-[#262626] shadow-card-dark flex flex-col h-[520px] overflow-hidden">
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-[#202020] text-[#EF2929] flex items-center justify-center flex-shrink-0 mt-1 border border-[#2A2A2A]">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-[#EF2929] to-[#DC2626] text-white rounded-br-none shadow-glow-red'
                    : 'bg-[#202020] text-neutral-200 rounded-bl-none border border-[#2C2C2C]'
                }`}
              >
                <p className="whitespace-pre-line">{msg.content}</p>
                {msg.timestamp && (
                  <span
                    className={`block text-[10px] mt-1.5 text-right ${
                      msg.sender === 'user' ? 'text-red-200' : 'text-neutral-500'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-[#252525] text-white flex items-center justify-center flex-shrink-0 mt-1 border border-[#333333]">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isSending && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#202020] text-[#EF2929] flex items-center justify-center flex-shrink-0 border border-[#2A2A2A]">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#202020] rounded-2xl rounded-bl-none px-4 py-3 border border-[#2C2C2C] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#EF2929] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#EF2929] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#EF2929] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompt Chips */}
        <div className="px-5 py-2.5 bg-[#121212] border-t border-[#222222] flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
          <Sparkles className="w-3.5 h-3.5 text-[#EF2929] flex-shrink-0" />
          <span className="text-neutral-500 font-bold uppercase tracking-wider text-[10px] flex-shrink-0">
            Suggested:
          </span>
          {sampleQuestions.map((q, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(q)}
              className="px-3 py-1 rounded-full bg-[#1C1C1C] border border-[#2A2A2A] text-neutral-300 hover:border-[#EF2929] hover:text-white text-xs whitespace-nowrap transition flex-shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 bg-[#151515] border-t border-[#242424] flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={
              selectedDocId
                ? 'Ask a question about this prescription (English or Malayalam)...'
                : 'Ask any medical abbreviation or term (e.g., OD, BD, TDS)...'
            }
            className="flex-1 px-4 py-2.5 rounded-xl border border-[#2E2E2E] bg-[#202020] text-white text-sm focus:outline-none focus:border-[#EF2929] focus:ring-1 focus:ring-[#EF2929] placeholder-neutral-500 transition"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim() || isSending}
            className="inline-flex items-center justify-center p-2.5 rounded-xl bg-gradient-to-r from-[#EF2929] to-[#DC2626] hover:from-[#DC2626] hover:to-[#B91C1C] text-white shadow-glow-red transition disabled:opacity-40"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
