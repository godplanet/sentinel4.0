import { useState } from 'react';
import { BookOpen, Send, AlertTriangle, CheckCircle, AlertCircle, Shield, Sparkles, FileText, Search } from 'lucide-react';
import { GlassCard } from '@/shared/ui/GlassCard';
import { generateFatwa, getSuggestedQuestions, type FatwaResponse } from '@/features/shariah/rag-engine';
import type { AAOIFIStandard } from '@/features/shariah/data/aaoifi_standards';

function getRulingLabelTR(ruling: FatwaResponse['ruling']): string {
  const labels = {
    'permissible': 'CAİZ',
    'not_permissible': 'CAİZ DEĞİL',
    'conditional': 'ŞARTLI CAİZ',
    'requires_review': 'İNCELEME GEREKLİ'
  };
  return labels[ruling];
}

function getStandardRulingLabelTR(ruling: AAOIFIStandard['ruling']): string {
  const labels = {
    'mandatory': 'ZORUNLU',
    'recommended': 'TAVSİYE EDİLİR',
    'permissible': 'CAİZ',
    'discouraged': 'MEKRUH',
    'prohibited': 'YASAK'
  };
  return labels[ruling];
}

export default function FatwaGPTPage() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<FatwaResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Array<{ query: string; response: FatwaResponse }>>([]);

  const handleSubmit = async (queryText: string = query) => {
    if (!queryText.trim()) return;

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const fatwa = generateFatwa(queryText);
    setResponse(fatwa);
    setHistory(prev => [{ query: queryText, response: fatwa }, ...prev]);
    setQuery('');
    setLoading(false);
  };

  const suggestedQuestions = getSuggestedQuestions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="w-full max-w-[1800px] mx-auto px-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-8 h-8 text-emerald-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Fetva-GPT</h1>
            <p className="text-gray-600 dark:text-gray-400">Yapay Zeka Destekli Fıkhi Danışman</p>
          </div>
          <span className="ml-auto px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
            BETA
          </span>
        </div>
      </div>

      <div className="w-full max-w-[1800px] mx-auto px-6 space-y-6">
        {/* Islamic Pattern Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-white">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-10 h-10" />
              <div>
                <h2 className="text-2xl font-bold">AAOIFI Standartları Kütüphanesi</h2>
                <p className="text-emerald-100">Halüsinasyon Yok • Sadece Kaynaklı Bilgi • Şer'i Uyumlu</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>8+ Standart</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>20+ Madde</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Faize Sıfır Tolerans</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Chat Interface */}
          <div className="lg:col-span-2 space-y-6">
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Şer'i / Fıkhi Soru Sor</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">AAOIFI standartlarına dayalı hükümler alın</p>
                </div>
              </div>

              {/* Query Input */}
              <div className="relative mb-6">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder="Örnek: Arabayı galeriden satın almadan müşteriye satabilir miyiz?"
                  className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none text-gray-900 dark:text-white placeholder-gray-500"
                  rows={3}
                  disabled={loading}
                />
                <button
                  onClick={() => handleSubmit()}
                  disabled={!query.trim() || loading}
                  className="absolute bottom-3 right-3 p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Suggested Questions */}
              {!response && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Örnek Sorular:</p>
                  <div className="space-y-2">
                    {suggestedQuestions.slice(0, 4).map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setQuery(q);
                          handleSubmit(q);
                        }}
                        className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all text-sm text-gray-700 dark:text-gray-300"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </GlassCard>

            {/* Response Display */}
            {response && (
              <GlassCard className="p-6 space-y-6">
                {/* Ruling Badge */}
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${
                    response.ruling === 'not_permissible' ? 'bg-red-100 dark:bg-red-900/30' :
                    response.ruling === 'permissible' ? 'bg-green-100 dark:bg-green-900/30' :
                    response.ruling === 'conditional' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                    'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    {response.ruling === 'not_permissible' ? <AlertTriangle className="w-6 h-6 text-red-600" /> :
                     response.ruling === 'permissible' ? <CheckCircle className="w-6 h-6 text-green-600" /> :
                     response.ruling === 'conditional' ? <AlertCircle className="w-6 h-6 text-yellow-600" /> :
                     <Search className="w-6 h-6 text-gray-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                        response.ruling === 'not_permissible' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                        response.ruling === 'permissible' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                        response.ruling === 'conditional' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}>
                        {getRulingLabelTR(response.ruling)}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        response.riskLevel === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                        response.riskLevel === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                      }`}>
                        {response.riskLevel === 'critical' ? 'KRİTİK' : response.riskLevel === 'high' ? 'YÜKSEK' : response.riskLevel === 'medium' ? 'ORTA' : 'DÜŞÜK'} RİSK
                      </span>
                    </div>
                    <p className="text-gray-900 dark:text-white leading-relaxed">{response.answer}</p>
                  </div>
                </div>

                {/* Warnings */}
                {response.warnings && response.warnings.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
                    {response.warnings.map((warning, idx) => (
                      <p key={idx} className="text-red-800 dark:text-red-300 text-sm font-medium">
                        {warning}
                      </p>
                    ))}
                  </div>
                )}

                {/* Reasoning */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Gerekçe:</h4>
                  <ul className="space-y-1">
                    {response.reasoning.map((reason, idx) => (
                      <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                        <span className="text-emerald-500 mt-1">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Citations */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Alıntılanan Kaynaklar:
                  </h4>
                  <div className="space-y-3">
                    {response.citations.map((citation) => (
                      <CitationCard key={citation.id} citation={citation} />
                    ))}
                  </div>
                </div>
              </GlassCard>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <GlassCard className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Bilgi Bankası</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Standartlar</span>
                  <span className="font-semibold text-emerald-600">8</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Maddeler</span>
                  <span className="font-semibold text-emerald-600">20+</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Bugünkü Sorgular</span>
                  <span className="font-semibold text-emerald-600">{history.length}</span>
                </div>
              </div>
            </GlassCard>

            {/* Recent Queries */}
            {history.length > 0 && (
              <GlassCard className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Son Sorgular</h3>
                <div className="space-y-2">
                  {history.slice(0, 5).map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setQuery(item.query);
                        setResponse(item.response);
                      }}
                      className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
                    >
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{item.query}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-medium ${
                          item.response.ruling === 'not_permissible' ? 'text-red-600' :
                          item.response.ruling === 'permissible' ? 'text-green-600' :
                          'text-yellow-600'
                        }`}>
                          {getRulingLabelTR(item.response.ruling)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Disclaimer */}
            <GlassCard className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 dark:text-amber-300">
                  <p className="font-semibold mb-1">Yasal Uyarı:</p>
                  <p>Bu araç sadece AAOIFI standartlarına dayalı rehberlik sağlar. Nihai karar için Şer'i Danışma Kurulu'na (SSB) başvurunuz.</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}

function CitationCard({ citation }: { citation: AAOIFIStandard }) {
  return (
    <div className="p-4 rounded-lg border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h5 className="font-semibold text-emerald-900 dark:text-emerald-200">
            AAOIFI Standard No. {citation.standard_no}: {citation.standard_name}
          </h5>
          <p className="text-xs text-emerald-700 dark:text-emerald-400">
            Article {citation.article_no} • {citation.section}
          </p>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          citation.ruling === 'prohibited' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
          citation.ruling === 'mandatory' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
          'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
        }`}>
          {getStandardRulingLabelTR(citation.ruling)}
        </span>
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">
        "{citation.text}"
      </p>
      {citation.references && citation.references.length > 0 && (
        <div className="mt-2 pt-2 border-t border-emerald-200 dark:border-emerald-800">
          <p className="text-xs text-emerald-700 dark:text-emerald-400">
            <span className="font-semibold">Referanslar:</span> {citation.references.join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}
