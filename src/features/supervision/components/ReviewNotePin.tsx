import { useState } from 'react';
import type { ReviewNote } from '@/entities/workpaper/model/types';
import { MessageSquare, CheckCircle, X } from 'lucide-react';
import clsx from 'clsx';

interface ReviewNotePinProps {
  note: ReviewNote;
  onResolve?: (noteId: string) => void;
  canResolve?: boolean;
}

export const ReviewNotePin = ({ note, onResolve, canResolve = false }: ReviewNotePinProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const isOpen_Status = note.status === 'OPEN';

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'relative flex items-center justify-center w-6 h-6 rounded-full transition-all',
          isOpen_Status
            ? 'bg-amber-500 hover:bg-amber-600 animate-pulse'
            : 'bg-green-500 hover:bg-green-600'
        )}
        title={isOpen_Status ? 'Açık inceleme notu' : 'Çözülen not'}
      >
        <MessageSquare className="w-3.5 h-3.5 text-white" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 top-8 z-50 w-80 bg-white border border-gray-200 rounded-lg shadow-2xl">
            <div
              className={clsx(
                'flex items-center justify-between p-3 border-b',
                isOpen_Status ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'
              )}
            >
              <div className="flex items-center gap-2">
                <MessageSquare
                  className={clsx('w-4 h-4', isOpen_Status ? 'text-amber-600' : 'text-green-600')}
                />
                <span
                  className={clsx(
                    'text-xs font-semibold uppercase',
                    isOpen_Status ? 'text-amber-700' : 'text-green-700'
                  )}
                >
                  {isOpen_Status ? 'Açık Not' : 'Çözüldü'}
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/50 rounded transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="p-4">
              <div className="mb-3">
                <div className="text-xs font-medium text-gray-500 mb-1">Alan:</div>
                <div className="text-sm font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
                  {note.field_key}
                </div>
              </div>

              <div className="mb-3">
                <div className="text-xs font-medium text-gray-500 mb-1">Not:</div>
                <div className="text-sm text-gray-900 leading-relaxed">{note.note_text}</div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                <span>Yönetici</span>
                <span>
                  {new Date(note.created_at).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {isOpen_Status && canResolve && onResolve && (
                <button
                  onClick={() => {
                    onResolve(note.id);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Çözüldü Olarak İşaretle
                </button>
              )}

              {note.status === 'RESOLVED' && note.resolved_at && (
                <div className="p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                  Çözüldü:{' '}
                  {new Date(note.resolved_at).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
