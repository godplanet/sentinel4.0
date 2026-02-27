/**
 * UNIVERSE TREE - Hierarchical Risk Taxonomy Viewer
 * Constitutional integration with ltree-based audit universe
 */

import { useState } from 'react';
import { ChevronRight, ChevronDown, Building2, Network, Activity, AlertTriangle, Shield } from 'lucide-react';
import type { TaxonomyEntity } from '@/entities/universe/api/taxonomy-api';
import { RiskBadge } from '@/shared/ui';
import { SENTINEL_CONSTITUTION } from '@/shared/config';

interface UniverseTreeProps {
  entities: TaxonomyEntity[];
  onSelectEntity?: (entity: TaxonomyEntity) => void;
  selectedId?: string;
}

interface TreeNodeProps {
  entity: TaxonomyEntity;
  level: number;
  onSelect?: (entity: TaxonomyEntity) => void;
  isSelected: boolean;
}

const ENTITY_ICONS = {
  DOMAIN: Building2,
  PROCESS: Network,
  SUB_PROCESS: Activity,
  RISK: AlertTriangle,
  CONTROL: Shield,
};

const ENTITY_COLORS = {
  DOMAIN: 'bg-blue-50 border-blue-200 text-blue-700',
  PROCESS: 'bg-purple-50 border-purple-200 text-purple-700',
  SUB_PROCESS: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  RISK: 'bg-orange-50 border-orange-200 text-orange-700',
  CONTROL: 'bg-green-50 border-green-200 text-green-700',
};

function TreeNode({ entity, level, onSelect, isSelected }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const hasChildren = entity.children && entity.children.length > 0;
  const Icon = ENTITY_ICONS[entity.type];
  const colorClass = ENTITY_COLORS[entity.type];

  const paddingLeft = level * 24;

  return (
    <div className="select-none">
      <div
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer
          transition-all duration-200
          ${isSelected ? 'bg-blue-100 border-2 border-blue-500' : 'hover:bg-slate-50 border border-transparent'}
        `}
        style={{ marginLeft: `${paddingLeft}px` }}
        onClick={() => onSelect?.(entity)}
      >
        {hasChildren && (
          <button
            className="p-0.5 hover:bg-slate-200 rounded"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-slate-600" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-600" />
            )}
          </button>
        )}

        {!hasChildren && <div className="w-5" />}

        <div className={`p-1.5 rounded ${colorClass}`}>
          <Icon className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-800 truncate">
              {entity.name}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {entity.type}
            </span>
          </div>
          {entity.description && (
            <p className="text-xs text-slate-600 truncate">
              {entity.description}
            </p>
          )}
        </div>

        {(entity.type === 'RISK' || entity.type === 'PROCESS') && entity.inherent_risk_score && (
          <RiskBadge score={entity.inherent_risk_score} showLabel={false} />
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-1">
          {entity.children!.map((child) => (
            <TreeNode
              key={child.id}
              entity={child}
              level={level + 1}
              onSelect={onSelect}
              isSelected={isSelected}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function UniverseTree({ entities, onSelectEntity, selectedId }: UniverseTreeProps) {
  if (entities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
        <Building2 className="w-16 h-16 mb-4 text-slate-300" />
        <p>No entities in the audit universe yet.</p>
        <p className="text-sm mt-2">Add domains to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entities.map((entity) => (
        <TreeNode
          key={entity.id}
          entity={entity}
          level={0}
          onSelect={onSelectEntity}
          isSelected={entity.id === selectedId}
        />
      ))}
    </div>
  );
}

/**
 * Entity Stats Card - Shows constitutional risk metrics
 */
interface EntityStatsProps {
  entity: TaxonomyEntity;
}

export function EntityStats({ entity }: EntityStatsProps) {
  const zones = SENTINEL_CONSTITUTION.RISK.ZONES;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">
          Entity Type
        </div>
        <div className="text-lg font-bold text-slate-800">{entity.type}</div>
      </div>

      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">
          Depth Level
        </div>
        <div className="text-lg font-bold text-slate-800">{entity.depth || 1}</div>
        <div className="text-xs text-slate-600 mt-1">
          Max: {SENTINEL_CONSTITUTION.HIERARCHY?.MAX_DEPTH || 5}
        </div>
      </div>

      {entity.inherent_risk_score && (
        <>
          <div
            className="rounded-lg p-4 border-2"
            style={{
              backgroundColor: `${entity.risk_color}20`,
              borderColor: entity.risk_color,
            }}
          >
            <div className="text-xs text-slate-700 uppercase tracking-wide mb-1">
              Risk Score
            </div>
            <div className="text-2xl font-bold" style={{ color: entity.risk_color }}>
              {entity.inherent_risk_score}
            </div>
            <div className="text-xs text-slate-600 mt-1">
              Zone: {entity.risk_zone}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">
              Risk Formula
            </div>
            <div className="text-xs font-mono text-slate-700 mt-2">
              Impact × Likelihood × Velocity
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Breadcrumb Trail
 */
interface BreadcrumbProps {
  path: string;
  onNavigate?: (path: string) => void;
}

export function Breadcrumb({ path, onNavigate }: BreadcrumbProps) {
  if (!path) return null;

  const parts = path.split('.');

  return (
    <div className="flex items-center gap-2 text-sm">
      {parts.map((part, index) => {
        const isLast = index === parts.length - 1;
        const partialPath = parts.slice(0, index + 1).join('.');

        return (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="w-4 h-4 text-slate-400" />}
            <button
              className={`
                px-2 py-1 rounded transition-colors
                ${
                  isLast
                    ? 'bg-blue-100 text-blue-800 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }
              `}
              onClick={() => onNavigate?.(partialPath)}
            >
              {part}
            </button>
          </div>
        );
      })}
    </div>
  );
}
