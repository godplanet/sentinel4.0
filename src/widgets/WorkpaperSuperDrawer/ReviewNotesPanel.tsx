import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Send, CheckCircle2, Loader2, Sparkles, AlertCircle, Clock,
} from 'lucide-react';
import clsx from 'clsx';
import type { ReviewNote } from '@/entities/workpaper/model/detail-types';

const AGGRESSIVE_PATTERNS = [
  /terrible/i, /awful/i, /worst/i, /horrible/i, /pathetic/i,
  /incompetent/i, /stupid/i, /lazy/i, /useless/i, /trash/i,
  /berbat/i, /rezalet/i, /felaket/i, /kotu/i, /beceriksiz/i,
  /saçma/i, /sacma/i, /iğrenç/i, /igrenc/i,
];

function checkTone(text: string): boolean {
  return AGGRESSIVE_PATTERNS.some(p => p.test(text));
}

interface ReviewNotesPanelProps {
  notes: ReviewNote[];
  loading: boolean;
  onAddNote: (text: string) => Promise<void>;
  onResolveNote: (noteId: string) => Promise<void>;
}

export function ReviewNotesPanel({
  notes, loading, onAddNote, onResolveNote,
}: ReviewNotesPanelProps) {
  const [newNote, setNewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [toneWarning, setToneWarning] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const openCount = notes.filter(n => n.status === 'Open').length;
  const resolvedCount = notes.filter(n => n.status === 'Resolved').length;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [notes.length]);

  useEffect(() => {
    if (newNote.length > 10) {
      setToneWarning(checkTone(newNote));
    } else {
      setToneWarning(false);
    }
  }, [newNote]);

  const handleSubmit = async () => {
    if (!newNote.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onAddNote(newNote.trim());
      setNewNote('');
      setToneWarning(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async (noteId: string) => {
    setResolvingId(noteId);
    try {
      await onResolveNote(noteId);
    } finally {
      setResolvingId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="animate-spin text-blue-600 mr-2" size={20} />
        <span className="text-sm text-slate-500">Yukleniyor...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {(openCount > 0 || resolvedCount > 0) && (
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle size={12} className="text-amber-600" />
            <span className="text-xs font-bold text-amber-700">{openCount} Acik</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg">
            <CheckCircle2 size={12} className="text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700">{resolvedCount} Cozuldu</span>
          </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto mb-4 min-h-[200px]">
        {notes.length === 0 && (
          <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
            <MessageSquare className="mx-auto text-slate-300 mb-3" size={36} />
            <p className="text-sm text-slate-500 font-medium">Henuz gozden gecirme notu yok</p>
            <p className="text-xs text-slate-400 mt-1">
              Asagidaki alani kullanarak ekip uyelerinize not birakin
            </p>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {notes.map((note) => {
            const isResolved = note.status === 'Resolved';
            const initials = note.author_name
              .split(' ')
              .map(w => w[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();

            return (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={clsx(
                  'rounded-xl border p-3.5 transition-all',
                  isResolved
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : 'bg-white border-blue-200 shadow-sm'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={clsx(
                    'shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white',
                    isResolved ? 'bg-slate-400' : 'bg-blue-600'
                  )}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-slate-900">{note.author_name}</span>
                      <span className={clsx(
                        'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                        isResolved
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      )}>
                        {isResolved ? 'Cozuldu' : 'Acik'}
                      </span>
                    </div>
                    <p className={clsx(
                      'text-sm leading-relaxed mb-2',
                      isResolved ? 'text-slate-500 line-through' : 'text-slate-700'
                    )}>
                      {note.note_text}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock size={10} />
                        <span>{new Date(note.created_at).toLocaleString('tr-TR', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}</span>
                      </div>
                      {!isResolved && (
                        <button
                          onClick={() => handleResolve(note.id)}
                          disabled={resolvingId === note.id}
                          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {resolvingId === note.id ? (
                            <Loader2 size={10} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={10} />
                          )}
                          Cozuldu Isaretle
                        </button>
                      )}
                    </div>
                    {isResolved && note.resolved_at && (
                      <p className="text-[10px] text-emerald-600 mt-1">
                        Cozulme: {new Date(note.resolved_at).toLocaleString('tr-TR', {
                          day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="shrink-0 border-t border-slate-200 pt-3 space-y-2">
        <AnimatePresence>
          {toneWarning && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <Sparkles size={14} className="text-blue-600 shrink-0" />
                <p className="text-xs text-blue-800">
                  <span className="font-bold">Sentinel Onerisi:</span>{' '}
                  Daha yapici bir dil kullanmayi deneyin. Olumlu geri bildirim ekip motivasyonunu arttirir.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Gozden gecirme notu yazin..."
              rows={2}
              className={clsx(
                'w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 resize-none bg-white transition-colors',
                toneWarning
                  ? 'border-blue-300 focus:ring-blue-500'
                  : 'border-slate-200 focus:ring-blue-500'
              )}
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!newNote.trim() || submitting}
            className="shrink-0 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
        <p className="text-[10px] text-slate-400 text-center">
          Enter ile gonder, Shift+Enter ile yeni satir
        </p>
      </div>
    </div>
  );
}
