import { useState } from 'react';
import { findingApi, type Finding, type FindingSeverity, type AuditType } from '@/entities/finding';
import { Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { XPEngine, getRiskLevelFromSeverity } from '@/features/talent-os/lib/XPEngine';
import { supabase } from '@/shared/api/supabase';

interface FindingFormProps {
  finding?: Partial<Finding>;
  auditId: string;
  onSave?: (finding: Finding) => void;
  onCancel?: () => void;
}

export function FindingForm({ finding, auditId, onSave, onCancel }: FindingFormProps) {
  const [formData, setFormData] = useState({
    title: finding?.title || '',
    code: finding?.code || '',
    severity: finding?.severity || 'MEDIUM' as FindingSeverity,
    audit_type: finding?.audit_type || 'SUBE' as AuditType,
    financial_impact: finding?.financial_impact || 0,
    detection_html: finding?.detection_html || '',
    impact_html: finding?.impact_html || '',
    recommendation_html: finding?.recommendation_html || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (finding?.id) {
        const updated = await findingApi.update(finding.id, formData);
        onSave?.(updated);
      } else {
        const created = await findingApi.create({
          ...formData,
          audit_id: auditId,
          tenant_id: 'default',
          main_status: 'ACIK',
          process_stage: 'DRAFT',
        });
        onSave?.(created);

        (async () => {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            const userId = user?.id ?? localStorage.getItem('sentinel_user_id');
            if (!userId) return;

            const riskLevel = getRiskLevelFromSeverity(formData.severity);
            const result = await XPEngine.awardFindingXP(userId, riskLevel);

            if (result.awarded) {
              const xpLabel = `+${result.amount} XP`;
              const levelMsg = result.levelUp ? ` · Seviye Atladın! Lv.${result.newLevel}` : '';
              toast.success(`${xpLabel}${levelMsg}`, {
                duration: 3000,
                style: { background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.1)' },
                icon: result.levelUp ? '⭐' : '✅',
              });
            }
          } catch {
            /* XP award is non-critical */
          }
        })();
      }
    } catch (error) {
      console.error('Failed to save finding:', error);
      alert('Bulgu kaydedilemedi');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          {finding?.id ? 'Bulgu Düzenle' : 'Yeni Bulgu'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Kod</label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ör: F-2024-001"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Önem Derecesi</label>
            <select
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value as FindingSeverity })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="LOW">Düşük</option>
              <option value="MEDIUM">Orta</option>
              <option value="HIGH">Yüksek</option>
              <option value="CRITICAL">Kritik</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Başlık</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Bulgu başlığı"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Denetim Tipi</label>
            <select
              value={formData.audit_type}
              onChange={(e) => setFormData({ ...formData, audit_type: e.target.value as AuditType })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="SUBE">Şube</option>
              <option value="SUREC_BS">Süreç/BS</option>
              <option value="GENEL">Genel</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Mali Etki (TL)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.financial_impact}
              onChange={(e) => setFormData({ ...formData, financial_impact: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Tespit</label>
          <textarea
            value={formData.detection_html}
            onChange={(e) => setFormData({ ...formData, detection_html: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Tespit edilen durum..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Etki</label>
          <textarea
            value={formData.impact_html}
            onChange={(e) => setFormData({ ...formData, impact_html: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Bulgunun etkisi..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Öneri</label>
          <textarea
            value={formData.recommendation_html}
            onChange={(e) => setFormData({ ...formData, recommendation_html: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Düzeltici öneri..."
          />
        </div>
      </div>

      <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </form>
  );
}
