/*
 * Sentinel AI Assistant Modal
 * Global AI-powered audit analysis assistant
 * Location: widgets/AIAssistant (FSD Architecture)
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Bot, Send, Sparkles, TrendingUp, Clock, User } from 'lucide-react';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SuggestedQuery {
  id: string;
  icon: React.ElementType;
  text: string;
  shortLabel: string;
}

const SUGGESTED_QUERIES: SuggestedQuery[] = [
  {
    id: 'high-risk',
    icon: TrendingUp,
    text: 'En yüksek riskli 5 birimi göster',
    shortLabel: 'Yüksek Riskler',
  },
  {
    id: 'overdue',
    icon: Clock,
    text: 'Gecikmiş aksiyonları özetle',
    shortLabel: 'Gecikmiş Aksiyonlar',
  },
  {
    id: 'performance',
    icon: User,
    text: 'Mehmet Öz performans karnesi',
    shortLabel: 'Performans',
  },
];

export const AIAssistantModal = ({ isOpen, onClose }: AIAssistantProps) => {
  const [query, setQuery] = useState('');
  const [thinking, setThinking] = useState(false);
  const [result, setResult] = useState<{ title: string; items: Array<{ text: string; link?: string }> } | null>(null);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleQuerySubmit = (queryText: string) => {
    setQuery(queryText);
    setThinking(true);
    setResult(null);

    setTimeout(() => {
      setThinking(false);
      simulateAIResponse(queryText);
    }, 2000);
  };

  const simulateAIResponse = (q: string) => {
    const lower = q.toLowerCase();

    if (lower.includes('yüksek risk') || lower.includes('high risk')) {
      setResult({
        title: 'En Yüksek Riskli Birimler',
        items: [
          { text: '1. Kredi Operasyonları (Risk: 92/100)', link: '/universe' },
          { text: '2. BT Altyapı (Risk: 88/100)', link: '/universe' },
          { text: '3. Uyumluluk Birimi (Risk: 85/100)', link: '/universe' },
          { text: '4. Finans İşlemleri (Risk: 82/100)', link: '/universe' },
          { text: '5. İnsan Kaynakları (Risk: 78/100)', link: '/universe' },
        ],
      });
    } else if (lower.includes('gecikmiş') || lower.includes('overdue')) {
      setResult({
        title: 'Gecikmiş Aksiyonlar Özeti',
        items: [
          { text: 'Toplam 12 gecikmiş aksiyon tespit edildi', link: '/findings' },
          { text: '• 4 Kritik seviye', link: '/findings' },
          { text: '• 6 Yüksek seviye', link: '/findings' },
          { text: '• 2 Orta seviye', link: '/findings' },
          { text: 'Ortalama gecikme süresi: 18 gün', link: '/findings' },
        ],
      });
    } else if (lower.includes('performans') || lower.includes('performance')) {
      setResult({
        title: 'Mehmet Öz - Denetçi Performansı',
        items: [
          { text: 'Tamamlanan Denetim: 8/10 (80%)', link: '/execution' },
          { text: 'Bulunan Toplam Bulgu: 42', link: '/findings' },
          { text: 'Ortalama Denetim Süresi: 14 gün', link: '/execution' },
          { text: 'Kalite Puanı: 4.2/5.0', link: '/execution' },
        ],
      });
    } else {
      setResult({
        title: 'Analiz Sonucu',
        items: [
          { text: 'Sorgunuz işleniyor...', link: '' },
          { text: 'Lütfen daha spesifik bir soru sorun.', link: '' },
        ],
      });
    }
  };

  const handleLinkClick = (link: string) => {
    if (link) {
      navigate(link);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl animate-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-5">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Sentinel AI Asistanı</h2>
                <p className="text-xs text-blue-100">Akıllı Denetim Analiz Motoru</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-white/30"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Suggested Queries */}
          {!result && !thinking && (
            <div className="mb-6">
              <p className="mb-3 text-sm font-medium text-gray-700">Önerilen Sorgular:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUERIES.map((sq) => {
                  const Icon = sq.icon;
                  return (
                    <button
                      key={sq.id}
                      onClick={() => handleQuerySubmit(sq.text)}
                      className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 transition-all hover:border-blue-300 hover:bg-blue-50"
                    >
                      <Icon className="h-4 w-4" />
                      {sq.shortLabel}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Thinking State */}
          {thinking && (
            <div className="mb-6 flex flex-col items-center justify-center py-12">
              <div className="relative mb-4">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 animate-pulse text-blue-600" />
                </div>
              </div>
              <p className="text-sm font-medium text-gray-700">AI düşünüyor...</p>
              <p className="mt-1 text-xs text-gray-500">Veriler analiz ediliyor</p>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50/50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">{result.title}</h3>
              </div>
              <ul className="space-y-2">
                {result.items.map((item, idx) => (
                  <li key={idx}>
                    {item.link ? (
                      <button
                        onClick={() => handleLinkClick(item.link)}
                        className="text-left text-sm text-gray-700 hover:text-blue-600 hover:underline"
                      >
                        {item.text} →
                      </button>
                    ) : (
                      <span className="text-sm text-gray-700">{item.text}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Sorunuzu yazın (örn: 'Kritik bulguları göster')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && query && handleQuerySubmit(query)}
              className="w-full rounded-lg border border-gray-300 py-3 pl-4 pr-12 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <button
              onClick={() => query && handleQuerySubmit(query)}
              disabled={!query || thinking}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-blue-600 p-2 text-white transition-all hover:bg-blue-700 disabled:bg-gray-300"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-3 text-center text-xs text-gray-500">
            Powered by Sentinel AI • v3.0
          </p>
        </div>
      </div>
    </div>
  );
};
