import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Edit3, GripVertical, ToggleLeft, ToggleRight,
  X, CheckCircle2, Type, Hash, Calendar, List, ChevronDown, Settings2
} from 'lucide-react';
import { PageHeader } from '@/shared/ui';
import clsx from 'clsx';

type FieldType = 'TEXT' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'DROPDOWN';
type EntityModule = 'RISK' | 'FINDING' | 'ACTION' | 'ENTITY' | 'WORKPAPER';

interface CustomField {
  id: string;
  module: EntityModule;
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  defaultValue?: string;
  order: number;
  active: boolean;
}

const FIELD_TYPE_CONFIG = {
  TEXT: { icon: Type, label: 'Metin', color: 'bg-blue-100 text-blue-700' },
  NUMBER: { icon: Hash, label: 'Sayi', color: 'bg-green-100 text-green-700' },
  DATE: { icon: Calendar, label: 'Tarih', color: 'bg-orange-100 text-orange-700' },
  BOOLEAN: { icon: ToggleLeft, label: 'Evet/Hayir', color: 'bg-teal-100 text-teal-700' },
  DROPDOWN: { icon: List, label: 'Liste', color: 'bg-slate-100 text-slate-700' },
} as const;

const MODULE_CONFIG = {
  RISK: { label: 'Risk', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  FINDING: { label: 'Bulgu', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  ACTION: { label: 'Aksiyon', color: 'bg-green-100 text-green-700 border-green-200' },
  ENTITY: { label: 'Varlik', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  WORKPAPER: { label: 'Is Kagidi', color: 'bg-slate-100 text-slate-600 border-slate-200' },
} as const;

const DEMO_FIELDS: CustomField[] = [
  { id: '1', module: 'RISK', name: 'regulatory_ref', label: 'Regulasyon Referansi', type: 'TEXT', required: false, order: 1, active: true },
  { id: '2', module: 'RISK', name: 'expected_loss', label: 'Beklenen Kayip (TL)', type: 'NUMBER', required: false, order: 2, active: true, defaultValue: '0' },
  { id: '3', module: 'FINDING', name: 'remediation_deadline', label: 'Giderim Tarihi', type: 'DATE', required: true, order: 1, active: true },
  { id: '4', module: 'FINDING', name: 'is_systemic', label: 'Sistemik Bulgu mu?', type: 'BOOLEAN', required: false, order: 2, active: true, defaultValue: 'false' },
  { id: '5', module: 'ACTION', name: 'action_category', label: 'Aksiyon Kategorisi', type: 'DROPDOWN', required: true, order: 1, active: true, options: ['Surec Iyilestirme', 'Sistem Degisikligi', 'Egitim', 'Politika Guncelleme', 'Diger'] },
  { id: '6', module: 'RISK', name: 'risk_appetite_flag', label: 'Risk Istahi Durumu', type: 'DROPDOWN', required: false, order: 3, active: false, options: ['Sinir Ici', 'Sinira Yakin', 'Sinir Disi'] },
];

export default function CustomFieldsPage() {
  const [fields, setFields] = useState<CustomField[]>(DEMO_FIELDS);
  const [activeModule, setActiveModule] = useState<EntityModule>('RISK');
  const [showForm, setShowForm] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [form, setForm] = useState({
    name: '', label: '', type: 'TEXT' as FieldType,
    required: false, options: '', defaultValue: '',
  });

  const moduleFields = fields.filter(f => f.module === activeModule).sort((a, b) => a.order - b.order);

  const handleSave = () => {
    if (!form.name.trim() || !form.label.trim()) return;

    if (editingField) {
      setFields(prev => prev.map(f => f.id === editingField.id ? {
        ...f, name: form.name, label: form.label, type: form.type,
        required: form.required, defaultValue: form.defaultValue || undefined,
        options: form.type === 'DROPDOWN' ? form.options.split(',').map(o => o.trim()).filter(Boolean) : undefined,
      } : f));
    } else {
      const newField: CustomField = {
        id: Date.now().toString(),
        module: activeModule,
        name: form.name,
        label: form.label,
        type: form.type,
        required: form.required,
        defaultValue: form.defaultValue || undefined,
        options: form.type === 'DROPDOWN' ? form.options.split(',').map(o => o.trim()).filter(Boolean) : undefined,
        order: moduleFields.length + 1,
        active: true,
      };
      setFields(prev => [...prev, newField]);
    }

    setShowForm(false);
    setEditingField(null);
    setForm({ name: '', label: '', type: 'TEXT', required: false, options: '', defaultValue: '' });
  };

  const handleEdit = (field: CustomField) => {
    setEditingField(field);
    setForm({
      name: field.name,
      label: field.label,
      type: field.type,
      required: field.required,
      options: field.options?.join(', ') || '',
      defaultValue: field.defaultValue || '',
    });
    setShowForm(true);
  };

  const toggleActive = (id: string) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, active: !f.active } : f));
  };

  const handleDelete = (id: string) => {
    setFields(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <PageHeader
        title="Ozel Alan Yoneticisi"
        subtitle="Modul bazli dinamik alan tanimlari"
        icon={Settings2}
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex bg-white border border-slate-200 p-0.5 rounded-lg shadow-sm">
            {(Object.keys(MODULE_CONFIG) as EntityModule[]).map(m => (
              <button
                key={m}
                onClick={() => setActiveModule(m)}
                className={clsx(
                  'px-4 py-2 text-xs font-bold rounded-md transition-all',
                  activeModule === m ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                {MODULE_CONFIG[m].label}
              </button>
            ))}
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingField(null); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
          >
            <Plus size={16} />
            Yeni Alan
          </button>
        </div>

        {moduleFields.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-slate-200">
            <Settings2 className="mx-auto text-slate-300 mb-3" size={48} />
            <p className="text-sm font-semibold text-slate-600">Bu modul icin ozel alan tanimlanmamis</p>
            <p className="text-xs text-slate-500 mt-1">Yeni alan eklemek icin butonu kullanin</p>
          </div>
        ) : (
          <div className="space-y-2">
            {moduleFields.map((field, idx) => {
              const typeConfig = FIELD_TYPE_CONFIG[field.type];
              const TypeIcon = typeConfig.icon;

              return (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={clsx(
                    'bg-white rounded-lg border border-slate-200 p-4 flex items-center gap-4 group',
                    !field.active && 'opacity-50'
                  )}
                >
                  <GripVertical size={16} className="text-slate-300 cursor-grab" />

                  <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', typeConfig.color)}>
                    <TypeIcon size={16} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900 text-sm">{field.label}</p>
                      {field.required && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-100 text-red-700 rounded">ZORUNLU</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-slate-400 font-mono">{field.name}</span>
                      <span className={clsx('text-[10px] px-1.5 py-0.5 rounded font-medium', typeConfig.color)}>{typeConfig.label}</span>
                      {field.options && field.options.length > 0 && (
                        <span className="text-[10px] text-slate-400">{field.options.length} secenek</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleActive(field.id)}
                      className="p-1.5 hover:bg-slate-100 rounded text-slate-500"
                    >
                      {field.active ? <ToggleRight size={18} className="text-green-600" /> : <ToggleLeft size={18} />}
                    </button>
                    <button onClick={() => handleEdit(field)} className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600">
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => handleDelete(field.id)} className="p-1.5 hover:bg-red-50 rounded text-slate-500 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-slate-800 px-6 py-4 rounded-t-2xl flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">{editingField ? 'Alan Duzenle' : 'Yeni Alan Ekle'}</h2>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30">
                  <X size={16} className="text-white" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Alan Adi (key)</label>
                    <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-lg text-sm font-mono" placeholder="field_name" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Etiket</label>
                    <input type="text" value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-lg text-sm" placeholder="Gorunen ad" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Alan Tipi</label>
                  <div className="grid grid-cols-5 gap-2">
                    {(Object.keys(FIELD_TYPE_CONFIG) as FieldType[]).map(t => {
                      const cfg = FIELD_TYPE_CONFIG[t];
                      const Icon = cfg.icon;
                      return (
                        <button key={t} onClick={() => setForm(p => ({ ...p, type: t }))}
                          className={clsx('p-3 rounded-lg border-2 text-center transition-all', form.type === t ? 'border-blue-500 bg-blue-50' : 'border-slate-200')}>
                          <Icon size={18} className={clsx('mx-auto mb-1', form.type === t ? 'text-blue-600' : 'text-slate-400')} />
                          <span className="text-[10px] font-bold">{cfg.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {form.type === 'DROPDOWN' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Secenekler (virgul ile ayirin)</label>
                    <input type="text" value={form.options} onChange={e => setForm(p => ({ ...p, options: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-lg text-sm" placeholder="Secenek1, Secenek2, Secenek3" />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Varsayilan Deger</label>
                    <input type="text" value={form.defaultValue} onChange={e => setForm(p => ({ ...p, defaultValue: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-lg text-sm" placeholder="Opsiyonel" />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.required} onChange={e => setForm(p => ({ ...p, required: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded" />
                      <span className="text-sm font-semibold text-slate-700">Zorunlu Alan</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-200 rounded-b-2xl">
                <button onClick={() => setShowForm(false)} className="px-5 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium text-sm">Iptal</button>
                <button onClick={handleSave} disabled={!form.name.trim() || !form.label.trim()}
                  className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm disabled:bg-slate-400">
                  <CheckCircle2 size={14} /> Kaydet
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
