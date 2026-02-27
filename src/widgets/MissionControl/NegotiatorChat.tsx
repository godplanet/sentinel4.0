import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, TrendingUp, TrendingDown, Minus, BarChart3, Zap } from 'lucide-react';
import clsx from 'clsx';
import {
  analyzeSentiment,
  SENTIMENT_COLORS,
  SENTIMENT_LABELS,
} from './negotiator-sentiment';
import type { SentimentResult, Sentiment } from './negotiator-sentiment';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user' | 'system';
  text: string;
  timestamp: string;
  sentiment?: SentimentResult;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'sys-1',
    sender: 'system',
    text: 'Hermes (Muzakereci) aktif. Otomatik eksik belge tespiti baslatildi.',
    timestamp: '',
  },
  {
    id: 'bot-1',
    sender: 'bot',
    text: 'Merhaba! Hermes raporlama motorundan bir uyari aldim. Gider ID #EXP-2026-0847 icin 5.000 TL tutarinda bir masraf fisi mevcut, ancak katilimci listesi eklenmemis. Bu belgeyi tamamlayabilir misiniz?',
    timestamp: '',
  },
];

const BOT_FOLLOWUPS: Record<Sentiment, string[]> = {
  aggressive: [
    'Endiselerinizi anliyorum. Ancak GIAS 2024 Standart 2310 geregi, bu belge zorunlu bir kanittir. Uyum ekibine bildirimde bulunmam gerekecek.',
    'Not: Isbirliginden kacinma davranisi, bulgu derecelendirmesinde agirlaştirici faktor olarak degerlendirilebilir.',
  ],
  defensive: [
    'Gecikme nedeninizi anliyorum. 48 saat ek sure taniyorum. Ancak bu tarihten sonra bulgu otomatik olarak "Belgesiz" statüsüne gececek.',
    'Hatirlatma: Gecmis denetim emsallerinde benzer gecikmelerin risk skorunu artirdigi gozlemlenmistir.',
  ],
  helpful: [
    'Tesekkur ederim! Belgeyi aldigimda dogrulamayi baslatacagim. Bu isbirlikci yaklasim, denetim notlariniza olumlu yansiyacaktir.',
  ],
  neutral: [
    'Anlasilan. Katilimci listesini 24 saat icinde gondermenizi bekliyorum. Herhangi bir sorunuz olursa bana yazabilirsiniz.',
  ],
};

function nowStamp(): string {
  return new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

export function NegotiatorChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    INITIAL_MESSAGES.map((m) => ({ ...m, timestamp: nowStamp() })),
  );
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [riskScore, setRiskScore] = useState(45);
  const [sentimentHistory, setSentimentHistory] = useState<SentimentResult[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, typing]);

  const addBotMessages = useCallback((texts: string[], sentiment?: SentimentResult) => {
    setTyping(true);
    let delay = 800;

    texts.forEach((text, i) => {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}-${i}`,
            sender: 'bot',
            text,
            timestamp: nowStamp(),
          },
        ]);
        if (i === texts.length - 1) setTyping(false);
      }, delay);
      delay += 1200;
    });

    if (sentiment) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `sys-${Date.now()}`,
            sender: 'system',
            text: `Duygu Analizi: ${SENTIMENT_LABELS[sentiment.sentiment]} (Guven: ${Math.round(sentiment.confidence * 100)}%) | Risk Delta: ${sentiment.riskDelta > 0 ? '+' : ''}${sentiment.riskDelta}`,
            timestamp: nowStamp(),
            sentiment,
          },
        ]);
      }, delay + 400);
    }
  }, []);

  const handleSend = () => {
    if (!input.trim() || typing) return;
    const text = input.trim();
    setInput('');

    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, sender: 'user', text, timestamp: nowStamp() },
    ]);

    const sentiment = analyzeSentiment(text);
    setSentimentHistory((prev) => [...prev, sentiment]);
    setRiskScore((prev) => Math.max(0, Math.min(100, prev + sentiment.riskDelta)));

    const followups = BOT_FOLLOWUPS[sentiment.sentiment] || BOT_FOLLOWUPS.neutral;
    addBotMessages(followups, sentiment);
  };

  const latestSentiment = sentimentHistory[sentimentHistory.length - 1];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden" style={{ height: 520 }}>
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-200">
          <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">Hermes -- Denetim Muzakeresi</div>
            <div className="text-[10px] text-slate-500">#sentinel-audit-negotiation</div>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[10px] text-emerald-600 font-medium">Cevrimici</span>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {messages.map((msg) => {
            if (msg.sender === 'system') {
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center"
                >
                  <span className={clsx(
                    'text-[10px] px-3 py-1 rounded-full',
                    msg.sentiment
                      ? 'font-bold'
                      : 'bg-slate-200 text-slate-500',
                  )} style={msg.sentiment ? {
                    backgroundColor: SENTIMENT_COLORS[msg.sentiment.sentiment] + '18',
                    color: SENTIMENT_COLORS[msg.sentiment.sentiment],
                  } : undefined}>
                    {msg.text}
                  </span>
                </motion.div>
              );
            }

            const isBot = msg.sender === 'bot';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={clsx('flex gap-2', isBot ? 'justify-start' : 'justify-end')}
              >
                {isBot && (
                  <div className="w-7 h-7 rounded-lg bg-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={14} className="text-white" />
                  </div>
                )}
                <div className={clsx(
                  'max-w-[75%] rounded-xl px-3 py-2',
                  isBot
                    ? 'bg-white border border-slate-200 text-slate-800'
                    : 'bg-slate-800 text-white',
                )}>
                  <p className="text-xs leading-relaxed">{msg.text}</p>
                  <span className={clsx(
                    'text-[9px] mt-1 block',
                    isBot ? 'text-slate-400' : 'text-slate-400',
                  )}>
                    {msg.timestamp}
                  </span>
                </div>
                {!isBot && (
                  <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User size={14} className="text-white" />
                  </div>
                )}
              </motion.div>
            );
          })}

          {typing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2 items-start"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-600 flex items-center justify-center shrink-0">
                <Bot size={14} className="text-white" />
              </div>
              <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      className="w-1.5 h-1.5 rounded-full bg-slate-400"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="p-3 bg-white border-t border-slate-200">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Yanit yazin..."
              disabled={typing}
              className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-200 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || typing}
              className="px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-colors disabled:opacity-40"
            >
              <Send size={14} />
            </button>
          </div>
          <div className="flex gap-1.5 mt-2">
            {['Tamam, hemen gonderiyorum', 'Bu sacmalik, kabul etmiyorum!', 'Zaman lazim, kaynaklarimiz yetersiz'].map((q) => (
              <button
                key={q}
                onClick={() => setInput(q)}
                className="text-[9px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded hover:bg-slate-200 transition-colors truncate max-w-[180px]"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={14} className="text-slate-500" />
            <span className="text-xs font-bold text-slate-700">Canli Risk Skoru</span>
          </div>
          <div className="flex items-end gap-2 mb-2">
            <span className={clsx(
              'text-3xl font-black',
              riskScore >= 70 ? 'text-red-600' :
              riskScore >= 40 ? 'text-amber-600' :
              'text-emerald-600',
            )}>
              {riskScore}
            </span>
            <span className="text-sm text-slate-400 mb-1">/100</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${riskScore}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={clsx(
                'h-full rounded-full transition-colors',
                riskScore >= 70 ? 'bg-red-500' :
                riskScore >= 40 ? 'bg-amber-500' :
                'bg-emerald-500',
              )}
            />
          </div>
        </div>

        <AnimatePresence>
          {latestSentiment && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                {latestSentiment.riskDelta > 0 ? (
                  <TrendingUp size={14} className="text-red-500" />
                ) : latestSentiment.riskDelta < 0 ? (
                  <TrendingDown size={14} className="text-emerald-500" />
                ) : (
                  <Minus size={14} className="text-slate-400" />
                )}
                <span className="text-xs font-bold text-slate-700">Son Duygu Analizi</span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: SENTIMENT_COLORS[latestSentiment.sentiment] + '18',
                    color: SENTIMENT_COLORS[latestSentiment.sentiment],
                  }}
                >
                  {SENTIMENT_LABELS[latestSentiment.sentiment]}
                </span>
                <span className="text-[10px] text-slate-500">
                  Guven: {Math.round(latestSentiment.confidence * 100)}%
                </span>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                {latestSentiment.explanation}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {sentimentHistory.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <span className="text-xs font-bold text-slate-700 mb-2 block">Yanit Gecmisi</span>
            <div className="space-y-1.5">
              {sentimentHistory.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 w-5">#{i + 1}</span>
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: SENTIMENT_COLORS[s.sentiment] }}
                  />
                  <span className="text-[10px] text-slate-600 flex-1">{SENTIMENT_LABELS[s.sentiment]}</span>
                  <span className={clsx(
                    'text-[10px] font-bold',
                    s.riskDelta > 0 ? 'text-red-500' :
                    s.riskDelta < 0 ? 'text-emerald-500' :
                    'text-slate-400',
                  )}>
                    {s.riskDelta > 0 ? '+' : ''}{s.riskDelta}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
          <span className="text-[10px] text-slate-500 block mb-1.5">Hizli Yanitlar:</span>
          <div className="space-y-1">
            {['Tamam, hemen gonderiyorum', 'Bu sacmalik, kabul etmiyorum!', 'Zaman lazim, kaynaklarimiz yetersiz', 'Anladim, haklisınız'].map((q) => (
              <button
                key={q}
                onClick={() => { setInput(q); }}
                className="w-full text-left text-[10px] px-2 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
