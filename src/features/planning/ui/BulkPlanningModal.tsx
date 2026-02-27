/**
 * BULK PLANNING MODAL
 * Risk-driven engagement creation from audit universe
 */

import { useState } from 'react';
import { X, Calendar, Target, TrendingUp, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import type { AuditEntity } from '@/entities/universe/model/types';
import {
  createEngagementsFromEntities,
  getDefaultPlanId,
  type BulkCreationResult,
} from '../linkage';
import { calculateAuditBudget } from '../scoping';

interface BulkPlanningModalProps {
  selectedEntities: AuditEntity[];
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkPlanningModal({
  selectedEntities,
  onClose,
  onSuccess,
}: BulkPlanningModalProps) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [auditType, setAuditType] = useState<string>('AUTO');
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<BulkCreationResult | null>(null);

  const totalEstimatedHours = selectedEntities.reduce((sum, entity) => {
    const scoping = calculateAuditBudget({
      risk_score: entity.risk_score || 50,
      velocity_multiplier: entity.velocity_multiplier || 1.0,
      entity_type: entity.type,
    });
    return sum + scoping.estimated_hours;
  }, 0);

  const avgRiskScore =
    selectedEntities.reduce((sum, e) => sum + (e.risk_score || 0), 0) /
    selectedEntities.length;

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const planId = await getDefaultPlanId();

      const creationResult = await createEngagementsFromEntities({
        entity_ids: selectedEntities.map((e) => e.id),
        plan_id: planId,
        year,
        audit_type_override: auditType === 'AUTO' ? undefined : auditType,
      });

      setResult(creationResult);

      if (creationResult.success) {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Bulk creation failed:', error);
      alert('Failed to create engagements. Check console for details.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-2xl border border-white/20 shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Calendar className="w-7 h-7 text-blue-400" />
              Risk-Driven Audit Generator
            </h2>
            <p className="text-white/60 text-sm mt-1">
              Algorithmic scoping with velocity integration
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white/60" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!result ? (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                  <div className="text-white/60 text-xs mb-1">Selected Entities</div>
                  <div className="text-3xl font-bold text-white">
                    {selectedEntities.length}
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                  <div className="text-white/60 text-xs mb-1">Avg Risk Score</div>
                  <div className="text-3xl font-bold text-orange-400">
                    {avgRiskScore.toFixed(0)}
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                  <div className="text-white/60 text-xs mb-1">Est. Total Hours</div>
                  <div className="text-3xl font-bold text-blue-400">
                    {totalEstimatedHours}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-white font-medium mb-2">
                    Audit Year
                  </label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Audit Type
                  </label>
                  <select
                    value={auditType}
                    onChange={(e) => setAuditType(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="AUTO">Auto (Risk-Based)</option>
                    <option value="COMPREHENSIVE">Comprehensive</option>
                    <option value="TARGETED">Targeted</option>
                    <option value="REVIEW">Review</option>
                    <option value="ADVISORY">Advisory</option>
                  </select>
                  <p className="text-white/40 text-xs mt-1">
                    AUTO mode: Critical Risk → Q1, High → Q2, Medium → Q3, Low → Q4
                  </p>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div className="flex-1 text-sm text-white/80">
                    <div className="font-semibold text-white mb-1">
                      Scoping Algorithm
                    </div>
                    <code className="text-xs text-blue-200">
                      Hours = Base(100) × (Risk/50) × Velocity × EntityType
                    </code>
                    <div className="mt-2 text-white/60 text-xs">
                      Entities with deteriorating risk velocity get +50% buffer
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-white/10 rounded-xl overflow-hidden">
                <div className="bg-white/5 px-4 py-2 border-b border-white/10">
                  <div className="text-white font-medium text-sm">
                    Selected Entities
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {selectedEntities.map((entity) => {
                    const scoping = calculateAuditBudget({
                      risk_score: entity.risk_score || 50,
                      velocity_multiplier: entity.velocity_multiplier || 1.0,
                      entity_type: entity.type,
                    });
                    return (
                      <div
                        key={entity.id}
                        className="px-4 py-3 border-b border-white/5 hover:bg-white/5 flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="text-white font-medium text-sm">
                            {entity.name}
                          </div>
                          <div className="text-white/40 text-xs">
                            {entity.type}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-orange-400 font-semibold">
                            Risk: {entity.risk_score?.toFixed(0) || 'N/A'}
                          </div>
                          <div className="text-blue-400 font-semibold">
                            {scoping.estimated_hours}h
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              {result.success ? (
                <div className="bg-green-500/10 border border-green-400/30 rounded-xl p-6 text-center">
                  <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <div className="text-2xl font-bold text-white mb-2">
                    {result.created_count} Engagements Created
                  </div>
                  <div className="text-green-200 text-sm">
                    Total Budget: {result.summary.total_hours} hours
                  </div>
                </div>
              ) : (
                <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-6 text-center">
                  <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <div className="text-xl font-bold text-white">
                    Creation Failed
                  </div>
                </div>
              )}

              {result.errors.length > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-xl p-4">
                  <div className="text-yellow-200 font-semibold mb-2">
                    Errors ({result.errors.length})
                  </div>
                  {result.errors.map((err, idx) => (
                    <div key={idx} className="text-yellow-200/60 text-xs">
                      Entity {err.entity_id}: {err.error}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-white/10 p-6 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white/5 text-white rounded-xl font-semibold hover:bg-white/10 transition-colors"
          >
            {result ? 'Close' : 'Cancel'}
          </button>
          {!result && (
            <button
              onClick={handleCreate}
              disabled={isCreating || selectedEntities.length === 0}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Target className="w-5 h-5" />
                  Generate {selectedEntities.length} Engagements
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
