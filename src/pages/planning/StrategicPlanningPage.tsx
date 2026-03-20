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
  ChevronDown,
  ChevronUp,
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
  Package,
  Plus,
  RefreshCw,
  Shield,
  ShieldAlert,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
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
  onPlan,
  showSuggestion,
}: {
  entity: EntityWithRisk;
  isPlanned: boolean;
  onPlan: (e: EntityWithRisk) => void;
  showSuggestion?: boolean;
}) {
  const rl = riskLevel(entity.riskScore);

  return (
    <tr className={clsx('border-b border-slate-100 transition-colors', isPlanned ? 'bg-emerald-50/40' : 'hover:bg-slate-50/80')}>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden flex-shrink-0">
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
        <div className="font-semibold text-slate-800 text-xs leading-tight">{entity.name}</div>
        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{entity.path}</div>
      </td>
      <td className="px-3 py-2.5 hidden md:table-cell">
        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono border border-slate-200">
          {entity.type}
        </span>
      </td>
      {showSuggestion && (
        <td className="px-3 py-2.5 hidden lg:table-cell">
          <span className="text-[10px] text-slate-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded font-medium">
            {rotationSuggestion(entity.riskScore)}
          </span>
        </td>
      )}
      <td className="px-3 py-2.5 text-right">
        {isPlanned ? (
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg font-bold">
            <Check size={10} /> Planlandı
          </span>
        ) : (
          <button
            onClick={() => onPlan(entity)}
            className="inline-flex items-center gap-1 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <Plus size={10} /> Planla
          </button>
        )}
      </td>
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StrategicPlanningPage() {
  const [activeTab, setActiveTab] = useState<TabId>('rolling');
  const [planMode, setPlanMode] = useState<PlanMode>('mode1_core');
  const [showBDDKModal, setShowBDDKModal] = useState(false);
  const [quickPlanForm, setQuickPlanForm] = useState<QuickPlanForm | null>(null);
  const [inspectors, setInspectors] = useState(5);
  const [hoursPerAudit, setHoursPerAudit] = useState(40);
  const [searchMode1, setSearchMode1] = useState('');
  const [searchMode2, setSearchMode2] = useState('');
  const [sortDesc, setSortDesc] = useState(true);
  const [closingId, setClosingId] = useState<string | null>(null);
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

  const ANNUAL_HOURS = 1920; // 48 weeks × 40 h
  const maxAudits = Math.floor(inspectors * ANNUAL_HOURS / hoursPerAudit);
  const thisYear = new Date().getFullYear();
  const plannedThisYear = engagements.filter(e => {
    const d = e.start_date ? new Date(e.start_date).getFullYear() : 0;
    return d === thisYear;
  });
  const plannedIds = new Set(plannedThisYear.map(e => e.entity_id).filter(Boolean));
  const capacityPct = Math.min(100, Math.round(plannedThisYear.length / (maxAudits || 1) * 100));

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
          {activeTab === 'annual' && <AnnualPlanView />}

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

              {/* ── Kapasite Paneli ─────────────────────────────────────── */}
              <div className="px-5 py-4 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700">
                <div className="flex flex-wrap items-center gap-6">
                  {/* Inputs */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-slate-400" />
                      <span className="text-[10px] text-slate-400 uppercase tracking-wide font-bold">Müfettiş</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setInspectors(v => Math.max(1, v - 1))} className="w-6 h-6 flex items-center justify-center rounded-md bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"><ChevronDown size={12} /></button>
                        <span className="w-8 text-center text-sm font-bold text-white">{inspectors}</span>
                        <button onClick={() => setInspectors(v => Math.min(50, v + 1))} className="w-6 h-6 flex items-center justify-center rounded-md bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"><ChevronUp size={12} /></button>
                      </div>
                    </div>
                    <div className="w-px h-8 bg-slate-700" />
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-slate-400" />
                      <span className="text-[10px] text-slate-400 uppercase tracking-wide font-bold">Denetim/Saat</span>
                      <input
                        type="number"
                        min={8}
                        max={500}
                        value={hoursPerAudit}
                        onChange={e => setHoursPerAudit(Number(e.target.value) || 40)}
                        className="w-16 bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-2 py-1 text-center focus:outline-none focus:border-indigo-400"
                      />
                    </div>
                  </div>

                  {/* Capacity indicators */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-center">
                        <div className="text-lg font-black text-white">{maxAudits}</div>
                        <div className="text-[9px] text-slate-400 uppercase tracking-wide">Max Denetim</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-center">
                        <div className="text-lg font-black text-emerald-400">{plannedThisYear.length}</div>
                        <div className="text-[9px] text-slate-400 uppercase tracking-wide">Planlı ({thisYear})</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-center">
                        <div className={clsx('text-lg font-black', maxAudits - plannedThisYear.length > 0 ? 'text-sky-400' : 'text-red-400')}>
                          {Math.max(0, maxAudits - plannedThisYear.length)}
                        </div>
                        <div className="text-[9px] text-slate-400 uppercase tracking-wide">Kalan Kapasite</div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] text-slate-400 uppercase tracking-wide">Kapasite Kullanımı</span>
                        <span className="text-[10px] font-bold text-white">{capacityPct}%</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={clsx('h-full rounded-full transition-all', capacityPct >= 90 ? 'bg-red-500' : capacityPct >= 70 ? 'bg-amber-500' : 'bg-emerald-500')}
                          style={{ width: `${capacityPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-3 text-[10px]">
                    <div className="flex items-center gap-1 text-red-400">
                      <Shield size={12} /> <span className="font-bold">{mandatoryEntities.length}</span> Zorunlu
                    </div>
                    <div className="flex items-center gap-1 text-blue-400">
                      <RefreshCw size={12} /> <span className="font-bold">{rotationEntities.length}</span> Rotasyon
                    </div>
                  </div>
                </div>

                {capacityPct >= 90 && (
                  <div className="mt-3 flex items-center gap-2 p-2.5 bg-red-500/20 border border-red-500/40 rounded-lg text-red-300 text-xs">
                    <AlertCircle size={14} /> Kapasite dolu! Müfettiş sayısını artırın veya bazı rotasyon denetimlerini sonraki yıla öteleyin.
                  </div>
                )}
              </div>

              {/* ── Mode Toggle ─────────────────────────────────────────── */}
              <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <button
                    onClick={() => setPlanMode('mode1_core')}
                    className={clsx(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                      planMode === 'mode1_core'
                        ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    <Shield size={14} />
                    Mod 1 — Zorunlu Güvence
                    <span className={clsx('px-1.5 py-0.5 rounded text-[10px] font-bold', planMode === 'mode1_core' ? 'bg-white/20' : 'bg-red-100 text-red-700')}>
                      {mandatoryEntities.length}
                    </span>
                  </button>
                  <button
                    onClick={() => setPlanMode('mode2_agile')}
                    className={clsx(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                      planMode === 'mode2_agile'
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    <Kanban size={14} />
                    Mod 2 — Agile Rotasyon
                    <span className={clsx('px-1.5 py-0.5 rounded text-[10px] font-bold', planMode === 'mode2_agile' ? 'bg-white/20' : 'bg-blue-100 text-blue-700')}>
                      {rotationEntities.length}
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSortDesc(v => !v)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    {sortDesc ? <TrendingDown size={13} /> : <TrendingUp size={13} />}
                    Risk {sortDesc ? 'Yüksek→Düşük' : 'Düşük→Yüksek'}
                  </button>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-white border border-slate-200 rounded-lg px-3 py-2">
                    <GitBranch size={12} /> 3+9 Model
                  </div>
                </div>
              </div>

              {/* ── Mode 1: Zorunlu Denetimler ──────────────────────────── */}
              {planMode === 'mode1_core' && (
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-100 rounded-xl">
                      <Shield size={16} className="text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Zorunlu Güvence Denetimleri</h3>
                      <p className="text-xs text-slate-500">Süreç denetimleri — yıllık olarak gerçekleştirilmesi zorunlu</p>
                    </div>
                    <div className="ml-auto">
                      <input
                        type="text"
                        placeholder="Denetim ara..."
                        value={searchMode1}
                        onChange={e => setSearchMode1(e.target.value)}
                        className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-400 bg-white w-44"
                      />
                    </div>
                  </div>

                  {loadingEntities ? (
                    <div className="flex items-center justify-center py-12 gap-3 text-slate-400">
                      <Loader2 size={20} className="animate-spin" /> <span className="text-sm">Yükleniyor...</span>
                    </div>
                  ) : mandatoryEntities.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <Shield size={36} className="mx-auto mb-3 opacity-20" />
                      <p className="text-sm">Zorunlu denetim bulunamadı</p>
                      <p className="text-xs mt-1">Denetim Evreni'nde varlıkları "Zorunlu" olarak işaretleyin</p>
                    </div>
                  ) : (
                    <>
                      {/* Summary bar */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {[
                          { label: 'Toplam Zorunlu', value: mandatoryEntities.length, icon: List, color: 'text-slate-700' },
                          { label: 'Planlandı', value: mandatoryEntities.filter(e => plannedIds.has(e.id)).length, icon: Check, color: 'text-emerald-700' },
                          { label: 'Planlanmadı', value: mandatoryEntities.filter(e => !plannedIds.has(e.id)).length, icon: AlertTriangle, color: 'text-red-600' },
                        ].map(({ label, value, icon: Icon, color }) => (
                          <div key={label} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3">
                            <Icon size={16} className={color} />
                            <div>
                              <div className="text-xs text-slate-500">{label}</div>
                              <div className={clsx('text-xl font-black', color)}>{value}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-xl border border-slate-200 overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                              <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wide">Risk Skoru</th>
                              <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wide">Varlık</th>
                              <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wide hidden md:table-cell">Tip</th>
                              <th className="px-3 py-2.5 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wide">İşlem</th>
                            </tr>
                          </thead>
                          <tbody>
                            {mandatoryEntities.map(e => (
                              <EntityRow
                                key={e.id}
                                entity={e}
                                isPlanned={plannedIds.has(e.id)}
                                onPlan={openPlanModal}
                              />
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ── Mode 2: Rotasyon Denetimleri ────────────────────────── */}
              {planMode === 'mode2_agile' && (
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-100 rounded-xl">
                      <Kanban size={16} className="text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Agile Rotasyon Denetimleri</h3>
                      <p className="text-xs text-slate-500">Risk skoruna göre sıralı — yüksek risk öne alınır</p>
                    </div>
                    <div className="ml-auto">
                      <input
                        type="text"
                        placeholder="Denetim ara..."
                        value={searchMode2}
                        onChange={e => setSearchMode2(e.target.value)}
                        className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-400 bg-white w-44"
                      />
                    </div>
                  </div>

                  {/* Rotation legend */}
                  <div className="flex items-center gap-3 mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-700">
                    <RefreshCw size={14} className="text-indigo-500 flex-shrink-0" />
                    <span><strong>Rotasyon önerisi:</strong> Risk ≥70 → Yıllık · Risk ≥45 → 2 Yılda Bir · Risk &lt;45 → 3 Yılda Bir</span>
                  </div>

                  {loadingEntities ? (
                    <div className="flex items-center justify-center py-12 gap-3 text-slate-400">
                      <Loader2 size={20} className="animate-spin" /> <span className="text-sm">Yükleniyor...</span>
                    </div>
                  ) : rotationEntities.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <Kanban size={36} className="mx-auto mb-3 opacity-20" />
                      <p className="text-sm">Rotasyon denetimi bulunamadı</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {[
                          { label: 'Yıllık Öneri', value: rotationEntities.filter(e => e.riskScore >= 70).length, color: 'text-red-600' },
                          { label: '2 Yıllık',     value: rotationEntities.filter(e => e.riskScore >= 45 && e.riskScore < 70).length, color: 'text-amber-600' },
                          { label: '3 Yıllık',     value: rotationEntities.filter(e => e.riskScore < 45).length, color: 'text-emerald-600' },
                        ].map(({ label, value, color }) => (
                          <div key={label} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                            <div className="text-xs text-slate-500">{label}</div>
                            <div className={clsx('text-xl font-black', color)}>{value}</div>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-xl border border-slate-200 overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                              <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wide">Risk Skoru</th>
                              <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wide">Varlık</th>
                              <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wide hidden md:table-cell">Tip</th>
                              <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Rotasyon Önerisi</th>
                              <th className="px-3 py-2.5 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wide">İşlem</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rotationEntities.map(e => (
                              <EntityRow
                                key={e.id}
                                entity={e}
                                isPlanned={plannedIds.has(e.id)}
                                onPlan={openPlanModal}
                                showSuggestion
                              />
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

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
