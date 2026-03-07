/**
 * PresentationViewer — Wave 54: Auto-Deck & Board Presentation Generator
 * Kurul Sunumu Görüntüleyici & Düzenleyici
 * %100 Light Mode | Apple Glassmorphism | Real Supabase
 */

import { useState } from 'react';
import {
  Presentation, ChevronLeft, ChevronRight, Loader2,
  CheckCircle2, Clock, Archive, RefreshCw, BarChart3,
  TrendingUp, TrendingDown, Minus, FileText, Star
} from 'lucide-react';
import clsx from 'clsx';
import {
  useDecks,
  useDeckSlides,
  useUpdateDeckStatus,
  type PresentationDeck,
  type SlideBlock,
  type KpiItem,
  type DeckStatus,
} from '@/features/auto-deck/api/deck';

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<DeckStatus, { label: string; icon: typeof CheckCircle2; color: string; bg: string }> = {
  draft:     { label: 'Taslak',     icon: Clock,         color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-200' },
  ready:     { label: 'Hazır',      icon: CheckCircle2,  color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  presented: { label: 'Sunuldu',    icon: Star,          color: 'text-blue-600',    bg: 'bg-blue-50 border-blue-200' },
  archived:  { label: 'Arşiv',      icon: Archive,       color: 'text-slate-500',   bg: 'bg-slate-100 border-slate-200' },
};

const SLIDE_TYPE_LABELS: Record<string, string> = {
  COVER:             'Kapak',
  EXECUTIVE_SUMMARY: 'Yönetici Özeti',
  KPI:               'Temel Göstergeler',
  FINDINGS:          'Bulgular',
  RECOMMENDATIONS:   'Öneriler',
  CONTENT:           'İçerik',
  CLOSING:           'Kapanış',
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function PresentationViewer() {
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [currentSlide,   setCurrentSlide]   = useState(0);
  const [view, setView] = useState<'list' | 'present'>('list');

  const { data: decks = [], isLoading: decksLoading, refetch } = useDecks();
  const { data: slides = [], isLoading: slidesLoading }         = useDeckSlides(selectedDeckId ?? undefined);
  const updateStatus = useUpdateDeckStatus();

  const selectedDeck = decks.find(d => d.id === selectedDeckId) ?? null;

  const handleOpenDeck = (deck: PresentationDeck) => {
    setSelectedDeckId(deck.id);
    setCurrentSlide(0);
    setView('present');
  };

  const handleBack = () => {
    setView('list');
    setCurrentSlide(0);
  };

  const goNext = () => setCurrentSlide(i => Math.min(i + 1, slides.length - 1));
  const goPrev = () => setCurrentSlide(i => Math.max(i - 1, 0));

  // ── LIST VIEW ──
  if (view === 'list') {
    return (
      <div className="space-y-5">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
          <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                <Presentation size={18} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Auto-Deck Sunumu Üretici</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Yönetim Kurulu Sunum Kütüphanesi — Wave 54</p>
              </div>
            </div>
            <button onClick={() => refetch()} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
              <RefreshCw size={14} />
            </button>
          </div>

          {/* Deck list */}
          <div className="divide-y divide-slate-100">
            {decksLoading ? (
              <div className="flex items-center justify-center py-16 gap-2 text-sm text-slate-400">
                <Loader2 size={16} className="animate-spin text-blue-400" />
                Sunumlar yükleniyor...
              </div>
            ) : decks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Presentation size={36} className="text-slate-200 mb-3" />
                <p className="text-sm font-semibold text-slate-600">Henüz sunum yok</p>
                <p className="text-xs text-slate-400 mt-1">Otomatik sunum oluşturmak için bir denetim seçin</p>
              </div>
            ) : (
              decks.map(deck => <DeckRow key={deck.id} deck={deck} onOpen={handleOpenDeck} onStatusChange={(id, status) => updateStatus.mutate({ id, status })} />)
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── PRESENTATION VIEW ──
  const slide = slides[currentSlide] ?? null;
  const progress = slides.length > 0 ? ((currentSlide + 1) / slides.length) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Title bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
        >
          <ChevronLeft size={12} />
          Geri
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold text-slate-800 truncate">{selectedDeck?.title}</h2>
          <p className="text-[10px] text-slate-500">{selectedDeck?.period} · {selectedDeck?.total_slides} slayt</p>
        </div>
        {/* Slide nav */}
        <div className="flex items-center gap-2">
          <button onClick={goPrev} disabled={currentSlide === 0} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 disabled:opacity-30 transition-colors">
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs font-bold text-slate-600 tabular-nums w-14 text-center">
            {currentSlide + 1} / {slides.length}
          </span>
          <button onClick={goNext} disabled={currentSlide >= slides.length - 1} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 disabled:opacity-30 transition-colors">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      {/* Slide card */}
      {slidesLoading ? (
        <div className="flex items-center justify-center h-72 bg-white/80 rounded-2xl border border-slate-200">
          <Loader2 size={20} className="animate-spin text-blue-400" />
        </div>
      ) : slide ? (
        <SlideCanvas slide={slide} />
      ) : null}

      {/* Speaker notes */}
      {slide?.speaker_notes && (
        <div className="px-4 py-3 bg-amber-50/60 border border-amber-100 rounded-xl">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1">Konuşmacı Notları</p>
          <p className="text-xs text-slate-600 leading-relaxed">{slide.speaker_notes}</p>
        </div>
      )}

      {/* Slide thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {slides.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setCurrentSlide(idx)}
            className={clsx(
              'shrink-0 w-24 h-16 rounded-lg border text-[9px] font-bold text-center flex flex-col items-center justify-center gap-1 transition-all',
              idx === currentSlide
                ? 'border-blue-400 bg-blue-50 text-blue-700'
                : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300'
            )}
          >
            <span className="text-[11px] tabular-nums font-black">{idx + 1}</span>
            <span className="line-clamp-1 px-1">{SLIDE_TYPE_LABELS[s.slide_type] ?? s.slide_type}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Slide Canvas ─────────────────────────────────────────────────────────────

function SlideCanvas({ slide: s }: { slide: SlideBlock }) {
  const isCover   = s.slide_type === 'COVER';
  const isClosing = s.slide_type === 'CLOSING';
  const isKpi     = s.slide_type === 'KPI' && (s.kpi_data?.length ?? 0) > 0;

  return (
    <div className={clsx(
      'rounded-2xl border overflow-hidden min-h-72 flex flex-col',
      isCover || isClosing
        ? 'bg-gradient-to-br from-slate-800 via-slate-900 to-blue-950 border-slate-700 text-white'
        : 'bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm'
    )}>
      {/* Slide header */}
      <div className={clsx('px-6 py-5 border-b', isCover || isClosing ? 'border-white/10' : 'border-slate-100')}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <span className={clsx(
              'inline-block text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded mb-2',
              isCover || isClosing ? 'bg-white/10 text-blue-200' : 'bg-blue-50 text-blue-600'
            )}>
              {SLIDE_TYPE_LABELS[s.slide_type] ?? s.slide_type}
            </span>
            <h2 className={clsx('text-base font-black leading-snug', isCover || isClosing ? 'text-white' : 'text-slate-800')}>
              {s.title}
            </h2>
            {s.subtitle && (
              <p className={clsx('text-xs mt-1', isCover || isClosing ? 'text-blue-200' : 'text-slate-500')}>
                {s.subtitle}
              </p>
            )}
          </div>
          <FileText size={18} className={isCover || isClosing ? 'text-white/30' : 'text-slate-200'} />
        </div>
      </div>

      {/* Slide body */}
      <div className="flex-1 px-6 py-5">
        {/* KPI grid */}
        {isKpi && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {(s.kpi_data ?? []).map((kpi: KpiItem, i: number) => (
              <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                <div className="flex items-center gap-1 mb-1">
                  {kpi.trend === 'up'      && <TrendingUp  size={11} className="text-emerald-500" />}
                  {kpi.trend === 'down'    && <TrendingDown size={11} className="text-red-500" />}
                  {kpi.trend === 'neutral' && <Minus        size={11} className="text-slate-400" />}
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{kpi.label}</span>
                </div>
                <p className={clsx(
                  'text-lg font-black',
                  kpi.trend === 'up' ? 'text-emerald-700' : kpi.trend === 'down' ? 'text-red-600' : 'text-slate-700'
                )}>
                  {kpi.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Body text */}
        {s.body_content && (
          <p className={clsx(
            'text-sm leading-relaxed whitespace-pre-line',
            isCover || isClosing ? 'text-blue-100' : 'text-slate-700',
            isKpi && 'mt-4'
          )}>
            {s.body_content}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Deck Row ─────────────────────────────────────────────────────────────────

function DeckRow({
  deck: d,
  onOpen,
  onStatusChange,
}: {
  deck: PresentationDeck;
  onOpen: (deck: PresentationDeck) => void;
  onStatusChange: (id: string, status: DeckStatus) => void;
}) {
  const cfg     = STATUS_CFG[d.status] ?? STATUS_CFG.draft;
  const Icon    = cfg.icon;

  return (
    <div className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors group">
      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
        <Presentation size={18} className="text-blue-600" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className={clsx('inline-flex items-center gap-1 text-[10px] font-bold border px-2 py-0.5 rounded-full', cfg.bg, cfg.color)}>
            <Icon size={9} />{cfg.label}
          </span>
          {d.period && (
            <span className="text-[10px] text-slate-500 font-semibold">{d.period}</span>
          )}
          <span className="text-[10px] text-slate-400 ml-auto">{d.total_slides} slayt</span>
        </div>
        <p className="text-sm font-semibold text-slate-800 truncate">{d.title}</p>
        {d.subtitle && <p className="text-[11px] text-slate-500 truncate">{d.subtitle}</p>}
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={() => onOpen(d)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg transition-colors"
        >
          <BarChart3 size={11} />
          Aç
        </button>
        {d.status === 'ready' && (
          <button
            onClick={() => onStatusChange(d.id, 'presented')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 border border-slate-200 text-slate-600 text-[10px] font-semibold rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Star size={10} />
            Sunuldu
          </button>
        )}
      </div>
    </div>
  );
}
