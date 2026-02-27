import { useState } from 'react';
import {
  CheckCircle2, AlertTriangle, Loader2, Shield,
  Calendar, Target, FileText, Save,
} from 'lucide-react';
import clsx from 'clsx';
import type { AdvisoryEngagement } from '@/entities/advisory';
import { useUpdateAdvisoryEngagement } from '@/entities/advisory';

interface Props {
  engagement: AdvisoryEngagement;
  onConfirmResponsibility: () => Promise<void>;
  isUpdating: boolean;
}

const METHODOLOGY_OPTIONS = [
  { value: 'PROCESS_DESIGN', label: 'Surec Tasarimi' },
  { value: 'WORKSHOP', label: 'Calistay / Egitim' },
  { value: 'INVESTIGATION', label: 'Arastirma / Inceleme' },
];

export function TermsOfReferenceTab({ engagement, onConfirmResponsibility, isUpdating }: Props) {
  const updateEngagement = useUpdateAdvisoryEngagement();
  const [scopeText, setScopeText] = useState(engagement.scope_limitations);
  const [methodology, setMethodology] = useState(engagement.methodology || '');
  const [startDate, setStartDate] = useState(engagement.start_date || '');
  const [targetDate, setTargetDate] = useState(engagement.target_date || '');
  const [saving, setSaving] = useState(false);

  const handleSaveScope = async () => {
    setSaving(true);
    try {
      await updateEngagement.mutateAsync({
        id: engagement.id,
        scope_limitations: scopeText,
        methodology: methodology as AdvisoryEngagement['methodology'],
        start_date: startDate || null,
        target_date: targetDate || null,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div className={clsx(
        'rounded-2xl border-2 p-6 transition-all',
        engagement.management_responsibility_confirmed
          ? 'border-emerald-200 bg-emerald-50/50'
          : 'border-amber-300 bg-amber-50 shadow-md shadow-amber-100',
      )}>
        <div className="flex items-start gap-4">
          <div className={clsx(
            'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
            engagement.management_responsibility_confirmed
              ? 'bg-emerald-100'
              : 'bg-amber-100',
          )}>
            {engagement.management_responsibility_confirmed ? (
              <CheckCircle2 size={24} className="text-emerald-600" />
            ) : (
              <AlertTriangle size={24} className="text-amber-600" />
            )}
          </div>

          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-800">
              Yonetim Sorumluluk Onayı (GIAS 2024)
            </h3>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
              GIAS 2024 Standart 2010.A2 geregi: Ic denetim birimi danismanlik hizmeti vermeden once,
              yonetimin kontroller uzerindeki nihahi sorumlulugunu kabul etmesi gerekmektedir.
              Bu onay verildikten sonra calisma alanlari aktiflesecektir.
            </p>

            {!engagement.management_responsibility_confirmed && (
              <button
                onClick={onConfirmResponsibility}
                disabled={isUpdating}
                className="mt-4 flex items-center gap-2 px-5 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
              >
                {isUpdating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Shield size={16} />
                )}
                Yonetim Sorumlulugu Onaylandir
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-cyan-50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <FileText size={16} className="text-blue-600" />
            Gorev Tanimi (Terms of Reference)
          </h2>
          <button
            onClick={handleSaveScope}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            Kaydet
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Metodoloji</label>
            <div className="flex gap-3">
              {METHODOLOGY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setMethodology(opt.value)}
                  className={clsx(
                    'flex-1 px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all',
                    methodology === opt.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                <Calendar size={12} />
                Baslangic Tarihi
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                <Target size={12} />
                Hedef Bitis Tarihi
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Kapsam & Sinirlilliklar
            </label>
            <textarea
              value={scopeText}
              onChange={(e) => setScopeText(e.target.value)}
              placeholder="Bu danismanlik hizmetinin kapsami ve sinirlilliklarini tanimlayin..."
              rows={6}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 resize-none leading-relaxed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
