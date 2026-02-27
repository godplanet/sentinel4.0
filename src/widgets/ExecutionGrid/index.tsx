import { useState } from 'react';
import { useWorkpaperStore } from '@/entities/execution';
import type { ReviewNote, Workpaper } from '@/entities/workpaper/model/types';
import { ReviewNotePin } from '@/features/supervision/components/ReviewNotePin';
import { WorkpaperDrawer } from '@/widgets/WorkpaperDrawer';
import {
  ShieldCheck,
  FileCheck,
  AlertCircle,
  RotateCcw,
  MessageSquarePlus,
  CheckCircle,
  FileText,
} from 'lucide-react';
import clsx from 'clsx';

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  fieldKey: string;
}

export function ExecutionGrid() {
  const { activeWorkpaper } = useWorkpaperStore();
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    fieldKey: '',
  });
  const [reviewNotes, setReviewNotes] = useState<ReviewNote[]>([
    {
      id: 'note-grid-001',
      tenant_id: '11111111-1111-1111-1111-111111111111',
      workpaper_id: activeWorkpaper?.id || '',
      field_key: 'test_sample_1',
      note_text: 'Bu test örneğinin dokümantasyonu eksik. Lütfen tüm adımları detaylı şekilde belgeleyin.',
      author_id: 'reviewer-001',
      status: 'OPEN',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);

  const [isAuditor] = useState(true);
  const [addNoteModal, setAddNoteModal] = useState(false);
  const [newNoteField, setNewNoteField] = useState('');
  const [newNoteText, setNewNoteText] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

  const openNotesCount = reviewNotes.filter((n) => n.status === 'OPEN').length;
  const isPrepared = activeWorkpaper?.prepared_by && activeWorkpaper?.prepared_at;
  const isReviewed = activeWorkpaper?.reviewed_by && activeWorkpaper?.reviewed_at;

  const handleContextMenu = (e: React.MouseEvent, fieldKey: string) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      fieldKey,
    });
  };

  const handleAddCoachingNote = () => {
    setNewNoteField(contextMenu.fieldKey);
    setContextMenu({ ...contextMenu, visible: false });
    setAddNoteModal(true);
  };

  const handleCreateNote = () => {
    if (!newNoteText.trim() || !activeWorkpaper) return;

    const newNote: ReviewNote = {
      id: `note-${Date.now()}`,
      tenant_id: '11111111-1111-1111-1111-111111111111',
      workpaper_id: activeWorkpaper.id,
      field_key: newNoteField,
      note_text: newNoteText,
      author_id: 'reviewer-001',
      status: 'OPEN',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setReviewNotes([...reviewNotes, newNote]);
    setNewNoteText('');
    setNewNoteField('');
    setAddNoteModal(false);
  };

  const handlePrepareWorkpaper = () => {
    if (confirm('Çalışma kağıdını tamamladığınızdan emin misiniz? İncelemeye gönderilecek.')) {
      alert('Çalışma kağıdı hazırlandı ve yönetici incelemesine gönderildi.');
    }
  };

  const handleApproveReview = () => {
    if (openNotesCount > 0) {
      alert(`${openNotesCount} açık not var. Önce tüm notları çözün.`);
      return;
    }
    if (confirm('Çalışma kağıdını onaylamak istediğinizden emin misiniz?')) {
      alert('Çalışma kağıdı onaylandı (Sign-off completed).');
    }
  };

  const handleReturnForRework = () => {
    if (confirm('Çalışma kağıdını yeniden çalışmaya göndermek istiyor musunuz?')) {
      alert('Çalışma kağıdı denetçiye geri gönderildi.');
    }
  };

  const getNoteForField = (fieldKey: string) => {
    return reviewNotes.find((note) => note.field_key === fieldKey && note.status === 'OPEN');
  };

  if (!activeWorkpaper) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600">Bir çalışma kağıdı seçin</p>
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col">
      {/* Context Menu */}
      {contextMenu.visible && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu({ ...contextMenu, visible: false })}
          />
          <div
            className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl py-2 min-w-[200px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              onClick={handleAddCoachingNote}
              className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 flex items-center gap-2 text-gray-900"
            >
              <MessageSquarePlus className="w-4 h-4 text-blue-600" />
              İnceleme Notu Ekle
            </button>
          </div>
        </>
      )}

      {/* Add Note Modal */}
      {addNoteModal && (
        <>
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={() => setAddNoteModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Yeni İnceleme Notu
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Alan</label>
                  <input
                    type="text"
                    value={newNoteField}
                    onChange={(e) => setNewNoteField(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Not</label>
                  <textarea
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="İnceleme notunuzu yazın..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCreateNote}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Notu Ekle
                  </button>
                  <button
                    onClick={() => setAddNoteModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    İptal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Grid Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Alanları</h3>

          <div className="space-y-4">
            {['test_sample_1', 'test_sample_2', 'test_sample_3'].map((fieldKey) => {
              const note = getNoteForField(fieldKey);

              return (
                <div
                  key={fieldKey}
                  className="border border-gray-200 rounded-lg p-4"
                  onContextMenu={(e) => handleContextMenu(e, fieldKey)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-900">{fieldKey}</label>
                    <div className="flex items-center gap-2">
                      {note && (
                        <ReviewNotePin
                          note={note}
                          canResolve={isAuditor}
                          onResolve={(noteId) => {
                            setReviewNotes(
                              reviewNotes.map((n) =>
                                n.id === noteId
                                  ? {
                                      ...n,
                                      status: 'RESOLVED' as const,
                                      resolved_at: new Date().toISOString(),
                                    }
                                  : n
                              )
                            );
                          }}
                        />
                      )}
                      <button
                        onClick={() => {
                          setSelectedStepId(fieldKey);
                          setIsDrawerOpen(true);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        <FileText className="w-4 h-4" />
                        Çalışma Kağıdı
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Test sonucunu girin..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Sağ tıklayarak inceleme notu ekleyebilirsiniz
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sign-off Bar (Sticky Footer) */}
      <div className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-2xl">
        <div className="p-4">
          {isAuditor ? (
            /* Auditor View */
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Denetçi Görünümü</p>
                  <p className="text-xs text-gray-600">
                    {isPrepared
                      ? 'Yönetici incelemesinde'
                      : 'Çalışmanızı tamamlayıp incelemeye gönderin'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {openNotesCount > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-amber-100 border border-amber-300 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-amber-700" />
                    <span className="text-sm font-medium text-amber-900">
                      {openNotesCount} Açık Not
                    </span>
                  </div>
                )}

                {!isPrepared && (
                  <button
                    onClick={handlePrepareWorkpaper}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <FileCheck className="w-5 h-5" />
                    Tamamladım, İncelemeye Gönder
                  </button>
                )}

                {isPrepared && !isReviewed && (
                  <div className="px-4 py-2 bg-yellow-100 border border-yellow-300 rounded-lg">
                    <span className="text-sm font-medium text-yellow-900">
                      İnceleme Bekleniyor
                    </span>
                  </div>
                )}

                {isReviewed && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-100 border border-green-300 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-700" />
                    <span className="text-sm font-medium text-green-900">Onaylandı</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Manager View */
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Yönetici Görünümü</p>
                  <p className="text-xs text-gray-600">
                    {openNotesCount > 0
                      ? `${openNotesCount} açık not var - Tüm notlar çözülene kadar onaylayamazsınız`
                      : 'Çalışma kağıdını onaylamaya hazır'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleReturnForRework}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-orange-500 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors font-medium"
                >
                  <RotateCcw className="w-5 h-5" />
                  Yeniden Çalışmaya Gönder
                </button>

                <button
                  onClick={handleApproveReview}
                  disabled={openNotesCount > 0}
                  className={clsx(
                    'flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors',
                    openNotesCount > 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  )}
                >
                  <ShieldCheck className="w-5 h-5" />
                  İncelemeleri Onayla (Sign-off)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Workpaper Drawer */}
      <WorkpaperDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        workpaperId={activeWorkpaper?.id || null}
        stepId={selectedStepId}
      />
    </div>
  );
}
