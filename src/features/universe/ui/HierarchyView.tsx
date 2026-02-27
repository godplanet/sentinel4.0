import { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, Building2, Network, Activity, AlertTriangle, Shield, Edit2, Server, Truck, Factory } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuditEntities } from '@/entities/universe';
import type { AuditEntity, EntityType } from '@/entities/universe/model/types';
import { EntityFormModal } from './EntityFormModal';

const ENTITY_ICONS: Record<EntityType, any> = {
  HOLDING: Building2,
  BANK: Building2,
  GROUP: Network,
  UNIT: Activity,
  PROCESS: AlertTriangle,
  BRANCH: Building2,
  DEPARTMENT: Network,
  HEADQUARTERS: Building2,
  IT_ASSET: Server,
  VENDOR: Truck,
  SUBSIDIARY: Factory,
};

const ENTITY_COLORS: Record<EntityType, { bg: string; border: string; text: string }> = {
  HOLDING: { bg: 'bg-slate-100', border: 'border-slate-300', text: 'text-slate-700' },
  BANK: { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-700' },
  GROUP: { bg: 'bg-emerald-100', border: 'border-emerald-300', text: 'text-emerald-700' },
  UNIT: { bg: 'bg-amber-100', border: 'border-amber-300', text: 'text-amber-700' },
  PROCESS: { bg: 'bg-slate-100', border: 'border-slate-300', text: 'text-slate-700' },
  BRANCH: { bg: 'bg-cyan-100', border: 'border-cyan-300', text: 'text-cyan-700' },
  DEPARTMENT: { bg: 'bg-rose-100', border: 'border-rose-300', text: 'text-rose-700' },
  HEADQUARTERS: { bg: 'bg-slate-200', border: 'border-slate-400', text: 'text-slate-800' },
  IT_ASSET: { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-700' },
  VENDOR: { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-700' },
  SUBSIDIARY: { bg: 'bg-indigo-100', border: 'border-indigo-300', text: 'text-indigo-700' },
};

interface HierarchyNodeProps {
  entity: AuditEntity;
  children: AuditEntity[];
  level: number;
  onEdit: (entity: AuditEntity) => void;
}

function HierarchyNode({ entity, children, level, onEdit }: HierarchyNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const hasChildren = children.length > 0;
  const Icon = ENTITY_ICONS[entity.type];
  const colors = ENTITY_COLORS[entity.type];

  const paddingLeft = level * 24;

  const getRiskColor = (score?: number) => {
    if (!score) return 'text-slate-500';
    if (score >= 90) return 'text-red-600 font-bold';
    if (score >= 75) return 'text-amber-600 font-semibold';
    if (score >= 60) return 'text-yellow-600';
    return 'text-emerald-600';
  };

  const getRiskBadge = (score?: number) => {
    if (!score) return 'bg-slate-100 text-slate-600 border-slate-200';
    if (score >= 90) return 'bg-red-100 text-red-700 border-red-200';
    if (score >= 75) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: level * 0.05 }}
      className="select-none"
    >
      <div
        className="relative group flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-200 hover:shadow-md transition-all duration-300"
        style={{ marginLeft: `${paddingLeft}px` }}
      >
        {hasChildren ? (
          <button
            className="p-1 hover:bg-slate-100 rounded-lg transition-all"
            onClick={() => setIsExpanded(!isExpanded)}
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

        <div
          className={`p-2 rounded-lg ${colors.bg} border ${colors.border}`}
        >
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 truncate">
              {entity.name}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
              {entity.type}
            </span>
          </div>
          <code className="text-xs text-slate-500 font-mono">
            {entity.path}
          </code>
        </div>

        {entity.risk_score && (
          <div className={`px-3 py-1 rounded-full font-bold text-sm border ${getRiskBadge(entity.risk_score)}`}>
            {entity.risk_score.toFixed(1)}
          </div>
        )}

        {entity.velocity_multiplier && (
          <div className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
            {entity.velocity_multiplier.toFixed(2)}x
          </div>
        )}

        <button
          className="opacity-0 group-hover:opacity-100 p-2 hover:bg-slate-100 rounded-lg transition-all"
          onClick={() => onEdit(entity)}
        >
          <Edit2 className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-2 space-y-2 overflow-hidden"
          >
            {children.map((child) => (
              <HierarchyNodeWrapper
                key={child.id}
                entity={child}
                level={level + 1}
                onEdit={onEdit}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function HierarchyNodeWrapper({ entity, level, onEdit }: { entity: AuditEntity; level: number; onEdit: (entity: AuditEntity) => void }) {
  const { data: allEntities = [] } = useAuditEntities();

  const children = useMemo(() => {
    return allEntities.filter(e => e.parent_id === entity.id);
  }, [allEntities, entity.id]);

  return <HierarchyNode entity={entity} children={children} level={level} onEdit={onEdit} />;
}

export function HierarchyView() {
  const { data: entities = [] } = useAuditEntities();
  const [editingEntity, setEditingEntity] = useState<AuditEntity | null>(null);

  const rootEntities = useMemo(() => {
    return entities.filter(e => !e.parent_id);
  }, [entities]);

  if (entities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
        <Building2 className="w-16 h-16 mb-4 text-slate-300" />
        <p className="text-slate-600 font-medium">Denetim evreni boş</p>
        <p className="text-sm text-slate-500 mt-2">Başlamak için "Varlık Ekle" butonunu kullanın</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Hiyerarşik Yapı (ltree)</p>
              <p className="text-blue-800">
                Varlıklar üst-alt (parent-child) ilişkisi ile hiyerarşik olarak düzenlenmiştir.
                Her varlığın path alanı ltree formatında saklanır: <code className="bg-blue-100 px-1 rounded font-mono text-xs">genel_mudurluk.hazine_yonetimi</code>
              </p>
            </div>
          </div>
        </div>

        {rootEntities.map((entity) => (
          <HierarchyNodeWrapper
            key={entity.id}
            entity={entity}
            level={0}
            onEdit={setEditingEntity}
          />
        ))}
      </div>

      {editingEntity && (
        <EntityFormModal
          entity={editingEntity}
          onClose={() => setEditingEntity(null)}
        />
      )}
    </>
  );
}
