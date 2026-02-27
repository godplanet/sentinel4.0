import { memo, useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import {
  Building2, Building, Network, Box, Workflow,
  MapPin, Briefcase, Landmark, Server, Truck, Factory,
  PlusCircle, CheckCircle2, Zap, Leaf, Star,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { EntityType } from '@/entities/universe';
import { useRiskConstitution } from '@/features/risk-constitution';
import { getRiskColor, getRiskLabel } from '@/shared/lib/constitution-utils';
import { usePlanningStore } from '@/entities/planning';

export interface EntityNodeData {
  id: string;
  name: string;
  type: EntityType;
  risk_score: number;
  velocity_multiplier: number;
  effective_risk: number;
  risk_velocity?: number;
  shariah_impact?: number;
  esg_impact?: number;
}

const getTypeIcon = (type: EntityType) => {
  switch (type) {
    case 'HOLDING':
      return Building2;
    case 'BANK':
      return Building;
    case 'GROUP':
      return Network;
    case 'UNIT':
      return Box;
    case 'PROCESS':
      return Workflow;
    case 'BRANCH':
      return MapPin;
    case 'DEPARTMENT':
      return Briefcase;
    case 'HEADQUARTERS':
      return Landmark;
    case 'IT_ASSET':
      return Server;
    case 'VENDOR':
      return Truck;
    case 'SUBSIDIARY':
      return Factory;
    default:
      return Box;
  }
};

const getTypeAccent = (type: EntityType): { border: string; icon: string; badge: string } => {
  switch (type) {
    case 'HOLDING':      return { border: 'border-l-slate-400',   icon: 'text-slate-500',  badge: 'bg-slate-100 text-slate-600' };
    case 'BANK':         return { border: 'border-l-blue-400',    icon: 'text-blue-500',   badge: 'bg-blue-50 text-blue-700' };
    case 'GROUP':        return { border: 'border-l-teal-400',    icon: 'text-teal-500',   badge: 'bg-teal-50 text-teal-700' };
    case 'UNIT':         return { border: 'border-l-amber-400',   icon: 'text-amber-500',  badge: 'bg-amber-50 text-amber-700' };
    case 'PROCESS':      return { border: 'border-l-slate-300',   icon: 'text-slate-400',  badge: 'bg-slate-50 text-slate-500' };
    case 'BRANCH':       return { border: 'border-l-sky-400',     icon: 'text-sky-500',    badge: 'bg-sky-50 text-sky-700' };
    case 'DEPARTMENT':   return { border: 'border-l-rose-400',    icon: 'text-rose-500',   badge: 'bg-rose-50 text-rose-700' };
    case 'HEADQUARTERS': return { border: 'border-l-slate-500',   icon: 'text-slate-600',  badge: 'bg-slate-100 text-slate-700' };
    case 'IT_ASSET':     return { border: 'border-l-violet-400',  icon: 'text-violet-500', badge: 'bg-violet-50 text-violet-700' };
    case 'VENDOR':       return { border: 'border-l-orange-400',  icon: 'text-orange-500', badge: 'bg-orange-50 text-orange-700' };
    case 'SUBSIDIARY':   return { border: 'border-l-indigo-400',  icon: 'text-indigo-500', badge: 'bg-indigo-50 text-indigo-700' };
    default:             return { border: 'border-l-slate-300',   icon: 'text-slate-400',  badge: 'bg-slate-50 text-slate-600' };
  }
};

function getRiskBadgeStyle(score: number): string {
  if (score >= 80) return 'bg-red-50 text-red-700 border border-red-200';
  if (score >= 60) return 'bg-amber-50 text-amber-700 border border-amber-200';
  if (score >= 40) return 'bg-blue-50 text-blue-600 border border-blue-200';
  return 'bg-slate-100 text-slate-600 border border-slate-200';
}

function getRequiredSkills(type: string): string[] {
  switch (type) {
    case 'IT_ASSET':
    case 'SERVER':
      return ['IT Audit', 'Cybersecurity'];
    case 'BANK':
    case 'HOLDING':
    case 'SUBSIDIARY':
    case 'HEADQUARTERS':
      return ['Financial Audit', 'Banking'];
    case 'DEPARTMENT':
    case 'UNIT':
      return ['Operational Audit'];
    case 'VENDOR':
      return ['TPRM', 'Vendor Audit'];
    default:
      return ['General Audit'];
  }
}

export const CustomEntityNode = memo(({ data }: NodeProps) => {
  const nodeData = data as unknown as EntityNodeData;
  const { constitution } = useRiskConstitution();
  const { addNodeToPlan, draftEngagements } = usePlanningStore();
  const Icon = getTypeIcon(nodeData.type);
  const accent = getTypeAccent(nodeData.type);

  const riskColor = constitution ? getRiskColor(nodeData.effective_risk, constitution.risk_ranges) : '#94a3b8';
  const riskLabel = constitution ? getRiskLabel(nodeData.effective_risk, constitution.risk_ranges) : 'N/A';

  const alreadyInPlan = draftEngagements.some((d) => d.universeNodeId === nodeData.id);

  const handleAddToPlan = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (alreadyInPlan) return;
      const skills = getRequiredSkills(nodeData.type);
      addNodeToPlan(nodeData.id, nodeData.name, nodeData.effective_risk, skills);
      toast.success(`"${nodeData.name}" yıllık plana eklendi`, {
        style: {
          background: '#ffffff',
          color: '#1e293b',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        },
      });
    },
    [addNodeToPlan, alreadyInPlan, nodeData],
  );

  const hasDimensions =
    nodeData.risk_velocity !== undefined ||
    nodeData.shariah_impact !== undefined ||
    nodeData.esg_impact !== undefined;

  return (
    <div className="relative group">
      <Handle
        type="target"
        position={Position.Top}
        className="w-2.5 h-2.5 !bg-slate-300 border-2 !border-white"
      />

      <div
        className={`
          bg-white/80 backdrop-blur-sm
          border border-slate-200 border-l-4 ${accent.border}
          rounded-xl shadow-sm
          hover:shadow-md hover:-translate-y-0.5
          transition-all duration-200
          min-w-[240px] max-w-[280px]
          cursor-pointer
        `}
      >
        <div className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex-shrink-0">
              <Icon size={16} className={accent.icon} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2">
                {nodeData.name}
              </h4>
              <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide ${accent.badge}`}>
                {nodeData.type}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getRiskBadgeStyle(nodeData.effective_risk)}`}>
              {riskLabel}
            </span>
            <span className="text-sm font-bold text-slate-700 tabular-nums">
              {nodeData.effective_risk.toFixed(1)}
            </span>
            <span
              className="ml-auto w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: riskColor }}
            />
          </div>

          {hasDimensions && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {nodeData.risk_velocity !== undefined && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  <Zap size={9} className="text-slate-500" />
                  V {nodeData.risk_velocity}
                </span>
              )}
              {nodeData.shariah_impact !== undefined && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${nodeData.shariah_impact >= 4 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-stone-50 text-stone-600 border-stone-200'}`}>
                  <Star size={9} className={nodeData.shariah_impact >= 4 ? 'text-amber-500' : 'text-stone-400'} />
                  S {nodeData.shariah_impact}
                </span>
              )}
              {nodeData.esg_impact !== undefined && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Leaf size={9} className="text-emerald-500" />
                  E {nodeData.esg_impact}
                </span>
              )}
            </div>
          )}

          <div className="pt-2.5 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>Cascade Risk</span>
              <span className="font-semibold text-slate-700 tabular-nums">{nodeData.risk_score.toFixed(1)}</span>
            </div>
            <button
              onClick={handleAddToPlan}
              title={alreadyInPlan ? 'Zaten planda' : 'Plana ekle'}
              className={`
                w-full flex items-center justify-center gap-1.5
                px-2 py-1.5 rounded-lg text-[10px] font-semibold
                transition-all duration-150
                ${alreadyInPlan
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                  : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] shadow-sm'}
              `}
            >
              {alreadyInPlan ? (
                <>
                  <CheckCircle2 size={10} />
                  Planda
                </>
              ) : (
                <>
                  <PlusCircle size={10} />
                  Plana Ekle
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2.5 h-2.5 !bg-slate-300 border-2 !border-white"
      />
    </div>
  );
});

CustomEntityNode.displayName = 'CustomEntityNode';
