import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Folder, AlertTriangle, ShieldCheck } from 'lucide-react';
import clsx from 'clsx';
import type { ProcessNodeData, RiskNodeData, ControlNodeData, NodeSeverity, ControlType } from '../types';

// ─── Process Node ─────────────────────────────────────────────────────────────

type ProcessNodeType = Node<ProcessNodeData, 'processNode'>;

export function ProcessNode({ data, selected }: NodeProps<ProcessNodeType>) {
  return (
    <div
      className={clsx(
        'min-w-[168px] max-w-[220px] bg-surface border rounded-xl shadow-sm px-4 py-3 transition-all duration-150',
        selected
          ? 'border-blue-500 shadow-blue-100 shadow-md ring-2 ring-blue-400/30'
          : 'border-slate-200/60 hover:border-blue-300 hover:shadow-md',
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-blue-400 !w-2.5 !h-2.5 !border-2 !border-white !rounded-full"
      />

      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-6 h-6 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
          <Folder size={11} className="text-blue-600" />
        </div>
        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">SÜREÇ</span>
      </div>

      <p className="text-xs font-bold text-primary leading-snug">{data.label}</p>

      {data.description && (
        <p className="text-[9px] text-slate-400 mt-1 leading-snug line-clamp-2">{data.description}</p>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-blue-400 !w-2.5 !h-2.5 !border-2 !border-white !rounded-full"
      />

      <Handle
        type="source"
        id="bottom"
        position={Position.Bottom}
        className="!bg-blue-400 !w-2.5 !h-2.5 !border-2 !border-white !rounded-full"
      />
    </div>
  );
}

// ─── Risk Node ────────────────────────────────────────────────────────────────

const SEVERITY_STYLES: Record<
  NodeSeverity,
  { outerBorder: string; iconBg: string; iconColor: string; badgeText: string; label: string }
> = {
  CRITICAL: {
    outerBorder: 'border-red-400',
    iconBg: 'bg-red-50 border-red-200',
    iconColor: 'text-red-500',
    badgeText: 'text-red-600',
    label: 'KRİTİK',
  },
  HIGH: {
    outerBorder: 'border-amber-400',
    iconBg: 'bg-amber-50 border-amber-200',
    iconColor: 'text-amber-500',
    badgeText: 'text-amber-600',
    label: 'YÜKSEK',
  },
  MEDIUM: {
    outerBorder: 'border-blue-300',
    iconBg: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-500',
    badgeText: 'text-blue-600',
    label: 'ORTA',
  },
  LOW: {
    outerBorder: 'border-emerald-300',
    iconBg: 'bg-emerald-50 border-emerald-200',
    iconColor: 'text-emerald-500',
    badgeText: 'text-emerald-600',
    label: 'DÜŞÜK',
  },
};

type RiskNodeType = Node<RiskNodeData, 'riskNode'>;

export function RiskNode({ data, selected }: NodeProps<RiskNodeType>) {
  const severity = (data.severity ?? 'MEDIUM') as NodeSeverity;
  const s = SEVERITY_STYLES[severity];

  return (
    <div
      className={clsx(
        'min-w-[168px] max-w-[220px] bg-surface border-2 rounded-xl shadow-sm px-4 py-3 transition-all duration-150',
        s.outerBorder,
        selected ? 'shadow-md ring-2 ring-offset-1 ring-amber-300/50' : 'hover:shadow-md',
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-amber-400 !w-2.5 !h-2.5 !border-2 !border-white !rounded-full"
      />
      <Handle
        type="target"
        id="left"
        position={Position.Left}
        className="!bg-amber-400 !w-2.5 !h-2.5 !border-2 !border-white !rounded-full"
      />

      <div className="flex items-center gap-2 mb-1.5">
        <div className={clsx('w-6 h-6 rounded-lg border flex items-center justify-center shrink-0', s.iconBg)}>
          <AlertTriangle size={11} className={s.iconColor} />
        </div>
        <span className={clsx('text-[9px] font-black uppercase tracking-widest', s.badgeText)}>{s.label}</span>
      </div>

      <p className="text-xs font-bold text-primary leading-snug">{data.label}</p>

      {data.description && (
        <p className="text-[9px] text-slate-400 mt-1 leading-snug line-clamp-2">{data.description}</p>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-amber-400 !w-2.5 !h-2.5 !border-2 !border-white !rounded-full"
      />
      <Handle
        type="source"
        id="right"
        position={Position.Right}
        className="!bg-amber-400 !w-2.5 !h-2.5 !border-2 !border-white !rounded-full"
      />
    </div>
  );
}

// ─── Control Node ─────────────────────────────────────────────────────────────

const CONTROL_TYPE_STYLES: Record<
  ControlType,
  { border: string; iconBg: string; iconColor: string; badgeText: string; label: string }
> = {
  PREVENTIVE: {
    border: 'border-emerald-200',
    iconBg: 'bg-emerald-50 border-emerald-200',
    iconColor: 'text-emerald-600',
    badgeText: 'text-emerald-700',
    label: 'ÖNLEYİCİ',
  },
  DETECTIVE: {
    border: 'border-violet-200',
    iconBg: 'bg-violet-50 border-violet-200',
    iconColor: 'text-violet-600',
    badgeText: 'text-violet-700',
    label: 'TESPİT EDİCİ',
  },
  CORRECTIVE: {
    border: 'border-sky-200',
    iconBg: 'bg-sky-50 border-sky-200',
    iconColor: 'text-sky-600',
    badgeText: 'text-sky-700',
    label: 'DÜZELTİCİ',
  },
};

type ControlNodeType = Node<ControlNodeData, 'controlNode'>;

export function ControlNode({ data, selected }: NodeProps<ControlNodeType>) {
  const ctrlType = (data.controlType ?? 'PREVENTIVE') as ControlType;
  const s = CONTROL_TYPE_STYLES[ctrlType];

  return (
    <div
      className={clsx(
        'min-w-[168px] max-w-[220px] bg-surface border rounded-xl shadow-sm px-4 py-3 transition-all duration-150',
        s.border,
        selected
          ? 'shadow-emerald-100 shadow-md ring-2 ring-emerald-400/30'
          : 'hover:border-emerald-300 hover:shadow-md',
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-emerald-400 !w-2.5 !h-2.5 !border-2 !border-white !rounded-full"
      />
      <Handle
        type="target"
        id="left"
        position={Position.Left}
        className="!bg-emerald-400 !w-2.5 !h-2.5 !border-2 !border-white !rounded-full"
      />

      <div className="flex items-center gap-2 mb-1.5">
        <div className={clsx('w-6 h-6 rounded-lg border flex items-center justify-center shrink-0', s.iconBg)}>
          <ShieldCheck size={11} className={s.iconColor} />
        </div>
        <span className={clsx('text-[9px] font-black uppercase tracking-widest', s.badgeText)}>{s.label}</span>
      </div>

      <p className="text-xs font-bold text-primary leading-snug">{data.label}</p>

      {data.description && (
        <p className="text-[9px] text-slate-400 mt-1 leading-snug line-clamp-2">{data.description}</p>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-emerald-400 !w-2.5 !h-2.5 !border-2 !border-white !rounded-full"
      />
      <Handle
        type="source"
        id="right"
        position={Position.Right}
        className="!bg-emerald-400 !w-2.5 !h-2.5 !border-2 !border-white !rounded-full"
      />
    </div>
  );
}
