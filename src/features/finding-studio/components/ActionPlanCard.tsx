import { useState } from 'react';
import { X, Upload, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import clsx from 'clsx';

export interface ActionPlan {
  id: string;
  description: string;
  owner_user_id?: string;
  owner_name?: string;
  owner_role?: string;
  due_date?: string;
  progress?: number;
  agreement_status: 'PENDING' | 'AGREED' | 'DISAGREED';
  disagreement_reason?: string;
  risk_acceptance_confirmed?: boolean;
  risk_acceptance_evidence_url?: string;
}

interface ActionPlanCardProps {
  actionPlan: ActionPlan;
  onUpdate: (updates: Partial<ActionPlan>) => void;
  onDelete: () => void;
  availableOwners: Array<{ id: string; name: string; role: string }>;
}

export function ActionPlanCard({
  actionPlan,
  onUpdate,
  onDelete,
  availableOwners,
}: ActionPlanCardProps) {
  const [showRiskForm, setShowRiskForm] = useState(actionPlan.agreement_status === 'DISAGREED');

  const isAgreed = actionPlan.agreement_status === 'AGREED';
  const isDisagreed = actionPlan.agreement_status === 'DISAGREED';
  const isPending = actionPlan.agreement_status === 'PENDING';

  const handleAgreementToggle = (status: 'AGREED' | 'DISAGREED') => {
    setShowRiskForm(status === 'DISAGREED');
    onUpdate({
      agreement_status: status,
      // Clear fields when switching
      disagreement_reason: status === 'AGREED' ? undefined : actionPlan.disagreement_reason,
      risk_acceptance_confirmed: status === 'AGREED' ? undefined : actionPlan.risk_acceptance_confirmed,
    });
  };

  const canSave = () => {
    if (isAgreed) {
      return actionPlan.owner_user_id && actionPlan.due_date;
    }
    if (isDisagreed) {
      return (
        actionPlan.disagreement_reason &&
        actionPlan.disagreement_reason.length > 20 &&
        actionPlan.risk_acceptance_confirmed
      );
    }
    return false;
  };

  const isValid = canSave();

  return (
    <div
      className={clsx(
        'bg-white rounded-lg p-5 border-2 transition-all',
        isDisagreed ? 'border-red-500 bg-red-50/50' : 'border-gray-200',
        !isValid && !isPending && 'ring-2 ring-amber-400 ring-offset-2'
      )}
    >
      {/* Agreement Status Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-bold text-gray-700 uppercase">Mutabakat Durumu</div>
          {isDisagreed && (
            <div className="flex items-center gap-1 text-xs text-red-700 font-semibold bg-red-100 px-2 py-1 rounded-full">
              <AlertTriangle className="w-3 h-3" />
              Risk Kabul Gerekli
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleAgreementToggle('AGREED')}
            className={clsx(
              'flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all border-2',
              isAgreed
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
            )}
          >
            <CheckCircle className="inline w-4 h-4 mr-1.5" />
            Mutabıkım
          </button>
          <button
            onClick={() => handleAgreementToggle('DISAGREED')}
            className={clsx(
              'flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all border-2',
              isDisagreed
                ? 'bg-red-600 text-white border-red-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-red-500'
            )}
          >
            <XCircle className="inline w-4 h-4 mr-1.5" />
            Mutabık Değilim
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-gray-700 uppercase mb-2 block">
          Aksiyon Açıklaması
        </label>
        <textarea
          value={actionPlan.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Aksiyon planını açıklayın..."
        />
      </div>

      {/* AGREED: Show Owner & Due Date */}
      {isAgreed && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase mb-2 block">
              Sorumlu Kişi *
            </label>
            <select
              value={actionPlan.owner_user_id || ''}
              onChange={(e) => {
                const owner = availableOwners.find((o) => o.id === e.target.value);
                onUpdate({
                  owner_user_id: owner?.id,
                  owner_name: owner?.name,
                  owner_role: owner?.role,
                });
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sorumlu seçin...</option>
              {availableOwners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name} - {owner.role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase mb-2 block">
              Termin Tarihi *
            </label>
            <input
              type="date"
              value={actionPlan.due_date || ''}
              onChange={(e) => onUpdate({ due_date: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase mb-2 block">
              İlerleme Durumu
            </label>
            <select
              value={actionPlan.progress || 0}
              onChange={(e) => onUpdate({ progress: parseInt(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>0% - Başlanmadı</option>
              <option value={25}>25% - Başladı</option>
              <option value={50}>50% - Yarıda</option>
              <option value={75}>75% - Neredeyse bitti</option>
              <option value={100}>100% - Tamamlandı</option>
            </select>
          </div>
        </div>
      )}

      {/* DISAGREED: Show Risk Acceptance Form */}
      {isDisagreed && showRiskForm && (
        <div className="border-2 border-red-400 rounded-lg p-4 bg-red-50">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div className="font-bold text-red-900 uppercase text-sm">
              Risk Kabul / İtiraz Formu
            </div>
          </div>

          {/* Disagreement Reason */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-red-900 uppercase mb-2 block">
              İtiraz Gerekçesi * (Min. 20 karakter)
            </label>
            <textarea
              value={actionPlan.disagreement_reason || ''}
              onChange={(e) => onUpdate({ disagreement_reason: e.target.value })}
              className="w-full border border-red-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
              rows={4}
              placeholder="Neden bu aksiyon planına katılmıyorsunuz? Detaylı açıklayın..."
            />
            <div className="text-xs text-red-700 mt-1">
              {actionPlan.disagreement_reason?.length || 0} / 20 karakter (zorunlu)
            </div>
          </div>

          {/* Risk Acceptance Checkbox */}
          <div className="mb-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={actionPlan.risk_acceptance_confirmed || false}
                onChange={(e) => onUpdate({ risk_acceptance_confirmed: e.target.checked })}
                className="mt-1 w-4 h-4 text-red-600 border-red-300 rounded focus:ring-red-500"
              />
              <div className="text-sm">
                <div className="font-bold text-red-900 mb-1">
                  Risk Kabulü Onayı *
                </div>
                <div className="text-red-800">
                  Bu aksiyonu uygulamamamdan kaynaklanabilecek tüm risklerin ve olası
                  sonuçlarının sorumluluğunu üstleniyorum. İlgili düzenlemeleri okudum
                  ve anladım.
                </div>
              </div>
            </label>
          </div>

          {/* Evidence Upload */}
          <div>
            <label className="text-xs font-semibold text-red-900 uppercase mb-2 block">
              Kanıt / Belge (Opsiyonel)
            </label>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-red-300 rounded-lg text-sm text-red-700 hover:bg-red-100 transition-colors">
              <Upload className="w-4 h-4" />
              Dosya Yükle
            </button>
            {actionPlan.risk_acceptance_evidence_url && (
              <div className="text-xs text-red-700 mt-2">
                ✓ Dosya yüklendi
              </div>
            )}
          </div>
        </div>
      )}

      {/* Validation Warning */}
      {!isValid && !isPending && (
        <div className="mt-4 bg-amber-100 border border-amber-400 rounded-lg px-3 py-2 text-sm text-amber-900">
          <strong>⚠️ Eksik Bilgi:</strong>{' '}
          {isAgreed && 'Sorumlu ve termin tarihi zorunludur.'}
          {isDisagreed && 'İtiraz gerekçesi ve risk kabul onayı zorunludur.'}
        </div>
      )}

      {/* Delete Button */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
        <button
          onClick={onDelete}
          className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
        >
          <X className="w-4 h-4" />
          Sil
        </button>
      </div>
    </div>
  );
}
