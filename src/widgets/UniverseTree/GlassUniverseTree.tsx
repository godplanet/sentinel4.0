/**
 * GLASSMORPHISM UNIVERSE TREE
 * Interactive hierarchy with neon glow risk badges
 */

import { useState } from 'react';
import { ChevronRight, ChevronDown, Building2, Network, Activity, AlertTriangle, Shield, Edit2, CheckSquare, Square } from 'lucide-react';
import type { TaxonomyEntity } from '@/entities/universe/api/taxonomy-api';
import { calculateConstitutionalRisk, getNeonGlowClass, getPulseClass } from '@/features/strategy/risk-engine';
import { motion, AnimatePresence } from 'framer-motion';

interface GlassUniverseTreeProps {
  entities: TaxonomyEntity[];
  onSelectEntity?: (entity: TaxonomyEntity) => void;
  selectedId?: string;
  selectionMode?: boolean;
  selectedIds?: Set<string>;
}

interface TreeNodeProps {
  entity: TaxonomyEntity;
  level: number;
  onSelect?: (entity: TaxonomyEntity) => void;
  isSelected: boolean;
  selectionMode?: boolean;
  isChecked?: boolean;
}

const ENTITY_ICONS = {
  DOMAIN: Building2,
  PROCESS: Network,
  SUB_PROCESS: Activity,
  RISK: AlertTriangle,
  CONTROL: Shield,
};

const ENTITY_COLORS = {
  DOMAIN: {
    bg: 'from-blue-500/20 to-blue-600/10',
    border: 'border-blue-400/30',
    text: 'text-blue-600',
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
  },
  PROCESS: {
    bg: 'from-purple-500/20 to-purple-600/10',
    border: 'border-purple-400/30',
    text: 'text-purple-600',
    glow: 'shadow-[0_0_20px_rgba(147,51,234,0.3)]',
  },
  SUB_PROCESS: {
    bg: 'from-indigo-500/20 to-indigo-600/10',
    border: 'border-indigo-400/30',
    text: 'text-indigo-600',
    glow: 'shadow-[0_0_20px_rgba(99,102,241,0.3)]',
  },
  RISK: {
    bg: 'from-orange-500/20 to-red-600/10',
    border: 'border-orange-400/30',
    text: 'text-orange-600',
    glow: 'shadow-[0_0_20px_rgba(249,115,22,0.3)]',
  },
  CONTROL: {
    bg: 'from-green-500/20 to-emerald-600/10',
    border: 'border-green-400/30',
    text: 'text-green-600',
    glow: 'shadow-[0_0_20px_rgba(34,197,94,0.3)]',
  },
};

function RiskBadgeNeon({ score, impact, likelihood }: { score?: number; impact?: number; likelihood?: number }) {
  if (!impact || !likelihood) return null;

  const riskResult = calculateConstitutionalRisk({ impact, likelihood });
  const actualScore = score || riskResult.inherent_risk_score;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        relative px-3 py-1 rounded-full font-bold text-sm
        backdrop-blur-md border-2
        ${getNeonGlowClass(riskResult.risk_zone)}
        ${getPulseClass(riskResult.risk_zone)}
        transition-all duration-300
      `}
      style={{
        backgroundColor: `${riskResult.risk_color}20`,
        borderColor: riskResult.risk_color,
        color: riskResult.risk_color,
      }}
    >
      <span className="relative z-10">{actualScore.toFixed(1)}</span>
      <div
        className="absolute inset-0 rounded-full blur-md opacity-50"
        style={{ backgroundColor: riskResult.risk_color }}
      />
    </motion.div>
  );
}

function TreeNode({ entity, level, onSelect, isSelected, selectionMode, isChecked }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const hasChildren = entity.children && entity.children.length > 0;
  const Icon = ENTITY_ICONS[entity.type];
  const colors = ENTITY_COLORS[entity.type];

  const paddingLeft = level * 24;

  // Calculate risk scores from risk_weight (temporary mapping)
  const impact = Math.min(Math.ceil((entity.risk_weight || 1) / 5), 5);
  const likelihood = Math.min(Math.ceil((entity.risk_weight || 1) / 3), 5);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: level * 0.05 }}
      className="select-none"
    >
      <div
        className={`
          relative group
          flex items-center gap-3 px-4 py-3 rounded-xl
          cursor-pointer transition-all duration-300
          ${
            isSelected || isChecked
              ? `backdrop-blur-xl bg-gradient-to-r ${colors.bg} border-2 ${colors.border} ${colors.glow}`
              : `backdrop-blur-md bg-white/40 border border-white/20 hover:bg-white/60 hover:backdrop-blur-lg hover:shadow-lg`
          }
        `}
        style={{ marginLeft: `${paddingLeft}px` }}
        onClick={() => onSelect?.(entity)}
      >
        {/* Selection Checkbox or Expand Button */}
        {selectionMode ? (
          <div
            className="p-1 rounded-lg transition-all"
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(entity);
            }}
          >
            {isChecked ? (
              <CheckSquare className="w-5 h-5 text-green-500" />
            ) : (
              <Square className="w-5 h-5 text-slate-400" />
            )}
          </div>
        ) : hasChildren ? (
          <button
            className="p-1 hover:bg-white/50 rounded-lg transition-all"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 0 : -90 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 text-slate-600" />
            </motion.div>
          </button>
        ) : (
          <div className="w-6" />
        )}

        {/* Entity Icon */}
        <div
          className={`
            p-2 rounded-lg bg-gradient-to-br ${colors.bg}
            border ${colors.border} ${colors.glow}
          `}
        >
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>

        {/* Entity Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 truncate">
              {entity.name}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800/10 text-slate-600 font-mono">
              {entity.type}
            </span>
          </div>
          {entity.description && (
            <p className="text-xs text-slate-600 truncate mt-0.5">
              {entity.description}
            </p>
          )}
        </div>

        {/* Risk Badge with Neon Glow */}
        {(entity.type === 'RISK' || entity.type === 'PROCESS' || entity.type === 'SUB_PROCESS') && (
          <RiskBadgeNeon
            score={entity.inherent_risk_score}
            impact={impact}
            likelihood={likelihood}
          />
        )}

        {/* Edit Button (on hover) */}
        <button
          className="opacity-0 group-hover:opacity-100 p-2 hover:bg-white/80 rounded-lg transition-all"
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(entity);
          }}
        >
          <Edit2 className="w-4 h-4 text-slate-600" />
        </button>

        {/* Glass reflection effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-xl pointer-events-none" />
      </div>

      {/* Children */}
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-2 space-y-2 overflow-hidden"
          >
            {entity.children!.map((child) => (
              <TreeNode
                key={child.id}
                entity={child}
                level={level + 1}
                onSelect={onSelect}
                isSelected={child.id === isSelected}
                selectionMode={selectionMode}
                isChecked={isChecked}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function GlassUniverseTree({ entities, onSelectEntity, selectedId, selectionMode, selectedIds }: GlassUniverseTreeProps) {
  if (entities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 backdrop-blur-xl bg-white/40 rounded-2xl border border-white/30">
        <Building2 className="w-16 h-16 mb-4 text-slate-300" />
        <p className="text-slate-600 font-medium">Denetim evreni boş</p>
        <p className="text-sm text-slate-500 mt-2">Başlamak için varlık ekleyin</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entities.map((entity, index) => (
        <TreeNode
          key={entity.id}
          entity={entity}
          level={0}
          onSelect={onSelectEntity}
          isSelected={entity.id === selectedId}
          selectionMode={selectionMode}
          isChecked={selectedIds?.has(entity.id)}
        />
      ))}
    </div>
  );
}
