import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2, AlertTriangle, Loader2, Shield,
  Calendar, Target, FileText, Save, Lock, PenLine,
  ShieldCheck, Clock,
} from 'lucide-react';
import clsx from 'clsx';
import type { AdvisoryEngagement } from '@/entities/advisory';
import { useUpdateAdvisoryEngagement } from '@/entities/advisory';
import {
  fetchAckStatus,
  confirmManagementAck,
} from '@/features/advisory/api/management-ack-api';

interface Props {
  engagement: AdvisoryEngagement;
  onConfirmResponsibility?: () => Promise<void>;
  isUpdating?: boolean;
}

const METHODOLOGY_OPTIONS = [
  { value: 'PROCESS_DESIGN', label: 'Süreç Tasarımı' },
  { value: 'WORKSHOP', label: 'Çalıştay / Eğitim' },
  { value: 'INVESTIGATION', label: 'Araştırma / İnceleme' },
];

export function TermsOfReferenceTab({ engagement }: Props) {
  const qc = useQueryClient();
  const updateEngagement = useUpdateAdvisoryEngagement();

  const [scopeText, setScopeText] = useState(engagement.scope_limitations);
  const [methodology, setMethodology] = useState(engagement.methodology || '');
  const [startDate, setStartDate] = useState(engagement.start_date || '');
  const [targetDate, setTargetDate] = useState(engagement.target_date || '');
  const [saving, setSaving] = useState(false);

  // e-İmza form state'leri
  const [ackChecked, setAckChecked] = useState(false);
  const [signerName, setSignerName] = useState('');

  /** Feragatname onay durumunu veritabanından çek */
  const { data: ackStatus, isLoading: ackLoading } = useQuery({
    queryKey: ['advisory-ack', engagement.id],
    queryFn: () => fetchAckStatus(engagement.id),
    staleTime: 30_000,
  });

  /** Yönetim feragatname onayı mutation */
  const ackMutation = useMutation({
    mutationFn: () => confirmManagementAck(engagement.id, signerName.trim()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['advisory-ack', engagement.id] });
      qc.invalidateQueries({ queryKey: ['advisory-engagements'] });
      qc.invalidateQueries({ queryKey: ['advisory-engagement', engagement.id] });
    },
  });

  const isConfirmed = ackStatus?.management_responsibility_confirmed ?? engagement.management_responsibility_confirmed;
  const isFieldworkActive = ackStatus?.status === 'FIELDWORK' || engagement.status === 'FIELDWORK';

  const canStartFieldwork = isConfirmed && isFieldworkActive;
  const canSign = ackChecked && signerName.trim().length >= 3 && !isConfirmed;

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

      {/* ── SERT GEÇİT: Yönetim Feragatnamesi (GIAS 11.1) ── */}
      <div className={clsx(
        'rounded-2xl border-2 p-6 transition-all',
        isConfirmed
          ? 'border-emerald-200 bg-emerald-50/60'
          : 'border-amber-300 bg-amber-50 shadow-lg shadow-amber-100',
      )}>
        <div className="flex items-start gap-4">
          <div className={clsx(
            'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
            isConfirmed ? 'bg-emerald-100' : 'bg-amber-100',
          )}>
            {isConfirmed
              ? <ShieldCheck size={24} className="text-emerald-600" />
              : <AlertTriangle size={24} className="text-amber-600" />
            }
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-bold text-slate-800">
                Yönetim Sorumluluk Feragatnamesi
              </h3>
              <span className={clsx(
                'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                isConfirmed
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700',
              )}>
                {isConfirmed ? 'ONAYLANDI' : 'ONAY BEKLENİYOR'}
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
              <span className="font-semibold text-slate-700">GIAS 2024 Standart 11.1:</span>{' '}
              İç denetim birimi danışmanlık hizmeti vermeden önce, yönetimin kontroller
              üzerindeki nihaii sorumluluğunu kabul etmesi zorunludur. Bu onay alınmadan
              proje "Planlama" statüsünde kilitli kalır.
            </p>

            {isConfirmed && ackStatus?.management_acknowledged_by && (
              <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-100/60 rounded-lg px-3 py-2 w-fit">
                <PenLine size={12} />
                <span>
                  <span className="font-bold">{ackStatus.management_acknowledged_by}</span>
                  {' '}tarafından{' '}
                  {ackStatus.management_acknowledged_at
                    ? new Date(ackStatus.management_acknowledged_at).toLocaleString('tr-TR')
                    : ''}
                  {' '}tarihinde e-imzalandı.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* e-İmza Paneli — sadece onaylanmamışsa görünür */}
        {!isConfirmed && !ackLoading && (
          <div className="mt-5 border-t border-amber-200 pt-5 space-y-4">

            {/* Feragatname metni */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
              <p className="font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
                <FileText size={14} />
                Feragatname Beyanı
              </p>
              <p>
                "İç Denetim birimi bu danışmanlık projesinde yalnızca rehberlik ve görüş
                sağlamaktadır. Nihai kararların alınması, kontrollerin tasarımı ve uygulanması
                ile bunların sonuçlarından doğan <span className="font-bold">tüm yönetim sorumluluğu
                bana aittir.</span> Bu hizmeti talep etmekle iç denetimin bağımsızlığını
                tehlikeye atmayacağımı ve GIAS 2024 Standart 11.1 kapsamındaki yükümlülüklerin
                bilincinde olduğumu kabul ediyorum."
              </p>
            </div>

            {/* İmzacı adı */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Ad Soyad (e-İmza)
              </label>
              <input
                type="text"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="Onaylayan yöneticinin tam adını girin..."
                className="w-full px-4 py-2.5 bg-canvas border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 placeholder:text-slate-400"
              />
            </div>

            {/* Onay checkbox */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className={clsx(
                'mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all',
                ackChecked
                  ? 'bg-amber-500 border-amber-500'
                  : 'border-slate-300 group-hover:border-amber-400',
              )}>
                {ackChecked && <CheckCircle2 size={12} className="text-white" />}
              </div>
              <input
                type="checkbox"
                className="sr-only"
                checked={ackChecked}
                onChange={(e) => setAckChecked(e.target.checked)}
              />
              <span className="text-sm text-slate-700 leading-relaxed">
                Yukarıdaki feragatname beyanını okudum ve kabul ediyorum.{' '}
                <span className="font-bold text-amber-700">
                  İç Denetimin bu projede karar alıcı olmadığını
                </span>{' '}
                ve tüm Yönetim Sorumluluğunun (Management Accountability) tarafıma ait
                olduğunu teyit ediyorum.
              </span>
            </label>

            {/* Onay butonu */}
            <button
              onClick={() => ackMutation.mutate()}
              disabled={!canSign || ackMutation.isPending}
              className={clsx(
                'flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all',
                canSign
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-200'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed',
              )}
            >
              {ackMutation.isPending
                ? <Loader2 size={16} className="animate-spin" />
                : <Shield size={16} />
              }
              e-İmza ile Feragatnameyi Onayla
            </button>

            {ackMutation.isError && (
              <p className="text-xs text-red-600 flex items-center gap-1.5">
                <AlertTriangle size={12} />
                Onay kaydedilirken hata oluştu. Lütfen tekrar deneyin.
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── SERT GEÇİT: Saha İcrasını Başlat butonu ── */}
      <div className={clsx(
        'rounded-2xl border p-5 flex items-center justify-between',
        canStartFieldwork
          ? 'border-emerald-200 bg-emerald-50/40'
          : 'border-slate-200 bg-slate-50',
      )}>
        <div className="flex items-center gap-3">
          {canStartFieldwork
            ? <CheckCircle2 size={20} className="text-emerald-500" />
            : <Lock size={20} className="text-slate-400" />
          }
          <div>
            <p className={clsx(
              'text-sm font-bold',
              canStartFieldwork ? 'text-emerald-700' : 'text-slate-500',
            )}>
              {canStartFieldwork ? 'Saha İcrası Aktif' : 'Saha İcrası Kilitli'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {canStartFieldwork
                ? 'Yönetim feragatnamesi onaylandı. Çalışma alanları aktifleşti.'
                : 'Yukarıdaki feragatnameyi e-imzalayana kadar saha icrasına geçilemez.'}
            </p>
          </div>
        </div>
        <button
          disabled={!canStartFieldwork}
          className={clsx(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all',
            canStartFieldwork
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed',
          )}
        >
          {canStartFieldwork
            ? <><CheckCircle2 size={15} /> Saha İcrasını Başlat</>
            : <><Lock size={15} /> Saha İcrasını Başlat</>
          }
        </button>
      </div>

      {/* ── Görev Tanımı Formu ── */}
      <div className="bg-surface border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-cyan-50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <FileText size={16} className="text-blue-600" />
            Görev Tanımı (Terms of Reference)
          </h2>
          <button
            onClick={handleSaveScope}
            disabled={saving || !canStartFieldwork}
            title={!canStartFieldwork ? 'Feragatname onaylanmadan düzenleme yapılamaz' : ''}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            Kaydet
          </button>
        </div>

        <div className={clsx(
          'p-6 space-y-6',
          !canStartFieldwork && 'opacity-50 pointer-events-none select-none',
        )}>
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
                Başlangıç Tarihi
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-canvas border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                <Target size={12} />
                Hedef Bitiş Tarihi
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-4 py-3 bg-canvas border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Kapsam & Sınırllılıklar
            </label>
            <textarea
              value={scopeText}
              onChange={(e) => setScopeText(e.target.value)}
              placeholder="Bu danışmanlık hizmetinin kapsamı ve sınırllılıklarını tanımlayın..."
              rows={6}
              className="w-full px-4 py-3 bg-canvas border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 resize-none leading-relaxed"
            />
          </div>
        </div>

        {!canStartFieldwork && (
          <div className="px-6 pb-4 flex items-center gap-2 text-xs text-amber-600">
            <Clock size={12} />
            Feragatname e-imzası tamamlanmadan bu alan düzenlenemez (GIAS 11.1).
          </div>
        )}
      </div>
    </div>
  );
}
