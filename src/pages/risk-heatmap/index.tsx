import { useHeatmapData } from '@/entities/risk/heatmap-api';
import type { AssessmentWithDetails } from '@/entities/risk/heatmap-types';
import { useAuditEntities } from '@/entities/universe';
import type { AuditEntity } from '@/entities/universe/model/types';
import { PageHeader } from '@/shared/ui';
import { StrategicHeatmap } from '@/widgets/StrategicHeatmap';
import clsx from 'clsx';
import {
  ChevronRight,
  Grid3x3,
  Loader2,
  Shield,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

// ── Risk level helper — Audit Universe renk sistemiyle uyumlu ────────────────
function riskLevel(score: number) {
  if (score >= 20) return { label: 'Bordo',  cls: 'bg-fuchsia-950 text-white border-fuchsia-900',      textCls: 'text-fuchsia-700' };
  if (score >= 15) return { label: 'Kritik', cls: 'bg-red-600 text-white border-red-700',              textCls: 'text-red-600'     };
  if (score >= 10) return { label: 'Yüksek', cls: 'bg-orange-500 text-white border-orange-600',        textCls: 'text-orange-600'  };
  if (score >= 5)  return { label: 'Orta',   cls: 'bg-yellow-400 text-slate-900 border-yellow-500',    textCls: 'text-amber-600'   };
  return               { label: 'Düşük',  cls: 'bg-emerald-100 text-emerald-800 border-emerald-200', textCls: 'text-emerald-600' };
}

// ── Entity type badge (Tür kolonu için) ──────────────────────────────────────
const ENTITY_TYPE_BADGES: Record<string, { label: string; badgeCls: string }> = {
  HOLDING:      { label: 'Holding',    badgeCls: 'bg-purple-100 text-purple-700 border-purple-200' },
  BANK:         { label: 'Banka',      badgeCls: 'bg-blue-100 text-blue-700 border-blue-200' },
  GROUP:        { label: 'Grup',       badgeCls: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  HEADQUARTERS: { label: 'GMY',        badgeCls: 'bg-slate-200 text-slate-700 border-slate-300' },
  UNIT:         { label: 'Birim',      badgeCls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  DEPARTMENT:   { label: 'Departman',  badgeCls: 'bg-teal-100 text-teal-700 border-teal-200' },
  BRANCH:       { label: 'Şube',       badgeCls: 'bg-amber-100 text-amber-700 border-amber-200' },
  PROCESS:      { label: 'Süreç',      badgeCls: 'bg-orange-100 text-orange-700 border-orange-200' },
  SUBSIDIARY:   { label: 'İştirak',    badgeCls: 'bg-rose-100 text-rose-700 border-rose-200' },
  VENDOR:       { label: 'Tedarikçi',  badgeCls: 'bg-violet-100 text-violet-700 border-violet-200' },
  IT_ASSET:     { label: 'BT Varlığı', badgeCls: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
};
function entityTypeLabel(type: string) {
  return ENTITY_TYPE_BADGES[type] ?? { label: type, badgeCls: 'bg-slate-100 text-slate-500 border-slate-200' };
}

// ── Audit Universe ile aynı path-prefix renk sistemi (inline hex) ─────────────
// org=sky · proc=amber · prod=emerald · sub=rose · tp=violet · default=slate
const CAT_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  org:  { bg: '#f0f9ff', border: '#bae6fd', text: '#075985' },
  proc: { bg: '#fffbeb', border: '#fde68a', text: '#92400e' },
  prod: { bg: '#ecfdf5', border: '#a7f3d0', text: '#065f46' },
  sub:  { bg: '#fff1f2', border: '#fecdd3', text: '#9f1239' },
  tp:   { bg: '#f5f3ff', border: '#ddd6fe', text: '#5b21b6' },
};
const CAT_DEFAULT = { bg: '#f8fafc', border: '#e2e8f0', text: '#334155' };

function getCatStyle(nodePath: string, depth: number) {
  const prefix = nodePath.split('.')[0];
  const c = CAT_STYLES[prefix] ?? CAT_DEFAULT;
  return {
    groupBg: depth === 0 ? c.bg : 'rgba(255,255,255,0.75)',
    groupBorder: c.border,
    groupText: depth === 0 ? c.text : '#374151',
    groupFontCls: depth === 0 ? 'font-bold' : 'font-semibold',
    leafBg: c.bg + '88',
    leafBorder: c.border + '66',
    leafText: c.text,
  };
}

// ── EntityRiskTable ──────────────────────────────────────────────────────────
interface TNode {
  path: string;
  label: string;
  entity?: AuditEntity;
  children: TNode[];
}

// Kategori sıra düzeni — Audit Universe ile aynı
const CAT_ORDER = ['org', 'proc', 'prod', 'sub', 'tp'];
function catRank(path: string) {
  const i = CAT_ORDER.indexOf(path.split('.')[0]);
  return i === -1 ? 99 : i;
}

function EntityRiskTable({ selectedCell }: { selectedCell?: string | null }) {
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
    nodeMap.forEach(node => node.children.sort((a, b) => {
      const aGroup = a.children.length > 0 ? 0 : 1;
      const bGroup = b.children.length > 0 ? 0 : 1;
      if (aGroup !== bGroup) return aGroup - bGroup;
      return a.path.localeCompare(b.path);
    }));
    return Array.from(nodeMap.values())
      .filter(n => !n.path.includes('.'))
      .sort((a, b) => a.path.localeCompare(b.path));
  }, [entities]);

  // Default: all collapsed
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
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

      const cat = getCatStyle(node.path, depth);

      return (
        <React.Fragment key={node.path}>
          <tr
            className="cursor-pointer transition-colors"
            style={{ backgroundColor: cat.groupBg, borderBottom: `1px solid ${cat.groupBorder}` }}
            onClick={() => toggle(node.path)}
          >
            <td className="px-3 py-2" style={{ paddingLeft: (12 + indent) + 'px' }}>
              <div className="flex items-center gap-1.5">
                {depth === 0 && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.groupBorder }} />}
                <ChevronRight size={11} className={clsx('transition-transform flex-shrink-0 opacity-60', isExpanded && 'rotate-90')} />
                <div>
                  <div
                    className={clsx('text-xs', cat.groupFontCls)}
                    style={{ color: cat.groupText }}
                  >{node.label}</div>
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
                ? <span className={clsx('font-black text-sm', avgInherent >= 20 ? 'text-fuchsia-700' : avgInherent >= 15 ? 'text-red-600' : avgInherent >= 10 ? 'text-orange-600' : avgInherent >= 5 ? 'text-amber-600' : 'text-emerald-600')}>{avgInherent.toFixed(1)}</span>
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
    const leafCat = getCatStyle(entity.path, depth);

    return (
      <tr key={entity.id} className="transition-colors" style={{ backgroundColor: leafCat.leafBg, borderBottom: `1px solid ${leafCat.leafBorder}` }}>
        <td className="px-3 py-2 text-xs" style={{ paddingLeft: (12 + indent + 14) + 'px' }}>
          <span className="font-medium" style={{ color: leafCat.leafText }}>{entity.name}</span>
        </td>
        <td className="px-3 py-2">
          <span className={clsx('px-1.5 py-0.5 rounded border text-[9px] font-bold', typeMeta.badgeCls)}>{typeMeta.label}</span>
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
            ? <><span className={clsx('font-black text-sm', inh >= 20 ? 'text-fuchsia-700' : inh >= 15 ? 'text-red-600' : inh >= 10 ? 'text-orange-600' : inh >= 5 ? 'text-amber-600' : 'text-emerald-600')}>{inh}</span><span className="text-slate-300 text-[9px]">/25</span></>
            : <span className="text-slate-300 text-xs">—</span>}
        </td>
        <td className="px-3 py-2">
          {ctrl !== null
            ? <div className="flex items-center gap-1.5 justify-center">
                <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: ctrl + '%' }} /></div>
                <span className="font-medium text-xs text-slate-600">%{ctrl.toFixed(0)}</span>
              </div>
            : <span className="text-slate-300 text-xs block text-center">—</span>}
        </td>
        <td className="px-3 py-2 text-center">
          {res !== null
            ? <span className={clsx('font-bold text-sm', res >= 10 ? 'text-fuchsia-700' : res >= 7 ? 'text-red-600' : res >= 4 ? 'text-amber-600' : 'text-emerald-600')}>{res.toFixed(1)}</span>
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

  // ── Hücre seçili: flat + kategori sıralamalı görünüm ──────────────────────
  if (selectedCell) {
    const [impStr, likStr] = selectedCell.split('-');
    const imp = +impStr, lik = +likStr;
    const cellEntities = entities
      .filter(e => {
        const a = assessmentMap.get(e.id);
        return a && a.impact === imp && a.likelihood === lik;
      })
      .sort((a, b) => {
        const cr = catRank(a.path) - catRank(b.path);
        return cr !== 0 ? cr : a.path.localeCompare(b.path);
      });

    return (
      <div className="bg-surface border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-blue-600" />
            <span className="text-sm font-bold text-slate-800">
              Hücre: Etki <span className="text-blue-600">{imp}</span> × Olasılık <span className="text-blue-600">{lik}</span>
            </span>
            <span className="text-xs text-slate-400">— {cellEntities.length} varlık</span>
            <span className={clsx('px-2 py-0.5 rounded border text-[9px] font-bold', riskLevel(imp * lik).cls)}>{riskLevel(imp * lik).label}</span>
          </div>
          <span className="text-[10px] text-slate-400">Hücre seçimini kaldırmak için ısı haritasında aynı hücreye tekrar tıklayın</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/40 text-slate-500">
                <th className="text-left px-3 py-2 font-semibold">Varlık</th>
                <th className="text-left px-3 py-2 font-semibold">Tür</th>
                <th className="text-center px-3 py-2 font-semibold">Ham Risk</th>
                <th className="text-center px-3 py-2 font-semibold">Kontrol %</th>
                <th className="text-center px-3 py-2 font-semibold">Kalıntı</th>
                <th className="text-center px-3 py-2 font-semibold">Seviye</th>
              </tr>
            </thead>
            <tbody>
              {cellEntities.map(entity => {
                const a = assessmentMap.get(entity.id);
                const inh = a?.inherent_risk_score ?? null;
                const res = a?.residual_score ?? null;
                const ctrl = a != null ? a.control_effectiveness * 100 : null;
                const lvl = inh !== null ? riskLevel(inh) : null;
                const typeMeta = entityTypeLabel(entity.type);
                const leafCat = getCatStyle(entity.path, 1);
                return (
                  <tr key={entity.id} className="transition-colors" style={{ backgroundColor: leafCat.leafBg, borderBottom: `1px solid ${leafCat.leafBorder}` }}>
                    <td className="px-3 py-2 text-xs">
                      <div className="font-medium" style={{ color: leafCat.leafText }}>{entity.name}</div>
                      <div className="text-[9px] text-slate-400 font-mono">{entity.path}</div>
                    </td>
                    <td className="px-3 py-2">
                      <span className={clsx('px-1.5 py-0.5 rounded border text-[9px] font-bold', typeMeta.badgeCls)}>{typeMeta.label}</span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      {inh !== null
                        ? <><span className={clsx('font-black text-sm', inh >= 20 ? 'text-fuchsia-700' : inh >= 15 ? 'text-red-600' : inh >= 10 ? 'text-orange-600' : inh >= 5 ? 'text-amber-600' : 'text-emerald-600')}>{inh}</span><span className="text-slate-300 text-[9px]">/25</span></>
                        : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className="px-3 py-2">
                      {ctrl !== null
                        ? <div className="flex items-center gap-1.5 justify-center">
                            <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: ctrl + '%' }} /></div>
                            <span className="font-medium text-xs text-slate-600">%{ctrl.toFixed(0)}</span>
                          </div>
                        : <span className="text-slate-300 text-xs block text-center">—</span>}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {res !== null
                        ? <span className={clsx('font-bold text-sm', res >= 10 ? 'text-fuchsia-700' : res >= 7 ? 'text-red-600' : res >= 4 ? 'text-amber-600' : 'text-emerald-600')}>{res.toFixed(1)}</span>
                        : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {lvl ? <span className={clsx('px-1.5 py-0.5 rounded border text-[9px] font-bold', lvl.cls)}>{lvl.label}</span> : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ── Normal ağaç görünümü ────────────────────────────────────────────────────
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
  const [selectedCell, setSelectedCell] = useState<string | null>(null);

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
        <StrategicHeatmap onCellSelect={setSelectedCell} />

        <div className="mt-4">
          <EntityRiskTable selectedCell={selectedCell} />
        </div>
      </div>
    </div>
  );
}

