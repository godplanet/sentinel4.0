/**
 * Cognitive Interview Assistant — Ana Sayfa
 * Wave 50: Bilişsel Denetim Mülakat Asistanı
 *
 * FSD: pages/execution/CognitiveInterviewPage.tsx
 * Veri: features/auditor-interview/api.ts → useInterviews + useTranscript
 * Tasarım: %100 Light Mode | Apple Glass | Ses Dalgası + Transkript + Duygu Analizi
 */

import { useInterviews, useTranscript, type InterviewSession, type SentimentType } from '@/features/auditor-interview/api';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import {
 AlertTriangle,
 Brain,
 CheckCircle,
 ChevronRight,
 Clock,
 Eye, MessageSquare,
 Mic, MicOff,
 Shield, Users,
 Volume2,
 Zap,
} from 'lucide-react';
import { useState } from 'react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SENTIMENT_MAP: Record<SentimentType, { label: string; color: string; bg: string; icon: any }> = {
 Pozitif: { label: 'Pozitif', color: 'text-emerald-600', bg: 'bg-emerald-100 border-emerald-200', icon: CheckCircle },
 Nötr: { label: 'Nötr', color: 'text-slate-500', bg: 'bg-slate-100 border-slate-200', icon: MessageSquare },
 Şüpheli: { label: 'Şüpheli', color: 'text-amber-600', bg: 'bg-amber-100 border-amber-200', icon: Eye },
 Stresli: { label: 'Yüksek Stres',color: 'text-orange-600', bg: 'bg-orange-100 border-orange-200', icon: AlertTriangle },
 Savunmacı: { label: 'Savunmacı', color: 'text-red-600', bg: 'bg-red-100 border-red-200', icon: Shield },
 Kaçamak: { label: 'Kaçamak', color: 'text-red-700', bg: 'bg-red-200 border-red-300', icon: Zap },
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
 'Planlandı': { label: 'Planlandı', color: 'bg-slate-100 text-slate-600 border-slate-200' },
 'Devam Ediyor': { label: 'Devam Ediyor', color: 'bg-blue-100 text-blue-700 border-blue-200' },
 'Tamamlandı': { label: 'Tamamlandı', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
 'İptal': { label: 'İptal', color: 'bg-red-100 text-red-500 border-red-200' },
};

// ─── Mini Waveform (dekoratif) ───────────────────────────────────────────────

function WaveformBar({ active, height }: { active: boolean; height: number }) {
 return (
 <motion.div
 className={clsx('w-0.5 rounded-full', active ? 'bg-blue-500' : 'bg-slate-200')}
 style={{ height }}
 animate={active ? { scaleY: [1, 1.4, 0.8, 1.2, 1] } : { scaleY: 1 }}
 transition={{ duration: 1.2, repeat: Infinity, delay: Math.random() * 0.5 }}
 />
 );
}

function MiniWaveform({ active }: { active: boolean }) {
 const bars = [12, 20, 16, 28, 18, 24, 14, 30, 16, 22, 10, 26, 18, 28, 14];
 return (
 <div className="flex items-center gap-0.5 h-8">
 {(bars || []).map((h, i) => (
 <WaveformBar key={i} active={active} height={h} />
 ))}
 </div>
 );
}

// ─── Risk Score Göstergesi ───────────────────────────────────────────────────

function RiskGauge({ score }: { score: number }) {
 const pct = Math.min(100, Math.max(0, (score ?? 0) * 10));
 const color = score >= 7 ? 'from-red-500 to-red-600' : score >= 4 ? 'from-amber-400 to-orange-500' : 'from-emerald-400 to-teal-500';

 return (
 <div className="space-y-1">
 <div className="flex items-center justify-between text-[10px]">
 <span className="font-bold text-slate-600">AI Risk Skoru</span>
 <span className={clsx('font-black text-base', score >= 7 ? 'text-red-600' : score >= 4 ? 'text-amber-600' : 'text-emerald-600')}>
 {(score ?? 0).toFixed(1)} / 10
 </span>
 </div>
 <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
 <motion.div
 className={clsx('h-full rounded-full bg-gradient-to-r', color)}
 initial={{ width: 0 }}
 animate={{ width: `${pct}%` }}
 transition={{ duration: 1, ease: 'easeOut' }}
 />
 </div>
 </div>
 );
}

// ─── Session Card ─────────────────────────────────────────────────────────────

function SessionCard({
 session,
 onSelect,
 isSelected,
}: {
 session: InterviewSession;
 onSelect: () => void;
 isSelected: boolean;
}) {
 const st = STATUS_MAP[session?.status ?? 'Planlandı'] ?? STATUS_MAP['Planlandı'];
 const sent = SENTIMENT_MAP[session?.overall_sentiment ?? 'Nötr'] ?? SENTIMENT_MAP['Nötr'];
 const SentIcon = sent.icon;

 return (
 <motion.div
 layout
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 onClick={onSelect}
 className={clsx(
 'cursor-pointer rounded-xl border p-4 transition-all',
 'bg-white/70 backdrop-blur-lg shadow-sm',
 isSelected
 ? 'border-blue-400 ring-2 ring-blue-200 shadow-lg'
 : 'border-slate-200 hover:border-blue-200 hover:shadow-md',
 )}
 >
 <div className="flex items-start justify-between gap-2 mb-3">
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-1 flex-wrap">
 <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full border', st.color)}>
 {st.label}
 </span>
 <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1', sent.bg, sent.color)}>
 <SentIcon size={9} />
 {sent.label}
 </span>
 </div>
 <h3 className="text-sm font-bold text-slate-800 leading-snug truncate">{session?.title ?? '—'}</h3>
 <div className="flex items-center gap-3 mt-1">
 <span className="flex items-center gap-1 text-[10px] text-slate-500">
 <Users size={9} /> {session?.subject_name ?? '—'}
 </span>
 {session?.subject_department && (
 <span className="text-[10px] text-slate-400">{session.subject_department}</span>
 )}
 </div>
 </div>
 <ChevronRight size={13} className={clsx('text-slate-300 mt-1 transition-transform', isSelected && 'rotate-90')} />
 </div>

 <RiskGauge score={session?.ai_risk_score ?? 0} />

 {(session?.risk_topics || []).length > 0 && (
 <div className="flex flex-wrap gap-1 mt-2">
 {(session?.risk_topics || []).slice(0, 3).map((t) => (
 <span key={t} className="text-[9px] font-medium bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">
 {t}
 </span>
 ))}
 </div>
 )}
 </motion.div>
 );
}

// ─── Transcript Panel ─────────────────────────────────────────────────────────

function TranscriptPanel({ sessionId }: { sessionId: string }) {
 const { data: lines, isLoading, error } = useTranscript(sessionId);

 const flaggedCount = (lines || []).filter((l) => l?.ai_flag).length;

 return (
 <div className="space-y-4">
 {/* Özet Bar */}
 {!isLoading && (lines || []).length > 0 && (
 <div className="grid grid-cols-3 gap-2">
 <div className="bg-white/70 rounded-xl border border-slate-200 p-3 text-center">
 <div className="text-lg font-black text-slate-800">{(lines || []).length}</div>
 <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Toplam Satır</div>
 </div>
 <div className="bg-white/70 rounded-xl border border-red-200 p-3 text-center">
 <div className="text-lg font-black text-red-600">{flaggedCount}</div>
 <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">AI Uyarısı</div>
 </div>
 <div className="bg-white/70 rounded-xl border border-amber-200 p-3 text-center">
 <div className="text-lg font-black text-amber-600">
 {(lines || []).filter((l) => l?.speaker === 'Muhatap').length}
 </div>
 <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Muhatap Cevabı</div>
 </div>
 </div>
 )}

 {/* Transkript */}
 <div className="bg-white/70 backdrop-blur-lg rounded-2xl border border-slate-200 shadow-sm p-4">
 <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-2">
 <Volume2 size={12} className="text-blue-500" />
 Transkript — AI Analizi
 </h4>

 {isLoading && (
 <div className="flex items-center gap-2 py-4 text-slate-400 justify-center">
 <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
 <span className="text-xs">Transkript yükleniyor...</span>
 </div>
 )}

 {error && (
 <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
 <AlertTriangle size={12} />
 Transkript yüklenemedi.
 </div>
 )}

 <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
 {(lines || []).map((line, idx) => {
 const s = SENTIMENT_MAP[line?.sentiment ?? 'Nötr'] ?? SENTIMENT_MAP['Nötr'];
 const SIcon = s.icon;
 const isDenetci = line?.speaker === 'Denetçi';

 return (
 <motion.div
 key={line?.id ?? idx}
 initial={{ opacity: 0, x: isDenetci ? -8 : 8 }}
 animate={{ opacity: 1, x: 0 }}
 className={clsx(
 'rounded-xl p-3 border transition-all',
 line?.ai_flag
 ? 'bg-red-50/80 border-red-200 ring-1 ring-red-200'
 : isDenetci
 ? 'bg-slate-50 border-slate-100'
 : 'bg-white border-slate-200',
 )}
 >
 <div className="flex items-center justify-between mb-1">
 <span className={clsx('text-[10px] font-bold', isDenetci ? 'text-blue-600' : 'text-slate-700')}>
 {line?.speaker ?? 'Bilinmiyor'}
 </span>
 <div className="flex items-center gap-1.5">
 {line?.ai_flag && (
 <span className="flex items-center gap-1 text-[9px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">
 <Zap size={8} />
 {line.ai_flag}
 </span>
 )}
 <span className={clsx('flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full border', s.bg, s.color)}>
 <SIcon size={8} />
 {s.label}
 </span>
 <span className="text-[9px] text-slate-300">
 {Math.round((line?.confidence ?? 0.75) * 100)}%
 </span>
 </div>
 </div>

 <p className="text-[11px] text-slate-700 leading-relaxed">
 {/* transcript || 'Kayıt bulunamadı' fallback API katmanında yapılıyor */}
 {line?.transcript ?? 'Kayıt bulunamadı'}
 </p>

 {line?.ai_note && (
 <div className="mt-1.5 flex items-start gap-1.5 text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
 <Brain size={10} className="mt-0.5 flex-shrink-0" />
 <span className="italic">{line.ai_note}</span>
 </div>
 )}

 {(line?.keywords || []).length > 0 && (
 <div className="flex flex-wrap gap-1 mt-1.5">
 {(line?.keywords || []).map((k) => (
 <span key={k} className="text-[8px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
 #{k}
 </span>
 ))}
 </div>
 )}
 </motion.div>
 );
 })}

 {!isLoading && (lines || []).length === 0 && (
 <div className="text-center py-5 text-slate-400">
 <Volume2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
 <p className="text-xs">Bu oturum için transkript kaydı bulunamadı</p>
 </div>
 )}
 </div>
 </div>
 </div>
 );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CognitiveInterviewPage() {
 const { data: sessions, isLoading, error } = useInterviews();
 const [selectedId, setSelectedId] = useState<string | null>(null);

 const selected = (sessions || []).find((s) => s?.id === selectedId) ?? null;

 const stats = {
 total: (sessions || []).length,
 devam: (sessions || []).filter((s) => s?.status === 'Devam Ediyor').length,
 tamamlandi: (sessions || []).filter((s) => s?.status === 'Tamamlandı').length,
 kritik: (sessions || []).filter((s) => (s?.ai_risk_score ?? 0) >= 7).length,
 };

 return (
 <div className="min-h-screen p-4">
 {/* Header */}
 <motion.div
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 className="mb-4"
 >
 <div className="flex items-center gap-3 mb-1">
 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-700 to-purple-800 flex items-center justify-center shadow-sm">
 <Brain className="w-5 h-5 text-white" />
 </div>
 <div>
 <h1 className="text-xl font-black text-slate-900 tracking-tight">Cognitive Interview Assistant</h1>
 <p className="text-xs text-slate-500">Bilişsel Denetim Mülakat Asistanı — AI Transkript & Duygu Analizi</p>
 </div>
 <div className="ml-auto">
 <MiniWaveform active={stats.devam > 0} />
 </div>
 </div>

 {/* KPI */}
 <div className="grid grid-cols-4 gap-3 mt-4">
 {[
 { label: 'Toplam Oturum', value: stats.total, icon: Mic, color: 'text-slate-700' },
 { label: 'Devam Ediyor', value: stats.devam, icon: Volume2, color: 'text-blue-600' },
 { label: 'Tamamlandı', value: stats.tamamlandi, icon: CheckCircle, color: 'text-emerald-600' },
 { label: 'Kritik Risk', value: stats.kritik, icon: AlertTriangle,color: 'text-red-600' },
 ].map(({ label, value, icon: Icon, color }) => (
 <div key={label} className="bg-white/70 backdrop-blur-lg rounded-xl border border-slate-200 px-4 py-3 shadow-sm">
 <Icon size={14} className={clsx(color, 'mb-1')} />
 <div className="text-xl font-black text-slate-800">{value}</div>
 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</div>
 </div>
 ))}
 </div>
 </motion.div>

 {/* Body */}
 {isLoading && (
 <div className="flex items-center justify-center py-20 text-slate-400">
 <div className="w-6 h-6 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mr-3" />
 <span className="text-sm">Mülakat oturumları yükleniyor...</span>
 </div>
 )}

 {error && (
 <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
 <AlertTriangle size={16} />
 Mülakat listesi yüklenemedi. Supabase bağlantısını kontrol edin.
 </div>
 )}

 {!isLoading && !error && (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
 {/* Oturum Listesi */}
 <div className="space-y-3">
 <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
 <Mic size={11} /> Mülakat Oturumları
 </div>

 {(sessions || []).length === 0 && (
 <div className="text-center py-14 text-slate-400 rounded-2xl border-2 border-dashed border-slate-200 bg-white/40">
 <MicOff className="w-10 h-10 mx-auto mb-2 opacity-30" />
 <p className="text-sm">Kayıtlı mülakat oturumu bulunamadı</p>
 </div>
 )}

 {(sessions || []).map((session) => (
 <SessionCard
 key={session?.id}
 session={session}
 onSelect={() => setSelectedId(session?.id === selectedId ? null : session?.id)}
 isSelected={session?.id === selectedId}
 />
 ))}
 </div>

 {/* Detay: Transkript & Analiz */}
 <div>
 <AnimatePresence mode="wait">
 {selected ? (
 <motion.div
 key={selected.id}
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: 20 }}
 transition={{ duration: 0.2 }}
 >
 <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
 <Brain size={11} className="text-indigo-500" /> AI Transkript Analizi
 </div>
 {/* Oturum bilgi kartı */}
 <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-slate-200 p-4 shadow-sm mb-4">
 <div className="flex items-start justify-between gap-2">
 <div>
 <div className="text-sm font-bold text-slate-800">{selected?.title ?? '—'}</div>
 <div className="text-[10px] text-slate-500 mt-0.5">
 Muhatap: <span className="font-semibold text-slate-700">{selected?.subject_name}</span>
 {selected?.subject_title && ` · ${selected.subject_title}`}
 </div>
 {selected?.purpose && (
 <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{selected.purpose}</p>
 )}
 </div>
 <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
 <MiniWaveform active={selected?.status === 'Devam Ediyor'} />
 {selected?.duration_seconds && selected.duration_seconds > 0 && (
 <span className="flex items-center gap-1 text-[10px] text-slate-400">
 <Clock size={9} />
 {Math.floor((selected?.duration_seconds ?? 0) / 60)}:{String((selected?.duration_seconds ?? 0) % 60).padStart(2, '0')}
 </span>
 )}
 </div>
 </div>
 <div className="mt-3">
 <RiskGauge score={selected?.ai_risk_score ?? 0} />
 </div>
 </div>
 <TranscriptPanel sessionId={selected.id} />
 </motion.div>
 ) : (
 <motion.div
 key="empty"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="flex flex-col items-center justify-center h-64 text-slate-400 rounded-2xl border-2 border-dashed border-slate-200 bg-white/40"
 >
 <Brain className="w-12 h-12 mb-3 opacity-30" />
 <p className="text-sm font-medium">Soldaki listeden bir mülakat seçin</p>
 <p className="text-xs mt-1">AI transkript ve duygu analizi burada görüntülenir</p>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </div>
 )}
 </div>
 );
}
