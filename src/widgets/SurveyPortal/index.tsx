import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Star, MessageSquare, CheckCircle2, Send, BarChart3, Plus, X } from 'lucide-react';
import { fetchSurveys, submitSurveyResponse, fetchSurveyStats, createSurvey, type Survey } from '@/entities/survey';

export function SurveyPortal() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [stats, setStats] = useState<Record<string, { count: number; averageScore: number | null }>>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSurvey, setNewSurvey] = useState({ title: '', description: '', target_audience: 'INTERNAL' as const });

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      setLoading(true);
      const data = await fetchSurveys({ is_active: true });
      setSurveys(data);

      const statsData: Record<string, { count: number; averageScore: number | null }> = {};
      for (const survey of data) {
        const surveyStats = await fetchSurveyStats(survey.id);
        statsData[survey.id] = surveyStats;
      }
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedSurvey) return;

    try {
      setSubmitting(true);
      await submitSurveyResponse({
        survey_id: selectedSurvey.id,
        answers,
      });
      setSubmitted(true);
      setAnswers({});
      setTimeout(() => {
        setSelectedSurvey(null);
        setSubmitted(false);
        loadSurveys();
      }, 2000);
    } catch (error) {
      console.error('Failed to submit survey:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSurvey = async () => {
    if (!newSurvey.title.trim()) return;

    try {
      setSubmitting(true);
      await createSurvey({
        title: newSurvey.title,
        description: newSurvey.description || undefined,
        target_audience: newSurvey.target_audience,
        form_schema: [
          { id: 'q1', type: 'rating', label: 'Genel memnuniyet dereceniz?', max: 5 },
          { id: 'q2', type: 'text', label: 'Görüş ve önerileriniz?' },
        ],
        is_active: true,
      });
      setShowCreateModal(false);
      setNewSurvey({ title: '', description: '', target_audience: 'INTERNAL' });
      loadSurveys();
    } catch (error) {
      console.error('Failed to create survey:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Anketler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (selectedSurvey && !submitted) {
    return (
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border-2 border-slate-200 shadow-lg overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <ClipboardList className="w-8 h-8" />
              <h2 className="text-2xl font-bold">{selectedSurvey.title}</h2>
            </div>
            {selectedSurvey.description && (
              <p className="text-blue-100">{selectedSurvey.description}</p>
            )}
          </div>

          <div className="p-8 space-y-8">
            {selectedSurvey.form_schema.map((question, index) => (
              <div key={question.id} className="space-y-3">
                <label className="block text-base font-semibold text-slate-800">
                  {index + 1}. {question.label}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {question.type === 'rating' && (
                  <div className="flex gap-2">
                    {Array.from({ length: question.max || 5 }, (_, i) => i + 1).map((value) => (
                      <button
                        key={value}
                        onClick={() => handleAnswerChange(question.id, value)}
                        className={`w-12 h-12 rounded-lg border-2 font-bold transition-all ${
                          answers[question.id] === value
                            ? 'bg-blue-600 text-white border-blue-600 scale-110'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                )}

                {question.type === 'text' && (
                  <textarea
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Yanıtınızı buraya yazın..."
                  />
                )}

                {question.type === 'choice' && question.options && (
                  <div className="space-y-2">
                    {question.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleAnswerChange(question.id, option)}
                        className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                          answers[question.id] === option
                            ? 'bg-blue-50 border-blue-600 text-blue-900 font-medium'
                            : 'bg-white border-slate-300 hover:border-blue-400'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-slate-50 px-8 py-5 flex items-center justify-between border-t border-slate-200">
            <button
              onClick={() => setSelectedSurvey(null)}
              className="px-6 py-2.5 bg-white border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              disabled={submitting}
            >
              İptal
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || Object.keys(answers).length === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-500 transition-all font-semibold shadow-sm hover:shadow"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Anketi Gönder
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md mx-auto text-center py-12"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Teşekkür Ederiz!</h2>
        <p className="text-slate-600">Anket yanıtınız başarıyla kaydedildi.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Aktif Anketler</h2>
          <p className="text-sm text-slate-600 mt-1">Geri bildirim toplama ve değerlendirme sistemi</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-sm hover:shadow"
        >
          <Plus className="w-5 h-5" />
          Yeni Anket
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {surveys.map((survey, index) => {
          const surveyStats = stats[survey.id] || { count: 0, averageScore: null };

          return (
            <motion.div
              key={survey.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-lg border-2 border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all overflow-hidden cursor-pointer"
              onClick={() => setSelectedSurvey(survey)}
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <ClipboardList className="w-6 h-6 text-blue-600" />
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
                  {survey.title}
                </h3>

                {survey.description && (
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {survey.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{survey.form_schema.length} soru</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BarChart3 className="w-4 h-4" />
                    <span>{surveyStats.count} yanıt</span>
                  </div>
                </div>

                {surveyStats.averageScore !== null && (
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-semibold text-slate-700">
                      Ortalama: {surveyStats.averageScore.toFixed(1)}%
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <span className="text-xs font-medium text-slate-500 uppercase">
                    {survey.target_audience === 'AUDITEE' && 'Denetlenen'}
                    {survey.target_audience === 'INTERNAL' && 'İç Denetim'}
                    {survey.target_audience === 'EXTERNAL' && 'Dış Paydaş'}
                  </span>
                  <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                    Anketi Başlat →
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {surveys.length === 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <ClipboardList className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">
            Aktif Anket Bulunamadı
          </h3>
          <p className="text-slate-500">Şu anda doldurulabilecek anket bulunmuyor.</p>
        </div>
      )}

      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !submitting && setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-xl font-bold text-white">Yeni Anket Oluştur</h2>
                <button
                  onClick={() => !submitting && setShowCreateModal(false)}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                  disabled={submitting}
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Anket Başlığı <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newSurvey.title}
                    onChange={(e) => setNewSurvey(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Örn: Denetim Memnuniyet Anketi"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Açıklama
                  </label>
                  <textarea
                    value={newSurvey.description}
                    onChange={(e) => setNewSurvey(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Anketin amacını kısaca açıklayın..."
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Hedef Kitle <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newSurvey.target_audience}
                    onChange={(e) => setNewSurvey(prev => ({ ...prev, target_audience: e.target.value as any }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    disabled={submitting}
                  >
                    <option value="INTERNAL">İç Denetim Ekibi</option>
                    <option value="AUDITEE">Denetlenen Birimler</option>
                    <option value="EXTERNAL">Dış Paydaşlar</option>
                  </select>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Not:</strong> Anket varsayılan olarak 2 soru ile oluşturulacaktır.
                    Daha sonra düzenleyerek soru ekleyebilirsiniz.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-t border-slate-200 rounded-b-2xl">
                <button
                  onClick={() => !submitting && setShowCreateModal(false)}
                  className="px-6 py-2.5 bg-white border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                  disabled={submitting}
                >
                  İptal
                </button>
                <button
                  onClick={handleCreateSurvey}
                  disabled={submitting || !newSurvey.title.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-500 transition-all font-semibold shadow-sm hover:shadow"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Oluşturuluyor...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Anketi Oluştur
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
