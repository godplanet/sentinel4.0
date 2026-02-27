import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAISettingsStore } from '@/features/ai-agents/model/ai-settings-store';
import { useChatStore } from '@/features/ai-agents/model/chat-store';
import { usePageContext } from '@/shared/hooks/usePageContext';
import { useChatEngine } from './useChatEngine';
import { ChatBubble } from './ChatBubble';
import { ThinkingIndicator } from '@/features/ai-agents/sentinel-prime';
import { useSentinelContext } from '@/features/ai-agents/sentinel-prime';
import {
  Brain,
  X,
  Send,
  Trash2,
  Settings,
  ToggleLeft,
  ToggleRight,
  MapPin,
  AlertCircle,
  Minimize2,
  Maximize2,
  Shield,
  Book,
} from 'lucide-react';
import clsx from 'clsx';

const QUICK_PROMPTS = [
  'Why is this finding Critical?',
  'What is our cyber risk appetite?',
  '/constitution',
  '/veto',
  'Summarize recent findings',
  'Show GIAS 2024 requirements',
];

export function SentinelChatPanel() {
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  const { includeContext, setIncludeContext } = useAISettingsStore();
  const { chatOpen, setChatOpen, messages, clearMessages } = useChatStore();
  const { sendMessage, isConfigured, contextLoading, hasContext } = useChatEngine();
  const { loadingSteps } = useSentinelContext();
  const pageCtx = usePageContext();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (chatOpen) inputRef.current?.focus();
  }, [chatOpen]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;
    const prompt = input.trim();
    setInput('');
    setIsSending(true);
    try {
      await sendMessage(prompt, pageCtx.context);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!chatOpen) return null;

  return (
    <div
      className={clsx(
        'fixed z-50 bg-white border border-slate-200 shadow-2xl flex flex-col transition-all duration-300',
        isExpanded
          ? 'inset-4 rounded-2xl'
          : 'bottom-4 right-4 w-[420px] h-[600px] rounded-2xl'
      )}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-slate-800 to-slate-900 rounded-t-2xl">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center relative">
            {contextLoading ? (
              <Brain className="w-4 h-4 text-white animate-pulse" />
            ) : hasContext ? (
              <>
                <Shield className="w-4 h-4 text-white" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full border border-slate-900" />
              </>
            ) : (
              <Brain className="w-4 h-4 text-white" />
            )}
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-1.5">
              Sentinel Prime
              {hasContext && !contextLoading && (
                <span className="text-[9px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded border border-green-500/30">
                  ARMED
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-400">
              {contextLoading ? 'Loading Constitution...' : 'Guardian of the Bank\'s Amanah'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-md hover:bg-white/10"
            title={isExpanded ? 'Kucult' : 'Genislet'}
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button
            onClick={clearMessages}
            className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-md hover:bg-white/10"
            title="Sohbeti Temizle"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={() => navigate('/settings/cognitive-engine')}
            className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-md hover:bg-white/10"
            title="AI Ayarlari"
          >
            <Settings size={14} />
          </button>
          <button
            onClick={() => setChatOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-md hover:bg-white/10"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 bg-slate-50 text-xs">
        <div className="flex items-center gap-2 text-slate-500">
          <MapPin size={12} />
          <span className="truncate max-w-[180px]">{pageCtx.label}</span>
        </div>
        <button
          onClick={() => setIncludeContext(!includeContext)}
          className={clsx(
            'flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors',
            includeContext
              ? 'text-blue-600 bg-blue-50'
              : 'text-slate-400 hover:text-slate-600'
          )}
          title="Sayfa baglamini dahil et"
        >
          {includeContext ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
          <span>Baglam</span>
        </button>
      </div>

      {!isConfigured && (
        <div className="mx-4 mt-3 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-medium">API anahtari yapilandirilmamis.</span>
            <button
              onClick={() => {
                setChatOpen(false);
                navigate('/settings/cognitive-engine');
              }}
              className="ml-1 underline hover:text-amber-900"
            >
              Ayarlara git
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <ThinkingIndicator steps={loadingSteps} isVisible={contextLoading} />

        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">Sentinel Prime</h3>
            <p className="text-xs text-slate-500 mb-2">
              The Guardian of the Bank's Amanah. Skeptical Senior Auditor AI.
            </p>
            {hasContext && !contextLoading && (
              <div className="text-xs text-green-600 mb-4 flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                <Shield className="w-3 h-3" />
                <span className="font-medium">Risk Constitution Loaded</span>
              </div>
            )}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {QUICK_PROMPTS.map((qp) => (
                <button
                  key={qp}
                  onClick={() => setInput(qp)}
                  className="px-3 py-1.5 text-xs bg-slate-100 text-slate-600 rounded-full border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
                >
                  {qp}
                </button>
              ))}
            </div>
            <div className="text-[10px] text-slate-400 space-y-1 text-left">
              <div className="flex items-center gap-1.5">
                <Book className="w-3 h-3" />
                <span>Try: "Why is this finding Critical?"</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Book className="w-3 h-3" />
                <span>Commands: /constitution, /veto, /analyze</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => <ChatBubble key={msg.id} message={msg} />)}
            {isSending && (
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <Brain className="w-4 h-4 animate-pulse text-blue-400" />
                <span>Sentinel Prime is analyzing...</span>
              </div>
            )}
          </>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="border-t border-slate-200 p-3 bg-white rounded-b-2xl">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Sorunuzu yazin..."
            rows={1}
            className="flex-1 resize-none px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{ maxHeight: '100px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isSending || !isConfigured}
            className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all flex-shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
