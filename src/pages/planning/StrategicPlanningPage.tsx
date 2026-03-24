/**
 * SENTINEL GRC v4.0 — Bimodal Stratejik Planlama
 * ================================================
 * Denetim Evreni + Risk Isı Haritası → Kapasite bazlı plan
 *
 * Mode 1 (Zorunlu Güvence): rotation_type=MANDATORY varlıklar
 * Mode 2 (Agile Rotasyon):  rotation_type=ROTATION varlıklar
 */

import { fetchActivePlan, fetchEngagementsList } from '@/entities/planning/api/queries';
import { useHeatmapData } from '@/entities/risk';
import { useAuditUniverseLive } from '@/entities/universe/api/universe-live-api';
import { BDDKPackageModal } from '@/features/bddk-export/BDDKPackageModal';
import { AnnualPlanView } from '@/features/planning/ui/AnnualPlanView';
import { createFourEyesApproval } from '@/features/security/api/four-eyes';
import { PlanAdherence } from '@/widgets/PlanAdherence';
import { UniverseScoring } from '@/widgets/UniverseScoring';
import { supabase } from '@/shared/api/supabase';
import { ACTIVE_TENANT_ID } from '@/shared/lib/constants';
import { PageHeader } from '@/shared/ui';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import {
  AlertCircle,
  AlertTriangle,
  CalendarRange,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Clock,
  Edit2,
  Eye,
  FileText,
  Gauge,
  GitBranch,
  Kanban,
  LayoutGrid,
  List,
  Lock,
  Loader2,
  Minus,
  Monitor,
  Package,
  Plus,
  RefreshCw,
  Send,
  Shield,
  ShieldAlert,
  Sliders,
  Target,
  TrendingDown,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = 'universe' | 'rolling' | 'annual' | 'list' | 'adherence';
type PlanMode = 'mode1_core' | 'mode2_agile';
type AuditType = 'COMPREHENSIVE' | 'TARGETED' | 'FOLLOW_UP';

interface EntityWithRisk {
  id: string;
  name: string;
  path: string;
  type: string;
  rotation_type: 'MANDATORY' | 'ROTATION';
  entity_category: 'IT' | 'İdari';
  riskScore: number;        // 0-100 normalized
  rawResidual: number;      // from heatmap (0-25)
  lastAudit: string;
  weight: number;
}

interface QuickPlanForm {
  entityId: string;
  entityName: string;
  entityPath: string;
  riskScore: number;
  startDate: string;
  auditType: AuditType;
  estimatedHours: number;
}

interface InspectorConfig {
  id: string;       // id from talent_profiles
  name: string;
  department: string | null;
  title: string | null;
  availableWeeks: number;
}

interface DraftItem {
  entity: EntityWithRisk;
  durationWeeks: number;
  assignedAuditorId: string | null;
  assignedAuditorName: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function riskLevel(score: number): { label: string; color: string; bg: string } {
  if (score >= 80) return { label: 'Kritik', color: 'text-red-700', bg: 'bg-red-100 border-red-300' };
  if (score >= 60) return { label: 'Yüksek', color: 'text-orange-700', bg: 'bg-orange-100 border-orange-300' };
  if (score >= 40) return { label: 'Orta',   color: 'text-amber-700',  bg: 'bg-amber-100 border-amber-300' };
  return            { label: 'Düşük',  color: 'text-emerald-700', bg: 'bg-emerald-100 border-emerald-300' };
}

function rotationSuggestion(score: number): string {
  if (score >= 70) return 'Yıllık';
  if (score >= 45) return '2 Yılda Bir';
  return '3 Yılda Bir';
}

const DURATION_GROUPS = [
  { key: 'org',    label: 'Org. Yapı',   color: 'text-sky-400' },
  { key: 'proc',   label: 'Süreçler',    color: 'text-amber-400' },
  { key: 'prod',   label: 'Ürünler',     color: 'text-emerald-400' },
  { key: 'sub',    label: 'İştirakler',  color: 'text-rose-400' },
  { key: 'tp',     label: '3. Taraflar', color: 'text-violet-400' },
  { key: 'BRANCH', label: 'Şubeler',     color: 'text-orange-400' },
];

const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

function endDate(start: string, hours: number): string {
  const d = new Date(start);
  d.setDate(d.getDate() + Math.ceil(hours / 8));
  return d.toISOString().slice(0, 10);
}

// ─── Quick Plan Modal ─────────────────────────────────────────────────────────

function QuickPlanModal({
  form,
  activePlanId,
  onClose,
  onSuccess,
}: {
  form: QuickPlanForm;
  activePlanId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [startDate, setStartDate] = useState(form.startDate);
  const [auditType, setAuditType] = useState<AuditType>(form.auditType);
  const [hours, setHours] = useState(form.estimatedHours);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('audit_engagements').insert({
        title: `${form.entityName} Denetimi`,
        entity_id: form.entityId,
        audit_type: auditType,
        start_date: startDate,
        end_date: endDate(startDate, hours),
        estimated_hours: hours,
        status: 'PLANNED',
        plan_id: activePlanId ?? undefined,
        risk_snapshot_score: form.riskScore,
        tenant_id: ACTIVE_TENANT_ID,
      });
      if (error) throw error;
      toast.success(`"${form.entityName}" denetimi planlandı!`);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error(`Hata: ${err instanceof Error ? err.message : 'Kayıt başarısız'}`);
    } finally {
      setSaving(false);
    }
  };

  const rl = riskLevel(form.riskScore);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-blue-700 px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-sm">Denetim Planla</h3>
            <p className="text-indigo-200 text-xs mt-0.5 truncate max-w-[280px]">{form.entityName}</p>
          </div>
          <button onClick={onClose} className="text-indigo-200 hover:text-white p-1 rounded"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Entity info */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className={clsx('px-2 py-1 rounded-lg text-[10px] font-bold border', rl.bg, rl.color)}>
              {rl.label} {form.riskScore.toFixed(0)}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-700 truncate">{form.entityName}</div>
              <div className="text-[10px] text-slate-400 font-mono">{form.entityPath}</div>
            </div>
          </div>

          {!activePlanId && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
              <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />
              Onaylı yıllık plan bulunamadı. Denetim plansız oluşturulacak.
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Başlangıç Tarihi *</label>
            <input
              type="date"
              required
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Denetim Tipi</label>
            <div className="flex gap-2">
              {(['COMPREHENSIVE', 'TARGETED', 'FOLLOW_UP'] as AuditType[]).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setAuditType(t)}
                  className={clsx(
                    'flex-1 py-1.5 rounded-lg border text-[10px] font-bold transition-all',
                    auditType === t ? 'bg-indigo-50 border-indigo-400 text-indigo-700' : 'bg-white border-slate-200 text-slate-500'
                  )}
                >
                  {t === 'COMPREHENSIVE' ? 'Kapsamlı' : t === 'TARGETED' ? 'Hedefli' : 'Takip'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
              Tahmini Süre (Saat) — Bitiş: {startDate ? endDate(startDate, hours) : '—'}
            </label>
            <input
              type="number"
              min={8}
              max={500}
              value={hours}
              onChange={e => setHours(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              İptal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {saving ? 'Kaydediliyor...' : 'Planla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Entity Row ───────────────────────────────────────────────────────────────

function EntityRow({
  entity,
  isPlanned,
  isDraft,
  showSuggestion,
  durationWeeks,
}: {
  entity: EntityWithRisk;
  isPlanned: boolean;
  isDraft?: boolean;
  showSuggestion?: boolean;
  durationWeeks?: number;
}) {
  const rl = riskLevel(entity.riskScore);

  return (
    <tr className={clsx('border-b border-slate-100 transition-colors', isDraft ? 'bg-emerald-50/50' : isPlanned ? 'bg-blue-50/30' : 'hover:bg-slate-50/80')}>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden flex-shrink-0">
            <div
              className={clsx('h-full rounded-full transition-all', entity.riskScore >= 80 ? 'bg-red-500' : entity.riskScore >= 60 ? 'bg-orange-500' : entity.riskScore >= 40 ? 'bg-amber-400' : 'bg-emerald-500')}
              style={{ width: `${entity.riskScore}%` }}
            />
          </div>
          <span className={clsx('text-xs font-bold tabular-nums', rl.color)}>{entity.riskScore.toFixed(0)}</span>
        </div>
        <span className={clsx('inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold border mt-1', rl.bg, rl.color)}>
          {rl.label}
        </span>
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-800 text-xs leading-tight">{entity.name}</span>
          <span className={clsx('shrink-0 px-1 py-0.5 rounded text-[8px] font-bold border', entity.entity_category === 'IT' ? 'bg-cyan-50 text-cyan-700 border-cyan-200' : 'bg-slate-100 text-slate-500 border-slate-200')}>
            {entity.entity_category}
          </span>
        </div>
        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{entity.path}</div>
      </td>
      <td className="px-3 py-2.5 hidden md:table-cell">
        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono border border-slate-200">
          {entity.type}
        </span>
      </td>
      <td className="px-3 py-2.5 text-center">
        {durationWeeks != null && (
          <span className="inline-flex items-center gap-0.5 text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded font-bold">
            <Clock size={9} />{durationWeeks}hf
          </span>
        )}
      </td>
      {showSuggestion && (
        <td className="px-3 py-2.5 hidden lg:table-cell">
          <span className="text-[10px] text-slate-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded font-medium">
            {rotationSuggestion(entity.riskScore)}
          </span>
        </td>
      )}
      <td className="px-3 py-2.5 text-right">
        {isDraft ? (
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg font-bold">
            <Check size={10} /> Taslakta
          </span>
        ) : isPlanned ? (
          <span className="inline-flex items-center gap-1 text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg font-bold">
            <Check size={10} /> Planlandı
          </span>
        ) : (
          <span className="text-[10px] text-slate-300">—</span>
        )}
      </td>
    </tr>
  );
}

// ─── Inspector Picker Modal ────────────────────────────────────────────────────

interface TalentRow {
  id: string;
  full_name: string;
  title: string | null;
  department: string | null;
  is_available: boolean;
  burnout_zone: string | null;
}

function InspectorPickerModal({
  category,
  currentPool,
  onSave,
  onClose,
}: {
  category: 'IT' | 'İdari';
  currentPool: InspectorConfig[];
  onSave: (pool: InspectorConfig[]) => void;
  onClose: () => void;
}) {
  const { data: profiles = [], isLoading } = useQuery<TalentRow[]>({
    queryKey: ['talent-profiles-picker'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('talent_profiles')
        .select('id, full_name, title, department, is_available, burnout_zone')
        .order('full_name');
      if (error) throw error;
      return (data ?? []) as TalentRow[];
    },
    staleTime: 60_000,
  });

  const [selected, setSelected] = useState<Map<string, number>>(
    new Map(currentPool.map(a => [a.id, a.availableWeeks]))
  );

  const toggle = (p: TalentRow) => {
    setSelected(prev => {
      const next = new Map(prev);
      if (next.has(p.id)) next.delete(p.id);
      else next.set(p.id, 40);
      return next;
    });
  };

  const setWeeks = (id: string, weeks: number) => {
    setSelected(prev => { const next = new Map(prev); next.set(id, Math.max(1, Math.min(52, weeks))); return next; });
  };

  const handleSave = () => {
    const pool: InspectorConfig[] = Array.from(selected.entries()).map(([id, weeks]) => {
      const p = profiles.find(x => x.id === id)!;
      return { id, name: p?.full_name ?? id, department: p?.department ?? null, title: p?.title ?? null, availableWeeks: weeks };
    });
    onSave(pool);
    onClose();
  };

  const totalWeeks = Array.from(selected.values()).reduce((s, w) => s + w, 0);
  const burnoutColor: Record<string, string> = { GREEN: 'bg-emerald-400', AMBER: 'bg-amber-400', RED: 'bg-red-500' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className={clsx('px-5 py-4 flex items-center justify-between', category === 'IT' ? 'bg-cyan-600' : 'bg-indigo-600')}>
          <div className="flex items-center gap-2">
            <Monitor size={16} className="text-white" />
            <span className="font-bold text-white">{category === 'IT' ? 'BT (IT)' : 'İdari'} Müfettiş Havuzu</span>
            <span className="text-[10px] text-white/60 bg-white/15 px-2 py-0.5 rounded-full">Yetenek Yönetimi</span>
          </div>
          <div className="flex items-center gap-3">
            {selected.size > 0 && (
              <span className="text-xs text-white/80 bg-white/20 px-2 py-0.5 rounded-full">
                {selected.size} seçili · {totalWeeks} hf
              </span>
            )}
            <button onClick={onClose} className="text-white/70 hover:text-white"><X size={16} /></button>
          </div>
        </div>

        <div className="p-4 max-h-[460px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
              <Loader2 size={18} className="animate-spin" /><span className="text-sm">Yükleniyor...</span>
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Users size={36} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">Müfettiş profili bulunamadı</p>
              <p className="text-xs mt-1">Yetenek Yönetimi sayfasından müfettiş ekleyin</p>
            </div>
          ) : (
            <div className="space-y-2">
              {profiles.map(p => {
                const isSelected = selected.has(p.id);
                const weeks = selected.get(p.id) ?? 40;
                return (
                  <div
                    key={p.id}
                    className={clsx('flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer', isSelected ? (category === 'IT' ? 'bg-cyan-50 border-cyan-200' : 'bg-indigo-50 border-indigo-200') : 'bg-slate-50 border-slate-200 hover:border-slate-300')}
                    onClick={() => toggle(p)}
                  >
                    <div className={clsx('w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0 relative', isSelected ? (category === 'IT' ? 'bg-cyan-600' : 'bg-indigo-600') : 'bg-slate-400')}>
                      {(p.full_name || '?').charAt(0).toUpperCase()}
                      {p.burnout_zone && (
                        <span className={clsx('absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white', burnoutColor[p.burnout_zone] ?? 'bg-slate-400')} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-800 text-sm">{p.full_name}</span>
                        {!p.is_available && <span className="text-[8px] bg-amber-100 text-amber-700 border border-amber-200 px-1 py-0.5 rounded font-bold">Meşgul</span>}
                      </div>
                      <div className="text-[10px] text-slate-400">{p.title ?? ''}{p.title && p.department ? ' · ' : ''}{p.department ?? ''}</div>
                    </div>
                    {isSelected && (
                      <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                        <span className="text-[10px] text-slate-500 font-medium">Hafta:</span>
                        <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded-lg p-0.5">
                          <button onClick={() => setWeeks(p.id, weeks - 1)} className="w-5 h-5 flex items-center justify-center rounded text-slate-500 hover:bg-slate-100"><ChevronDown size={10} /></button>
                          <span className="w-8 text-center text-xs font-bold text-slate-800">{weeks}</span>
                          <button onClick={() => setWeeks(p.id, weeks + 1)} className="w-5 h-5 flex items-center justify-center rounded text-slate-500 hover:bg-slate-100"><ChevronUp size={10} /></button>
                        </div>
                      </div>
                    )}
                    {isSelected && <CheckCircle2 size={16} className={category === 'IT' ? 'text-cyan-600 shrink-0' : 'text-indigo-600 shrink-0'} />}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            {selected.size} müfettiş · Toplam <strong>{totalWeeks}</strong> hf · Etkin ~<strong>{Math.round(totalWeeks * 0.8)}</strong> hf
          </span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">İptal</button>
            <button onClick={handleSave} className={clsx('px-4 py-1.5 text-xs text-white rounded-lg font-bold transition-colors', category === 'IT' ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-indigo-600 hover:bg-indigo-700')}>
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StrategicPlanningPage() {
  const [activeTab, setActiveTab] = useState<TabId>('rolling');
  const [planMode, setPlanMode] = useState<PlanMode>('mode1_core');
  const [showBDDKModal, setShowBDDKModal] = useState(false);
  const [quickPlanForm, setQuickPlanForm] = useState<QuickPlanForm | null>(null);
  const [hoursPerAudit, setHoursPerAudit] = useState(40);
  const [searchMode1, setSearchMode1] = useState('');
  const [searchMode2, setSearchMode2] = useState('');
  const [sortDesc, setSortDesc] = useState(true);
  const [closingId, setClosingId] = useState<string | null>(null);
  // Inspector pools (IT and İdari separate)
  const [itPool, setItPool] = useState<InspectorConfig[]>([]);
  const [idariPool, setIdariPool] = useState<InspectorConfig[]>([]);
  const [showInspectorPicker, setShowInspectorPicker] = useState<'IT' | 'İdari' | null>(null);
  const [utilizationPct, setUtilizationPct] = useState(80);
  const [categoryFilter, setCategoryFilter] = useState<'IT' | 'İdari'>('İdari');
  const [auditDurations, setAuditDurations] = useState<Record<string, number>>({
    org: 2, proc: 3, prod: 2, sub: 2, tp: 1, BRANCH: 2,
  });
  const [showDurationConfig, setShowDurationConfig] = useState(false);
  // Draft plan
  const [draftItems, setDraftItems] = useState<Map<string, DraftItem>>(new Map());
  const [isDraftPanelOpen, setIsDraftPanelOpen] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ─── Data ────────────────────────────────────────────────────────────────

  const { data: liveEntities = [], isLoading: loadingEntities } = useAuditUniverseLive();
  const { data: assessments = [] } = useHeatmapData();

  const { data: engagements = [], isLoading: loadingEngagements } = useQuery({
    queryKey: ['audit-engagements-list'],
    queryFn: fetchEngagementsList,
  });

  const { data: activePlan } = useQuery({
    queryKey: ['active-audit-plan'],
    queryFn: fetchActivePlan,
    staleTime: 30_000,
  });

  const { data: allPlans = [] } = useQuery({
    queryKey: ['audit-plans-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_plans')
        .select('id, title, period_start, period_end, status, version, created_at')
        .order('period_start', { ascending: false });
      if (error) throw error;
      return data as { id: string; title: string; period_start: string; period_end: string; status: string; version: number; created_at: string }[];
    },
    staleTime: 30_000,
  });

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const { data: planEngagements = [] } = useQuery({
    queryKey: ['plan-engagements', selectedPlanId],
    enabled: !!selectedPlanId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_engagements')
        .select('id, title, audit_type, start_date, end_date, status, estimated_hours, risk_snapshot_score, entity_id, audit_entities(name)')
        .eq('plan_id', selectedPlanId!)
        .order('start_date');
      if (error) throw error;
      return (data ?? []) as { id: string; title: string; audit_type: string; start_date: string; end_date: string; status: string; estimated_hours: number; risk_snapshot_score: number; entity_id: string; audit_entities: { name: string } | null }[];
    },
  });

  // ─── Risk Score Computation ───────────────────────────────────────────────

  const entityRiskMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const a of assessments) {
      const s = Number(a.residual_score ?? a.impact * a.likelihood ?? 0);
      map[a.entity_id] = Math.max(map[a.entity_id] ?? 0, s);
    }
    return map;
  }, [assessments]);

  const toScore = (entity: typeof liveEntities[0]): number => {
    const raw = entityRiskMap[entity.id];
    if (raw != null) return Math.min(100, Math.round(raw / 25 * 100));
    return Math.min(100, entity.risk_score ?? 50);
  };

  const enriched = useMemo((): EntityWithRisk[] =>
    liveEntities.map(e => ({
      id: e.id,
      name: e.name,
      path: e.path,
      type: e.type,
      rotation_type: e.rotation_type,
      entity_category: e.entity_category,
      riskScore: toScore(e),
      rawResidual: entityRiskMap[e.id] ?? 0,
      lastAudit: e.lastAudit,
      weight: e.weight,
    })).sort((a, b) => sortDesc ? b.riskScore - a.riskScore : a.riskScore - b.riskScore),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [liveEntities, entityRiskMap, sortDesc]);

  const mandatoryEntities = useMemo(() =>
    enriched.filter(e => e.rotation_type === 'MANDATORY' && (
      !searchMode1 || e.name.toLowerCase().includes(searchMode1.toLowerCase()) || e.path.includes(searchMode1.toLowerCase())
    )),
  [enriched, searchMode1]);

  const rotationEntities = useMemo(() =>
    enriched.filter(e => e.rotation_type === 'ROTATION' && (
      !searchMode2 || e.name.toLowerCase().includes(searchMode2.toLowerCase()) || e.path.includes(searchMode2.toLowerCase())
    )),
  [enriched, searchMode2]);

  // ─── Capacity ────────────────────────────────────────────────────────────

  const thisYear = new Date().getFullYear();
  const plannedThisYear = engagements.filter(e => {
    const d = e.start_date ? new Date(e.start_date).getFullYear() : 0;
    return d === thisYear;
  });
  const plannedIds = new Set(plannedThisYear.map(e => e.entity_id).filter(Boolean));

  const itCapacityWeeks = itPool.reduce((s, a) => s + a.availableWeeks, 0) * (utilizationPct / 100);
  const idariCapacityWeeks = idariPool.reduce((s, a) => s + a.availableWeeks, 0) * (utilizationPct / 100);
  const totalCapacityWeeks = itCapacityWeeks + idariCapacityWeeks;

  const getEntityDurationWeeks = useCallback((entity: EntityWithRisk): number => {
    if (entity.type === 'BRANCH') return auditDurations['BRANCH'] ?? 2;
    const prefix = entity.path.split('.')[0];
    return auditDurations[prefix] ?? 2;
  }, [auditDurations]);

  // Only show leaf entities (no parent nodes) in planning lists
  const leafEntities = useMemo(() =>
    enriched.filter(e => !enriched.some(other => other.id !== e.id && other.path.startsWith(e.path + '.'))),
    [enriched]
  );

  // IT / İdari splits
  const itMandatory = useMemo(() => leafEntities.filter(e => e.entity_category === 'IT' && e.rotation_type === 'MANDATORY'), [leafEntities]);
  const itAgile = useMemo(() => leafEntities.filter(e => e.entity_category === 'IT' && e.rotation_type === 'ROTATION'), [leafEntities]);
  const idariMandatory = useMemo(() => leafEntities.filter(e => e.entity_category === 'İdari' && e.rotation_type === 'MANDATORY'), [leafEntities]);
  const idariAgile = useMemo(() => leafEntities.filter(e => e.entity_category === 'İdari' && e.rotation_type === 'ROTATION'), [leafEntities]);

  const mandatoryWeeksTotal = useMemo(() =>
    [...itMandatory, ...idariMandatory].reduce((s, e) => s + getEntityDurationWeeks(e), 0),
    [itMandatory, idariMandatory, getEntityDurationWeeks]
  );
  const agileCapacityWeeks = Math.max(0, totalCapacityWeeks - mandatoryWeeksTotal);

  const agileEntitiesFit = useMemo(() => {
    const allAgile = [...itAgile, ...idariAgile].sort((a, b) => b.riskScore - a.riskScore);
    let remaining = agileCapacityWeeks;
    let count = 0;
    for (const e of allAgile) {
      const dur = getEntityDurationWeeks(e);
      if (dur <= remaining) { remaining -= dur; count++; }
    }
    return count;
  }, [itAgile, idariAgile, agileCapacityWeeks, getEntityDurationWeeks]);

  // Filtered entity lists for current view
  const currentMandatory = useMemo(() => {
    const base = categoryFilter === 'IT' ? itMandatory : idariMandatory;
    const search = searchMode1.toLowerCase();
    return base.filter(e => !search || e.name.toLowerCase().includes(search) || e.path.includes(search));
  }, [categoryFilter, itMandatory, idariMandatory, searchMode1]);

  const currentAgile = useMemo(() => {
    const base = categoryFilter === 'IT' ? itAgile : idariAgile;
    const search = searchMode2.toLowerCase();
    return base.filter(e => !search || e.name.toLowerCase().includes(search) || e.path.includes(search));
  }, [categoryFilter, itAgile, idariAgile, searchMode2]);

  // 12-month plan distribution
  const annualPlanSummary = useMemo(() => {
    const allMandatory = [...itMandatory, ...idariMandatory].sort((a, b) => b.riskScore - a.riskScore);
    const allAgile = [...itAgile, ...idariAgile].sort((a, b) => b.riskScore - a.riskScore);

    const monthlyMandatory = Array.from({ length: 12 }, () => 0);
    const monthlyAgile = Array.from({ length: 12 }, () => 0);
    const monthlyWeeks = Array.from({ length: 12 }, () => 0);

    allMandatory.forEach((e, i) => {
      const m = i % 12;
      monthlyMandatory[m]++;
      monthlyWeeks[m] += getEntityDurationWeeks(e);
    });

    let remaining = agileCapacityWeeks;
    allAgile.forEach((e, idx) => {
      if (remaining <= 0) return;
      const dur = getEntityDurationWeeks(e);
      if (dur <= remaining) {
        const m = idx % 12;
        monthlyAgile[m]++;
        monthlyWeeks[m] += dur;
        remaining -= dur;
      }
    });

    const weeksPerMonth = totalCapacityWeeks / 12;
    const monthPct = monthlyWeeks.map(w => Math.min(100, Math.round((w / (weeksPerMonth || 1)) * 100)));

    return { monthlyMandatory, monthlyAgile, monthlyWeeks, monthPct };
  }, [itMandatory, itAgile, idariMandatory, idariAgile, agileCapacityWeeks, getEntityDurationWeeks, totalCapacityWeeks]);

  const overCapacity = mandatoryWeeksTotal > totalCapacityWeeks;

  // ─── Plan handler ─────────────────────────────────────────────────────────

  const openPlanModal = (entity: EntityWithRisk) => {
    setQuickPlanForm({
      entityId: entity.id,
      entityName: entity.name,
      entityPath: entity.path,
      riskScore: entity.riskScore,
      startDate: new Date().toISOString().slice(0, 10),
      auditType: entity.rotation_type === 'MANDATORY' ? 'COMPREHENSIVE' : 'TARGETED',
      estimatedHours: hoursPerAudit,
    });
  };

  const handleCloseEngagement = async (id: string, title: string) => {
    setClosingId(id);
    try {
      const { error } = await supabase
        .from('audit_engagements')
        .update({ status: 'CLOSED', updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      toast.success(`"${title}" kapatıldı.`);
      queryClient.invalidateQueries({ queryKey: ['audit-engagements-list'] });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Kapatma hatası');
    } finally {
      setClosingId(null);
    }
  };

  const removeFromDraft = (id: string) => {
    setDraftItems(prev => { const next = new Map(prev); next.delete(id); return next; });
  };

  // Auto-fill draft: ALL mandatory + agile up to remaining capacity, then auto-assign
  const autoFillDraft = useCallback(() => {
    const allMandatory = [...itMandatory, ...idariMandatory].sort((a, b) => b.riskScore - a.riskScore);
    const allAgile = [...itAgile, ...idariAgile].sort((a, b) => b.riskScore - a.riskScore);

    const next = new Map<string, DraftItem>();

    // Add all mandatory leaf entities
    for (const e of allMandatory) {
      next.set(e.id, { entity: e, durationWeeks: getEntityDurationWeeks(e), assignedAuditorId: null, assignedAuditorName: null });
    }

    // Add agile entities up to agile capacity
    let remaining = agileCapacityWeeks;
    for (const e of allAgile) {
      if (remaining <= 0) break;
      const dur = getEntityDurationWeeks(e);
      if (dur <= remaining) {
        next.set(e.id, { entity: e, durationWeeks: dur, assignedAuditorId: null, assignedAuditorName: null });
        remaining -= dur;
      }
    }

    // Auto-assign auditors inline
    let itIdx = 0, idariIdx = 0;
    for (const [id, item] of next.entries()) {
      if (item.entity.entity_category === 'IT' && itPool.length > 0) {
        const aud = itPool[itIdx % itPool.length];
        next.set(id, { ...item, assignedAuditorId: aud.id, assignedAuditorName: aud.name });
        itIdx++;
      } else if (item.entity.entity_category === 'İdari' && idariPool.length > 0) {
        const aud = idariPool[idariIdx % idariPool.length];
        next.set(id, { ...item, assignedAuditorId: aud.id, assignedAuditorName: aud.name });
        idariIdx++;
      }
    }

    setDraftItems(next);
    setIsDraftPanelOpen(true);
    toast.success(`Taslak plan oluşturuldu: ${next.size} denetim (${allMandatory.length} zorunlu + ${next.size - allMandatory.length} agile)`);
  }, [itMandatory, idariMandatory, itAgile, idariAgile, getEntityDurationWeeks, agileCapacityWeeks, itPool, idariPool]);

  // Auto-assign auditors: IT entities → IT pool (round-robin), İdari → İdari pool
  const autoAssignAuditors = () => {
    setDraftItems(prev => {
      const next = new Map(prev);
      let itIdx = 0, idariIdx = 0;
      for (const [id, item] of next.entries()) {
        if (item.entity.entity_category === 'IT' && itPool.length > 0) {
          const aud = itPool[itIdx % itPool.length];
          next.set(id, { ...item, assignedAuditorId: aud.id, assignedAuditorName: aud.name });
          itIdx++;
        } else if (item.entity.entity_category === 'İdari' && idariPool.length > 0) {
          const aud = idariPool[idariIdx % idariPool.length];
          next.set(id, { ...item, assignedAuditorId: aud.id, assignedAuditorName: aud.name });
          idariIdx++;
        }
      }
      return next;
    });
  };

  const createDraftPlan = async () => {
    if (draftItems.size === 0) { toast.error('Taslak plan boş. Önce denetim öğesi ekleyin.'); return; }
    setIsSavingDraft(true);
    try {
      const planTitle = `${thisYear} Yılı Denetim Planı`;
      const { data: plan, error: planErr } = await supabase
        .from('audit_plans')
        .insert({ tenant_id: ACTIVE_TENANT_ID, title: planTitle, period_start: `${thisYear}-01-01`, period_end: `${thisYear}-12-31`, status: 'DRAFT', version: 1 })
        .select().single();
      if (planErr) throw planErr;

      const items = Array.from(draftItems.values());
      const engRows = items.map((item, i) => {
        const month = i % 12;
        const start = new Date(thisYear, month, 1);
        const end = new Date(thisYear, month, item.durationWeeks * 7);
        return {
          tenant_id: ACTIVE_TENANT_ID,
          plan_id: plan.id,
          entity_id: item.entity.id,
          title: `${item.entity.name} Denetimi`,
          audit_type: item.entity.rotation_type === 'MANDATORY' ? 'COMPREHENSIVE' : 'TARGETED',
          start_date: start.toISOString().slice(0, 10),
          end_date: end.toISOString().slice(0, 10),
          estimated_hours: item.durationWeeks * 40,
          risk_snapshot_score: item.entity.riskScore,
          status: 'PLANNED',
          assigned_auditor_id: item.assignedAuditorId ?? undefined,
        };
      });
      const { error: engErr } = await supabase.from('audit_engagements').insert(engRows);
      if (engErr) throw engErr;

      await createFourEyesApproval({ resourceType: 'audit_plan', resourceId: plan.id, actionName: 'APPROVE_AUDIT_PLAN', payload: { title: planTitle, itemCount: items.length, year: thisYear } });

      toast.success(`"${planTitle}" taslak oluşturuldu ve onaya gönderildi (${items.length} denetim)`);
      setDraftItems(new Map());
      setIsDraftPanelOpen(false);
      queryClient.invalidateQueries({ queryKey: ['audit-plans-list'] });
      queryClient.invalidateQueries({ queryKey: ['audit-engagements-list'] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Plan oluşturma hatası');
    } finally {
      setIsSavingDraft(false);
    }
  };

  // ─── Tab Config ───────────────────────────────────────────────────────────

  const tabs = [
    { id: 'universe' as const, label: 'Risk Evreni', icon: Target },
    { id: 'rolling'  as const, label: 'Bimodal Plan', icon: GitBranch },
    { id: 'annual'   as const, label: 'Yıllık Plan',  icon: CalendarRange },
    { id: 'list'     as const, label: 'Denetimler',   icon: FileText },
    { id: 'adherence'as const, label: 'Plan Uyumu',   icon: Gauge },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-canvas">
      <PageHeader
        title="Bimodal Stratejik Planlama"
        description="Denetim evreni + risk haritası → kapasite bazlı 3+9 aylık program"
        icon={LayoutGrid}
        action={
          <button
            onClick={() => setShowBDDKModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-surface/80 backdrop-blur-xl border border-white/20 text-slate-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 rounded-xl text-sm font-semibold shadow-sm transition-all"
          >
            <Package size={15} /> BDDK Paketi Oluştur
          </button>
        }
      />

      <div className="space-y-4">
        {/* Tab bar */}
        <div className="bg-surface/80 backdrop-blur-xl rounded-xl border border-slate-200 p-1.5 flex gap-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-lg font-semibold text-sm transition-all',
                  active
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                )}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="bg-surface/80 backdrop-blur-xl rounded-xl border border-slate-200 overflow-hidden shadow-sm">

          {/* ── Risk Evreni ─────────────────────────────────────────────── */}
          {activeTab === 'universe' && (
            <div className="p-5">
              <UniverseScoring />
            </div>
          )}

          {/* ── Yıllık Plan ─────────────────────────────────────────────── */}
          {activeTab === 'annual' && (
            <div className="flex flex-col">
              {selectedPlanId ? (
                /* Plan Detail View */
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-5">
                    <button onClick={() => setSelectedPlanId(null)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition-colors">
                      <ChevronDown size={12} className="-rotate-90" /> Planlara Dön
                    </button>
                    {(() => {
                      const plan = allPlans.find(p => p.id === selectedPlanId);
                      if (!plan) return null;
                      const statusColors: Record<string, string> = { DRAFT: 'bg-amber-100 text-amber-700 border-amber-200', APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-200', LOCKED: 'bg-slate-100 text-slate-600 border-slate-300' };
                      const statusLabels: Record<string, string> = { DRAFT: 'Taslak', APPROVED: 'Onaylı', LOCKED: 'Kilitli' };
                      return (
                        <>
                          <div>
                            <h2 className="text-base font-bold text-slate-800">{plan.title}</h2>
                            <p className="text-xs text-slate-500">{plan.period_start} → {plan.period_end}</p>
                          </div>
                          <span className={clsx('px-2 py-0.5 rounded border text-xs font-bold', statusColors[plan.status] ?? 'bg-slate-100 text-slate-600 border-slate-200')}>
                            {statusLabels[plan.status] ?? plan.status}
                          </span>
                          <span className="text-xs text-slate-400 ml-auto">{planEngagements.length} denetim</span>
                        </>
                      );
                    })()}
                  </div>
                  {planEngagements.length === 0 ? (
                    <div className="text-center py-12 text-slate-400"><FileText size={32} className="mx-auto mb-3 opacity-20" /><p className="text-sm">Bu planda henüz denetim yok</p></div>
                  ) : (
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wide">Varlık / Denetim</th>
                            <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wide hidden md:table-cell">Tür</th>
                            <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wide">Tarih</th>
                            <th className="px-3 py-2.5 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wide">Risk</th>
                            <th className="px-3 py-2.5 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wide">Statü</th>
                          </tr>
                        </thead>
                        <tbody>
                          {planEngagements.map(eng => {
                            const statusCls: Record<string, string> = { PLANNED: 'bg-blue-100 text-blue-700', IN_PROGRESS: 'bg-amber-100 text-amber-700', COMPLETED: 'bg-emerald-100 text-emerald-700', CANCELLED: 'bg-slate-100 text-slate-500' };
                            const statusLbl: Record<string, string> = { PLANNED: 'Planlandı', IN_PROGRESS: 'Devam', COMPLETED: 'Tamamlandı', CANCELLED: 'İptal' };
                            return (
                              <tr key={eng.id} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
                                <td className="px-3 py-2.5">
                                  <div className="font-semibold text-slate-800 text-xs">{eng.title}</div>
                                  {eng.audit_entities && <div className="text-[9px] text-slate-400">{eng.audit_entities.name}</div>}
                                </td>
                                <td className="px-3 py-2.5 hidden md:table-cell">
                                  <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono border border-slate-200">{eng.audit_type}</span>
                                </td>
                                <td className="px-3 py-2.5 text-xs text-slate-600 font-mono">{eng.start_date} → {eng.end_date}</td>
                                <td className="px-3 py-2.5 text-center">
                                  <span className={clsx('text-xs font-black', eng.risk_snapshot_score >= 60 ? 'text-red-600' : eng.risk_snapshot_score >= 40 ? 'text-amber-600' : 'text-emerald-600')}>{eng.risk_snapshot_score}</span>
                                </td>
                                <td className="px-3 py-2.5 text-center">
                                  <span className={clsx('px-1.5 py-0.5 rounded text-[9px] font-bold', statusCls[eng.status] ?? 'bg-slate-100 text-slate-500')}>{statusLbl[eng.status] ?? eng.status}</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                /* Plan List by Year */
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-5">
                    <CalendarRange size={15} className="text-indigo-500" />
                    <h3 className="text-sm font-bold text-slate-800">Denetim Planları</h3>
                    <span className="text-xs text-slate-400">({allPlans.length} plan)</span>
                  </div>
                  {allPlans.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                      <FileText size={40} className="mx-auto mb-3 opacity-20" />
                      <p className="text-sm font-medium">Henüz plan oluşturulmadı</p>
                      <p className="text-xs mt-1">Bimodal Plan sekmesinden taslak plan oluşturun</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(() => {
                        const byYear = new Map<number, typeof allPlans>();
                        allPlans.forEach(p => {
                          const y = new Date(p.period_start).getFullYear();
                          if (!byYear.has(y)) byYear.set(y, []);
                          byYear.get(y)!.push(p);
                        });
                        return Array.from(byYear.entries()).sort(([a], [b]) => b - a).map(([year, plans]) => (
                          <div key={year}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{year}</span>
                              <div className="flex-1 h-px bg-slate-100" />
                            </div>
                            <div className="grid gap-2">
                              {plans.map(plan => {
                                const statusCls: Record<string, string> = { DRAFT: 'border-amber-200 bg-amber-50', APPROVED: 'border-emerald-200 bg-emerald-50', LOCKED: 'border-slate-300 bg-slate-50' };
                                const statusBadge: Record<string, string> = { DRAFT: 'bg-amber-100 text-amber-700 border-amber-200', APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-200', LOCKED: 'bg-slate-100 text-slate-600 border-slate-300' };
                                const statusLabel: Record<string, string> = { DRAFT: 'Taslak', APPROVED: 'Onaylı', LOCKED: 'Kilitli' };
                                return (
                                  <button
                                    key={plan.id}
                                    onClick={() => setSelectedPlanId(plan.id)}
                                    className={clsx('w-full text-left p-4 rounded-xl border-2 transition-all hover:shadow-md', statusCls[plan.status] ?? 'border-slate-200 bg-white')}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold text-slate-800 text-sm">{plan.title}</span>
                                          <span className={clsx('px-2 py-0.5 rounded border text-[10px] font-bold', statusBadge[plan.status] ?? 'bg-slate-100 text-slate-600 border-slate-200')}>
                                            {statusLabel[plan.status] ?? plan.status}
                                          </span>
                                        </div>
                                        <div className="text-xs text-slate-500 mt-0.5">{plan.period_start} → {plan.period_end}</div>
                                      </div>
                                      <ChevronDown size={16} className="text-slate-400 -rotate-90 shrink-0" />
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  )}
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <AnnualPlanView />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Plan Uyumu ──────────────────────────────────────────────── */}
          {activeTab === 'adherence' && (
            <div className="p-5">
              <PlanAdherence />
            </div>
          )}

          {/* ── Denetimler Listesi ───────────────────────────────────────── */}
          {activeTab === 'list' && (
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800">Denetim Görevleri</h2>
                <button
                  onClick={() => setActiveTab('rolling')}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  <Plus size={14} /> Yeni Denetim Planla
                </button>
              </div>

              {loadingEngagements ? (
                <div className="flex items-center justify-center py-12 gap-3 text-slate-400">
                  <Loader2 size={24} className="animate-spin" />
                  <span className="text-sm">Yükleniyor...</span>
                </div>
              ) : engagements.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <FileText size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">Henüz planlanmış denetim yok</p>
                  <p className="text-xs mt-1">Bimodal Plan sekmesinden denetim planlayın</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        {['Başlık', 'Tip', 'Durum', 'Başlangıç', 'Bitiş', 'Saat', 'Risk', 'İşlem'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {engagements.map((eng, idx) => {
                        const sc = {
                          CLOSED: 'bg-slate-200 text-slate-600',
                          FINALIZED: 'bg-teal-100 text-teal-700',
                          COMPLETED: 'bg-emerald-100 text-emerald-700',
                          IN_PROGRESS: 'bg-blue-100 text-blue-700',
                          PLANNED: 'bg-slate-100 text-slate-700',
                        }[eng.status] ?? 'bg-amber-100 text-amber-700';
                        const closable = ['COMPLETED', 'FINALIZED', 'IN_PROGRESS'].includes(eng.status);
                        return (
                          <tr
                            key={eng.id}
                            onClick={() => navigate(`/execution/my-engagements/${eng.id}`)}
                            className={clsx('cursor-pointer hover:bg-indigo-50/30 transition-colors', idx % 2 !== 0 ? 'bg-slate-50/50' : '')}
                          >
                            <td className="px-4 py-3 font-semibold text-slate-800">{eng.title}</td>
                            <td className="px-4 py-3 text-slate-600 text-xs">{eng.audit_type}</td>
                            <td className="px-4 py-3">
                              <span className={clsx('px-2 py-0.5 rounded text-[10px] font-bold', sc)}>{eng.status}</span>
                            </td>
                            <td className="px-4 py-3 text-slate-500 text-xs">{eng.start_date ? new Date(eng.start_date).toLocaleDateString('tr-TR') : '—'}</td>
                            <td className="px-4 py-3 text-slate-500 text-xs">{eng.end_date ? new Date(eng.end_date).toLocaleDateString('tr-TR') : '—'}</td>
                            <td className="px-4 py-3 text-slate-500 text-xs">{eng.estimated_hours ?? '—'}</td>
                            <td className="px-4 py-3">
                              {eng.risk_snapshot_score != null ? (
                                <div className="flex items-center gap-1.5">
                                  <div className="w-12 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                                    <div
                                      className={clsx('h-full rounded-full', eng.risk_snapshot_score >= 70 ? 'bg-red-500' : eng.risk_snapshot_score >= 40 ? 'bg-amber-500' : 'bg-emerald-500')}
                                      style={{ width: `${eng.risk_snapshot_score}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-bold text-slate-700">{eng.risk_snapshot_score.toFixed(0)}</span>
                                </div>
                              ) : <span className="text-slate-400 text-xs">—</span>}
                            </td>
                            <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center gap-1">
                                <button onClick={() => navigate(`/execution/my-engagements/${eng.id}`)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Eye size={14} /></button>
                                <button className="p-1.5 text-slate-500 hover:bg-slate-50 rounded"><Edit2 size={14} /></button>
                                {closable && (
                                  <button
                                    disabled={closingId === eng.id}
                                    onClick={() => handleCloseEngagement(eng.id, eng.title)}
                                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold bg-slate-800 text-white rounded hover:bg-slate-700 disabled:opacity-50 transition-colors"
                                  >
                                    {closingId === eng.id ? <Loader2 size={10} className="animate-spin" /> : <Lock size={10} />}
                                    {closingId === eng.id ? '...' : 'Kapat'}
                                  </button>
                                )}
                                {eng.status === 'CLOSED' && (
                                  <span className="flex items-center gap-1 px-2 py-1 text-[10px] text-slate-400 border border-slate-200 rounded">
                                    <ShieldAlert size={10} /> Kapalı
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {engagements.length > 0 && (
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>Toplam: <span className="font-bold text-slate-800">{engagements.length}</span> denetim</span>
                  <div className="flex items-center gap-3">
                    {[
                      { s: 'IN_PROGRESS', label: 'Devam Eden', color: 'bg-blue-500' },
                      { s: 'PLANNED',     label: 'Planlanan',  color: 'bg-slate-400' },
                      { s: 'COMPLETED',   label: 'Tamamlanan', color: 'bg-emerald-500' },
                    ].map(({ s, label, color }) => (
                      <div key={s} className="flex items-center gap-1">
                        <div className={clsx('w-2 h-2 rounded-full', color)} />
                        <span>{engagements.filter(e => e.status === s).length} {label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Bimodal Hareketli Plan ───────────────────────────────────── */}
          {activeTab === 'rolling' && (
            <div className="flex flex-col">

              {/* ━━━ 1. KAPASİTE KONTROL PANELİ ━━━ */}
              <div className="px-5 py-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 space-y-4">

                {/* Inputs row */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-3">

                  {/* IT Inspector Pool button */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest">BT (IT) Müfettişleri</span>
                    <button
                      onClick={() => setShowInspectorPicker('IT')}
                      className="flex items-center gap-2 px-3 py-2 bg-cyan-900/60 hover:bg-cyan-800/80 border border-cyan-700/50 rounded-xl transition-all group"
                    >
                      <div className="flex -space-x-1.5">
                        {itPool.slice(0, 3).map(a => (
                          <div key={a.id} className="w-6 h-6 rounded-full bg-cyan-600 border-2 border-slate-800 flex items-center justify-center text-[9px] font-black text-white">
                            {a.name.charAt(0)}
                          </div>
                        ))}
                        {itPool.length > 3 && <div className="w-6 h-6 rounded-full bg-slate-600 border-2 border-slate-800 flex items-center justify-center text-[9px] font-bold text-white">+{itPool.length - 3}</div>}
                        {itPool.length === 0 && <div className="w-6 h-6 rounded-full bg-slate-700 border border-dashed border-cyan-600 flex items-center justify-center"><UserPlus size={11} className="text-cyan-400" /></div>}
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold text-cyan-300">{itPool.length > 0 ? `${itPool.length} müfettiş` : 'Seç'}</div>
                        {itPool.length > 0 && <div className="text-[9px] text-cyan-500">{itPool.reduce((s, a) => s + a.availableWeeks, 0)} hf</div>}
                      </div>
                      <div className="text-[10px] font-black text-cyan-300 ml-auto">{itCapacityWeeks.toFixed(0)} hf</div>
                    </button>
                  </div>

                  <div className="w-px h-14 bg-slate-700" />

                  {/* İdari Inspector Pool button */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest">İdari Müfettişler</span>
                    <button
                      onClick={() => setShowInspectorPicker('İdari')}
                      className="flex items-center gap-2 px-3 py-2 bg-indigo-900/60 hover:bg-indigo-800/80 border border-indigo-700/50 rounded-xl transition-all group"
                    >
                      <div className="flex -space-x-1.5">
                        {idariPool.slice(0, 3).map(a => (
                          <div key={a.id} className="w-6 h-6 rounded-full bg-indigo-600 border-2 border-slate-800 flex items-center justify-center text-[9px] font-black text-white">
                            {a.name.charAt(0)}
                          </div>
                        ))}
                        {idariPool.length > 3 && <div className="w-6 h-6 rounded-full bg-slate-600 border-2 border-slate-800 flex items-center justify-center text-[9px] font-bold text-white">+{idariPool.length - 3}</div>}
                        {idariPool.length === 0 && <div className="w-6 h-6 rounded-full bg-slate-700 border border-dashed border-indigo-600 flex items-center justify-center"><UserPlus size={11} className="text-indigo-400" /></div>}
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold text-indigo-300">{idariPool.length > 0 ? `${idariPool.length} müfettiş` : 'Seç'}</div>
                        {idariPool.length > 0 && <div className="text-[9px] text-indigo-500">{idariPool.reduce((s, a) => s + a.availableWeeks, 0)} hf</div>}
                      </div>
                      <div className="text-[10px] font-black text-indigo-300 ml-auto">{idariCapacityWeeks.toFixed(0)} hf</div>
                    </button>
                  </div>

                  <div className="w-px h-14 bg-slate-700" />

                  {/* Doluluk Oranı */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Doluluk</span>
                    <div className="flex items-center gap-0.5 bg-slate-700 rounded-lg p-0.5">
                      <button onClick={() => setUtilizationPct(v => Math.max(10, v - 5))} className="w-6 h-6 flex items-center justify-center rounded-md text-slate-300 hover:bg-slate-600 transition-colors"><ChevronDown size={11} /></button>
                      <span className="w-10 text-center text-sm font-black text-white">{utilizationPct}%</span>
                      <button onClick={() => setUtilizationPct(v => Math.min(100, v + 5))} className="w-6 h-6 flex items-center justify-center rounded-md text-slate-300 hover:bg-slate-600 transition-colors"><ChevronUp size={11} /></button>
                    </div>
                  </div>

                  <div className="w-px h-14 bg-slate-700" />

                  {/* Derived metrics */}
                  <div className="flex items-center gap-5">
                    <div className="text-center">
                      <div className="text-lg font-black text-white">{totalCapacityWeeks.toFixed(0)}</div>
                      <div className="text-[8px] text-slate-400 uppercase tracking-wide leading-tight">Toplam<br/>Kapasite (Hf)</div>
                    </div>
                    <div className="text-center">
                      <div className={clsx('text-lg font-black', overCapacity ? 'text-red-400' : 'text-emerald-400')}>{mandatoryWeeksTotal.toFixed(0)}</div>
                      <div className="text-[8px] text-slate-400 uppercase tracking-wide leading-tight">Zorunlu<br/>İhtiyaç (Hf)</div>
                    </div>
                    <div className="text-center">
                      <div className={clsx('text-lg font-black', agileCapacityWeeks <= 0 ? 'text-red-400' : 'text-sky-400')}>{agileCapacityWeeks.toFixed(0)}</div>
                      <div className="text-[8px] text-slate-400 uppercase tracking-wide leading-tight">Agile<br/>Kapasite (Hf)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-black text-violet-400">{agileEntitiesFit}</div>
                      <div className="text-[8px] text-slate-400 uppercase tracking-wide leading-tight">Agile<br/>Denetim Sığar</div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0" />

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {draftItems.size > 0 && (
                      <button
                        onClick={() => setIsDraftPanelOpen(v => !v)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-lg text-[11px] font-bold transition-all"
                      >
                        <ClipboardList size={12} />
                        Taslak ({draftItems.size})
                      </button>
                    )}
                    <button
                      onClick={() => setShowDurationConfig(v => !v)}
                      className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all', showDurationConfig ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600')}
                    >
                      <Sliders size={12} /> Süre Ayarları
                    </button>
                    <button
                      onClick={autoFillDraft}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg text-[11px] font-bold transition-all shadow-sm shadow-emerald-500/30"
                    >
                      <Kanban size={12} /> Planı Otomatik Doldur
                    </button>
                  </div>
                </div>

                {/* Progress bars */}
                <div className="grid grid-cols-3 gap-4">
                  {(() => {
                    const itWeeks = [...itMandatory, ...itAgile].reduce((s, e) => s + getEntityDurationWeeks(e), 0);
                    const idariWeeks = [...idariMandatory, ...idariAgile].reduce((s, e) => s + getEntityDurationWeeks(e), 0);
                    const totalNeeded = mandatoryWeeksTotal;
                    const overallPct = Math.min(100, Math.round((totalNeeded / (totalCapacityWeeks || 1)) * 100));
                    return [
                      { label: 'BT (IT) İhtiyacı', weeks: [...itMandatory].reduce((s, e) => s + getEntityDurationWeeks(e), 0), cap: totalCapacityWeeks * (itWeeks / ((itWeeks + idariWeeks) || 1)), barCls: 'bg-cyan-500', labelCls: 'text-cyan-400' },
                      { label: 'İdari İhtiyacı', weeks: [...idariMandatory].reduce((s, e) => s + getEntityDurationWeeks(e), 0), cap: totalCapacityWeeks * (idariWeeks / ((itWeeks + idariWeeks) || 1)), barCls: 'bg-indigo-500', labelCls: 'text-indigo-400' },
                      { label: 'Genel Doluluk', weeks: totalNeeded, cap: totalCapacityWeeks, barCls: overallPct >= 90 ? 'bg-red-500' : overallPct >= 70 ? 'bg-amber-500' : 'bg-emerald-500', labelCls: 'text-slate-300' },
                    ].map(({ label, weeks, cap, barCls, labelCls }) => {
                      const pct = Math.min(100, Math.round((weeks / (cap || 1)) * 100));
                      return (
                        <div key={label}>
                          <div className="flex items-center justify-between mb-1">
                            <span className={clsx('text-[9px] font-semibold uppercase tracking-wide', labelCls)}>{label}</span>
                            <span className="text-[10px] font-bold text-white">{pct}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div className={clsx('h-full rounded-full transition-all', barCls)} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* Duration config panel */}
                {showDurationConfig && (
                  <div className="pt-4 border-t border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-3 font-bold">Denetim Süresi Ayarları — Hafta Cinsinden</div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {DURATION_GROUPS.map(g => (
                        <div key={g.key} className="bg-slate-700/60 rounded-xl p-3">
                          <div className={clsx('text-[9px] font-bold mb-2.5', g.color)}>{g.label}</div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => setAuditDurations(d => ({ ...d, [g.key]: Math.max(1, (d[g.key] ?? 2) - 1) }))} className="w-6 h-6 flex items-center justify-center rounded-md bg-slate-600 text-slate-300 hover:bg-slate-500 transition-colors"><ChevronDown size={11} /></button>
                            <span className="flex-1 text-center text-sm font-black text-white">{auditDurations[g.key] ?? 2}</span>
                            <button onClick={() => setAuditDurations(d => ({ ...d, [g.key]: Math.min(12, (d[g.key] ?? 2) + 1) }))} className="w-6 h-6 flex items-center justify-center rounded-md bg-slate-600 text-slate-300 hover:bg-slate-500 transition-colors"><ChevronUp size={11} /></button>
                          </div>
                          <div className="text-[8px] text-slate-500 text-center mt-1">hafta</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Capacity warning */}
                {overCapacity && (
                  <div className="flex items-center gap-2 p-2.5 bg-red-500/20 border border-red-500/40 rounded-lg text-red-300 text-xs">
                    <AlertCircle size={14} />
                    Zorunlu denetimler kapasiteyi aşıyor! Müfettiş sayısını artırın veya çalışma haftasını genişletin.
                    <strong className="ml-1">({(mandatoryWeeksTotal - totalCapacityWeeks).toFixed(0)} hafta açık)</strong>
                  </div>
                )}
              </div>

              {/* ━━━ 2. KATEGORİ + MOD SEKMELERİ ━━━ */}
              <div className="px-5 py-3 border-b border-slate-200 bg-white flex items-center flex-wrap gap-3">

                {/* IT / İdari tabs */}
                <div className="flex items-center gap-0.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setCategoryFilter('IT')}
                    className={clsx(
                      'flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all',
                      categoryFilter === 'IT' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
                    )}
                  >
                    <Monitor size={12} />
                    BT (IT)
                    <span className={clsx('px-1.5 py-0.5 rounded text-[9px] font-bold', categoryFilter === 'IT' ? 'bg-white/20 text-white' : 'bg-cyan-100 text-cyan-700')}>
                      {itMandatory.length + itAgile.length}
                    </span>
                  </button>
                  <button
                    onClick={() => setCategoryFilter('İdari')}
                    className={clsx(
                      'flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all',
                      categoryFilter === 'İdari' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
                    )}
                  >
                    <Shield size={12} />
                    İdari
                    <span className={clsx('px-1.5 py-0.5 rounded text-[9px] font-bold', categoryFilter === 'İdari' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700')}>
                      {idariMandatory.length + idariAgile.length}
                    </span>
                  </button>
                </div>

                <div className="w-px h-6 bg-slate-200" />

                {/* Zorunlu / Agile mode tabs */}
                <div className="flex items-center gap-0.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setPlanMode('mode1_core')}
                    className={clsx(
                      'flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all',
                      planMode === 'mode1_core' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
                    )}
                  >
                    <Lock size={12} />
                    Zorunlu Güvence
                    <span className={clsx('px-1.5 py-0.5 rounded text-[9px] font-bold', planMode === 'mode1_core' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-700')}>
                      {(categoryFilter === 'IT' ? itMandatory : idariMandatory).length}
                    </span>
                  </button>
                  <button
                    onClick={() => setPlanMode('mode2_agile')}
                    className={clsx(
                      'flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all',
                      planMode === 'mode2_agile' ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
                    )}
                  >
                    <RefreshCw size={12} />
                    Agile Rotasyon
                    <span className={clsx('px-1.5 py-0.5 rounded text-[9px] font-bold', planMode === 'mode2_agile' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700')}>
                      {(categoryFilter === 'IT' ? itAgile : idariAgile).length}
                    </span>
                  </button>
                </div>

                <div className="ml-auto flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Denetim ara..."
                    value={planMode === 'mode1_core' ? searchMode1 : searchMode2}
                    onChange={e => planMode === 'mode1_core' ? setSearchMode1(e.target.value) : setSearchMode2(e.target.value)}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-400 bg-white w-40"
                  />
                  <button
                    onClick={() => setSortDesc(v => !v)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    {sortDesc ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                    Risk {sortDesc ? '↓' : '↑'}
                  </button>
                </div>
              </div>

              {/* ━━━ 3. ZORUNLU GÜVENLİK ━━━ */}
              {planMode === 'mode1_core' && (
                <div className="p-5">
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {[
                      { label: 'Toplam Zorunlu', value: currentMandatory.length, icon: List, color: 'text-slate-700', bg: 'bg-slate-50' },
                      { label: 'Planlandı', value: currentMandatory.filter(e => plannedIds.has(e.id)).length, icon: Check, color: 'text-emerald-700', bg: 'bg-emerald-50' },
                      { label: 'Planlanmadı', value: currentMandatory.filter(e => !plannedIds.has(e.id)).length, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
                      { label: 'Hafta İhtiyacı', value: `${currentMandatory.reduce((s, e) => s + getEntityDurationWeeks(e), 0)} hf`, icon: Clock, color: 'text-indigo-700', bg: 'bg-indigo-50' },
                    ].map(({ label, value, icon: Icon, color, bg }) => (
                      <div key={label} className={clsx('border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3', bg)}>
                        <Icon size={15} className={color} />
                        <div>
                          <div className="text-[10px] text-slate-500">{label}</div>
                          <div className={clsx('text-xl font-black', color)}>{value}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {loadingEntities ? (
                    <div className="flex items-center justify-center py-12 gap-3 text-slate-400">
                      <Loader2 size={20} className="animate-spin" /><span className="text-sm">Yükleniyor...</span>
                    </div>
                  ) : currentMandatory.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <Lock size={36} className="mx-auto mb-3 opacity-20" />
                      <p className="text-sm">Bu kategoride zorunlu denetim bulunamadı</p>
                      <p className="text-xs mt-1">Denetim Evreni'nde varlıkları "Zorunlu" olarak işaretleyin</p>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wide">Risk</th>
                            <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wide">Varlık</th>
                            <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wide hidden md:table-cell">Tip</th>
                            <th className="px-3 py-2.5 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wide">Süre</th>
                            <th className="px-3 py-2.5 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wide">İşlem</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentMandatory.map(e => (
                            <EntityRow key={e.id} entity={e} isPlanned={plannedIds.has(e.id)} isDraft={draftItems.has(e.id)} durationWeeks={getEntityDurationWeeks(e)} />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ━━━ 4. AGİLE ROTASYON ━━━ */}
              {planMode === 'mode2_agile' && (
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                    <RefreshCw size={14} className="text-indigo-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 text-xs text-indigo-700">
                      <strong>Agile Kapasite:</strong>{' '}
                      {agileCapacityWeeks.toFixed(0)} hafta mevcut · {agileEntitiesFit} varlık sığar ·{' '}
                      Risk ≥70 → Yıllık · ≥45 → 2 Yıllık · &lt;45 → 3 Yıllık
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-black text-indigo-800">{currentAgile.filter(e => plannedIds.has(e.id)).length}/{Math.min(agileEntitiesFit, currentAgile.length)}</div>
                      <div className="text-[9px] text-indigo-500">Planlandı</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {[
                      { label: 'Yıllık Öneri', value: currentAgile.filter(e => e.riskScore >= 70).length, color: 'text-red-600', bg: 'bg-red-50' },
                      { label: '2 Yıllık', value: currentAgile.filter(e => e.riskScore >= 45 && e.riskScore < 70).length, color: 'text-amber-600', bg: 'bg-amber-50' },
                      { label: '3 Yıllık', value: currentAgile.filter(e => e.riskScore < 45).length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                      { label: 'Planlandı', value: currentAgile.filter(e => plannedIds.has(e.id)).length, color: 'text-indigo-700', bg: 'bg-indigo-50' },
                    ].map(({ label, value, color, bg }) => (
                      <div key={label} className={clsx('border border-slate-200 rounded-xl px-4 py-3', bg)}>
                        <div className="text-[10px] text-slate-500">{label}</div>
                        <div className={clsx('text-xl font-black', color)}>{value}</div>
                      </div>
                    ))}
                  </div>

                  {loadingEntities ? (
                    <div className="flex items-center justify-center py-12 gap-3 text-slate-400">
                      <Loader2 size={20} className="animate-spin" /><span className="text-sm">Yükleniyor...</span>
                    </div>
                  ) : currentAgile.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <RefreshCw size={36} className="mx-auto mb-3 opacity-20" />
                      <p className="text-sm">Bu kategoride rotasyon denetimi bulunamadı</p>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wide">Risk</th>
                            <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wide">Varlık</th>
                            <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wide hidden md:table-cell">Tip</th>
                            <th className="px-3 py-2.5 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wide">Süre</th>
                            <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Rotasyon</th>
                            <th className="px-3 py-2.5 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wide">İşlem</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentAgile.map(e => (
                            <EntityRow key={e.id} entity={e} isPlanned={plannedIds.has(e.id)} isDraft={draftItems.has(e.id)} showSuggestion durationWeeks={getEntityDurationWeeks(e)} />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ━━━ 5. 12 AYLIK PLAN DAĞILIMI ━━━ */}
              <div className="p-5 border-t border-slate-100 bg-gradient-to-b from-slate-50 to-white">
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <CalendarRange size={15} className="text-indigo-500" />
                  <h4 className="text-sm font-bold text-slate-800">12 Aylık Plan Dağılımı</h4>
                  <span className="text-[10px] text-slate-400">— Q1 öncelikli · Zorunlu tüm yıl · Agile kapasite oranında</span>
                  <div className="ml-auto flex items-center gap-3 text-[10px]">
                    <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 bg-rose-500 rounded-sm" />Zorunlu</span>
                    <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 bg-blue-500 rounded-sm" />Agile</span>
                    <span className="flex items-center gap-1 font-bold text-indigo-600"><span className="inline-block w-2.5 h-2.5 bg-indigo-600 rounded-sm" />Q1</span>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-1.5">
                  {MONTHS.map((month, i) => {
                    const mand = annualPlanSummary.monthlyMandatory[i];
                    const agile = annualPlanSummary.monthlyAgile[i];
                    const pct = annualPlanSummary.monthPct[i];
                    const isQ1 = i < 3;
                    return (
                      <div key={month} className={clsx('rounded-xl overflow-hidden border transition-shadow hover:shadow-md', isQ1 ? 'border-indigo-300 shadow-sm shadow-indigo-100' : 'border-slate-200')}>
                        <div className={clsx('px-2 py-1.5 text-center', isQ1 ? 'bg-gradient-to-r from-indigo-600 to-indigo-500' : 'bg-slate-100')}>
                          <div className={clsx('text-[10px] font-black', isQ1 ? 'text-white' : 'text-slate-600')}>{month}</div>
                          {isQ1 && <div className="text-[8px] text-indigo-200">Q1</div>}
                        </div>
                        <div className="bg-white px-2 py-2 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] text-rose-500 font-bold">Z</span>
                            <span className={clsx('text-[10px] font-black', mand > 0 ? 'text-rose-600' : 'text-slate-200')}>{mand}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] text-blue-500 font-bold">A</span>
                            <span className={clsx('text-[10px] font-black', agile > 0 ? 'text-blue-600' : 'text-slate-200')}>{agile}</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={clsx('h-full rounded-full', isQ1 ? 'bg-indigo-500' : 'bg-slate-400')} style={{ width: `${pct}%` }} />
                          </div>
                          <div className="text-[8px] text-slate-400 text-center">{pct}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500">
                  <span>
                    Toplam: <strong className="text-slate-700">{annualPlanSummary.monthlyMandatory.reduce((s, n) => s + n, 0)}</strong> zorunlu +{' '}
                    <strong className="text-slate-700">{annualPlanSummary.monthlyAgile.reduce((s, n) => s + n, 0)}</strong> agile ={' '}
                    <strong className="text-slate-900">{annualPlanSummary.monthlyMandatory.reduce((s, n) => s + n, 0) + annualPlanSummary.monthlyAgile.reduce((s, n) => s + n, 0)}</strong> denetim
                  </span>
                  <span className="text-slate-400">{annualPlanSummary.monthlyWeeks.reduce((s, n) => s + n, 0).toFixed(0)} hafta · {itPool.length + idariPool.length} müfettiş · %{utilizationPct} doluluk</span>
                </div>
              </div>

              {/* ━━━ TASLAK PLAN PANELİ ━━━ */}
              {isDraftPanelOpen && draftItems.size > 0 && (
                <div className="p-5 border-t-2 border-emerald-200 bg-emerald-50/50">
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <ClipboardList size={15} className="text-emerald-600" />
                    <h4 className="text-sm font-bold text-slate-800">Taslak Plan</h4>
                    <span className="text-[10px] text-slate-400">— {draftItems.size} denetim öğesi seçildi</span>
                    <div className="ml-auto flex items-center gap-2">
                      {(itPool.length > 0 || idariPool.length > 0) && (
                        <button
                          onClick={autoAssignAuditors}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
                        >
                          <UserCheck size={12} /> Otomatik Ata
                        </button>
                      )}
                      <button
                        onClick={createDraftPlan}
                        disabled={isSavingDraft}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isSavingDraft ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                        {isSavingDraft ? 'Oluşturuluyor...' : 'Plan Oluştur & Onaya Gönder'}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-emerald-200 overflow-hidden bg-white">
                    <table className="w-full">
                      <thead className="bg-emerald-50 border-b border-emerald-100">
                        <tr>
                          <th className="px-3 py-2 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wide">Varlık</th>
                          <th className="px-3 py-2 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wide hidden md:table-cell">Kategori</th>
                          <th className="px-3 py-2 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wide">Risk</th>
                          <th className="px-3 py-2 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wide">Süre</th>
                          <th className="px-3 py-2 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wide">Atanan Müfettiş</th>
                          <th className="px-3 py-2 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wide">Kaldır</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from(draftItems.values()).map(item => {
                          const audPool = item.entity.entity_category === 'IT' ? itPool : idariPool;
                          return (
                            <tr key={item.entity.id} className="border-b border-emerald-50 hover:bg-emerald-50/30 transition-colors">
                              <td className="px-3 py-2.5">
                                <div className="font-semibold text-slate-800 text-xs">{item.entity.name}</div>
                                <div className="text-[9px] text-slate-400 font-mono">{item.entity.path}</div>
                              </td>
                              <td className="px-3 py-2.5 hidden md:table-cell">
                                <span className={clsx('px-1.5 py-0.5 rounded border text-[9px] font-bold', item.entity.entity_category === 'IT' ? 'bg-cyan-50 text-cyan-700 border-cyan-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200')}>
                                  {item.entity.entity_category}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                <span className={clsx('text-xs font-black', item.entity.riskScore >= 60 ? 'text-red-600' : item.entity.riskScore >= 40 ? 'text-amber-600' : 'text-emerald-600')}>{item.entity.riskScore}</span>
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                <div className="flex items-center gap-0.5 justify-center">
                                  <button onClick={() => setDraftItems(prev => { const next = new Map(prev); const it = next.get(item.entity.id); if (it) next.set(item.entity.id, { ...it, durationWeeks: Math.max(1, it.durationWeeks - 1) }); return next; })} className="w-4 h-4 flex items-center justify-center rounded text-slate-400 hover:bg-slate-100"><ChevronDown size={9} /></button>
                                  <span className="w-8 text-center text-xs font-bold text-indigo-700">{item.durationWeeks}hf</span>
                                  <button onClick={() => setDraftItems(prev => { const next = new Map(prev); const it = next.get(item.entity.id); if (it) next.set(item.entity.id, { ...it, durationWeeks: Math.min(12, it.durationWeeks + 1) }); return next; })} className="w-4 h-4 flex items-center justify-center rounded text-slate-400 hover:bg-slate-100"><ChevronUp size={9} /></button>
                                </div>
                              </td>
                              <td className="px-3 py-2.5">
                                <select
                                  value={item.assignedAuditorId ?? ''}
                                  onChange={e => {
                                    const aud = audPool.find(a => a.id === e.target.value);
                                    setDraftItems(prev => { const next = new Map(prev); const it = next.get(item.entity.id); if (it) next.set(item.entity.id, { ...it, assignedAuditorId: e.target.value || null, assignedAuditorName: aud?.name ?? null }); return next; });
                                  }}
                                  className="text-[10px] border border-slate-200 rounded-lg px-1.5 py-1 bg-white text-slate-700 focus:outline-none focus:border-indigo-400 max-w-[130px]"
                                >
                                  <option value="">— Seç —</option>
                                  {audPool.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                              </td>
                              <td className="px-3 py-2.5 text-right">
                                <button onClick={() => removeFromDraft(item.entity.id)} className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                                  <Minus size={11} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <div className="px-4 py-2.5 bg-emerald-50 border-t border-emerald-100 flex items-center justify-between text-xs text-slate-600">
                      <span>
                        Toplam: <strong>{Array.from(draftItems.values()).reduce((s, i) => s + i.durationWeeks, 0)}</strong> hafta ·{' '}
                        <strong>{Array.from(draftItems.values()).reduce((s, i) => s + i.durationWeeks * 40, 0)}</strong> adam-saat
                      </span>
                      <span className="text-slate-400">{thisYear} planı · {draftItems.size} denetim</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>

      {/* ── Inspector Picker Modal ─────────────────────────────────────── */}
      {showInspectorPicker && (
        <InspectorPickerModal
          category={showInspectorPicker}
          currentPool={showInspectorPicker === 'IT' ? itPool : idariPool}
          onSave={showInspectorPicker === 'IT' ? setItPool : setIdariPool}
          onClose={() => setShowInspectorPicker(null)}
        />
      )}

      {/* ── Quick Plan Modal ─────────────────────────────────────────────── */}
      {quickPlanForm && (
        <QuickPlanModal
          form={quickPlanForm}
          activePlanId={activePlan?.id ?? null}
          onClose={() => setQuickPlanForm(null)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['audit-engagements-list'] })}
        />
      )}

      {/* ── BDDK Modal ───────────────────────────────────────────────────── */}
      <BDDKPackageModal isOpen={showBDDKModal} onClose={() => setShowBDDKModal(false)} />
    </div>
  );
}
