import { useState } from 'react';
import type { ReviewNote, Workpaper } from '@/entities/workpaper/model/types';
import {
  MessageSquare,
  Plus,
  CheckCircle,
  Clock,
  User,
  X,
  Send,
} from 'lucide-react';
import clsx from 'clsx';

interface ReviewNotesPanelProps {
  workpaper: Workpaper;
  notes: ReviewNote[];
  onAddNote: (fieldKey: string, noteText: string) => void;
  onResolveNote: (noteId: string) => void;
  currentUserId?: string;
  isReviewer?: boolean;
}

export const ReviewNotesPanel = ({
  workpaper,
  notes,
  onAddNote,
  onResolveNote,
  currentUserId,
  isReviewer = false,
}: ReviewNotesPanelProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNoteField, setNewNoteField] = useState('');
  const [newNoteText, setNewNoteText] = useState('');

  const openNotes = notes.filter((n) => n.status === 'OPEN');
  const resolvedNotes = notes.filter((n) => n.status === 'RESOLVED');

  const handleAddNote = () => {
    if (newNoteField.trim() && newNoteText.trim()) {
      onAddNote(newNoteField, newNoteText);
      setNewNoteField('');
      setNewNoteText('');
      setShowAddForm(false);
    }
  };

  const getFieldLabel = (fieldKey: string) => {
    const labels: Record<string, string> = {
      test_results: 'Test Sonuçları',
      notes: 'Notlar',
      field_values: 'Alan Değerleri',
      general: 'Genel',
    };
    return labels[fieldKey] || fieldKey;
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-lg shadow-xl h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">İnceleme Notları</h3>
          </div>
          <div className="flex items-center gap-2">
            {openNotes.length > 0 && (
              <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                {openNotes.length} Açık
              </span>
            )}
            {isReviewer && (
              <button
                onClick={() => setShowAddForm(true)}
                className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                title="Not ekle"
              >
                <Plus className="w-4 h-4 text-blue-600" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add Note Form */}
      {showAddForm && (
        <div className="p-4 bg-blue-50 border-b border-blue-200">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                Alan
              </label>
              <input
                type="text"
                value={newNoteField}
                onChange={(e) => setNewNoteField(e.target.value)}
                placeholder="Örn: test_results.sample_1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                Not
              </label>
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="İnceleme notunuzu yazın..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddNote}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Send className="w-4 h-4" />
                Gönder
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewNoteField('');
                  setNewNoteText('');
                }}
                className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Open Notes */}
        {openNotes.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-2">
              <Clock className="w-3 h-3" />
              Açık Notlar ({openNotes.length})
            </h4>
            <div className="space-y-2">
              {openNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-3 bg-orange-50 border border-orange-200 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-medium text-orange-700 bg-orange-100 px-2 py-0.5 rounded">
                      {getFieldLabel(note.field_key)}
                    </span>
                    {!isReviewer && (
                      <button
                        onClick={() => onResolveNote(note.id)}
                        className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Çözüldü
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-800 mb-2">{note.note_text}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <User className="w-3 h-3" />
                    <span>Yönetici</span>
                    <span>•</span>
                    <span>
                      {new Date(note.created_at).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resolved Notes */}
        {resolvedNotes.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-2">
              <CheckCircle className="w-3 h-3" />
              Çözülen Notlar ({resolvedNotes.length})
            </h4>
            <div className="space-y-2">
              {resolvedNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-3 bg-green-50 border border-green-200 rounded-lg opacity-75"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded">
                      {getFieldLabel(note.field_key)}
                    </span>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{note.note_text}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>
                      Çözüldü:{' '}
                      {note.resolved_at
                        ? new Date(note.resolved_at).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'short',
                          })
                        : '-'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {notes.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 text-sm">Henüz not yok</p>
            {isReviewer && (
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                İlk notu ekle
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
