import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Brain, CheckCircle2, XCircle, AlertTriangle,
  FileCheck, Loader2, Sparkles, ChevronRight, X
} from 'lucide-react';
import { useSentinelAI } from '@/shared/hooks/useSentinelAI';
import clsx from 'clsx';

interface QACheckItem {
  id: string;
  label: string;
  description: string;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  weight: number;
  details?: string;
}

interface WorkpaperForQA {
  id: string;
  title: string;
  engagement: string;
  auditor: string;
  hasEvidence: boolean;
  hasRootCause: boolean;
  hasRecommendation: boolean;
  findingCount: number;
  testStepCount: number;
  completedSteps: number;
  scope: string;
  conclusion?: string;
  riskCategory?: string;
}

const MOCK_WORKPAPERS: WorkpaperForQA[] = [
  { id: 'wp-001', title: 'Kredi Tahsis Sureci Denetimi', engagement: 'AUD-2025-Q1', auditor: 'Ahmet Yilmaz', hasEvidence: true, hasRootCause: true, hasRecommendation: true, findingCount: 3, testStepCount: 12, completedSteps: 12, scope: 'Kredi tahsis, onay ve kullandirma surecleri', conclusion: 'Yetkilendirme matrisinde onemli zafiyetler tespit edilmistir.', riskCategory: 'Kredi Riski' },
  { id: 'wp-002', title: 'Kasa Islemleri Kontrolu', engagement: 'AUD-2025-Q1', auditor: 'Zeynep Kara', hasEvidence: true, hasRootCause: false, hasRecommendation: true, findingCount: 2, testStepCount: 8, completedSteps: 7, scope: 'Sube kasa acilis/kapanis islemleri', conclusion: '', riskCategory: 'Operasyonel Risk' },
  { id: 'wp-003', title: 'BT Yama Yonetimi', engagement: 'AUD-2025-Q1', auditor: 'Can Yildirim', hasEvidence: false, hasRootCause: true, hasRecommendation: false, findingCount: 1, testStepCount: 10, completedSteps: 10, scope: 'Kritik sunucu ve veritabani yama surecleri', conclusion: 'Yama takvimi belirlenmis ancak uygulamada gecikmeler mevcut.', riskCategory: 'BT Riski' },
  { id: 'wp-004', title: 'MASAK Raporlama Uyumlulugu', engagement: 'AUD-2025-Q2', auditor: 'Mehmet Oz', hasEvidence: true, hasRootCause: true, hasRecommendation: true, findingCount: 4, testStepCount: 15, completedSteps: 15, scope: 'Suphe islem bildirimi ve raporlama surecleri', conclusion: 'Raporlama surelerinde gecikme ve eksik bildirimler tespit edilmistir.', riskCategory: 'Uyumluluk Riski' },
];

function runRuleChecks(wp: WorkpaperForQA): QACheckItem[] {
  const checks: QACheckItem[] = [
    {
      id: 'evidence',
      label: 'Kanit Eki',
      description: 'Calisma kagidina kanit / belge ekli mi?',
      status: wp.hasEvidence ? 'pass' : 'fail',
      weight: 25,
      details: wp.hasEvidence ? 'Kanit dokumanlari ekli.' : 'EKSIK: Hicbir kanit eklenmemis.',
    },
    {
      id: 'root-cause',
      label: 'Kok Neden Analizi',
      description: 'Bulgu icin 5-Why RCA doldurulmus mu?',
      status: wp.hasRootCause ? 'pass' : 'fail',
      weight: 20,
      details: wp.hasRootCause ? 'Kok neden analizi tamamlanmis.' : 'EKSIK: Kok neden (5-Why) bos.',
    },
    {
      id: 'recommendation',
      label: 'Oneri / Aksiyon Plani',
      description: 'Riske uygun oneri yazilmis mi?',
      status: wp.hasRecommendation ? 'pass' : 'fail',
      weight: 20,
      details: wp.hasRecommendation ? 'Oneri yazilmis.' : 'EKSIK: Oneri alani bos.',
    },
    {
      id: 'test-completion',
      label: 'Test Adimlari Tamamlanma',
      description: 'Tum test adimlari yurulmus mu?',
      status: wp.completedSteps === wp.testStepCount ? 'pass' : wp.completedSteps / wp.testStepCount >= 0.8 ? 'warning' : 'fail',
      weight: 20,
      details: `${wp.completedSteps}/${wp.testStepCount} test adimi tamamlanmis.`,
    },
    {
      id: 'conclusion',
      label: 'Sonuc / Degerlendirme',
      description: 'Calisma kagidi sonucu yazilmis mi?',
      status: wp.conclusion && wp.conclusion.length > 10 ? 'pass' : 'fail',
      weight: 15,
      details: wp.conclusion ? 'Sonuc yazilmis.' : 'EKSIK: Sonuc alani bos.',
    },
  ];
  return checks;
}

function calculateScore(checks: QACheckItem[]): number {
  let earned = 0;
  let total = 0;
  for (const c of checks) {
    total += c.weight;
    if (c.status === 'pass') earned += c.weight;
    else if (c.status === 'warning') earned += c.weight * 0.6;
  }
  return total > 0 ? Math.round((earned / total) * 100) : 0;
}

function getScoreConfig(score: number) {
  if (score >= 90) return { label: 'Mukemmel', color: 'text-emerald-700', bg: 'bg-emerald-100', ring: 'ring-emerald-500', gradient: 'from-emerald-500 to-emerald-600' };
  if (score >= 70) return { label: 'Iyi', color: 'text-blue-700', bg: 'bg-blue-100', ring: 'ring-blue-500', gradient: 'from-blue-500 to-blue-600' };
  if (score >= 50) return { label: 'Gelistirilmeli', color: 'text-amber-700', bg: 'bg-amber-100', ring: 'ring-amber-500', gradient: 'from-amber-500 to-amber-600' };
  return { label: 'Yetersiz', color: 'text-red-700', bg: 'bg-red-100', ring: 'ring-red-500', gradient: 'from-red-500 to-red-600' };
}

export function QualityAssuranceWidget() {
  const [selectedWP, setSelectedWP] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const { loading: aiLoading, generate, configured } = useSentinelAI();

  const workpaperResults = useMemo(() => {
    return MOCK_WORKPAPERS.map(wp => {
      const checks = runRuleChecks(wp);
      const score = calculateScore(checks);
      return { wp, checks, score };
    });
  }, []);

  const selectedResult = workpaperResults.find(r => r.wp.id === selectedWP);

  const handleAIReview = useCallback(async (wp: WorkpaperForQA, checks: QACheckItem[], score: number) => {
    setAiInsight(null);
    const failedChecks = checks.filter(c => c.status === 'fail' || c.status === 'warning');
    const prompt = `Bir Ic Denetim Kalite Guvence (QA) incelemesi yapiyorsun.

CALISMA KAGIDI: ${wp.title}
DENETCI: ${wp.auditor}
KAPSAM: ${wp.scope}
RISK KATEGORISI: ${wp.riskCategory || 'Belirtilmemis'}
SONUC: ${wp.conclusion || 'Yazilmamis'}
BULGU SAYISI: ${wp.findingCount}
KALITE PUANI: ${score}/100

BASARISIZ/UYARI KONTROLLER:
${failedChecks.map(c => `- ${c.label}: ${c.details}`).join('\n')}

Lutfen su formatta kisa bir QA inceleme notu yaz:
1. GENEL DEGERLENDIRME: Calisma kagidinin genel kalitesi hakkinda 1-2 cumle.
2. KRITIK EKSIKLER: Tamamlanmasi gereken maddeler.
3. ONERI: Denetciye yonlendirilecek somut iyilestirme onerileri.
Kisa ve oz yaz. Turkce yanit ver.`;

    await generate(prompt);
  }, [generate]);

  const avgScore = Math.round(workpaperResults.reduce((s, r) => s + r.score, 0) / workpaperResults.length);
  const avgConfig = getScoreConfig(avgScore);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Shield size={20} className="text-blue-600" />
            Kalite Guvence Paneli
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Shadow QA Agent - Otomatik Calisma Kagidi Incelemesi</p>
        </div>
        <div className={clsx('flex items-center gap-2 px-4 py-2 rounded-xl border', avgConfig.bg, avgConfig.color)}>
          <Shield size={16} />
          <span className="text-sm font-bold">Ortalama QA: {avgScore}/100</span>
          <span className="text-xs font-semibold opacity-70">({avgConfig.label})</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {workpaperResults.map(({ wp, checks, score }) => {
          const config = getScoreConfig(score);
          const failCount = checks.filter(c => c.status === 'fail').length;
          const isSelected = selectedWP === wp.id;

          return (
            <button
              key={wp.id}
              onClick={() => setSelectedWP(isSelected ? null : wp.id)}
              className={clsx(
                'text-left p-4 rounded-xl border-2 transition-all',
                isSelected ? 'border-blue-500 bg-blue-50/50 shadow-md' : 'border-slate-200/60 bg-white/90 backdrop-blur-sm hover:border-slate-300 hover:shadow-sm'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{wp.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{wp.auditor} - {wp.engagement}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br text-white font-black text-sm', config.gradient)}>
                    {score}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-3">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={clsx('h-full rounded-full bg-gradient-to-r', config.gradient)}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <span className={clsx('text-[10px] font-bold px-1.5 py-0.5 rounded', config.bg, config.color)}>{config.label}</span>
              </div>

              <div className="flex items-center gap-2 mt-2">
                {checks.map(c => (
                  <div key={c.id} className="flex items-center gap-1" title={c.label}>
                    {c.status === 'pass' && <CheckCircle2 size={12} className="text-emerald-500" />}
                    {c.status === 'fail' && <XCircle size={12} className="text-red-500" />}
                    {c.status === 'warning' && <AlertTriangle size={12} className="text-amber-500" />}
                  </div>
                ))}
                {failCount > 0 && (
                  <span className="text-[10px] font-bold text-red-600 ml-auto">{failCount} eksik</span>
                )}
                <ChevronRight size={12} className={clsx('text-slate-400 transition-transform', isSelected && 'rotate-90')} />
              </div>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white/90 backdrop-blur-sm border border-slate-200/60 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCheck size={16} className="text-slate-600" />
                  <h3 className="text-sm font-bold text-slate-800">{selectedResult.wp.title} - QA Detay</h3>
                </div>
                <button
                  onClick={() => setSelectedWP(null)}
                  className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center hover:bg-slate-200"
                >
                  <X size={12} className="text-slate-600" />
                </button>
              </div>

              <div className="space-y-2">
                {selectedResult.checks.map(c => (
                  <div key={c.id} className={clsx(
                    'flex items-start gap-3 p-3 rounded-lg border',
                    c.status === 'pass' && 'bg-emerald-50/50 border-emerald-100',
                    c.status === 'fail' && 'bg-red-50/50 border-red-100',
                    c.status === 'warning' && 'bg-amber-50/50 border-amber-100',
                  )}>
                    <div className="mt-0.5">
                      {c.status === 'pass' && <CheckCircle2 size={16} className="text-emerald-600" />}
                      {c.status === 'fail' && <XCircle size={16} className="text-red-600" />}
                      {c.status === 'warning' && <AlertTriangle size={16} className="text-amber-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-800">{c.label}</p>
                        <span className="text-[10px] text-slate-400 font-medium">({c.weight} puan)</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">{c.details}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Brain size={16} className="text-blue-400" />
                    <h4 className="text-sm font-bold text-white">AI QA Incelemesi</h4>
                  </div>
                  <button
                    onClick={() => handleAIReview(selectedResult.wp, selectedResult.checks, selectedResult.score)}
                    disabled={aiLoading || !configured}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 disabled:bg-slate-600 disabled:text-slate-400 transition-colors"
                  >
                    {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    {aiLoading ? 'Inceleniyor...' : 'AI Inceleme'}
                  </button>
                </div>
                {!configured && (
                  <p className="text-[10px] text-amber-400">AI motoru yapilandirilmamis. Ayarlar &gt; Cognitive Engine</p>
                )}
                {aiInsight && (
                  <div className="mt-3 bg-white/10 rounded-lg p-3 border border-white/10">
                    {aiInsight.split('\n').filter(Boolean).map((line, i) => (
                      <p key={i} className="text-xs text-slate-300 leading-relaxed mb-1">{line}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function QAScoreBadge({ score }: { score: number }) {
  const config = getScoreConfig(score);
  return (
    <span className={clsx('inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg', config.bg, config.color)}>
      <Shield size={10} />
      QA: {score}
    </span>
  );
}
