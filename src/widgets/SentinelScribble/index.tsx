import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PenLine, X, Sparkles, Loader2, AlertTriangle, FileSearch,
  Shield, ChevronRight, Trash2, Mic, MicOff, Link2,
  Minimize2, Maximize2, CheckCircle2, Copy, GripHorizontal,
} from 'lucide-react';
import clsx from 'clsx';
import { useScribbleStore } from './store';
import { extractFromScribble } from './scribble-ai';
import type { ExtractedFinding, ScribbleExtractionResult } from './scribble-ai';
import { supabase } from '@/shared/api/supabase';

const MIN_WIDTH = 380;
const MIN_HEIGHT = 400;

export function SentinelScribble() {
  const location = useLocation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [voiceActive, setVoiceActive] = useState(false);
  const [savedNotif, setSavedNotif] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; origW: number; origH: number } | null>(null);
  const buttonDragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const [buttonWasDragged, setButtonWasDragged] = useState(false);

  const {
    isOpen, isMaximized, content, linkedContext, isProcessing, extractionResult,
    position, size, buttonPosition,
    toggle, close, setContent, setLinkedContext, setProcessing,
    setExtractionResult, openFindingModal, reset, toggleMaximize,
    setPosition, setSize, setButtonPosition,
  } = useScribbleStore();

  useEffect(() => {
    const ctx = deriveContext(location.pathname);
    setLinkedContext(ctx);
  }, [location.pathname, setLinkedContext]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const handleMagic = async () => {
    if (!content.trim() || isProcessing) return;
    setProcessing(true);
    try {
      const result = await extractFromScribble(content);
      setExtractionResult(result);
      await supabase.from('scribbles').insert({
        content,
        is_processed: true,
        linked_context: linkedContext,
        extracted_data: result,
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveNote = async () => {
    if (!content.trim()) return;
    await supabase.from('scribbles').insert({
      content,
      is_processed: false,
      linked_context: linkedContext,
    });
    setSavedNotif(true);
    setTimeout(() => setSavedNotif(false), 2000);
  };

  const handleOpenFinding = (finding: ExtractedFinding) => {
    openFindingModal(finding);
  };

  const handleVoiceToggle = () => {
    setVoiceActive(!voiceActive);
    if (!voiceActive) {
      setTimeout(() => setVoiceActive(false), 3000);
    }
  };

  const handleClear = () => {
    reset();
  };

  const onDragStart = useCallback((e: React.MouseEvent) => {
    if (isMaximized) return;
    e.preventDefault();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: position.x,
      origY: position.y,
    };

    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = ev.clientX - dragRef.current.startX;
      const dy = ev.clientY - dragRef.current.startY;
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - 100, dragRef.current.origX + dx)),
        y: Math.max(0, Math.min(window.innerHeight - 60, dragRef.current.origY + dy)),
      });
    };

    const onUp = () => {
      dragRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [isMaximized, position, setPosition]);

  const onResizeStart = useCallback((e: React.MouseEvent) => {
    if (isMaximized) return;
    e.preventDefault();
    e.stopPropagation();
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origW: size.width,
      origH: size.height,
    };

    const onMove = (ev: MouseEvent) => {
      if (!resizeRef.current) return;
      const dx = ev.clientX - resizeRef.current.startX;
      const dy = ev.clientY - resizeRef.current.startY;
      setSize({
        width: Math.max(MIN_WIDTH, resizeRef.current.origW + dx),
        height: Math.max(MIN_HEIGHT, resizeRef.current.origH + dy),
      });
    };

    const onUp = () => {
      resizeRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [isMaximized, size, setSize]);

  const onButtonDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setButtonWasDragged(false);

    const currentX = buttonPosition.x >= 0 ? buttonPosition.x : window.innerWidth - 120;
    const currentY = buttonPosition.y >= 0 ? buttonPosition.y : window.innerHeight - 80;

    buttonDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: currentX,
      origY: currentY,
    };

    let hasMoved = false;

    const onMove = (ev: MouseEvent) => {
      if (!buttonDragRef.current) return;
      const dx = ev.clientX - buttonDragRef.current.startX;
      const dy = ev.clientY - buttonDragRef.current.startY;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasMoved = true;
      }

      setButtonPosition({
        x: Math.max(0, Math.min(window.innerWidth - 56, buttonDragRef.current.origX + dx)),
        y: Math.max(0, Math.min(window.innerHeight - 56, buttonDragRef.current.origY + dy)),
      });
    };

    const onUp = () => {
      if (hasMoved) {
        setButtonWasDragged(true);
        setTimeout(() => setButtonWasDragged(false), 100);
      }
      buttonDragRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [buttonPosition, setButtonPosition]);

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              if (!buttonWasDragged) {
                toggle();
              }
            }}
            onMouseDown={onButtonDragStart}
            className="fixed z-[90] w-14 h-14 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:shadow-slate-900/40 transition-shadow group cursor-move"
            style={
              buttonPosition.x >= 0 && buttonPosition.y >= 0
                ? { left: buttonPosition.x, top: buttonPosition.y }
                : { bottom: 24, right: 96 }
            }
            title="Sentinel Scribble - Denetçi Defteri (Sürüklenebilir)"
          >
            <PenLine size={22} className="group-hover:rotate-[-8deg] transition-transform" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={clsx(
              'fixed z-[90] bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden',
              isMaximized && 'inset-4'
            )}
            style={isMaximized ? undefined : {
              left: position.x,
              top: position.y,
              width: size.width,
              height: size.height,
            }}
          >
            <div
              onMouseDown={onDragStart}
              className="px-4 py-3 border-b border-slate-200/80 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between shrink-0 cursor-move select-none"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center shadow-sm">
                  <PenLine size={14} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">Sentinel Scribble</h3>
                  {linkedContext && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Link2 size={8} className="text-blue-500" />
                      <span className="text-[9px] font-medium text-blue-600 truncate max-w-[200px]">{linkedContext}</span>
                    </div>
                  )}
                </div>
                <GripHorizontal size={14} className="text-slate-300 ml-2" />
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleMaximize}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  title={isMaximized ? 'Kucult' : 'Tam Ekran'}
                >
                  {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
                <button onClick={close} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <X size={14} />
                </button>
              </div>
            </div>

            {!extractionResult ? (
              <NotepadView
                ref={textareaRef}
                content={content}
                isProcessing={isProcessing}
                voiceActive={voiceActive}
                savedNotif={savedNotif}
                onContentChange={setContent}
                onMagic={handleMagic}
                onSave={handleSaveNote}
                onVoiceToggle={handleVoiceToggle}
                onClear={handleClear}
              />
            ) : (
              <ResultsView
                result={extractionResult}
                onOpenFinding={handleOpenFinding}
                onBack={() => setExtractionResult(null)}
              />
            )}

            {!isMaximized && (
              <div
                onMouseDown={onResizeStart}
                className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize"
                style={{
                  background: 'linear-gradient(135deg, transparent 50%, #94a3b8 50%, transparent 55%, transparent 70%, #94a3b8 70%)',
                  borderRadius: '0 0 1rem 0',
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

interface NotepadViewProps {
  content: string;
  isProcessing: boolean;
  voiceActive: boolean;
  savedNotif: boolean;
  onContentChange: (v: string) => void;
  onMagic: () => void;
  onSave: () => void;
  onVoiceToggle: () => void;
  onClear: () => void;
}

const NotepadView = ({ ref, ...props }: NotepadViewProps & { ref: React.Ref<HTMLTextAreaElement> }) => {
  const {
    content, isProcessing, voiceActive, savedNotif,
    onContentChange, onMagic, onSave, onVoiceToggle, onClear,
  } = props;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 p-3 min-h-0">
        <textarea
          ref={ref}
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder={"Saha notlarinizi buraya yazin...\n\nOrnek: 'Ahmet backup'larin alinmadigini soyledi. IT odasinda fiziksel guvenlik yetersiz.'\n\nSentinel Magic ile yapilandirilmis bulgulara donusturun."}
          className="w-full h-full resize-none bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none leading-relaxed font-[system-ui]"
          style={{ fontVariantLigatures: 'none' }}
        />
      </div>

      <div className="px-3 pb-2">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-2">
          <span>{content.length} karakter</span>
          <span>-</span>
          <span>{content.split(/\s+/).filter(Boolean).length} kelime</span>
          {savedNotif && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="text-emerald-600 font-semibold flex items-center gap-0.5 ml-auto"
            >
              <CheckCircle2 size={10} />
              Kaydedildi
            </motion.span>
          )}
        </div>
      </div>

      <div className="px-3 pb-3 border-t border-slate-100 pt-2.5 flex items-center gap-2 shrink-0">
        <button
          onClick={onMagic}
          disabled={!content.trim() || isProcessing}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-slate-800 to-slate-900 text-white text-xs font-bold rounded-xl hover:from-slate-700 hover:to-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
        >
          {isProcessing ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Sentinel Analiz Ediyor...
            </>
          ) : (
            <>
              <Sparkles size={14} />
              Sentinel Magic
            </>
          )}
        </button>

        <button
          onClick={onVoiceToggle}
          className={clsx(
            'p-2.5 rounded-xl border transition-all',
            voiceActive
              ? 'bg-red-50 border-red-200 text-red-600 animate-pulse'
              : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
          )}
          title="Sesli Not (Demo)"
        >
          {voiceActive ? <MicOff size={14} /> : <Mic size={14} />}
        </button>

        <button
          onClick={onSave}
          disabled={!content.trim()}
          className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 disabled:opacity-40 transition-all"
          title="Notu Kaydet"
        >
          <Copy size={14} />
        </button>

        <button
          onClick={onClear}
          disabled={!content.trim()}
          className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500 disabled:opacity-40 transition-all"
          title="Temizle"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

function ResultsView({ result, onOpenFinding, onBack }: {
  result: ScribbleExtractionResult;
  onOpenFinding: (f: ExtractedFinding) => void;
  onBack: () => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto min-h-0">
      <div className="p-3 space-y-3">
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-xl p-3">
          <div className="flex items-start gap-2">
            <Sparkles size={14} className="text-slate-700 mt-0.5 shrink-0" />
            <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
              {result.summary}
            </p>
          </div>
        </div>

        {result.findings.length > 0 && (
          <div>
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <AlertTriangle size={10} />
              Tespit Edilen Bulgular ({result.findings.length})
            </h4>
            <div className="space-y-2">
              {result.findings.map((f, i) => (
                <FindingCard key={i} finding={f} onOpen={() => onOpenFinding(f)} />
              ))}
            </div>
          </div>
        )}

        {result.risks.length > 0 && (
          <div>
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Shield size={10} />
              Risk Gostergeleri ({result.risks.length})
            </h4>
            <div className="space-y-2">
              {result.risks.map((r, i) => {
                const colors = {
                  CRITICAL: 'border-red-200 bg-red-50/50 text-red-800',
                  HIGH: 'border-orange-200 bg-orange-50/50 text-orange-800',
                  MEDIUM: 'border-amber-200 bg-amber-50/50 text-amber-800',
                  LOW: 'border-slate-200 bg-slate-50/50 text-slate-700',
                };
                return (
                  <div key={i} className={clsx('border rounded-xl p-3', colors[r.risk_level])}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold">{r.title}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/60">{r.risk_level}</span>
                    </div>
                    <p className="text-[10px] leading-relaxed opacity-80">{r.description.slice(0, 150)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {result.evidence_requests.length > 0 && (
          <div>
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileSearch size={10} />
              Belge Talepleri ({result.evidence_requests.length})
            </h4>
            <div className="space-y-2">
              {result.evidence_requests.map((e, i) => (
                <div key={i} className="border border-blue-200 bg-blue-50/30 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-blue-900">{e.title}</span>
                    <span className={clsx(
                      'text-[9px] font-bold px-1.5 py-0.5 rounded-full',
                      e.priority === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    )}>{e.priority}</span>
                  </div>
                  <p className="text-[10px] text-blue-800 leading-relaxed">{e.description.slice(0, 120)}</p>
                  <p className="text-[9px] text-blue-600 font-semibold mt-1">Talep: {e.requested_from}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 px-3 py-2.5 border-t border-slate-200 bg-white/90 backdrop-blur-sm">
        <button
          onClick={onBack}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-200 transition-colors"
        >
          <ChevronRight size={12} className="rotate-180" />
          Notlara Don
        </button>
      </div>
    </div>
  );
}

const SEVERITY_COLORS: Record<string, { bg: string; text: string; badge: string }> = {
  CRITICAL: { bg: 'bg-red-50', text: 'text-red-900', badge: 'bg-red-600 text-white' },
  HIGH: { bg: 'bg-orange-50', text: 'text-orange-900', badge: 'bg-orange-500 text-white' },
  MEDIUM: { bg: 'bg-amber-50', text: 'text-amber-900', badge: 'bg-amber-500 text-white' },
  LOW: { bg: 'bg-slate-50', text: 'text-slate-800', badge: 'bg-slate-400 text-white' },
};

function FindingCard({ finding, onOpen }: { finding: ExtractedFinding; onOpen: () => void }) {
  const colors = SEVERITY_COLORS[finding.severity] || SEVERITY_COLORS.MEDIUM;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx('border rounded-xl p-3 cursor-pointer hover:shadow-md transition-all group', colors.bg, 'border-slate-200')}
      onClick={onOpen}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span className={clsx('text-[11px] font-bold leading-tight', colors.text)}>{finding.title}</span>
        <span className={clsx('text-[8px] font-bold px-1.5 py-0.5 rounded-full shrink-0', colors.badge)}>
          {finding.severity}
        </span>
      </div>
      <p className={clsx('text-[10px] leading-relaxed mb-2 opacity-80', colors.text)}>
        {finding.description.slice(0, 120)}...
      </p>
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-medium text-slate-500">
          Kok Neden: {finding.root_cause}
        </span>
        <span className="text-[9px] font-bold text-blue-600 group-hover:text-blue-700 flex items-center gap-0.5">
          Bulgu Olustur <ChevronRight size={10} />
        </span>
      </div>
    </motion.div>
  );
}

function deriveContext(pathname: string): string {
  const contextMap: Record<string, string> = {
    '/dashboard': 'Kokpit',
    '/strategy/objectives': 'Strateji / Hedefler',
    '/strategy/universe': 'Denetim Evreni',
    '/strategy/risk-assessment': 'Risk Degerlendirme',
    '/strategy/annual-plan': 'Yillik Plan',
    '/execution/my-engagements': 'Denetim Gorevleri',
    '/execution/workpapers': 'Calisma Kagitlari',
    '/execution/findings': 'Bulgu Merkezi',
    '/execution/actions': 'Aksiyon Yonetimi',
    '/reporting/builder': 'Rapor Olusturucu',
    '/reporting/executive': 'Yonetici Raporu',
    '/reporting/trends': 'Trend Analizi',
    '/governance/policies': 'Politika Kutuphanesi',
    '/governance/vault': 'Yonetisim Kasasi',
    '/monitoring/watchtower': 'Gozetim Kulesi',
    '/settings': 'Ayarlar',
    '/oracle': 'Sentinel Oracle',
  };

  for (const [path, label] of Object.entries(contextMap)) {
    if (pathname.startsWith(path)) return label;
  }

  return pathname;
}
