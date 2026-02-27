import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  KeyRound, Shield, Building2, FileText, Send,
  Loader2, CheckCircle2, AlertTriangle, Clock, Lock,
} from 'lucide-react';
import clsx from 'clsx';
import { validateToken, loadPortalData, submitVendorResponses, markTokenUsed } from '@/features/vendor-portal/api';
import type { VendorPortalData, VendorToken } from '@/features/vendor-portal/api';

type Step = 'token' | 'assessment' | 'submitted';

export default function VendorPortalPage() {
  const { token: urlToken } = useParams<{ token?: string }>();
  const [step, setStep] = useState<Step>('token');
  const [tokenInput, setTokenInput] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [validating, setValidating] = useState(false);
  const [tokenData, setTokenData] = useState<VendorToken | null>(null);
  const [portalData, setPortalData] = useState<VendorPortalData | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validateAndLoad = useCallback(async (tok: string) => {
    setValidating(true);
    setTokenError('');
    try {
      const result = await validateToken(tok);
      if (!result.valid || !result.tokenData) {
        setTokenError(result.error || 'Gecersiz anahtar.');
        return;
      }
      setTokenData(result.tokenData);
      const data = await loadPortalData(result.tokenData.vendor_id, result.tokenData.assessment_id);
      if (!data) {
        setTokenError('Degerlendirme verisi yuklenemedi.');
        return;
      }
      setPortalData(data);
      const existing: Record<string, string> = {};
      data.questions.forEach((q) => { existing[q.id] = q.vendor_response || ''; });
      setResponses(existing);
      setStep('assessment');
    } catch {
      setTokenError('Baglanti hatasi.');
    } finally {
      setValidating(false);
    }
  }, []);

  useEffect(() => {
    if (urlToken) {
      setTokenInput(urlToken);
      validateAndLoad(urlToken);
    }
  }, [urlToken, validateAndLoad]);

  const handleValidateToken = useCallback(async () => {
    if (!tokenInput.trim()) return;
    setValidating(true);
    setTokenError('');

    try {
      const result = await validateToken(tokenInput.trim());
      if (!result.valid || !result.tokenData) {
        setTokenError(result.error || 'Gecersiz anahtar.');
        return;
      }

      setTokenData(result.tokenData);

      const data = await loadPortalData(result.tokenData.vendor_id, result.tokenData.assessment_id);
      if (!data) {
        setTokenError('Degerlendirme verisi yuklenemedi.');
        return;
      }

      setPortalData(data);
      const existing: Record<string, string> = {};
      data.questions.forEach((q) => {
        existing[q.id] = q.vendor_response || '';
      });
      setResponses(existing);
      setStep('assessment');
    } catch {
      setTokenError('Baglanti hatasi. Lutfen tekrar deneyin.');
    } finally {
      setValidating(false);
    }
  }, [tokenInput]);

  const handleSubmit = useCallback(async () => {
    if (!portalData || !tokenData) return;
    setSubmitting(true);

    try {
      const payload = Object.entries(responses)
        .filter(([, v]) => v.trim())
        .map(([id, vendor_response]) => ({ id, vendor_response }));

      await submitVendorResponses(portalData.assessment.id, payload);
      await markTokenUsed(tokenData.id);
      setStep('submitted');
    } catch {
      alert('Gonderim sirasinda hata olustu.');
    } finally {
      setSubmitting(false);
    }
  }, [portalData, tokenData, responses]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-800">Sentinel GRC</span>
              <span className="text-[10px] text-slate-400 block">Tedarikci Portali</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
            <Lock size={10} className="text-emerald-600" />
            <span className="text-[10px] font-bold text-emerald-700">Guvenli Baglanti</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {step === 'token' && (
            <TokenGate
              key="token"
              value={tokenInput}
              onChange={setTokenInput}
              onSubmit={handleValidateToken}
              loading={validating}
              error={tokenError}
            />
          )}

          {step === 'assessment' && portalData && (
            <AssessmentForm
              key="assessment"
              data={portalData}
              responses={responses}
              onChange={(id, val) => setResponses((p) => ({ ...p, [id]: val }))}
              onSubmit={handleSubmit}
              submitting={submitting}
            />
          )}

          {step === 'submitted' && (
            <SubmissionConfirmation key="submitted" vendorName={portalData?.vendor.name} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TokenGate({
  value, onChange, onSubmit, loading, error,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-md mx-auto pt-16"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <KeyRound size={28} className="text-slate-600" />
        </div>
        <h1 className="text-xl font-bold text-slate-800">Tedarikci Erisim Portali</h1>
        <p className="text-sm text-slate-500 mt-2">
          Size gonderilen erisim anahtarini asagiya girin.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-600 block mb-1.5">Erisim Anahtari</label>
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onSubmit(); }}
            placeholder="vp-xxxxxxxx-xxxx"
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-400 font-mono transition-colors"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle size={12} className="text-red-500" />
            <span className="text-[11px] text-red-700">{error}</span>
          </div>
        )}

        <button
          onClick={onSubmit}
          disabled={loading || !value.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
          {loading ? 'Dogrulanyor...' : 'Dogrula ve Giris Yap'}
        </button>
      </div>

      <p className="text-center text-[10px] text-slate-400 mt-6">
        Erisim anahtari tek kullanimliktir ve suresi sinirlidir.
      </p>
    </motion.div>
  );
}

function AssessmentForm({
  data, responses, onChange, onSubmit, submitting,
}: {
  data: VendorPortalData;
  responses: Record<string, string>;
  onChange: (id: string, val: string) => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const answered = Object.values(responses).filter((v) => v.trim()).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            <Building2 size={20} className="text-slate-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-800">{data.vendor.name}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{data.assessment.title}</p>
            <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-500">
              {data.assessment.due_date && (
                <span className="flex items-center gap-1">
                  <Clock size={10} />
                  Son Tarih: {new Date(data.assessment.due_date).toLocaleDateString('tr-TR')}
                </span>
              )}
              <span className="flex items-center gap-1">
                <FileText size={10} />
                {data.questions.length} soru
              </span>
              <span className="flex items-center gap-1 text-emerald-600 font-bold">
                <CheckCircle2 size={10} />
                {answered}/{data.questions.length} yanitlandi
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {data.questions.length === 0 ? (
          <div className="text-center py-12 text-sm text-slate-400">
            Henuz soru eklenmemis.
          </div>
        ) : (
          data.questions.map((q, i) => (
            <div key={q.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 rounded-md px-2 py-1 shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium text-slate-700">{q.question_text}</p>
                  {q.category && (
                    <span className="text-[9px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-bold">
                      {q.category}
                    </span>
                  )}
                  <textarea
                    value={responses[q.id] || ''}
                    onChange={(e) => onChange(q.id, e.target.value)}
                    rows={3}
                    placeholder="Yanitinizi yazin..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-slate-400 transition-colors resize-none"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {data.questions.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={onSubmit}
            disabled={submitting || answered === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {submitting ? 'Gonderiliyor...' : 'Yanitlari Gonder'}
          </button>
        </div>
      )}
    </motion.div>
  );
}

function SubmissionConfirmation({ vendorName }: { vendorName?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto pt-16 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6"
      >
        <CheckCircle2 size={36} className="text-emerald-600" />
      </motion.div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">Yanitlariniz Alindi</h2>
      <p className="text-sm text-slate-500 mb-6">
        {vendorName || 'Tedarikci'} olarak degerlendirme yanitlariniz basariyla gonderildi.
        Denetim ekibi inceleme sonrasinda sizinle iletisime gececektir.
      </p>
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500">
        Bu pencereyi guvenle kapatabilirsiniz.
      </div>
    </motion.div>
  );
}
