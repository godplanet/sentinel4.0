/**
 * Çalışma Kağıdı Editörü Widget
 *
 * JSONB tabanlı esnek çalışma kağıdı düzenleme arayüzü.
 */

import { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle2,
  XCircle,
  MinusCircle,
  MessageSquare,
  Paperclip,
  Users,
  Clock,
  NotebookPen,
} from 'lucide-react';
import { useWorkpaperStore, type TestResult } from '@/entities/execution';
import { useRealtimePresence } from '@/features/audit-execution/hooks';
import { WorkpaperDrawer } from '@/widgets/WorkpaperDrawer';
import {
  updateWorkpaperField,
  updateTestResult,
  addComment,
  updateWorkpaperStatus,
} from '@/entities/execution';

export function WorkpaperEditor() {
  const { activeWorkpaper, presences, evidence, findings, updateWorkpaperData, updateTestResult: updateLocalTestResult, addComment: addLocalComment, updateWorkpaperStatus: updateLocalStatus } = useWorkpaperStore();
  const [isSaving, setIsSaving] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useRealtimePresence(activeWorkpaper?.id || null);

  useEffect(() => {
    if (activeWorkpaper?.data.test_results) {
      setTestResults(activeWorkpaper.data.test_results);
    }
  }, [activeWorkpaper]);

  if (!activeWorkpaper) {
    return (
      <div className="flex items-center justify-center h-full glass-card">
        <div className="text-center text-slate-500">
          <FileText size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Bir çalışma kağıdı seçin</p>
          <p className="text-sm mt-2">Soldaki listeden düzenlemek istediğiniz çalışma kağıdına tıklayın</p>
        </div>
      </div>
    );
  }

  const handleFieldUpdate = async (field: string, value: unknown) => {
    try {
      setIsSaving(true);
      await updateWorkpaperField(activeWorkpaper.id, [field], value);
      updateWorkpaperData(activeWorkpaper.id, { [field]: value });
    } catch (error) {
      console.error('Alan güncellenemedi:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestResultUpdate = async (testKey: string, result: TestResult) => {
    try {
      setIsSaving(true);
      await updateTestResult(activeWorkpaper.id, testKey, result);
      updateLocalTestResult(activeWorkpaper.id, testKey, result);
      setTestResults((prev) => ({ ...prev, [testKey]: result }));
    } catch (error) {
      console.error('Test sonucu güncellenemedi:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setIsSaving(true);
      await addComment(activeWorkpaper.id, newComment);
      addLocalComment(activeWorkpaper.id, newComment);
      setNewComment('');
    } catch (error) {
      console.error('Yorum eklenemedi:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: typeof activeWorkpaper.status) => {
    try {
      setIsSaving(true);
      await updateWorkpaperStatus(activeWorkpaper.id, newStatus);
      updateLocalStatus(activeWorkpaper.id, newStatus);
    } catch (error) {
      console.error('Durum güncellenemedi:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const TestButton = ({ testKey, result }: { testKey: string; result: TestResult }) => {
    const currentResult = testResults[testKey];
    const isActive = currentResult === result;

    const styles = {
      pass: isActive
        ? 'bg-green-500/20 border-green-400 text-green-700'
        : 'border-slate-300 text-slate-600 hover:border-green-400',
      fail: isActive
        ? 'bg-red-500/20 border-red-400 text-red-700'
        : 'border-slate-300 text-slate-600 hover:border-red-400',
      na: isActive
        ? 'bg-slate-500/20 border-slate-400 text-slate-700'
        : 'border-slate-300 text-slate-600 hover:border-slate-400',
    };

    const icons = {
      pass: CheckCircle2,
      fail: XCircle,
      na: MinusCircle,
    };

    const labels = {
      pass: 'Başarılı',
      fail: 'Başarısız',
      na: 'Geçerli Değil',
    };

    const Icon = icons[result];

    return (
      <button
        onClick={() => handleTestResultUpdate(testKey, result)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${styles[result]}`}
      >
        <Icon size={16} />
        <span className="text-sm font-medium">{labels[result]}</span>
      </button>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <FileText className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Çalışma Kağıdı Editörü</h2>
            <p className="text-sm text-slate-600">Versiyon {activeWorkpaper.version}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Workpaper Drawer Button */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-lg hover:from-yellow-600 hover:to-amber-600 transition-all shadow-md hover:shadow-lg font-medium"
          >
            <NotebookPen size={16} />
            <span className="text-sm">Not Defteri</span>
          </button>

          {/* Presence Indicators */}
          {presences.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
              <Users size={16} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-700">{presences.length} aktif kullanıcı</span>
            </div>
          )}

          {/* Status Selector */}
          <select
            value={activeWorkpaper.status}
            onChange={(e) => handleStatusChange(e.target.value as any)}
            className="px-3 py-2 rounded-lg border-2 border-slate-300 bg-white text-sm font-medium focus:outline-none focus:border-blue-500"
            disabled={isSaving}
          >
            <option value="draft">Taslak</option>
            <option value="review">İncelemede</option>
            <option value="finalized">Tamamlandı</option>
          </select>

          {/* Save Indicator */}
          {isSaving && (
            <div className="flex items-center gap-2 text-blue-600">
              <Clock size={16} className="animate-spin" />
              <span className="text-sm">Kaydediliyor...</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Objective */}
        <div className="glass-card p-4">
          <label className="block text-sm font-bold text-slate-900 mb-2">Amaç</label>
          <textarea
            value={activeWorkpaper.data.objective || ''}
            onChange={(e) => handleFieldUpdate('objective', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border-2 border-slate-300 focus:border-blue-500 focus:outline-none bg-white"
            rows={3}
            placeholder="Denetim amacını yazın..."
          />
        </div>

        {/* Scope */}
        <div className="glass-card p-4">
          <label className="block text-sm font-bold text-slate-900 mb-2">Kapsam</label>
          <textarea
            value={activeWorkpaper.data.scope || ''}
            onChange={(e) => handleFieldUpdate('scope', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border-2 border-slate-300 focus:border-blue-500 focus:outline-none bg-white"
            rows={2}
            placeholder="Kapsam bilgisi..."
          />
        </div>

        {/* Test Results */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Test Sonuçları</h3>
          <div className="space-y-3">
            {Object.keys(testResults).length > 0 ? (
              Object.keys(testResults).map((testKey) => (
                <div key={testKey} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-sm font-medium text-slate-700">{testKey.replace(/_/g, ' ').toUpperCase()}</span>
                  <div className="flex gap-2">
                    <TestButton testKey={testKey} result="pass" />
                    <TestButton testKey={testKey} result="fail" />
                    <TestButton testKey={testKey} result="na" />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">Henüz test sonucu yok</p>
            )}
          </div>
        </div>

        {/* Conclusion */}
        <div className="glass-card p-4">
          <label className="block text-sm font-bold text-slate-900 mb-2">Sonuç</label>
          <textarea
            value={activeWorkpaper.data.conclusion || ''}
            onChange={(e) => handleFieldUpdate('conclusion', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border-2 border-slate-300 focus:border-blue-500 focus:outline-none bg-white"
            rows={4}
            placeholder="Denetim sonucu ve değerlendirme..."
          />
        </div>

        {/* Evidence Section */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Paperclip size={16} />
            Kanıtlar ({evidence.length})
          </h3>
          {evidence.length > 0 ? (
            <div className="space-y-2">
              {evidence.map((ev) => (
                <div key={ev.id} className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Paperclip size={16} className="text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{ev.file_name}</p>
                      <p className="text-xs text-slate-500">{(ev.file_size_bytes / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">{new Date(ev.uploaded_at).toLocaleDateString('tr-TR')}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 border-2 border-dashed border-slate-300 rounded-lg text-center">
              <Paperclip size={32} className="mx-auto mb-2 text-slate-400" />
              <p className="text-sm text-slate-500">Dosya yükleme (TODO)</p>
            </div>
          )}
        </div>

        {/* Findings */}
        {findings.length > 0 && (
          <div className="glass-card p-4 border-red-200">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <XCircle size={16} className="text-red-600" />
              Otomatik Bulgular ({findings.length})
            </h3>
            <div className="space-y-2">
              {findings.map((finding) => (
                <div key={finding.id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm font-medium text-red-900">{finding.title}</p>
                  {finding.description && (
                    <p className="text-xs text-red-700 mt-1">{finding.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-xs text-red-600">
                    <span>Kaynak: {finding.source_ref}</span>
                    <span>•</span>
                    <span>Önem: {finding.severity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <MessageSquare size={16} />
            Yorumlar ({activeWorkpaper.data.comments?.length || 0})
          </h3>

          <div className="space-y-3 mb-4">
            {activeWorkpaper.data.comments?.map((comment, idx) => (
              <div key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-slate-700">{comment.text}</p>
                <p className="text-xs text-slate-500 mt-1">{new Date(comment.timestamp).toLocaleString('tr-TR')}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              placeholder="Yorum ekle..."
              className="flex-1 px-4 py-2 rounded-lg border-2 border-slate-300 focus:border-blue-500 focus:outline-none bg-white"
            />
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Gönder
            </button>
          </div>
        </div>
      </div>

      {/* Workpaper Drawer */}
      <WorkpaperDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        workpaperId={activeWorkpaper?.id || null}
        stepId={activeWorkpaper?.step_id || null}
      />
    </div>
  );
}
