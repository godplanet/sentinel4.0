import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useRiskLibraryStore } from '@/entities/risk';
import type { RiskLibraryItem, RiskCategory, CreateRiskInput } from '@/entities/risk/types';

interface RiskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editRisk?: RiskLibraryItem | null;
}

const RISK_CATEGORIES: { value: RiskCategory; label: string }[] = [
  { value: 'STRATEGIC', label: 'Stratejik Risk' },
  { value: 'OPERATIONAL', label: 'Operasyonel Risk' },
  { value: 'FINANCIAL', label: 'Finansal Risk' },
  { value: 'COMPLIANCE', label: 'Uyum Riski' },
  { value: 'REPUTATIONAL', label: 'İtibar Riski' },
  { value: 'TECHNOLOGY', label: 'Teknoloji Riski' },
  { value: 'CREDIT', label: 'Kredi Riski' },
  { value: 'MARKET', label: 'Piyasa Riski' },
  { value: 'LIQUIDITY', label: 'Likidite Riski' },
  { value: 'OTHER', label: 'Diğer' },
];

export function RiskFormModal({ isOpen, onClose, editRisk }: RiskFormModalProps) {
  const { addRisk, updateRisk } = useRiskLibraryStore();

  const [formData, setFormData] = useState<CreateRiskInput>({
    risk_code: '',
    title: '',
    description: '',
    category: 'OPERATIONAL',
    impact_score: 50,
    likelihood_score: 50,
    control_effectiveness: 0.5,
    tags: [],
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (editRisk) {
      setFormData({
        risk_code: editRisk.risk_code,
        title: editRisk.title,
        description: editRisk.description || '',
        category: editRisk.category,
        impact_score: editRisk.impact_score,
        likelihood_score: editRisk.likelihood_score,
        control_effectiveness: editRisk.control_effectiveness,
        tags: editRisk.tags || [],
      });
    } else {
      setFormData({
        risk_code: '',
        title: '',
        description: '',
        category: 'OPERATIONAL',
        impact_score: 50,
        likelihood_score: 50,
        control_effectiveness: 0.5,
        tags: [],
      });
    }
  }, [editRisk, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editRisk) {
      updateRisk({
        id: editRisk.id,
        ...formData,
      });
    } else {
      addRisk(formData);
    }

    onClose();
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((t) => t !== tag) || [],
    });
  };

  if (!isOpen) return null;

  const inherentScore = Math.sqrt(formData.impact_score * formData.likelihood_score) * 10;
  const residualScore = inherentScore * (1 - formData.control_effectiveness);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {editRisk ? 'Risk Düzenle' : 'Yeni Risk Ekle'}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Risk Bilgi Kütüphanesi Kaydı
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Risk Kodu *
              </label>
              <input
                type="text"
                required
                value={formData.risk_code}
                onChange={(e) =>
                  setFormData({ ...formData, risk_code: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Örn: CR-001"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Kategori *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as RiskCategory,
                  })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {RISK_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Risk Başlığı *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Risk başlığını girin"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Açıklama
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Risk açıklaması"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Etki Skoru (0-100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={formData.impact_score}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    impact_score: Number(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="mt-2 h-2 bg-slate-200 rounded-full">
                <div
                  className="h-2 bg-red-500 rounded-full transition-all"
                  style={{ width: `${formData.impact_score}%` }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Olasılık Skoru (0-100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={formData.likelihood_score}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    likelihood_score: Number(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="mt-2 h-2 bg-slate-200 rounded-full">
                <div
                  className="h-2 bg-amber-500 rounded-full transition-all"
                  style={{ width: `${formData.likelihood_score}%` }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Kontrol Etkinliği (0-1)
              </label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.01"
                required
                value={formData.control_effectiveness}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    control_effectiveness: Number(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="mt-2 h-2 bg-slate-200 rounded-full">
                <div
                  className="h-2 bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${formData.control_effectiveness * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <div className="text-xs text-slate-600 mb-1">Doğal Risk Skoru</div>
              <div className="text-2xl font-bold text-red-600">
                {inherentScore.toFixed(1)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-600 mb-1">Artık Risk Skoru</div>
              <div className="text-2xl font-bold text-emerald-600">
                {residualScore.toFixed(1)}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Etiketler
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Etiket ekle ve Enter'a bas"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
              >
                Ekle
              </button>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-blue-900"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
            >
              {editRisk ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
