import { useState } from 'react';
import { X, Calendar, Target } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createEngagement, CreateEngagementInput, AuditType } from '@/entities/planning';
import { ACTIVE_TENANT_ID } from '@/shared/lib/constants';

interface NewEngagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  entities: Array<{ id: string; name: string; risk_score?: number }>;
}

const TENANT_ID = ACTIVE_TENANT_ID;

export default function NewEngagementModal({
  isOpen,
  onClose,
  planId,
  entities,
}: NewEngagementModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    entity_id: '',
    title: '',
    audit_type: 'COMPREHENSIVE' as AuditType,
    start_date: '',
    end_date: '',
    estimated_hours: 40,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateEngagementInput) => createEngagement(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-engagements-list'] });
      queryClient.invalidateQueries({ queryKey: ['audit-engagements'] });
      onClose();
      resetForm();
    },
  });

  const resetForm = () => {
    setFormData({
      entity_id: '',
      title: '',
      audit_type: 'COMPREHENSIVE',
      start_date: '',
      end_date: '',
      estimated_hours: 40,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedEntity = entities.find((ent) => ent.id === formData.entity_id);
    const riskScore = selectedEntity?.risk_score || 50;

    const input: CreateEngagementInput = {
      tenant_id: TENANT_ID,
      plan_id: planId,
      entity_id: formData.entity_id,
      title: formData.title,
      audit_type: formData.audit_type,
      start_date: formData.start_date,
      end_date: formData.end_date,
      risk_snapshot_score: riskScore,
      estimated_hours: formData.estimated_hours,
    };

    createMutation.mutate(input);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* HEADER */}
        <div className="shrink-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6" />
            <h2 className="text-xl font-bold">Yeni Denetim Görevi Oluştur</h2>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY & FOOTER WRAPPED IN FORM */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          
          {/* SCROLLABLE CONTENT */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1 bg-slate-50/30">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Denetlenecek Birim *
              </label>
              <select
                required
                value={formData.entity_id}
                onChange={(e) => setFormData({ ...formData, entity_id: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Birim Seçin</option>
                {entities.map((entity) => (
                  <option key={entity.id} value={entity.id}>
                    {entity.name} {entity.risk_score ? `(Risk: ${entity.risk_score.toFixed(1)})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Denetim Başlığı *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Örn: 2024 Bilgi Güvenliği Denetimi"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Denetim Türü *
              </label>
              <select
                required
                value={formData.audit_type}
                onChange={(e) =>
                  setFormData({ ...formData, audit_type: e.target.value as AuditType })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="COMPREHENSIVE">Kapsamlı Denetim</option>
                <option value="TARGETED">Hedefli Denetim</option>
                <option value="FOLLOW_UP">İzleme Denetimi</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Başlangıç Tarihi *
                </label>
                <input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bitiş Tarihi *
                </label>
                <input
                  type="date"
                  required
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tahmini Süre (Saat)
              </label>
              <input
                type="number"
                min="1"
                value={formData.estimated_hours}
                onChange={(e) =>
                  setFormData({ ...formData, estimated_hours: parseInt(e.target.value) || 40 })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {createMutation.isError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                Denetim oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.
              </div>
            )}
          </div>

          {/* FIXED FOOTER */}
          <div className="flex gap-3 p-6 border-t shrink-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {createMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  Denetim Oluştur
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}