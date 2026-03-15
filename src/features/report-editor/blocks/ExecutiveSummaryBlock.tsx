/**
 * ExecutiveSummaryBlock — AI Destekli Yönetim Kurulu Özet Bloğu
 *
 * Directive: Sentinel v3.0 Baş Mimarı
 * - Apple Glass AI butonu (header sağ üst)
 * - CAE/Board odaklı system prompt
 * - try/catch + toast.error hata yönetimi
 * - useSentinelAI hook entegrasyonu
 */
import { useFindingStore } from '@/entities/finding/model/store';
import type { FindingState } from '@/entities/finding/model/types';
import { useSentinelContext } from '@/features/ai-agents/sentinel-prime';
import { useSentinelAI } from '@/shared/hooks/useSentinelAI';
import {
  Activity,
  AlertTriangle,
  Brain,
  CheckCircle2,
  FileText,
  GitBranch,
  RefreshCw,
  Shield,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

// ─── Sabitler ────────────────────────────────────────────────────────────────

const EXCLUDED_STATES: FindingState[] = ['DRAFT'];

/**
 * Direktif ADIM 3: CAE / Yönetim Kurulu odaklı system prompt.
 * Her AI çağrısında bu talimatla gönderilir.
 */
const BOARD_SYSTEM_PROMPT =
  'Sen Sentinel GRC sisteminin Başdenetçisisin (CAE). ' +
  'Rapor verilerini analiz ederek Yönetim Kurulu (Board of Directors) için ' +
  '3 paragraflık, net, finansal ve operasyonel risk odaklı bir "Yönetici Özeti" yaz. ' +
  'Kurumsal, adli ve tavizsiz bir dil kullan.';

// ─── Props ───────────────────────────────────────────────────────────────────

interface ExecutiveSummaryBlockProps {
  autoGenerate?: boolean;
  reportTitle?: string;
}

// ─── Yardımcı Bileşenler ─────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  valueClass,
  cardClass,
  glowClass,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  valueClass: string;
  cardClass: string;
  glowClass?: string;
}) {
  return (
    <div className={`relative rounded-xl border px-4 py-3 ${cardClass} ${glowClass ?? ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className={`text-2xl font-black leading-none tracking-tight ${valueClass}`}>
            {value}
          </div>
          <div className="text-[10px] text-slate-500 mt-1.5 leading-tight">{label}</div>
        </div>
        <Icon size={16} className={`${valueClass} opacity-60 mt-0.5`} />
      </div>
    </div>
  );
}

function SummaryText({ text }: { text: string }) {
  return (
    <div className="space-y-1.5 text-xs leading-relaxed">
      {text.split('\n').map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1.5" />;

        if (line.trim() === '---') {
          return <hr key={i} className="border-slate-700/60 my-3" />;
        }

        const boldSectionMatch = line.match(/^\*\*(.*?)\*\*$/);
        if (boldSectionMatch) {
          return (
            <h3 key={i} className="text-sm font-bold text-slate-200 mt-4 mb-1">
              {boldSectionMatch[1]}
            </h3>
          );
        }

        if (line.startsWith('- ') || line.startsWith('* **')) {
          const content = line.replace(/^[-*]\s*/, '').replace(/\*\*(.*?)\*\*/g, '$1');
          return (
            <li key={i} className="text-slate-400 ml-4 list-disc">
              {content}
            </li>
          );
        }

        if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
          return (
            <p key={i} className="text-[10px] text-slate-600 italic">
              {line.replace(/^\*/, '').replace(/\*$/, '')}
            </p>
          );
        }

        if (line.match(/^\d+\./)) {
          const content = line.replace(/\*\*(.*?)\*\*/g, '$1');
          return (
            <li key={i} className="text-slate-400 ml-4 list-decimal">
              {content}
            </li>
          );
        }

        const withBold = line.replace(
          /\*\*(.*?)\*\*/g,
          (_, m) => `<strong class="text-slate-200">${m}</strong>`,
        );
        return (
          <p
            key={i}
            className="text-slate-400"
            dangerouslySetInnerHTML={{ __html: withBold }}
          />
        );
      })}
    </div>
  );
}

// ─── Ana Bileşen ─────────────────────────────────────────────────────────────

export function ExecutiveSummaryBlock({
  autoGenerate = false,
  reportTitle = 'Audit Report',
}: ExecutiveSummaryBlockProps) {
  // Direktif ADIM 1: AI hook entegrasyonu
  const { findings } = useFindingStore();
  const { context, isLoading: contextLoading } = useSentinelContext();
  const { generate, loading: isGenerating } = useSentinelAI();

  const [summary, setSummary] = useState('');

  // ─── Hesaplanan değerler ──────────────────────────────────────────────────

  const activeFindings = useMemo(
    () => (findings || []).filter((f) => !EXCLUDED_STATES.includes(f.state as FindingState)),
    [findings],
  );

  const critical = useMemo(
    () => (activeFindings || []).filter((f) => f.severity === 'CRITICAL').length,
    [activeFindings],
  );
  const high = useMemo(
    () => (activeFindings || []).filter((f) => f.severity === 'HIGH').length,
    [activeFindings],
  );
  const medium = useMemo(
    () => (activeFindings || []).filter((f) => f.severity === 'MEDIUM').length,
    [activeFindings],
  );
  const total = activeFindings.length;

  // ─── Auto-generate ────────────────────────────────────────────────────────

  useEffect(() => {
    if (autoGenerate && !contextLoading) {
      handleAIGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoGenerate, contextLoading]);

  // ─── Direktif ADIM 3: AI İş Mantığı ─────────────────────────────────────

  /**
   * handleAIGenerate — CAE/Board System Prompt ile özet üretir.
   * - try/catch ile sarılmış
   * - Hata durumunda toast.error
   * - Başarıda setSummary ile state güncellenir
   */
  const handleAIGenerate = async () => {
    // Bulgu verisini AI'ya gönderilecek şekilde hazırla
    const findingsData = (activeFindings || []).map((f) => ({
      title: f.title ?? '',
      severity: f.severity ?? 'MEDIUM',
      condition: f.detection_html ?? f.description ?? '',
      impact: f.impact_score ?? f.impact_financial ?? 0,
      likelihood: f.likelihood_score ?? 0,
    }));

    const prompt =
      `Rapor Başlığı: ${reportTitle}\n` +
      `Metodoloji: ${context?.constitution?.methodology_name ?? 'GIAS 2024'}\n` +
      `Toplam Aktif Bulgu: ${total} (Kritik: ${critical}, Yüksek: ${high}, Orta: ${medium})\n\n` +
      `Bulgu Detayları (JSON):\n${JSON.stringify(findingsData, null, 2)}\n\n` +
      `Lütfen Yönetim Kurulu için 3 paragraflık "Yönetici Özeti" yaz. ` +
      `Doğrudan özetten başla, uzun giriş cümlelerinden kaçın.`;

    try {
      // Direktif: BOARD_SYSTEM_PROMPT sistem talimatı olarak gönderiliyor
      const result = await generate(prompt, BOARD_SYSTEM_PROMPT);

      if (result) {
        setSummary(result);
      } else {
        throw new Error('Yapay zeka yanıt üretemedi. AI motoru yapılandırılmış mı kontrol edin.');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Yönetici özeti üretilemedi. Lütfen tekrar deneyin.';
      // Direktif: hata durumunda toast.error
      toast.error(message, { duration: 5000 });
    }
  };

  // ─── Loading state ────────────────────────────────────────────────────────

  if (contextLoading) {
    return (
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/80 p-10 flex items-center justify-center gap-3">
        <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        <span className="text-sm text-slate-400">Sistem bağlamı yükleniyor...</span>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="rounded-xl border border-slate-700/50 overflow-hidden bg-slate-900/90 backdrop-blur-sm">

      {/* ── Header — Direktif ADIM 2: Apple Glass AI Butonu ── */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
            <FileText size={13} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Executive Summary</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">CAE · AI-assisted · Yönetim Kurulu Raporlaması</p>
          </div>
        </div>

        {/* Direktif ADIM 2: Apple Glass AI Butonu — sağ üst */}
        <div className="flex items-center gap-2">
          {/* Yenile butonu (sadece özet varsa) */}
          {summary && !isGenerating && (
            <button
              onClick={handleAIGenerate}
              disabled={isGenerating}
              className="p-1.5 rounded-lg hover:bg-slate-700/60 text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-40"
              title="Yeniden Üret"
            >
              <RefreshCw size={13} />
            </button>
          )}

          {/* Ana AI butonu — Apple Glass estetiği */}
          <button
            onClick={handleAIGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-indigo-50 text-indigo-600 border border-indigo-100 px-3 py-1.5 rounded-lg hover:bg-indigo-100 hover:border-indigo-200 transition-all font-bold text-xs shadow-sm disabled:opacity-50"
          >
            <Sparkles
              size={14}
              className={isGenerating ? 'animate-spin' : ''}
            />
            {isGenerating ? 'Sentinel AI Analiz Ediyor...' : 'AI ile Yönetici Özeti Yaz'}
          </button>
        </div>
      </div>

      {/* ── İçerik ── */}
      <div className="p-5 space-y-5">

        {/* İstatistik kartları */}
        {total === 0 ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-6 flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <CheckCircle2 size={18} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-300">Golden Thread Fully Intact</p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Bu denetimde herhangi bir bulgu raporlanmamıştır. GIAS 2024 Golden Thread
                izlenebilirlik zinciri eksiksiz ve tüm test adımları doğrulamadan geçmiştir.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="Toplam Aktif Bulgu"
              value={total}
              icon={Activity}
              valueClass="text-slate-100"
              cardClass="bg-slate-800/60 border-slate-700/50"
            />
            <StatCard
              label="Kritik — Veto Riski"
              value={critical}
              icon={ShieldAlert}
              valueClass={critical > 0 ? 'text-red-400' : 'text-slate-500'}
              cardClass={critical > 0 ? 'bg-red-500/10 border-red-500/25' : 'bg-slate-800/60 border-slate-700/50'}
              glowClass={critical > 0 ? 'shadow-[0_0_16px_rgba(239,68,68,0.2)]' : ''}
            />
            <StatCard
              label="Yüksek — Yönetici Aksiyonu"
              value={high}
              icon={AlertTriangle}
              valueClass={high > 0 ? 'text-orange-400' : 'text-slate-500'}
              cardClass={high > 0 ? 'bg-orange-500/10 border-orange-500/25' : 'bg-slate-800/60 border-slate-700/50'}
            />
            <StatCard
              label="Orta / Standart Takip"
              value={medium}
              icon={Shield}
              valueClass={medium > 0 ? 'text-amber-400' : 'text-slate-500'}
              cardClass="bg-slate-800/60 border-slate-700/50"
            />
          </div>
        )}

        {/* Kritik bulgu uyarısı */}
        {critical > 0 && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
            <ShieldAlert size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-300 leading-relaxed">
              <span className="font-bold">ANAYASAL VETO AKTİF —</span> {critical} Kritik
              bulgu tespit edildi. Etkilenen denetimler tam iyileştirme sağlanana kadar
              azami denetim notu{' '}
              <span className="font-bold">60 (D)</span> ile sınırlandırılmıştır.
            </p>
          </div>
        )}

        {/* Boş durum — henüz özet yok */}
        {!summary && !isGenerating && (
          <div className="border border-dashed border-slate-700/60 rounded-xl p-5 text-center">
            <div className="w-10 h-10 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mx-auto mb-3">
              <Sparkles size={16} className="text-slate-500" />
            </div>
            <p className="text-sm text-slate-500 mb-1">Henüz yönetici özeti oluşturulmadı</p>
            <p className="text-[11px] text-slate-600 mb-4">
              Sağ üstteki butona tıklayarak Sentinel AI'ı çalıştırın.
            </p>
            <button
              onClick={handleAIGenerate}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-[0_0_14px_rgba(99,102,241,0.3)] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] disabled:opacity-50"
            >
              <Sparkles size={14} />
              AI ile Yönetici Özeti Yaz
            </button>
          </div>
        )}

        {/* Üretim yükleme animasyonu */}
        {isGenerating && (
          <div className="border border-indigo-500/30 rounded-xl p-5 bg-indigo-500/5 text-center">
            <Brain size={28} className="text-indigo-400 animate-pulse mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-300">Sentinel AI Analiz Ediyor...</p>
            <p className="text-xs text-slate-500 mt-1">
              {total} bulgu değerlendiriliyor · CAE Yönetim Kurulu Özeti Üretiliyor
            </p>
          </div>
        )}

        {/* Üretilen özet */}
        {summary && !isGenerating && (
          <div className="border border-slate-700/40 rounded-xl bg-slate-800/30 p-5">
            <SummaryText text={summary} />
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="px-5 py-2 bg-slate-800/40 border-t border-slate-700/40 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <GitBranch size={10} className="text-slate-600" />
          <span className="text-[10px] text-slate-600">
            {total} bulgu · canlı store · {new Date().toLocaleDateString('tr-TR')}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Sparkles size={9} className="text-indigo-500/60" />
          <span className="text-[10px] text-slate-600">AI-destekli · yayınlamadan önce doğrulayın</span>
        </div>
      </div>
    </div>
  );
}
