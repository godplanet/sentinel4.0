import { CheckCheck, MessageSquare, Clock } from 'lucide-react';
import { useActiveReportStore } from '@/entities/report';
import type { M6ReviewNote } from '@/entities/report';

function ReviewNoteCard({ note, onResolve }: { note: M6ReviewNote; onResolve: () => void }) {
  const isResolved = note.status === 'resolved';

  return (
    <div
      className={`rounded-xl border shadow-sm p-3 mb-3 transition-all ${
        isResolved
          ? 'bg-slate-50 border-slate-200 opacity-60'
          : 'bg-white border-slate-200 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <MessageSquare size={12} className={isResolved ? 'text-slate-400' : 'text-amber-500 flex-shrink-0'} />
          <span className="text-xs font-sans font-semibold text-slate-600 truncate">{note.createdBy}</span>
        </div>
        {isResolved ? (
          <span className="flex items-center gap-1 text-xs font-sans font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex-shrink-0">
            <CheckCheck size={10} />
            Çözüldü
          </span>
        ) : (
          <button
            onClick={onResolve}
            className="flex items-center gap-1 text-xs font-sans font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-full transition-colors flex-shrink-0 border border-emerald-200"
          >
            <CheckCheck size={10} />
            Çöz
          </button>
        )}
      </div>

      {note.selectedText && (
        <p className="text-xs font-serif italic text-slate-600 bg-amber-50 border-l-2 border-amber-300 px-2 py-1 rounded-r mb-2 line-clamp-2">
          &ldquo;{note.selectedText}&rdquo;
        </p>
      )}

      <p className={`text-xs font-sans leading-relaxed ${isResolved ? 'text-slate-400' : 'text-slate-700'}`}>
        {note.comment}
      </p>

      <div className="flex items-center gap-1 mt-2">
        <Clock size={10} className="text-slate-300" />
        <span className="text-xs text-slate-400 font-sans">
          {new Date(note.createdAt).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
}

export function ReviewNotesSidebar() {
  const { activeReport, resolveReviewNote } = useActiveReportStore();
  const notes = activeReport?.reviewNotes ?? [];

  const openNotes = notes.filter((n) => n.status === 'open');
  const resolvedNotes = notes.filter((n) => n.status === 'resolved');

  return (
    <aside className="no-print report-review-sidebar w-72 flex-shrink-0 border-l border-slate-200 bg-slate-50 flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare size={14} className="text-amber-500" />
          <h3 className="text-sm font-sans font-semibold text-slate-800">Gözden Geçirme Notları</h3>
        </div>
        {openNotes.length > 0 && (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-xs font-bold font-sans">
            {openNotes.length}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {notes.length === 0 ? (
          <div className="text-center py-10">
            <MessageSquare size={28} className="text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400 font-sans font-medium">Henüz yorum yok</p>
            <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">
              Rapordaki bir metni seçip "Yorum Ekle"ye tıklayın.
            </p>
          </div>
        ) : (
          <>
            {openNotes.length > 0 && (
              <>
                <p className="text-xs font-sans font-semibold uppercase tracking-widest text-slate-400 mb-2 px-1">
                  Açık ({openNotes.length})
                </p>
                {openNotes.map((note) => (
                  <ReviewNoteCard
                    key={note.id}
                    note={note}
                    onResolve={() => resolveReviewNote(note.id)}
                  />
                ))}
              </>
            )}

            {resolvedNotes.length > 0 && (
              <>
                <p className="text-xs font-sans font-semibold uppercase tracking-widest text-slate-300 mb-2 mt-4 px-1">
                  Çözüldü ({resolvedNotes.length})
                </p>
                {resolvedNotes.map((note) => (
                  <ReviewNoteCard
                    key={note.id}
                    note={note}
                    onResolve={() => resolveReviewNote(note.id)}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
