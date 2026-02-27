import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio, Plus, Edit2, Trash2, X, Save,
  CheckCircle, XCircle, Loader2, AlertTriangle
} from 'lucide-react';
import clsx from 'clsx';
import {
  useKRIConfigs,
  useCreateKRI,
  useUpdateKRI,
  useDeleteKRI,
} from '@/entities/risk/velocity-api';
import type { KRIConfig, CreateKRIInput } from '@/entities/risk/velocity-types';

const SOURCE_COLORS: Record<string, string> = {
  SAP_HR: 'bg-blue-100 text-blue-700 border-blue-200',
  SIEM: 'bg-red-100 text-red-700 border-red-200',
  CORE_BANKING: 'bg-amber-100 text-amber-700 border-amber-200',
  COMPLIANCE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  AML: 'bg-rose-100 text-rose-700 border-rose-200',
};

const SOURCES = ['SAP_HR', 'SIEM', 'CORE_BANKING', 'COMPLIANCE', 'AML', 'ERP', 'CRM'];

function getSourceColor(source: string) {
  return SOURCE_COLORS[source] ?? 'bg-slate-100 text-slate-700 border-slate-200';
}

export function DataSignalsPanel() {
  const { data: configs = [], isLoading } = useKRIConfigs();
  const createKRI = useCreateKRI();
  const updateKRI = useUpdateKRI();
  const deleteKRI = useDeleteKRI();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateKRIInput>({
    source_system: 'SIEM',
    kri_name: '',
    threshold_value: 0,
    impact_axis: 'LIKELIHOOD',
    impact_weight: 1.0,
    description: '',
  });

  const handleEdit = (config: KRIConfig) => {
    setEditingId(config.id);
    setForm({
      source_system: config.source_system,
      kri_name: config.kri_name,
      threshold_value: config.threshold_value,
      impact_axis: config.impact_axis,
      impact_weight: config.impact_weight,
      description: config.description,
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.kri_name.trim()) return;
    if (editingId) {
      await updateKRI.mutateAsync({ id: editingId, ...form });
    } else {
      await createKRI.mutateAsync(form);
    }
    setShowForm(false);
    setEditingId(null);
    setForm({
      source_system: 'SIEM',
      kri_name: '',
      threshold_value: 0,
      impact_axis: 'LIKELIHOOD',
      impact_weight: 1.0,
      description: '',
    });
  };

  const handleToggleActive = async (config: KRIConfig) => {
    await updateKRI.mutateAsync({ id: config.id, is_active: !config.is_active });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bu KRI yapilandirmasi silinecek. Emin misiniz?')) {
      await deleteKRI.mutateAsync(id);
    }
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  const activeCount = configs.filter(c => c.is_active).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Radio size={20} className="text-blue-600" />
            Entegrasyon & Veri Sinyalleri
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Dis kaynaklardan gelen KRI (Key Risk Indicator) sinyallerini yonetin.
            {activeCount > 0 && (
              <span className="ml-2 text-xs font-bold text-green-600">{activeCount} aktif sinyal</span>
            )}
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm"
        >
          <Plus size={16} />
          Yeni Sinyal
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wide">Durum</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wide">Kaynak</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wide">Gosterge (KRI)</th>
                <th className="px-5 py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wide">Esik Degeri</th>
                <th className="px-5 py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wide">Etki Ekseni</th>
                <th className="px-5 py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wide">Etki Gucu</th>
                <th className="px-5 py-3 text-right text-xs font-bold text-slate-700 uppercase tracking-wide">Islemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {configs.map(config => (
                <tr key={config.id} className={clsx(
                  'hover:bg-slate-50 transition-colors group',
                  !config.is_active && 'opacity-50'
                )}>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleToggleActive(config)}
                      className="transition-colors"
                      title={config.is_active ? 'Devre disi birak' : 'Aktif et'}
                    >
                      {config.is_active ? (
                        <CheckCircle size={18} className="text-green-500" />
                      ) : (
                        <XCircle size={18} className="text-slate-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <span className={clsx('inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border', getSourceColor(config.source_system))}>
                      {config.source_system}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-sm font-semibold text-slate-800">{config.kri_name}</p>
                    {config.description && (
                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{config.description}</p>
                    )}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className="text-sm font-bold text-slate-800 tabular-nums">
                      {config.threshold_value}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={clsx(
                      'inline-flex px-2 py-1 rounded text-[10px] font-black uppercase',
                      config.impact_axis === 'IMPACT'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-cyan-100 text-cyan-700'
                    )}>
                      {config.impact_axis === 'IMPACT' ? 'ETKI' : 'OLASILIK'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={clsx(
                      'text-sm font-black tabular-nums',
                      config.impact_weight >= 2 ? 'text-red-600' : config.impact_weight >= 1 ? 'text-amber-600' : 'text-slate-600'
                    )}>
                      +{config.impact_weight}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(config)}
                        className="p-1.5 hover:bg-blue-50 rounded text-blue-600 transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(config.id)}
                        className="p-1.5 hover:bg-red-50 rounded text-red-600 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {configs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertTriangle className="text-slate-300 mb-3" size={40} />
            <p className="text-sm font-semibold text-slate-600">Henuz sinyal yapilandirmasi yok</p>
            <p className="text-xs text-slate-400 mt-1">Yeni bir KRI ekleyerek baslayin</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Radio size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {editingId ? 'Sinyal Duzenle' : 'Yeni KRI Sinyali'}
                    </h2>
                    <p className="text-xs text-slate-500">Dis kaynak tetikleyici yapilandirmasi</p>
                  </div>
                </div>
                <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-lg">
                  <X size={18} className="text-slate-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Kaynak Sistem</label>
                    <select
                      value={form.source_system}
                      onChange={e => setForm(f => ({ ...f, source_system: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {SOURCES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Etki Ekseni</label>
                    <select
                      value={form.impact_axis}
                      onChange={e => setForm(f => ({ ...f, impact_axis: e.target.value as 'LIKELIHOOD' | 'IMPACT' }))}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="LIKELIHOOD">Olasilik</option>
                      <option value="IMPACT">Etki</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Gosterge Adi (KRI)</label>
                  <input
                    type="text"
                    value={form.kri_name}
                    onChange={e => setForm(f => ({ ...f, kri_name: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ornek: Personel Devir Orani"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Tetikleyici Esik</label>
                    <input
                      type="number"
                      step={0.1}
                      value={form.threshold_value}
                      onChange={e => setForm(f => ({ ...f, threshold_value: +e.target.value }))}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-center font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Etki Gucu (puan)</label>
                    <input
                      type="number"
                      step={0.5}
                      min={0}
                      max={5}
                      value={form.impact_weight}
                      onChange={e => setForm(f => ({ ...f, impact_weight: +e.target.value }))}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-center font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Aciklama</label>
                  <textarea
                    value={form.description ?? ''}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Bu sinyal tetiklendiginde ne olur..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleClose}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-lg font-semibold text-sm hover:bg-slate-200 transition-colors"
                >
                  Iptal
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!form.kri_name.trim() || createKRI.isPending || updateKRI.isPending}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {(createKRI.isPending || updateKRI.isPending) && <Loader2 size={14} className="animate-spin" />}
                  <Save size={14} />
                  {editingId ? 'Guncelle' : 'Kaydet'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
