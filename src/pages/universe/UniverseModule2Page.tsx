/**
 * MODULE 2: AUDIT UNIVERSE (Denetim Evreni)
 * Constitutional integration with hierarchical risk taxonomy
 */

import { useState } from 'react';
import { PageHeader } from '@/shared/ui';
import { Map, Building2, Plus, Search, Filter } from 'lucide-react';
import {
  useRootDomains,
  useEntity,
  buildTree,
  type TaxonomyEntity,
} from '@/entities/universe/api';
import { UniverseTree, EntityStats, Breadcrumb } from '@/widgets/UniverseTree';
import { GlassCard, RiskBadge } from '@/shared/ui';
import { SENTINEL_CONSTITUTION } from '@/shared/config';

export default function UniverseModule2Page() {
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: rootDomains, isLoading } = useRootDomains();
  const { data: selectedEntity } = useEntity(selectedEntityId);

  // Build hierarchical tree
  const treeData = rootDomains ? buildTree(rootDomains) : [];

  const handleSelectEntity = (entity: TaxonomyEntity) => {
    setSelectedEntityId(entity.id);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-blue-50">
      <PageHeader
        title="Module 2: Audit Universe"
        subtitle="Hierarchical Risk Taxonomy with Constitutional Risk Scoring"
        icon={Map}
      />

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Constitutional Info Banner */}
          <GlassCard className="border-2 border-blue-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 mb-2">
                  Constitutional Hierarchy
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-slate-500">Max Depth:</span>
                    <span className="ml-2 font-mono font-bold text-slate-800">
                      {SENTINEL_CONSTITUTION.HIERARCHY?.MAX_DEPTH || 5} levels
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Risk Formula:</span>
                    <span className="ml-2 font-mono text-xs text-slate-700">
                      Impact × Likelihood × Velocity
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Max Score:</span>
                    <span className="ml-2 font-mono font-bold text-slate-800">
                      {SENTINEL_CONSTITUTION.RISK.MAX_SCORE}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Risk Zones:</span>
                    <span className="ml-2 font-mono text-xs text-slate-700">
                      4 zones (G/Y/O/R)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Controls Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search entities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>

            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
              <Plus className="w-4 h-4" />
              Add Entity
            </button>
          </div>

          {/* Main Layout: Tree + Detail */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Tree View */}
            <div className="lg:col-span-2">
              <GlassCard>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-800">
                    Hierarchy Tree
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="font-semibold">{rootDomains?.length || 0}</span>
                    <span>root domains</span>
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
                  </div>
                ) : (
                  <UniverseTree
                    entities={treeData}
                    onSelectEntity={handleSelectEntity}
                    selectedId={selectedEntityId || undefined}
                  />
                )}
              </GlassCard>
            </div>

            {/* Right: Entity Detail */}
            <div className="lg:col-span-1">
              <GlassCard>
                {selectedEntity ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-bold text-slate-800">
                          {selectedEntity.name}
                        </h3>
                        {selectedEntity.inherent_risk_score && (
                          <RiskBadge score={selectedEntity.inherent_risk_score} />
                        )}
                      </div>

                      {selectedEntity.path && (
                        <Breadcrumb path={selectedEntity.path} />
                      )}
                    </div>

                    {selectedEntity.description && (
                      <p className="text-sm text-slate-600">
                        {selectedEntity.description}
                      </p>
                    )}

                    <EntityStats entity={selectedEntity} />

                    {/* Risk Parameters */}
                    {selectedEntity.type === 'RISK' && (
                      <div className="space-y-3 pt-4 border-t border-slate-200">
                        <h4 className="font-semibold text-slate-700 text-sm">
                          Risk Parameters
                        </h4>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="bg-slate-50 rounded p-2">
                            <div className="text-xs text-slate-500">Impact</div>
                            <div className="text-lg font-bold text-slate-800">
                              {Math.ceil((selectedEntity.risk_weight || 1) / 5)}/5
                            </div>
                          </div>

                          <div className="bg-slate-50 rounded p-2">
                            <div className="text-xs text-slate-500">Likelihood</div>
                            <div className="text-lg font-bold text-slate-800">
                              {Math.ceil((selectedEntity.risk_weight || 1) / 3)}/5
                            </div>
                          </div>

                          <div className="bg-slate-50 rounded p-2">
                            <div className="text-xs text-slate-500">Velocity</div>
                            <div className="text-lg font-bold text-slate-800">
                              1.0x
                            </div>
                          </div>

                          <div className="bg-slate-50 rounded p-2">
                            <div className="text-xs text-slate-500">Control %</div>
                            <div className="text-lg font-bold text-slate-800">
                              0%
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="text-xs font-semibold text-blue-800 mb-1">
                            Constitutional Formula
                          </div>
                          <code className="text-xs text-blue-700">
                            {SENTINEL_CONSTITUTION.RISK.FORMULA}
                          </code>
                        </div>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="space-y-2 pt-4 border-t border-slate-200 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Entity Code:</span>
                        <span className="font-mono text-slate-700">
                          {selectedEntity.path?.split('.').pop() || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Created:</span>
                        <span className="text-slate-700">
                          {new Date(selectedEntity.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 py-12">
                    <Map className="w-16 h-16 mb-4 text-slate-300" />
                    <p className="text-center">
                      Select an entity from the tree
                      <br />
                      to view details
                    </p>
                  </div>
                )}
              </GlassCard>
            </div>
          </div>

          {/* Risk Zone Legend */}
          <GlassCard>
            <h4 className="font-semibold text-slate-700 mb-3">Risk Zone Legend</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(SENTINEL_CONSTITUTION.RISK.ZONES).map(([key, zone]) => (
                <div
                  key={key}
                  className="flex items-center gap-3 p-3 rounded-lg"
                  style={{
                    backgroundColor: `${zone.color}20`,
                    borderLeft: `4px solid ${zone.color}`,
                  }}
                >
                  <div>
                    <div className="font-semibold text-slate-800">{zone.label}</div>
                    <div className="text-xs text-slate-600">
                      Score: {zone.min}-{zone.max}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
