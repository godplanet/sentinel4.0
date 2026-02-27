import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle2, XCircle, FileCheck, BarChart3, ClipboardCheck } from 'lucide-react';
import { fetchQAIPChecklists, createQAIPReview, fetchQAIPReviews, type QAIPChecklist, type QAIPReview } from '@/entities/qaip';

export function QAIPReviewWidget() {
  const [checklists, setChecklists] = useState<QAIPChecklist[]>([]);
  const [reviews, setReviews] = useState<QAIPReview[]>([]);
  const [selectedChecklist, setSelectedChecklist] = useState<QAIPChecklist | null>(null);
  const [results, setResults] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [checklistsData, reviewsData] = await Promise.all([
        fetchQAIPChecklists(),
        fetchQAIPReviews(),
      ]);
      setChecklists(checklistsData);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Failed to load QAIP data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedChecklist) return;

    try {
      setSubmitting(true);
      await createQAIPReview({
        checklist_id: selectedChecklist.id,
        results,
        notes,
      });
      setSelectedChecklist(null);
      setResults({});
      setNotes('');
      await loadData();
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (selectedChecklist) {
    const allAnswered = selectedChecklist.criteria.every(c => results[c.id]);
    const passCount = Object.values(results).filter(r => r === 'PASS').length;
    const failCount = Object.values(results).filter(r => r === 'FAIL').length;

    return (
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border-2 border-slate-200 shadow-lg"
        >
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8" />
              <h2 className="text-2xl font-bold">{selectedChecklist.title}</h2>
            </div>
            {selectedChecklist.description && (
              <p className="text-green-100">{selectedChecklist.description}</p>
            )}
          </div>

          <div className="p-8 space-y-6">
            {selectedChecklist.criteria.map((criterion, index) => (
              <div key={criterion.id} className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <label className="block text-base font-semibold text-slate-800 mb-1">
                      {index + 1}. {criterion.text}
                    </label>
                    <p className="text-sm text-slate-600">Ağırlık: {criterion.weight} puan</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setResults(prev => ({ ...prev, [criterion.id]: 'PASS' }))}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                      results[criterion.id] === 'PASS'
                        ? 'bg-green-50 border-green-600 text-green-700'
                        : 'bg-white border-slate-300 text-slate-700 hover:border-green-400'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Uygun (PASS)
                  </button>
                  <button
                    onClick={() => setResults(prev => ({ ...prev, [criterion.id]: 'FAIL' }))}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                      results[criterion.id] === 'FAIL'
                        ? 'bg-red-50 border-red-600 text-red-700'
                        : 'bg-white border-slate-300 text-slate-700 hover:border-red-400'
                    }`}
                  >
                    <XCircle className="w-5 h-5" />
                    Uygun Değil (FAIL)
                  </button>
                </div>
              </div>
            ))}

            <div className="pt-4 border-t border-slate-200">
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                İnceleme Notları (Opsiyonel)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Ek açıklamalar, öneriler ve bulgular..."
              />
            </div>

            {allAnswered && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">Sonuç Özeti</p>
                      <p className="text-sm text-blue-700">
                        {passCount} Uygun | {failCount} Uygun Değil
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-50 px-8 py-5 flex items-center justify-between border-t border-slate-200">
            <button
              onClick={() => setSelectedChecklist(null)}
              className="px-6 py-2.5 bg-white border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              İptal
            </button>
            <button
              onClick={handleSubmitReview}
              disabled={!allAnswered || submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:from-slate-400 disabled:to-slate-500 transition-all font-semibold"
            >
              {submitting ? 'Kaydediliyor...' : 'İncelemeyi Tamamla'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Toplam Kontrol Listesi</span>
            <ClipboardCheck className="w-5 h-5 text-slate-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{checklists.length}</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Tamamlanan İnceleme</span>
            <FileCheck className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-600">
            {reviews.filter(r => r.status === 'COMPLETED').length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {checklists.map((checklist, index) => (
          <motion.div
            key={checklist.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-lg border-2 border-slate-200 shadow-sm hover:shadow-md hover:border-green-300 transition-all overflow-hidden cursor-pointer"
            onClick={() => setSelectedChecklist(checklist)}
          >
            <div className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <ClipboardCheck className="w-6 h-6 text-green-600" />
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
                {checklist.title}
              </h3>

              {checklist.description && (
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                  {checklist.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <span className="text-sm text-slate-600">
                  {checklist.criteria.length} kriter
                </span>
                <button className="text-sm font-semibold text-green-600 hover:text-green-700 transition-colors">
                  İnceleme Başlat →
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
