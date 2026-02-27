import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Send, User, Shield, AlertTriangle,
  Loader2, FileText, CheckCircle2, Clock,
} from 'lucide-react';
import clsx from 'clsx';
import type {
  InterrogationLog, TranscriptLine, ContradictionFlag,
  DigitalEvidence, ContradictionSeverity,
} from '@/features/investigation/types';
import { CONTRADICTION_SEVERITY_LABELS } from '@/features/investigation/types';
import {
  fetchInterrogationLogs, createInterrogationSession,
  appendTranscriptLine, addContradictionFlag, completeInterrogation,
} from '@/features/investigation/VaultGuard';
import { detectContradictions } from '@/features/investigation/ContradictionEngine';

interface InterrogationRoomProps {
  caseId: string;
  suspectName: string;
  evidence: DigitalEvidence[];
}

const SEVERITY_COLORS: Record<ContradictionSeverity, { bg: string; border: string; text: string; icon: string }> = {
  CRITICAL: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-800', icon: 'text-red-500' },
  HIGH: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-800', icon: 'text-amber-500' },
  MEDIUM: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-800', icon: 'text-blue-500' },
  LOW: { bg: 'bg-slate-50', border: 'border-slate-300', text: 'text-slate-700', icon: 'text-slate-500' },
};

const SIMULATED_STT_PHRASES = [
  'Ses tanima baslatildi...',
  'Dinleniyor...',
  'Kelimeler isleniyor...',
];

export function InterrogationRoom({ caseId, suspectName, evidence }: InterrogationRoomProps) {
  const [session, setSession] = useState<InterrogationLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [speaker, setSpeaker] = useState<'INTERVIEWER' | 'SUSPECT'>('INTERVIEWER');
  const [sttActive, setSttActive] = useState(false);
  const [sttStatus, setSttStatus] = useState('');
  const [newContradiction, setNewContradiction] = useState<ContradictionFlag | null>(null);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const logs = await fetchInterrogationLogs(caseId);
        if (logs.length > 0) {
          setSession(logs[logs.length - 1] as InterrogationLog);
        }
      } catch (err) {
        console.error('Failed to load interrogation logs:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [caseId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session?.transcript]);

  const handleStartSession = useCallback(async () => {
    try {
      const data = await createInterrogationSession(caseId, suspectName, 'Mevcut Gorusmeci');
      setSession(data as InterrogationLog);
    } catch (err) {
      console.error('Failed to start session:', err);
    }
  }, [caseId, suspectName]);

  const handleSendLine = useCallback(async () => {
    if (!session || !inputText.trim()) return;
    setSending(true);

    const line: TranscriptLine = {
      speaker,
      text: inputText.trim(),
      ts: new Date().toISOString(),
    };

    try {
      const updated = await appendTranscriptLine(session.id, session.transcript, line);
      if (updated) setSession(updated as InterrogationLog);

      if (speaker === 'SUSPECT') {
        const contradictions = detectContradictions(inputText, evidence);
        if (contradictions.length > 0) {
          const flag = contradictions[0];
          setNewContradiction(flag);
          const flagged = await addContradictionFlag(
            session.id,
            (updated as InterrogationLog)?.ai_contradiction_flags || session.ai_contradiction_flags,
            flag,
          );
          if (flagged) setSession(flagged as InterrogationLog);

          setTimeout(() => setNewContradiction(null), 8000);
        }
      }

      setInputText('');
    } catch (err) {
      console.error('Failed to send line:', err);
    } finally {
      setSending(false);
    }
  }, [session, inputText, speaker, evidence]);

  const handleCompleteSession = useCallback(async () => {
    if (!session) return;
    try {
      const data = await completeInterrogation(session.id);
      if (data) setSession(data as InterrogationLog);
    } catch (err) {
      console.error('Failed to complete session:', err);
    }
  }, [session]);

  const toggleSTT = useCallback(() => {
    setSttActive((prev) => {
      const next = !prev;
      if (next) {
        let idx = 0;
        const interval = setInterval(() => {
          setSttStatus(SIMULATED_STT_PHRASES[idx % SIMULATED_STT_PHRASES.length]);
          idx++;
        }, 1500);
        setTimeout(() => {
          clearInterval(interval);
          setSttActive(false);
          setSttStatus('');
          setInputText((prev) => prev + (prev ? ' ' : '') + 'Simule edilmis ses-metin donusumu metni');
        }, 4500);
      } else {
        setSttStatus('');
      }
      return next;
    });
  }, []);

  const generateStatement = useCallback(() => {
    if (!session) return;

    const lines = session.transcript.map((l: TranscriptLine) => {
      const time = new Date(l.ts).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      const label = l.speaker === 'INTERVIEWER' ? 'GORUSMECI' : 'IFADE VEREN';
      return `[${time}] ${label}: ${l.text}`;
    });

    const contradictions = session.ai_contradiction_flags.map((c: ContradictionFlag, i: number) =>
      `${i + 1}. [${c.severity}] Iddia: "${c.claim}"\n   Kanit: ${c.evidence_detail}\n   Kaynak: ${c.evidence_source}`,
    );

    const doc = [
      '=' .repeat(60),
      'IFADE TUTANAGI',
      '=' .repeat(60),
      '',
      `Dosya No: ${caseId.slice(0, 8).toUpperCase()}`,
      `Oturum: #${session.session_number}`,
      `Tarih: ${new Date(session.started_at).toLocaleString('tr-TR')}`,
      `Ifade Veren: ${session.suspect_name}`,
      `Gorusmeci: ${session.interviewer_name}`,
      '',
      '-'.repeat(60),
      'GORUSME KAYDI',
      '-'.repeat(60),
      '',
      ...lines,
      '',
      ...(contradictions.length > 0 ? [
        '-'.repeat(60),
        'SHERLOCK AI - TESPIT EDILEN CELISKILER',
        '-'.repeat(60),
        '',
        ...contradictions,
      ] : []),
      '',
      '-'.repeat(60),
      'IMZA',
      '-'.repeat(60),
      '',
      'Ifade Veren: ________________________',
      '',
      'Gorusmeci:  ________________________',
      '',
      `Olusturulma: ${new Date().toLocaleString('tr-TR')}`,
      'Sentinel GRC v3.0 - Otomatik Ifade Tutanagi',
    ].join('\n');

    const blob = new Blob([doc], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ifade_tutanagi_${session.suspect_name.replace(/\s+/g, '_')}_oturum${session.session_number}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [session, caseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={20} className="animate-spin text-slate-400" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-12 space-y-3">
        <Mic size={32} className="mx-auto text-slate-300" />
        <p className="text-sm text-slate-500">Henuz gorusme oturumu baslatilmadi.</p>
        <button
          onClick={handleStartSession}
          className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors"
        >
          Yeni Oturum Baslat
        </button>
      </div>
    );
  }

  const isActive = session.status === 'IN_PROGRESS';
  const transcript = session.transcript as TranscriptLine[];
  const flags = session.ai_contradiction_flags as ContradictionFlag[];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div className="xl:col-span-2 flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden" style={{ minHeight: 500 }}>
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className={clsx(
              'w-2 h-2 rounded-full',
              isActive ? 'bg-red-500 animate-pulse' : 'bg-slate-300',
            )} />
            <span className="text-xs font-bold text-slate-700">
              Oturum #{session.session_number} - {session.suspect_name}
            </span>
            {!isActive && (
              <span className="text-[9px] px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full font-bold">
                TAMAMLANDI
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isActive && (
              <button
                onClick={handleCompleteSession}
                className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
              >
                <CheckCircle2 size={10} />
                Oturumu Bitir
              </button>
            )}
            <button
              onClick={generateStatement}
              className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <FileText size={10} />
              Ifade Tutanagi Olustur
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {transcript.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={clsx(
                'flex gap-3',
                line.speaker === 'SUSPECT' ? 'flex-row-reverse' : '',
              )}
            >
              <div className={clsx(
                'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                line.speaker === 'INTERVIEWER'
                  ? 'bg-slate-100'
                  : 'bg-red-50',
              )}>
                {line.speaker === 'INTERVIEWER'
                  ? <Shield size={14} className="text-slate-500" />
                  : <User size={14} className="text-red-500" />
                }
              </div>
              <div className={clsx(
                'max-w-[75%] px-3 py-2 rounded-xl',
                line.speaker === 'INTERVIEWER'
                  ? 'bg-slate-100 text-slate-800'
                  : 'bg-red-50 text-red-900 border border-red-100',
              )}>
                <span className="text-[10px] font-bold block mb-0.5">
                  {line.speaker === 'INTERVIEWER' ? 'Gorusmeci' : session.suspect_name}
                </span>
                <p className="text-xs leading-relaxed">{line.text}</p>
                <span className="text-[9px] text-slate-400 block mt-1">
                  {new Date(line.ts).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {newContradiction && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mx-4 mb-2 p-3 bg-red-50 border-2 border-red-300 rounded-xl animate-pulse">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={14} className="text-red-600" />
                  <span className="text-xs font-bold text-red-700">CELISKI TESPIT EDILDI</span>
                </div>
                <p className="text-[11px] text-red-800 leading-relaxed">{newContradiction.evidence_detail}</p>
                <span className="text-[9px] text-red-500 block mt-1">Kaynak: {newContradiction.evidence_source}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isActive && (
          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => setSpeaker('INTERVIEWER')}
                className={clsx(
                  'px-2.5 py-1 text-[10px] font-bold rounded-lg transition-colors',
                  speaker === 'INTERVIEWER'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300',
                )}
              >
                Gorusmeci
              </button>
              <button
                onClick={() => setSpeaker('SUSPECT')}
                className={clsx(
                  'px-2.5 py-1 text-[10px] font-bold rounded-lg transition-colors',
                  speaker === 'SUSPECT'
                    ? 'bg-red-600 text-white'
                    : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200',
                )}
              >
                {suspectName}
              </button>
              <div className="flex-1" />
              <button
                onClick={toggleSTT}
                className={clsx(
                  'flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all',
                  sttActive
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300',
                )}
              >
                {sttActive ? <MicOff size={10} /> : <Mic size={10} />}
                {sttActive ? sttStatus || 'Kayit' : 'Ses-Metin'}
              </button>
            </div>
            <div className="flex gap-2">
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendLine(); } }}
                placeholder={speaker === 'INTERVIEWER' ? 'Sorunuzu yazin...' : `${suspectName} ifadesi...`}
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-slate-400 transition-colors"
              />
              <button
                onClick={handleSendLine}
                disabled={sending || !inputText.trim()}
                className="flex items-center gap-1 px-3 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {sending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-amber-500" />
            <span className="text-xs font-bold text-slate-700">Sherlock Copilot</span>
            <span className="text-[9px] px-1.5 py-0.5 bg-amber-100 text-amber-600 rounded-full font-bold">
              {flags.length} celiski
            </span>
          </div>

          {flags.length === 0 ? (
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Sherlock canli olarak ifadeleri donmus kanitlarla karsilastiriyor.
              Celiski tespit edildiginde burada gorunecek.
            </p>
          ) : (
            <div className="space-y-2">
              {flags.map((flag) => {
                const colors = SEVERITY_COLORS[flag.severity as ContradictionSeverity] || SEVERITY_COLORS.MEDIUM;
                return (
                  <motion.div
                    key={flag.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={clsx(
                      'p-3 rounded-lg border',
                      colors.bg, colors.border,
                    )}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <AlertTriangle size={10} className={colors.icon} />
                      <span className={clsx('text-[9px] font-bold', colors.text)}>
                        {CONTRADICTION_SEVERITY_LABELS[flag.severity as ContradictionSeverity]}
                      </span>
                      <span className="text-[8px] text-slate-400 ml-auto">
                        {new Date(flag.detected_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className={clsx('text-[10px] leading-relaxed mb-1', colors.text)}>
                      Iddia: &quot;{flag.claim}&quot;
                    </p>
                    <p className="text-[10px] text-slate-600 leading-relaxed">{flag.evidence_detail}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <Clock size={8} className="text-slate-400" />
                      <span className="text-[8px] text-slate-400">{flag.evidence_source}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
          <span className="text-[10px] font-bold text-slate-500 block mb-2">Oturum Bilgileri</span>
          <div className="space-y-1.5 text-[10px] text-slate-600">
            <div className="flex justify-between">
              <span>Oturum</span>
              <span className="font-mono">#{session.session_number}</span>
            </div>
            <div className="flex justify-between">
              <span>Ifade Veren</span>
              <span className="font-medium">{session.suspect_name}</span>
            </div>
            <div className="flex justify-between">
              <span>Gorusmeci</span>
              <span className="font-medium">{session.interviewer_name}</span>
            </div>
            <div className="flex justify-between">
              <span>Satir Sayisi</span>
              <span className="font-mono">{transcript.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Celiski</span>
              <span className={clsx('font-bold', flags.length > 0 ? 'text-red-600' : 'text-emerald-600')}>
                {flags.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
