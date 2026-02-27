import { create } from 'zustand';
import type { AuditEntity, UniverseFilters, UniverseStats, UniverseTreeNode } from './types';

interface UniverseStore {
  entities: AuditEntity[];
  tree: UniverseTreeNode[];
  filters: UniverseFilters;
  stats: UniverseStats | null;
  isLoading: boolean;
  error: string | null;

  setEntities: (entities: AuditEntity[]) => void;
  buildTree: () => void;
  setFilters: (filters: UniverseFilters) => void;
  calculateStats: () => void;
  getEntityByPath: (path: string) => AuditEntity | undefined;
  getChildren: (path: string) => AuditEntity[];
  getAncestors: (path: string) => AuditEntity[];
  calculateEffectiveRisk: (entity: AuditEntity) => number;
  reset: () => void;
}

const initialState = {
  entities: [],
  tree: [],
  filters: {},
  stats: null,
  isLoading: false,
  error: null,
};

export const useUniverseStore = create<UniverseStore>((set, get) => ({
  ...initialState,

  setEntities: (entities) => {
    set({ entities, isLoading: false, error: null });
    get().buildTree();
    get().calculateStats();
  },

  buildTree: () => {
    const { entities } = get();

    const pathToEntity = new Map<string, UniverseTreeNode>();

    entities.forEach(entity => {
      const level = entity.path.split('.').length;
      const parent_path = level > 1 ? entity.path.split('.').slice(0, -1).join('.') : null;
      const effective_risk = get().calculateEffectiveRisk(entity);

      pathToEntity.set(entity.path, {
        ...entity,
        level,
        parent_path,
        effective_risk,
        children: [],
      });
    });

    pathToEntity.forEach(node => {
      if (node.parent_path) {
        const parent = pathToEntity.get(node.parent_path);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(node);
        }
      }
    });

    const tree = Array.from(pathToEntity.values()).filter(node => node.level === 1);

    set({ tree });
  },

  setFilters: (filters) => {
    set({ filters });
  },

  calculateStats: () => {
    const { entities } = get();

    if (entities.length === 0) {
      set({ stats: null });
      return;
    }

    const by_type = entities.reduce((acc, entity) => {
      acc[entity.type] = (acc[entity.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avg_risk = entities.reduce((sum, e) => sum + e.risk_score, 0) / entities.length;
    const high_risk_count = entities.filter(e => e.risk_score >= 70).length;

    set({
      stats: {
        total_entities: entities.length,
        by_type: by_type as any,
        avg_risk,
        high_risk_count,
      },
    });
  },

  getEntityByPath: (path) => {
    return get().entities.find(e => e.path === path);
  },

  getChildren: (path) => {
    return get().entities.filter(e => {
      const parentPath = e.path.split('.').slice(0, -1).join('.');
      return parentPath === path;
    });
  },

  getAncestors: (path) => {
    const ancestors: AuditEntity[] = [];
    const parts = path.split('.');

    for (let i = 1; i < parts.length; i++) {
      const ancestorPath = parts.slice(0, i).join('.');
      const ancestor = get().getEntityByPath(ancestorPath);
      if (ancestor) {
        ancestors.push(ancestor);
      }
    }

    return ancestors;
  },

  calculateEffectiveRisk: (entity) => {
    return entity.risk_score * (1 + (entity.velocity_multiplier - 1));
  },

  reset: () => set(initialState),
}));
