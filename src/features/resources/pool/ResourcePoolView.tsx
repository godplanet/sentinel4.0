import {
  useCreateAuditor,
  useDeleteAuditor,
  useUpdateAuditor,
} from '@/features/talent-os/api/mutations';
import { useTalentPool } from '@/features/talent-os/api/queries';
import type {
  AuditorTitle,
  Specialization,
  TalentProfileWithSkills,
} from '@/features/talent-os/types';
import { AuditorDetailPanel } from '@/widgets/TalentOS/AuditorDetailPanel';
import { ResourcePoolGrid } from '@/widgets/TalentOS/ResourcePoolGrid';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Loader2,
  Monitor,
  Save,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

// ─── Types ───────────────────────────────────────────────────────────────────

type SpecFilter = 'all' | Specialization;

const SPEC_TABS: { key: SpecFilter; label: string }[] = [
  { key: 'all',   label: 'Tümü' },
  { key: 'İdari', label: 'Bankacılık Denetimleri' },
  { key: 'BT',    label: 'Bilgi Sistemleri Denetimleri' },
  { key: 'Mali',  label: 'Mali' },
  { key: 'Uyum',  label: 'Uyum' },
  { key: 'Risk',  label: 'Risk' },
  { key: 'Diğer', label: 'Diğer' },
];

const TR_TITLE_OPTIONS: { label: string; level: number; title: AuditorTitle }[] = [
  { label: 'Başmüfettiş',                 level: 5, title: 'Expert' },
  { label: 'Kıdemli Müfettiş',            level: 4, title: 'Manager' },
  { label: 'Müfettiş',                    level: 3, title: 'Senior' },
  { label: 'Yetkili Müfettiş Yardımcısı', level: 2, title: 'Junior' },
  { label: 'Müfettiş Yardımcısı',         level: 1, title: 'Junior' },
];

const DEPARTMENT_OPTIONS: { value: string; spec: Specialization }[] = [
  { value: 'Bankacılık Denetimleri',       spec: 'İdari' },
  { value: 'Bilgi Sistemleri Denetimleri', spec: 'BT' },
];

function levelToTrTitle(level: number): string {
  return TR_TITLE_OPTIONS.find((t) => t.level === level)?.label ?? 'Müfettiş Yardımcısı';
}

// ─── Add/Edit Modal ───────────────────────────────────────────────────────────

interface AuditorFormData {
  full_name: string;
  tr_title: string;
  department: string;
  tenure_since_year: number;
}

const EMPTY_FORM: AuditorFormData = {
  full_name: '',
  tr_title: 'Müfettiş Yardımcısı',
  department: 'Bankacılık Denetimleri',
  tenure_since_year: new Date().getFullYear(),
};

interface AuditorModalProps {
  mode: 'add' | 'edit';
  initial?: AuditorFormData & { id: string };
  onClose: () => void;
}

function AuditorModal({ mode, initial, onClose }: AuditorModalProps) {
  const [form, setForm] = useState<AuditorFormData>(initial ?? EMPTY_FORM);
  const createAuditor = useCreateAuditor();
  const updateAuditor = useUpdateAuditor();

  const isLoading = createAuditor.isPending || updateAuditor.isPending;

  function set<K extends keyof AuditorFormData>(key: K, val: AuditorFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit() {
    if (!form.full_name.trim()) { toast.error('Ad Soyad zorunlu'); return; }
    const titleMeta = TR_TITLE_OPTIONS.find((t) => t.label === form.tr_title) ?? TR_TITLE_OPTIONS[4];
    const deptMeta  = DEPARTMENT_OPTIONS.find((d) => d.value === form.department) ?? DEPARTMENT_OPTIONS[0];
    const yearsExperience = Math.max(0, new Date().getFullYear() - form.tenure_since_year);
    const payload = {
      full_name:     form.full_name.trim(),
      title:         titleMeta.title,
      current_level: titleMeta.level,
      department:    form.department,
      specialization: deptMeta.spec,
      hourly_rate:   0,
      is_available:  true,
      total_xp:      yearsExperience * 150 * titleMeta.level,
    };
    try {
      if (mode === 'add') {
        await createAuditor.mutateAsync(payload);
        toast.success(`${form.full_name} eklendi`);
      } else {
        await updateAuditor.mutateAsync({ id: initial!.id!, ...payload });
        toast.success('Denetçi güncellendi');
      }
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Hata oluştu');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative z-10 w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            {mode === 'add' ? <UserPlus size={18} className="text-blue-600" /> : <Edit2 size={18} className="text-indigo-600" />}
            <h3 className="text-sm font-bold text-slate-800">
              {mode === 'add' ? 'Yeni Denetçi Ekle' : 'Denetçi Düzenle'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"><X size={16} /></button>
        </div>

        <div className="px-5 py-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Ad Soyad *</label>
            <input
              value={form.full_name}
              onChange={(e) => set('full_name', e.target.value)}
              placeholder="Örn: Ahmet Yılmaz"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Ünvan *</label>
              <select
                value={form.tr_title}
                onChange={(e) => {
                  const t = TR_TITLE_OPTIONS.find(o => o.label === e.target.value);
                  const MIN_YEARS: Record<number, number> = { 5: 8, 4: 6, 3: 3, 2: 2, 1: 1 };
                  const minYr = t ? new Date().getFullYear() - (MIN_YEARS[t.level] ?? 1) : form.tenure_since_year;
                  setForm(prev => ({ ...prev, tr_title: e.target.value, tenure_since_year: minYr }));
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TR_TITLE_OPTIONS.map((t) => <option key={t.label} value={t.label}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Kıdem Başlangıcı</label>
              <input
                type="number"
                min={1980}
                max={new Date().getFullYear()}
                value={form.tenure_since_year}
                onChange={(e) => set('tenure_since_year', Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Başkan Yardımcılığı *</label>
            <select
              value={form.department}
              onChange={(e) => set('department', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DEPARTMENT_OPTIONS.map((d) => <option key={d.value} value={d.value}>{d.value}</option>)}
            </select>
          </div>
        </div>

        <div className="px-5 pb-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            İptal
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {mode === 'add' ? 'Ekle' : 'Kaydet'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Auditor Row with Edit/Delete ─────────────────────────────────────────────

interface AuditorRowActionsProps {
  profile: TalentProfileWithSkills;
  onEdit: () => void;
}

function AuditorRowActions({ profile, onEdit }: AuditorRowActionsProps) {
  const deleteAuditor = useDeleteAuditor();

  function handleDelete() {
    if (!confirm(`${profile.full_name} silinsin mi?`)) return;
    deleteAuditor.mutate(profile.id, {
      onSuccess: () => toast.success(`${profile.full_name} silindi`),
      onError: (e) => toast.error(e instanceof Error ? e.message : 'Silinemedi'),
    });
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onEdit}
        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-all"
        title="Düzenle"
      >
        <Edit2 size={13} />
      </button>
      <button
        onClick={handleDelete}
        disabled={deleteAuditor.isPending}
        className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-all disabled:opacity-50"
        title="Sil"
      >
        {deleteAuditor.isPending ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
      </button>
    </div>
  );
}

// ─── Specialization Badge ─────────────────────────────────────────────────────

function SpecBadge({ spec }: { spec: Specialization }) {
  const isBT = spec === 'BT';
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border',
        isBT
          ? 'bg-blue-50 text-blue-700 border-blue-200'
          : 'bg-slate-100 text-slate-600 border-slate-200'
      )}
    >
      {isBT && <Monitor size={9} />}
      {spec}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface ResourcePoolViewProps {
  openAddModal?: boolean;
  onAddModalClose?: () => void;
}

export function ResourcePoolView({ openAddModal, onAddModalClose }: ResourcePoolViewProps) {
  const { data: profiles = [], isLoading } = useTalentPool();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [specFilter, setSpecFilter] = useState<SpecFilter>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editProfile, setEditProfile] = useState<TalentProfileWithSkills | null>(null);

  // Controlled from parent (ResourceManagementPage "Denetçi Ekle" button)
  useEffect(() => {
    if (openAddModal) setShowAddModal(true);
  }, [openAddModal]);

  function handleAddClose() {
    setShowAddModal(false);
    onAddModalClose?.();
  }

  const filtered = specFilter === 'all'
    ? profiles
    : profiles.filter((p) => p.specialization === specFilter);

  const selectedProfile = filtered.find((p) => p.id === selectedId) || null;

  // Count by specialization
  const counts = profiles.reduce<Record<string, number>>((acc, p) => {
    acc[p.specialization] = (acc[p.specialization] ?? 0) + 1;
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3">
        <h2 className="text-xl font-bold text-primary">Kaynak Havuzu</h2>
        <p className="text-sm text-slate-500 mt-1">
          Denetçilerin yetkinlik, kapasite ve yorgunluk durumlarına göre detaylı listesi.
        </p>
      </div>

      {/* Specialization filter tabs */}
      <div className="flex items-center gap-1.5 mb-4 flex-wrap">
        {SPEC_TABS.map((tab) => {
          const count = tab.key === 'all' ? profiles.length : (counts[tab.key] ?? 0);
          if (count === 0 && tab.key !== 'all') return null;
          return (
            <button
              key={tab.key}
              onClick={() => { setSpecFilter(tab.key); setSelectedId(null); }}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                specFilter === tab.key
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
              )}
            >
              {tab.key === 'BT' && <Monitor size={11} />}
              {tab.label}
              <span className={clsx(
                'px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                specFilter === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              )}>
                {count}
              </span>
            </button>
          );
        })}

        {/* Quick stats for BT */}
        {specFilter === 'BT' && (
          <div className="ml-auto flex items-center gap-1.5 text-[11px] text-blue-600 font-medium bg-blue-50 border border-blue-100 rounded-full px-3 py-1.5">
            <CheckCircle2 size={12} />
            {filtered.filter(p => p.is_available).length} müsait / {filtered.length} BT denetçi
          </div>
        )}
      </div>

      {/* Editable list view (compact table) + detail panel */}
      <div className="flex gap-4">
        <div className={clsx('flex-1 min-w-0', selectedProfile && 'hidden xl:block max-w-[60%]')}>
          {/* Compact edit-enabled table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mb-4">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="px-3 py-2.5">Denetçi</th>
                  <th className="px-3 py-2.5">Uzmanlık</th>
                  <th className="px-3 py-2.5">Ünvan</th>
                  <th className="px-3 py-2.5">Departman</th>
                  <th className="px-3 py-2.5 text-center">Durum</th>
                  <th className="px-3 py-2.5 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400 text-sm">
                      Bu kategoride denetçi yok
                    </td>
                  </tr>
                )}
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className={clsx(
                      'hover:bg-blue-50/40 transition-colors cursor-pointer',
                      selectedId === p.id && 'bg-blue-50'
                    )}
                    onClick={() => setSelectedId(selectedId === p.id ? null : p.id)}
                  >
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                          {(p.full_name || '?').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-semibold text-slate-800">{p.full_name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <SpecBadge spec={p.specialization} />
                    </td>
                    <td className="px-3 py-2.5 text-xs text-slate-600">{p.title}</td>
                    <td className="px-3 py-2.5 text-xs text-slate-500 max-w-[130px] truncate">{p.department}</td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={clsx(
                        'inline-block w-2 h-2 rounded-full',
                        p.is_available ? 'bg-emerald-500' : 'bg-slate-300'
                      )} title={p.is_available ? 'Müsait' : 'Meşgul'} />
                    </td>
                    <td className="px-3 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <AuditorRowActions
                        profile={p}
                        onEdit={() => setEditProfile(p)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Grid view below table */}
          <ResourcePoolGrid
            profiles={filtered}
            selectedId={selectedId}
            onSelect={(id) => setSelectedId(selectedId === id ? null : id)}
          />
        </div>

        <AnimatePresence>
          {selectedProfile && (
            <div className="w-full xl:w-[450px] flex-shrink-0">
              <AuditorDetailPanel
                profile={selectedProfile}
                onClose={() => setSelectedId(null)}
              />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AuditorModal mode="add" onClose={handleAddClose} />
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editProfile && (
          <AuditorModal
            mode="edit"
            initial={{
              id: editProfile.id,
              full_name: editProfile.full_name,
              tr_title: levelToTrTitle(editProfile.current_level),
              department: DEPARTMENT_OPTIONS.some(d => d.value === editProfile.department)
                ? editProfile.department
                : 'Bankacılık Denetimleri',
              tenure_since_year: (() => {
                const MIN_YEARS: Record<number, number> = { 5: 8, 4: 6, 3: 3, 2: 2, 1: 1 };
                return new Date().getFullYear() - (MIN_YEARS[editProfile.current_level] ?? 1);
              })(),
            }}
            onClose={() => setEditProfile(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
