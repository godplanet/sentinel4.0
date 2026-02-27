import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  CheckCircle2,
  X,
  Calendar,
  Tag,
  Shield,
  Download,
  ExternalLink,
} from 'lucide-react';
import {
  fetchPoliciesWithAttestations,
  createAttestation,
  type PolicyWithAttestation,
} from '@/entities/policy';

export function PolicyLibrary() {
  const [policies, setPolicies] = useState<PolicyWithAttestation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyWithAttestation | null>(null);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [attesting, setAttesting] = useState(false);

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const userId = '11111111-1111-1111-1111-111111111111';
      const data = await fetchPoliciesWithAttestations(userId);
      setPolicies(data);
    } catch (error) {
      console.error('Failed to load policies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPolicy = (policy: PolicyWithAttestation) => {
    setSelectedPolicy(policy);
    setShowPDFModal(true);
  };

  const handleAttest = async () => {
    if (!selectedPolicy) return;

    try {
      setAttesting(true);
      const userId = '11111111-1111-1111-1111-111111111111';
      await createAttestation(selectedPolicy.id, userId);
      await loadPolicies();
      setShowPDFModal(false);
      setSelectedPolicy(null);
    } catch (error) {
      console.error('Failed to create attestation:', error);
    } finally {
      setAttesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Politikalar yükleniyor...</p>
        </div>
      </div>
    );
  }

  const attestedCount = policies.filter(p => p.is_attested).length;
  const pendingCount = policies.length - attestedCount;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Toplam Politika</span>
            <FileText className="w-5 h-5 text-slate-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{policies.length}</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Onaylandı</span>
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-600">{attestedCount}</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Bekleyen</span>
            <Shield className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-amber-600">{pendingCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {policies.map((policy, index) => (
          <motion.div
            key={policy.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-white rounded-lg border-2 shadow-sm hover:shadow-md transition-all overflow-hidden ${
              policy.is_attested
                ? 'border-green-200 bg-green-50/30'
                : 'border-slate-200 hover:border-blue-300'
            }`}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                {policy.is_attested && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-green-100 rounded-full">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-semibold text-green-700">Onaylandı</span>
                  </div>
                )}
              </div>

              <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
                {policy.title}
              </h3>

              <div className="space-y-2 mb-4">
                {policy.version && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Tag className="w-4 h-4" />
                    <span>Versiyon {policy.version}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(policy.created_at).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {policy.is_attested ? (
                <div className="space-y-2">
                  <button
                    onClick={() => handleOpenPolicy(policy)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Politikayı Görüntüle
                  </button>
                  {policy.attestation && (
                    <p className="text-xs text-center text-slate-500">
                      Onay:{' '}
                      {new Date(policy.attestation.attested_at).toLocaleDateString('tr-TR')}
                    </p>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => handleOpenPolicy(policy)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-sm hover:shadow"
                >
                  <FileText className="w-4 h-4" />
                  Oku ve Onayla
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {policies.length === 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">
            Politika Bulunamadı
          </h3>
          <p className="text-slate-500">Henüz aktif politika bulunmuyor.</p>
        </div>
      )}

      <AnimatePresence>
        {showPDFModal && selectedPolicy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !attesting && setShowPDFModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedPolicy.title}</h2>
                    {selectedPolicy.version && (
                      <p className="text-sm text-blue-100">Versiyon {selectedPolicy.version}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => !attesting && setShowPDFModal(false)}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                  disabled={attesting}
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-12 text-center mb-6">
                  <Download className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">
                    PDF Görüntüleyici (Mock)
                  </h3>
                  <p className="text-slate-600 mb-4">
                    Gerçek uygulamada PDF dosyası burada görüntülenecektir.
                  </p>
                  {selectedPolicy.content_url && (
                    <p className="text-sm text-slate-500 font-mono bg-white px-4 py-2 rounded border border-slate-200 inline-block">
                      {selectedPolicy.content_url}
                    </p>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-blue-900 mb-2">Politika İçeriği (Özet)</h4>
                  <div className="text-sm text-blue-800 space-y-2">
                    <p>
                      <strong>{selectedPolicy.title}</strong> politikası, kurum içi
                      prosedürleri ve uyulması gereken kuralları içermektedir.
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Tüm çalışanlar bu politikaya uymalıdır</li>
                      <li>Politika ihlalleri disiplin sürecini başlatabilir</li>
                      <li>Düzenli olarak güncellenecektir</li>
                      <li>Sorularınız için İK departmanına başvurabilirsiniz</li>
                    </ul>
                  </div>
                </div>

                {!selectedPolicy.is_attested && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-amber-900">
                        <p className="font-semibold mb-1">Onay Gerekiyor</p>
                        <p className="text-amber-800">
                          Bu politikayı okuduğunuzu ve anladığınızı onaylamanız gerekmektedir.
                          Onayladığınızda tarih ve kullanıcı bilginiz kaydedilecektir.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-t border-slate-200">
                <button
                  onClick={() => !attesting && setShowPDFModal(false)}
                  className="px-6 py-2.5 bg-white border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                  disabled={attesting}
                >
                  Kapat
                </button>

                {!selectedPolicy.is_attested && (
                  <button
                    onClick={handleAttest}
                    disabled={attesting}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:from-slate-400 disabled:to-slate-500 transition-all font-semibold shadow-sm hover:shadow"
                  >
                    {attesting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Onaylanıyor...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Okudum ve Onaylıyorum
                      </>
                    )}
                  </button>
                )}

                {selectedPolicy.is_attested && (
                  <div className="flex items-center gap-2 px-6 py-2.5 bg-green-100 text-green-700 rounded-lg font-semibold">
                    <CheckCircle2 className="w-5 h-5" />
                    Onaylandı
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
