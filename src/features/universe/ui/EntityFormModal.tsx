import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, X, Loader2, Calendar, AlertTriangle } from 'lucide-react';
import { useCreateEntity, useUpdateEntity, useAuditEntities } from '@/entities/universe';
import type { AuditEntity, EntityType, AuditFrequency } from '@/entities/universe/model/types';
import { calculateNextAuditDue } from '../lib/audit-health';

const ENTITY_TYPES: { value: EntityType; label: string }[] = [
  { value: 'HEADQUARTERS', label: 'Genel Müdürlük' },
  { value: 'GROUP', label: 'Bölge / Grup' },
  { value: 'DEPARTMENT', label: 'Departman' },
  { value: 'BRANCH', label: 'Şube' },
  { value: 'UNIT', label: 'Birim' },
  { value: 'PROCESS', label: 'Süreç' },
  { value: 'IT_ASSET', label: 'BT Varlığı' },
  { value: 'VENDOR', label: 'Tedarikçi' },
  { value: 'SUBSIDIARY', label: 'İştirak' },
];

interface EntityFormModalProps {
  entity?: AuditEntity | null;
  onClose: () => void;
}

export function EntityFormModal({ entity, onClose }: EntityFormModalProps) {
  const { data: allEntities = [] } = useAuditEntities();
  const createEntity = useCreateEntity();
  const updateEntity = useUpdateEntity();

  const [name, setName] = useState(entity?.name ?? '');
  const [type, setType] = useState<EntityType>(entity?.type ?? 'BRANCH');
  const [parentId, setParentId] = useState<string>(entity?.parent_id ?? '');
  const [riskScore, setRiskScore] = useState(entity?.risk_score ?? 50);
  const [status, setStatus] = useState(entity?.status ?? 'Active');

  // Type-specific metadata
  const [metadata, setMetadata] = useState<Record<string, any>>(entity?.metadata ?? {});

  // Audit cycle fields
  const [auditFrequency, setAuditFrequency] = useState<string>(entity?.audit_frequency ?? '');
  const [lastAuditDate, setLastAuditDate] = useState<string>(entity?.last_audit_date ?? '');

  // Risk components
  const [riskOperational, setRiskOperational] = useState<number>(entity?.risk_operational ?? 0);
  const [riskIT, setRiskIT] = useState<number>(entity?.risk_it ?? 0);
  const [riskCompliance, setRiskCompliance] = useState<number>(entity?.risk_compliance ?? 0);
  const [riskFinancial, setRiskFinancial] = useState<number>(entity?.risk_financial ?? 0);

  const isEdit = !!entity;
  const isPending = createEntity.isPending || updateEntity.isPending;

  const parentOptions = allEntities.filter(e => e.id !== entity?.id);

  const generatePath = () => {
    const slug = name.toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 30);
    if (parentId) {
      const parent = allEntities.find(e => e.id === parentId);
      return parent ? `${parent.path}.${slug}` : slug;
    }
    return slug;
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;

    const nextAuditDue = calculateNextAuditDue(lastAuditDate || null, auditFrequency || null);

    const payload = {
      name: name.trim(),
      type,
      parent_id: parentId || null,
      risk_score: riskScore,
      status,
      metadata,
      audit_frequency: auditFrequency || null,
      last_audit_date: lastAuditDate || null,
      next_audit_due: nextAuditDue,
      risk_operational: riskOperational || null,
      risk_it: riskIT || null,
      risk_compliance: riskCompliance || null,
      risk_financial: riskFinancial || null,
    };

    if (isEdit) {
      await updateEntity.mutateAsync({
        id: entity.id,
        ...payload,
      });
    } else {
      await createEntity.mutateAsync({
        ...payload,
        path: generatePath(),
        velocity_multiplier: 1.0,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Building2 size={18} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isEdit ? 'Varlık Düzenle' : 'Yeni Varlık Ekle'}
              </h2>
              <p className="text-xs text-slate-500">Denetim evrenine varlık ekleyin</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* BODY - SCROLLABLE */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-slate-50/30">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Varlık Adı</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="örn: Beşiktaş Şubesi"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Tip</label>
            <select
              value={type}
              onChange={e => setType(e.target.value as EntityType)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {ENTITY_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Üst Varlık (Hiyerarşi)</label>
            <select
              value={parentId}
              onChange={e => setParentId(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Kök Varlık (Üst Yok)</option>
              {parentOptions.map(e => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.type})
                </option>
              ))}
            </select>
          </div>

          {/* TYPE-SPECIFIC FIELDS */}
          {type === 'BRANCH' && (
            <div className="border border-blue-200 bg-blue-50 rounded-lg p-3 space-y-3">
              <div className="text-xs font-bold text-blue-700 mb-2">Şube Bilgileri</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-700 mb-1">Personel Devir Oranı (%)</label>
                  <input
                    type="number"
                    value={metadata.turnover_rate ?? ''}
                    onChange={e => setMetadata({ ...metadata, turnover_rate: +e.target.value })}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                    placeholder="örn: 25"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-700 mb-1">Aylık İşlem Hacmi (TL)</label>
                  <input
                    type="number"
                    value={metadata.transaction_volume ?? ''}
                    onChange={e => setMetadata({ ...metadata, transaction_volume: +e.target.value })}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                    placeholder="15000000"
                  />
                </div>
              </div>
            </div>
          )}

          {type === 'IT_ASSET' && (
            <div className="border border-purple-200 bg-purple-50 rounded-lg p-3 space-y-3">
              <div className="text-xs font-bold text-purple-700 mb-2">BT Varlığı Bilgileri</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-700 mb-1">Kritiklik Seviyesi</label>
                  <select
                    value={metadata.criticality_level ?? 'MEDIUM'}
                    onChange={e => setMetadata({ ...metadata, criticality_level: e.target.value })}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                  >
                    <option value="LOW">Düşük</option>
                    <option value="MEDIUM">Orta</option>
                    <option value="HIGH">Yüksek</option>
                    <option value="CRITICAL">Kritik</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-700 mb-1">Son Yama Tarihi</label>
                  <input
                    type="date"
                    value={metadata.last_patch_date ?? ''}
                    onChange={e => setMetadata({ ...metadata, last_patch_date: e.target.value })}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-700 mb-1">CPE/CMDB ID</label>
                <input
                  type="text"
                  value={metadata.cpe_id ?? ''}
                  onChange={e => setMetadata({ ...metadata, cpe_id: e.target.value })}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                  placeholder="örn: MB-PROD-001"
                />
              </div>
            </div>
          )}

          {type === 'VENDOR' && (
            <div className="border border-orange-200 bg-orange-50 rounded-lg p-3 space-y-3">
              <div className="text-xs font-bold text-orange-700 mb-2">Tedarikçi Bilgileri</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-700 mb-1">Sözleşme Durumu</label>
                  <select
                    value={metadata.contract_status ?? 'ACTIVE'}
                    onChange={e => setMetadata({ ...metadata, contract_status: e.target.value })}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                  >
                    <option value="ACTIVE">Aktif</option>
                    <option value="EXPIRED">Süresi Dolmuş</option>
                    <option value="PENDING">Beklemede</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-700 mb-1">Risk Notu</label>
                  <select
                    value={metadata.risk_rating ?? 'MEDIUM'}
                    onChange={e => setMetadata({ ...metadata, risk_rating: e.target.value })}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                  >
                    <option value="LOW">Düşük</option>
                    <option value="MEDIUM">Orta</option>
                    <option value="HIGH">Yüksek</option>
                    <option value="CRITICAL">Kritik</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-700 mb-1">Sözleşme Bitiş Tarihi</label>
                  <input
                    type="date"
                    value={metadata.contract_expiry ?? ''}
                    onChange={e => setMetadata({ ...metadata, contract_expiry: e.target.value })}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-700 mb-1">Yıllık Harcama (TL)</label>
                  <input
                    type="number"
                    value={metadata.annual_spend ?? ''}
                    onChange={e => setMetadata({ ...metadata, annual_spend: +e.target.value })}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                    placeholder="850000"
                  />
                </div>
              </div>
            </div>
          )}

          {type === 'SUBSIDIARY' && (
            <div className="border border-indigo-200 bg-indigo-50 rounded-lg p-3 space-y-3">
              <div className="text-xs font-bold text-indigo-700 mb-2">İştirak Bilgileri</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-700 mb-1">Sahiplik Oranı (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={metadata.ownership_percentage ?? ''}
                    onChange={e => setMetadata({ ...metadata, ownership_percentage: +e.target.value })}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                    placeholder="51"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-700 mb-1">Ülke</label>
                  <input
                    type="text"
                    value={metadata.country ?? ''}
                    onChange={e => setMetadata({ ...metadata, country: e.target.value })}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                    placeholder="Türkiye"
                  />
                </div>
              </div>
            </div>
          )}

          {/* AUDIT CYCLE SECTION */}
          <div className="border border-emerald-200 bg-emerald-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 mb-2">
              <Calendar size={14} />
              Denetim Döngüsü (BDDK/GIAS)
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-700 mb-1">Denetim Sıklığı</label>
                <select
                  value={auditFrequency}
                  onChange={e => setAuditFrequency(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                >
                  <option value="">Seçiniz</option>
                  <option value="Yıllık">Yıllık</option>
                  <option value="2 Yılda Bir">2 Yılda Bir</option>
                  <option value="3 Yılda Bir">3 Yılda Bir</option>
                  <option value="Sürekli">Sürekli İzleme</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-700 mb-1">Son Denetim Tarihi</label>
                <input
                  type="date"
                  value={lastAuditDate}
                  onChange={e => setLastAuditDate(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                />
              </div>
            </div>
            {lastAuditDate && auditFrequency && (
              <div className="text-xs text-emerald-700 bg-emerald-100 rounded px-2 py-1.5 mt-2">
                📅 Sonraki Denetim: <span className="font-bold">
                  {new Date(calculateNextAuditDue(lastAuditDate, auditFrequency) || '').toLocaleDateString('tr-TR')}
                </span>
              </div>
            )}
          </div>

          {/* RISK COMPONENTS SECTION */}
          <div className="border border-amber-200 bg-amber-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 mb-2">
              <AlertTriangle size={14} />
              Risk Bileşenleri (0-100)
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-700 mb-1">⚙️ Operasyonel Risk</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={riskOperational}
                  onChange={e => setRiskOperational(Math.min(100, Math.max(0, +e.target.value)))}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm text-center font-semibold"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-700 mb-1">💻 BT Riski</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={riskIT}
                  onChange={e => setRiskIT(Math.min(100, Math.max(0, +e.target.value)))}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm text-center font-semibold"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-700 mb-1">⚖️ Uyum Riski</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={riskCompliance}
                  onChange={e => setRiskCompliance(Math.min(100, Math.max(0, +e.target.value)))}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm text-center font-semibold"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-700 mb-1">💰 Finansal Risk</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={riskFinancial}
                  onChange={e => setRiskFinancial(Math.min(100, Math.max(0, +e.target.value)))}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm text-center font-semibold"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="text-xs text-amber-700 bg-amber-100 rounded px-2 py-1.5 mt-2">
              🎯 Maksimum Risk: <span className="font-bold">
                {Math.max(riskOperational, riskIT, riskCompliance, riskFinancial)}
              </span> (Ana risk skoru olarak kullanılır)
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pb-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Risk Skoru (0-100)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={riskScore}
                onChange={e => setRiskScore(Math.min(100, Math.max(0, +e.target.value)))}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-center font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Durum</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Active">Aktif</option>
                <option value="Inactive">Pasif</option>
                <option value="Archived">Arşivlendi</option>
              </select>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex gap-3 p-6 border-t border-slate-100 shrink-0 bg-white z-10">
          <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-lg font-semibold text-sm hover:bg-slate-200 transition-colors">
            İptal
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || isPending}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? 'Güncelle' : 'Ekle'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}