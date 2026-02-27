import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Shield, FileCheck, Clock, CheckCircle2, Archive, Plus, X, Upload } from 'lucide-react';
import { fetchGovernanceDocs, fetchAuditorDeclarations, getGovernanceStats, createGovernanceDoc, type GovernanceDoc, type AuditorDeclaration } from '@/entities/governance';

export function GovernanceVault() {
  const [docs, setDocs] = useState<GovernanceDoc[]>([]);
  const [declarations, setDeclarations] = useState<AuditorDeclaration[]>([]);
  const [stats, setStats] = useState({ total_docs: 0, approved_docs: 0, declarations_this_year: 0, compliance_rate: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newDoc, setNewDoc] = useState({
    title: '',
    doc_type: 'POLICY' as const,
    version: '',
    approval_status: 'DRAFT' as const,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [docsData, declarationsData, statsData] = await Promise.all([
        fetchGovernanceDocs(),
        fetchAuditorDeclarations({ period_year: new Date().getFullYear() }),
        getGovernanceStats(),
      ]);
      setDocs(docsData);
      setDeclarations(declarationsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load governance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDoc = async () => {
    if (!newDoc.title.trim()) return;

    try {
      setSubmitting(true);
      await createGovernanceDoc({
        doc_type: newDoc.doc_type,
        title: newDoc.title,
        version: newDoc.version || undefined,
        approval_status: newDoc.approval_status,
      });
      setShowUploadModal(false);
      setNewDoc({ title: '', doc_type: 'POLICY', version: '', approval_status: 'DRAFT' });
      loadData();
    } catch (error) {
      console.error('Failed to create governance doc:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const filteredDocs = filter === 'ALL' ? docs : docs.filter(d => d.doc_type === filter);

  const docTypeLabels: Record<string, string> = {
    CHARTER: 'Yönetmelik',
    DECLARATION: 'Beyan',
    MINUTES: 'Tutanak',
    POLICY: 'Politika',
    PROCEDURE: 'Prosedür',
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Toplam Doküman</span>
            <FileText className="w-5 h-5 text-slate-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.total_docs}</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Onaylı</span>
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.approved_docs}</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Bağımsızlık Beyanı</span>
            <Shield className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-3xl font-bold text-indigo-600">{stats.declarations_this_year}</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Uyum Oranı</span>
            <FileCheck className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-purple-600">{stats.compliance_rate}%</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900">Yönetişim Dokümanları</h3>
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('ALL')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  filter === 'ALL'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Tümü
              </button>
              <button
                onClick={() => setFilter('CHARTER')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  filter === 'CHARTER'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Yönetmelik
              </button>
              <button
                onClick={() => setFilter('POLICY')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  filter === 'POLICY'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Politika
              </button>
              <button
                onClick={() => setFilter('MINUTES')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  filter === 'MINUTES'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Tutanak
              </button>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all font-semibold shadow-sm hover:shadow text-sm"
            >
              <Plus className="w-4 h-4" />
              Doküman Yükle
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredDocs.map((doc) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    doc.doc_type === 'CHARTER' ? 'bg-indigo-100' :
                    doc.doc_type === 'POLICY' ? 'bg-blue-100' :
                    doc.doc_type === 'MINUTES' ? 'bg-green-100' :
                    'bg-purple-100'
                  }`}>
                    {doc.doc_type === 'CHARTER' && <Shield className="w-5 h-5 text-indigo-600" />}
                    {doc.doc_type === 'POLICY' && <FileText className="w-5 h-5 text-blue-600" />}
                    {doc.doc_type === 'MINUTES' && <Clock className="w-5 h-5 text-green-600" />}
                    {doc.doc_type === 'DECLARATION' && <FileCheck className="w-5 h-5 text-purple-600" />}
                    {doc.doc_type === 'PROCEDURE' && <FileText className="w-5 h-5 text-slate-600" />}
                  </div>

                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">{doc.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      <span className="px-2 py-0.5 bg-slate-100 rounded">
                        {docTypeLabels[doc.doc_type]}
                      </span>
                      {doc.version && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">
                          {doc.version}
                        </span>
                      )}
                      <span>{new Date(doc.created_at).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {doc.approval_status === 'APPROVED' && (
                    <span className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 text-xs font-semibold rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Onaylı
                    </span>
                  )}
                  {doc.approval_status === 'DRAFT' && (
                    <span className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-lg">
                      <Clock className="w-3.5 h-3.5" />
                      Taslak
                    </span>
                  )}
                  {doc.approval_status === 'ARCHIVED' && (
                    <span className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg">
                      <Archive className="w-3.5 h-3.5" />
                      Arşiv
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">2026 Bağımsızlık Beyanları</h3>

        <div className="space-y-3">
          {declarations.map((declaration) => (
            <div
              key={declaration.id}
              className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">
                    {declaration.declaration_type === 'INDEPENDENCE' && 'Bağımsızlık Beyanı'}
                    {declaration.declaration_type === 'CONFLICT_OF_INTEREST' && 'Çıkar Çatışması Beyanı'}
                    {declaration.declaration_type === 'CODE_OF_CONDUCT' && 'Etik Kurallar Beyanı'}
                  </p>
                  <p className="text-sm text-slate-600">
                    İmza: {new Date(declaration.signed_at).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <span className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 text-xs font-semibold rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  İmzalandı
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !submitting && setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <Upload className="w-6 h-6 text-white" />
                  <h2 className="text-xl font-bold text-white">Yeni Doküman Ekle</h2>
                </div>
                <button
                  onClick={() => !submitting && setShowUploadModal(false)}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                  disabled={submitting}
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Doküman Başlığı <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newDoc.title}
                    onChange={(e) => setNewDoc(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Örn: İç Denetim Yönetmeliği 2026"
                    disabled={submitting}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Doküman Türü <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newDoc.doc_type}
                      onChange={(e) => setNewDoc(prev => ({ ...prev, doc_type: e.target.value as any }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      disabled={submitting}
                    >
                      <option value="CHARTER">Yönetmelik</option>
                      <option value="POLICY">Politika</option>
                      <option value="MINUTES">Tutanak</option>
                      <option value="DECLARATION">Beyan</option>
                      <option value="PROCEDURE">Prosedür</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Versiyon
                    </label>
                    <input
                      type="text"
                      value={newDoc.version}
                      onChange={(e) => setNewDoc(prev => ({ ...prev, version: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="v1.0"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Onay Durumu
                  </label>
                  <select
                    value={newDoc.approval_status}
                    onChange={(e) => setNewDoc(prev => ({ ...prev, approval_status: e.target.value as any }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    disabled={submitting}
                  >
                    <option value="DRAFT">Taslak</option>
                    <option value="APPROVED">Onaylı</option>
                  </select>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <p className="text-sm text-indigo-900">
                    <strong>Not:</strong> Doküman oluşturulduktan sonra PDF dosyası yüklenebilir.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-t border-slate-200 rounded-b-2xl">
                <button
                  onClick={() => !submitting && setShowUploadModal(false)}
                  className="px-6 py-2.5 bg-white border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                  disabled={submitting}
                >
                  İptal
                </button>
                <button
                  onClick={handleUploadDoc}
                  disabled={submitting || !newDoc.title.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 disabled:from-slate-400 disabled:to-slate-500 transition-all font-semibold shadow-sm hover:shadow"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Ekleniyor...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Doküman Ekle
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
