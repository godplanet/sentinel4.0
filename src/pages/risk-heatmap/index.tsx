import {
  useCreateAssessment,
  useHeatmapData,
  useRiskDefinitions
} from '@/entities/risk/heatmap-api';
import type { AssessmentWithDetails, CreateAssessmentInput } from '@/entities/risk/heatmap-types';
import { useAuditEntities } from '@/entities/universe';
import type { AuditEntity } from '@/entities/universe/model/types';
import { PageHeader } from '@/shared/ui';
import { StrategicHeatmap } from '@/widgets/StrategicHeatmap';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  Grid3x3,
  Loader2,
  Plus,
  Shield,
  X,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

// ── Risk level helper ────────────────────────────────────────────────────────
function riskLevel(score: number) {
  if (score >= 15) return { label: 'Kritik', cls: 'bg-red-100 text-red-800 border-red-300' };
  if (score >= 10) return { label: 'Yüksek', cls: 'bg-orange-100 text-orange-800 border-orange-300' };
  if (score >= 5)  return { label: 'Orta',   cls: 'bg-amber-100 text-amber-800 border-amber-300' };
  return               { label: 'Düşük',  cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
}

// ── Entity type display helpers ──────────────────────────────────────────────
function entityTypeLabel(type: string) {
  if (type === 'HEADQUARTERS') return { label: 'HQ',   cls: 'bg-slate-100 text-slate-600' };
  if (type === 'DEPARTMENT')   return { label: 'GMY',  cls: 'bg-sky-100 text-sky-700' };
  if (type === 'UNIT')         return { label: 'Birim',cls: 'bg-emerald-100 text-emerald-700' };
  if (type === 'BRANCH')       return { label: 'Şube', cls: 'bg-rose-100 text-rose-700' };
  return { label: type, cls: 'bg-slate-100 text-slate-500' };
}

// ── EntityRiskTable ──────────────────────────────────────────────────────────
interface TNode {
  path: string;
  label: string;
  entity?: AuditEntity;
  children: TNode[];
}

function EntityRiskTable({ onAssess }: { onAssess: (entityId: string) => void }) {
  const { data: entities = [], isLoading: entLoading } = useAuditEntities();
  const { data: assessments = [] } = useHeatmapData();

  // Latest assessment per entity_id
  const assessmentMap = useMemo(() => {
    const map = new Map<string, AssessmentWithDetails>();
    for (const a of assessments) {
      if (!map.has(a.entity_id)) map.set(a.entity_id, a);
    }
    return map;
  }, [assessments]);

  // Build virtual tree from entity paths
  const roots = useMemo(() => {
    const nodeMap = new Map<string, TNode>();
    const getNode = (path: string): TNode => {
      if (!nodeMap.has(path)) nodeMap.set(path, { path, label: path.split('.').pop() || path, children: [] });
      return nodeMap.get(path)!;
    };
    entities.forEach(e => {
      const node = getNode(e.path);
      node.entity = e;
      node.label = e.name;
      const parts = e.path.split('.');
      for (let i = 1; i < parts.length; i++) getNode(parts.slice(0, i).join('.'));
    });
    nodeMap.forEach(node => {
      const parts = node.path.split('.');
      if (parts.length > 1) {
        const parent = getNode(parts.slice(0, -1).join('.'));
        if (!parent.children.find(ch => ch.path === node.path)) parent.children.push(node);
      }
    });
    nodeMap.forEach(node => node.children.sort((a, b) => a.path.localeCompare(b.path)));
    return Array.from(nodeMap.values())
      .filter(n => !n.path.includes('.'))
      .sort((a, b) => a.path.localeCompare(b.path));
  }, [entities]);

  // Default: expand root and org.hq
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(['org', 'org.hq']));
  const toggle = (path: string) => setExpanded(prev => {
    const next = new Set(prev);
    next.has(path) ? next.delete(path) : next.add(path);
    return next;
  });

  const collectLeaves = (node: TNode): AuditEntity[] => {
    if (node.children.length === 0 && node.entity) return [node.entity];
    return node.children.flatMap(ch => collectLeaves(ch));
  };

  const renderNode = (node: TNode, depth: number): React.ReactNode => {
    const isGroup = node.children.length > 0;
    const isExpanded = expanded.has(node.path);
    const indent = depth * 16;

    if (isGroup) {
      const leaves = collectLeaves(node);
      const assessed = leaves.map(e => assessmentMap.get(e.id)).filter(Boolean) as AssessmentWithDetails[];
      const n = assessed.length;
      const avgOf = (fn: (a: AssessmentWithDetails) => number): number | null =>
        n > 0 ? assessed.reduce((s, a) => s + fn(a), 0) / n : null;

      const avgImpact    = avgOf(a => a.impact);
      const avgLikelihood= avgOf(a => a.likelihood);
      const avgInherent  = avgOf(a => a.inherent_risk_score);
      const avgControl   = avgOf(a => a.control_effectiveness * 100);
      const avgResidual  = avgOf(a => a.residual_score);

      const isRoot = depth === 0;
      const rowBg = isRoot
        ? 'bg-sky-50/90 border-b border-sky-200 hover:bg-sky-100/80'
        : 'bg-slate-50/70 border-b border-slate-100 hover:bg-slate-100/60';
      const textCls = isRoot ? 'text-sky-800 font-bold text-xs' : 'text-slate-700 font-semibold text-xs';

      return (
        <React.Fragment key={node.path}>
          <tr className={`${rowBg} cursor-pointer transition-colors`} onClick={() => toggle(node.path)}>
            <td className="px-3 py-2" style={{ paddingLeft: (12 + indent) + 'px' }}>
              <div className="flex items-center gap-1.5">
                <ChevronRight size={11} className={clsx('text-sky-500 transition-transform flex-shrink-0', isExpanded && 'rotate-90')} />
                <div>
                  <div className={textCls}>{node.label}</div>
                  <div className="text-[9px] text-slate-400 font-mono">{leaves.length} birim{n > 0 ? ` · ${n} değerlendirme` : ' · değerlendirme yok'}</div>
                </div>
              </div>
            </td>
            <td className="px-3 py-2 text-center"><span className="text-[9px] text-slate-400">—</span></td>
            <td className="px-3 py-2 text-center">
              {avgImpact !== null
                ? <><span className="font-bold text-xs text-slate-600">{avgImpact.toFixed(1)}</span><div className="text-[9px] text-slate-400">ort.</div></>
                : <span className="text-[9px] text-slate-400">—</span>}
            </td>
            <td className="px-3 py-2 text-center">
              {avgLikelihood !== null
                ? <><span className="font-bold text-xs text-slate-600">{avgLikelihood.toFixed(1)}</span><div className="text-[9px] text-slate-400">ort.</div></>
                : <span className="text-[9px] text-slate-400">—</span>}
            </td>
            <td className="px-3 py-2 text-center">
              {avgInherent !== null
                ? <span className={clsx('font-black text-sm', avgInherent >= 15 ? 'text-red-600' : avgInherent >= 10 ? 'text-orange-600' : avgInherent >= 5 ? 'text-amber-600' : 'text-emerald-600')}>{avgInherent.toFixed(1)}</span>
                : <span className="text-[9px] text-slate-400">—</span>}
            </td>
            <td className="px-3 py-2">
              {avgControl !== null
                ? <div className="flex items-center gap-1.5 justify-center">
                    <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-400 rounded-full" style={{ width: avgControl + '%' }} /></div>
                    <span className="font-medium text-xs text-slate-600">%{avgControl.toFixed(0)}</span>
                  </div>
                : <span className="text-[9px] text-slate-400 block text-center">—</span>}
            </td>
            <td className="px-3 py-2 text-center">
              {avgResidual !== null
                ? <span className="font-bold text-xs text-slate-600">{avgResidual.toFixed(1)}</span>
                : <span className="text-[9px] text-slate-400">—</span>}
            </td>
            <td className="px-3 py-2 text-center">
              {avgInherent !== null
                ? <span className={clsx('px-1.5 py-0.5 rounded border text-[9px] font-bold', riskLevel(avgInherent).cls)}>{riskLevel(avgInherent).label}</span>
                : <span className="text-[9px] text-slate-400">—</span>}
            </td>
          </tr>
          {isExpanded && node.children.map(ch => renderNode(ch, depth + 1))}
        </React.Fragment>
      );
    }

    // Leaf entity row
    const entity = node.entity;
    if (!entity) return null;
    const assessment = assessmentMap.get(entity.id);
    const inh = assessment?.inherent_risk_score ?? null;
    const res = assessment?.residual_score ?? null;
    const ctrl = assessment != null ? assessment.control_effectiveness * 100 : null;
    const lvl = inh !== null ? riskLevel(inh) : null;
    const typeMeta = entityTypeLabel(entity.type);

    return (
      <tr key={entity.id} className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors">
        <td className="px-3 py-2 font-medium text-slate-700 text-xs" style={{ paddingLeft: (12 + indent + 14) + 'px' }}>
          {entity.name}
        </td>
        <td className="px-3 py-2">
          <span className={clsx('px-1.5 py-0.5 rounded text-[9px] font-bold', typeMeta.cls)}>{typeMeta.label}</span>
        </td>
        <td className="px-3 py-2 text-center">
          {assessment
            ? <><span className="font-bold text-xs text-slate-700">{assessment.impact}</span><span className="text-slate-300 text-[9px]">/5</span></>
            : <span className="text-slate-300 text-xs">—</span>}
        </td>
        <td className="px-3 py-2 text-center">
          {assessment
            ? <><span className="font-bold text-xs text-slate-700">{assessment.likelihood}</span><span className="text-slate-300 text-[9px]">/5</span></>
            : <span className="text-slate-300 text-xs">—</span>}
        </td>
        <td className="px-3 py-2 text-center">
          {inh !== null
            ? <><span className={clsx('font-black text-sm', inh >= 15 ? 'text-red-600' : inh >= 10 ? 'text-orange-600' : inh >= 5 ? 'text-amber-600' : 'text-emerald-600')}>{inh}</span><span className="text-slate-300 text-[9px]">/25</span></>
            : <span className="text-slate-300 text-xs">—</span>}
        </td>
        <td className="px-3 py-2">
          {ctrl !== null
            ? <div className="flex items-center gap-1.5 justify-center">
                <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: ctrl + '%' }} /></div>
                <span className="font-medium text-xs text-slate-600">%{ctrl.toFixed(0)}</span>
              </div>
            : <div className="flex justify-center">
                <button
                  onClick={() => onAssess(entity.id)}
                  className="px-2 py-0.5 text-[10px] font-bold bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Değerlendir
                </button>
              </div>}
        </td>
        <td className="px-3 py-2 text-center">
          {res !== null
            ? <span className={clsx('font-bold text-sm', res >= 7 ? 'text-red-600' : res >= 4 ? 'text-amber-600' : 'text-emerald-600')}>{res.toFixed(1)}</span>
            : <span className="text-slate-300 text-xs">—</span>}
        </td>
        <td className="px-3 py-2 text-center">
          {lvl
            ? <span className={clsx('px-1.5 py-0.5 rounded border text-[9px] font-bold', lvl.cls)}>{lvl.label}</span>
            : <span className="text-slate-300 text-xs">—</span>}
        </td>
      </tr>
    );
  };

  if (entLoading) return (
    <div className="bg-surface border border-slate-200 rounded-xl shadow-sm flex items-center justify-center py-8">
      <Loader2 className="animate-spin text-slate-400" size={20} />
    </div>
  );

  return (
    <div className="bg-surface border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 bg-slate-50/60">
        <Shield size={14} className="text-blue-600" />
        <span className="text-sm font-bold text-slate-800">Varlık Risk Skorları</span>
        <span className="text-xs text-slate-400">({entities.length} varlık · {assessments.length} değerlendirme)</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/40 text-slate-500">
              <th className="text-left px-3 py-2 font-semibold">Varlık</th>
              <th className="text-left px-3 py-2 font-semibold">Tür</th>
              <th className="text-center px-3 py-2 font-semibold">Etki</th>
              <th className="text-center px-3 py-2 font-semibold">Olasılık</th>
              <th className="text-center px-3 py-2 font-semibold">Ham Risk</th>
              <th className="text-center px-3 py-2 font-semibold">Kontrol %</th>
              <th className="text-center px-3 py-2 font-semibold">Kalıntı</th>
              <th className="text-center px-3 py-2 font-semibold">Seviye</th>
            </tr>
          </thead>
          <tbody>
            {roots.map(root => renderNode(root, 0))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── RiskHeatmapPage ──────────────────────────────────────────────────────────
export default function RiskHeatmapPage() {
  const { data: assessments = [], isLoading } = useHeatmapData();
  const { data: riskDefs = [] } = useRiskDefinitions();
  const { data: entities = [] } = useAuditEntities();

  const [showNewModal, setShowNewModal] = useState(false);
  const [prefilledEntityId, setPrefilledEntityId] = useState<string | undefined>();

  const handleAssess = (entityId: string) => {
    setPrefilledEntityId(entityId);
    setShowNewModal(true);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-canvas">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-canvas">
      <PageHeader
        title="Risk Isı Haritası"
        subtitle={`Stratejik Radar & 5x5 Matris · ${assessments.length} değerlendirme`}
        icon={Grid3x3}
      />

      <div className="flex-1 overflow-auto p-4">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => { setPrefilledEntityId(undefined); setShowNewModal(true); }}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
          >
            <Plus size={14} />
            Yeni Değerlendirme
          </button>
        </div>

        <StrategicHeatmap />

        <div className="mt-4">
          <EntityRiskTable onAssess={handleAssess} />
        </div>
      </div>

      {showNewModal && (
        <NewAssessmentModal
          riskDefs={riskDefs}
          entities={entities}
          prefilledEntityId={prefilledEntityId}
          onClose={() => { setShowNewModal(false); setPrefilledEntityId(undefined); }}
        />
      )}
    </div>
  );
}

// ── NewAssessmentModal ───────────────────────────────────────────────────────
function NewAssessmentModal({
  riskDefs,
  entities,
  prefilledEntityId,
  onClose,
}: {
  riskDefs: { id: string; title: string; category: string }[];
  entities: { id: string; name: string; type: string }[];
  prefilledEntityId?: string;
  onClose: () => void;
}) {
  const createAssessment = useCreateAssessment();
  const [form, setForm] = useState<CreateAssessmentInput>({
    entity_id: prefilledEntityId ?? '',
    risk_id: '',
    impact: 3,
    likelihood: 3,
    control_effectiveness: 0.5,
    justification: '',
  });

  const handleSubmit = async () => {
    if (!form.entity_id || !form.risk_id) return;
    await createAssessment.mutateAsync(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg p-4"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Shield size={18} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-primary">Yeni Risk Değerlendirmesi</h2>
              <p className="text-xs text-slate-500">Varlığa risk atayarak heatmap'i güncelleyin</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Varlık</label>
            <select
              value={form.entity_id}
              onChange={e => setForm(f => ({ ...f, entity_id: e.target.value }))}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Varlık seçin...</option>
              {(entities || []).map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.type})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Risk</label>
            <select
              value={form.risk_id}
              onChange={e => setForm(f => ({ ...f, risk_id: e.target.value }))}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Risk seçin...</option>
              {(riskDefs || []).map(r => (
                <option key={r.id} value={r.id}>{r.title} ({r.category})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Etki (1-5)</label>
              <input
                type="number" min={1} max={5} value={form.impact}
                onChange={e => setForm(f => ({ ...f, impact: Math.min(5, Math.max(1, +e.target.value)) }))}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-center font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Olasılık (1-5)</label>
              <input
                type="number" min={1} max={5} value={form.likelihood}
                onChange={e => setForm(f => ({ ...f, likelihood: Math.min(5, Math.max(1, +e.target.value)) }))}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-center font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Kontrol %</label>
              <input
                type="number" min={0} max={100} value={Math.round(form.control_effectiveness * 100)}
                onChange={e => setForm(f => ({ ...f, control_effectiveness: Math.min(1, Math.max(0, +e.target.value / 100)) }))}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-center font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="bg-canvas rounded-lg p-3 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Doğal Risk Skoru</span>
            <span className={clsx(
              'text-lg font-black',
              form.impact * form.likelihood >= 15 ? 'text-red-600' :
              form.impact * form.likelihood >= 10 ? 'text-orange-600' :
              form.impact * form.likelihood >= 5  ? 'text-yellow-600' : 'text-emerald-600'
            )}>
              {form.impact * form.likelihood}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Gerekçe</label>
            <textarea
              value={form.justification ?? ''}
              onChange={e => setForm(f => ({ ...f, justification: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Bu risk değerlendirmesinin gerekçeleri..."
            />
          </div>
        </div>

        <div className="flex gap-3 mt-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-lg font-semibold text-sm hover:bg-slate-200 transition-colors">
            İptal
          </button>
          <button
            onClick={handleSubmit}
            disabled={!form.entity_id || !form.risk_id || createAssessment.isPending}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {createAssessment.isPending && <Loader2 size={14} className="animate-spin" />}
            Kaydet
          </button>
        </div>
      </motion.div>
    </div>
  );
}
