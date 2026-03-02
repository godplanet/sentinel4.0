import { useState, useEffect } from 'react';
import { X, History, FilePen, RotateCcw, Clock, ChevronRight } from 'lucide-react';
import { useRiskLibraryStore } from '@/entities/risk';
import type { RiskLibraryItem, RiskCategory, CreateRiskInput } from '@/entities/risk/types';
import { useRiskVersions, useRollbackRiskVersion } from '../api/snapshots-api';
import type { RkmRiskVersion } from '../api/snapshots-api';
import toast from 'react-hot-toast';

// ─── Sabitler ────────────────────────────────────────────────────────────────

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

type ActiveTab = 'form' | 'history';

// ─── Ana Modal ────────────────────────────────────────────────────────────────

interface RiskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editRisk?: RiskLibraryItem | null;
}

export function RiskFormModal({ isOpen, onClose, editRisk }: RiskFormModalProps) {
  const { addRisk, updateRisk } = useRiskLibraryStore();
  const [activeTab, setActiveTab] = useState<ActiveTab>('form');

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
      setActiveTab('form');
    }
  }, [editRisk, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editRisk) {
      updateRisk({ id: editRisk.id, ...formData });
    } else {
      addRisk(formData);
    }
    onClose();
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...(formData.tags || []), tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags?.filter((t) => t !== tag) || [] });
  };

  if (!isOpen) return null;

  const inherentScore = Math.sqrt(formData.impact_score * formData.likelihood_score) * 10;
  const residualScore = inherentScore * (1 - formData.control_effectiveness);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-surface rounded-xl shadow-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-primary">
              {editRisk ? 'Risk Düzenle' : 'Yeni Risk Ekle'}
            </h2>
            <p className="text-sm text-slate-600 mt-1">Risk Bilgi Kütüphanesi Kaydı</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={24} className="text-slate-500" />
          </button>
        </div>

        {/* Sekmeler — sadece edit modunda Tarihçe sekmesi görünür */}
        {editRisk && (
          <div className="flex items-center gap-1 px-6 pt-4 flex-shrink-0 border-b border-slate-100">
            <TabButton
              active={activeTab === 'form'}
              onClick={() => setActiveTab('form')}
              icon={<FilePen size={14} />}
              label="Risk Formu"
            />
            <TabButton
              active={activeTab === 'history'}
              onClick={() => setActiveTab('history')}
              icon={<History size={14} />}
              label="Tarihçe ve Versiyonlar"
            />
          </div>
        )}

        {/* İçerik */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'form' && (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Risk Kodu *</label>
                  <input
                    type="text"
                    required
                    value={formData.risk_code}
                    onChange={(e) => setFormData({ ...formData, risk_code: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Örn: CR-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Kategori *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as RiskCategory })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {RISK_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Risk Başlığı *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Risk başlığını girin"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Açıklama</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Risk açıklaması"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ScoreField
                  label="Etki Skoru (0-100)"
                  value={formData.impact_score}
                  onChange={(v) => setFormData({ ...formData, impact_score: v })}
                  color="bg-red-500"
                />
                <ScoreField
                  label="Olasılık Skoru (0-100)"
                  value={formData.likelihood_score}
                  onChange={(v) => setFormData({ ...formData, likelihood_score: v })}
                  color="bg-amber-500"
                />
                <ScoreField
                  label="Kontrol Etkinliği (0-1)"
                  value={formData.control_effectiveness}
                  onChange={(v) => setFormData({ ...formData, control_effectiveness: v })}
                  color="bg-emerald-500"
                  max={1}
                  step={0.01}
                  pct={100}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-canvas rounded-lg border border-slate-200">
                <div>
                  <div className="text-xs text-slate-600 mb-1">Doğal Risk Skoru</div>
                  <div className="text-2xl font-bold text-red-600">{inherentScore.toFixed(1)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-600 mb-1">Artık Risk Skoru</div>
                  <div className="text-2xl font-bold text-emerald-600">{residualScore.toFixed(1)}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Etiketler</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Etiket ekle ve Enter'a bas"
                  />
                  <button type="button" onClick={handleAddTag} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">
                    Ekle
                  </button>
                </div>
                {formData.tags && formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {tag}
                        <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-blue-900">
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={onClose} className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-canvas transition-colors">
                  İptal
                </button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors">
                  {editRisk ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'history' && editRisk && (
            <VersionHistoryTab riskId={editRisk.id} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sekme Butonu ─────────────────────────────────────────────────────────────

function TabButton({
  active, onClick, icon, label,
}: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-colors
        ${active
          ? 'border-blue-500 text-blue-600 bg-blue-50/50'
          : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}
      `}
    >
      {icon}
      {label}
    </button>
  );
}

// ─── Skor Alanı ──────────────────────────────────────────────────────────────

function ScoreField({
  label, value, onChange, color, max = 100, step = 1, pct = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  color: string;
  max?: number;
  step?: number;
  pct?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
      <input
        type="number"
        min="0"
        max={max}
        step={step}
        required
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <div className="mt-2 h-2 bg-slate-200 rounded-full">
        <div className={`h-2 ${color} rounded-full transition-all`} style={{ width: `${(value / max) * pct}%` }} />
      </div>
    </div>
  );
}

// ─── Versiyon Tarihçesi Sekmesi ───────────────────────────────────────────────

function VersionHistoryTab({ riskId }: { riskId: string }) {
  const { data: versions = [], isLoading, error } = useRiskVersions(riskId);
  const rollbackMutation = useRollbackRiskVersion(riskId);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleRollback = (version: RkmRiskVersion) => {
    rollbackMutation.mutate(
      { riskId, snapshot: version.snapshot, versionNumber: version.version_number },
      {
        onSuccess: () => {
          toast.success(`Versiyon ${version.version_number} geri yüklendi. Risk güncellendi.`);
        },
        onError: (err: Error) => {
          toast.error(`Geri yükleme başarısız: ${err.message}`);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Versiyon geçmişi yükleniyor…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 rounded-xl p-4 text-sm text-red-700">
          Tarihçe yüklenemedi: {(error as Error).message}
        </div>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
        <History size={40} strokeWidth={1} />
        <p className="text-sm font-medium">Henüz kayıt değişikliği yok.</p>
        <p className="text-xs text-slate-400">Risk ilk kez güncellendiğinde burada görünecek.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-700">Zaman Makinesi</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Her satır, güncelleme öncesi kaydedilen anlık görüntüyü temsil eder.
          "Bu Versiyona Dön" ile riski eski haline geri alabilirsiniz.
        </p>
      </div>

      {/* Dikey zaman çizelgesi */}
      <div className="relative">
        {/* Dikey çizgi */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" />

        <div className="space-y-0">
          {versions.map((version, idx) => {
            const isExpanded = expandedId === version.id;
            const isFirst = idx === 0;
            const snap = version.snapshot;
            const prevSnap = versions[idx + 1]?.snapshot ?? null;

            return (
              <div key={version.id} className="relative pl-10">
                {/* Zaman çizelgesi noktası */}
                <div
                  className={`
                    absolute left-2.5 top-4 w-3 h-3 rounded-full border-2 border-white ring-2
                    ${isFirst ? 'ring-blue-400 bg-blue-500' : 'ring-slate-300 bg-slate-400'}
                  `}
                />

                <div
                  className={`
                    mb-3 rounded-xl border transition-all duration-200
                    ${isFirst ? 'border-blue-200 bg-blue-50/40' : 'border-slate-200 bg-surface'}
                  `}
                >
                  {/* Versiyon başlık satırı */}
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                    onClick={() => setExpandedId(isExpanded ? null : version.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`
                          w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black
                          ${isFirst ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}
                        `}
                      >
                        v{version.version_number}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">
                          {version.changed_by}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock size={10} />
                          {formatDate(version.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Rollback butonu */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRollback(version); }}
                        disabled={rollbackMutation.isPending}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg transition-colors disabled:opacity-50"
                        title={`Versiyon ${version.version_number}'e geri dön`}
                      >
                        <RotateCcw size={11} />
                        Bu Versiyona Dön
                      </button>

                      <ChevronRight
                        size={14}
                        className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      />
                    </div>
                  </div>

                  {/* Genişletilmiş diff görünümü */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-slate-100 pt-3">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                        Bu Versiyondaki Değerler
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {buildDiffFields(snap, prevSnap).map((field) => (
                          <SnapshotField
                            key={field.key}
                            label={field.label}
                            value={field.value}
                            prevValue={field.prevValue}
                            changed={field.changed}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Snapshot Field ───────────────────────────────────────────────────────────

interface DiffField {
  key: string;
  label: string;
  value: string;
  prevValue: string;
  changed: boolean;
}

function buildDiffFields(
  snap: RkmRiskVersion['snapshot'],
  prevSnap: RkmRiskVersion['snapshot'] | null,
): DiffField[] {
  const fields: { key: keyof typeof snap; label: string }[] = [
    { key: 'risk_title', label: 'Başlık' },
    { key: 'risk_status', label: 'Durum' },
    { key: 'risk_category', label: 'Kategori' },
    { key: 'risk_owner', label: 'Sorumlu' },
    { key: 'inherent_impact', label: 'D.Etki' },
    { key: 'inherent_likelihood', label: 'D.Olasılık' },
    { key: 'inherent_rating', label: 'D.Seviye' },
    { key: 'residual_impact', label: 'A.Etki' },
    { key: 'residual_likelihood', label: 'A.Olasılık' },
    { key: 'residual_rating', label: 'A.Seviye' },
    { key: 'control_design_rating', label: 'K.Tasarım' },
    { key: 'control_operating_rating', label: 'K.İşletim' },
  ];

  return fields.map((f) => {
    const val = snap[f.key];
    const prev = prevSnap?.[f.key];
    return {
      key: String(f.key),
      label: f.label,
      value: val !== undefined && val !== null ? String(val) : '—',
      prevValue: prev !== undefined && prev !== null ? String(prev) : '—',
      changed: prevSnap !== null && String(val) !== String(prev),
    };
  });
}

function SnapshotField({
  label, value, prevValue, changed,
}: { label: string; value: string; prevValue: string; changed: boolean }) {
  return (
    <div
      className={`
        rounded-lg px-3 py-2 border text-xs
        ${changed ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}
      `}
    >
      <div className="text-slate-500 font-medium mb-0.5">{label}</div>
      <div className={`font-semibold ${changed ? 'text-amber-700' : 'text-slate-700'}`}>
        {value}
      </div>
      {changed && prevValue !== '—' && (
        <div className="text-slate-400 line-through text-[10px] mt-0.5">{prevValue}</div>
      )}
    </div>
  );
}

// ─── Yardımcılar ──────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffH = Math.floor(diffMs / 3_600_000);
    const diffD = Math.floor(diffMs / 86_400_000);
    if (diffH < 1) return 'Az önce';
    if (diffH < 24) return `${diffH} saat önce`;
    if (diffD < 7) return `${diffD} gün önce`;
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}
