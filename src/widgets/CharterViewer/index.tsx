import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScrollText, Clock, CheckCircle2, Archive, Plus, X,
  FileText, History, Eye, ChevronRight, Upload, Shield
} from 'lucide-react';
import {
  fetchGovernanceDocs,
  createGovernanceDoc,
  approveGovernanceDoc,
  updateGovernanceDoc,
} from '@/entities/governance';
import type { GovernanceDoc } from '@/entities/governance/model/types';

const STATUS_CONFIG = {
  DRAFT: { label: 'Taslak', icon: Clock, bg: 'bg-amber-100', text: 'text-amber-700' },
  APPROVED: { label: 'Onaylanmis', icon: CheckCircle2, bg: 'bg-green-100', text: 'text-green-700' },
  ARCHIVED: { label: 'Arsiv', icon: Archive, bg: 'bg-slate-100', text: 'text-slate-600' },
} as const;

export function CharterViewer() {
  const [charters, setCharters] = useState<GovernanceDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<GovernanceDoc | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newForm, setNewForm] = useState({ title: '', version: '' });

  useEffect(() => {
    loadCharters();
  }, []);

  const loadCharters = async () => {
    try {
      setLoading(true);
      const docs = await fetchGovernanceDocs({ doc_type: 'CHARTER' });
      setCharters(docs);
      if (docs.length > 0 && !selected) {
        setSelected(docs[0]);
      }
    } catch (err) {
      console.error('Failed to load charters:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newForm.title.trim()) return;
    try {
      setSubmitting(true);
      await createGovernanceDoc({
        doc_type: 'CHARTER',
        title: newForm.title,
        version: newForm.version || undefined,
        approval_status: 'DRAFT',
      });
      setShowNewModal(false);
      setNewForm({ title: '', version: '' });
      await loadCharters();
    } catch (err) {
      console.error('Failed to create charter:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (doc: GovernanceDoc) => {
    try {
      await approveGovernanceDoc(doc.id);
      await loadCharters();
      if (selected?.id === doc.id) {
        const updated = await fetchGovernanceDocs({ doc_type: 'CHARTER' });
        setSelected(updated.find(d => d.id === doc.id) || null);
      }
    } catch (err) {
      console.error('Failed to approve:', err);
    }
  };

  const handleArchive = async (doc: GovernanceDoc) => {
    try {
      await updateGovernanceDoc(doc.id, { approval_status: 'ARCHIVED' });
      await loadCharters();
    } catch (err) {
      console.error('Failed to archive:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  const activeCharter = charters.find(c => c.approval_status === 'APPROVED');
  const draftCharters = charters.filter(c => c.approval_status === 'DRAFT');
  const archivedCharters = charters.filter(c => c.approval_status === 'ARCHIVED');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-slate-600">Aktif Yonetmelik</span>
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{activeCharter ? 1 : 0}</p>
          <p className="text-xs text-slate-500 mt-1">
            {activeCharter ? activeCharter.version || 'v1.0' : 'Henuz onaylanmadi'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-slate-600">Taslak Surum</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{draftCharters.length}</p>
          <p className="text-xs text-slate-500 mt-1">Onay bekliyor</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-slate-600">Arsiv</span>
            <Archive className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{archivedCharters.length}</p>
          <p className="text-xs text-slate-500 mt-1">Onceki surumler</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Surum Gecmisi
            </h3>
            <button
              onClick={() => setShowNewModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={14} />
              Yeni Surum
            </button>
          </div>

          <div className="space-y-2">
            {charters.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
                <ScrollText className="mx-auto text-slate-300 mb-3" size={40} />
                <p className="text-sm text-slate-500 font-medium">Henuz yonetmelik eklenmedi</p>
                <button
                  onClick={() => setShowNewModal(true)}
                  className="mt-3 text-blue-600 text-sm font-semibold hover:text-blue-700"
                >
                  Ilk yonetmeligi ekle
                </button>
              </div>
            )}

            {charters.map((charter) => {
              const status = STATUS_CONFIG[charter.approval_status];
              const StatusIcon = status.icon;
              const isSelected = selected?.id === charter.id;

              return (
                <button
                  key={charter.id}
                  onClick={() => setSelected(charter)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      charter.approval_status === 'APPROVED' ? 'bg-green-100' :
                      charter.approval_status === 'DRAFT' ? 'bg-amber-100' : 'bg-slate-100'
                    }`}>
                      <StatusIcon size={16} className={status.text} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">{charter.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {charter.version && (
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                            {charter.version}
                          </span>
                        )}
                        <span className={`px-1.5 py-0.5 ${status.bg} ${status.text} text-xs font-medium rounded`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(charter.created_at).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    <ChevronRight size={16} className={`flex-shrink-0 mt-1 ${isSelected ? 'text-blue-500' : 'text-slate-300'}`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-5 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <ScrollText size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{selected.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {selected.version && (
                          <span className="px-2 py-0.5 bg-white/20 text-xs font-medium rounded">
                            {selected.version}
                          </span>
                        )}
                        <span className="text-xs text-slate-300">
                          {new Date(selected.created_at).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {selected.approval_status === 'DRAFT' && (
                      <button
                        onClick={() => handleApprove(selected)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors"
                      >
                        <CheckCircle2 size={16} />
                        Onayla
                      </button>
                    )}
                    {selected.approval_status === 'APPROVED' && (
                      <button
                        onClick={() => handleArchive(selected)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded-lg transition-colors"
                      >
                        <Archive size={16} />
                        Arsivle
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 font-medium">Durum</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {(() => {
                        const s = STATUS_CONFIG[selected.approval_status];
                        const Icon = s.icon;
                        return (
                          <>
                            <Icon size={14} className={s.text} />
                            <span className={`text-sm font-semibold ${s.text}`}>{s.label}</span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 font-medium">Surum</p>
                    <p className="text-sm font-semibold text-slate-900 mt-1">{selected.version || 'v1.0'}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 font-medium">Olusturulma</p>
                    <p className="text-sm font-semibold text-slate-900 mt-1">
                      {new Date(selected.created_at).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 font-medium">Onay Tarihi</p>
                    <p className="text-sm font-semibold text-slate-900 mt-1">
                      {selected.approved_at
                        ? new Date(selected.approved_at).toLocaleDateString('tr-TR')
                        : '-'}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <Eye size={16} />
                    Belge Onizleme
                  </h4>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 min-h-[300px]">
                    {selected.content_url ? (
                      <div className="flex flex-col items-center justify-center gap-4">
                        <FileText size={48} className="text-blue-500" />
                        <a
                          href={selected.content_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                        >
                          Belgeyi Goruntule
                        </a>
                      </div>
                    ) : (
                      <div className="text-center text-slate-500">
                        <Shield size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="font-semibold text-slate-700">{selected.title}</p>
                        <p className="text-sm mt-2">
                          Ic Denetim Baskanligi yetki, sorumluluk ve faaliyetlerini
                          tanimlayan ana yonetmelik belgesi.
                        </p>
                        <div className="mt-6 text-left max-w-lg mx-auto space-y-3 text-sm text-slate-600">
                          <div className="flex items-start gap-2">
                            <span className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                            <span>Ic Denetim faaliyetlerinin amac, yetki ve sorumluluk cercevesi</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                            <span>Raporlama iliskileri ve bagimsizlik guvencesi</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                            <span>IIA Standartlari ve GIAS 2024 uyum cercevesi</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                            <span>Denetim komitesine raporlama sureci ve esaslari</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {archivedCharters.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                      <History size={16} />
                      Onceki Surumler
                    </h4>
                    <div className="space-y-2">
                      {archivedCharters.map((old) => (
                        <div
                          key={old.id}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                        >
                          <div className="flex items-center gap-3">
                            <Archive size={16} className="text-slate-400" />
                            <div>
                              <p className="text-sm font-medium text-slate-700">{old.title}</p>
                              <p className="text-xs text-slate-500">
                                {old.version || 'v1.0'} - {new Date(old.created_at).toLocaleDateString('tr-TR')}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setSelected(old)}
                            className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                          >
                            Goruntule
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center py-20">
              <ScrollText className="text-slate-300 mb-4" size={56} />
              <p className="text-slate-600 font-semibold mb-1">Yonetmelik Secilmedi</p>
              <p className="text-sm text-slate-500">Sol panelden bir surum secin veya yeni ekleyin</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showNewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !submitting && setShowNewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <Upload className="w-5 h-5 text-white" />
                  <h2 className="text-lg font-bold text-white">Yeni Yonetmelik Surumu</h2>
                </div>
                <button
                  onClick={() => !submitting && setShowNewModal(false)}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                  disabled={submitting}
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Baslik <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newForm.title}
                    onChange={(e) => setNewForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Ic Denetim Yonetmeligi 2026"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Surum Numarasi
                  </label>
                  <input
                    type="text"
                    value={newForm.version}
                    onChange={(e) => setNewForm(prev => ({ ...prev, version: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="v2.0"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-200 rounded-b-2xl">
                <button
                  onClick={() => !submitting && setShowNewModal(false)}
                  className="px-5 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
                  disabled={submitting}
                >
                  Iptal
                </button>
                <button
                  onClick={handleCreate}
                  disabled={submitting || !newForm.title.trim()}
                  className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 transition-colors font-semibold text-sm"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Olustur
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
